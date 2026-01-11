# Firebase Tools Documentation

Dokumentasi untuk tools yang digunakan untuk fetch dan monitor data dari Firebase Realtime Database.

## 📁 Struktur File

```
backend/
├── app/services/
│   └── firebase_service.py      # Service class untuk Firebase (Python)
└── scripts/
    ├── fetch_firebase.sh         # Script fetch sekali (Bash)
    └── monitor_firebase.sh       # Script monitoring real-time (Bash)
```

---

## 🔧 Tools yang Tersedia

### 1. **firebase_service.py** (Python Service)

**Lokasi**: `app/services/firebase_service.py`

Service class yang dapat digunakan dalam kode Python untuk fetch data Firebase.

#### Usage:

```python
from app.services.firebase_service import FirebaseService

# Initialize service
firebase = FirebaseService()

# Fetch all data
all_data = firebase.fetch_data()

# Get specific device data
device_data = firebase.get_device_data("device1")

# Get latest sensor readings
sensor_data = firebase.get_latest_sensor_data("device1")

# Access specific values
if sensor_data:
    bpm = sensor_data.get('bpm')
    spo2 = sensor_data.get('spo2')
    ecg = sensor_data.get('ecg')
```

#### Testing:

```bash
cd backend
python3 -m app.services.firebase_service
```

---

### 2. **fetch_firebase.sh** (Bash Script)

**Lokasi**: `backend/scripts/fetch_firebase.sh`

Script untuk fetch data Firebase satu kali dan menampilkan dengan format rapi.

#### Features:

- ✅ Fetch data dari Firebase
- ✅ Format JSON rapi
- ✅ Parse sensor data (BPM, SpO2, ECG, Flex)
- ✅ Warna-warni untuk readability

#### Usage:

```bash
cd backend/scripts
./fetch_firebase.sh
```

#### Output:

```
============================================================
🔥 FIREBASE DATA FETCHER
============================================================
📡 URL: https://neurorehab-58cd1...
⏰ Time: 2026-01-11 17:12:04
============================================================

📋 RAW JSON:
{
    "device1": {
        "latest": {
            "bpm": 78,
            "ecg": 0,
            "flex": 0,
            "spo2": 84,
            "ts_ms": 6222285
        }
    }
}

📊 PARSED DATA:
❤️  Heart Rate (BPM): 78
💧 SpO2 (%): 84
📈 ECG Value: 0
🤏 Flex Sensor: 0
```

---

### 3. **monitor_firebase.sh** (Real-Time Monitoring)

**Lokasi**: `backend/scripts/monitor_firebase.sh`

Script untuk monitoring data Firebase secara real-time dengan auto-refresh.

#### Features:

- ✅ Auto-refresh (default: 2 detik)
- ✅ Health status monitoring
- ✅ Warning otomatis untuk nilai abnormal
- ✅ Color-coded display
- ✅ Clear screen untuk tampilan bersih

#### Usage:

```bash
cd backend/scripts

# Default (refresh setiap 2 detik)
./monitor_firebase.sh

# Custom interval (refresh setiap 5 detik)
./monitor_firebase.sh 5
```

#### Output:

```
╔════════════════════════════════════════════════════════════╗
║           🔥 FIREBASE REAL-TIME MONITOR 🔥                ║
╚════════════════════════════════════════════════════════════╝

┌─────────────── SENSOR DATA ───────────────┐
│                                           │
│  ❤️  Heart Rate (BPM):     78            │
│  💧 SpO2 (%):              84            │
│  📈 ECG Value:              0            │
│  🤏 Flex Sensor:            0            │
└───────────────────────────────────────────┘

┌─────────────── HEALTH STATUS ─────────────┐
│  ❌ Critical: Low oxygen saturation       │
└───────────────────────────────────────────┘
```

**Stop monitoring**: Press `Ctrl+C`

---

## 📊 Firebase Configuration

Semua tools menggunakan konfigurasi yang sama:

```
URL: https://neurorehab-58cd1-default-rtdb.asia-southeast1.firebasedatabase.app
Secret: YPtFmyP2WHqRb5YOdKgZuEk95jLbp0LIXPBFpxug
```

---

## 🎯 Use Cases

### Development & Testing

- Gunakan `fetch_firebase.sh` untuk quick check data
- Gunakan `monitor_firebase.sh` saat testing IoT device

### Integration

- Import `FirebaseService` class di aplikasi Python
- Gunakan untuk fetch data di background services
- Integrate dengan AI service atau API endpoints

---

## 🔍 Troubleshooting

### Script tidak executable

```bash
chmod +x fetch_firebase.sh
chmod +x monitor_firebase.sh
```

### No data returned

1. Check koneksi internet
2. Verify Firebase URL dan Secret Key
3. Check Firebase Database Rules (harus allow read)

### Python import error

Pastikan menjalankan dari root project:

```bash
cd backend
python3 -m app.services.firebase_service
```

---

## 📝 Notes

- Script `.sh` menggunakan `curl` dan `jq` (atau Python sebagai fallback)
- Python service menggunakan `requests` atau `urllib` (built-in)
- Semua tools dapat berjalan independent tanpa dependencies khusus
