import { useEffect, useRef } from "react";

export const ECGChart = ({ ecgData, isConnected }) => {
  const canvasRef = useRef(null);
  const dataPointsRef = useRef([]);
  const timeRef = useRef(0);
  const animationRef = useRef(null);

  const generateECGPoint = (t, canvasHeight) => {
    const base = Math.sin(t * 0.1) * 5;
    let beat = 0;

    const phase = t % 80;
    if (phase > 70 && phase < 76) {
      beat = Math.random() * -80 + 40;
    } else if (phase > 65 && phase <= 70) {
      beat = 15;
    } else if (phase > 76 && phase < 80) {
      beat = 10;
    }

    return canvasHeight / 2 + base + beat + Math.random() * 2;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      dataPointsRef.current = new Array(canvas.width).fill(canvas.height / 2);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;

      dataPointsRef.current.shift();

      if (isConnected && ecgData?.value) {
        dataPointsRef.current.push(height - (ecgData.value % height));
      } else {
        dataPointsRef.current.push(generateECGPoint(timeRef.current, height));
        timeRef.current++;
      }

      ctx.clearRect(0, 0, width, height);
      ctx.beginPath();
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";

      for (let i = 0; i < dataPointsRef.current.length; i++) {
        if (i === 0) {
          ctx.moveTo(i, dataPointsRef.current[i]);
        } else {
          ctx.lineTo(i, dataPointsRef.current[i]);
        }
      }

      ctx.stroke();
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [ecgData, isConnected]);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
};
