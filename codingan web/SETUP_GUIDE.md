# 🚀 Setup Guide - WebSocket Bridge Server

Panduan lengkap untuk menjalankan sistem NeuroRehab dengan WebSocket Bridge.

## 📊 Arsitektur Sistem

```
┌─────────────┐         ┌──────────────────┐         ┌────────────────┐         ┌─────────────┐
│   ESP32     │  WiFi   │    Firebase      │   Read  │ Bridge Server  │   WS    │  Frontend   │
│  (Sensors)  ├────────▶│ Realtime Database├────────▶│   (Node.js)    ├────────▶│   (React)   │
│             │         │                  │         │                │         │             │
└─────────────┘         └──────────────────┘         └────────────────┘         └─────────────┘
  BPM, SpO2,              /device1/latest             ws://localhost:8080      Dashboard UI
  ECG, Flex                                                                     
```

## ⚙️ Setup Steps

### 1️⃣ Setup Bridge Server

#### a. Download Firebase Service Account Key

1. Buka Firebase Console: https://console.firebase.google.com/project/adikara-8fedf/settings/serviceaccounts/adminsdk
2. Klik tab **"Service accounts"**
3. Klik button **"Generate new private key"**
4. Akan download file JSON (contoh: `adikara-8fedf-firebase-adminsdk-xxxxx.json`)
5. **Rename** file tersebut menjadi `firebase-service-account.json`
6. **Copy** file ke folder `bridge-server/`

**Path akhir harus:**
```
codingan web/
└── bridge-server/
    ├── firebase-service-account.json  ← File ini!
    ├── server.js
    ├── package.json
    └── ...
```

#### b. Install Dependencies

```bash
cd "d:\adikara1\adikaraaa\codingan web\bridge-server"
npm install
```

✅ **Already done!** Dependencies sudah terinstall.

#### c. Start Bridge Server

```bash
npm start
```

**Expected output:**
```
✅ Firebase initialized successfully
🚀 WebSocket Server started on ws://localhost:8080
👂 Listening to Firebase path: /device1/latest

✅ Bridge Server Ready!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 WebSocket: ws://localhost:8080
🔥 Firebase: /device1/latest
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Biarkan terminal ini tetap running!**

---

### 2️⃣ Setup ESP32

ESP32 **tidak perlu diubah** apa-apa! Tetap kirim data ke Firebase seperti biasa.

1. Pastikan ESP32 sudah upload dengan code terbaru
2. Pastikan WiFi credentials sudah benar di `config.h`
3. Upload dan monitor:

```bash
cd "d:\adikara1\adikaraaa\codingan web\iot"
pio run --target upload
pio device monitor
```

**Expected output di Serial Monitor:**
```
✅ WiFi Connected!
   IP Address: 192.168.x.x

✅ Firebase Ready!
✅ MAX30102 detected successfully!

💓 BPM: 72.0 | 🫁 SpO2: 98.0% | 📊 ECG: 2048 | 🤏 Flex: 1500
📤 Firebase: Updated valid fields
```

**Biarkan ESP32 tetap running!**

---

### 3️⃣ Setup Frontend

#### a. Install Dependencies (if needed)

```bash
cd "d:\adikara1\adikaraaa\codingan web\frontend"
npm install
```

#### b. Start Frontend Dev Server

```bash
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

#### c. Open Browser

Buka browser ke: **http://localhost:5173/dashboard**

---

## ✅ Verification Checklist

Setelah semua running, verifikasi:

### Bridge Server Terminal
- [ ] `✅ Firebase initialized successfully`
- [ ] `🚀 WebSocket Server started`
- [ ] Saat frontend connect: `📱 New client connected`
- [ ] Saat ESP32 kirim data: `📊 Data update: BPM=72, SpO2=98%, ...`

### ESP32 Serial Monitor
- [ ] `✅ WiFi Connected!`
- [ ] `✅ Firebase Ready!`
- [ ] `💓 BPM: ... | 🫁 SpO2: ...`
- [ ] `📤 Firebase: Updated valid fields` (setiap beberapa detik)

### Frontend Dashboard
- [ ] Connection badge shows **"Live"** (green) ✅
- [ ] ECG waveform bergerak real-time
- [ ] Flex sensor bar berubah saat sensor di-flex
- [ ] BPM value muncul saat finger on MAX30102 (tunggu 5-10 detik)
- [ ] SpO2 value muncul saat finger on MAX30102

