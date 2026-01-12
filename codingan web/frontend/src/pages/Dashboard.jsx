import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { useWebSocket } from "../hooks/useWebSocket";
import { ECGChart } from "../components/ECGChart";
import { VitalsCard } from "../components/VitalsCard";
import { FlexSensors } from "../components/FlexSensors";
import { AIPredictionCard } from "../components/AIPredictionCard";
import { HealthAlertCard } from "../components/HealthAlertCard";
import { Navbar } from "../components/Navbar";
import { PatientInfoCard } from "../components/PatientInfoCard";
import "../css/Dashboard.css";

export const Dashboard = () => {
  const [deviceId, setDeviceId] = useState(() => {
    const stored = localStorage.getItem("deviceId");
    return stored && stored.trim() ? stored.trim() : "device1";
  });

  const normalizedDeviceId = useMemo(() => {
    const v = (deviceId || "").trim();
    return v ? v : "device1";
  }, [deviceId]);

  const {
    isConnected,
    isFirebaseConnected,
    ecgData,
    flexData,
    vitalsData,
    predictionData,
  } = useWebSocket({ deviceId: normalizedDeviceId });

  return (
    <div className="dashboard-page">
      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="container">
          {/* Dashboard Grid */}
          <div className="dashboard-grid">
            {/* Patient Info Card - Row 1, Col 1-2 */}
            <PatientInfoCard
              deviceId={normalizedDeviceId}
              onDeviceIdChange={setDeviceId}
            />

            {/* ECG - Row 1, Col 3-6 */}
            <div className="card dashboard-card ecg-card">
              <div className="card-header">
                <h3 className="card-title">
                  <i className="fas fa-heartbeat"></i>
                  ECG Monitor (AD8232)
                </h3>
                <div
                  className={`status-badge ${
                    isConnected && isFirebaseConnected
                      ? "connected"
                      : "disconnected"
                  }`}
                >
                  <span
                    className={`status-dot ${isConnected ? "pulse" : ""}`}
                  ></span>
                  {isConnected && isFirebaseConnected ? "Live" : "Disconnected"}
                </div>
              </div>
              <div className="ecg-container relative flex-1 bg-slate-900/50 rounded-xl overflow-hidden border border-white/5">
                <div className="ecg-grid absolute inset-0 grid grid-cols-[repeat(20,1fr)] grid-rows-[repeat(10,1fr)] opacity-10 pointer-events-none">
                  {Array.from({ length: 200 }).map((_, i) => (
                    <div key={i} className="border border-slate-500/30"></div>
                  ))}
                </div>
                <ECGChart ecgData={ecgData} isConnected={isConnected} />
              </div>
            </div>

            {/* Flex Sensors - Row 2-3, Col 1-2 */}
            <div className="card dashboard-card flex-card">
              <div className="card-header">
                <h3 className="card-title">
                  <i className="fas fa-hand-rock"></i>
                  Flex Sensor Analytics
                </h3>
              </div>
              <FlexSensors flexData={flexData} isConnected={isConnected} />
            </div>

            {/* Vitals Card - Row 2, Col 3-4 */}
            <div className="vitals-card-wrapper">
              <VitalsCard vitalsData={vitalsData} isConnected={isConnected} />
            </div>

            {/* AI Prediction - Row 2-3, Col 5-6 */}
            <div className="card dashboard-card ai-card">
              <div className="card-header">
                <h3 className="card-title">
                  <i className="fas fa-brain"></i>
                  AI Diagnosis
                </h3>
              </div>
              <AIPredictionCard predictionData={predictionData} />
            </div>

            {/* Health Alert Card - Row 3, Col 1-6 */}
            <div className="health-alert-wrapper">
              <HealthAlertCard
                vitalsData={vitalsData}
                isConnected={isConnected}
                isFirebaseConnected={isFirebaseConnected}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
