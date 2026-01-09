// ==================================================================
// Finger Piano Game - Full Interactive Logic
// ==================================================================

let gameState = {
    difficulty: 'easy',
    isPlaying: false,
    isPaused: false,
    score: 0,
    combo: 0,
    bestCombo: 0,
    hits: 0,
    misses: 0,
    totalNotes: 0,
    startTime: null,
    duration: 300, // 5 minutes in seconds
    elapsedTime: 0,
    notes: [],
    currentNoteIndex: 0
};

// Audio Context for sound
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Note frequencies
const NOTE_FREQUENCIES = {
    'C': 261.63,
    'D': 293.66,
    'E': 329.63,
    'F': 349.23,
    'G': 392.00
};

// Keyboard mapping
const KEY_TO_NOTE = {
    'a': 'C',
    's': 'D',
    'd': 'E',
    'f': 'F',
    'g': 'G'
};

// ==================================================================
// Initialization
// ==================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Check auth
    const user = AuthManager.requireAuth();
    if (!user) return;

    initializeGame();
});

function initializeGame() {
    // Setup difficulty selector
    const difficultyButtons = document.querySelectorAll('.btn-difficulty');
    difficultyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            difficultyButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            gameState.difficulty = btn.getAttribute('data-level');
        });
    });

    // Setup keyboard controls
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Setup piano keys click
    const pianoKeys = document.querySelectorAll('.piano-key');
    pianoKeys.forEach(key => {
        key.addEventListener('mousedown', () => {
            const note = key.getAttribute('data-note');
            playNote(note);
            activateKey(note);
        });

        key.addEventListener('mouseup', () => {
            const note = key.getAttribute('data-note');
            deactivateKey(note);
        });
    });

    console.log('Finger Piano initialized');
}

// ==================================================================
// Game Flow
// ==================================================================

function startGame() {
    // Reset state
    gameState = {
        ...gameState,
        isPlaying: true,
        isPaused: false,
        score: 0,
        combo: 0,
        bestCombo: 0,
        hits: 0,
        misses: 0,
        totalNotes: 0,
        startTime: Date.now(),
        elapsedTime: 0,
        notes: [],
        currentNoteIndex: 0
    };

    // Generate note pattern based on difficulty
    generateNotePattern();

    // Switch screens
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('playScreen').classList.remove('hidden');

    // Start game loop
    gameLoop();
    updateTimer();

    // Start note animation
    animateNotes();
}

function pauseGame() {
    gameState.isPaused = true;
}

function resumeGame() {
    gameState.isPaused = false;
    gameLoop();
}

function endGame() {
    gameState.isPlaying = false;

    // Calculate final stats
    const accuracy = gameState.totalNotes > 0
        ? Math.round((gameState.hits / gameState.totalNotes) * 100)
        : 0;

    const romProgress = Math.min(100, Math.round(gameState.score / 10));

    // Update results display
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('accuracyDisplay').textContent = accuracy + '%';
    document.getElementById('bestComboDisplay').textContent = gameState.bestCombo + 'x';
    document.getElementById('romDisplay').textContent = romProgress + '%';

    // Update stars based on score
    updateStars(gameState.score);

    // Update message
    updateResultsMessage(accuracy);

    // Save session data
    saveGameSession();

    // Switch to results screen
    document.getElementById('playScreen').classList.add('hidden');
    document.getElementById('resultsScreen').classList.remove('hidden');
}

function restartGame() {
    // Reset screens
    document.getElementById('resultsScreen').classList.add('hidden');
    document.getElementById('startScreen').classList.remove('hidden');

    // Clear feedback
    document.getElementById('feedbackDisplay').textContent = '';
}

// ==================================================================
// Note Generation
// ==================================================================

