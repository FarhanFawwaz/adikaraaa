import { useState } from "react";
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
  Chart: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5 inline-block mr-2 text-primary"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20V10" />
      <path d="M18 20V4" />
      <path d="M6 20v-4" />
    </svg>
  ),
  Check: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-6 h-6 text-green-500"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Unlock: () => (
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
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  ),
  Lock: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-6 h-6 text-slate-500"
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
};

export const LevelsGame = () => {
  const [totalXP, setTotalXP] = useState(() => {
    return parseInt(localStorage.getItem("totalXP") || "0");
  });

  const levels = [
    {
      id: 1,
      title: "Level 1: Gerakan Dasar",
      description: "Latihan membuka dan menutup tangan secara perlahan",
      xpRequired: 0,
      xpReward: 50,
      status: totalXP >= 50 ? "completed" : "unlocked", // Changed to dynamic
      exercises: [
        "Buka tangan perlahan (10x)",
        "Tutup tangan membentuk kepalan (10x)",
        "Gerakan menggenggam (5x)",
      ],
    },
    {
      id: 2,
      title: "Level 2: Koordinasi Jari",
      description: "Latihan gerakan individual tiap jari",
      xpRequired: 50,
      xpReward: 100,
      status:
        totalXP >= 150 ? "completed" : totalXP >= 50 ? "unlocked" : "locked",
      exercises: [
        "Tekuk jari telunjuk (10x)",
        "Tekuk jari tengah (10x)",
        "Tekuk jari manis (10x)",
        "Tekuk jari kelingking (10x)",
      ],
    },
    {
      id: 3,
      title: "Level 3: Kekuatan Genggaman",
      description: "Meningkatkan kekuatan genggaman tangan",
      xpRequired: 150,
      xpReward: 150,
      status:
        totalXP >= 300 ? "completed" : totalXP >= 150 ? "unlocked" : "locked",
      exercises: [
        "Genggam kuat selama 5 detik (5x)",
        "Genggam sedang selama 10 detik (5x)",
        "Gerakan memencet (15x)",
      ],
    },
    {
      id: 4,
      title: "Level 4: Kelincahan",
      description: "Latihan gerakan cepat dan presisi",
      xpRequired: 300,
      xpReward: 200,
      status:
        totalXP >= 500 ? "completed" : totalXP >= 300 ? "unlocked" : "locked",
      exercises: [
        "Buka-tutup cepat (20x)",
        "Gerakan jari bergantian (10x)",
        "Koordinasi semua jari (10x)",
      ],
    },
    {
      id: 5,
      title: "Level 5: Master Rehabilitasi",
      description: "Kombinasi semua gerakan dengan performa tinggi",
      xpRequired: 500,
      xpReward: 300,
      status:
        totalXP >= 800 ? "completed" : totalXP >= 500 ? "unlocked" : "locked",
      exercises: [
        "Semua gerakan dasar (50x)",
        "Koordinasi kompleks (20x)",
        "Kekuatan maksimal (10x)",
        "Challenge mode",
      ],
    },
  ];

  const currentLevel =
    levels.filter((l) => l.status === "unlocked")[0] ||
    levels[levels.length - 1];

  const startExercise = (level) => {
    if (level.status === "locked") {
      alert(
        `Level ini terkunci! Kumpulkan ${level.xpRequired - totalXP} XP lagi.`
      );
      return;
    }

    alert(
      `Memulai ${level.title}!\n\nSelesaikan latihan untuk mendapat ${level.xpReward} XP.`
    );

    // Simulate exercise completion
    setTimeout(() => {
      const newXP = totalXP + level.xpReward;
      setTotalXP(newXP);
      localStorage.setItem("totalXP", newXP.toString());
      alert(`Latihan selesai! +${level.xpReward} XP\nTotal XP: ${newXP}`);
    }, 2000);
  };

  const resetProgress = () => {
    if (confirm("Reset semua progress?")) {
      setTotalXP(0);
      localStorage.setItem("totalXP", "0");
    }
  };

  return (
    <div className="min-h-screen bg-dark text-white p-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center gap-4 mb-8">
          <Link
            to="/games"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <Icons.Back /> Kembali
          </Link>
          <h1 className="text-3xl font-bold text-white">Level Achievements</h1>
        </header>

        <div className="bg-card-dark p-8 rounded-2xl mb-8 border border-slate-700 text-center relative shadow-lg">
          <h2 className="text-slate-400 text-lg mb-2">Total Progress</h2>
          <div className="text-6xl font-bold text-primary mb-4">
            {totalXP} <span className="text-2xl text-slate-500">XP</span>
          </div>
          <div className="text-xl text-slate-300 mb-6 bg-slate-800/50 inline-block px-6 py-2 rounded-full border border-slate-700">
            <Icons.Chart /> Current Level:{" "}
            <span className="text-white font-bold">
              {currentLevel?.id || 1}
            </span>{" "}
            - {currentLevel?.title || "Level 1"}
          </div>
          <div>
            <button
              onClick={resetProgress}
              className="text-sm text-red-500 hover:text-red-400 hover:underline"
            >
              Reset Progress
            </button>
          </div>
        </div>

        <div className="grid gap-6">
          {levels.map((level) => (
            <div
              key={level.id}
              className={`bg-card-dark p-6 rounded-2xl border transition-all ${
                level.status === "locked"
                  ? "border-slate-800 opacity-60"
                  : level.status === "completed"
                  ? "border-green-500/30 bg-green-500/5"
                  : "border-primary/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
              }`}
            >
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className={`w-12 h-12 flex items-center justify-center rounded-xl text-2xl ${
                        level.status === "locked"
                          ? "bg-slate-800"
                          : "bg-slate-700"
                      }`}
                    >
                      {level.status === "completed" && <Icons.Check />}
                      {level.status === "unlocked" && <Icons.Unlock />}
                      {level.status === "locked" && <Icons.Lock />}
                    </div>
                    <div>
                      <h3
                        className={`text-xl font-bold ${
                          level.status === "locked"
                            ? "text-slate-400"
                            : "text-white"
                        }`}
                      >
                        {level.title}
                      </h3>
                      <p className="text-slate-400">{level.description}</p>
                    </div>
                  </div>

                  <div className="flex gap-4 mb-4 text-sm">
                    <div className="bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700">
                      <span className="text-slate-400 mr-2">Required:</span>
                      <strong className="text-white">
                        {level.xpRequired} XP
                      </strong>
                    </div>
                    <div className="bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700">
                      <span className="text-slate-400 mr-2">Reward:</span>
                      <strong className="text-accent">
                        +{level.xpReward} XP
                      </strong>
                    </div>
                  </div>

                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
                    <h4 className="text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                      Latihan:
                    </h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {level.exercises.map((exercise, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 text-slate-400 text-sm"
                        >
                          <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                          {exercise}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex items-center">
                  <button
                    className={`w-full md:w-32 py-3 rounded-xl font-bold transition-all ${
                      level.status === "locked"
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                        : "bg-primary text-white hover:bg-emerald-600 hover:shadow-lg"
                    }`}
                    onClick={() => startExercise(level)}
                    disabled={level.status === "locked"}
                  >
                    {level.status === "locked"
                      ? "Terkunci"
                      : level.status === "completed"
                      ? "Ulangi"
                      : "Mulai"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-slate-800/30 p-6 rounded-2xl border border-slate-700">
          <h3 className="font-bold text-white mb-4">
            Progress ke Master Level
          </h3>
          <div className="h-4 bg-slate-800 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000"
              style={{
                width: `${Math.min((totalXP / 800) * 100, 100)}%`,
              }}
            />
          </div>
          <p className="text-slate-400 text-sm text-right">
            {totalXP} / 800 XP
          </p>
        </div>
      </div>
    </div>
  );
};
