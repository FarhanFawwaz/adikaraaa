"""
Firebase Service - Synchronous version untuk fetch data dari Firebase Realtime Database
Dapat digunakan sebagai utility atau dipanggil dari service lain
"""
import json
from datetime import datetime
from typing import Optional, Dict, Any
import logging

try:
    import requests
    USE_REQUESTS = True
except ImportError:
    import urllib.request
    import urllib.error
    USE_REQUESTS = False

# Setup logging
logger = logging.getLogger(__name__)

# Firebase Configuration
FIREBASE_DATABASE_URL = "https://neurorehab-58cd1-default-rtdb.asia-southeast1.firebasedatabase.app"
FIREBASE_DB_SECRET = "YPtFmyP2WHqRb5YOdKgZuEk95jLbp0LIXPBFpxug"


class FirebaseService:
    """Service class untuk interaksi dengan Firebase Realtime Database"""
    
    def __init__(self, database_url: str = FIREBASE_DATABASE_URL, secret: str = FIREBASE_DB_SECRET):
        self.database_url = database_url
        self.secret = secret
    
    def fetch_data(self, path: str = "") -> Optional[Dict[str, Any]]:
        """
        Fetch data dari Firebase Realtime Database
        
        Args:
            path: Path spesifik di database (default: root)
        
        Returns:
            Dict berisi data atau None jika gagal
        """
        url = f"{self.database_url}/{path}.json?auth={self.secret}"
        
        try:
            if USE_REQUESTS:
                response = requests.get(url, timeout=10)
                if response.status_code == 200:
                    return response.json()
                else:
                    logger.error(f"Firebase fetch error: HTTP {response.status_code}")
                    return None
            else:
                req = urllib.request.Request(url)
                with urllib.request.urlopen(req, timeout=10) as response:
                    data = response.read()
                    return json.loads(data.decode('utf-8'))
        except Exception as e:
            logger.error(f"Firebase fetch exception: {type(e).__name__}: {e}")
            return None
    
    def get_device_data(self, device_id: str = "device1") -> Optional[Dict[str, Any]]:
        """
        Ambil data spesifik device
        
        Args:
            device_id: ID device (default: device1)
        
        Returns:
            Dict berisi data device atau None
        """
        data = self.fetch_data()
        if data and device_id in data:
            return data[device_id]
        return None
    
    def get_latest_sensor_data(self, device_id: str = "device1") -> Optional[Dict[str, Any]]:
        """
        Ambil data sensor terbaru dari device
        
        Args:
            device_id: ID device
        
        Returns:
            Dict berisi sensor data terbaru atau None
        """
        device_data = self.get_device_data(device_id)
        if device_data and 'latest' in device_data:
            return device_data['latest']
        return None


# Legacy functions untuk backward compatibility
def fetch_firebase_data() -> Optional[Dict[str, Any]]:
    """Fetch data dari Firebase Realtime Database (legacy function)"""
    service = FirebaseService()
    return service.fetch_data()


def print_data_tree(data, indent=0):
    """Print data dalam format tree yang mudah dibaca"""
    if isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, (dict, list)):
                print("  " * indent + f"📁 {key}:")
                print_data_tree(value, indent + 1)
            else:
                print("  " * indent + f"📄 {key}: {value}")
    elif isinstance(data, list):
        for i, item in enumerate(data):
            print("  " * indent + f"[{i}]:")
            print_data_tree(item, indent + 1)
    else:
        print("  " * indent + str(data))




def main():
    """Main function untuk testing/debugging Firebase service"""
    print("=" * 60)
    print("🔥 FIREBASE SERVICE TEST")
    print("=" * 60)
    print(f"📡 Connecting to: {FIREBASE_DATABASE_URL}")
    print(f"⏰ Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🔧 Using: {'requests' if USE_REQUESTS else 'urllib'}")
    print("=" * 60)
    print()
    
    # Initialize service
    firebase = FirebaseService()
    
    # Fetch all data
    print("🔄 Fetching data from Firebase...")
    data = firebase.fetch_data()
    
    if data:
        print("✅ Data berhasil diambil!\n")
        print("=" * 60)
        print("📊 DATA FIREBASE (Tree View):")
        print("=" * 60)
        print_data_tree(data)
        
        print("\n" + "=" * 60)
        print("📋 RAW JSON:")
        print("=" * 60)
        print(json.dumps(data, indent=2, ensure_ascii=False))
        
        # Test get latest sensor data
        print("\n" + "=" * 60)
        print("📈 LATEST SENSOR DATA:")
        print("=" * 60)
        sensor_data = firebase.get_latest_sensor_data("device1")
        if sensor_data:
            print(json.dumps(sensor_data, indent=2))
            print(f"\n❤️  Heart Rate: {sensor_data.get('bpm', 'N/A')} BPM")
            print(f"💧 SpO2: {sensor_data.get('spo2', 'N/A')}%")
            print(f"📈 ECG: {sensor_data.get('ecg', 'N/A')}")
            print(f"🤏 Flex: {sensor_data.get('flex', 'N/A')}")
        
        print("\n" + "=" * 60)
        print("✅ Service test completed!")
    else:
        print("❌ Gagal mengambil data dari Firebase")
        print("\n💡 Tips troubleshooting:")
        print("  1. Pastikan koneksi internet aktif")
        print("  2. Periksa Firebase URL dan Secret Key")
        print("  3. Pastikan Firebase Realtime Database rules mengizinkan read")


if __name__ == "__main__":
    main()
