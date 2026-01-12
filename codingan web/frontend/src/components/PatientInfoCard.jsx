import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./PatientInfoCard.css";

export const PatientInfoCard = ({ deviceId, onDeviceIdChange }) => {
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [deviceDraft, setDeviceDraft] = useState(() => {
    const v = (
      deviceId ||
      localStorage.getItem("deviceId") ||
      "device1"
    ).trim();
    return v || "device1";
  });
  const [deviceSavedMsg, setDeviceSavedMsg] = useState("");

  useEffect(() => {
    const v = (deviceId || "").trim();
    if (v && v !== deviceDraft) setDeviceDraft(v);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceId]);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);

        const user = localStorage.getItem("user");

        if (!user) {
          setError("Silakan login terlebih dahulu");
          setLoading(false);
          return;
        }

        const response = await fetch("http://localhost:8080/api/patients/me", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            setError("Sesi Anda telah berakhir, silakan login kembali");
            localStorage.removeItem("user");
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        setPatientData(data);

        // Fetch session count if available
        try {
          const sessionsResponse = await fetch(
            "http://localhost:8080/api/sessions/count",
            {
              method: "GET",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          if (sessionsResponse.ok) {
            const sessionsData = await sessionsResponse.json();
            setSessionCount(sessionsData.count || 0);
          }
        } catch (err) {
          console.log("Could not fetch session count:", err);
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching patient data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, []);

  if (loading) {
    return (
      <div className="card dashboard-card patient-card">
        <div className="card-header">
          <h3 className="card-title">
            <i className="fas fa-user"></i>
            Informasi Pasien
          </h3>
        </div>
        <div className="patient-info-loading">
          <div className="spinner"></div>
          <p>Memuat data pasien...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const isAuthError =
      error.includes("login") ||
      error.includes("Sesi") ||
      error.includes("terautentikasi");

    return (
      <div className="card dashboard-card patient-card">
        <div className="card-header">
          <h3 className="card-title">
            <i className="fas fa-user"></i>
            Informasi Pasien
          </h3>
        </div>
        <div className="patient-info-error">
          <i
            className={`fas ${
              isAuthError ? "fa-sign-in-alt" : "fa-exclamation-triangle"
            }`}
          ></i>
          <p>{error}</p>
          {isAuthError && (
            <Link to="/login" className="btn-login">
              <i className="fas fa-sign-in-alt"></i>
              Login Sekarang
            </Link>
          )}
        </div>
      </div>
    );
  }

  const patientId = patientData?.id
    ? `P-${new Date().getFullYear()}-${String(patientData.id).padStart(3, "0")}`
    : "N/A";

  return (
    <div className="card dashboard-card patient-card">
      <div className="card-header">
        <h3 className="card-title">
          <i className="fas fa-user"></i>
          Informasi Pasien
        </h3>
      </div>
      <div className="patient-info-content">
        
        <div className="patient-details">
          <div className="patient-detail-item">
            <span className="detail-label">ID Pasien</span>
            <span className="detail-value">{patientId}</span>
          </div>
          <div className="patient-detail-item">
            <span className="detail-label">Usia</span>
            <span className="detail-value">
              {patientData?.patient_profile?.age
                ? `${patientData.patient_profile.age} Tahun`
                : "Belum diisi"}
            </span>
          </div>

          <div className="patient-detail-item patient-detail-item-device">
            <span className="detail-label">Device</span>
            <div className="device-input-row">
              <input
                className="device-input"
                type="text"
                inputMode="text"
                autoComplete="off"
                spellCheck={false}
                placeholder="device1"
                value={deviceDraft}
                onChange={(e) => {
                  setDeviceSavedMsg("");
                  setDeviceDraft(e.target.value);
                }}
              />
              <button
                type="button"
                className="device-save-btn"
                onClick={() => {
                  const next = (deviceDraft || "").trim() || "device1";
                  localStorage.setItem("deviceId", next);
                  if (typeof onDeviceIdChange === "function") {
                    onDeviceIdChange(next);
                  }
                  setDeviceSavedMsg(`Menggunakan: ${next}`);
                }}
              >
                Simpan
              </button>
            </div>
          </div>

          {deviceSavedMsg && (
            <div className="device-saved-msg" aria-live="polite">
              {deviceSavedMsg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
