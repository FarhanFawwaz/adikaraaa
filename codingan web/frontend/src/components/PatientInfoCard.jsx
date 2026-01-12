import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./PatientInfoCard.css";

export const PatientInfoCard = () => {
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionCount, setSessionCount] = useState(0);

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
        <div className="patient-left">
          <div className="patient-avatar">
            <i className="fas fa-user-circle"></i>
          </div>
          <h2 className="patient-name">
            {patientData?.name || "Nama Tidak Tersedia"}
          </h2>
        </div>
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
          
        </div>
      </div>
    </div>
  );
};
