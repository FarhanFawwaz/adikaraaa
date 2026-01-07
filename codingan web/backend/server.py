#!/usr/bin/env python3
"""
Mock WebSocket Server untuk NeuroRehab System
Server ini mengirim data simulasi ECG, Flex Sensor, dan Vitals
Gunakan untuk testing dashboard tanpa hardware asli
"""

import asyncio
import websockets
import json
import random
import math
import time

# Port server
PORT = 8080
HOST = "0.0.0.0"  # Allow connections from any IP (termasuk dari React dev server)

# Simulasi data global
ecg_time = 0
connected_clients = set()

def generate_ecg_value(t):
    """Generate nilai ECG sintetis (simulasi gelombang PQRST)"""
    base = math.sin(t * 0.1) * 5
    beat = 0
    
    # Simulasi QRS complex
    phase = t % 80
    if 70 < phase < 76:
        beat = -80 + random.uniform(-5, 5)  # R peak
    elif 65 < phase <= 70:
        beat = 15  # Q wave
    elif 76 < phase < 80:
        beat = 10  # S wave
    
    return 500 + base + beat + random.uniform(-2, 2)

def generate_flex_values():
    """Generate nilai flex sensor (0-100) untuk 5 jari"""
    return {
        'thumb': random.randint(0, 100),
        'index': random.randint(0, 100),
        'middle': random.randint(0, 100),
        'ring': random.randint(0, 100),
        'pinky': random.randint(0, 100)
    }

def generate_vitals():
    """Generate data vitals (BPM, SpO2, Temperature)"""
    return {
        'bpm': random.randint(65, 85),
        'spo2': random.randint(96, 99),
        'temperature': round(random.uniform(36.2, 37.1), 1)
    }

async def send_data(websocket):
    """Kirim data secara periodik ke client"""
    global ecg_time
    
    try:
        while True:
            # Kirim data ECG (setiap 50ms untuk grafik smooth)
            ecg_data = {
                'type': 'ecg',
                'value': generate_ecg_value(ecg_time),
                'timestamp': time.time()
            }
            await websocket.send(json.dumps(ecg_data))
            ecg_time += 1
            await asyncio.sleep(0.05)  # 50ms
            
            # Kirim data flex sensor (setiap 1 detik)
            if ecg_time % 20 == 0:
                flex_data = {
                    'type': 'flex',
                    'values': generate_flex_values(),
                    'timestamp': time.time()
                }
                await websocket.send(json.dumps(flex_data))
            
            # Kirim data vitals (setiap 2 detik)
            if ecg_time % 40 == 0:
                vitals_data = {
                    'type': 'vitals',
                    'data': generate_vitals(),
                    'timestamp': time.time()
                }
                await websocket.send(json.dumps(vitals_data))
                
    except websockets.exceptions.ConnectionClosed:
        print(f"[Server] Client terputus")
    except Exception as e:
        print(f"[Server] Error: {e}")

async def handle_client(websocket):
    """Handle koneksi client baru"""
    client_address = websocket.remote_address
    print(f"[Server] ✓ Client terhubung: {client_address}")
    
    connected_clients.add(websocket)
    
    try:
        # Kirim pesan welcome
        welcome_msg = {
            'type': 'info',
            'message': 'Terhubung ke NeuroRehab WebSocket Server',
            'timestamp': time.time()
        }
        await websocket.send(json.dumps(welcome_msg))
        
        # Mulai kirim data
        await send_data(websocket)
        
    finally:
        connected_clients.remove(websocket)
        print(f"[Server] Client terputus: {client_address}")

async def main():
    """Jalankan WebSocket server"""
    print("=" * 60)
    print("  NeuroRehab WebSocket Mock Server")
    print("=" * 60)
    print(f"  Host: {HOST}")
    print(f"  Port: {PORT}")
    print(f"  URL: ws://localhost:{PORT}")
    print(f"  Status: RUNNING ✓")
    print("=" * 60)
    print("\nTekan Ctrl+C untuk berhenti\n")
    
    async with websockets.serve(handle_client, HOST, PORT):
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n[Server] Server dihentikan oleh user")
    except Exception as e:
        print(f"\n[Server] Error: {e}")
