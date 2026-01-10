# NeuroRehab Backend

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
