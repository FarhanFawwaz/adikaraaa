#include <Arduino.h>
#include <Wire.h>
#include "MAX30105.h"

// ==========================================
// 1. KONFIGURASI PIN (FULL SISI KIRI ESP32)
// ==========================================

// --- A. SENSOR MAX30102 ---
MAX30105 particleSensor;
#define I2C_SDA 32  // Pin 32 (Sisi Kiri)
#define I2C_SCL 33  // Pin 33 (Sisi Kiri)

// --- B. SENSOR FLEX ---
// Menggunakan Pin 34 (Input Only - ADC1) -> Sisi Kiri
const int FLEX_PIN = 34;    

// --- C. SENSOR ECG (AD8232) ---
// Output Analog ke Pin 35 (Input Only - ADC1) -> Sisi Kiri
const int ECG_PIN = 35;      
// Deteksi Kabel Lepas (LO+/LO-) pindah ke Pin 25 & 26 -> Sisi Kiri
const int LO_PLUS = 25;     
const int LO_MINUS = 26;    

// ==========================================
// 2. VARIABEL SIGNAL PROCESSING (MAX30102)
// ==========================================
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

// BPM Variables
const int BPM_SAMPLES = 4;
unsigned long beatIntervals[BPM_SAMPLES] = {0};
int beatIndex = 0;
int beatCount = 0;
float bpm = 0;
float bpmSmoothed = 0;

// SpO2 Variables
float irACSum = 0, redACSum = 0;
float irACSumSq = 0, redACSumSq = 0;
int acSampleCount = 0;
const int SPO2_SAMPLES = 8;
float spo2Buffer[SPO2_SAMPLES] = {0};
int spo2Index = 0;
int spo2Count = 0;
float spo2 = 0;
float lastR = 0;

// Timeout Constants
const unsigned long MIN_BEAT_INTERVAL = 300; 
const unsigned long MAX_BEAT_INTERVAL = 2000; 
const unsigned long BEAT_TIMEOUT = 3000;

// Prototype
void resetAll(); 

// ==========================================
// 3. SETUP
// ==========================================
void setup() {
  Serial.begin(115200);

  // --- Setup ECG ---
  pinMode(LO_PLUS, INPUT);
  pinMode(LO_MINUS, INPUT);
  // Pin 34 & 35 otomatis jadi Input Analog

  // --- Setup MAX30102 ---
  Wire.begin(I2C_SDA, I2C_SCL); // Start I2C di Pin 32 & 33
  Wire.setClock(100000);        // 100kHz agar stabil

  if (!particleSensor.begin(Wire, I2C_SPEED_STANDARD)) { 
    Serial.println("MAX30102 TIDAK DITEMUKAN!");
    Serial.println("Cek Kabel: SDA->32, SCL->33");
  } else {
    // Setup parameter (Brightness 0x1F agar tidak saturasi)
    particleSensor.setup(0x1F, 4, 2, 100, 411, 4096); 
    particleSensor.clearFIFO();
    Serial.println("MAX30102 Ready (Pin 32/33).");
  }
  
  lastBeatTime = millis();
  Serial.println("System Ready: Semua Sensor di Sisi Kiri ESP32");
}

// ==========================================
// 4. LOOP UTAMA
// ==========================================
void loop() {
  // ----------------------------------------
  // A. LOGIKA MAX30102
  // ----------------------------------------
  if (particleSensor.getIR() == 0) { 
      particleSensor.check(); 
  }

  uint32_t irRaw = particleSensor.getIR();
  uint32_t redRaw = particleSensor.getRed();

  // Deteksi jari
  if (irRaw < 50000) {
    resetAll();
  } else {
    // Proses Signal Processing (JIKA ADA JARI)
    if (irDC == 0) { irDC = irRaw; redDC = redRaw; }
    
    irDC = irDC * DC_ALPHA + irRaw * (1.0f - DC_ALPHA);
    redDC = redDC * DC_ALPHA + redRaw * (1.0f - DC_ALPHA);
    
    float irACRaw = (float)irRaw - irDC;
    float redACRaw = (float)redRaw - redDC;
    irAC = irAC * AC_ALPHA + irACRaw * (1.0f - AC_ALPHA);
    redAC = redAC * AC_ALPHA + redACRaw * (1.0f - AC_ALPHA);
    
    irACSum += irAC; redACSum += redAC;
    irACSumSq += irAC * irAC; redACSumSq += redAC * redAC;
    acSampleCount++;

    irFiltered = irFiltered * BEAT_ALPHA + irACRaw * (1.0f - BEAT_ALPHA);
    beatEnvelope = beatEnvelope * ENV_ALPHA;
    if (fabs(irFiltered) > beatEnvelope) beatEnvelope = fabs(irFiltered);
    
    float threshold = beatEnvelope * 0.3f;
    if (threshold < 100) threshold = 100; 
    
    prevSample = currSample; currSample = irFiltered;
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
        if (beatCount < BPM_SAMPLES) beatCount++;
        
        if (beatCount >= 2) {
          unsigned long sum = 0;
          for (int i = 0; i < beatCount; i++) sum += beatIntervals[i];
          bpm = 60000.0f / ((float)sum / beatCount);
          if (bpmSmoothed == 0) bpmSmoothed = bpm;
          else bpmSmoothed = bpmSmoothed * 0.7f + bpm * 0.3f;
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
            if (spo2Count < SPO2_SAMPLES) spo2Count++;
            float sum = 0;
            for (int i = 0; i < spo2Count; i++) sum += spo2Buffer[i];
            spo2 = sum / spo2Count;
          }
        }
      }
      irACSum = redACSum = 0; irACSumSq = redACSumSq = 0; acSampleCount = 0;
    }
    
    if (interval > BEAT_TIMEOUT) {
      bpmSmoothed = 0; beatCount = 0; lastBeatTime = now;
      irACSum = redACSum = 0; irACSumSq = redACSumSq = 0; acSampleCount = 0;
    }
  }

  // ----------------------------------------
  // B. BACA SENSOR & PRINT (Format Teleplot)
  // ----------------------------------------
  static int printCounter = 0;
  if (++printCounter >= 5) { 
    printCounter = 0;

    // 1. Baca ECG (Pin 35) & LO (25/26)
    int ecgValue = 0;
    if ((digitalRead(LO_PLUS) == 1) || (digitalRead(LO_MINUS) == 1)) {
      ecgValue = 2048; // Garis lurus jika lepas
    } else {
      ecgValue = analogRead(ECG_PIN);
    }

    // 2. Baca Flex (Pin 34)
    int flexValue = analogRead(FLEX_PIN);

    // 3. Print Format Teleplot (>LABEL:VALUE)
    Serial.print(">ECG:"); Serial.println(ecgValue);
    Serial.print(">FLEX:"); Serial.println(flexValue);
    
    if (irRaw > 50000) {
        Serial.print(">BPM:"); Serial.println(bpmSmoothed);
        Serial.print(">SPO2:"); Serial.println(spo2);
    } else {
        Serial.print(">BPM:"); Serial.println(0);
        Serial.print(">SPO2:"); Serial.println(0);
    }
  }
}

// ==========================================
// 5. FUNGSI RESET
// ==========================================
void resetAll() {
  irDC = redDC = 0; irAC = redAC = 0; irFiltered = 0; beatEnvelope = 0;
  prevSample = currSample = 0; wasRising = false;
  bpm = bpmSmoothed = 0; beatCount = 0;
  spo2 = 0; spo2Count = 0; lastR = 0;
  irACSum = redACSum = 0; irACSumSq = redACSumSq = 0; acSampleCount = 0;
}