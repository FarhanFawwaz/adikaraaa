import { useEffect, useRef } from "react";

export const ECGChart = ({ ecgData, isConnected }) => {
  const canvasRef = useRef(null);
  const dataPointsRef = useRef([]);
  const animationRef = useRef(null);
  const latestValueRef = useRef(null);
  const positionRef = useRef(0); // Current sweep position
  const gapWidth = 30; // Width of the gap/blank area

  // Normalisasi nilai ECG dari server (range: ~0-1024) ke canvas height
  const normalizeECGValue = (value, canvasHeight) => {
    const minValue = 0;
    const maxValue = 1024;
    const clampedValue = Math.max(minValue, Math.min(maxValue, value));
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
      // Initialize data array with null values (empty)
      dataPointsRef.current = new Array(canvas.width).fill(null);
      positionRef.current = 0;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      const pos = positionRef.current;

      // Add new data point at current position
      if (isConnected && latestValueRef.current !== null) {
        const normalizedValue = normalizeECGValue(latestValueRef.current, height);
        dataPointsRef.current[pos] = normalizedValue;
      } else {
        dataPointsRef.current[pos] = height / 2;
      }

      // Clear the gap area ahead of the current position
      for (let i = 1; i <= gapWidth; i++) {
        const clearPos = (pos + i) % width;
        dataPointsRef.current[clearPos] = null;
      }

      // Move position forward
      positionRef.current = (pos + 1) % width;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw the ECG line
      ctx.beginPath();
      ctx.strokeStyle = isConnected ? "#10b981" : "#6b7280";
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      let drawing = false;
      let lastValidX = 0;
      let lastValidY = height / 2;

      for (let i = 0; i < width; i++) {
        const value = dataPointsRef.current[i];
        
        if (value !== null) {
          if (!drawing) {
            ctx.moveTo(i, value);
            drawing = true;
          } else {
            ctx.lineTo(i, value);
          }
          lastValidX = i;
          lastValidY = value;
        } else {
          // Gap - stop drawing and start new path
          if (drawing) {
            ctx.stroke();
            ctx.beginPath();
            drawing = false;
          }
        }
      }

      if (drawing) {
        ctx.stroke();
      }

      // Draw the leading dot (white circle at current position)
      if (isConnected) {
        const currentValue = dataPointsRef.current[pos];
        if (currentValue !== null) {
          // Outer glow effect
          ctx.beginPath();
          ctx.arc(pos, currentValue, 6, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(16, 185, 129, 0.3)";
          ctx.fill();

          // Inner bright dot
          ctx.beginPath();
          ctx.arc(pos, currentValue, 3, 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff";
          ctx.fill();
        }
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isConnected]);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
};
