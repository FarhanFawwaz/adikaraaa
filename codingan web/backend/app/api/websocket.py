"""WebSocket Handler for Real-time Data (ECG/Flex/Vitals + AI)

Firebase structure (observed):
- /<device>/latest/sample_100ms -> { ecg, flex, ts_ms }  (High frequency)
- /<device>/latest             -> { bpm, spo2, ... }      (Low frequency)
"""

from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor
import asyncio
import os
import re
import sys
import time

import aiohttp
from fastapi import APIRouter, WebSocket, WebSocketDisconnect


router = APIRouter()


FIREBASE_DATABASE_URL = os.getenv(
    "FIREBASE_DATABASE_URL",
    "https://neurorehab-58cd1-default-rtdb.asia-southeast1.firebasedatabase.app",
).rstrip("/")
FIREBASE_DB_SECRET = os.getenv("FIREBASE_DB_SECRET", "YPtFmyP2WHqRb5YOdKgZuEk95jLbp0LIXPBFpxug")


async def fetch_firebase_data(path: str = ""):
    """Fetch data from Firebase Realtime Database.
    Args:
        path: Firebase path without leading slash.
    """
    clean_path = (path or "").lstrip("/")
    url = f"{FIREBASE_DATABASE_URL}/{clean_path}.json" if clean_path else f"{FIREBASE_DATABASE_URL}/.json"

    params = {}
    if FIREBASE_DB_SECRET:
        params["auth"] = FIREBASE_DB_SECRET

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params, timeout=2.0) as response:
                if response.status != 200:
                    return None
                return await response.json()
    except Exception:
        return None

# Add ai folder to path for import
backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
project_root = os.path.dirname(backend_dir)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# Initialize AI Predictor
AI_AVAILABLE = False
predictor = None
ai_executor = ThreadPoolExecutor(max_workers=1)

try:
    print("[WebSocket] 🚀 Loading AI Model...", flush=True)
    from ai.predict import ECGPredictor
    predictor = ECGPredictor()
    
    if predictor.model is not None:
        AI_AVAILABLE = True
        print("[WebSocket] ✅ AI Model loaded successfully!", flush=True)
    else:
        print("[WebSocket] ⚠️ AI Model failed to load, using mock", flush=True)
except ImportError as e:
    print(f"[WebSocket] ⚠️ Failed to import AI module: {e}", flush=True)
except Exception as e:
    print(f"[WebSocket] ❌ Error initializing AI: {e}", flush=True)


class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
    
    async def send_json(self, websocket: WebSocket, data: dict):
        try:
             await websocket.send_json(data)
        except Exception:
             pass


manager = ConnectionManager()


