import asyncio
import aiohttp
import os
import sys

# Firebase configuration (same as in websocket.py)
FIREBASE_DATABASE_URL = "https://neurorehab-58cd1-default-rtdb.asia-southeast1.firebasedatabase.app/"
FIREBASE_DB_SECRET = "YPtFmyP2WHqRb5YOdKgZuEk95jLbp0LIXPBFpxug"

async def fetch_firebase_data(path: str = ""):
    """Fetch data from Firebase Realtime Database using Database Secret"""
    clean_path = (path or "").lstrip("/")
    if clean_path:
        url = f"{FIREBASE_DATABASE_URL}/{clean_path}.json?auth={FIREBASE_DB_SECRET}"
    else:
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
    # Example: fetch only sample_100ms
    data = asyncio.run(fetch_firebase_data("sample_100ms"))
    print("[DEBUG] Firebase data fetched (sample_100ms):", data)
