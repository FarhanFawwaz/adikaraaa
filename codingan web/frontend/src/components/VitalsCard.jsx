import { useState, useEffect } from "react";
import "../css/Dashboard.css";

export const VitalsCard = ({ vitalsData, isConnected }) => {
  const [bpm, setBpm] = useState(null);
  const [spo2, setSpo2] = useState(null);

  useEffect(() => {
    if (isConnected && vitalsData) {
      if (vitalsData.bpm !== undefined) setBpm(vitalsData.bpm);
      if (vitalsData.spo2 !== undefined) setSpo2(vitalsData.spo2);
    }
  }, [vitalsData, isConnected]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', height: '100%' }}>
      {/* Heart Rate Card */}
      <div className="dashboard-card" style={{ alignItems: 'center', justifyContent: 'center', padding: '1.5rem 1rem' }}>
        <div style={{ 
          width: '50px', 
          height: '50px', 
          borderRadius: '12px', 
          background: 'rgba(239, 68, 68, 0.15)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          marginBottom: '1rem'
        }}>
          <i className="fas fa-heartbeat" style={{ fontSize: '1.5rem', color: '#ef4444' }}></i>
        </div>
        
        <div style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Heart Rate</div>
        
        <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'white', lineHeight: '1' }}>
           {bpm !== null ? bpm : "--"}
        </div>
        
        <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.25rem' }}>BPM</div>
        
        {!isConnected && (
          <div className="status-badge disconnected" style={{ marginTop: '0.75rem' }}>
            Disconnected
          </div>
        )}
      </div>

      {/* Oxygen Card */}
      <div className="dashboard-card" style={{ alignItems: 'center', justifyContent: 'center', padding: '1.5rem 1rem' }}>
        <div style={{ 
          width: '50px', 
          height: '50px', 
          borderRadius: '12px', 
          background: 'rgba(56, 189, 248, 0.15)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          marginBottom: '1rem'
        }}>
          <i className="fas fa-lungs" style={{ fontSize: '1.5rem', color: '#38bdf8' }}></i>
        </div>
        
        <div style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Oxygen</div>
        
        <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'white', lineHeight: '1' }}>
           {spo2 !== null ? `${spo2}%` : "--"}
        </div>
        
        <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.25rem' }}>SpO2</div>
        
        {!isConnected && (
          <div className="status-badge disconnected" style={{ marginTop: '0.75rem' }}>
            Disconnected
          </div>
        )}
      </div>
    </div>
  );
};
