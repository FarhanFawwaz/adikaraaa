import os
import numpy as np
import matplotlib.pyplot as plt
from scipy. signal import butter, filtfilt
from keras.models import load_model

# ========================================
# 1. FUNGSI GENERATE DATA DUMMY ECG
# ========================================

def generate_dummy_ecg(duration=30, fs=300, heart_rate=75, rhythm_type='normal'):
    """
    Generate dummy ECG signal
    
    Args:
        duration: durasi dalam detik (default 30)
        fs: sampling frequency (default 300 Hz)
        heart_rate:  detak jantung per menit (default 75 bpm)
        rhythm_type: 'normal', 'afib', 'noisy', 'other'
    
    Returns: 
        ecg_signal: array sinyal ECG dummy
    """
    n_samples = duration * fs
    t = np.linspace(0, duration, n_samples)
    
    # Baseline ECG (gelombang P-QRS-T yang disederhanakan)
    rr_interval = 60 / heart_rate  # interval antar detak (detik)
    
    ecg_signal = np.zeros(n_samples)
    
    if rhythm_type == 'normal': 
        # Normal sinus rhythm - teratur
        for i in range(int(duration / rr_interval)):
            peak_time = i * rr_interval
            peak_idx = int(peak_time * fs)
            
            if peak_idx < n_samples:
                # P wave (kecil)
                p_idx = peak_idx - int(0.12 * fs)
                if p_idx > 0 and p_idx < n_samples:
                    ecg_signal[p_idx: p_idx+int(0.08*fs)] += 0.2 * np.sin(np.linspace(0, np.pi, int(0.08*fs)))
                
                # QRS complex (tajam dan tinggi)
                qrs_width = int(0.08 * fs)
                if peak_idx + qrs_width < n_samples:
                    ecg_signal[peak_idx: peak_idx+qrs_width] += np.concatenate([
                        -0.3 * np.ones(qrs_width//4),  # Q wave
                        1.5 * np.ones(qrs_width//2),   # R wave
                        -0.2 * np.ones(qrs_width//4)   # S wave
                    ])
                
                # T wave (lembut)
                t_idx = peak_idx + int(0.2 * fs)
                if t_idx < n_samples and t_idx + int(0.15*fs) < n_samples:
                    ecg_signal[t_idx:t_idx+int(0.15*fs)] += 0.3 * np.sin(np. linspace(0, np.pi, int(0.15*fs)))
    
    elif rhythm_type == 'afib': 
        # Atrial Fibrillation - tidak teratur
        np.random.seed(42)
        irregular_intervals = rr_interval + np.random.uniform(-0.2, 0.2, int(duration / rr_interval))
        cumulative_time = 0
        
        for interval in irregular_intervals:
            cumulative_time += interval
            peak_idx = int(cumulative_time * fs)
            
            if peak_idx < n_samples: 
                # QRS saja, tanpa P wave yang jelas
                qrs_width = int(0.08 * fs)
                if peak_idx + qrs_width < n_samples:
                    ecg_signal[peak_idx:peak_idx+qrs_width] += np.concatenate([
                        -0.3 * np.ones(qrs_width//4),
                        1.3 * np.ones(qrs_width//2),
                        -0.2 * np. ones(qrs_width//4)
                    ])
                
                # T wave
                t_idx = peak_idx + int(0.2 * fs)
                if t_idx < n_samples and t_idx + int(0.15*fs) < n_samples:
                    ecg_signal[t_idx:t_idx+int(0.15*fs)] += 0.25 * np.sin(np. linspace(0, np.pi, int(0.15*fs)))
        
        # Tambah fibrillation waves (gelombang kecil tak teratur)
        ecg_signal += 0.05 * np.random.randn(n_samples)
    
    elif rhythm_type == 'noisy':
        # Sinyal normal tapi dengan noise tinggi
        for i in range(int(duration / rr_interval)):
            peak_time = i * rr_interval
            peak_idx = int(peak_time * fs)
            
            if peak_idx < n_samples:
                qrs_width = int(0.08 * fs)
                if peak_idx + qrs_width < n_samples:
                    ecg_signal[peak_idx:peak_idx+qrs_width] += 1.0 * np.sin(np.linspace(0, np.pi, qrs_width))
        
        # Tambah noise besar
        ecg_signal += 0.5 * np.random.randn(n_samples)
        # Tambah powerline interference (50Hz)
        ecg_signal += 0.3 * np.sin(2 * np.pi * 50 * t)
    
    elif rhythm_type == 'other':
        # Aritmia lain - detak cepat tidak teratur
        heart_rate_fast = 120
        rr_interval = 60 / heart_rate_fast
        
        for i in range(int(duration / rr_interval)):
            peak_time = i * rr_interval + np.random.uniform(-0.05, 0.05)
            peak_idx = int(peak_time * fs)
            
            if peak_idx < n_samples:
                qrs_width = int(0.1 * fs)
                if peak_idx + qrs_width < n_samples:
                    # QRS lebih lebar dan berbeda bentuk
                    ecg_signal[peak_idx:peak_idx+qrs_width] += 1.2 * np.sin(np. linspace(0, 2*np.pi, qrs_width))
    
    # Tambah baseline wander (drift lambat)
    baseline = 0.1 * np.sin(2 * np.pi * 0.3 * t)
    ecg_signal += baseline
    
    # Tambah sedikit noise realistis
    ecg_signal += 0.05 * np.random.randn(n_samples)
    
    return ecg_signal


# ========================================
# 2. FUNGSI PREPROCESSING (SAMA SEPERTI MODEL)
# ========================================

def preprocess_ecg(raw_data, fs=300):
    """
    Preprocessing ECG sesuai dengan requirement model
    """
    MAXLEN = 30 * fs  # 9000 samples untuk 30 detik
    
    # Handle NaN/Inf
    data = np.nan_to_num(raw_data)
    
    # Truncate atau pad ke 30 detik
    if len(data) > MAXLEN:
        data = data[: MAXLEN]
    
    # Normalisasi (Z-score)
    data = (data - np.mean(data)) / (np.std(data) + 1e-8)
    
    # Padding jika kurang dari 30 detik
    X = np.zeros((1, MAXLEN))
    X[0, :len(data)] = data
    
    # Reshape untuk Keras input (batch_size, timesteps, channels)
    X = np.expand_dims(X, axis=2)
    
    return X


# ========================================
# 3. FUNGSI TEST PREDIKSI
# ========================================

def test_prediction(rhythm_type='normal', show_plot=True):
    """
    Test prediksi dengan data dummy
    
    Args:
        rhythm_type: 'normal', 'afib', 'noisy', 'other'
        show_plot: tampilkan plot atau tidak
    """
    # Generate dummy data
    print(f"🔄 Generating {rhythm_type} ECG dummy data...")
    ecg_data = generate_dummy_ecg(duration=30, fs=300, heart_rate=75, rhythm_type=rhythm_type)
    
    # Preprocessing
    print("⚙️  Preprocessing data...")
    processed_data = preprocess_ecg(ecg_data, fs=300)
    
    print(f"✅ Data shape: {processed_data.shape}")
    
    # Load model
    print("📦 Loading model...")
    try:
        model_path = os.path.join(os.path.dirname(__file__), 'model/ResNet_30s_34lay_16conv.hdf5')
        # Compile=False untuk menghindari error optimizer versi lama
        model = load_model(model_path, compile=False)
        # Re-compile model dengan optimizer baru jika perlu training, 
        # tapi untuk inferensi saja tidak perlu compile
        # model.compile(optimizer='adam', loss='categorical_crossentropy')
        print("✅ Model loaded successfully!")
    except Exception as e:
        print(f"❌ Error loading model:  {e}")
        print("⚠️  Pastikan file 'ResNet_30s_34lay_16conv.hdf5' ada di direktori yang sama")
        return
    
    # Predict
    print("🔮 Predicting...")
    prob = model.predict(processed_data, verbose=0)
    ann = np.argmax(prob)
    
    # Class labels
    classes = ['A (AFib)', 'N (Normal)', 'O (Other)', '~ (Noisy)']
    
    # Print results
    print("\n" + "="*50)
    print("📊 HASIL PREDIKSI")
    print("="*50)
    print(f"Input Type: {rhythm_type. upper()}")
    print(f"Predicted Class: {classes[ann]}")
    print(f"Confidence: {100*prob[0,ann]:.2f}%")
    print("\nProbabilitas untuk setiap kelas:")
    for i, class_name in enumerate(classes):
        print(f"  {class_name}: {100*prob[0,i]:.2f}%")
    print("="*50 + "\n")
    
    # Plot jika diminta
    if show_plot:
        fig, axes = plt.subplots(2, 1, figsize=(15, 8))
        
        # Plot 1: Sinyal asli (5 detik pertama)
        time = np.linspace(0, 5, 1500)
        axes[0].plot(time, ecg_data[: 1500], 'b-', linewidth=0.8)
        axes[0].set_title(f'ECG Dummy Signal - {rhythm_type. upper()} (5 detik pertama)', fontsize=12, fontweight='bold')
        axes[0].set_xlabel('Time (seconds)')
        axes[0].set_ylabel('Amplitude')
        axes[0].grid(True, alpha=0.3)
        
        # Plot 2: Probabilitas prediksi
        colors = ['#ff6b6b', '#51cf66', '#ffd43b', '#a0a0a0']
        bars = axes[1].bar(classes, prob[0] * 100, color=colors, alpha=0.7, edgecolor='black')
        axes[1].set_title('Prediction Probability', fontsize=12, fontweight='bold')
        axes[1].set_ylabel('Probability (%)')
        axes[1].set_ylim([0, 105])
        axes[1].grid(True, axis='y', alpha=0.3)
        
        # Highlight predicted class
        bars[ann].set_alpha(1.0)
        bars[ann].set_linewidth(3)
        
        # Tambah nilai di atas bar
        for i, bar in enumerate(bars):
            height = bar.get_height()
            axes[1].text(bar.get_x() + bar.get_width()/2., height + 2,
                        f'{height:. 1f}%', ha='center', va='bottom', fontweight='bold')
        
        plt.tight_layout()
        plt.savefig(f'prediction_result_{rhythm_type}. png', dpi=150, bbox_inches='tight')
        print(f"💾 Plot saved as 'prediction_result_{rhythm_type}.png'")
        plt.show()
    
    return prob


# ========================================
# 4. TEST SEMUA JENIS RITME
# ========================================

def test_all_rhythms():
    """Test prediksi untuk semua jenis ritme"""
    rhythm_types = ['normal', 'afib', 'noisy', 'other']
    
    print("\n" + "🚀 "*20)
    print("TESTING ALL RHYTHM TYPES")
    print("🚀 "*20 + "\n")
    
    results = {}
    for rhythm in rhythm_types:
        print(f"\n{'='*60}")
        print(f"Testing:  {rhythm.upper()}")
        print(f"{'='*60}")
        # PERBAIKAN: Gunakan variabel 'rhythm' bukan 'afib'
        prob = test_prediction(rhythm, show_plot=False)
        if prob is not None:
            results[rhythm] = prob
        print("\n")
    
    return results


# ========================================
# 5. MAIN EXECUTION
# ========================================

if __name__ == "__main__": 
    print("🏥 ECG Arrhythmia Prediction - Dummy Data Tester")
    print("="*60 + "\n")
    
    # Pilihan 1: Test satu jenis ritme dengan plot
    # print("📍 Option 1: Test single rhythm type with plot")
    # test_prediction('normal', show_plot=True)
    
    # Pilihan 2: Test semua jenis ritme
    print("📍 Option 2: Test all rhythm types")
    test_all_rhythms()