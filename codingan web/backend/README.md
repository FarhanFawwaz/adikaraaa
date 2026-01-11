# NeuroRehab Backend

Backend API untuk NeuroRehab Glove AI System dengan FastAPI dan WebSocket support.

## 📁 Struktur Proyek

```
backend/
├── app/                          # Main FastAPI application
│   ├── main.py                   # FastAPI entry point
│   ├── config.py                 # Configuration settings
│   ├── database.py               # Database connection
│   ├── api/                      # API endpoints
│   │   ├── routes/               # REST API routes
│   │   └── websocket.py          # WebSocket handler
│   ├── models/                   # Database models
│   │   ├── user.py
│   │   └── patient_profile.py
│   ├── services/                 # Business logic services
│   │   ├── ai_service.py         # AI prediction service
│   │   ├── mqtt_service.py       # MQTT integration
│   │   └── firebase_service.py   # Firebase sync service
│   └── utils/                    # Helper utilities
│       └── auth.py               # Authentication helpers
│
├── scripts/                      # Development utilities
│   ├── fetch_firebase.sh         # Fetch Firebase data once
│   ├── monitor_firebase.sh       # Real-time Firebase monitor
│   └── README.md
│
├── requirements.txt              # Python dependencies
├── FIREBASE_TOOLS.md            # Firebase tools documentation
└── README.md                     # This file
```

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Run Server

```bash
# Development mode dengan auto-reload
python -m app.main

# Atau menggunakan uvicorn langsung
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Server akan berjalan di:

- **REST API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **WebSocket**: ws://localhost:8000/ws

---

## 🔧 Development Tools

### Firebase Data Monitoring

```bash
# Fetch data sekali
cd scripts
./fetch_firebase.sh

# Monitor real-time
./monitor_firebase.sh
```

Dokumentasi lengkap: [FIREBASE_TOOLS.md](FIREBASE_TOOLS.md)

---

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Patients

- `GET /api/patients` - Get all patients
- `POST /api/patients` - Create patient
- `GET /api/patients/{id}` - Get patient by ID
- `PUT /api/patients/{id}` - Update patient
- `DELETE /api/patients/{id}` - Delete patient

### Sessions

- `GET /api/sessions` - Get all sessions
- `POST /api/sessions` - Create session
- `GET /api/sessions/{id}` - Get session by ID

### Games

- `GET /api/games` - Get all games
- `POST /api/games/scores` - Submit game score

### WebSocket

- `WS /ws` - Real-time data streaming

---

## 🗄️ Database

Menggunakan MySQL dengan SQLAlchemy ORM.

### Configuration

Set environment variables atau edit `app/config.py`:

```bash
DB_HOST=localhost
DB_PORT=3307
DB_NAME=adikaraaa_db
DB_USER=adikaraaa
DB_PASSWORD=adikaraaa123
```

---

## 🔥 Firebase Integration

Backend terintegrasi dengan Firebase Realtime Database untuk:

- Real-time sensor data dari IoT device
- WebSocket streaming ke frontend
- AI prediction pada ECG data

Configuration di `app/api/websocket.py` dan `app/services/firebase_service.py`.

---

## 🤖 AI Service

Service untuk ECG prediction terintegrasi di:

- `app/services/ai_service.py` - Service wrapper
- `../ai/predict.py` - Model prediction logic

Model: ResNet untuk klasifikasi ECG (Normal, AFib, Other, Noisy)

---

## 📚 Documentation

- **API Docs**: http://localhost:8000/docs (Swagger UI)
- **ReDoc**: http://localhost:8000/redoc
- **Firebase Tools**: [FIREBASE_TOOLS.md](FIREBASE_TOOLS.md)
- **Scripts**: [scripts/README.md](scripts/README.md)

---

## 🐳 Docker Support

```bash
# Dari root 'codingan web' folder
docker-compose up -d
```

Services:

- Backend API: port 8000
- MySQL: port 3307
- (Frontend, AI jika dikonfigurasi)

---

## 🛠️ Tech Stack

- **Framework**: FastAPI
- **Database**: MySQL + SQLAlchemy
- **WebSocket**: FastAPI WebSocket / websockets library
- **Real-time DB**: Firebase Realtime Database
- **AI**: TensorFlow/Keras (ResNet model)
- **Auth**: JWT tokens

---

## 📝 Development Notes

### Server

**FastAPI Server** - Single unified server untuk semua kebutuhan:

- ✅ Full REST API + WebSocket
- ✅ Port 8000 (configurable)
- ✅ Entry: `app/main.py`
- ✅ Production & Development ready

### Scripts

Semua utility scripts ada di folder `scripts/`:

- Firebase monitoring tools
- Development helpers
- Testing utilities

---

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test locally
4. Submit pull request

---

## 📄 License

[Add your license here]

Backend Python untuk NeuroRehab Glove AI System.

## Struktur Folder

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # Entry point FastAPI
│   ├── config.py            # Konfigurasi aplikasi
│   ├── api/
│   │   ├── __init__.py
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py      # Authentication routes
│   │   │   ├── patients.py  # Patient management
│   │   │   ├── sessions.py  # Therapy sessions
│   │   │   └── games.py     # Game data routes
│   │   └── websocket.py     # WebSocket handlers
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py          # User model
│   │   ├── patient.py       # Patient model
│   │   └── session.py       # Session model
│   ├── services/
│   │   ├── __init__.py
│   │   ├── ecg_service.py   # ECG processing
│   │   ├── ai_service.py    # AI prediction service
│   │   └── mqtt_service.py  # MQTT communication
│   └── utils/
│       ├── __init__.py
│       ├── auth.py          # JWT utilities
│       └── helpers.py       # Helper functions
├── server.py                 # Legacy WebSocket server
├── requirements.txt
└── README.md
```

## Setup

```bash
cd backend
pip install -r requirements.txt
python -m app.main
```

## Tech Stack

- FastAPI - Web framework
- WebSockets - Real-time communication
- Paho MQTT - IoT communication
- TensorFlow - AI model
- SQLAlchemy - ORM (optional)
