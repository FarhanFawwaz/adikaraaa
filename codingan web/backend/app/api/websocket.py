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
from concurrent.futures import ThreadPoolExecutor

router = APIRouter()

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


# ECG Generator state
hrv_offset = 0.0
hrv_counter = 0


def generate_ecg_value(t: int) -> float:
    """Generate realistic ECG waveform value"""
    global hrv_offset, hrv_counter
    
    # Baseline wander
    base = math.sin(t * 0.05) * 15 + math.sin(t * 0.02) * 8
    
    # Heart Rate Variability
    hrv_counter += 1
    if hrv_counter > 100:
        hrv_offset += random.uniform(-2, 2)
        hrv_offset = max(-8, min(8, hrv_offset))
        hrv_counter = 0
    
    period = 50 + hrv_offset
    phase = t % period
    
    beat = 0
    noise = random.uniform(-8, 8)
    
    # PQRST complex
    if 5 < phase < 10:
        beat = 30 * random.uniform(0.8, 1.2)  # P wave
    elif 18 < phase < 20:
        beat = -50 * random.uniform(0.9, 1.1)  # Q wave
    elif 20 <= phase < 24:
        r_peak = 400 - (abs(phase - 22) * 50)
        beat = r_peak * random.uniform(0.85, 1.15)  # R wave
    elif 24 <= phase < 26:
        beat = -70 * random.uniform(0.9, 1.1)  # S wave
    elif 35 < phase < 45:
        t_shape = 50 - abs(phase - 40) * 3
        beat = max(0, t_shape) * random.uniform(0.85, 1.15)  # T wave
    
    return 512 + base + beat + noise


def generate_flex_values() -> dict:
    """Generate flex sensor values"""
    return {
        'thumb': random.randint(10, 90),
        'index': random.randint(10, 90),
        'middle': random.randint(10, 90),
        'ring': random.randint(10, 90),
        'pinky': random.randint(10, 90)
    }


def generate_vitals() -> dict:
    """Generate vital signs"""
    return {
        'bpm': random.randint(60, 80),
        'spo2': random.randint(97, 100),
        'temperature': round(random.uniform(36.5, 37.0), 1)
    }


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
            
            # 1. ECG data (50Hz)
            ecg_val = generate_ecg_value(local_time)
            await websocket.send_json({
                'type': 'ecg',
                'value': ecg_val,
                'timestamp': current_timestamp
            })
            
            # Buffer for AI (keep last 30 seconds = 1500 samples at 50Hz)
            ecg_buffer.append(ecg_val)
            if len(ecg_buffer) > 1500:
                del ecg_buffer[:100]
            
            # 2. Flex sensors (every 0.5s = 25 ticks)
            if local_time % 25 == 0:
                await websocket.send_json({
                    'type': 'flex',
                    'values': generate_flex_values(),
                    'timestamp': current_timestamp
                })
            
            # 3. Vitals (every 1s = 50 ticks)
            if local_time % 50 == 0:
                await websocket.send_json({
                    'type': 'vitals',
                    'data': generate_vitals(),
                    'timestamp': current_timestamp
                })
            
            # 4. AI Prediction (every 3s = 150 ticks)
            if local_time % 150 == 0 and len(ecg_buffer) > 500:
                if AI_AVAILABLE:
                    # Run AI prediction in executor to avoid blocking
                    loop = asyncio.get_running_loop()
                    snapshot = list(ecg_buffer)  # Copy buffer
                    
                    try:
                        result = await loop.run_in_executor(
                            ai_executor,
                            run_ai_prediction,
                            snapshot,
                            SAMPLING_RATE
                        )
                        
                        if result and 'error' not in result:
                            await websocket.send_json({
                                'type': 'prediction',
                                'data': result,
                                'timestamp': current_timestamp,
                                'ai_type': 'real'
                            })
                            print(f"[AI] Prediction: {result.get('prediction_label')} ({result.get('confidence', 0)*100:.1f}%)", flush=True)
                        else:
                            # Send mock if AI fails
                            await websocket.send_json({
                                'type': 'prediction',
                                'data': {
                                    'prediction_label': 'N (Normal)',
                                    'confidence': random.uniform(0.92, 0.99),
                                    'all_probabilities': {
                                        'N (Normal)': random.uniform(0.90, 0.98),
                                        'A (AFib)': random.uniform(0.01, 0.05),
                                        'O (Other)': random.uniform(0.01, 0.03),
                                        '~ (Noisy)': random.uniform(0.00, 0.02)
                                    }
                                },
                                'timestamp': current_timestamp,
                                'ai_type': 'mock'
                            })
                    except Exception as e:
                        print(f"[AI] Error: {e}", flush=True)
                else:
                    # Mock prediction if AI not available
                    await websocket.send_json({
                        'type': 'prediction',
                        'data': {
                            'prediction_label': 'N (Normal)',
                            'confidence': random.uniform(0.92, 0.99),
                            'all_probabilities': {
                                'N (Normal)': random.uniform(0.90, 0.98),
                                'A (AFib)': random.uniform(0.01, 0.05),
                                'O (Other)': random.uniform(0.01, 0.03),
                                '~ (Noisy)': random.uniform(0.00, 0.02)
                            }
                        },
                        'timestamp': current_timestamp,
                        'ai_type': 'mock'
                    })
            
            local_time += 1
            await asyncio.sleep(0.02)  # 50Hz
            
    except WebSocketDisconnect:
        print("[WebSocket] Client disconnected", flush=True)
        manager.disconnect(websocket)
    except Exception as e:
        print(f"[WebSocket] Error: {e}", flush=True)
        manager.disconnect(websocket)

