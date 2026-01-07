import { useWebSocket } from "../hooks/useWebSocket";
import { ECGChart } from "../components/ECGChart";
import { VitalsCard } from "../components/VitalsCard";
import { FlexSensors } from "../components/FlexSensors";
// Removed CSS import as we are using Tailwind

export const Dashboard = () => {
  const { isConnected, ecgData, flexData, vitalsData } = useWebSocket();

  return (
    <div className="min-h-screen bg-dark text-white p-6">
      <header className="flex justify-between items-center mb-8 bg-card-dark p-6 rounded-2xl shadow-lg border border-slate-800">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          NeuroRehab AI - Medical Dashboard
        </h1>
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
            isConnected
              ? "bg-green-500/10 text-green-500 border-green-500/20"
              : "bg-red-500/10 text-red-500 border-red-500/20"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          ></span>
          <span className="font-medium text-sm">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 auto-rows-min">
        {/* Left Column - Patient Info */}
        <div className="lg:col-span-1 bg-card-dark p-6 rounded-2xl shadow-lg border border-slate-800 h-fit">
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-10 h-10 text-slate-400"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-200">Patient Name</h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl">
              <span className="text-slate-400 text-sm">ID:</span>
              <strong className="text-slate-200">P-2025-001</strong>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl">
              <span className="text-slate-400 text-sm">Age:</span>
              <strong className="text-slate-200">45 Years</strong>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl">
              <span className="text-slate-400 text-sm">Session:</span>
              <strong className="text-slate-200">Rehabilitation #12</strong>
            </div>
          </div>
        </div>

        {/* Center - ECG */}
        <div className="lg:col-span-2 bg-card-dark p-6 rounded-2xl shadow-lg border border-slate-800 h-[400px] flex flex-col">
          <h3 className="text-lg font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-primary rounded-full"></span>
            ECG Monitor (AD8232)
          </h3>
          <div className="flex-1 bg-slate-900/50 rounded-xl overflow-hidden border border-slate-800 relative">
            <div className="absolute inset-0 grid grid-cols-[repeat(20,1fr)] grid-rows-[repeat(10,1fr)] opacity-20 pointer-events-none">
              {Array.from({ length: 200 }).map((_, i) => (
                <div key={i} className="border border-slate-700/50"></div>
              ))}
            </div>
            <ECGChart ecgData={ecgData} isConnected={isConnected} />
          </div>
        </div>

        {/* Right - Vitals */}
        <div className="lg:col-span-1">
          <VitalsCard vitalsData={vitalsData} isConnected={isConnected} />
        </div>

        {/* Bottom - Flex Sensors */}
        <div className="lg:col-span-4 bg-card-dark p-6 rounded-2xl shadow-lg border border-slate-800">
          <h3 className="text-lg font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-accent rounded-full"></span>
            Flex Sensor Analytics
          </h3>
          <FlexSensors flexData={flexData} isConnected={isConnected} />
        </div>
      </div>
    </div>
  );
};