def run_ai_prediction(ecg_buffer: list, sampling_rate: int = 50) -> dict:
    if AI_AVAILABLE and predictor:
        try:
            return predictor.predict(ecg_buffer, fs=sampling_rate)
        except Exception:
            return None
    return None


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)

    raw_device_id = websocket.query_params.get("device") if websocket.query_params else None
    device_id = (raw_device_id or "device1").strip() or "device1"
    device_id = re.sub(r"[^a-zA-Z0-9_.-]", "", device_id) or "device1"

    print(f"[WebSocket] Client connected, Device={device_id}, AI={AI_AVAILABLE}", flush=True)

    await websocket.send_json({
        "type": "info",
        "message": "Connected to NeuroRehab WebSocket",
        "ai_enabled": AI_AVAILABLE,
        "device": device_id,
    })

    # Loop state
    local_time = 0
    SAMPLING_RATE = 50  # 50Hz -> 20ms sleep
    ecg_buffer: list[int] = []
    
    # State holders
    last_ecg = 512
    last_flex = 0
    last_bpm = 0
    last_spo2 = 0
    
    # Connection tracking
    is_firebase_connected = False
    consecutive_errors = 0
    MAX_ERRORS_BEFORE_DISCONNECT = 50  # ~1 second of failures

    try:
        while True:
            loop_start = time.time()
            
            # 1. Fetch High-Frequency Data (ECG + Flex) from sample_100ms
            # Run every tick (50Hz) or slightly throttled if needed. 
            # Firebase typical latency is >100ms, so fetching 50Hz is optimistic.
            # Lets fetch every 5 ticks (10Hz = 100ms) to match sample_100ms name.
            
            if local_time % 5 == 0:
                sample_data = await fetch_firebase_data(f"{device_id}/latest/sample_100ms")
                if isinstance(sample_data, dict):
                    is_firebase_connected = True
                    consecutive_errors = 0
                    
                    # Update values (persist if key missing in specific sample)
                    if "ecg" in sample_data:
                        last_ecg = int(sample_data["ecg"])
                    if "flex" in sample_data:
                        last_flex = int(sample_data["flex"])
                else:
                    consecutive_errors += 1
                    if consecutive_errors > MAX_ERRORS_BEFORE_DISCONNECT:
                        is_firebase_connected = False
            
            # 2. Fetch Low-Frequency Data (Vitals) from latest
            # Every 1 second (50 ticks)
            if local_time % 50 == 0:
                latest_data = await fetch_firebase_data(f"{device_id}/latest")
                if isinstance(latest_data, dict):
                    if "bpm" in latest_data:
                        last_bpm = int(latest_data["bpm"])
                    if "spo2" in latest_data:
                        last_spo2 = int(latest_data["spo2"])

            # --- SEND DATA TO CLIENT ---
            
            # A. ECG Packet (Streaming 50Hz)
            # We send last_ecg every tick to maintain chart flow, even if it is same value for 5 ticks.
            await websocket.send_json({
                "type": "ecg",
                "value": last_ecg,
                "timestamp": loop_start,
                "firebase_connected": is_firebase_connected,
                "device": device_id,
            })
            
            ecg_buffer.append(last_ecg)
            if len(ecg_buffer) > 1500:
                del ecg_buffer[:100]

            # B. Flex Packet (Send frequently for game responsiveness, e.g. 10Hz)
            if local_time % 5 == 0:
                # Map single flex sensor to Middle finger
                flex_packet = {
                    "thumb": None,
                    "index": None,
                    "middle": last_flex,
                    "ring": None,
                    "pinky": None,
                }
                await websocket.send_json({
                    "type": "flex",
                    "values": flex_packet,
                    "timestamp": loop_start,
                    "firebase_connected": is_firebase_connected,
                    "device": device_id,
                })

            # C. Vitals Packet (Every 1s)
            if local_time % 50 == 0:
                await websocket.send_json({
                    "type": "vitals",
                    "bpm": last_bpm,
                    "spo2": last_spo2,
                    "fingerDetected": (last_bpm > 0 and last_spo2 > 0),
                    "timestamp": loop_start,
                    "firebase_connected": is_firebase_connected,
                    "device": device_id,
                })

            # D. AI Prediction (Every 2s = 100 ticks)
            if local_time % 100 == 0:
                if len(ecg_buffer) >= 500:
                   if AI_AVAILABLE:
                       snapshot = list(ecg_buffer)
                       loop = asyncio.get_running_loop()
                       try:
                           result = await loop.run_in_executor(
                               ai_executor, run_ai_prediction, snapshot, SAMPLING_RATE
                           )
                           if result and "error" not in result:
                               await websocket.send_json({
                                   "type": "prediction",
                                   "data": result,
                                   "timestamp": loop_start
                               })
                       except Exception:
                           pass
                else:
                    # Send buffering status
                    progress = int((len(ecg_buffer) / 500) * 100)
                    await websocket.send_json({
                        "type": "prediction",
                        "data": {
                            "prediction_label": f"Buffering {progress}%",
                            "confidence": 0,
                            "all_probabilities": {'A':0, 'N':0, 'O':0, '~':0}
                        },
                        "timestamp": loop_start
                    })

            # Loop timing
            local_time += 1
            elapsed = time.time() - loop_start
            sleep_time = max(0.0, 0.02 - elapsed) # Target 20ms
            await asyncio.sleep(sleep_time)

    except WebSocketDisconnect:
        print(f"[WebSocket] Client {device_id} disconnected", flush=True)
        manager.disconnect(websocket)
    except Exception as e:
        print(f"[WebSocket] Error: {e}", flush=True)
        manager.disconnect(websocket)
