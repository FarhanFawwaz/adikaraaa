import asyncio
import aiohttp
import json

FIREBASE_DATABASE_URL = "https://neurorehab-58cd1-default-rtdb.asia-southeast1.firebasedatabase.app"
FIREBASE_DB_SECRET = "YPtFmyP2WHqRb5YOdKgZuEk95jLbp0LIXPBFpxug"

async def fetch_firebase_data(path: str = ""):
    clean_path = (path or "").lstrip("/")
    url = f"{FIREBASE_DATABASE_URL}/{clean_path}.json?auth={FIREBASE_DB_SECRET}"
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                if response.status == 200:
                    return await response.json()
                print(f"Error: {response.status}")
                return None
    except Exception as e:
        print(f"Exception: {e}")
        return None

if __name__ == "__main__":
    data = asyncio.run(fetch_firebase_data("device1/latest"))
    print(json.dumps(data, indent=2))
