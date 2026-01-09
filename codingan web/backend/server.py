#!/usr/bin/env python3
"""
Mock WebSocket Server untuk NeuroRehab System
Server ini mengirim data simulasi ECG, Flex Sensor, dan Vitals
Mengintegrasikan modul AI untuk demonstrasi prediksi real-time.
"""

import asyncio
import websockets
import json
import random
import math
import time
import sys
import os
from concurrent.futures import ThreadPoolExecutor

# --- PERBAIKAN IMPORT PATH ---
# Pastikan folder 'codingan web' ada di sys.path agar bisa import 'ai'
current_dir = os.path.dirname(os.path.abspath(__file__))
# current_dir = .../codingan web/backend
# project_root = .../codingan web
project_root = os.path.dirname(current_dir)

if project_root not in sys.path:
    sys.path.append(project_root)

print(f"[Debug] Project Root: {project_root}", flush=True)
print(f"[Debug] Sys Path: {sys.path}", flush=True)

AI_AVAILABLE = False
predictor = None

try:
    print("[Server] 🚀 Menginisialisasi AI Model...", flush=True)
    from ai.predict import ECGPredictor
    
    print("[Server] 🔄 Creating ECGPredictor instance...", flush=True)
    # Init predictor
    predictor = ECGPredictor()
    
    print("[Server] 🧪 Testing model with dummy data...", flush=True)
    # Test prediksi awal untuk memastikan model jalan
    dummy = [512] * 3000
    res = predictor.predict(dummy, fs=100)
    print(f"[Server] Test Prediksi: {res.get('prediction_label', 'Fail')}", flush=True)
    
    AI_AVAILABLE = True
    print("[Server] ✅ AI Model siap digunakan.")
except ImportError as e:
    print(f"[Server] ⚠️ Gagal import modul AI: {e}")
    # Fallback mock jika gagal load model
    class MockPredictor:
        def predict(self, data, fs):
            return {
                "prediction_label": "N (Normal) [MOCK]",
                "confidence": 0.95,
                "all_probabilities": {"A (AFib)": 0.02, "N (Normal)": 0.95, "O (Other)": 0.03, "~ (Noisy)": 0.0}
            }
    predictor = MockPredictor()
    AI_AVAILABLE = True # Paksa true dengan mock agar UI tidak waiting
    print("[Server] ⚠️ Menggunakan MOCK Predictor karena model asli gagal.")

except Exception as e:
    print(f"[Server] ❌ Error inisialisasi AI: {e}")

# ----------------------------------

# Port server
PORT = 8080
HOST = "0.0.0.0"

# Simulasi data global
connected_clients = set()
ecg_buffer = []  
ai_executor = ThreadPoolExecutor(max_workers=1)

# Heart Rate Variability state
hrv_offset = random.uniform(-5, 5)
hrv_change_counter = 0

def generate_ecg_value(t):
    global hrv_offset, hrv_change_counter
    
    # Baseline wander (respirasi, movement artifact)
    base = math.sin(t * 0.05) * 15 + math.sin(t * 0.02) * 8
    
    # Heart Rate Variability: period berubah perlahan
    hrv_change_counter += 1
    if hrv_change_counter > 100:  # Update HRV tiap ~2 detik
        hrv_offset += random.uniform(-2, 2)
        hrv_offset = max(-8, min(8, hrv_offset))  # Clamp ±8
        hrv_change_counter = 0
    
    period = 50 + hrv_offset  # Period: 42-58 ticks (~70-85 BPM)
    phase = t % period
    
    beat = 0
    noise = random.uniform(-8, 8)  # Biological noise
    
    # Variability multipliers
    p_var = random.uniform(0.8, 1.2)
    q_var = random.uniform(0.9, 1.1)
    r_var = random.uniform(0.85, 1.15)
    s_var = random.uniform(0.9, 1.1)
    t_var = random.uniform(0.85, 1.15)
    
    # PQRST complex dengan variasi
    p_start, p_end = 5, 10
    q_start, q_end = 18, 20
    r_start, r_end = 20, 24
    s_start, s_end = 24, 26
    t_start, t_end = 35, 45
    
    if p_start < phase < p_end:
        beat = 30 * p_var  # P wave
    elif q_start < phase < q_end:
        beat = -50 * q_var  # Q wave
    elif r_start <= phase < r_end:
        # R wave (sharp peak)
        r_peak = 400 - (abs(phase - 22) * 50)
        beat = r_peak * r_var
    elif s_start <= phase < s_end:
        beat = -70 * s_var  # S wave
    elif t_start < phase < t_end:
        # T wave (smoother, wider)
        t_shape = 50 - abs(phase - 40) * 3
        beat = max(0, t_shape) * t_var
        
    return 512 + base + beat + noise 

