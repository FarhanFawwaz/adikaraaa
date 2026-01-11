import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export const PatientInfoCard = () => {
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionCount, setSessionCount] = useState(0);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);

        // Check if user is logged in from localStorage (UI only)
        const user = localStorage.getItem("user");

        if (!user) {
          setError("Silakan login terlebih dahulu");
          setLoading(false);
          return;
        }

        // Fetch patient data from backend using httpOnly cookie
        const response = await fetch("http://localhost:8080/api/patients/me", {
          method: "GET",
          credentials: "include", // Important: send cookies
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
              credentials: "include", // Important: send cookies
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
    // Check if it's an authentication error
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

  // Generate patient ID from user id
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
      <div className="patient-info">
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
            <span className="detail-label">ID:</span>
            <span className="detail-value">{patientId}</span>
          </div>
          <div className="patient-detail-item">
            <span className="detail-label">Usia:</span>
            <span className="detail-value">
              {patientData?.patient_profile?.age
                ? `${patientData.patient_profile.age} Tahun`
                : "Belum diisi"}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        .patient-info-loading,
        .patient-info-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--space-8);
          gap: var(--space-4);
          color: var(--gray-400);
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-top-color: var(--primary-500);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .patient-info-error i {
          font-size: 32px;
          color: var(--error-500);
        }

        .btn-login {
          margin-top: var(--space-4);
          padding: var(--space-3) var(--space-6);
          background: linear-gradient(135deg, var(--primary-500), var(--accent-purple));
          color: white;
          border: none;
          border-radius: var(--radius-lg);
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          text-decoration: none;
          transition: all var(--transition-base);
        }

        .btn-login:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
        }

        .patient-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-6);
        }

        .patient-left {
          text-align: center;
        }

        .patient-avatar {
          width: 80px;
          height: 80px;
          margin: 0 auto var(--space-4);
          background: linear-gradient(135deg, var(--primary-500), var(--accent-purple));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .patient-avatar i {
          font-size: 40px;
          color: white;
        }

        .patient-name {
          font-size: var(--text-xl);
          font-weight: 700;
          color: white;
        }

        .patient-details {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          flex: 1;
        }

        .patient-detail-item {
          display: flex;
          justify-content: space-between;
          gap: var(--space-8);
          padding: var(--space-3);
          background: rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-lg);
        }

        .detail-label {
          color: var(--gray-400);
          font-size: var(--text-sm);
        }

        .detail-value {
          color: white;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .patient-info {
            flex-direction: column;
          }
          
          .patient-details {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};
