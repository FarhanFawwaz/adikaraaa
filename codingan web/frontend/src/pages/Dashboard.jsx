import { Link } from "react-router-dom";
import { useWebSocket } from "../hooks/useWebSocket";
import { ECGChart } from "../components/ECGChart";
import { VitalsCard } from "../components/VitalsCard";
import { FlexSensors } from "../components/FlexSensors";
import { AIPredictionCard } from "../components/AIPredictionCard";
import { Navbar } from "../components/Navbar";

export const Dashboard = () => {
  const { isConnected, ecgData, flexData, vitalsData, predictionData } =
    useWebSocket();

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
                  <h2 className="patient-name">Patient Name</h2>
                </div>
                <div className="patient-details">
                  <div className="patient-detail-item">
                    <span className="detail-label">ID:</span>
                    <span className="detail-value">P-2025-001</span>
                  </div>
                  <div className="patient-detail-item">
                    <span className="detail-label">Usia:</span>
                    <span className="detail-value">45 Tahun</span>
                  </div>
                  <div className="patient-detail-item">
                    <span className="detail-label">Sesi:</span>
                    <span className="detail-value">Rehabilitasi #12</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Vitals Card - Row 1, Col 3-4 */}
            <div className="vitals-card-wrapper">
              <VitalsCard vitalsData={vitalsData} isConnected={isConnected} />
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

            {/* ECG - Row 2-3, Col 3-4 */}
            <div className="card dashboard-card ecg-card">
              <div className="card-header">
                <h3 className="card-title">
                  <i className="fas fa-heartbeat"></i>
                  ECG Monitor (AD8232)
                </h3>
                <div className={`connection-badge ${isConnected ? 'connected' : 'disconnected'}`}>
                  <span className="status-dot"></span>
                  {isConnected ? 'Live' : 'Offline'}
                </div>
              </div>
              <div className="ecg-container">
                <div className="ecg-grid">
                  {Array.from({ length: 200 }).map((_, i) => (
                    <div key={i} className="grid-cell"></div>
                  ))}
                </div>
                <ECGChart ecgData={ecgData} isConnected={isConnected} />
              </div>
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
          </div>
        </div>
      </main>

      <style>{`
        .dashboard-page {
          min-height: 100vh;
          background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
        }

        .dashboard-main {
          padding: 100px 0 var(--space-12);
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          grid-template-rows: auto 1fr;
          gap: var(--space-6);
          align-items: stretch;
        }

        /* Patient Info Card - Row 1, Col 1-2 */
        .patient-card {
          grid-column: 1 / 3;
          grid-row: 1;
        }

        /* ECG - Row 1, Col 3-6 */
        .ecg-card {
          grid-column: 3 / 7;
          grid-row: 1;
          min-height: 250px;
          display: flex;
          flex-direction: column;
        }

        /* Flex Sensors - Row 2, Col 1-2 */
        .flex-card {
          grid-column: 1 / 3;
          grid-row: 2;
        }

        /* Vitals Card - Row 2, Col 3-4 */
        .vitals-card-wrapper {
          grid-column: 3 / 5;
          grid-row: 2;
          height: 100%;
        }

        .vitals-card-wrapper > * {
          height: 100%;
        }

        /* AI Prediction - Row 2, Col 5-6 */
        .ai-card {
          grid-column: 5 / 7;
          grid-row: 2;
        }

        .dashboard-card {
          background: rgba(30, 41, 59, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-2xl);
          padding: var(--space-6);
        }

        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-4);
        }

        .card-title {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          font-size: var(--text-lg);
          font-weight: 600;
          color: white;
        }

        .card-title i {
          color: var(--primary-400);
        }

        .connection-badge {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-1) var(--space-3);
          border-radius: var(--radius-full);
          font-size: var(--text-xs);
          font-weight: 600;
        }

        .connection-badge.connected {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        .connection-badge.disconnected {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: currentColor;
          animation: pulse 2s infinite;
        }

        /* Patient Info */
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

        /* ECG */
        .ecg-container {
          flex: 1;
          position: relative;
          background: rgba(15, 23, 42, 0.8);
          border-radius: var(--radius-xl);
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .ecg-grid {
          position: absolute;
          inset: 0;
          display: grid;
          grid-template-columns: repeat(20, 1fr);
          grid-template-rows: repeat(10, 1fr);
          opacity: 0.15;
          pointer-events: none;
        }

        .grid-cell {
          border: 1px solid var(--gray-600);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .dashboard-grid {
            grid-template-columns: 1fr 1fr;
            grid-template-rows: auto;
          }

          .patient-card,
          .flex-card,
          .ecg-card,
          .vitals-card-wrapper,
          .ai-card {
            grid-column: auto;
            grid-row: auto;
          }

          .ecg-card {
            grid-column: span 2;
            min-height: 350px;
          }
        }

        @media (max-width: 768px) {
          .dashboard-main {
            padding: 80px var(--space-4) var(--space-8);
          }

          .dashboard-grid {
            grid-template-columns: 1fr;
          }

          .ecg-card {
            grid-column: span 1;
            min-height: 300px;
          }

          .patient-info {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};
