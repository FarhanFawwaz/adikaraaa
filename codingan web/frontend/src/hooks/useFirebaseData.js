import { useState, useEffect, useCallback, useRef } from 'react';
import { FIREBASE_DATABASE_URL, FIREBASE_API_KEY } from '../config/firebase';

/**
 * Hook untuk fetch data real-time dari Firebase Realtime Database
 * @param {string} path - Path data di Firebase (contoh: '/sensor', '/patients')
 * @param {number} refreshInterval - Interval refresh dalam ms (default: 1000ms)
 */
export const useFirebaseData = (path = '/', refreshInterval = 1000) => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    const intervalRef = useRef(null);
    const abortControllerRef = useRef(null);

    const fetchData = useCallback(async () => {
        // Cancel previous request if still pending
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();

        try {
            const url = `${FIREBASE_DATABASE_URL}${path}.json?auth=${FIREBASE_API_KEY}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) {
                throw new Error(`Firebase error: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            setData(result);
            setIsConnected(true);
            setError(null);
            setIsLoading(false);
        } catch (err) {
            if (err.name === 'AbortError') {
                // Request was cancelled, ignore
                return;
            }
            console.error('[Firebase] Fetch error:', err);
            setError(err.message);
            setIsConnected(false);
            setIsLoading(false);
        }
    }, [path]);

    // Initial fetch and set up polling
    useEffect(() => {
        fetchData();

        // Set up polling interval for real-time updates
        intervalRef.current = setInterval(fetchData, refreshInterval);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetchData, refreshInterval]);

    // Manual refresh function
    const refresh = useCallback(() => {
        setIsLoading(true);
        fetchData();
    }, [fetchData]);

    return {
        data,
        isLoading,
        error,
        isConnected,
        refresh,
    };
};

/**
 * Hook untuk fetch ECG data dari Firebase
 */
export const useFirebaseECG = (refreshInterval = 500) => {
    const { data, isLoading, error, isConnected } = useFirebaseData('/ecg', refreshInterval);

    return {
        ecgData: data,
        isLoading,
        error,
        isConnected,
    };
};

/**
 * Hook untuk fetch Vitals data dari Firebase
 */
export const useFirebaseVitals = (refreshInterval = 1000) => {
    const { data, isLoading, error, isConnected } = useFirebaseData('/vitals', refreshInterval);

    return {
        vitalsData: data,
        isLoading,
        error,
        isConnected,
    };
};

/**
 * Hook untuk fetch Flex sensor data dari Firebase
 */
export const useFirebaseFlex = (refreshInterval = 500) => {
    const { data, isLoading, error, isConnected } = useFirebaseData('/flex', refreshInterval);

    return {
        flexData: data,
        isLoading,
        error,
        isConnected,
    };
};

/**
 * Hook untuk fetch semua sensor data dari Firebase (combined)
 * Struktur data Firebase: { bpm, ecg, flex, spo2, ts_ms }
 */
export const useFirebaseSensors = (refreshInterval = 500) => {
    const { data, isLoading, error, isConnected, refresh } = useFirebaseData('/', refreshInterval);

    // Map Firebase data to component-compatible format
    const ecgData = data ? {
        type: 'ecg',
        value: data.ecg,
        timestamp: data.ts_ms,
    } : null;

    const vitalsData = data ? {
        type: 'vitals',
        bpm: data.bpm,
        spo2: data.spo2,
        timestamp: data.ts_ms,
    } : null;

    const flexData = data ? {
        type: 'flex',
        value: data.flex,
        // Support both single value and array of flex sensors
        sensors: Array.isArray(data.flex) ? data.flex : [data.flex],
        timestamp: data.ts_ms,
    } : null;

    return {
        sensorData: data,
        ecgData,
        flexData,
        vitalsData,
        predictionData: data?.prediction || null,
        rawData: data, // Include raw data for debugging
        isLoading,
        error,
        isConnected,
        refresh,
    };
};

export default useFirebaseData;
