# NeuroRehab WebSocket Bridge Server

Bridge server untuk relay data sensor IoT dari Firebase Realtime Database ke Frontend via WebSocket.

## 🎯 Fungsi

Server ini berfungsi sebagai jembatan antara:
- **ESP32** → mengirim data sensor ke **Firebase**
- **Firebase** → dibaca oleh **Bridge Server**
- **Bridge Server** → broadcast via **WebSocket** ke **Frontend**

## 📋 Prerequisites

- Node.js v18 atau lebih baru
- Firebase Project dengan Realtime Database
- Service Account Key dari Firebase

## 🚀 Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Download Firebase Service Account Key

1. Buka [Firebase Console](https://console.firebase.google.com/project/neurorehab-58cd1/settings/serviceaccounts/adminsdk)
2. Pilih tab **"Service accounts"**
3. Klik **"Generate new private key"**
4. Download file JSON yang dihasilkan
5. **Rename** file tersebut menjadi `firebase-service-account.json`
6. **Simpan** di folder `bridge-server/` (folder yang sama dengan README ini)

⚠️ **PENTING**: Jangan commit file `firebase-service-account.json` ke Git! File ini sudah ada di `.gitignore`.

### 3. Konfigurasi Environment

File `.env` sudah include dengan konfigurasi default:

```env
FIREBASE_DATABASE_URL=https://neurorehab-58cd1-default-rtdb.asia-southeast1.firebasedatabase.app/
FIREBASE_PROJECT_ID=neurorehab-58cd1
WS_PORT=8080
FIREBASE_PATH_LATEST=/device1/latest
```

Sesuaikan jika diperlukan.

### 4. Run Server

**Development mode** (auto-restart on file changes):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

Server akan berjalan di `ws://localhost:8080`

## 📊 Data Flow

```
ESP32 Sensors ──> Firebase Realtime Database ──> Bridge Server ──> WebSocket ──> React Frontend
   (WiFi)              (/device1/latest)          (port 8080)        (ws://)      (Dashboard)
```

## 📡 WebSocket Message Format

Server mengirim 3 tipe pesan:

### 1. ECG Data
```json
{
  "type": "ecg",
  "value": 2048,
  "timestamp": 12345678
}
```

### 2. Flex Sensor Data
```json
{
  "type": "flex",
  "value": 1500,
  "timestamp": 12345678
}
```

### 3. Vitals Data (BPM & SpO2)
```json
{
  "type": "vitals",
  "bpm": 72,
  "spo2": 98,
  "fingerDetected": true,
  "timestamp": 12345678
}
```

### 4. Error Messages
```json
{
  "type": "error",
  "message": "Firebase connection error: ..."
}
```

### 5. Info Messages
```json
{
  "type": "info",
  "message": "Connected to NeuroRehab Bridge Server"
}
```

## 🧪 Testing

### Test WebSocket Connection

Buka browser console dan test koneksi:

```javascript
const ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => console.log('✅ Connected');
ws.onmessage = (event) => console.log('📨 Message:', JSON.parse(event.data));
ws.onerror = (error) => console.error('❌ Error:', error);
```

### Test Firebase Listener

Pastikan ESP32 sudah running dan mengirim data ke Firebase. Bridge server akan otomatis detect perubahan dan broadcast ke semua connected clients.

## 🔧 Troubleshooting

### "Firebase initialization failed"
- Pastikan file `firebase-service-account.json` ada di folder ini
- Pastikan format file JSON valid
- Pastikan Service Account Key adalah untuk project yang benar

### "No data in Firebase"
- Pastikan ESP32 sudah running dan terhubung ke WiFi
- Cek Serial Monitor ESP32 untuk konfirmasi Firebase connection
- Verifikasi path Firebase di `.env` sesuai dengan path di ESP32

### WebSocket Connection Refused
- Pastikan bridge server sudah running
- Cek port 8080 tidak digunakan aplikasi lain
- Verifikasi firewall tidak blocking port 8080

## 📝 Logs

Server akan menampilkan log untuk setiap event:
- `📱 New client connected` - Client baru connect
- `📴 Client disconnected` - Client disconnect
- `📊 Data update` - Ada update data sensor dari Firebase
- `⚠️ No data in Firebase` - Firebase tidak ada data
- `❌ Firebase listener error` - Error saat baca Firebase

## 🛑 Stop Server

Tekan `Ctrl+C` untuk graceful shutdown.

Server akan:
1. Close semua WebSocket connections
2. Cleanup resources
3. Exit dengan clean state
