#include "MAX30105.h"
#include "addons/RTDBHelper.h"
#include "addons/TokenHelper.h"
#include "config.h"
#include <Arduino.h>
#include <Firebase_ESP_Client.h>
#include <WiFi.h>
#include <Wire.h>

// Firebase objects
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

MAX30105 particleSensor;

// ✅ PIN ALTERNATIF YANG BERHASIL (tidak bentrok dengan ECG!)
#define I2C_SDA 14 // PIN BARU!
#define I2C_SCL 27 // PIN BARU!

// Pin untuk sensor lain (sesuaikan dengan extension Anda)
const int ECG_PIN = 35;  // Bisa pakai GPIO 22/23 di extension sekarang!
const int FLEX_PIN = 34; // Analog pin

// ============= Signal Processing =============
float irDC = 0, redDC = 0;
const float DC_ALPHA = 0.995f;

float irAC = 0, redAC = 0;
const float AC_ALPHA = 0.90f;

float irFiltered = 0;
const float BEAT_ALPHA = 0.75f;
float beatEnvelope = 0;
const float ENV_ALPHA = 0.985f;

float prevSample = 0, currSample = 0;
bool wasRising = false;
unsigned long lastBeatTime = 0;

// BPM Calculation (increased samples for stability)
const int BPM_SAMPLES = 6;
unsigned long beatIntervals[BPM_SAMPLES] = {0};
int beatIndex = 0;
int beatCount = 0;
float bpm = 0;
float bpmSmoothed = 0;

// SpO2 Calculation
float irACSum = 0, redACSum = 0;
float irACSumSq = 0, redACSumSq = 0;
int acSampleCount = 0;

const int SPO2_SAMPLES = 8;
float spo2Buffer[SPO2_SAMPLES] = {0};
int spo2Index = 0;
int spo2Count = 0;
float spo2 = 0;
float lastR = 0;

const unsigned long MIN_BEAT_INTERVAL = 300;
const unsigned long MAX_BEAT_INTERVAL = 2000;
const unsigned long BEAT_TIMEOUT = 3000;

// Firebase timing
unsigned long lastFirebaseSend = 0;
bool wifiConnected = false;
bool firebaseReady = false;

void resetAll();

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n╔═══════════════════════════════════════════════╗");
  Serial.println("║   MAX30102 Monitor - PIN ALTERNATIF!          ║");
  Serial.println("╚═══════════════════════════════════════════════╝\n");

  Serial.println("✅ Pin Configuration:");
  Serial.printf("   MAX30102 SDA → GPIO %d\n", I2C_SDA);
  Serial.printf("   MAX30102 SCL → GPIO %d\n", I2C_SCL);
  Serial.println("   (ECG & Flex sekarang bisa pakai pin lain!)\n");

  // ============= WiFi Setup =============
  Serial.println("🌐 Connecting to WiFi...");
  Serial.printf("   SSID: %s\n", WIFI_SSID);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int wifiAttempts = 0;
  while (WiFi.status() != WL_CONNECTED && wifiAttempts < 20) {
    delay(500);
    Serial.print(".");
    wifiAttempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    wifiConnected = true;
    Serial.println("\n✅ WiFi Connected!");
    Serial.printf("   IP Address: %s\n\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println("\n❌ WiFi Connection Failed!");
    Serial.println("   Continuing without Firebase...\n");
  }

  // ============= Firebase Setup =============
  if (wifiConnected) {
    Serial.println("🔥 Initializing Firebase...");

    config.database_url = FIREBASE_HOST;
    config.signer.tokens.legacy_token = FIREBASE_AUTH;

    Firebase.begin(&config, &auth);
    Firebase.reconnectWiFi(true);

    firebaseReady = true;
    Serial.println("✅ Firebase Ready!\n");
  }

  // ============= MAX30102 Setup =============
  Wire.begin(I2C_SDA, I2C_SCL);

  if (!particleSensor.begin(Wire, I2C_SPEED_STANDARD)) {
    Serial.println("❌ MAX30102 not found! Check wiring to GPIO 14 & 27");
    while (1)
      delay(100);
  }

  Serial.println("✅ MAX30102 detected successfully!");
  Serial.println("🎉 Extension compatibility achieved!\n");

  particleSensor.setup(0x3F, 4, 2, 100, 411, 4096);
  particleSensor.clearFIFO();

  lastBeatTime = millis();
  Serial.println("📊 Place finger gently on sensor...\n");
}

