import React from "react";
import "../css/AIPredictionCard.css";

export const AIPredictionCard = ({ predictionData }) => {
  const data = predictionData || {
    prediction_label: "Waiting...",
    confidence: 0,
    all_probabilities: {
      "A (AFib)": 0,
      "N (Normal)": 0,
      "O (Other)": 0,
      "~ (Noisy)": 0,
    },
  };

  const getStatusStyle = (label) => {
    if (label.includes("Normal")) {
      return { color: "#10b981", bg: "rgba(16, 185, 129, 0.15)", border: "rgba(16, 185, 129, 0.3)" };
    }
    if (label.includes("AFib")) {
      return { color: "#ef4444", bg: "rgba(239, 68, 68, 0.15)", border: "rgba(239, 68, 68, 0.3)" };
    }
    if (label.includes("Noisy")) {
      return { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)", border: "rgba(245, 158, 11, 0.3)" };
    }
    return { color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.15)", border: "rgba(139, 92, 246, 0.3)" };
  };

  const getProbColor = (label) => {
    if (label.includes("Normal")) return "#10b981";
    if (label.includes("AFib")) return "#ef4444";
    if (label.includes("Noisy")) return "#f59e0b";
    if (label.includes("Other")) return "#3b82f6";
    return "#8b5cf6";
  };

  const getLabelIcon = (label) => {
    if (label.includes("Normal")) return "✓";
    if (label.includes("AFib")) return "⚠";
    if (label.includes("Noisy")) return "~";
    return "○";
  };

  const statusStyle = getStatusStyle(data.prediction_label);

  return (
    <div className="ai-prediction-content">
      {/* Main Prediction Display */}
      <div className="prediction-main">
        <div 
          className="prediction-badge"
          style={{
            background: statusStyle.bg,
            borderColor: statusStyle.border,
            boxShadow: `0 0 15px ${statusStyle.border}`
          }}
        >
          <span 
            className="prediction-label"
            style={{ color: statusStyle.color }}
          >
            {data.prediction_label}
          </span>
        </div>

        <div className="prediction-confidence">
          <span className="confidence-label">Confidence</span>
          <span className="confidence-value">
            {(data.confidence * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Probabilities List */}
      <div className="probabilities-list">
        <div className="prob-title">Class Probabilities</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {Object.entries(data.all_probabilities || {}).map(([label, prob]) => {
            const color = getProbColor(label);
            const icon = getLabelIcon(label);
            return (
              <div key={label} className="prob-item">
                <div className="prob-label-wrapper">
                  <span 
                    className="prob-icon"
                    style={{ background: `${color}20`, color: color }}
                  >
                    {icon}
                  </span>
                  {label.split(" ")[0]}
                </div>
                <div className="prob-bar-bg">
                  <div 
                    className="prob-bar-fill"
                    style={{
                      width: `${Math.max(prob * 100, 2)}%`,
                      background: `linear-gradient(90deg, ${color}, ${color}88)`
                    }} 
                  />
                </div>
                <span className="prob-value">
                  {(prob * 100).toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
