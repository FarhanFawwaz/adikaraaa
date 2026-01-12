import { useState, useEffect, useRef, useCallback } from 'react';

// Similar to resolveDefaultWsUrl but for HTTP
function resolveDefaultApiUrl() {
    const envUrl = import.meta?.env?.VITE_API_URL;
    if (envUrl) return envUrl;

    const protocol = window.location.protocol;
    const host = window.location.hostname || 'localhost';
    const port = (window.location.port === '5173' || window.location.port === '')
        ? '8080'
        : window.location.port;
    return `${protocol}//${host}:${port}/api`;
}

export const useMonitoring = (intervalMs = 100) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isFirebaseConnected, setIsFirebaseConnected] = useState(true); // Assume true initially
    const [ecgData, setEcgData] = useState(null);
    const [flexData, setFlexData] = useState(null);
    const [vitalsData, setVitalsData] = useState(null);
    const [predictionData, setPredictionData] = useState(null);
    const [error, setError] = useState(null);

    const pollTimerRef = useRef(null);
    const apiUrl = resolveDefaultApiUrl();

    const fetchData = useCallback(async () => {
        try {
            const response = await fetch(`${apiUrl}/monitoring/latest`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            setIsConnected(true);
            setError(null);

            // Update states if data is present
            if (data.ecg) setEcgData(data.ecg);
            if (data.flex) setFlexData(data.flex);
            if (data.vitals) setVitalsData(data.vitals);
            if (data.prediction) setPredictionData(data.prediction);

            // Simple logic for "Firebase Protected" status
            // If we are getting data, we assume backend is OK.
            // Backend handles fallback if firebase is down, so frontend just sees data.
            setIsFirebaseConnected(true);

        } catch (e) {
            console.error('[Monitoring] Poll error:', e);
            setError(e);
            setIsConnected(false);
        }
    }, [apiUrl]);

    useEffect(() => {
        // Start polling
        fetchData(); // Initial fetch
        pollTimerRef.current = setInterval(fetchData, intervalMs);

        return () => {
            if (pollTimerRef.current) {
                clearInterval(pollTimerRef.current);
            }
        };
    }, [fetchData, intervalMs]);

    return {
        isConnected,
        isFirebaseConnected,
        ecgData,
        flexData,
        vitalsData,
        predictionData,
        error
    };
};
