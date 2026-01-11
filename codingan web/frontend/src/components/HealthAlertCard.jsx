import { useState, useEffect } from "react";
import "./HealthAlertCard.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// BPM ranges by age
const getBPMRange = (age) => {
  if (age === null || age === undefined) return { min: 60, max: 100, label: "Dewasa" };
  
  if (age < 1) return { min: 100, max: 205, label: "Bayi baru lahir" };
  if (age < 1) return { min: 100, max: 180, label: "Bayi" };
  if (age >= 1 && age <= 2) return { min: 98, max: 140, label: "1-2 tahun" };
  if (age >= 3 && age <= 5) return { min: 80, max: 120, label: "3-5 tahun" };
  if (age >= 6 && age <= 7) return { min: 75, max: 118, label: "6-7 tahun" };
  return { min: 60, max: 100, label: "Dewasa/Lansia" };
};

// SpO2 ranges
const getSpo2Range = (age) => {
  // Normal SpO2 for all ages is 95-100%
  // Below 92% needs oxygen therapy for adults
  // Below 95% is considered low
  return { min: 95, max: 100, criticalMin: 92 };
};

// Analyze BPM status
const analyzeBPM = (bpm, age) => {
  const range = getBPMRange(age);
  
  if (bpm === null || bpm === undefined || bpm === 0) {
    return { status: "unknown", message: "Menunggu data...", color: "gray" };
  }
  
  if (bpm < range.min) {
    const diff = range.min - bpm;
    if (diff > 20) {
      return { 
        status: "critical", 
        message: `BPM sangat rendah! (${bpm} < ${range.min})`, 
        color: "red",
        severity: "high"
      };
    }
    return { 
      status: "low", 
      message: `BPM rendah (${bpm} < ${range.min})`, 
      color: "orange",
      severity: "medium"
    };
  }
  
  if (bpm > range.max) {
    const diff = bpm - range.max;
    if (diff > 30) {
      return { 
        status: "critical", 
        message: `BPM sangat tinggi! (${bpm} > ${range.max})`, 
        color: "red",
        severity: "high"
      };
    }
    return { 
      status: "high", 
      message: `BPM tinggi (${bpm} > ${range.max})`, 
      color: "orange",
      severity: "medium"
    };
  }
  
  return { 
    status: "normal", 
    message: `Normal (${range.min}-${range.max} bpm)`, 
    color: "green",
    severity: "none"
  };
};

// Analyze SpO2 status
const analyzeSpo2 = (spo2, age) => {
  const range = getSpo2Range(age);
  
  if (spo2 === null || spo2 === undefined || spo2 === 0) {
    return { status: "unknown", message: "Menunggu data...", color: "gray" };
  }
  
  if (spo2 < range.criticalMin) {
    return { 
      status: "critical", 
      message: `SpO2 kritis! Butuh oksigen! (${spo2}% < ${range.criticalMin}%)`, 
      color: "red",
      severity: "high"
    };
  }
  
  if (spo2 < range.min) {
    return { 
      status: "low", 
      message: `SpO2 rendah (${spo2}% < ${range.min}%)`, 
      color: "orange",
      severity: "medium"
    };
  }
  
  return { 
    status: "normal", 
    message: `Normal (${range.min}-${range.max}%)`, 
    color: "green",
    severity: "none"
  };
};

