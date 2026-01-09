import os
import numpy as np
from scipy import signal
from tensorflow.keras.models import load_model

class ECGPredictor:
    def __init__(self, fs_target=300):
        self.fs_target = fs_target
        self.maxlen = 30 * fs_target  # 9000 samples
        self.classes = ['A (AFib)', 'N (Normal)', 'O (Other)', '~ (Noisy)']
        self.model = None
        self._load_model()

    def _load_model(self):
        """Load model dengan path yang aman dan compile=False"""
        try:
            print("[ECGPredictor] Loading model...", flush=True)
            # Gunakan path absolut relatif terhadap file script ini
            base_dir = os.path.dirname(os.path.abspath(__file__))
            model_path = os.path.join(base_dir, 'model', 'ResNet_30s_34lay_16conv.hdf5')
            
            print(f"[ECGPredictor] Model path: {model_path}", flush=True)
            # compile=False penting untuk compatibilitas versi Keras/TF
            self.model = load_model(model_path, compile=False)
            print("✅ Model loaded successfully from:", model_path, flush=True)
        except Exception as e:
            print(f"❌ Error loading model: {e}", flush=True)
            self.model = None

    def preprocess_signal(self, raw_data, original_fs):
        """Preprocessing lengkap: Resample -> Filter -> Normalize"""
        data = np.array(raw_data)
        
        # 1. Resample jika sampling rate berbeda
        if original_fs != self.fs_target:
            number_of_samples = int(len(data) * self.fs_target / original_fs)
            data = signal.resample(data, number_of_samples)
        
        # 2. Bandpass filter (0.5 - 45 Hz)
        nyq = 0.5 * self.fs_target
        b, a = signal.butter(5, [0.5/nyq, 45/nyq], btype='band')
        data = signal.filtfilt(b, a, data)
        
        # 3. Handle NaN/Inf
        data = np.nan_to_num(data)
        
        # 4. Potong atau Pad ke 30 detik
        if len(data) > self.maxlen:
            data = data[:self.maxlen]
        else:
            # Padding dengan nol jika data kurang dari 30 detik
            padded = np.zeros(self.maxlen)
            padded[:len(data)] = data
            data = padded
            
        # 5. Normalisasi (Z-score)
        if np.std(data) != 0:
            data = (data - np.mean(data)) / np.std(data)
        else:
            data = (data - np.mean(data))  # Jika std=0 (datar)
            
        # 6. Reshape untuk input model (1, 9000, 1)
        data = data.reshape(1, self.maxlen, 1)
        
        return data

    def predict(self, raw_data, fs=100):
        """
        Melakukan prediksi dari raw data
        
        Args:
            raw_data: list/array sinyal ECG
            fs: sampling rate input (default 100Hz untuk umum sensor)
        Returns:
            dict: {prediction: str, confidence: float, probabilities: dict}
        """
        if self.model is None:
            return {"error": "Model not loaded"}
            
        try:
            # Preprocess
            processed_input = self.preprocess_signal(raw_data, fs)
            
            # Predict
            prob = self.model.predict(processed_input, verbose=0)
            idx = np.argmax(prob)
            
            result = {
                "prediction_code": ["A", "N", "O", "~"][idx],
                "prediction_label": self.classes[idx],
                "confidence": float(prob[0, idx]),
                "all_probabilities": {
                    self.classes[i]: float(prob[0, i]) for i in range(4)
                }
            }
            return result
            
        except Exception as e:
            return {"error": str(e)}

# ==========================================
# CONTOH PENGGUNAAN (MAIN BLOCK)
# ==========================================
if __name__ == "__main__":
    # Contoh data dummy (sinus wave 1 Hz + noise)
    fs_sensor = 100  # Misalnya dari AD8232 (100 Hz)
    duration = 30    # detik
    t = np.linspace(0, duration, duration * fs_sensor)
    dummy_signal = np.sin(2 * np.pi * 1.0 * t) + 0.2 * np.random.randn(len(t))
    
    # Inisialisasi predictor
    predictor = ECGPredictor()
    
    print("\n🔍 Testing Prediction with Dummy Signal...")
    result = predictor.predict(dummy_signal, fs=fs_sensor)
    
    print("\n📊 Result:")
    print(f"Prediction: {result.get('prediction_label')}")
    print(f"Confidence: {result.get('confidence', 0)*100:.2f}%")