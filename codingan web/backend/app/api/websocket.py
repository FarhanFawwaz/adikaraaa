"""
WebSocket Handler for Real-time Data
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import json
import random
import math
import time

router = APIRouter()


class ConnectionManager:
    """WebSocket connection manager"""
    
    def __init__(self):
        self.active_connections: list[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
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


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time data streaming"""
    await manager.connect(websocket)
    
    local_time = 0
    ecg_buffer = []
    
    try:
        # Send connection confirmation
        await websocket.send_json({
            'type': 'info',
            'message': 'Connected to NeuroRehab WebSocket'
        })
        
        while True:
            current_timestamp = time.time()
            
            # 1. ECG data (50Hz)
            ecg_val = generate_ecg_value(local_time)
            await websocket.send_json({
                'type': 'ecg',
                'value': ecg_val,
                'timestamp': current_timestamp
            })
            
            # Buffer for AI
            ecg_buffer.append(ecg_val)
            if len(ecg_buffer) > 3000:
                del ecg_buffer[:100]
            
            # 2. Flex sensors (every 0.5s)
            if local_time % 25 == 0:
                await websocket.send_json({
                    'type': 'flex',
                    'values': generate_flex_values(),
                    'timestamp': current_timestamp
                })
            
            # 3. Vitals (every 1s)
            if local_time % 50 == 0:
                await websocket.send_json({
                    'type': 'vitals',
                    'data': generate_vitals(),
                    'timestamp': current_timestamp
                })
            
            # 4. AI Prediction (every 2s) - Mock
            if local_time % 100 == 0 and len(ecg_buffer) > 100:
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
                    'timestamp': current_timestamp
                })
            
            local_time += 1
            await asyncio.sleep(0.02)  # 50Hz
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket)
