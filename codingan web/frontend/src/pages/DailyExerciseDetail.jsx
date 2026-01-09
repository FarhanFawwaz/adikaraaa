import { useState } from "react";
import { Link, useParams } from "react-router-dom";

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
      className="w-6 h-6"
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
      className="w-6 h-6"
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

const exercisePrograms = [
  {
    id: 1,
    name: "Pemanasan Tangan",
    duration: "5 menit",
    difficulty: "Mudah",
    exercises: [
      { name: "Buka-tutup tangan", reps: "10x", sets: "3 set" },
      { name: "Rotasi pergelangan tangan", reps: "15x", sets: "2 set" },
      { name: "Peregangan jari", reps: "Hold 10s", sets: "5x" },
    ],
    icon: "🤚",
    color: "from-green-500 to-emerald-600",
    borderColor: "border-green-500/30",
    bgColor: "bg-green-500/10",
  },
  {
    id: 2,
    name: "Latihan Kekuatan Genggaman",
    duration: "10 menit",
    difficulty: "Sedang",
    exercises: [
      { name: "Meremas bola stress", reps: "20x", sets: "3 set" },
      { name: "Genggaman penuh", reps: "Hold 5s", sets: "10x" },
      { name: "Gerakan mencubit", reps: "15x", sets: "3 set" },
    ],
    icon: "💪",
    color: "from-blue-500 to-cyan-600",
    borderColor: "border-blue-500/30",
    bgColor: "bg-blue-500/10",
  },
  {
    id: 3,
    name: "Koordinasi Jari",
    duration: "8 menit",
    difficulty: "Sedang",
    exercises: [
      { name: "Sentuh jempol ke tiap jari", reps: "10x", sets: "3 set" },
      { name: "Piano fingers", reps: "20x", sets: "2 set" },
      { name: "Gerakan oposisi", reps: "15x", sets: "3 set" },
    ],
    icon: "👆",
    color: "from-purple-500 to-pink-600",
    borderColor: "border-purple-500/30",
    bgColor: "bg-purple-500/10",
  },
  {
    id: 4,
    name: "Latihan Fleksibilitas",
    duration: "12 menit",
    difficulty: "Mudah",
    exercises: [
      { name: "Peregangan pasif jari", reps: "Hold 15s", sets: "5x" },
      { name: "Gerakan pergelangan tangan", reps: "20x", sets: "3 set" },
      { name: "Rentang gerak penuh", reps: "10x", sets: "3 set" },
    ],
    icon: "🤲",
    color: "from-orange-500 to-red-600",
    borderColor: "border-orange-500/30",
    bgColor: "bg-orange-500/10",
  },
];

export const DailyExerciseDetail = () => {
  const { week, day } = useParams();
  const [completedExercises, setCompletedExercises] = useState([]);

  const toggleComplete = (id) => {
    if (completedExercises.includes(id)) {
      setCompletedExercises(completedExercises.filter((exId) => exId !== id));
    } else {
      setCompletedExercises([...completedExercises, id]);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Mudah":
        return "text-green-400 bg-green-500/10 border-green-500/30";
      case "Sedang":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
      case "Sulit":
        return "text-red-400 bg-red-500/10 border-red-500/30";
      default:
        return "text-slate-400 bg-slate-500/10 border-slate-500/30";
    }
  };

  const completionPercentage = (
    (completedExercises.length / exercisePrograms.length) *
    100
  ).toFixed(0);

  return (
    <div className="min-h-screen bg-dark text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-12 space-y-6">
          <Link
            to="/daily-exercises"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors text-slate-300 hover:text-white"
          >
            <Icons.Back /> Kembali ke Kalender
          </Link>

          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="text-orange-500">
                <Icons.Calendar />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                Minggu {week} - Hari {day}
              </h1>
            </div>
            <p className="text-slate-400 text-lg">
              Program latihan untuk hari ini
            </p>
          </div>

          {/* Progress Overview */}
          <div className="bg-card-dark p-6 rounded-2xl border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">
                  Progress Hari Ini
                </h3>
                <p className="text-slate-400 text-sm">
                  {completedExercises.length} dari {exercisePrograms.length}{" "}
                  program selesai
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-orange-500">
                  {completionPercentage}%
                </div>
                <div className="flex items-center gap-1 text-orange-400 text-sm mt-1">
                  <Icons.Fire />
                  {completedExercises.length > 0 ? (
                    <span>Keep going!</span>
                  ) : (
                    <span>Mulai latihan</span>
                  )}
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

        {/* Exercise Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {exercisePrograms.map((program) => {
            const isCompleted = completedExercises.includes(program.id);
            return (
              <div
                key={program.id}
                className={`relative bg-card-dark p-6 rounded-2xl border transition-all duration-300 ${
                  isCompleted
                    ? "border-green-500/50 bg-green-500/5"
                    : program.borderColor
                } hover:shadow-lg`}
              >
                {/* Completion Badge */}
                {isCompleted && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white p-2 rounded-full shadow-lg">
                    <Icons.CheckCircle />
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{program.icon}</div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {program.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-1 text-slate-400 text-sm">
                          <Icons.Clock />
                          {program.duration}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs border ${getDifficultyColor(
                            program.difficulty
                          )}`}
                        >
                          {program.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Exercise List */}
                <div className="space-y-2 mb-4">
                  {program.exercises.map((exercise, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 flex items-center justify-center bg-slate-700 rounded-full text-xs text-slate-400">
                          {idx + 1}
                        </span>
                        <span className="text-slate-300 text-sm">
                          {exercise.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Icons.Repeat />
                          {exercise.reps}
                        </span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Icons.Target />
                          {exercise.sets}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <button
                  onClick={() => toggleComplete(program.id)}
                  className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                    isCompleted
                      ? "bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30"
                      : `bg-gradient-to-r ${program.color} text-white hover:shadow-lg`
                  }`}
                >
                  {isCompleted ? (
                    <>
                      <Icons.CheckCircle /> Selesai
                    </>
                  ) : (
                    <>
                      <Icons.Play /> Mulai Latihan
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Achievement Section */}
        {completedExercises.length === exercisePrograms.length && (
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-8 rounded-2xl border border-yellow-500/30 text-center">
            <div className="text-yellow-500 flex justify-center mb-4">
              <Icons.Trophy />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Selamat! 🎉</h3>
            <p className="text-slate-300 mb-4">
              Anda telah menyelesaikan semua latihan hari ini!
            </p>
            <div className="flex items-center justify-center gap-2 text-yellow-400">
              <Icons.Fire />
              <span className="font-bold">+100 XP Earned!</span>
            </div>
          </div>
        )}

        {/* Tips Section */}
        <div className="mt-8 bg-slate-800/30 p-6 rounded-2xl border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4">💡 Tips Latihan</h3>
          <ul className="space-y-2">
            {[
              "Lakukan latihan secara konsisten setiap hari",
              "Jangan memaksakan gerakan yang terasa sakit",
              "Istirahat 30-60 detik antar set",
              "Gunakan sarung tangan sensor untuk tracking akurat",
              "Konsultasikan dengan terapis untuk program yang sesuai",
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
