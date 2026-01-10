import React from "react";

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
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      gap: "8px",
    }}>
      {/* Main Prediction Display */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        padding: "8px 0",
      }}>
        <div style={{
          padding: "8px 16px",
          borderRadius: "10px",
          background: statusStyle.bg,
          border: `1px solid ${statusStyle.border}`,
          boxShadow: `0 0 15px ${statusStyle.border}`,
        }}>
          <span style={{
            fontSize: "16px",
            fontWeight: "700",
            color: statusStyle.color,
          }}>
            {data.prediction_label}
          </span>
        </div>

        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}>
          <span style={{
            fontSize: "10px",
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}>
            Confidence
          </span>
          <span style={{
            fontSize: "14px",
            fontWeight: "700",
            color: "white",
          }}>
            {(data.confidence * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Probabilities List */}
      <div style={{
        flex: "1",
        background: "rgba(15, 23, 42, 0.5)",
        borderRadius: "8px",
        padding: "8px 10px",
        border: "1px solid rgba(255, 255, 255, 0.05)",
      }}>
        <div style={{
          fontSize: "9px",
          color: "#64748b",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          fontWeight: "600",
          marginBottom: "6px",
          paddingBottom: "4px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
        }}>
          Class Probabilities
        </div>
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}>
          {Object.entries(data.all_probabilities || {}).map(([label, prob]) => {
            const color = getProbColor(label);
            const icon = getLabelIcon(label);
            return (
              <div key={label} style={{
                display: "grid",
                gridTemplateColumns: "55px 1fr 40px",
                alignItems: "center",
                gap: "8px",
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "11px",
                  color: "#cbd5e1",
                  fontWeight: "500",
                }}>
                  <span style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "3px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "8px",
                    fontWeight: "700",
                    background: `${color}20`,
                    color: color,
                  }}>
                    {icon}
                  </span>
                  {label.split(" ")[0]}
                </div>
                <div style={{
                  height: "4px",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "3px",
                  overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%",
                    width: `${Math.max(prob * 100, 2)}%`,
                    background: `linear-gradient(90deg, ${color}, ${color}88)`,
                    borderRadius: "3px",
                    transition: "width 0.4s ease",
                  }} />
                </div>
                <span style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  color: "white",
                  textAlign: "right",
                }}>
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
