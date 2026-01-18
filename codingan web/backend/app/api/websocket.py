"""WebSocket Handler for Real-time Data (ECG/Flex/Vitals + AI)

Firebase structure (observed from your DB):
- /<device>/latest/sample_100ms -> { ecg, flex, ts_ms }
- /<device>/latest             -> { bpm, spo2, ecg, flex, sample_100ms: {...}, ... }

Requirement from user:
- ECG & flex MUST be sourced from /<device>/latest/sample_100ms
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

    Note: This helper is intentionally simple and creates its own session.
    For realtime usage (e.g. WebSocket loop), prefer reusing a shared
    `aiohttp.ClientSession` to avoid connection churn.
    """

    clean_path = (path or "").lstrip("/")
    url = f"{FIREBASE_DATABASE_URL}/{clean_path}.json" if clean_path else f"{FIREBASE_DATABASE_URL}/.json"
    params = {"auth": FIREBASE_DB_SECRET} if FIREBASE_DB_SECRET else None

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params, timeout=aiohttp.ClientTimeout(total=5)) as response:
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
    """WebSocket connection manager"""
    
    def __init__(self):
        self.active_connections: list[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
    
    async def send_json(self, websocket: WebSocket, data: dict):
        # Helper to safely send, suppressing small errors if client already gone
        try:
             await websocket.send_json(data)
        except Exception:
             pass
    
    async def broadcast(self, data: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(data)
            except Exception:
                pass


manager = ConnectionManager()


def run_ai_prediction(ecg_buffer: list, sampling_rate: int = 50) -> dict:
    """Run AI prediction synchronously (for executor)"""
    if AI_AVAILABLE and predictor:
        try:
            result = predictor.predict(ecg_buffer, fs=sampling_rate)
            return result
        except Exception as e:
            print(f"[AI] Prediction error: {e}", flush=True)
            return None
    return None


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time data streaming with AI."""

    await manager.connect(websocket)

    raw_device_id = websocket.query_params.get("device") if websocket.query_params else None
    device_id = (raw_device_id or "device1").strip() or "device1"
    device_id = re.sub(r"[^a-zA-Z0-9_.-]", "", device_id) or "device1"

    raw_debug = websocket.query_params.get("debug") if websocket.query_params else None
    debug_enabled = str(raw_debug or "").strip().lower() in {"1", "true", "yes", "y", "on"}

    local_time = 0
    ecg_buffer: list[int] = []
    SAMPLING_RATE = 50  # Hz (tick interval 20ms)

    last_sample_data = None
    last_sample_fetch_ts: float | None = None
    firebase_path_used = f"/{device_id}/latest/sample_100ms"
    is_firebase_connected = False

    session: aiohttp.ClientSession | None = None
    try:
        # Reuse one HTTP session for stable, low-latency polling
        session = aiohttp.ClientSession()

        async def fetch_path(path: str):
            clean_path = (path or "").lstrip("/")
            if not clean_path:
                return None
            url = f"{FIREBASE_DATABASE_URL}/{clean_path}.json"
            params = {"auth": FIREBASE_DB_SECRET} if FIREBASE_DB_SECRET else None
            try:
                async with session.get(url, params=params, timeout=aiohttp.ClientTimeout(total=2)) as response:
                    if response.status != 200:
                        return None
                    return await response.json()
            except Exception:
                return None

        await websocket.send_json(
            {
                "type": "info",
                "message": "Connected to NeuroRehab WebSocket",
                "ai_enabled": AI_AVAILABLE,
                "device": device_id,
                "debug": debug_enabled,
            }
        )

        print(
            f"[WebSocket] Client connected, AI: {'Enabled' if AI_AVAILABLE else 'Disabled'}, device={device_id}",
            flush=True,
        )

        while True:
            current_timestamp = time.time()

            # Fetch /sample_100ms every 100ms (5 ticks), reuse last value between ticks.
            if local_time % 5 == 0:
                firebase_path_used = f"/{device_id}/latest/sample_100ms"
                sample_data = await fetch_path(f"{device_id}/latest/sample_100ms")
                if isinstance(sample_data, dict) and sample_data:
                    last_sample_data = sample_data
                    is_firebase_connected = True
                    last_sample_fetch_ts = current_timestamp
                else:
                    # Keep last known value to preserve realtime stream even on transient hiccups.
                    is_firebase_connected = False

                # Send error periodically when device/path not found (every 5s)
                if not is_firebase_connected and local_time % 250 == 0:
                    try:
                        await websocket.send_json(
                            {
                                "type": "error",
                                "message": f"Firebase device/path not found: {firebase_path_used}",
                                "timestamp": current_timestamp,
                            }
                        )
                    except Exception:
                        pass

            ecg_val = 512
            flex_value = None
            ts_ms_val = 0
            if isinstance(last_sample_data, dict) and last_sample_data:
                ecg_val = last_sample_data.get("ecg", 512)
                flex_value = last_sample_data.get("flex", None)
                ts_ms_val = last_sample_data.get("ts_ms", 0)

            if debug_enabled and local_time % 50 == 0:
                fetch_age_ms = None
                if last_sample_fetch_ts is not None:
                    fetch_age_ms = int((current_timestamp - last_sample_fetch_ts) * 1000)
                debug_payload = {
                    "type": "debug",
                    "ecg": ecg_val,
                    "flex": flex_value,
                    "ts_ms": ts_ms_val,
                    "firebase_connected": is_firebase_connected,
                    "firebase_path": firebase_path_used,
                    "sample_fetch_age_ms": fetch_age_ms,
                    "timestamp": current_timestamp,
                    "device": device_id,
                }
                try:
                    await websocket.send_json(debug_payload)
                except Exception:
                    pass
                print(f"[WebSocket][debug] {debug_payload}", flush=True)

            # 1) ECG (every tick)
            await websocket.send_json(
                {
                    "type": "ecg",
                    "value": ecg_val,
                    "ts_ms": ts_ms_val,
                    "timestamp": current_timestamp,
                    "firebase_connected": is_firebase_connected,
                    "device": device_id,
                    "firebase_path": firebase_path_used,
                }
            )

            ecg_buffer.append(int(ecg_val) if ecg_val is not None else 512)
            if len(ecg_buffer) > 1500:
                del ecg_buffer[:100]

            # 2) Flex (every 100ms = 10Hz, aligned with sample_100ms)
            if local_time % 5 == 0:
                flex_packet = {
                    "thumb": None,
                    "index": None,
                    "middle": flex_value,
                    "ring": None,
                    "pinky": None,
                }
                await websocket.send_json(
                    {
                        "type": "flex",
                        "values": flex_packet,
                        "ts_ms": ts_ms_val,
                        "timestamp": current_timestamp,
                        "firebase_connected": is_firebase_connected,
                        "device": device_id,
                        "firebase_path": firebase_path_used,
                    }
                )

            # 3) Vitals (every 5s) from /<device>/latest
            if local_time % 250 == 0:
                bpm = 0
                spo2 = 0
                latest_root = await fetch_path(f"{device_id}/latest")
                if isinstance(latest_root, dict) and latest_root:
                    bpm = latest_root.get("bpm", 0)
                    spo2 = latest_root.get("spo2", 0)

                await websocket.send_json(
                    {
                        "type": "vitals",
                        "bpm": bpm,
                        "spo2": spo2,
                        "fingerDetected": bool(bpm) and bool(spo2),
                        "timestamp": current_timestamp,
                        "firebase_connected": is_firebase_connected,
                        "device": device_id,
                        "firebase_path": f"/{device_id}/latest",
                    }
                )

            # 4) AI Prediction (every 2s)
            if local_time % 100 == 0:
                if len(ecg_buffer) > 500:
                    if AI_AVAILABLE:
                        loop = asyncio.get_running_loop()
                        snapshot = list(ecg_buffer)

                        try:
                            result = await loop.run_in_executor(
                                ai_executor,
                                run_ai_prediction,
                                snapshot,
                                SAMPLING_RATE,
                            )
                            if result and "error" not in result:
                                await websocket.send_json(
                                    {
                                        "type": "prediction",
                                        "data": result,
                                        "timestamp": current_timestamp,
                                    }
                                )
                        except Exception as e:
                            print(f"[AI] Error: {e}", flush=True)
                    else:
                        ai_status = {
                            "prediction_label": "AI Disabled",
                            "confidence": 0,
                            "all_probabilities": {
                                "A (AFib)": 0,
                                "N (Normal)": 0,
                                "O (Other)": 0,
                                "~ (Noisy)": 0,
                            },
                        }
                        await websocket.send_json(
                            {
                                "type": "prediction",
                                "data": ai_status,
                                "timestamp": current_timestamp,
                            }
                        )
                else:
                    progress = int((len(ecg_buffer) / 500) * 100)
                    buffering_data = {
                        "prediction_label": f"Buffering {progress}%",
                        "confidence": 0,
                        "all_probabilities": {
                            "A (AFib)": 0,
                            "N (Normal)": 0,
                            "O (Other)": 0,
                            "~ (Noisy)": 0,
                        },
                    }
                    await websocket.send_json(
                        {
                            "type": "prediction",
                            "data": buffering_data,
                            "timestamp": current_timestamp,
                        }
                    )

            local_time += 1
            await asyncio.sleep(0.02)  # 20ms tick
            
    except WebSocketDisconnect:
        print("[WebSocket] Client disconnected", flush=True)
        manager.disconnect(websocket)
    except Exception as e:
        print(f"[WebSocket] Error: {e}", flush=True)
        manager.disconnect(websocket)
    finally:
        if session is not None:
            try:
                await session.close()
            except Exception:
                pass
