import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./DailyExerciseDetail.css";

const Icons = {
  Back: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  ),
  Calendar: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="icon-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  CheckCircle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  Clock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Repeat: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  ),
  Target: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  Play: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  ),
  Trophy: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="icon-xl" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M7 4h10" />
      <path d="M17 4v3a5 5 0 0 1-10 0V4" />
      <path d="M3 6h4" />
      <path d="M21 6h-4" />
    </svg>
  ),
  Fire: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
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
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
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
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  },
];

export const DailyExerciseDetail = () => {
  const params = useParams();
  // Default to week 1, day 1 if not provided in URL
  // Current date is used to simulate "today"
  const today = new Date();
  const dayOfWeek = today.getDay() || 7; // Sunday = 7, Mon-Sat = 1-6
  const weekNumber = Math.ceil((today.getDate() + 6 - dayOfWeek) / 7);

  const week = params.week || weekNumber || 1;
  const day = params.day || dayOfWeek || 1;

  const [completedExercises, setCompletedExercises] = useState([]);

  const toggleComplete = (id) => {
    if (completedExercises.includes(id)) {
      setCompletedExercises(completedExercises.filter((exId) => exId !== id));
    } else {
      setCompletedExercises([...completedExercises, id]);
    }
  };

  const completionPercentage = (
    (completedExercises.length / exercisePrograms.length) *
    100
  ).toFixed(0);

  // Weekly progress mock data (in real app, this would come from backend/localStorage)
  const currentDay = parseInt(day) || 1;
  const weeklyProgress = {
    daysCompleted: currentDay - 1, // Days before today that are marked complete
    totalDays: 7,
    days: [
      { day: 1, name: "Sen", status: currentDay > 1 ? "completed" : currentDay === 1 ? "current" : "upcoming" },
      { day: 2, name: "Sel", status: currentDay > 2 ? "completed" : currentDay === 2 ? "current" : "upcoming" },
      { day: 3, name: "Rab", status: currentDay > 3 ? "completed" : currentDay === 3 ? "current" : "upcoming" },
      { day: 4, name: "Kam", status: currentDay > 4 ? "completed" : currentDay === 4 ? "current" : "upcoming" },
      { day: 5, name: "Jum", status: currentDay > 5 ? "completed" : currentDay === 5 ? "current" : "upcoming" },
      { day: 6, name: "Sab", status: currentDay > 6 ? "completed" : currentDay === 6 ? "current" : "upcoming" },
      { day: 7, name: "Min", status: currentDay > 7 ? "completed" : currentDay === 7 ? "current" : "upcoming" },
    ]
  };
  const weeklyPercentage = ((weeklyProgress.daysCompleted / weeklyProgress.totalDays) * 100).toFixed(0);

  return (
    <div className="exercise-detail-page">
      <div className="container">
        {/* Header */}
        <header className="exercise-header">
          <Link to="/daily-exercises" className="back-link">
            <Icons.Back /> Kembali ke Kalender
          </Link>

          <div className="header-title">
            <div className="title-badge">
              <Icons.Calendar />
              <h1>Minggu {week} - Hari {day}</h1>
            </div>
           
          </div>

          {/* Progress Card */}
          <div className="progress-card">
            <div className="progress-info">
              <div className="progress-left">
                <h3>Progress Hari Ini</h3>
                <span>{completedExercises.length} dari {exercisePrograms.length} program selesai</span>
              </div>
              <div className="progress-right">
                <div className="progress-percentage">{completionPercentage}%</div>
                <div className="progress-status">
                  <Icons.Fire />
                  <span>{completedExercises.length > 0 ? "Keep going!" : "Mulai latihan"}</span>
                </div>
              </div>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${completionPercentage}%` }} />
            </div>
          </div>

          {/* Weekly Progress Card */}
          <div className="progress-card weekly">
            <div className="progress-info">
              <div className="progress-left">
                <h3>Progress Minggu {week}</h3>
                <span>{weeklyProgress.daysCompleted} dari {weeklyProgress.totalDays} hari selesai</span>
              </div>
              <div className="progress-right">
                <div className="progress-percentage weekly-pct">{weeklyPercentage}%</div>
              </div>
            </div>
            <div className="weekly-days">
              {weeklyProgress.days.map((d) => (
                <div key={d.day} className={`day-indicator ${d.status}`}>
                  <span className="day-name">{d.name}</span>
                  <div className="day-circle">
                    {d.status === "completed" && <Icons.CheckCircle />}
                    {d.status === "current" && <span className="day-number">{d.day}</span>}
                    {d.status === "upcoming" && <span className="day-number">{d.day}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* Exercise Grid */}
        <div className="exercise-grid">
          {exercisePrograms.map((program) => {
            const isCompleted = completedExercises.includes(program.id);
            return (
              <div key={program.id} className={`exercise-card ${isCompleted ? 'completed' : ''}`}>
                {isCompleted && (
                  <div className="completion-badge">
                    <Icons.CheckCircle />
                  </div>
                )}

                <div className="exercise-card-header">
                  <div className="exercise-icon-wrapper" style={{ background: program.gradient }}>
                    <span className="exercise-emoji">{program.icon}</span>
                  </div>
                  <div className="exercise-meta">
                    <h3>{program.name}</h3>
                    <div className="exercise-tags">
                      <span className="tag time">
                        <Icons.Clock /> {program.duration}
                      </span>
                      <span className={`tag difficulty ${program.difficulty.toLowerCase()}`}>
                        {program.difficulty}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="exercise-list">
                  {program.exercises.map((exercise, idx) => (
                    <div key={idx} className="exercise-item">
                      <div className="exercise-name">
                        <span className="exercise-number">{idx + 1}</span>
                        <span>{exercise.name}</span>
                      </div>
                      <div className="exercise-details">
                        <span><Icons.Repeat /> {exercise.reps}</span>
                        <span><Icons.Target /> {exercise.sets}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => toggleComplete(program.id)}
                  className={`exercise-btn ${isCompleted ? 'btn-completed' : ''}`}
                  style={!isCompleted ? { background: program.gradient } : {}}
                >
                  {isCompleted ? (
                    <><Icons.CheckCircle /> Selesai</>
                  ) : (
                    <><Icons.Play /> Mulai Latihan</>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Achievement */}
        {completedExercises.length === exercisePrograms.length && (
          <div className="achievement-card">
            <div className="achievement-icon">
              <Icons.Trophy />
            </div>
            <h3>Selamat! 🎉</h3>
            <p>Anda telah menyelesaikan semua latihan hari ini!</p>
            <div className="xp-badge">
              <Icons.Fire />
              <span>+100 XP Earned!</span>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="tips-card">
          <h3>💡 Tips Latihan</h3>
          <ul>
            {[
              "Lakukan latihan secara konsisten setiap hari",
              "Jangan memaksakan gerakan yang terasa sakit",
              "Istirahat 30-60 detik antar set",
              "Gunakan sarung tangan sensor untuk tracking akurat",
              "Konsultasikan dengan terapis untuk program yang sesuai",
            ].map((tip, index) => (
              <li key={index}>
                <span className="tip-number">{index + 1}</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