void loop() {
  // ============= READ ALL SENSORS INDEPENDENTLY =============

  // Read ECG and Flex sensors (always active)
  int ecgVal = analogRead(ECG_PIN);
  int flexVal = analogRead(FLEX_PIN);

  // Read MAX30102 (optional, continues even if no finger)
  uint32_t irRaw = particleSensor.getIR();
  uint32_t redRaw = particleSensor.getRed();

  if (irRaw == 0 && redRaw == 0) {
    particleSensor.check();
  }

  // Check if finger is present on MAX30102
  bool fingerDetected = (irRaw >= 50000);

  // If no finger, reset MAX30102 values but DON'T stop ECG/Flex reading
  if (!fingerDetected) {
    resetAll();
    static unsigned long lastPrint = 0;
    if (millis() - lastPrint > 2000) {
      Serial.println(
          "⚠️  MAX30102: No Finger Detected (ECG & Flex still active)");
      lastPrint = millis();
    }
    // Don't return - continue to print ECG and Flex values
  }

  // ============= PROCESS MAX30102 ONLY IF FINGER DETECTED =============
  if (fingerDetected) {
    // Initialize DC
    if (irDC == 0) {
      irDC = irRaw;
      redDC = redRaw;
    }

    // DC baseline tracking
    irDC = irDC * DC_ALPHA + irRaw * (1.0f - DC_ALPHA);
    redDC = redDC * DC_ALPHA + redRaw * (1.0f - DC_ALPHA);

    // AC component
    float irACRaw = (float)irRaw - irDC;
    float redACRaw = (float)redRaw - redDC;

    irAC = irAC * AC_ALPHA + irACRaw * (1.0f - AC_ALPHA);
    redAC = redAC * AC_ALPHA + redACRaw * (1.0f - AC_ALPHA);

    irACSum += irAC;
    redACSum += redAC;
    irACSumSq += irAC * irAC;
    redACSumSq += redAC * redAC;
    acSampleCount++;

    // Beat detection
    irFiltered = irFiltered * BEAT_ALPHA + irACRaw * (1.0f - BEAT_ALPHA);

    beatEnvelope = beatEnvelope * ENV_ALPHA;
    if (fabs(irFiltered) > beatEnvelope) {
      beatEnvelope = fabs(irFiltered);
    }

    float threshold =
        beatEnvelope * 0.4f; // Increased for more reliable detection
    if (threshold < 150)
      threshold = 150;

    prevSample = currSample;
    currSample = irFiltered;

    bool isRising = currSample > prevSample;
    bool isPeak = wasRising && !isRising && currSample > threshold;
    wasRising = isRising;

    unsigned long now = millis();
    unsigned long interval = now - lastBeatTime;

    if (isPeak && interval >= MIN_BEAT_INTERVAL) {
      lastBeatTime = now;

      if (interval <= MAX_BEAT_INTERVAL) {
        beatIntervals[beatIndex] = interval;
        beatIndex = (beatIndex + 1) % BPM_SAMPLES;
        if (beatCount < BPM_SAMPLES)
          beatCount++;

        if (beatCount >= 2) {
          unsigned long sum = 0;
          for (int i = 0; i < beatCount; i++)
            sum += beatIntervals[i];
          bpm = 60000.0f / ((float)sum / beatCount);
          bpmSmoothed =
              (bpmSmoothed == 0) ? bpm : (bpmSmoothed * 0.7f + bpm * 0.3f);
        }

        if (acSampleCount > 10) {
          float irRMS = sqrt(irACSumSq / acSampleCount);
          float redRMS = sqrt(redACSumSq / acSampleCount);

          if (irRMS > 10 && redRMS > 10 && irDC > 10000 && redDC > 10000) {
            float R = (redRMS / redDC) / (irRMS / irDC);
            lastR = R;

            float spo2Calc = 104.0f - 17.0f * R;
            spo2Calc = constrain(spo2Calc, 85, 100);

            spo2Buffer[spo2Index] = spo2Calc;
            spo2Index = (spo2Index + 1) % SPO2_SAMPLES;
            if (spo2Count < SPO2_SAMPLES)
              spo2Count++;

            float sum = 0;
            for (int i = 0; i < spo2Count; i++)
              sum += spo2Buffer[i];
            spo2 = sum / spo2Count;
          }
        }
      }

      irACSum = redACSum = 0;
      irACSumSq = redACSumSq = 0;
      acSampleCount = 0;
    }

    if (interval > BEAT_TIMEOUT) {
      bpmSmoothed = 0;
      beatCount = 0;
      lastBeatTime = now;
      irACSum = redACSum = 0;
      irACSumSq = redACSumSq = 0;
      acSampleCount = 0;
    }
  } // End of fingerDetected block

  // ============= ALWAYS OUTPUT ALL SENSOR VALUES =============
  // Output every 25 samples (~250ms) - ECG and Flex always shown
  static int printCounter = 0;
  if (++printCounter >= 25) {
    printCounter = 0;

    Serial.print("💓 BPM: ");
    Serial.print(fingerDetected ? bpmSmoothed : 0.0, 1);
    Serial.print(" | 🫁 SpO2: ");
    Serial.print(fingerDetected ? spo2 : 0.0, 1);
    Serial.print("% | 📊 ECG: ");
    Serial.print(ecgVal);
    Serial.print(" | 🤏 Flex: ");
    Serial.println(flexVal);
  }

  // ============= SEND TO FIREBASE =============
  if (firebaseReady &&
      (millis() - lastFirebaseSend >= FIREBASE_UPDATE_INTERVAL)) {
    lastFirebaseSend = millis();

    // Get current timestamp (milliseconds since boot)
    unsigned long timestamp = millis();

    int bpmValue = fingerDetected ? (int)bpmSmoothed : 0;
    int spo2Value = fingerDetected ? (int)spo2 : 0;

    // ============= UPDATE FIREBASE FIELDS INDIVIDUALLY =============
    // Only update fields with valid values, keep old values if invalid

    bool sentAnyData = false;

    // Update BPM if not 0
    if (bpmValue != 0) {
      if (Firebase.RTDB.setInt(&fbdo, String(FIREBASE_PATH_LATEST) + "/bpm",
                               bpmValue)) {
        sentAnyData = true;
      }
    }

    // Update SpO2 if not 0
    if (spo2Value != 0) {
      if (Firebase.RTDB.setInt(&fbdo, String(FIREBASE_PATH_LATEST) + "/spo2",
                               spo2Value)) {
        sentAnyData = true;
      }
    }

    // Update ECG if not 0 and not 4095 (disconnected)
    if (ecgVal != 0 && ecgVal != 4095) {
      if (Firebase.RTDB.setInt(&fbdo, String(FIREBASE_PATH_LATEST) + "/ecg",
                               ecgVal)) {
        sentAnyData = true;
      }
    }

    // Update Flex if not 0
    if (flexVal != 0) {
      if (Firebase.RTDB.setInt(&fbdo, String(FIREBASE_PATH_LATEST) + "/flex",
                               flexVal)) {
        sentAnyData = true;
      }
    }

    // Always update timestamp
    Firebase.RTDB.setInt(&fbdo, String(FIREBASE_PATH_LATEST) + "/ts_ms",
                         (int)timestamp);

    if (sentAnyData) {
      Serial.println("📤 Firebase: Updated valid fields");

      // Also save to history if any valid data was sent
      FirebaseJson json;
      if (bpmValue != 0)
        json.set("bpm", bpmValue);
      if (spo2Value != 0)
        json.set("spo2", spo2Value);
      if (ecgVal != 0 && ecgVal != 4095)
        json.set("ecg", ecgVal);
      if (flexVal != 0)
        json.set("flex", flexVal);
      json.set("ts_ms", timestamp);

      String historyPath =
          String(FIREBASE_PATH_HISTORY) + "/" + String(timestamp);
      Firebase.RTDB.setJSON(&fbdo, historyPath.c_str(), &json);
    } else {
      Serial.println("⚠️  Firebase: No valid data to update");
    }
  }
}

void resetAll() {
  irDC = redDC = 0;
  irAC = redAC = 0;
  irFiltered = 0;
  beatEnvelope = 0;
  prevSample = currSample = 0;
  wasRising = false;
  bpm = bpmSmoothed = 0;
  beatCount = 0;
  spo2 = 0;
  spo2Count = 0;
  lastR = 0;
  irACSum = redACSum = 0;
  irACSumSq = redACSumSq = 0;
  acSampleCount = 0;
}
