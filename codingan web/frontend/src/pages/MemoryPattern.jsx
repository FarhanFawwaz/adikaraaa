import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "../css/MemoryPattern.css";
import { Navbar } from "../components/Navbar";

export const MemoryPattern = () => {
  const wsRef = useRef(null);
  const lastFlexValuesRef = useRef({
    thumb: 54,
    index: 54,
    middle: 54,
    ring: 54,
    pinky: 54,
  });

  const [wsConnected, setWsConnected] = useState(false);
  const [flexValues, setFlexValues] = useState({
    thumb: 54,
    index: 54,
    middle: 54,
    ring: 54,
    pinky: 54,
  });

  const [isPreview, setIsPreview] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [pattern, setPattern] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentIndexRef = useRef(0);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);
  const [previewActive, setPreviewActive] = useState(null); // current finger during preview
  const [statusMsg, setStatusMsg] = useState("Tekan Mulai untuk melihat pola");
  const [score, setScore] = useState(0);
  const [pressFeedback, setPressFeedback] = useState({
    finger: null,
    type: null,
  });

  const BASE_VALUE = 54;
  const FLEX_DEVIATION_THRESHOLD = 10;
  const FINGERS = ["thumb", "index", "middle", "ring", "pinky"];
  const FINGER_LABEL = {
    thumb: "Jempol",
    index: "Telunjuk",
    middle: "Tengah",
    ring: "Manis",
    pinky: "Kelingking",
  };
  const KEY_TO_FINGER = {
    a: "thumb",
    s: "index",
    d: "middle",
    f: "ring",
    g: "pinky",
  };

  // WebSocket Connection for flex sensor
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

      wsRef.current.onopen = () => {
        setWsConnected(true);
      };
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "flex") {
            if (data.firebase_connected === false) {
              const cleared = {
                thumb: BASE_VALUE,
                index: BASE_VALUE,
                middle: BASE_VALUE,
                ring: BASE_VALUE,
                pinky: BASE_VALUE,
              };
              lastFlexValuesRef.current = cleared;
              setFlexValues(cleared);
              return;
            }

            let newVals = { ...lastFlexValuesRef.current };

            if (data.values) {
              // Multi-finger data
              newVals = {
                thumb: data.values.thumb ?? lastFlexValuesRef.current.thumb,
                index: data.values.index ?? lastFlexValuesRef.current.index,
                middle: data.values.middle ?? lastFlexValuesRef.current.middle,
                ring: data.values.ring ?? lastFlexValuesRef.current.ring,
                pinky: data.values.pinky ?? lastFlexValuesRef.current.pinky,
              };
            } else if (data.value !== undefined) {
              // Single sensor - Always map to middle
              newVals.middle = data.value;
            }

            // Detect rising edge per finger based on deviation
            FINGERS.forEach((finger) => {
              const nowVal = newVals[finger];
              const prevVal = lastFlexValuesRef.current[finger];

              const nowDeviation = Math.abs(nowVal - BASE_VALUE);
              const prevDeviation = Math.abs(prevVal - BASE_VALUE);

              if (
                isPlaying &&
                nowDeviation > FLEX_DEVIATION_THRESHOLD &&
                prevDeviation <= FLEX_DEVIATION_THRESHOLD
              ) {
                // For single sensor "Smart Mapping", we implicitly trust the timing if they flex
                // But we still check logic.
                // If we mapped mapped single sensor to expectedFinger, this will trigger handleFingerPress(expectedFinger)
                handleFingerPress(finger);
              }
            });

            lastFlexValuesRef.current = newVals;
            setFlexValues(newVals);
          }
        } catch (err) {
          console.error("[MemoryPattern] WS message error", err);
        }
      };
      wsRef.current.onerror = () => setWsConnected(false);
      wsRef.current.onclose = () => {
        setWsConnected(false);
        setTimeout(connectWebSocket, 3000);
      };
    };
    connectWebSocket();
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [isPlaying]);

  // Keyboard fallback
  useEffect(() => {
    const onKeyDown = (e) => {
      const finger = KEY_TO_FINGER[e.key.toLowerCase()];
      if (finger) {
        e.preventDefault();
        if (isPlaying) handleFingerPress(finger);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isPlaying, currentIndex, pattern]);

  const generatePattern = () => {
    const seq = [];
    for (let i = 0; i < 5; i++) {
      const rand = Math.floor(Math.random() * FINGERS.length);
      seq.push(FINGERS[rand]);
    }
    setPattern(seq);
    setCurrentIndex(0);
    return seq;
  };

  const previewPattern = async (seq) => {
    setIsPreview(true);
    setStatusMsg("Perhatikan pola yang menyala...");
    setPreviewActive(null);
    // Show each finger for 800ms, pause 300ms between
    for (let i = 0; i < seq.length; i++) {
      setPreviewActive(seq[i]);
      await new Promise((r) => setTimeout(r, 800));
      setPreviewActive(null);
      await new Promise((r) => setTimeout(r, 300));
    }
    setIsPreview(false);
    setIsPlaying(true);
    setStatusMsg("Ikuti pola dengan menekuk jari!");
  };

  const startGame = async () => {
    const seq = generatePattern();
    setScore(0);
    await previewPattern(seq);
  };

  const handleFingerPress = (finger) => {
    if (!isPlaying) return;
    const expected = pattern[currentIndex];
    if (finger === expected) {
      // Correct step
      setPressFeedback({ finger, type: "hit" });
      setTimeout(() => setPressFeedback({ finger: null, type: null }), 600);
      setCurrentIndex((idx) => idx + 1);
      setScore((s) => s + 100);
      setStatusMsg(
        currentIndex + 1 >= pattern.length
          ? "Hebat! Pola selesai."
          : "Benar! Lanjutkan pola."
      );

      if (currentIndex + 1 >= pattern.length) {
        // Completed
        setIsPlaying(false);
      }
    } else {
      // Wrong input
      setPressFeedback({ finger, type: "miss" });
      setTimeout(() => setPressFeedback({ finger: null, type: null }), 800);
      setStatusMsg(`Salah (${FINGER_LABEL[finger]}). Ulangi dari awal pola.`);
      setIsPlaying(false);
      setCurrentIndex(0);
    }
  };

  return (
    <div className="game-body">
      <Navbar />

      <main className="game-container">
        <div className="game-screen">
          <div className="screen-content">
            <h2>Memory Pattern</h2>
            <p className="game-description">
              Ikuti urutan gerakan jari yang ditampilkan. Gunakan sarung tangan
              (flex sensor) atau keyboard A S D F G.
            </p>

            <div className="finger-grid">
              {FINGERS.map((f) => {
                const value = flexValues[f];
                const deviation = Math.abs(value - BASE_VALUE);
                const isActive = deviation > FLEX_DEVIATION_THRESHOLD;
                const percentage = Math.min(100, (deviation / 50) * 100);

                return (
                  <div
                    key={f}
                    className={`finger-tile ${
                      previewActive === f ? "preview" : ""
                    } ${
                      pressFeedback.finger === f && pressFeedback.type === "hit"
                        ? "hit"
                        : ""
                    } ${
                      pressFeedback.finger === f &&
                      pressFeedback.type === "miss"
                        ? "miss"
                        : ""
                    }`}
                  >
                    <div className="finger-icon">
                      <i className="fas fa-hand-sparkles"></i>
                    </div>
                    <div className="finger-label">{FINGER_LABEL[f]}</div>

                    {/* Visual Bar */}
                    <div className="sensor-bar-container">
                      <div
                        className={`sensor-bar ${isActive ? "active" : ""}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex-value">{value}</div>
                  </div>
                );
              })}
            </div>

            <div className="results-actions flex gap-5">
              {!isPlaying && !isPreview ? (
                <button className="btn btn-primary" onClick={startGame}>
                  <i className="fas fa-play"></i>
                  Mulai & Tampilkan Pola (5)
                </button>
              ) : (
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    setIsPlaying(false);
                    setIsPreview(false);
                    setCurrentIndex(0);
                    setPattern([]);
                    setStatusMsg("Tekan Mulai untuk melihat pola");
                    setPressFeedback({ finger: null, type: null });
                  }}
                >
                  <i className="fas fa-redo"></i>
                  Reset
                </button>
              )}
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
                  <span>{score}</span>
                </div>
                <div className="game-stat">
                  <i className="fas fa-list-ol"></i>
                  <span>
                    {isPlaying || isPreview
                      ? `${currentIndex}/${pattern.length || 5}`
                      : "0/5"}
                  </span>
                </div>
              </div>
            </div>

            <div className="status-msg">{statusMsg}</div>
          </div>
        </div>
      </main>
    </div>
  );
};
