#define LO_PLUS 27
#define LO_MINUS 14
#define ECG_PIN 34

void setup() {
  Serial.begin(115200);
}

void loop() {
  int loPlus  = digitalRead(LO_PLUS);
  int loMinus = digitalRead(LO_MINUS);
  int ecg     = analogRead(ECG_PIN);

  Serial.print("LO+ = ");
  Serial.print(loPlus);
  Serial.print(" | LO- = ");
  Serial.print(loMinus);
  Serial.print(" | ECG = ");
  Serial.print(ecg);
  Serial.print(" | Status: ");

  if (loPlus == 1 || loMinus == 1)
    Serial.println("LEADS OFF");
  else
    Serial.println("LEADS ON");

  delay(200);
}
