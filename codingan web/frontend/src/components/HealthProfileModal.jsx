import { useState } from "react";
import "./HealthProfileModal.css";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const HealthProfileModal = ({ isOpen, onClose, onComplete }) => {
  const [formData, setFormData] = useState({
    age: "",
    has_hypertension: false,
    has_diabetes: false,
    has_heart_disease: false,
    has_no_conditions: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConditionChange = (condition) => {
    if (condition === "has_no_conditions") {
      // If "Tidak ada" is selected, uncheck all other conditions
      setFormData((prev) => ({
        ...prev,
        has_hypertension: false,
        has_diabetes: false,
        has_heart_disease: false,
        has_no_conditions: !prev.has_no_conditions,
      }));
    } else {
      // If any condition is selected, uncheck "Tidak ada"
      setFormData((prev) => ({
        ...prev,
        [condition]: !prev[condition],
        has_no_conditions: false,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.age || formData.age < 1 || formData.age > 150) {
      setError("Masukkan umur yang valid");
      return;
    }

    // Check if at least one condition is selected
    const hasCondition = 
      formData.has_hypertension || 
      formData.has_diabetes || 
      formData.has_heart_disease || 
      formData.has_no_conditions;
    
    if (!hasCondition) {
      setError("Pilih setidaknya satu kondisi kesehatan");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/patients/profile/health`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          age: parseInt(formData.age),
          has_hypertension: formData.has_hypertension,
          has_diabetes: formData.has_diabetes,
          has_heart_disease: formData.has_heart_disease,
          has_no_conditions: formData.has_no_conditions,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Gagal menyimpan profil");
      }

      onComplete();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container health-profile-modal">
        <div className="modal-header">
          <div className="modal-icon">
            <i className="fas fa-clipboard-list"></i>
          </div>
          <h2>Informasi Kesehatan</h2>
          <p>Bantu kami memahami kondisi Anda lebih baik</p>
        </div>

        {error && (
          <div className="modal-error">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="age">
              <i className="fas fa-birthday-cake"></i>
              Berapa umur Anda?
            </label>
            <div className="input-wrapper">
              <input
                type="number"
                id="age"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="Masukkan umur"
                min="1"
                max="150"
                required
              />
              <span className="input-suffix">tahun</span>
            </div>
          </div>

          <div className="form-group">
            <label>
              <i className="fas fa-heartbeat"></i>
              Apakah Anda memiliki kondisi berikut?
            </label>
            <p className="form-hint">Boleh pilih lebih dari satu</p>

            <div className="condition-options">
              <label className={`condition-card ${formData.has_hypertension ? "selected" : ""}`}>
                <input
                  type="checkbox"
                  checked={formData.has_hypertension}
                  onChange={() => handleConditionChange("has_hypertension")}
                />
                <div className="condition-content">
                  <i className="fas fa-tint"></i>
                  <span>Hipertensi</span>
                  <p>Tekanan darah tinggi</p>
                </div>
                <div className="condition-check">
                  <i className="fas fa-check"></i>
                </div>
              </label>

              <label className={`condition-card ${formData.has_diabetes ? "selected" : ""}`}>
                <input
                  type="checkbox"
                  checked={formData.has_diabetes}
                  onChange={() => handleConditionChange("has_diabetes")}
                />
                <div className="condition-content">
                  <i className="fas fa-syringe"></i>
                  <span>Diabetes</span>
                  <p>Gula darah tinggi</p>
                </div>
                <div className="condition-check">
                  <i className="fas fa-check"></i>
                </div>
              </label>

              <label className={`condition-card ${formData.has_heart_disease ? "selected" : ""}`}>
                <input
                  type="checkbox"
                  checked={formData.has_heart_disease}
                  onChange={() => handleConditionChange("has_heart_disease")}
                />
                <div className="condition-content">
                  <i className="fas fa-heart-broken"></i>
                  <span>Penyakit Jantung</span>
                  <p>Gangguan kardiovaskular</p>
                </div>
                <div className="condition-check">
                  <i className="fas fa-check"></i>
                </div>
              </label>

              <label className={`condition-card no-condition ${formData.has_no_conditions ? "selected" : ""}`}>
                <input
                  type="checkbox"
                  checked={formData.has_no_conditions}
                  onChange={() => handleConditionChange("has_no_conditions")}
                />
                <div className="condition-content">
                  <i className="fas fa-check-circle"></i>
                  <span>Tidak Ada</span>
                  <p>Tidak memiliki kondisi di atas</p>
                </div>
                <div className="condition-check">
                  <i className="fas fa-check"></i>
                </div>
              </label>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Lewati
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Menyimpan...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  Simpan & Lanjutkan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
