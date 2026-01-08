import React from "react";

export const AIPredictionCard = ({ predictionData }) => {
  // Default state jika belum ada data
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

  const getStatusColor = (label) => {
    if (label.includes("Normal"))
      return "text-green-400 bg-green-400/10 border-green-400/20";
    if (label.includes("AFib"))
      return "text-red-400 bg-red-400/10 border-red-400/20";
    if (label.includes("Noisy"))
      return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
    return "text-blue-400 bg-blue-400/10 border-blue-400/20";
  };

  return (
    <div className="bg-card-dark p-6 rounded-2xl shadow-lg border border-slate-800 h-full flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-slate-300 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-purple-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          AI Diagnosis
        </h3>
        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
          Live Analysis
        </span>
      </div>

      <div className="flex flex-col items-center justify-center my-2">
        <div
          className={`text-2xl font-bold px-6 py-3 rounded-xl border ${getStatusColor(
            data.prediction_label
          )} mb-2 transition-all duration-300`}
        >
          {data.prediction_label}
        </div>
        <div className="text-slate-400 text-sm">
          Confidence:{" "}
          <span className="text-white font-medium">
            {(data.confidence * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="text-xs text-slate-500 uppercase font-semibold mb-2">
          Probabilities
        </div>
        {Object.entries(data.all_probabilities || {}).map(([label, prob]) => (
          <div key={label} className="flex items-center gap-2 text-sm">
            <span className="text-slate-400 w-20 truncate">
              {label.split(" ")[0]}
            </span>
            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${prob * 100}%` }}
              />
            </div>
            <span className="text-slate-300 w-10 text-right">
              {(prob * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
