#define LO_PLUS 27
#define LO_MINUS 14
#define ECG_PIN 34   

// source : https://how2electronics.com/ecg-monitoring-with-ad8232-ecg-sensor-arduino/

void setup() {
  Serial.begin(9600);

  pinMode(LO_PLUS, INPUT);
  pinMode(LO_MINUS, INPUT);
}

void loop() {

  if (digitalRead(LO_PLUS) == HIGH || digitalRead(LO_MINUS) == HIGH) {
    Serial.println("!");
  }
  else {
    int ecgValue = analogRead(ECG_PIN);
    Serial.println(ecgValue);
  }

  delay(1);
}
