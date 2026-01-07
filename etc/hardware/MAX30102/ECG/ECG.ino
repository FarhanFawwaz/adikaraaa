#include <Arduino.h>

// --- KONFIGURASI PIN TERBAIK UNTUK ESP32 ---
#define SENSOR_PIN 2  // Pin VP (Analog Input paling sensitif & bersih)
#define LO_MINUS   4  // Pin RX2 (Leads Off -)
#define LO_PLUS    5  // Pin TX2 (Leads Off +)

void setup() {
  // Gunakan 115200 agar data real-time dan mulus
  Serial.begin(115200); 
  
  pinMode(SENSOR_PIN, INPUT);
  pinMode(LO_MINUS, INPUT);
  pinMode(LO_PLUS, INPUT);
  
  Serial.println("Sistem EKG Siap...");
}

void loop() {
  // Cek apakah sensor lepas (Leads Off Detection)
  if ((digitalRead(LO_MINUS) == 1) || (digitalRead(LO_PLUS) == 1)) {
    // Jika lepas, kirim angka 0. 
    // Ini membuat grafik di Serial Plotter menjadi garis datar di bawah.
    Serial.println(0); 
  } else {
    // Jika sensor menempel, baca data analog dari pin 36
    Serial.println(analogRead(SENSOR_PIN));
  }
  
  // Delay 10ms sudah cukup cepat (100Hz) untuk EKG, 
  // delay(1) terlalu cepat dan bisa membanjiri serial plotter.
  delay(1000);
}