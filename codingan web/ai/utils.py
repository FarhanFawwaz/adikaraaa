import numpy as np
from scipy import signal
import neurokit2 as nk

def preprocess_ecg(raw_signal, fs=250):
    """
    Preprocessing ECG signal
    
    Parameters:
    - raw_signal:  array dari AD8232
    - fs: sampling frequency (Hz)
    """
    
    # 1. Remove DC offset
    signal_centered = raw_signal - np.mean(raw_signal)
    
    # 2. Bandpass filter (0.5-40 Hz untuk ECG)
    nyquist = fs / 2
    low = 0.5 / nyquist
    high = 40 / nyquist
    b, a = signal.butter(4, [low, high], btype='band')
    filtered_signal = signal.filtfilt(b, a, signal_centered)
    
    # 3. Notch filter (50/60 Hz untuk powerline noise)
    notch_freq = 50 / nyquist  # atau 60 untuk US
    b_notch, a_notch = signal.iirnotch(notch_freq, Q=30, fs=fs)
    clean_signal = signal.filtfilt(b_notch, a_notch, filtered_signal)
    
    # 4. Normalization
    normalized = (clean_signal - np.min(clean_signal)) / \
                 (np.max(clean_signal) - np.min(clean_signal))
    
    return normalized

def extract_features(clean_signal, fs=250):
    """
    Extract features sesuai dengan dataset Anda
    """
    
    # Detect R-peaks dan delineate ECG
    signals, info = nk.ecg_process(clean_signal, sampling_rate=fs)
    
    # Extract waves
    waves = nk.ecg_delineate(clean_signal, info['ECG_R_Peaks'], 
                              sampling_rate=fs)
    
    features = []
    r_peaks = info['ECG_R_Peaks']
    
    for i in range(1, len(r_peaks)-1):
        beat_features = {}
        
        # RR intervals
        beat_features['pre_RR'] = (r_peaks[i] - r_peaks[i-1]) / fs * 1000  # ms
        beat_features['post_RR'] = (r_peaks[i+1] - r_peaks[i]) / fs * 1000
        
        # Peak amplitudes
        beat_features['rPeak'] = clean_signal[r_peaks[i]]
        
        # P, Q, S, T peaks (jika terdeteksi)
        if 'ECG_P_Peaks' in waves: 
            p_idx = waves['ECG_P_Peaks'][i]
            beat_features['pPeak'] = clean_signal[p_idx] if not np.isnan(p_idx) else 0
        
        if 'ECG_Q_Peaks' in waves:
            q_idx = waves['ECG_Q_Peaks'][i]
            beat_features['qPeak'] = clean_signal[q_idx] if not np.isnan(q_idx) else 0
        
        if 'ECG_S_Peaks' in waves: 
            s_idx = waves['ECG_S_Peaks'][i]
            beat_features['sPeak'] = clean_signal[s_idx] if not np.isnan(s_idx) else 0
        
        if 'ECG_T_Peaks' in waves:
            t_idx = waves['ECG_T_Peaks'][i]
            beat_features['tPeak'] = clean_signal[t_idx] if not np.isnan(t_idx) else 0
        
        # Intervals
        beat_features['qrs_interval'] = calculate_qrs_duration(waves, i, fs)
        beat_features['pq_interval'] = calculate_pq_interval(waves, i, fs)
        beat_features['qt_interval'] = calculate_qt_interval(waves, i, fs)
        beat_features['st_interval'] = calculate_st_interval(waves, i, fs)
        
        # QRS Morphology features
        qrs_segment = extract_qrs_segment(clean_signal, waves, i)
        beat_features['qrs_morph0'] = np.mean(qrs_segment)
        beat_features['qrs_morph1'] = np. std(qrs_segment)
        beat_features['qrs_morph2'] = np.max(qrs_segment)
        beat_features['qrs_morph3'] = np.min(qrs_segment)
        beat_features['qrs_morph4'] = calculate_slope(qrs_segment)
        
        features.append(beat_features)
    
    return features

def predict_arrhythmia(raw_signal, model, fs=250):
    """
    Complete pipeline dari raw signal ke prediksi
    """
    # Preprocessing
    clean_signal = preprocess_ecg(raw_signal, fs)
    
    # Feature extraction untuk 2 leads
    features_lead0 = extract_features(clean_signal[0], fs)
    features_lead1 = extract_features(clean_signal[1], fs)
    
    # Combine features (prefix dengan 0_ dan 1_)
    combined_features = combine_lead_features(features_lead0, features_lead1)
    
    # Predict
    prediction = model.predict(combined_features)
    
    return prediction