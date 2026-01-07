import { useState, useEffect, useCallback, useRef } from 'react';

export const useWebSocket = (url = 'ws://localhost:8080') => {
  const [isConnected, setIsConnected] = useState(false);
  const [ecgData, setEcgData] = useState(null);
  const [flexData, setFlexData] = useState(null);
  const [vitalsData, setVitalsData] = useState(null);
  const [error, setError] = useState(null);
  
  const wsRef = useRef(null);
  const reconnectTimerRef = useRef(null);
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
              break;
            case 'flex':
              setFlexData(data);
              break;
            case 'vitals':
              setVitalsData(data);
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
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
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

  return {
    isConnected,
    ecgData,
    flexData,
    vitalsData,
    error,
    send,
    reconnect: connect
  };
};
