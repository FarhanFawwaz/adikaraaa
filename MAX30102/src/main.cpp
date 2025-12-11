#include <Arduino.h>
#include <Wire.h>
#include "MAX30105.h"
#include "heartRate.h"

// --- Definisi Pin AD8232 (ECG) ---
// CATATAN: Pin 19 pada beberapa board ESP32 bukan pin ADC yang ideal. 
// Jika grafik ECG garis lurus, ganti ke GPIO 32, 33, 34, atau 35.
#ifdef ESP32
  const int AD8232_PIN = 25; // SAYA SARANKAN PIN 32 (ADC1) DARIPADA 19
  const int LO_PLUS = 32;
  const int LO_MINUS =33;
  
  // Definisi Pin I2C ESP32
  const int I2C_SDA_PIN = 35; 
  const int I2C_SCL_PIN = 34;
#else
  const int AD8232_PIN = A0;
  const int LO_PLUS = 10;
  const int LO_MINUS = 11;
#endif

MAX30105 particleSensor;

const byte RATE_SIZE = 4; 
byte rates[RATE_SIZE]; 
byte rateSpot = 0;
long lastBeat = 0; 
float beatsPerMinute;
int beatAvg;

void setup() {
  Serial.begin(115200);
  Serial.println("Inisialisasi Sensor...");

  pinMode(LO_PLUS, INPUT);
  pinMode(LO_MINUS, INPUT);

  // --- PERBAIKAN UTAMA DISINI ---
  // Kita paksa ESP32 menggunakan pin 21 dan 22
  #ifdef ESP32
    Wire.begin(I2C_SDA_PIN, I2C_SCL_PIN);
  #else
    Wire.begin();
  #endif
  
  // Beri sedikit waktu agar power sensor stabil
  delay(100);

  // Gunakan Wire yang sudah di-init di atas
  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
    Serial.println("MAX30102 tidak ditemukan. Cek wiring/daya!");
    Serial.println("Device ditemukan di I2C tapi MAX30102 tidak respond.");
    Serial.println("Kemungkinan:");
    Serial.println("- Sensor rusak atau address salah");
    Serial.println("- Pin SDA/SCL terbalik");
    Serial.println("- Tegangan power tidak stabil");
    // Loop error blink atau pesan berulang agar user sadar
    while (1) {
      Serial.println("Error: Sensor I2C Error 263 / Not Found");
      delay(1000);
    }
  }
  
  Serial.println("MAX30102 Ditemukan!");
  
  particleSensor.setup(); 
  particleSensor.setPulseAmplitudeRed(0x0A); 
  particleSensor.setPulseAmplitudeGreen(0); 
}

void loop() {
  long irValue = particleSensor.getIR();

  if (irValue > 50000) {
    if (checkForBeat(irValue) == true) {
      long delta = millis() - lastBeat;
      lastBeat = millis();

      beatsPerMinute = 60 / (delta / 1000.0);

      if (beatsPerMinute < 255 && beatsPerMinute > 20) {
        rates[rateSpot++] = (byte)beatsPerMinute; 
        rateSpot %= RATE_SIZE; 

        beatAvg = 0;
        for (byte x = 0 ; x < RATE_SIZE ; x++)
          beatAvg += rates[x];
        beatAvg /= RATE_SIZE;
      }
    }
  } else {
    beatAvg = 0; 
  }

  int ecgValue = 0;
  if ((digitalRead(LO_PLUS) == 1) || (digitalRead(LO_MINUS) == 1)) {
    ecgValue = 512; 
  } else {
    ecgValue = analogRead(AD8232_PIN);
  }

  Serial.print("ECG:");
  Serial.print(ecgValue);
  Serial.print(",");
  Serial.print("BPM:");
  Serial.print(beatAvg);
  Serial.println();
  
  delay(20); 
}