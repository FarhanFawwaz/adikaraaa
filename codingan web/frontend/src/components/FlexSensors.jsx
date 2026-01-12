import { useState, useEffect } from "react";

export const FlexSensors = ({ flexData, isConnected }) => {
  const [fingers, setFingers] = useState({
    thumb: 54,
    index: 54,
    middle: 54,
    ring: 54,
    pinky: 54,
  });

  useEffect(() => {
    // Handle both single flex value (from Firebase) and multi-finger values (from mock)
    if (isConnected && flexData) {
      if (flexData.values) {
        // Multi-finger data (mock)
        setFingers(flexData.values);
      } else if (flexData.value !== undefined) {
        // Single flex sensor (from Firebase)
        const rawValue = flexData.value;

        // Debug log
        console.log('[Flex] Raw:', rawValue);

        setFingers({
          thumb: 54,
          index: 54,
          middle: rawValue,
          ring: 54,
          pinky: 54,
        });
      }
    }
  }, [flexData, isConnected]);

  const Icons = {
    thumb: (
      <svg
        className="w-7 h-7 mx-auto"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 12V7a4 4 0 0 1 4-4v0a2 2 0 0 1 2 2v7" />
        <path d="M6 12v7a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H6z" />
      </svg>
    ),
    index: (
      <svg
        className="w-7 h-7 mx-auto"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 20V10" />
        <path d="M12 10l-4 4" />
        <path d="M12 10l4 4" />
      </svg>
    ),
    middle: (
      <svg
        className="w-7 h-7 mx-auto"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="9" y="2" width="6" height="20" rx="3" />
      </svg>
    ),
    ring: (
      <svg
        className="w-7 h-7 mx-auto"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="17" r="2" />
        <rect x="9" y="2" width="6" height="15" rx="3" />
      </svg>
    ),
    pinky: (
      <svg
        className="w-7 h-7 mx-auto"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 22V12a5 5 0 0 0-10 0v10" />
      </svg>
    ),
  };

  const fingerNames = [
    { key: "thumb", label: "Ibu Jari" },
    { key: "index", label: "Telunjuk" },
    { key: "middle", label: "Jari Tengah" },
    { key: "ring", label: "Jari Manis" },
    { key: "pinky", label: "Kelingking" },
  ];

  return (
    <div className="bg-card-dark rounded-xl p border border-white/5 h-full">

      <div className="flex justify-around gap-4">
        {fingerNames.map(({ key, label }) => {
          const value = fingers[key];
          const centerValue = 54;
          const diff = value - centerValue;
          const isPositive = diff >= 0;
          
          // Calculate height percentage (relative to half the container)
          // Assume max deviation is around 50 units (e.g. 54 -> 100 or 54 -> 0)
          const maxDeviation = 50; 
          const heightPercentage = Math.min(100, Math.abs(diff) / maxDeviation * 100);
          
          return (
            <div key={key} className="text-center flex-1">
              <div className="w-full h-64 bg-dark rounded-lg relative overflow-hidden flex flex-col justify-center">
                {/* Center Line */}
                <div className="absolute w-full h-0.5 bg-white/20 top-1/2 -translate-y-1/2 z-10" />

                {/* Animated Bar */}
                <div
                  className={`absolute w-full transition-all duration-300 left-0 ${
                    isPositive 
                      ? "bg-gradient-to-t from-emerald-500 to-emerald-400 bottom-1/2 rounded-t-sm" 
                      : "bg-gradient-to-b from-rose-500 to-rose-400 top-1/2 rounded-b-sm"
                  }`}
                  style={{ 
                    height: `${heightPercentage / 2}%` // /2 because container is full height, we want % of half
                  }}
                />
                
                {/* Value Display */}
                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                   <span className={`text-xs font-mono font-bold ${Math.abs(diff) > 5 ? 'text-white drop-shadow-md' : 'text-slate-500'}`}>
                     {value}
                   </span>
                </div>
              </div>
              <div className="text-slate-400 text-xs mt-2 font-mono">
                {label}
              </div>
            </div>
          );
        })}
      </div>
      {!isConnected && (
        <div className="text-center text-red-400 text-sm mt-4">
          Sensor disconnected - Waiting for data...
        </div>
      )}
    </div>
  );
};
