/**
 * WebSocket Client for NeuroRehab System
 * Mengelola koneksi WebSocket untuk data ECG dan Flex Sensor
 */

class NeuroRehabWebSocket {
    constructor(serverUrl = 'ws://localhost:8080') {
        this.serverUrl = serverUrl;
        this.ws = null;
        this.reconnectInterval = 3000; // 3 detik
        this.reconnectTimer = null;
        this.isConnecting = false;

        this.debugOverlayEl = null;
        this.debugEnabled = this.getBooleanQueryParam('debug');

        // Callbacks
        this.onECGData = null;
        this.onFlexData = null;
        this.onVitalsData = null;
        this.onDebugData = null;
        this.onConnected = null;
        this.onDisconnected = null;
        this.onError = null;
    }

    getBooleanQueryParam(name) {
        try {
            if (typeof window === 'undefined') return false;
            const value = new URLSearchParams(window.location.search).get(name);
            if (!value) return false;
            return ['1', 'true', 'yes', 'y', 'on'].includes(String(value).trim().toLowerCase());
        } catch (_) {
            return false;
        }
    }

    withQueryParams(url, params) {
        try {
            const u = new URL(url);
            Object.entries(params || {}).forEach(([k, v]) => {
                if (v === undefined || v === null) return;
                u.searchParams.set(k, String(v));
            });
            return u.toString();
        } catch (_) {
            // Fallback for relative/invalid URL strings
            if (!params) return url;
            const joiner = url.includes('?') ? '&' : '?';
            const qs = Object.entries(params)
                .filter(([, v]) => v !== undefined && v !== null)
                .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
                .join('&');
            return qs ? `${url}${joiner}${qs}` : url;
        }
    }

    ensureDebugOverlay() {
        if (!this.debugEnabled) return;
        if (typeof document === 'undefined') return;
        if (this.debugOverlayEl) return;

        const el = document.createElement('div');
        el.id = 'nr-debug-overlay';
        el.style.position = 'fixed';
        el.style.right = '12px';
        el.style.bottom = '12px';
        el.style.zIndex = '99999';
        el.style.padding = '10px 12px';
        el.style.borderRadius = '10px';
        el.style.background = 'rgba(17, 24, 39, 0.92)';
        el.style.color = '#e5e7eb';
        el.style.fontFamily = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
        el.style.fontSize = '12px';
        el.style.lineHeight = '1.35';
        el.style.minWidth = '260px';
        el.style.boxShadow = '0 10px 30px rgba(0,0,0,0.35)';
        el.innerHTML = [
            '<div style="font-weight:700;margin-bottom:6px">NeuroRehab Debug</div>',
            '<div id="nr-debug-body">Menunggu data...</div>',
            '<div style="opacity:.7;margin-top:6px">Tip: matikan dengan hapus <b>debug=1</b></div>'
        ].join('');
        document.body.appendChild(el);
        this.debugOverlayEl = el;
    }

    updateDebugOverlay(data) {
        if (!this.debugEnabled) return;
        this.ensureDebugOverlay();
        if (!this.debugOverlayEl) return;

        const body = this.debugOverlayEl.querySelector('#nr-debug-body');
        if (!body) return;

        const lines = [];
        lines.push(`firebase_connected: ${data.firebase_connected}`);
        if (data.sample_fetch_age_ms !== undefined && data.sample_fetch_age_ms !== null) {
            lines.push(`sample_age_ms: ${data.sample_fetch_age_ms}`);
        }
        if (data.firebase_path) lines.push(`path: ${data.firebase_path}`);
        lines.push(`ecg: ${data.ecg}`);
        lines.push(`flex: ${data.flex}`);
        if (data.ts_ms !== undefined) lines.push(`ts_ms: ${data.ts_ms}`);
        body.textContent = lines.join('\n');
    }

    // Mulai koneksi
    connect() {
        if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
            console.log('[WebSocket] Sudah terhubung atau sedang menghubungkan');
            return;
        }

        this.isConnecting = true;
        const wsUrl = this.debugEnabled ? this.withQueryParams(this.serverUrl, { debug: 1 }) : this.serverUrl;
        console.log(`[WebSocket] Menghubungkan ke ${wsUrl}...`);

        try {
            this.ensureDebugOverlay();
            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                console.log('[WebSocket] ✓ Terhubung!');
                this.isConnecting = false;
                this.clearReconnectTimer();

                if (this.onConnected) this.onConnected();
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (e) {
                    console.error('[WebSocket] Error parsing data:', e);
                }
            };

            this.ws.onerror = (error) => {
                console.error('[WebSocket] Error:', error);
                this.isConnecting = false;
                if (this.onError) this.onError(error);
            };

            this.ws.onclose = () => {
                console.log('[WebSocket] Koneksi terputus');
                this.isConnecting = false;

                if (this.onDisconnected) this.onDisconnected();

                // Auto reconnect
                this.scheduleReconnect();
            };

        } catch (error) {
            console.error('[WebSocket] Gagal membuat koneksi:', error);
            this.isConnecting = false;
            this.scheduleReconnect();
        }
    }

    // Tangani pesan masuk
    handleMessage(data) {
        switch (data.type) {
            case 'ecg':
                if (this.onECGData) this.onECGData(data);
                break;

            case 'flex':
                if (this.onFlexData) this.onFlexData(data);
                break;

            case 'vitals':
                if (this.onVitalsData) this.onVitalsData(data);
                break;

            case 'debug':
                if (this.onDebugData) this.onDebugData(data);
                this.updateDebugOverlay(data);
                break;

            default:
                console.log('[WebSocket] Data tidak dikenal:', data);
        }
    }

    // Kirim data ke server
    send(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        } else {
            console.warn('[WebSocket] Tidak bisa mengirim, koneksi belum siap');
        }
    }

    // Jadwalkan reconnect
    scheduleReconnect() {
        this.clearReconnectTimer();
        console.log(`[WebSocket] Reconnect dalam ${this.reconnectInterval / 1000} detik...`);

        this.reconnectTimer = setTimeout(() => {
            this.connect();
        }, this.reconnectInterval);
    }

    // Hapus timer reconnect
    clearReconnectTimer() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }

    // Putuskan koneksi
    disconnect() {
        this.clearReconnectTimer();

        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    // Cek status koneksi
    isConnected() {
        return this.ws && this.ws.readyState === WebSocket.OPEN;
    }
}

// Export untuk digunakan di file lain
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NeuroRehabWebSocket;
}