function generateNotePattern() {
    const notes = ['C', 'D', 'E', 'F', 'G'];
    const patterns = [];

    switch (gameState.difficulty) {
        case 'easy':
            // Single notes, slow pace
            for (let i = 0; i < 30; i++) {
                const note = notes[Math.floor(Math.random() * notes.length)];
                patterns.push({
                    notes: [note],
                    time: i * 2000, // Every 2 seconds
                    duration: 1500
                });
            }
            break;

        case 'medium':
            // Sequential patterns
            for (let i = 0; i < 25; i++) {
                const startNote = Math.floor(Math.random() * (notes.length - 2));
                const sequence = [notes[startNote], notes[startNote + 1], notes[startNote + 2]];

                sequence.forEach((note, index) => {
                    patterns.push({
                        notes: [note],
                        time: i * 3000 + index * 500,
                        duration: 800
                    });
                });
            }
            break;

        case 'hard':
            // Chords and fast sequences
            for (let i = 0; i < 20; i++) {
                // Single notes
                patterns.push({
                    notes: [notes[Math.floor(Math.random() * notes.length)]],
                    time: i * 2500,
                    duration: 600
                });

                // Chords (2 notes)
                if (i % 3 === 0) {
                    const chord = [
                        notes[Math.floor(Math.random() * notes.length)],
                        notes[Math.floor(Math.random() * notes.length)]
                    ];
                    patterns.push({
                        notes: chord,
                        time: i * 2500 + 1000,
                        duration: 800
                    });
                }
            }
            break;
    }

    gameState.notes = patterns;
    gameState.totalNotes = patterns.length;
}

// ==================================================================
// Game Loop
// ==================================================================

function gameLoop() {
    if (!gameState.isPlaying || gameState.isPaused) return;

    gameState.elapsedTime = Math.floor((Date.now() - gameState.startTime) / 1000);

    // Update score display
    document.getElementById('scoreDisplay').textContent = gameState.score;
    document.getElementById('comboDisplay').textContent = gameState.combo + 'x';

    // Update progress bar
    const progress = (gameState.elapsedTime / gameState.duration) * 100;
    document.getElementById('progressBar').style.width = Math.min(100, progress) + '%';

    // Check if time is up
    if (gameState.elapsedTime >= gameState.duration) {
        endGame();
        return;
    }

    requestAnimationFrame(gameLoop);
}

function updateTimer() {
    if (!gameState.isPlaying) return;

    const remaining = Math.max(0, gameState.duration - gameState.elapsedTime);
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;

    document.getElementById('timerDisplay').textContent =
        `${minutes}:${seconds.toString().padStart(2, '0')}`;

    setTimeout(updateTimer, 1000);
}

// ==================================================================
// Note Animation
// ==================================================================

function animateNotes() {
    const canvas = document.getElementById('noteCanvas');
    const ctx = canvas.getContext('2d');

    let animationId = null;
    let noteY = 0;

    function draw() {
        if (!gameState.isPlaying) {
            if (animationId) cancelAnimationFrame(animationId);
            return;
        }

        // Clear canvas
        ctx.fillStyle = '#111827';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;

        for (let y = 0; y < canvas.height; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        // Draw upcoming notes
        const currentTime = gameState.elapsedTime * 1000;
        const notePositions = {
            'C': canvas.width * 0.1,
            'D': canvas.width * 0.3,
            'E': canvas.width * 0.5,
            'F': canvas.width * 0.7,
            'G': canvas.width * 0.9
        };

        gameState.notes.forEach((pattern, index) => {
            const timeToNote = pattern.time - currentTime;

            // Only draw notes that are coming up
            if (timeToNote > 0 && timeToNote < 5000) {
                const y = canvas.height - (timeToNote / 5000) * canvas.height;

                pattern.notes.forEach(note => {
                    const x = notePositions[note];

                    // Draw note circle
                    ctx.fillStyle = index === gameState.currentNoteIndex
                        ? '#10b981'
                        : '#667eea';
                    ctx.beginPath();
                    ctx.arc(x, y, 20, 0, Math.PI * 2);
                    ctx.fill();

                    // Draw note label
                    ctx.fillStyle = 'white';
                    ctx.font = 'bold 16px Inter';
                    ctx.textAlign = 'center';
                    ctx.fillText(note, x, y + 5);
                });
            }
        });

        // Draw hit line
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height - 50);
        ctx.lineTo(canvas.width, canvas.height - 50);
        ctx.stroke();

        animationId = requestAnimationFrame(draw);
    }

    draw();
}

// ==================================================================
// Input Handling
// ==================================================================

function handleKeyDown(e) {
    if (!gameState.isPlaying || gameState.isPaused) return;

    const key = e.key.toLowerCase();
    const note = KEY_TO_NOTE[key];

    if (note) {
        e.preventDefault();
        playNote(note);
        activateKey(note);
        checkNoteHit(note);
    }
}

function handleKeyUp(e) {
    const key = e.key.toLowerCase();
    const note = KEY_TO_NOTE[key];

    if (note) {
        deactivateKey(note);
    }
}

function playNote(note) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = NOTE_FREQUENCIES[note];
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

function activateKey(note) {
    const key = document.querySelector(`.piano-key[data-note="${note}"]`);
    if (key) {
        key.classList.add('active');
    }
}