def generate_flex_values():
    return {
        'thumb': random.randint(10, 90),
        'index': random.randint(10, 90),
        'middle': random.randint(10, 90),
        'ring': random.randint(10, 90),
        'pinky': random.randint(10, 90)
    }

def generate_vitals():
    return {
        'bpm': random.randint(60, 80),
        'spo2': random.randint(97, 100),
        'temperature': round(random.uniform(36.5, 37.0), 1)
    }

async def send_data(websocket):
    global ecg_buffer
    
    SAMPLING_RATE = 50 # Hz (Approx)
    local_time = 0
    
    print(f"[Server] Client connected: {websocket.remote_address}")
    
    try:
        while True:
            current_timestamp = time.time()
            
            # 1. ECG - Kirim cepat (20ms interval = 50Hz)
            ecg_val = generate_ecg_value(local_time)
            
            msg = {
                'type': 'ecg',
                'value': ecg_val,
                'timestamp': current_timestamp
            }
            await websocket.send(json.dumps(msg))
            
            # Buffer AI
            ecg_buffer.append(ecg_val)
            if len(ecg_buffer) > 3000: del ecg_buffer[:100]

            # 2. Sensor Lain (Slow)
            if local_time % 25 == 0: # Tiap 0.5s
                 await websocket.send(json.dumps({
                    'type': 'flex',
                    'values': generate_flex_values(),
                    'timestamp': current_timestamp
                }))
            
            if local_time % 50 == 0: # Tiap 1s
                await websocket.send(json.dumps({
                    'type': 'vitals',
                    'data': generate_vitals(),
                    'timestamp': current_timestamp
                }))
                
            # 3. AI Prediction (Tiap 2 detik = 100 ticks)
            if local_time % 100 == 0:
                print(f"[AI] Buffer size: {len(ecg_buffer)}") # Debug log
                if len(ecg_buffer) > 100:
                    snapshot = list(ecg_buffer)[-1500:] # Ambil 30 detik terakhir jika ada
                    loop = asyncio.get_running_loop()
                    result = await loop.run_in_executor(
                        ai_executor, 
                        predictor.predict, 
                        snapshot, 
                        SAMPLING_RATE
                    )
                    
                    # Kirim hasil
                    print(f"[AI] Result: {result.get('prediction_label')}") # Debug log
                    await websocket.send(json.dumps({
                        'type': 'prediction',
                        'data': result,
                        'timestamp': current_timestamp
                    }))

            local_time += 1
            await asyncio.sleep(0.02) # 20ms = 50Hz stable

    except websockets.exceptions.ConnectionClosed:
        pass
    except Exception as e:
        print(f"[Server] Error: {e}")

async def handle_client(websocket):
    connected_clients.add(websocket)
    try:
        await websocket.send(json.dumps({'type': 'info', 'message': 'Connected!'}))
        await send_data(websocket)
    finally:
        connected_clients.remove(websocket)

async def main():
    print(f"Server running on ws://{HOST}:{PORT}")
    async with websockets.serve(handle_client, HOST, PORT):
        await asyncio.Future()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
