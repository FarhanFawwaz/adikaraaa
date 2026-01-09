// ============================================
// Dashboard JavaScript
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
});

function initializeDashboard() {
    // Check authentication
    const user = AuthManager.requireAuth();
    if (!user) return;

    // Initialize components
    updateUserInfo(user);
    updateGreeting(user);
    updateCurrentDate();
    initMobileSidebar();
    initCounters();
    initProgressChart();
    initECGViewer();
    simulateHeartRate();
    initSidebarNavigation();

    console.log('Dashboard initialized for:', user.name);
}

// ============================================
// User Info
// ============================================

function updateUserInfo(user) {
    const userNameEl = document.getElementById('userName');
    const userRoleEl = document.getElementById('userRole');

    if (userNameEl) userNameEl.textContent = user.name;
    if (userRoleEl) userRoleEl.textContent = user.role === 'patient' ? 'Pasien' : 'Fisioterapis';
}

// ============================================
// Greeting
// ============================================

function updateGreeting(user) {
    const greetingEl = document.getElementById('greetingText');
    const subtextEl = document.getElementById('greetingSubtext');

    if (!greetingEl) return;

    const hour = new Date().getHours();
    let greeting = '';
    let subtext = '';

    if (hour < 12) {
        greeting = `Selamat pagi, ${user.name}! ☀️`;
        subtext = 'Mari mulai hari dengan latihan pemanasan';
    } else if (hour < 18) {
        greeting = `Selamat siang, ${user.name}! 👋`;
        subtext = 'Jangan lupa latihan siang hari Anda';
    } else {
        greeting = `Selamat malam, ${user.name}! 🌙`;
        subtext = 'Waktunya latihan relaksasi malam';
    }

    greetingEl.textContent = greeting;
    if (subtextEl) subtextEl.textContent = subtext;
}

// ============================================
// Current Date
// ============================================

function updateCurrentDate() {
    const dateEl = document.getElementById('currentDate');
    if (!dateEl) return;

    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    const today = new Date().toLocaleDateString('id-ID', options);
    dateEl.textContent = today;
}

// ============================================
// Mobile Sidebar
// ============================================

function initMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mobileToggle = document.getElementById('mobileMenuToggle');

    if (mobileToggle && sidebar) {
        mobileToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 1024) {
                if (!sidebar.contains(e.target) && !mobileToggle.contains(e.target)) {
                    sidebar.classList.remove('active');
                }
            }
        });
    }
}

// ============================================
// Counter Animations
// ============================================

function initCounters() {
    const counters = document.querySelectorAll('.counter');

    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
            current += increment;

            if (current < target) {
                counter.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };

        // Start animation when element is in viewport
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && counter.textContent === '0') {
                    updateCounter();
                    observer.unobserve(entry.target);
                }
            });
        });

        observer.observe(counter);
    });
}

// ============================================
// Progress Chart
// ============================================

function initProgressChart() {
    const canvas = document.getElementById('progressChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Get week data
    const weekData = getWeekProgressData();

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: weekData.labels,
            datasets: [
                {
                    label: 'Skor Harian',
                    data: weekData.scores,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointBackgroundColor: '#667eea',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                },
                {
                    label: 'ROM (%)',
                    data: weekData.rom,
                    borderColor: '#4facfe',
                    backgroundColor: 'rgba(79, 172, 254, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointBackgroundColor: '#4facfe',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            family: 'Inter',
                            size: 12,
                            weight: '600'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        size: 14,
                        weight: '600'
                    },
                    bodyFont: {
                        size: 13
                    },
                    cornerRadius: 8
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        font: {
                            family: 'Inter',
                            size: 12
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            family: 'Inter',
                            size: 12
                        }
                    }
                }
            }
        }
    });

    // Chart filter buttons
    const filterButtons = document.querySelectorAll('.btn-chart-filter');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');
            updateChartData(chart, filter);
        });
    });
}

function getWeekProgressData() {
    // Simulate weekly data
    const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    const scores = [75, 82, 85, 88, 90, 87, 92];
    const rom = [60, 65, 68, 70, 72, 71, 75];

    return { labels: days, scores, rom };
}