export const HealthAlertCard = ({ vitalsData, isConnected }) => {
  const [patientAge, setPatientAge] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch patient age from profile (fallback to dummy age)
  useEffect(() => {
    const fetchPatientProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/api/patients/profile/health`, {
          credentials: "include",
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.profile) {
            setPatientAge(data.profile.age);
          } else {
            // Use dummy age if no profile
            setPatientAge(45); // Default dummy age: 45 years (adult)
          }
        } else {
          // Use dummy age if request fails
          setPatientAge(45);
        }
      } catch (error) {
        console.error("Error fetching patient profile:", error);
        // Use dummy age on error
        setPatientAge(45);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientProfile();
  }, []);

  // Use vitalsData from WebSocket (same as VitalsCard)
  const bpm = vitalsData?.data?.bpm || vitalsData?.bpm || 0;
  const spo2 = vitalsData?.data?.spo2 || vitalsData?.spo2 || 0;

  const bpmAnalysis = analyzeBPM(bpm, patientAge);
  const spo2Analysis = analyzeSpo2(spo2, patientAge);

  const bpmRange = getBPMRange(patientAge);
  const hasWarning = bpmAnalysis.status !== "normal" && bpmAnalysis.status !== "unknown";
  const hasSpo2Warning = spo2Analysis.status !== "normal" && spo2Analysis.status !== "unknown";

  return (
    <div className="health-alert-card">
      <div className="alert-header">
        <h3>
          <i className="fas fa-shield-heart"></i>
          Deteksi Kesehatan
        </h3>
        {patientAge && (
          <span className="age-badge">
            <i className="fas fa-user"></i>
            {patientAge} Tahun
          </span>
        )}
      </div>

      <div className="alert-content">
        {/* BPM Alert */}
        <div className={`alert-item ${bpmAnalysis.color}`}>
          <div className="alert-icon-wrapper">
            <i className="fas fa-heartbeat"></i>
          </div>
          <div className="alert-info">
            <div className="alert-label">
              <span>Detak Jantung (BPM)</span>
              <span className="current-value">{bpm || "--"}</span>
            </div>
            <div className={`alert-status ${bpmAnalysis.color}`}>
              {bpmAnalysis.status === "critical" && <i className="fas fa-exclamation-triangle"></i>}
              {bpmAnalysis.status === "high" && <i className="fas fa-arrow-up"></i>}
              {bpmAnalysis.status === "low" && <i className="fas fa-arrow-down"></i>}
              {bpmAnalysis.status === "normal" && <i className="fas fa-check-circle"></i>}
              <span>{bpmAnalysis.message}</span>
            </div>
            <div className="normal-range">
              Normal untuk {bpmRange.label}: {bpmRange.min}-{bpmRange.max} bpm
            </div>
          </div>
        </div>

        {/* SpO2 Alert */}
        <div className={`alert-item ${spo2Analysis.color}`}>
          <div className="alert-icon-wrapper spo2">
            <i className="fas fa-lungs"></i>
          </div>
          <div className="alert-info">
            <div className="alert-label">
              <span>Saturasi Oksigen (SpO2)</span>
              <span className="current-value">{spo2 || "--"}%</span>
            </div>
            <div className={`alert-status ${spo2Analysis.color}`}>
              {spo2Analysis.status === "critical" && <i className="fas fa-exclamation-triangle"></i>}
              {spo2Analysis.status === "low" && <i className="fas fa-arrow-down"></i>}
              {spo2Analysis.status === "normal" && <i className="fas fa-check-circle"></i>}
              <span>{spo2Analysis.message}</span>
            </div>
            <div className="normal-range">
              Normal: 95-100% | Kritis: &lt;92%
            </div>
          </div>
        </div>

        {/* Warning Banner */}
        {(hasWarning || hasSpo2Warning) && (
          <div className={`warning-banner ${bpmAnalysis.severity === "high" || spo2Analysis.severity === "high" ? "critical" : "warning"}`}>
            <i className="fas fa-exclamation-circle"></i>
            <div className="warning-text">
              <strong>Perhatian!</strong>
              <span>
                {bpmAnalysis.severity === "high" && "Detak jantung dalam kondisi kritis. "}
                {spo2Analysis.severity === "high" && "Saturasi oksigen sangat rendah, butuh terapi oksigen. "}
                {(bpmAnalysis.severity === "medium" || spo2Analysis.severity === "medium") && 
                  (bpmAnalysis.severity !== "high" && spo2Analysis.severity !== "high") &&
                  "Nilai di luar rentang normal. Pantau terus kondisi pasien."
                }
              </span>
            </div>
          </div>
        )}

        {/* All Normal */}
        {!hasWarning && !hasSpo2Warning && bpmAnalysis.status !== "unknown" && (
          <div className="all-normal-banner">
            <i className="fas fa-heart"></i>
            <span>Semua parameter vital dalam kondisi normal</span>
          </div>
        )}
      </div>

     
    </div>
  );
};
