// ============================================================
// Piano Game Configuration
// Edit nilai di sini untuk adjust difficulty
// ============================================================

const PIANO_CONFIG = {
    // Hit Window - Seberapa toleran timing-nya (in milliseconds)
    hitWindow: 1000,  // Default: 1000ms (1 detik) - SANGAT MUDAH
    // Turunkan jadi 800 kalau masih terlalu mudah
    // Naikkan jadi 1200 kalau masih susah

    // Note Speed untuk setiap difficulty
    difficulty: {
        easy: {
            interval: 3000,    // Jarak antar note (ms) - semakin besar = semakin lambat
            noteCount: 20,     // Jumlah note total
            hitZoneHeight: 80   // Tinggi zona hit (px)
        },
        medium: {
            interval: 2000,
            noteCount: 25,
            hitZoneHeight: 60
        },
        hard: {
            interval: 1500,
            noteCount: 30,
            hitZoneHeight: 40
        }
    },

    // Scoring thresholds
    scoring: {
        perfectWindow: 200,  // < 200ms = PERFECT
        goodWindow: 500,      // < 500ms = GOOD
        okWindow: 1000        // < 1000ms = OK/HIT
    },

    // Animation
    notePreviewTime: 8000,  // Berapa lama note terlihat sebelum hit line (ms)
    noteSize: 25,            // Ukuran note circle (px)

    // Game Duration
    gameDuration: 180  // Total game time in seconds (3 minutes)
};

// Export untuk digunakan di piano-game.js
if (typeof module !== 'undefined') {
    module.exports = PIANO_CONFIG;
}