### Browser DevTools Console
```javascript
[WebSocket] Connecting to ws://localhost:8080...
[WebSocket] ✓ Connected!
[WebSocket] { type: 'info', message: 'Connected to NeuroRehab Bridge Server' }
[WebSocket] { type: 'ecg', value: 2048, timestamp: ... }
[WebSocket] { type: 'flex', value: 1500, timestamp: ... }
[WebSocket] { type: 'vitals', bpm: 72, spo2: 98, ... }
```

---

## 🐛 Troubleshooting

### Bridge Server Error: "Firebase initialization failed"

❌ **Problem:** File `firebase-service-account.json` tidak ditemukan atau invalid

✅ **Solution:**
1. Cek file ada di `bridge-server/firebase-service-account.json`
2. Cek format JSON valid (bukan `.txt` atau format lain)
3. Re-download dari Firebase Console jika perlu

### Bridge Server: "No data in Firebase"

❌ **Problem:** ESP32 belum kirim data atau path salah

✅ **Solution:**
1. Cek ESP32 Serial Monitor - apakah `📤 Firebase: Updated valid fields`?
2. Buka Firebase Console: https://console.firebase.google.com/project/adikara-8fedf/database
3. Cek apakah ada data di path `/device1/latest`
4. Pastikan `.env` di bridge server path-nya sama: `FIREBASE_PATH_LATEST=/device1/latest`

### Frontend: Connection Badge "Disconnected"

❌ **Problem:** WebSocket tidak connect ke bridge server

✅ **Solution:**
1. Pastikan bridge server running di port 8080
2. Cek browser console untuk error messages
3. Pastikan tidak ada firewall blocking port 8080
4. Try refresh browser (F5)

### Frontend: No Sensor Data Showing

❌ **Problem:** Data tidak flowing dari Firebase → Bridge → Frontend

✅ **Solution:**
1. Cek **Bridge Server terminal** - apakah ada `📊 Data update`?
2. Cek **ESP32 Serial Monitor** - apakah kirim ke Firebase?
3. Cek **Browser Console** - apakah receive WebSocket messages?
4. Buka Firebase Console dan manual verify ada data

---

## 🎮 Testing Scenario

### Test 1: ECG Sensor
1. Touch ECG sensor pads dengan jari
2. **Expected:** ECG waveform appears di dashboard
3. **Expected:** Bridge server log: `📊 Data update: ... ECG=xxxx`

### Test 2: Flex Sensor
1. Bend flex sensor
2. **Expected:** Flex bar berubah dari 0-4095
3. **Expected:** Value real-time update

### Test 3: MAX30102 (BPM & SpO2)
1. Place finger gently on sensor
2. Wait 5-10 seconds untuk stabilisasi
3. **Expected:** BPM value appears (40-200 range)
4. **Expected:** SpO2 value appears (85-100% range)
5. **Expected:** Connection badge stays green

### Test 4: Reconnection
1. Stop bridge server (Ctrl+C)
2. **Expected:** Frontend badge turns red "Disconnected"
3. Restart bridge server (`npm start`)
4. **Expected:** Frontend auto-reconnects dalam 3 detik
5. **Expected:** Data flow resumes

### Test 5: Multiple Clients
1. Open dashboard di 2 browser tabs
2. **Expected:** Both show "Live" connection
3. **Expected:** Both receive same data simultaneously
4. **Expected:** Bridge server log: `Clients: 2`

---

## 📝 Quick Commands Summary

**Terminal 1 - Bridge Server:**
```bash
cd "d:\adikara1\adikaraaa\codingan web\bridge-server"
npm start
```

**Terminal 2 - ESP32 Monitor:**
```bash
cd "d:\adikara1\adikaraaa\codingan web\iot"
pio device monitor
```

**Terminal 3 - Frontend:**
```bash
cd "d:\adikara1\adikaraaa\codingan web\frontend"
npm run dev
```

**Browser:**
```
http://localhost:5173/dashboard
```

---

## 🛑 Shutdown

Stop semua services dengan urutan:

1. **Frontend:** Ctrl+C di terminal frontend
2. **Bridge Server:** Ctrl+C di terminal bridge server (akan graceful shutdown)
3. **ESP32:** Unplug atau stop monitor

---

## 📚 Additional Resources

- Bridge Server README: `bridge-server/README.md`
- Firebase Console: https://console.firebase.google.com/project/adikara-8fedf
- Frontend Code: `frontend/src/hooks/useWebSocket.js`
- ESP32 Code: `iot/src/main.cpp`

---

**🎉 Selamat! Sistem WebSocket Bridge sudah siap digunakan!**
