#include <Arduino.h>
#include <Wire.h>
#include "MAX30105.h"
#include "heartRate.h"

// ==========================================
// 1. DEFINISI PIN & VARIABEL MAX30102 (Oximeter)
// ==========================================
MAX30105 particleSensor;
#define I2C_SDA 21 // Pin SDA Default
#define I2C_SCL 22 // Pin SCL Default

const byte RATE_SIZE = 4; 
byte rates[RATE_SIZE];    
byte rateSpot = 0;
long lastBeat = 0;        
float beatsPerMinute = 0;
int beatAvg = 0;

// ==========================================
// 2. DEFINISI PIN & VARIABEL AD8232 (ECG)
// ==========================================
// Kita gunakan pin aman (VP, RX2, TX2) agar tidak konflik
#define ECG_PIN   2 
#define LO_MINUS  4 
#define LO_PLUS   5 
int ecgValue = 0;

// ==========================================
// 3. TIMER UNTUK SERIAL OUTPUT
// ==========================================
// Kita tidak boleh pakai delay(), jadi pakai timer millis()
unsigned long lastReportTime = 0; 

void setup() {
  Serial.begin(115200);
  
  // --- Setup I2C & MAX30102 ---
  Wire.begin(I2C_SDA, I2C_SCL);
  
  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
    Serial.println("MAX30102 tidak ditemukan. Cek kabel.");
    while (1);
  }
  
  // Konfigurasi MAX30102 (Anti-Saturasi/Low Power)
  byte ledBrightness = 20; 
  byte sampleAverage = 4; 
  byte ledMode = 2; 
  int sampleRate = 100; 
  int pulseWidth = 411; 
  int adcRange = 4096; 
  particleSensor.setup(ledBrightness, sampleAverage, ledMode, sampleRate, pulseWidth, adcRange);
  particleSensor.setPulseAmplitudeRed(0x0A);
  particleSensor.setPulseAmplitudeGreen(0);

  // --- Setup AD8232 (ECG) ---
  pinMode(ECG_PIN, INPUT);
  pinMode(LO_MINUS, INPUT);
  pinMode(LO_PLUS, INPUT);

  Serial.println("Sistem Terintegrasi (ECG + BPM) Siap...");
}

void loop() {
  // -----------------------------------------------------------
  // BAGIAN A: BACA MAX30102 (Harus dieksekusi secepat mungkin)
  // -----------------------------------------------------------
  long irValue = particleSensor.getIR();

  if (irValue > 50000) { // Jika ada jari
    if (checkForBeat(irValue) == true) {
      long delta = millis() - lastBeat;
      lastBeat = millis();
      beatsPerMinute = 60 / (delta / 1000.0);

      if (beatsPerMinute < 255 && beatsPerMinute > 20) {
        rates[rateSpot++] = (byte)beatsPerMinute;
        rateSpot %= RATE_SIZE;
        beatAvg = 0;
        for (byte x = 0 ; x < RATE_SIZE ; x++) beatAvg += rates[x];
        beatAvg /= RATE_SIZE;
      }
    }
  } else {
    beatAvg = 0; // Reset jika jari dilepas
    beatsPerMinute = 0;
  }

  // -----------------------------------------------------------
  // BAGIAN B: BACA AD8232 (ECG)
  // -----------------------------------------------------------
  if ((digitalRead(LO_MINUS) == 1) || (digitalRead(LO_PLUS) == 1)) {
    ecgValue = 0; // Leads Off (Kabel lepas)
  } else {
    ecgValue = analogRead(ECG_PIN); // Baca gelombang jantung
  }

  // -----------------------------------------------------------
  // BAGIAN C: TAMPILKAN DATA (SERIAL PLOTTER FRIENDLY)
  // -----------------------------------------------------------
  // Kita update output setiap 20ms (50Hz) agar grafik ECG terlihat mulus
  // tapi tidak terlalu membebani MAX30102
  
  if (millis() - lastReportTime > 20) {
    // Format: Label:Nilai (Spasi) Label:Nilai
    // Ini bisa dibaca Serial Monitor biasa DAN Serial Plotter
    
    Serial.print("ECG:");
    Serial.print(ecgValue);
    
    Serial.print(" BPM:");
    Serial.print(beatAvg);
    
    // Opsional: Tampilkan IR untuk debug posisi jari
    // Serial.print(" IR:");
    // Serial.print(irValue); 
    
    Serial.println(); // Baris baru
    
    lastReportTime = millis();
  }
}