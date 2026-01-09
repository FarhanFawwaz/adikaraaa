import { useState, useEffect } from "react";

export const FlexSensors = ({ flexData, isConnected }) => {
  const [fingers, setFingers] = useState({
    thumb: 0,
    index: 0,
    middle: 0,
    ring: 0,
    pinky: 0,
  });

  useEffect(() => {
    if (isConnected && flexData?.values) {
      setFingers(flexData.values);
    } else {
      // Fallback simulation
      const interval = setInterval(() => {
        setFingers({
          thumb: Math.floor(Math.random() * 100),
          index: Math.floor(Math.random() * 100),
          middle: Math.floor(Math.random() * 100),
          ring: Math.floor(Math.random() * 100),
          pinky: Math.floor(Math.random() * 100),
        });
      }, 1000);

      return () => clearInterval(interval);
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
    <div className="bg-card-dark rounded-xl p-5 border border-white/5 h-full">
     
      <div className="flex justify-around gap-4">
        {fingerNames.map(({ key, label }) => (
          <div key={key} className="text-center flex-1">
            <div className="w-full h-64 bg-dark rounded-lg flex items-end overflow-hidden relative">
              <div
                className={`w-full transition-all duration-300 rounded-t-lg ${
                  fingers[key] > 80
                    ? "bg-purple"
                    : "bg-gradient-to-t from-primary to-blue-400"
                }`}
                style={{ height: `${fingers[key]}%` }}
              />
            </div>
            <div className="text-slate-400 text-xs mt-2 font-mono">
              {fingers[key]}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
