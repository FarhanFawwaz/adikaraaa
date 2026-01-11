import asyncio
import aiohttp
import os
import sys

# Firebase configuration (same as in websocket.py)
FIREBASE_DATABASE_URL = "https://neurorehab-58cd1-default-rtdb.asia-southeast1.firebasedatabase.app/"
FIREBASE_DB_SECRET = "YPtFmyP2WHqRb5YOdKgZuEk95jLbp0LIXPBFpxug"

async def fetch_firebase_data():
    """Fetch data from Firebase Realtime Database using Database Secret"""
    url = f"{FIREBASE_DATABASE_URL}/.json?auth={FIREBASE_DB_SECRET}"
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                status = response.status
                if status == 200:
                    data = await response.json()
                    return data
                else:
                    print(f"[Firebase] Error: {status}", flush=True)
                    return None
    except Exception as e:
        print(f"[Firebase] Exception: {e}", flush=True)
        return None

if __name__ == "__main__":
    data = asyncio.run(fetch_firebase_data())
    print("[DEBUG] Firebase data fetched:", data)
