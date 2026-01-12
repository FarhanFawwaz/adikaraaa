import { useState } from "react";
import { Link } from "react-router-dom";
import "./LevelsGame.css";

const Icons = {
  Back: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  ),
  Chart: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20V10" />
      <path d="M18 20V4" />
      <path d="M6 20v-4" />
    </svg>
  ),
  Check: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="icon-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Unlock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="icon-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  ),
  Lock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="icon-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      status: totalXP >= 50 ? "completed" : "unlocked",
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
      status: totalXP >= 150 ? "completed" : totalXP >= 50 ? "unlocked" : "locked",
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
      status: totalXP >= 300 ? "completed" : totalXP >= 150 ? "unlocked" : "locked",
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
      status: totalXP >= 500 ? "completed" : totalXP >= 300 ? "unlocked" : "locked",
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
      status: totalXP >= 800 ? "completed" : totalXP >= 500 ? "unlocked" : "locked",
      exercises: [
        "Semua gerakan dasar (50x)",
        "Koordinasi kompleks (20x)",
        "Kekuatan maksimal (10x)",
        "Challenge mode",
      ],
    },
  ];

  const currentLevel = levels.filter((l) => l.status === "unlocked")[0] || levels[levels.length - 1];

  // Modal and notification state
  const [activeExercise, setActiveExercise] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const startExercise = (level) => {
    if (level.status === "locked") {
      showNotification(`Level terkunci! Kumpulkan ${level.xpRequired - totalXP} XP lagi.`, "warning");
      return;
    }

    setActiveExercise(level);

    // Simulate exercise completion
    setTimeout(() => {
      const newXP = totalXP + level.xpReward;
      setTotalXP(newXP);
      localStorage.setItem("totalXP", newXP.toString());
      setActiveExercise(null);
      showNotification(`Latihan selesai! +${level.xpReward} XP`, "success");
    }, 2000);
  };

  const resetProgress = () => {
    setTotalXP(0);
    localStorage.setItem("totalXP", "0");
    setShowResetConfirm(false);
    showNotification("Progress telah direset", "info");
  };

  return (
    <div className="levels-page">
      <div className="container">
        <header className="levels-header">
          <Link to="/games" className="back-link">
            <Icons.Back /> Kembali
          </Link>
          <h1>🏆 Level Achievements</h1>
        </header>

        {/* XP Progress Card */}
        <div className="xp-card">
          <p className="subtitle">Total Progress</p>
          <div className="xp-value">
            {totalXP} <span>XP</span>
          </div>
          <div className="current-level-badge">
            <Icons.Chart />
            Current Level: <span className="highlight">{currentLevel?.id || 1}</span> - {currentLevel?.title || "Level 1"}
          </div>
          <div>
            <button onClick={resetProgress} className="reset-btn">
              Reset Progress
            </button>
          </div>
        </div>

        {/* Levels Grid */}
        <div className="levels-grid">
          {levels.map((level) => (
            <div
              key={level.id}
              className={`level-card ${level.status}`}
            >
              <div className="level-card-content">
                <div className="level-main">
                  <div className="level-header">
                    <div className="level-icon">
                      {level.status === "completed" && <Icons.Check />}
                      {level.status === "unlocked" && <Icons.Unlock />}
                      {level.status === "locked" && <Icons.Lock />}
                    </div>
                    <div>
                      <h3 className="level-title">{level.title}</h3>
                      <p className="level-description">{level.description}</p>
                    </div>
                  </div>

                  <div className="xp-tags">
                    <div className="xp-tag">
                      <span className="label">Required:</span>
                      <span className="value">{level.xpRequired} XP</span>
                    </div>
                    <div className="xp-tag">
                      <span className="label">Reward:</span>
                      <span className="value reward">+{level.xpReward} XP</span>
                    </div>
                  </div>

                  <div className="exercises-box">
                    <h4>Latihan:</h4>
                    <ul className="exercises-list">
                      {level.exercises.map((exercise, idx) => (
                        <li key={idx}>
                          <span className="dot"></span>
                          {exercise}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="level-action">
                  <button
                    className={`level-btn ${level.status === "locked" ? "locked" : level.status === "completed" ? "completed" : "active"}`}
                    onClick={() => startExercise(level)}
                    disabled={level.status === "locked"}
                  >
                    {level.status === "locked" ? "Terkunci" : level.status === "completed" ? "Ulangi" : "Mulai"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Master Progress */}
        <div className="master-progress">
          <h3>🎯 Progress ke Master Level</h3>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${Math.min((totalXP / 800) * 100, 100)}%` }}
            />
          </div>
          <p className="progress-text">{totalXP} / 800 XP</p>
        </div>
      </div>
    </div>
  );
};