function deactivateKey(note) {
    const key = document.querySelector(`.piano-key[data-note="${note}"]`);
    if (key) {
        key.classList.remove('active');
    }
}

// ==================================================================
// Scoring
// ==================================================================

function checkNoteHit(note) {
    const currentTime = gameState.elapsedTime * 1000;
    const hitWindow = 500; // 500ms hit window

    // Check if current note matches
    for (let i = gameState.currentNoteIndex; i < gameState.notes.length; i++) {
        const pattern = gameState.notes[i];
        const timeDiff = Math.abs(pattern.time - currentTime);

        if (timeDiff < hitWindow && pattern.notes.includes(note)) {
            // Hit!
            registerHit(timeDiff);
            gameState.currentNoteIndex = i + 1;
            return;
        }
    }

    // Miss
    registerMiss();
}

function registerHit(timeDiff) {
    gameState.hits++;
    gameState.combo++;

    if (gameState.combo > gameState.bestCombo) {
        gameState.bestCombo = gameState.combo;
    }

    // Score based on accuracy
    let points = 100;
    if (timeDiff < 100) {
        points = 150; // Perfect
        showFeedback('PERFECT! 🎵', 'perfect');
    } else if (timeDiff < 300) {
        points = 120; // Good
        showFeedback('Good! ✨', 'good');
    } else {
        showFeedback('Hit!', 'good');
    }

    // Combo multiplier
    points *= Math.min(3, 1 + gameState.combo * 0.1);

    gameState.score += Math.round(points);

    // Visual feedback
    const key = document.querySelector(`.piano-key[data-note="${gameState.notes[gameState.currentNoteIndex - 1].notes[0]}"]`);
    if (key) {
        key.classList.add('hit');
        setTimeout(() => key.classList.remove('hit'), 300);
    }
}

function registerMiss() {
    gameState.misses++;
    gameState.combo = 0;
    showFeedback('Miss...', 'miss');
}

function showFeedback(text, type) {
    const feedback = document.getElementById('feedbackDisplay');
    feedback.textContent = text;
    feedback.className = 'feedback-display ' + type;

    setTimeout(() => {
        feedback.textContent = '';
        feedback.className = 'feedback-display';
    }, 1000);
}

// ==================================================================
// Results
// ==================================================================

function updateStars(score) {
    const stars = document.querySelectorAll('.results-stars i');

    let earnedStars = 0;
    if (score >= 1000) earnedStars = 1;
    if (score >= 2000) earnedStars = 2;
    if (score >= 3500) earnedStars = 3;

    stars.forEach((star, index) => {
        if (index < earnedStars) {
            setTimeout(() => {
                star.classList.add('earned');
            }, (index + 1) * 300);
        }
    });
}

function updateResultsMessage(accuracy) {
    const messageEl = document.getElementById('resultsMessage');
    const messages = [
        { min: 90, text: 'Luar biasa! Koordinasi jari Anda sangat baik! 🌟', icon: 'trophy' },
        { min: 75, text: 'Kerja bagus! Terus latihan untuk meningkatkan koordinasi. 💪', icon: 'thumbs-up' },
        { min: 60, text: 'Bagus! Latihan rutin akan meningkatkan performa Anda. ✨', icon: 'smile' },
        { min: 0, text: 'Terus berlatih! Setiap latihan membawa kemajuan. 🎯', icon: 'heart' }
    ];

    const message = messages.find(m => accuracy >= m.min);

    messageEl.innerHTML = `
        <i class="fas fa-${message.icon}"></i>
        <p>${message.text}</p>
    `;

    if (accuracy >= 90) {
        messageEl.style.background = 'var(--success)';
    } else if (accuracy >= 75) {
        messageEl.style.background = 'var(--primary-600)';
    } else {
        messageEl.style.background = 'var(--gray-600)';
    }
}

function saveGameSession() {
    const session = {
        id: window.NeuroRehab.generateId(),
        game: 'finger-piano',
        difficulty: gameState.difficulty,
        date: new Date().toISOString(),
        duration: gameState.elapsedTime,
        score: gameState.score,
        accuracy: Math.round((gameState.hits / gameState.totalNotes) * 100),
        combo: gameState.bestCombo,
        hits: gameState.hits,
        misses: gameState.misses
    };

    // Get existing sessions
    const sessions = window.NeuroRehab.Storage.get('sessions') || [];
    sessions.push(session);
    window.NeuroRehab.Storage.set('sessions', sessions);

    console.log('Game session saved:', session);
}
