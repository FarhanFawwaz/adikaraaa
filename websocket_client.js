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

        // Callbacks
        this.onECGData = null;
        this.onFlexData = null;
        this.onVitalsData = null;
        this.onConnected = null;
        this.onDisconnected = null;
        this.onError = null;
    }

    // Mulai koneksi
    connect() {
        if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
            console.log('[WebSocket] Sudah terhubung atau sedang menghubungkan');
            return;
        }

        this.isConnecting = true;
        console.log(`[WebSocket] Menghubungkan ke ${this.serverUrl}...`);

        try {
            this.ws = new WebSocket(this.serverUrl);

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
