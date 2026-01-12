import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "../css/FruitCatch.css";
import { Navbar } from "../components/Navbar";

export const FruitCatch = () => {
  const canvasRef = useRef(null);
  const animationIdRef = useRef(null);
  const wsRef = useRef(null);

  // Game refs to keep smooth animation
  const isPlayingRef = useRef(false);
  const fruitYRef = useRef(-50);
  const fruitXRef = useRef(400);
  const targetYRef = useRef(320);
  const scoreRef = useRef(0);
  const streakRef = useRef(0);
  const lastFlexValuesRef = useRef({
    thumb: 0,
    index: 0,
    middle: 0,
    ring: 0,
    pinky: 0,
  });
  const gripActiveRef = useRef(false);

  const [gameState, setGameState] = useState({
    isPlaying: false,
    score: 0,
    streak: 0,
  });
  const [wsConnected, setWsConnected] = useState(false);
  const [flexValues, setFlexValues] = useState({
    thumb: 0,
    index: 0,
    middle: 0,
    ring: 0,
    pinky: 0,
  });
  const [feedback, setFeedback] = useState({ message: "", type: "" });
  const [hitEffect, setHitEffect] = useState({ show: false, emoji: "🍎" });
  const [nextHint, setNextHint] = useState("Siap? Tekan Mulai!");

  const FLEX_THRESHOLD = 500; // tune based on device
  const CATCH_WINDOW = 80; // +/- pixels around the catch line

  // WebSocket Connection
  useEffect(() => {
    const connectWebSocket = () => {
      const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
      const host = window.location.hostname || "localhost";
      const port =
        window.location.port === "5173" || window.location.port === ""
          ? "8080"
          : window.location.port;
      const deviceId =
        (localStorage.getItem("deviceId") || "device1").trim() || "device1";
      const wsUrl = `${wsScheme}://${host}:${port}/api/ws?device=${encodeURIComponent(
        deviceId
      )}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => setWsConnected(true);
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "flex" && data.values) {
            if (data.firebase_connected === false) {
              const cleared = {
                thumb: 0,
                index: 0,
                middle: 0,
                ring: 0,
                pinky: 0,
              };
              gripActiveRef.current = false;
              lastFlexValuesRef.current = cleared;
              setFlexValues(cleared);
              return;
            }

            const newFlex = {
              thumb: data.values.thumb ?? lastFlexValuesRef.current.thumb,
              index: data.values.index ?? lastFlexValuesRef.current.index,
              middle: data.values.middle ?? lastFlexValuesRef.current.middle,
              ring: data.values.ring ?? lastFlexValuesRef.current.ring,
              pinky: data.values.pinky ?? lastFlexValuesRef.current.pinky,
            };

            const prevGrip = gripActiveRef.current;
            const nowGrip =
              newFlex.thumb > FLEX_THRESHOLD &&
              newFlex.index > FLEX_THRESHOLD &&
              newFlex.middle > FLEX_THRESHOLD &&
              newFlex.ring > FLEX_THRESHOLD &&
              newFlex.pinky > FLEX_THRESHOLD;

            // Detect rising edge of full-hand grip
            if (isPlayingRef.current && !prevGrip && nowGrip) {
              checkCatch();
            }

            gripActiveRef.current = nowGrip;
            lastFlexValuesRef.current = newFlex;
            setFlexValues(newFlex);
          }
        } catch (err) {
          console.error("[FruitCatch] WS message error", err);
        }
      };
      wsRef.current.onerror = (err) => {
        console.error("[FruitCatch] WebSocket error", err);
        setWsConnected(false);
      };
      wsRef.current.onclose = () => {
        setWsConnected(false);
        setTimeout(connectWebSocket, 3000);
      };
    };
    connectWebSocket();
    return () => wsRef.current && wsRef.current.close();
  }, []);

  // Keyboard fallback: Space to catch
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        if (isPlayingRef.current) checkCatch();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const startGame = () => {
    isPlayingRef.current = true;
    scoreRef.current = 0;
    streakRef.current = 0;
    fruitYRef.current = -50;
    fruitXRef.current = Math.random() * 760 + 20; // within canvas width
    targetYRef.current = 320;

    setGameState({ isPlaying: true, score: 0, streak: 0 });
    setNextHint("Tangkap buah saat melewati garis hijau!");
    animationIdRef.current = requestAnimationFrame(gameLoop);
  };

  const gameLoop = () => {
    if (!isPlayingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) {
      animationIdRef.current = requestAnimationFrame(gameLoop);
      return;
    }
    const ctx = canvas.getContext("2d");

    // Clear
    ctx.fillStyle = "#111827";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Catch zone
    ctx.fillStyle = "rgba(16,185,129,0.2)";
    ctx.fillRect(0, targetYRef.current - 60, canvas.width, 120);
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, targetYRef.current);
    ctx.lineTo(canvas.width, targetYRef.current);
    ctx.stroke();

    // Draw fruit (simple circle)
    const x = fruitXRef.current;
    const y = fruitYRef.current;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 28);
    gradient.addColorStop(0, "#fb7185"); // pinkish
    gradient.addColorStop(1, "#f43f5e");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, 28, 0, Math.PI * 2);
    ctx.fill();

    // Leaf
    ctx.fillStyle = "#10b981";
    ctx.beginPath();
    ctx.ellipse(x + 15, y - 25, 10, 6, Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();

    // Update fall
    fruitYRef.current += 1.8;

    // Auto-miss if passes
    if (fruitYRef.current > targetYRef.current + CATCH_WINDOW) {
      showMiss();
      advanceFruit();
    }

    animationIdRef.current = requestAnimationFrame(gameLoop);
  };

  const checkCatch = () => {
    const distance = Math.abs(fruitYRef.current - targetYRef.current);
    if (distance < CATCH_WINDOW) {
      // Catch!
      scoreRef.current += 100;
      streakRef.current += 1;
      setGameState((prev) => ({
        ...prev,
        score: scoreRef.current,
        streak: streakRef.current,
      }));
      showHitEffect();
      advanceFruit();
    }
  };

  const advanceFruit = () => {
    fruitYRef.current = -50;
    fruitXRef.current = Math.random() * 760 + 20;
    setNextHint("Siap buah berikutnya!");
  };

  const showHitEffect = () => {
    const emojis = ["🍎", "🍊", "🍇", "🍓", "🍍"];
    const random = emojis[Math.floor(Math.random() * emojis.length)];
    setHitEffect({ show: true, emoji: random });
    setFeedback({ message: "Mantap! Tertangkap!", type: "perfect" });
    setTimeout(() => setHitEffect({ show: false, emoji: random }), 600);
  };

  const showMiss = () => {
    streakRef.current = 0;
    setGameState((prev) => ({ ...prev, streak: 0 }));
    setFeedback({ message: "Terlewat… coba lagi!", type: "miss" });
  };

  const endGame = () => {
    isPlayingRef.current = false;
    setGameState((prev) => ({ ...prev, isPlaying: false }));
    if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
  };

  return (
    <div className="game-body">
      <Navbar />
      <main className="game-container mt-5">
        <div className="game-screen">
          <div className="screen-content">
            <h2>Fruit Catch</h2>
            <p className="game-description">
              Genggam tangan saat buah melewati garis hijau. Anda bisa gunakan
              Space sebagai fallback.
            </p>

            <div className="game-canvas-container">
              <div className="next-note-hint">{nextHint}</div>
              <div className="note-display">
                <canvas ref={canvasRef} width="800" height="400"></canvas>
                <div className="timing-guide"></div>
              </div>

              {/* Info bar under canvas */}
              <header className="game-header compact text-center">
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
                    <span>{gameState.score}</span>
                  </div>
                  <div className="game-stat">
                    <i className="fas fa-fire"></i>
                    <span>{gameState.streak}</span>
                  </div>
                </div>
              </header>

              <div className="game-progress">
                {!gameState.isPlaying ? (
                  <button className="btn btn-hero" onClick={startGame}>
                    <i className="fas fa-play"></i>
                    Mulai
                  </button>
                ) : (
                  <button className="btn btn-outline" onClick={endGame}>
                    <i className="fas fa-stop"></i>
                    Berhenti
                  </button>
                )}
                <div className={`feedback-display ${feedback.type}`}>
                  {feedback.message}
                </div>
              </div>

              <div className="finger-guide-list">
                <div className="finger-guide-item">
                  <span>Jempol</span>
                  <span className="flex-value">{flexValues.thumb}</span>
                </div>
                <div className="finger-guide-item">
                  <span>Telunjuk</span>
                  <span className="flex-value">{flexValues.index}</span>
                </div>
                <div className="finger-guide-item">
                  <span>Tengah</span>
                  <span className="flex-value">{flexValues.middle}</span>
                </div>
                <div className="finger-guide-item">
                  <span>Manis</span>
                  <span className="flex-value">{flexValues.ring}</span>
                </div>
                <div className="finger-guide-item">
                  <span>Kelingking</span>
                  <span className="flex-value">{flexValues.pinky}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
