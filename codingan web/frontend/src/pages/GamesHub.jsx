import { Link } from "react-router-dom";
// Removed CSS import

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
  Controller: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-10 h-10 text-primary"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 12h4m-2-2v4M15 13a3 3 0 0 1 3-3" />
      <path d="M18 13a3 3 0 0 1-3 3" />
      <line x1="16" y1="12" x2="16" y2="12" />
      <path d="M2.2 10.2l1.6-3.2A5 5 0 0 1 7.6 5h8.8a5 5 0 0 1 3.8 2l1.6 3.2a5.5 5.5 0 0 1-1.3 7.4l-3 1.8a5 5 0 0 1-4.8 0l-3-1.8a5.5 5.5 0 0 1-1.3-7.4z" />
    </svg>
  ),
  Bird: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-12 h-12 text-primary"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 7h.01" />
      <path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20" />
      <path d="m20 7 2 .5-2 .5" />
      <path d="M10 18v3" />
      <path d="M14 17.75V21" />
      <path d="M7 18a6 6 0 0 0 3.84-10.61" />
    </svg>
  ),
  Trophy: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-12 h-12 text-accent"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
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
  Star: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4 mr-1 text-yellow-400"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  Muscle: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4 mr-1 text-blue-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  ),
  Chart: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4 mr-1 text-purple-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  ),
  Target: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4 mr-1 text-pink-400"
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
  Lightbulb: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-6 h-6 text-yellow-500"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2 1.5-3.5a6 6 0 0 0-11 0c0 1.5.5 2.5 1.5 3.5.8.8 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  ),
  Calendar: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-12 h-12 text-primary"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />
      <path d="M8 18h.01" />
      <path d="M12 18h.01" />
    </svg>
  ),
  Clock: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4 mr-1 text-orange-400"
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
  CheckCircle: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4 mr-1 text-green-400"
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
  ArrowRight: () => (
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
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
};

export const GamesHub = () => {
  return (
    <div className="min-h-screen bg-dark text-white p-6">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12 space-y-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors text-slate-300 hover:text-white"
          >
            <Icons.Back /> Kembali ke Home
          </Link>
          <div className="flex items-center justify-center gap-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center gap-3">
              <Icons.Controller />
              Game Rehabilitasi
            </h1>
          </div>
          <p className="text-slate-400 text-lg">
            Pilih game untuk memulai latihan rehabilitasi
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link
            to="/game/bird"
            className="group relative bg-card-dark p-8 rounded-3xl border border-slate-700 hover:border-primary transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="mb-6 bg-slate-800/50 w-24 h-24 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Icons.Bird />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Bird Game</h2>
              <p className="text-slate-400 mb-6">
                Kontrol burung terbang dengan gerakan menggenggam tangan
              </p>

              <div className="flex gap-3 mb-6">
                <span className="flex items-center px-3 py-1 bg-green-500/10 text-green-400 text-sm rounded-full border border-green-500/20">
                  <Icons.Star /> Beginner Friendly
                </span>
                <span className="flex items-center px-3 py-1 bg-blue-500/10 text-blue-400 text-sm rounded-full border border-blue-500/20">
                  <Icons.Muscle /> Koordinasi Tangan
                </span>
              </div>

              <button className="w-full py-3 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-xl font-bold group-hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2">
                Mainkan <Icons.ArrowRight />
              </button>
            </div>
          </Link>

          <Link
            to="/game/levels"
            className="group relative bg-card-dark p-8 rounded-3xl border border-slate-700 hover:border-accent transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="mb-6 bg-slate-800/50 w-24 h-24 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Icons.Trophy />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Level Achievements
              </h2>
              <p className="text-slate-400 mb-6">
                Selesaikan level rehabilitasi dan kumpulkan XP
              </p>

              <div className="flex gap-3 mb-6">
                <span className="flex items-center px-3 py-1 bg-purple-500/10 text-purple-400 text-sm rounded-full border border-purple-500/20">
                  <Icons.Chart /> 5 Levels
                </span>
                <span className="flex items-center px-3 py-1 bg-pink-500/10 text-pink-400 text-sm rounded-full border border-pink-500/20">
                  <Icons.Target /> Progressive Training
                </span>
              </div>

              <button className="w-full py-3 bg-gradient-to-r from-accent to-purple-600 text-white rounded-xl font-bold group-hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all flex items-center justify-center gap-2">
                Mulai <Icons.ArrowRight />
              </button>
            </div>
          </Link>

          <Link
            to="/game/daily-exercise"
            className="group relative bg-card-dark p-8 rounded-3xl border border-slate-700 hover:border-orange-500 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="mb-6 bg-slate-800/50 w-24 h-24 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Icons.Calendar />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Latihan Harian
              </h2>
              <p className="text-slate-400 mb-6">
                Program latihan terstruktur untuk rehabilitasi harian
              </p>

              <div className="flex gap-3 mb-6">
                <span className="flex items-center px-3 py-1 bg-orange-500/10 text-orange-400 text-sm rounded-full border border-orange-500/20">
                  <Icons.Clock /> Daily Routine
                </span>
                <span className="flex items-center px-3 py-1 bg-green-500/10 text-green-400 text-sm rounded-full border border-green-500/20">
                  <Icons.CheckCircle /> Track Progress
                </span>
              </div>

              <button className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold group-hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all flex items-center justify-center gap-2">
                Mulai Latihan <Icons.ArrowRight />
              </button>
            </div>
          </Link>
        </div>

        <div className="mt-16 bg-slate-800/30 p-8 rounded-2xl border border-slate-700">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Icons.Lightbulb /> Tips Bermain
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Pastikan sarung tangan sensor terpasang dengan benar",
              "Lakukan pemanasan ringan sebelum bermain",
              "Jangan memaksakan jika merasa lelah atau sakit",
              "Konsultasikan dengan terapis untuk program yang sesuai",
            ].map((tip, index) => (
              <li key={index} className="flex items-start gap-3 text-slate-300">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
