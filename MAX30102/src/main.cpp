#include <Arduino.h>

// ==========================================
// KONFIGURASI PIN (FINAL)
// ==========================================

// 1. PIN ECG (AD8232)
// Output sensor masuk ke GPIO 4
const int ECG_PIN = 4;      

// Pin Deteksi Lepas (Leads Off)
// LO+ ke GPIO 19, LO- ke GPIO 18
const int LO_PLUS = 19;
const int LO_MINUS = 18;

// 2. PIN FLEX SENSOR
// Output rangkaian pembagi tegangan masuk ke GPIO 15
const int FLEX_PIN = 15;    

void setup() {
  // Wajib 115200 agar Teleplot lancar
  Serial.begin(115200);
  
  // Konfigurasi Pin Digital untuk deteksi kabel lepas
  pinMode(LO_PLUS, INPUT);
  pinMode(LO_MINUS, INPUT);
  
  // Pin Analog (4 dan 15) tidak perlu disetting pinMode-nya
  
  Serial.println("System Ready: Mulai Membaca Data...");
}

void loop() {
  // --- BAGIAN 1: BACA SENSOR ECG ---
  int ecgValue = 0;
  
  // Cek logika Leads Off (Kabel Lepas)
  // Jika Pin 19 ATAU 18 bernilai 1, berarti pad tidak nempel di kulit
  if ((digitalRead(LO_PLUS) == 1) || (digitalRead(LO_MINUS) == 1)) {
    // Kunci nilai di tengah (2048) agar grafik jadi garis lurus
    ecgValue = 2048; 
  } else {
    // Jika nempel, baca sinyal jantung sebenarnya
    ecgValue = analogRead(ECG_PIN); 
  }

  // --- BAGIAN 2: BACA FLEX SENSOR ---
  // Baca kelengkungan jari dari Pin 15
  int flexValue = analogRead(FLEX_PIN);

  // --- BAGIAN 3: KIRIM KE TELEPLOT ---
  // Format Wajib Teleplot: ">NamaVariabel:Nilai"
  
  // Kirim data ECG (Grafik 1)
  Serial.print(">ECG:");
  Serial.println(ecgValue);
  
  // Kirim data Flex (Grafik 2)
  Serial.print(">FLEX:");
  Serial.println(flexValue);

  // --- PENGATURAN KECEPATAN ---
  // Sebelumnya: delay(10); -> Terlalu cepat
  // Sekarang: delay(30);   -> Sedang (Aman untuk ECG)
  
  // CATATAN: Jangan ubah ini lebih besar dari 50, 
  // nanti grafik detak jantung jadi hilang puncaknya.
  delay(1000); 
}