function updateChartData(chart, filter) {
    if (filter === 'week') {
        const data = getWeekProgressData();
        chart.data.labels = data.labels;
        chart.data.datasets[0].data = data.scores;
        chart.data.datasets[1].data = data.rom;
    } else if (filter === 'month') {
        // Simulate monthly data
        const labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        const scores = [80, 85, 88, 90];
        const rom = [65, 70, 73, 75];

        chart.data.labels = labels;
        chart.data.datasets[0].data = scores;
        chart.data.datasets[1].data = rom;
    }

    chart.update();
}

// ============================================
// EKG Viewer
// ============================================

let ecgAnimationId = null;

function initECGViewer() {
    const canvas = document.getElementById('ecgCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = 150;

    // ECG wave data
    let dataPoints = [];
    let currentX = 0;
    const speed = 2;
    const amplitude = 40;

    function drawECG() {
        // Clear canvas
        ctx.fillStyle = '#111827';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;

        // Horizontal lines
        for (let y = 0; y < canvas.height; y += 20) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        // Vertical lines
        for (let x = 0; x < canvas.width; x += 20) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }

        // Generate ECG wave pattern
        const centerY = canvas.height / 2;
        const newY = centerY + generateECGPoint() * amplitude;

        dataPoints.push({ x: currentX, y: newY });

        // Keep only visible points
        dataPoints = dataPoints.filter(point => point.x > currentX - canvas.width);

        // Draw ECG line
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.beginPath();

        dataPoints.forEach((point, index) => {
            const x = canvas.width - (currentX - point.x);
            if (index === 0) {
                ctx.moveTo(x, point.y);
            } else {
                ctx.lineTo(x, point.y);
            }
        });

        ctx.stroke();

        currentX += speed;
        ecgAnimationId = requestAnimationFrame(drawECG);
    }

    drawECG();
}

function generateECGPoint() {
    // Simulate ECG wave pattern
    const random = Math.random();

    if (random > 0.95) {
        // QRS complex (heartbeat spike)
        return Math.random() > 0.5 ? 1 : -0.5;
    } else if (random > 0.90) {
        // P wave
        return 0.2;
    } else if (random > 0.85) {
        // T wave
        return 0.3;
    } else {
        // Baseline with small noise
        return (Math.random() - 0.5) * 0.1;
    }
}

// ============================================
// Heart Rate Simulation
// ============================================

function simulateHeartRate() {
    const heartRateEl = document.getElementById('liveHeartRate');
    const heartRateValueEl = document.getElementById('heartRateValue');
    const spo2ValueEl = document.getElementById('spo2Value');

    setInterval(() => {
        // Simulate realistic heart rate (70-80 bpm)
        const hr = 72 + Math.floor(Math.random() * 8);
        const spo2 = 96 + Math.floor(Math.random() * 3);

        if (heartRateEl) heartRateEl.textContent = hr;
        if (heartRateValueEl) heartRateValueEl.textContent = hr;
        if (spo2ValueEl) spo2ValueEl.textContent = spo2;
    }, 2000);
}

// ============================================
// Game Launcher - FIXED!
// ============================================

function startGame(gameName) {
    const gameUrls = {
        piano: '../games/finger-piano.html',
        catch: '../games/fruit-catch.html',
        memory: '../games/memory-pattern.html',
        garden: '../games/gardening.html',
        bird: '../games/bird-game.html',
        levels: '../games/levels-game.html'
    };

    const url = gameUrls[gameName];

    if (url) {
        // Navigate to game page
        window.location.href = url;
    } else {
        console.error('Game not found:', gameName);
    }
}

function getGameTitle(gameName) {
    const titles = {
        piano: 'Finger Piano',
        catch: 'Fruit Catch',
        memory: 'Memory Pattern',
        garden: 'Gardening Simulator'
    };
    return titles[gameName] || gameName;
}

// ============================================
// Cleanup
// ============================================

window.addEventListener('beforeunload', () => {
    if (ecgAnimationId) {
        cancelAnimationFrame(ecgAnimationId);
    }
});
