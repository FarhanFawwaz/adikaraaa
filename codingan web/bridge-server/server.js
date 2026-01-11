import { WebSocketServer } from 'ws';
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// ============= FIREBASE SETUP =============
// NOTE: User harus download Service Account Key dari Firebase Console
// https://console.firebase.google.com/project/adikara-8fedf/settings/serviceaccounts/adminsdk
// Simpan sebagai 'firebase-service-account.json' di folder ini

let firebaseApp;
let database;

try {
  // Import service account key
  const serviceAccount = await import('./firebase-service-account.json', {
    assert: { type: 'json' }
  });

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount.default),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });

  database = admin.database();
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error.message);
  console.log('\n⚠️  Please download your Firebase Service Account Key:');
  console.log('1. Go to: https://console.firebase.google.com/project/adikara-8fedf/settings/serviceaccounts/adminsdk');
  console.log('2. Click "Generate New Private Key"');
  console.log('3. Save as "firebase-service-account.json" in bridge-server folder\n');
  process.exit(1);
}

// ============= WEBSOCKET SERVER SETUP =============
const WS_PORT = process.env.WS_PORT || 8080;
const wss = new WebSocketServer({ port: WS_PORT });

let connectedClients = new Set();
let latestSensorData = {
  ecg: null,
  flex: null,
  vitals: null
};

console.log(`🚀 WebSocket Server started on ws://localhost:${WS_PORT}`);

// ============= WEBSOCKET CONNECTION HANDLER =============
wss.on('connection', (ws, req) => {
  const clientIp = req.socket.remoteAddress;
  console.log(`📱 New client connected: ${clientIp}`);
  connectedClients.add(ws);

  // Send info message
  ws.send(JSON.stringify({
    type: 'info',
    message: 'Connected to NeuroRehab Bridge Server'
  }));

  // Send latest cached data if available
  if (latestSensorData.vitals) {
    ws.send(JSON.stringify(latestSensorData.vitals));
  }
  if (latestSensorData.ecg) {
    ws.send(JSON.stringify(latestSensorData.ecg));
  }
  if (latestSensorData.flex) {
    ws.send(JSON.stringify(latestSensorData.flex));
  }

  ws.on('close', () => {
    console.log(`📴 Client disconnected: ${clientIp}`);
    connectedClients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error(`⚠️  WebSocket error from ${clientIp}:`, error.message);
    connectedClients.delete(ws);
  });
});

// ============= FIREBASE REALTIME DATABASE LISTENER =============
const firebasePath = process.env.FIREBASE_PATH_LATEST || '/device1/latest';
const dataRef = database.ref(firebasePath);

console.log(`👂 Listening to Firebase path: ${firebasePath}`);

// Listen for changes to sensor data
dataRef.on('value', (snapshot) => {
  const data = snapshot.val();
  
  if (!data) {
    console.log('⚠️  No data in Firebase');
    return;
  }

  const timestamp = data.ts_ms || Date.now();
  
  // Process and broadcast ECG data
  if (data.ecg !== undefined) {
    const ecgMessage = {
      type: 'ecg',
      value: data.ecg,
      timestamp: timestamp
    };
    latestSensorData.ecg = ecgMessage;
    broadcast(ecgMessage);
  }

  // Process and broadcast Flex data
  if (data.flex !== undefined) {
    const flexMessage = {
      type: 'flex',
      value: data.flex,
      timestamp: timestamp
    };
    latestSensorData.flex = flexMessage;
    broadcast(flexMessage);
  }

  // Process and broadcast Vitals (BPM & SpO2)
  if (data.bpm !== undefined || data.spo2 !== undefined) {
    const vitalsMessage = {
      type: 'vitals',
      bpm: data.bpm || 0,
      spo2: data.spo2 || 0,
      fingerDetected: (data.bpm > 0 && data.spo2 > 0),
      timestamp: timestamp
    };
    latestSensorData.vitals = vitalsMessage;
    broadcast(vitalsMessage);
  }

  // Log summary
  console.log(`📊 Data update: BPM=${data.bpm || 0}, SpO2=${data.spo2 || 0}%, ECG=${data.ecg || 0}, Flex=${data.flex || 0} | Clients: ${connectedClients.size}`);
}, (error) => {
  console.error('❌ Firebase listener error:', error);
  
  // Broadcast error to clients
  broadcast({
    type: 'error',
    message: 'Firebase connection error: ' + error.message
  });
});

// ============= BROADCAST FUNCTION =============
function broadcast(message) {
  const messageStr = JSON.stringify(message);
  
  connectedClients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      try {
        client.send(messageStr);
      } catch (error) {
        console.error('Failed to send to client:', error.message);
        connectedClients.delete(client);
      }
    }
  });
}

// ============= GRACEFUL SHUTDOWN =============
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  
  // Close all WebSocket connections
  connectedClients.forEach((client) => {
    client.close(1000, 'Server shutting down');
  });
  
  // Close WebSocket server
  wss.close(() => {
    console.log('✅ WebSocket server closed');
    process.exit(0);
  });
});

console.log('\n✅ Bridge Server Ready!');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`📡 WebSocket: ws://localhost:${WS_PORT}`);
console.log(`🔥 Firebase: ${firebasePath}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
