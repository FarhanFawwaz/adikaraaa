import { useState, useEffect, useCallback, useRef } from 'react';

export const useWebSocket = (url = 'ws://localhost:8080/ws') => {
  const [isConnected, setIsConnected] = useState(false);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(true);
  const [ecgData, setEcgData] = useState(null);
  const [flexData, setFlexData] = useState(null);
  const [vitalsData, setVitalsData] = useState(null);
  const [predictionData, setPredictionData] = useState(null);
  const [error, setError] = useState(null);

  const wsRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const firebaseTimeoutRef = useRef(null);
  const reconnectInterval = 3000;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('[WebSocket] Already connected');
      return;
    }

    try {
      console.log(`[WebSocket] Connecting to ${url}...`);
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log('[WebSocket] ✓ Connected!');
        setIsConnected(true);
        setError(null);
        if (reconnectTimerRef.current) {
          clearTimeout(reconnectTimerRef.current);
          reconnectTimerRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case 'ecg':
              setEcgData(data);
              setIsFirebaseConnected(true);
              // Reset timeout - if we receive data, Firebase is connected
              if (firebaseTimeoutRef.current) {
                clearTimeout(firebaseTimeoutRef.current);
              }
              firebaseTimeoutRef.current = setTimeout(() => {
                setIsFirebaseConnected(false);
              }, 5000); // If no data for 5 seconds, mark as disconnected
              break;
            case 'flex':
              setFlexData(data);
              setIsFirebaseConnected(true);
              break;
            case 'vitals':
              setVitalsData(data);
              setIsFirebaseConnected(true);
              break;
            case 'prediction':
              setPredictionData(data.data);
              break;
            case 'error':
              if (data.message && data.message.includes('Firebase')) {
                setIsFirebaseConnected(false);
                console.warn('[WebSocket] Firebase disconnected:', data.message);
              }
              break;
            case 'info':
              console.log('[WebSocket]', data.message);
              break;
            default:
              console.log('[WebSocket] Unknown data type:', data);
          }
        } catch (e) {
          console.error('[WebSocket] Parse error:', e);
        }
      };

      ws.onerror = (err) => {
        console.error('[WebSocket] Error:', err);
        setError(err);
      };

      ws.onclose = () => {
        console.log('[WebSocket] Connection closed');
        setIsConnected(false);

        // Auto reconnect
        reconnectTimerRef.current = setTimeout(() => {
          console.log('[WebSocket] Attempting to reconnect...');
          connect();
        }, reconnectInterval);
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('[WebSocket] Connection failed:', err);
      setError(err);
      reconnectTimerRef.current = setTimeout(connect, reconnectInterval);
    }
  }, [url]);

  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    if (firebaseTimeoutRef.current) {
      clearTimeout(firebaseTimeoutRef.current);
      firebaseTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
    setIsFirebaseConnected(false);
  }, []);

  const send = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.warn('[WebSocket] Cannot send, connection not ready');
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { isConnected, isFirebaseConnected, ecgData, flexData, vitalsData, predictionData, error };
};
