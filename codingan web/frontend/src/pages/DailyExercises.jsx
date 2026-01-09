import { useState } from "react";
import { Link } from "react-router-dom";

const Icons = {
  Back: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  ),
  Calendar: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-8 h-8"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  CheckCircle: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  Lock: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  Circle: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-6 h-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  ),
  Clock: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Repeat: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  ),
  Target: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  Play: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  ),
  Trophy: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-6 h-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M7 4h10" />
      <path d="M17 4v3a5 5 0 0 1-10 0V4" />
      <path d="M3 6h4" />
      <path d="M21 6h-4" />
    </svg>
  ),
  Fire: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  ),
};

const weekData = [
  { week: 1, days: 7 },
  { week: 2, days: 7 },
  { week: 3, days: 7 },
  { week: 4, days: 7 },
];

export const DailyExercises = () => {
  // Simulasi data hari yang sudah diselesaikan
  // Format: "week-day" (contoh: "1-1" = minggu 1 hari 1)
  const [completedDays, setCompletedDays] = useState(["1-1", "1-2", "2-1"]);

  const isDayCompleted = (week, day) => {
    return completedDays.includes(`${week}-${day}`);
  };

  const getDayStatus = (week, day) => {
    // Simulasi: hari ini adalah hari ke-3 minggu ke-1
    const currentWeek = 1;
    const currentDayInWeek = 3;

    const totalDaysFromStart = (week - 1) * 7 + day;
    const currentTotalDays = (currentWeek - 1) * 7 + currentDayInWeek;

    if (totalDaysFromStart < currentTotalDays) {
      return isDayCompleted(week, day) ? "completed" : "missed";
    } else if (totalDaysFromStart === currentTotalDays) {
      return "current";
    } else {
      return "locked";
    }
  };

  const getDayStyles = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 border-green-500 text-green-400 hover:bg-green-500/30";
      case "current":
        return "bg-orange-500/20 border-orange-500 text-orange-400 hover:bg-orange-500/30 ring-2 ring-orange-500/50";
      case "missed":
        return "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20";
      case "locked":
        return "bg-slate-800/50 border-slate-700 text-slate-500 cursor-not-allowed";
      default:
        return "bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700";
    }
  };

  const totalDays = weekData.reduce((sum, week) => sum + week.days, 0);
  const completedCount = completedDays.length;
  const completionPercentage = ((completedCount / totalDays) * 100).toFixed(0);

  return (
    <div className="min-h-screen bg-dark text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-12 space-y-6">
          <Link
            to="/games"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors text-slate-300 hover:text-white"
          >
            <Icons.Back /> Kembali ke Games Hub
          </Link>

          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="text-orange-500">
                <Icons.Calendar />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                Latihan Harian
              </h1>
            </div>
            <p className="text-slate-400 text-lg">
              Pilih hari untuk memulai program latihan rehabilitasi
            </p>
          </div>

          {/* Progress Overview */}
          <div className="bg-card-dark p-6 rounded-2xl border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">
                  Progress Keseluruhan
                </h3>
                <p className="text-slate-400 text-sm">
                  {completedCount} dari {totalDays} hari selesai
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-orange-500">
                  {completionPercentage}%
                </div>
                <div className="flex items-center gap-1 text-orange-400 text-sm mt-1">
                  <Icons.Fire />
                  <span>{completedCount} hari berturut-turut</span>
                </div>
              </div>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500 rounded-full"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </header>

        {/* Weekly Calendar */}
        <div className="space-y-8">
          {weekData.map(({ week, days }) => (
            <div
              key={week}
              className="bg-card-dark p-6 rounded-2xl border border-slate-700"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Minggu {week}</h2>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Icons.Target />
                  <span>
                    {
                      completedDays.filter((d) => d.startsWith(`${week}-`))
                        .length
                    }{" "}
                    / {days} hari
                  </span>
                </div>
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-3">
                {Array.from({ length: days }, (_, i) => {
                  const day = i + 1;
                  const status = getDayStatus(week, day);
                  const isLocked = status === "locked";
                  const isCompleted = status === "completed";
                  const isCurrent = status === "current";

                  return isLocked ? (
                    <div
                      key={day}
                      className={`aspect-square flex flex-col items-center justify-center rounded-xl border-2 transition-all ${getDayStyles(
                        status
                      )}`}
                    >
                      <Icons.Lock />
                      <span className="text-sm font-bold mt-1">{day}</span>
                    </div>
                  ) : (
                    <Link
                      key={day}
                      to={`/daily-exercises/${week}/${day}`}
                      className={`aspect-square flex flex-col items-center justify-center rounded-xl border-2 transition-all ${getDayStyles(
                        status
                      )} relative group`}
                    >
                      {isCompleted && (
                        <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-1">
                          <Icons.CheckCircle />
                        </div>
                      )}
                      {isCurrent && (
                        <div className="absolute -top-1 -right-1 bg-orange-500 text-white rounded-full p-1 animate-pulse">
                          <Icons.Fire />
                        </div>
                      )}
                      <span className="text-2xl font-bold">{day}</span>
                      <span className="text-xs mt-1 opacity-75">
                        {isCompleted
                          ? "Selesai"
                          : isCurrent
                          ? "Hari ini"
                          : "Mulai"}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-8 bg-slate-800/30 p-6 rounded-2xl border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4">Keterangan</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-500/20 border-2 border-orange-500" />
              <span className="text-sm text-slate-300">Hari Ini</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 border-2 border-green-500 flex items-center justify-center text-green-400">
                <Icons.CheckCircle />
              </div>
              <span className="text-sm text-slate-300">Selesai</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 border-2 border-red-500/30" />
              <span className="text-sm text-slate-300">Terlewat</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-800/50 border-2 border-slate-700 flex items-center justify-center text-slate-500">
                <Icons.Lock />
              </div>
              <span className="text-sm text-slate-300">Terkunci</span>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-slate-800/30 p-6 rounded-2xl border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4">
            💡 Tips Latihan Harian
          </h3>
          <ul className="space-y-2">
            {[
              "Lakukan latihan di waktu yang sama setiap hari untuk membentuk kebiasaan",
              "Jangan skip hari latihan untuk hasil yang maksimal",
              "Setiap hari berisi 4 program latihan yang berbeda",
              "Konsistensi adalah kunci keberhasilan rehabilitasi",
              "Catat progres Anda dan diskusikan dengan terapis",
            ].map((tip, index) => (
              <li key={index} className="flex items-start gap-3 text-slate-300">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2.5" />
                <span className="text-sm">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
