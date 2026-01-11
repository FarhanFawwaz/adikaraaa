import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "../css/FingerPiano.css";
import { Navbar } from "../components/Navbar.jsx";

export const FingerPiano = () => {
  const canvasRef = useRef(null);
  const animationIdRef = useRef(null);
  const audioContextRef = useRef(null);
  const wsRef = useRef(null);
  // Game refs to avoid re-render on every frame and keep animation smooth
  const isPlayingRef = useRef(false);
  const currentNoteRef = useRef(0);
  const noteYRef = useRef(-50);
  const targetYRef = useRef(320);
  const sequenceRef = useRef(["C", "D", "E", "F", "G"]);
  const scoreRef = useRef(0);
  const streakRef = useRef(0);
  const lastFlexValuesRef = useRef({
    thumb: 0,
    index: 0,
    middle: 0,
    ring: 0,
    pinky: 0,
  });

  const [gameState, setGameState] = useState({
    isPlaying: false,
    currentNote: 0,
    score: 0,
    streak: 0,
    sequence: ["C", "D", "E", "F", "G"],
    noteY: -50,
    targetY: 320,
  });

  const [nextNoteHint, setNextNoteHint] = useState("Siap? Tekan Mulai!");
  const [feedback, setFeedback] = useState({ message: "", type: "" });
  const [hitEffect, setHitEffect] = useState({ show: false, emoji: "✨" });
  const [wsConnected, setWsConnected] = useState(false);
  const [flexValues, setFlexValues] = useState({
    thumb: 0,
    index: 0,
    middle: 0,
    ring: 0,
    pinky: 0,
  });

  const NOTE_FREQUENCIES = {
    C: 261.63,
    D: 293.66,
    E: 329.63,
    F: 349.23,
    G: 392.0,
  };

  const KEY_TO_NOTE = {
    a: "C",
    s: "D",
    d: "E",
    f: "F",
    g: "G",
  };

  // Flex threshold untuk deteksi gerakan jari
  const FLEX_THRESHOLD = 500; // Adjust sesuai kebutuhan

  // Map finger to note
  const FINGER_TO_NOTE = {
    thumb: "C",
    index: "D",
    middle: "E",
    ring: "F",
    pinky: "G",
  };

  // Initialize audio context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext ||
      window.webkitAudioContext)();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // WebSocket Connection
  useEffect(() => {
    const connectWebSocket = () => {
      const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
      const host = window.location.hostname || "localhost";
      const port =
        window.location.port === "5173" || window.location.port === ""
          ? "8080"
          : window.location.port;
      const wsUrl = `${wsScheme}://${host}:${port}/api/ws`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log("[FingerPiano] WebSocket connected");
        setWsConnected(true);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "flex" && data.values) {
            const newFlexValues = {
              thumb: data.values.thumb ?? lastFlexValuesRef.current.thumb,
              index: data.values.index ?? lastFlexValuesRef.current.index,
              middle: data.values.middle ?? lastFlexValuesRef.current.middle,
              ring: data.values.ring ?? lastFlexValuesRef.current.ring,
              pinky: data.values.pinky ?? lastFlexValuesRef.current.pinky,
            };

            // Detect finger bending (trigger note)
            Object.keys(newFlexValues).forEach((finger) => {
              const currentValue = newFlexValues[finger];
              const lastValue = lastFlexValuesRef.current[finger];

              // Deteksi jika jari ditekuk (nilai flex meningkat melewati threshold)
              if (
                currentValue > FLEX_THRESHOLD &&
                lastValue <= FLEX_THRESHOLD
              ) {
                const note = FINGER_TO_NOTE[finger];
                if (note) {
                  checkHit(note);
                }
              }
            });

            lastFlexValuesRef.current = newFlexValues;
            setFlexValues(newFlexValues);
          }
        } catch (error) {
          console.error("[FingerPiano] WebSocket message error:", error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("[FingerPiano] WebSocket error:", error);
        setWsConnected(false);
      };

      wsRef.current.onclose = () => {
        console.log("[FingerPiano] WebSocket disconnected");
        setWsConnected(false);

        // Reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Keyboard handler (fallback)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      const note = KEY_TO_NOTE[key];
      if (note) {
        e.preventDefault();
        checkHit(note);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [gameState]);

  const startPractice = () => {
    // Initialize refs
    isPlayingRef.current = true;
    currentNoteRef.current = 0;
    noteYRef.current = -50;
    scoreRef.current = 0;
    streakRef.current = 0;
    sequenceRef.current = ["C", "D", "E", "F", "G"];
    targetYRef.current = 320;

    // Sync minimal UI state
    setGameState((prev) => ({
      ...prev,
      isPlaying: true,
      currentNote: 0,
      noteY: -50,
      score: 0,
      streak: 0,
    }));
    setNextNoteHint(`Siap: ${sequenceRef.current[0]}`);

    // Start game loop
    animationIdRef.current = requestAnimationFrame(gameLoop);
  };

  const gameLoop = () => {
    if (!isPlayingRef.current || currentNoteRef.current >= 50) {
      endPractice();
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      animationIdRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    const ctx = canvas.getContext("2d");
    const currentNoteName = sequenceRef.current[currentNoteRef.current % 5];

    // Clear canvas
    ctx.fillStyle = "#111827";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw hit zone
    ctx.fillStyle = "rgba(16, 185, 129, 0.2)";
    ctx.fillRect(0, targetYRef.current - 60, canvas.width, 120);

    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, targetYRef.current);
    ctx.lineTo(canvas.width, targetYRef.current);
    ctx.stroke();

    // Draw note position
    const notePositions = {
      C: canvas.width * 0.1,
      D: canvas.width * 0.3,
      E: canvas.width * 0.5,
      F: canvas.width * 0.7,
      G: canvas.width * 0.9,
    };
    const x = notePositions[currentNoteName];

    // Draw falling note
    const gradient = ctx.createRadialGradient(
      x,
      noteYRef.current,
      0,
      x,
      noteYRef.current,
      35
    );
    gradient.addColorStop(0, "#667eea");
    gradient.addColorStop(1, "#764ba2");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, noteYRef.current, 35, 0, Math.PI * 2);
    ctx.fill();

    // Draw note label
    ctx.fillStyle = "white";
    ctx.font = "bold 28px Inter";
    ctx.textAlign = "center";
    ctx.fillText(currentNoteName, x, noteYRef.current + 10);

    // Update noteY (smooth fall)
    noteYRef.current += 1.5;

    // Auto-miss if passed
    if (noteYRef.current > targetYRef.current + 80) {
      showMiss();
      advanceNote();
    }

    animationIdRef.current = requestAnimationFrame(gameLoop);
  };

  const advanceNote = () => {
    currentNoteRef.current += 1;
    noteYRef.current = -50;
    if (currentNoteRef.current < 50) {
      const nextNoteName = sequenceRef.current[currentNoteRef.current % 5];
      setNextNoteHint(`Selanjutnya: ${nextNoteName}`);
      // Sync minimal UI state (optional)
      setGameState((prev) => ({
        ...prev,
        currentNote: currentNoteRef.current,
        noteY: noteYRef.current,
      }));
    }
  };

  const checkHit = (note) => {
    if (!isPlayingRef.current) return;

    const currentNoteName = sequenceRef.current[currentNoteRef.current % 5];
    const distance = Math.abs(noteYRef.current - targetYRef.current);

    if (note === currentNoteName && distance < 80) {
      // HIT!
      scoreRef.current += 100;
      streakRef.current += 1;

      // UI sync for score & streak (batched, lightweight)
      setGameState((prev) => ({
        ...prev,
        score: scoreRef.current,
        streak: streakRef.current,
      }));

      showHitEffect();
      playNote(note);
      highlightKey(note);

      advanceNote();
    }
  };

  const showHitEffect = () => {
    const emojis = ["✨", "🎵", "⭐", "💫", "🌟"];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

    setHitEffect({ show: true, emoji: randomEmoji });
    setFeedback({ message: "PERFECT! 🎉", type: "perfect" });

    setTimeout(() => {
      setHitEffect({ show: false, emoji: randomEmoji });
    }, 600);
  };

  const showMiss = () => {
    streakRef.current = 0;
    setGameState((prev) => ({ ...prev, streak: 0 }));
    setFeedback({ message: "Coba lagi...", type: "miss" });
  };

  const playNote = (note) => {
    if (!audioContextRef.current) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    oscillator.frequency.value = NOTE_FREQUENCIES[note];
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContextRef.current.currentTime + 0.5
    );

    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + 0.5);
  };

  const highlightKey = (note) => {
    const key = document.querySelector(`.piano-key[data-note="${note}"]`);
    if (key) {
      key.classList.add("active");
      setTimeout(() => key.classList.remove("active"), 300);
    }
  };

  const endPractice = () => {
    isPlayingRef.current = false;
    setGameState((prev) => ({ ...prev, isPlaying: false }));
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
    }

    setTimeout(() => {
      alert(
        `Latihan Selesai!\n\nSkor: ${scoreRef.current}\nStreak Terbaik: ${streakRef.current}\n\nKerja Bagus! 🎉`
      );
      window.location.reload();
    }, 100);
  };

  return (
    <div className="game-body">
      <div className={`hit-feedback ${hitEffect.show ? "show" : ""}`}>
        {hitEffect.emoji}
      </div>
      <Navbar />

      <main className="game-container">
        <div className="game-screen" id="playScreen">
          <div className="game-layout-two-column">
            {/* Kolom Kiri - Penjelasan Permainan */}
            <div className="game-explanation-panel">
              <div className="instructions-card">
                <h4>
                  <i className="fas fa-hand-sparkles"></i> Panduan Jari
                </h4>
                <div className="finger-guide-list">
                  <div className="finger-guide-item">
                    <kbd>A</kbd>
                    <span>C - Jempol</span>
                    <span className="flex-value">{flexValues.thumb}</span>
                  </div>
                  <div className="finger-guide-item">
                    <kbd>S</kbd>
                    <span>D - Telunjuk</span>
                    <span className="flex-value">{flexValues.index}</span>
                  </div>
                  <div className="finger-guide-item">
                    <kbd>D</kbd>
                    <span>E - Tengah</span>
                    <span className="flex-value">{flexValues.middle}</span>
                  </div>
                  <div className="finger-guide-item">
                    <kbd>F</kbd>
                    <span>F - Manis</span>
                    <span className="flex-value">{flexValues.ring}</span>
                  </div>
                  <div className="finger-guide-item">
                    <kbd>G</kbd>
                    <span>G - Kelingking</span>
                    <span className="flex-value">{flexValues.pinky}</span>
                  </div>
                </div>
              </div>

              <div className="instructions-card">
                <h4>
                  <i className="fas fa-bullseye"></i> Cara Bermain
                </h4>
                <ul className="instructions-list">
                  <li>
                    <i className="fas fa-check-circle"></i> Tekan tombol{" "}
                    <strong>Mulai Latihan</strong>
                  </li>
                  <li>
                    <i className="fas fa-check-circle"></i> Perhatikan note yang
                    turun
                  </li>
                  <li>
                    <i className="fas fa-check-circle"></i>
                    {wsConnected ? (
                      <>
                        Tekuk jari saat masuk <strong>zona hijau</strong>
                      </>
                    ) : (
                      <>
                        Tekan <strong>keyboard</strong> saat masuk zona hijau
                      </>
                    )}
                  </li>
                  <li>
                    <i className="fas fa-check-circle"></i> Kumpulkan streak
                    untuk skor maksimal
                  </li>
                </ul>
                {!wsConnected && (
                  <div className="input-mode-note">
                    <i className="fas fa-keyboard"></i>
                    <span>Mode Keyboard (Sarung tangan tidak terhubung)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Kolom Kanan - Canvas Permainan */}
            <div className="game-play-panel">
              <div className="game-canvas-container">
                <div className="next-note-hint">{nextNoteHint}</div>

                <div className="note-display">
                  <canvas ref={canvasRef} width="800" height="400"></canvas>
                  <div className="timing-guide"></div>
                </div>

                {/* Pindahkan game header ke bawah kanvas permainan */}
                <header className="game-header compact">
                  <div className="game-header-left">
                    <Link to="/dashboard" className="btn-back">
                      <i className="fas fa-arrow-left"></i>
                      Dashboard
                    </Link>
                    <div className="game-title-header">
                      <div className="game-icon-small">
                        <i className="fas fa-music"></i>
                      </div>
                      <div>
                        <h1>Piano Practice Mode</h1>
                        <p>Latihan Dasar - Super Easy!</p>
                      </div>
                    </div>
                  </div>
                  <div className="game-header-right">
                    <div
                      className={`ws-status ${
                        wsConnected ? "connected" : "disconnected"
                      }`}
                    >
                      <i
                        className={`fas ${
                          wsConnected ? "fa-wifi" : "fa-wifi-slash"
                        }`}
                      ></i>
                      <span>{wsConnected ? "Connected" : "Disconnected"}</span>
                    </div>
                    <div className="game-stat">
                      <i className="fas fa-star"></i>
                      <span id="scoreDisplay">{gameState.score}</span>
                    </div>
                    <div className="game-stat">
                      <i className="fas fa-fire"></i>
                      <span id="streakDisplay">{gameState.streak}</span>
                    </div>
                  </div>
                </header>

                <div className="game-progress">
                  {!gameState.isPlaying && (
                    <button className="btn btn-hero" onClick={startPractice}>
                      <i className="fas fa-play"></i>
                      Mulai Latihan
                    </button>
                  )}
                  <div className={`feedback-display ${feedback.type}`}>
                    {feedback.message}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
