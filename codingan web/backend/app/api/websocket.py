"""
WebSocket Handler for Real-time Data
Integrated with AI ECG Prediction
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import json
import random
import math
import time
import sys
import os
import aiohttp
from concurrent.futures import ThreadPoolExecutor


router = APIRouter()

# Firebase Configuration - Corrected to match actual database
FIREBASE_DATABASE_URL = "https://neurorehab-58cd1-default-rtdb.asia-southeast1.firebasedatabase.app"
FIREBASE_PATH = "/device1/latest"  # Path where ESP32 sends sensor data

async def fetch_firebase_data():
    """Fetch data from Firebase Realtime Database at /device1/latest"""
    url = f"{FIREBASE_DATABASE_URL}{FIREBASE_PATH}.json"
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                status = response.status
                if status == 200:
                    data = await response.json()
                    if data:  # Only log when we have data
                        print(f"[Firebase] ✅ Data received: BPM={data.get('bpm', 0)}, SpO2={data.get('spo2', 0)}%, ECG={data.get('ecg', 0)}, Flex={data.get('flex', 0)}", flush=True)
                    return data
                else:
                    print(f"[Firebase] ❌ Error {status}", flush=True)
                    text = await response.text()
                    print(f"[Firebase] Response: {text[:200]}", flush=True)
                    return None
    except Exception as e:
        print(f"[Firebase] ❌ Exception: {e}", flush=True)
        return None

if __name__ == "__main__":
    import asyncio
    data = asyncio.run(fetch_firebase_data())
    print("[DEBUG] Firebase data fetched:", data)

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
        await websocket.send_json(data)
    
    async def broadcast(self, data: dict):
        for connection in self.active_connections:
            await connection.send_json(data)


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
    """WebSocket endpoint for real-time data streaming with AI"""
    await manager.connect(websocket)
    
    local_time = 0
    ecg_buffer = []
    SAMPLING_RATE = 50  # Hz
    
    try:
        # Send connection confirmation
        await websocket.send_json({
            'type': 'info',
            'message': 'Connected to NeuroRehab WebSocket',
            'ai_enabled': AI_AVAILABLE
        })
        
        print(f"[WebSocket] Client connected, AI: {'Enabled' if AI_AVAILABLE else 'Disabled'}", flush=True)
        
        while True:
            current_timestamp = time.time()
            
            # Fetch data from Firebase
            firebase_data = await fetch_firebase_data()
            
            if firebase_data:
                # Firebase data available - use real sensor data
                # 1. ECG Data
                ecg_val = firebase_data.get('ecg', 512)
                await websocket.send_json({
                    'type': 'ecg',
                    'value': ecg_val,
                    'timestamp': current_timestamp
                })
                
                ecg_buffer.append(ecg_val)
                if len(ecg_buffer) > 1500: del ecg_buffer[:100]
                
                # 2. Flex Data - Send single value from Firebase
                flex_val = firebase_data.get('flex', 0)
                if local_time % 25 == 0:  # Update every 500ms (25 * 20ms)
                    await websocket.send_json({
                        'type': 'flex',
                        'value': flex_val,  # Single flex sensor value
                        'timestamp': current_timestamp
                    })
                
                # 3. Vitals Data (BPM & SpO2)
                if local_time % 50 == 0:  # Update every 1 second (50 * 20ms)
                    bpm = firebase_data.get('bpm', 0)
                    spo2 = firebase_data.get('spo2', 0)
                    await websocket.send_json({
                        'type': 'vitals',
                        'bpm': bpm,
                        'spo2': spo2,
                        'fingerDetected': (bpm > 0 and spo2 > 0),
                        'timestamp': current_timestamp
                    })
            else:
                # No data from Firebase
                if local_time % 50 == 0:
                     print("[WebSocket] ⚠️ Waiting for Firebase data...", flush=True)
            
            # 4. AI Prediction (every 2s = 100 ticks approx)
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
                                SAMPLING_RATE
                            )
                            
                            if result and 'error' not in result:
                                print(f"[AI] Prediction: {result.get('prediction_label')}", flush=True)
                                await websocket.send_json({
                                    'type': 'prediction',
                                    'data': result,
                                    'timestamp': current_timestamp
                                })
                        except Exception as e:
                            print(f"[AI] Error: {e}", flush=True)
                    else:
                        # Send status when AI not available
                        ai_status = {
                            'prediction_label': 'AI Disabled',
                            'confidence': 0,
                            'all_probabilities': {
                                'A (AFib)': 0, 'N (Normal)': 0, 'O (Other)': 0, '~ (Noisy)': 0
                            }
                        }
                        await websocket.send_json({
                            'type': 'prediction',
                            'data': ai_status,
                            'timestamp': current_timestamp
                        })
                else:
                    # Send buffering status
                    progress = int((len(ecg_buffer) / 500) * 100)
                    buffering_data = {
                        'prediction_label': f'Buffering {progress}%',
                        'confidence': 0,
                        'all_probabilities': {
                            'A (AFib)': 0, 'N (Normal)': 0, 'O (Other)': 0, '~ (Noisy)': 0
                        }
                    }
                    await websocket.send_json({
                        'type': 'prediction',
                        'data': buffering_data,
                        'timestamp': current_timestamp
                    })

            local_time += 1
            await asyncio.sleep(0.02)  # 20ms interval (50Hz)
            
    except WebSocketDisconnect:
        print("[WebSocket] Client disconnected", flush=True)
        manager.disconnect(websocket)
    except Exception as e:
        print(f"[WebSocket] Error: {e}", flush=True)
        manager.disconnect(websocket)

