"""
MQTT Service
Handles communication with ESP32 via MQTT
"""
import json
from typing import Callable, Optional
import paho.mqtt.client as mqtt
from app.config import settings


class MQTTService:
    """MQTT Service for IoT communication"""
    
    def __init__(self):
        self.client: Optional[mqtt.Client] = None
        self.is_connected = False
        self.callbacks = {}
    
    def connect(self) -> bool:
        """Connect to MQTT broker"""
        try:
            self.client = mqtt.Client()
            self.client.on_connect = self._on_connect
            self.client.on_message = self._on_message
            self.client.on_disconnect = self._on_disconnect
            
            self.client.connect(
                settings.MQTT_BROKER,
                settings.MQTT_PORT,
                keepalive=60
            )
            self.client.loop_start()
            return True
        except Exception as e:
            print(f"[MQTTService] Connection failed: {e}")
            return False
    
    def disconnect(self):
        """Disconnect from MQTT broker"""
        if self.client:
            self.client.loop_stop()
            self.client.disconnect()
            self.is_connected = False
    
    def _on_connect(self, client, userdata, flags, rc):
        """Callback when connected"""
        if rc == 0:
            print("[MQTTService] Connected to broker")
            self.is_connected = True
            # Subscribe to topics
            self.subscribe(settings.MQTT_TOPIC_ECG)
            self.subscribe(settings.MQTT_TOPIC_FLEX)
            self.subscribe(settings.MQTT_TOPIC_VITALS)
        else:
            print(f"[MQTTService] Connection failed: {rc}")
    
    def _on_disconnect(self, client, userdata, rc):
        """Callback when disconnected"""
        print("[MQTTService] Disconnected")
        self.is_connected = False
    
    def _on_message(self, client, userdata, msg):
        """Callback when message received"""
        try:
            topic = msg.topic
            payload = json.loads(msg.payload.decode())
            
            if topic in self.callbacks:
                for callback in self.callbacks[topic]:
                    callback(payload)
        except Exception as e:
            print(f"[MQTTService] Error processing message: {e}")
    
    def subscribe(self, topic: str, callback: Optional[Callable] = None):
        """Subscribe to a topic"""
        if self.client:
            self.client.subscribe(topic)
            if callback:
                if topic not in self.callbacks:
                    self.callbacks[topic] = []
                self.callbacks[topic].append(callback)
    
    def publish(self, topic: str, payload: dict):
        """Publish message to topic"""
        if self.client and self.is_connected:
            self.client.publish(topic, json.dumps(payload))


# Singleton instance
mqtt_service = MQTTService()
