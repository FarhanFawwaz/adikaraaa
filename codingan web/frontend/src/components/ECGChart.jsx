import { useEffect, useRef } from "react";

export const ECGChart = ({ ecgData, isConnected }) => {
  const canvasRef = useRef(null);
  const dataPointsRef = useRef([]);
  const animationRef = useRef(null);
  const latestValueRef = useRef(null); // Store latest value

  // Normalisasi nilai ECG dari server (range: ~0-1024) ke canvas height
  const normalizeECGValue = (value, canvasHeight) => {
    // Server mengirim nilai sekitar 512 ± 450
    // Normalize ke range 0-1024, lalu scale ke canvas height
    const minValue = 0;
    const maxValue = 1024;

    // Clamp value
    const clampedValue = Math.max(minValue, Math.min(maxValue, value));

    // Scale ke canvas height (flip vertical karena canvas origin di top-left)
    return canvasHeight - (clampedValue / maxValue) * canvasHeight;
  };

  // Update latest value when new data arrives
  useEffect(() => {
    if (isConnected && ecgData?.value !== undefined) {
      latestValueRef.current = ecgData.value;
    }
  }, [ecgData, isConnected]);

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

      if (isConnected && latestValueRef.current !== null) {
        // Gunakan data dari server dengan normalisasi yang benar
        const normalizedValue = normalizeECGValue(
          latestValueRef.current,
          height
        );
        dataPointsRef.current.push(normalizedValue);
      } else {
        // Jika tidak connected, tampilkan baseline
        dataPointsRef.current.push(height / 2);
      }

      ctx.clearRect(0, 0, width, height);
      ctx.beginPath();
      ctx.strokeStyle = isConnected ? "#10b981" : "#6b7280";
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
  }, [isConnected]); // Remove ecgData from dependencies

  return <canvas ref={canvasRef} className="w-full h-full block" />;
};
