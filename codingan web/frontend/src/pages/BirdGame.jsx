import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useWebSocket } from "../hooks/useWebSocket";
// Removed CSS import

const Icons = {
  Back: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5 inline-block mr-2"
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
  Dot: ({ className }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`w-3 h-3 inline-block mr-1 ${className}`}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  ),
};

export const BirdGame = () => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [flexValues, setFlexValues] = useState({
    thumb: 0,
    index: 0,
    middle: 0,
    ring: 0,
    pinky: 0,
  });

  const { flexData, isConnected } = useWebSocket();

  const gameStateRef = useRef({
    bird: { y: 200, velocity: 0, gravity: 0.6, jump: -10 },
    pipes: [],
    frameCount: 0,
    score: 0,
    xp: 0,
  });

  useEffect(() => {
    if (flexData?.values) {
      setFlexValues(flexData.values);
    } else {
      // Simulation for testing without hardware
      const interval = setInterval(() => {
        setFlexValues({
          thumb: Math.floor(Math.random() * 100),
          index: Math.floor(Math.random() * 100),
          middle: Math.floor(Math.random() * 100),
          ring: Math.floor(Math.random() * 100),
          pinky: Math.floor(Math.random() * 100),
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [flexData]);

  useEffect(() => {
    if (!gameStarted) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = 800;
    canvas.height = 600;

    const gameState = gameStateRef.current;
    let animationId;

    const draw = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background
      var gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "#0f172a");
      gradient.addColorStop(1, "#1e293b");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw bird
      ctx.fillStyle = "#F59E0B";
      ctx.shadowColor = "#F59E0B";
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(100, gameState.bird.y, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw pipes
      ctx.fillStyle = "#10B981";
      gameState.pipes.forEach((pipe) => {
        // Top pipe
        ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);
        // Bottom pipe
        ctx.fillRect(
          pipe.x,
          pipe.topHeight + pipe.gap,
          pipe.width,
          canvas.height - (pipe.topHeight + pipe.gap)
        );
      });

      // Update bird
      gameState.bird.velocity += gameState.bird.gravity;
      gameState.bird.y += gameState.bird.velocity;

      // Check for jump (using flex sensors)
      const avgFlex =
        (flexValues.thumb +
          flexValues.index +
          flexValues.middle +
          flexValues.ring +
          flexValues.pinky) /
        5;
      if (avgFlex > 70) {
        gameState.bird.velocity = gameState.bird.jump;
      }

      // Add pipes
      if (gameState.frameCount % 90 === 0) {
        const topHeight = Math.random() * 200 + 100;
        gameState.pipes.push({
          x: canvas.width,
          topHeight,
          gap: 180,
          width: 60,
          passed: false,
        });
      }

      // Update pipes
      gameState.pipes.forEach((pipe) => {
        pipe.x -= 3;

        // Score
        if (!pipe.passed && pipe.x + pipe.width < 100) {
          pipe.passed = true;
          gameState.score++;
          gameState.xp += 10;
          setScore(gameState.score);
          setXp(gameState.xp);
        }

        // Collision detection
        if (
          100 + 15 > pipe.x &&
          100 - 15 < pipe.x + pipe.width &&
          (gameState.bird.y - 15 < pipe.topHeight ||
            gameState.bird.y + 15 > pipe.topHeight + pipe.gap)
        ) {
          setGameOver(true);
          setGameStarted(false);
        }
      });

      // Remove off-screen pipes
      gameState.pipes = gameState.pipes.filter((pipe) => pipe.x > -pipe.width);

      // Boundary check
      if (gameState.bird.y < 0 || gameState.bird.y > canvas.height) {
        setGameOver(true);
        setGameStarted(false);
      }

      gameState.frameCount++;
      if (gameStarted) {
        animationId = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [gameStarted, flexValues]);

  const startGame = () => {
    gameStateRef.current = {
      bird: { y: 200, velocity: 0, gravity: 0.6, jump: -10 },
      pipes: [],
      frameCount: 0,
      score: 0,
      xp: 0,
    };
    setScore(0);
    setXp(0);
    setGameOver(false);
    setGameStarted(true);
  };

  return (
    <div className="min-h-screen bg-dark text-white p-6 flex flex-col items-center justify-center">
      <div className="relative bg-card-dark p-6 rounded-3xl shadow-2xl border border-slate-700">
        <div className="absolute top-8 left-8 right-8 flex justify-between z-10 px-4 pointer-events-none">
          <div className="bg-black/50 text-white px-6 py-2 rounded-full font-bold backdrop-blur-sm border border-white/10 text-xl shadow-lg">
            Score: {score}
          </div>
          <div className="bg-black/50 text-white px-6 py-2 rounded-full font-bold backdrop-blur-sm border border-white/10 text-xl shadow-lg">
            XP: {xp}
          </div>
        </div>

        <canvas
          ref={canvasRef}
          id="gameCanvas"
          className="rounded-2xl border border-slate-800 bg-slate-900 mx-auto block shadow-inner w-[800px] h-[600px]"
        />

        {!gameStarted && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-3xl backdrop-blur-md z-20">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-yellow-500 bg-clip-text text-transparent mb-4">
              {gameOver ? "Game Over!" : "Bird Game"}
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              Genggam tangan (Flex &gt; 70) untuk terbang!
            </p>
            {gameOver && (
              <div className="bg-slate-800/80 p-6 rounded-2xl mb-8 border border-slate-700 text-center">
                <p className="text-2xl font-bold text-white mb-2">
                  Final Score
                </p>
                <div className="flex gap-8 text-xl">
                  <span className="text-primary">Points: {score}</span>
                  <span className="text-yellow-500">XP Earned: {xp}</span>
                </div>
              </div>
            )}
            <div className="flex flex-col gap-4">
              <button
                onClick={startGame}
                className="px-10 py-4 bg-primary text-white text-xl rounded-xl font-bold hover:bg-emerald-600 hover:scale-105 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
              >
                {gameOver ? "Play Again" : "Start Game"}
              </button>
              <Link
                to="/games"
                className="inline-flex items-center justify-center px-10 py-3 text-slate-400 hover:text-white text-center transition-colors text-lg"
              >
                <Icons.Back /> Kembali ke Games
              </Link>
            </div>
          </div>
        )}

        <div className="mt-6 bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex flex-col gap-2">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>Flex Sensors Input</span>
            <span
              className={`flex items-center ${
                isConnected ? "text-green-500" : "text-red-500"
              }`}
            >
              <Icons.Dot
                className={isConnected ? "text-green-500" : "text-red-500"}
              />
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
          <div className="flex gap-3 h-20 items-end justify-center px-10">
            {Object.entries(flexValues).map(([key, value]) => (
              <div
                key={key}
                className="w-12 bg-slate-900 rounded-lg relative h-full overflow-hidden border border-slate-700"
                title={key}
              >
                <div
                  className="absolute bottom-0 left-0 right-0 bg-accent transition-all duration-200"
                  style={{ height: `${value}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between px-11 text-xs text-slate-500 uppercase font-mono mt-1">
            {Object.keys(flexValues).map((k) => (
              <span key={k}>{k[0]}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
