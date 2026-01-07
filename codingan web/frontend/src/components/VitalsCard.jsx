import { useState, useEffect } from "react";

export const VitalsCard = ({ vitalsData, isConnected }) => {
  const [bpm, setBpm] = useState(72);
  const [spo2, setSpo2] = useState(98);

  useEffect(() => {
    if (isConnected && vitalsData?.data) {
      setBpm(vitalsData.data.bpm);
      setSpo2(vitalsData.data.spo2);
    } else {
      // Fallback simulation
      const interval = setInterval(() => {
        setBpm(Math.floor(Math.random() * (90 - 65 + 1) + 65));
        setSpo2(Math.floor(Math.random() * (99 - 96 + 1) + 96));
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [vitalsData, isConnected]);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-card-dark rounded-xl p-5 text-center border border-white/5 shadow-md">
        <svg
          className="w-8 h-8 mx-auto mb-2 text-red-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 21C12 21 7 16.5 7 12.5C7 9.5 9.5 7 12 7C14.5 7 17 9.5 17 12.5C17 16.5 12 21 12 21Z" />
          <circle cx="12" cy="12.5" r="2.5" />
        </svg>
        <div className="text-slate-400 text-sm mb-2">Heart Rate</div>
        <div className="text-text-light text-4xl font-bold mb-1 animate-pulse">
          {bpm}
        </div>
        <div className="text-slate-500 text-xs">BPM</div>
      </div>

      <div className="bg-card-dark rounded-xl p-5 text-center border border-white/5 shadow-md">
        <svg
          className="w-8 h-8 mx-auto mb-2 text-blue-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <ellipse cx="12" cy="12" rx="8" ry="10" />
          <path d="M12 22c4-2 8-7.5 8-10a8 8 0 1 0-16 0c0 2.5 4 8 8 10z" />
        </svg>
        <div className="text-slate-400 text-sm mb-2">Oxygen</div>
        <div className="text-text-light text-4xl font-bold mb-1">{spo2}%</div>
        <div className="text-slate-500 text-xs">SpO2</div>
      </div>
    </div>
  );
};
