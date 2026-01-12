import { useEffect, useRef } from "react";

export const ECGChart = ({ ecgData, isConnected }) => {
  const canvasRef = useRef(null);
  const dataPointsRef = useRef([]);
  const animationRef = useRef(null);
  const latestValueRef = useRef(null);
  const positionRef = useRef(0); // Current sweep position
  const gapWidth = 30; // Width of the gap/blank area

  // Normalisasi nilai ECG dengan amplifikasi untuk perubahan lebih terlihat
  const normalizeECGValue = (value, canvasHeight) => {
    // Expected range dari Firebase: ~1000-3000 (centered around 2000)
    // Apply amplification to make small changes more visible
    const baseline = 1500; // Center baseline
    const deviation = value - baseline;
    const amplification = 3; // Amplify changes by 3x
    const amplified = baseline + deviation * amplification;

    // Map to canvas height with some margin
    const minValue = -14 * baseline;
    const maxValue = 14 * baseline;
    const clampedValue = Math.max(minValue, Math.min(maxValue, amplified));

    // Invert for canvas (0 at top)
    // Normalize based on total range (maxValue - minValue)
    const range = maxValue - minValue;
    const normalized =
      canvasHeight - ((clampedValue - minValue) / range) * canvasHeight;
    return normalized;
  };

  // Update latest value when new data arrives
  useEffect(() => {
    if (isConnected && ecgData?.value !== undefined) {
      latestValueRef.current = ecgData.value;
      // Debug logging
      if (Math.random() < 0.01) {
        // Log 1% of the time to avoid spam
        console.log("[ECG] Received value:", ecgData.value);
      }
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
        const normalizedValue = normalizeECGValue(
          latestValueRef.current,
          height
        );
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
