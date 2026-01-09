// ============================================
// Landing Page Specific JavaScript
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initLandingPage();
});

function initLandingPage() {
    // Initialize counter animations
    animateCounters();

    // Initialize mobile menu
    initMobileMenu();

    // Initialize typing effect
    initTypingEffect();

    // Initialize game cards interaction
    initGameCards();

    console.log('Landing page initialized');
}

// ============================================
// Typing Effect
// ============================================

function initTypingEffect() {
    const typingTexts = ['Gamifikasi AI', 'IoT Pintar', 'Rehabilitasi Seru'];
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typingElement = document.querySelector('.typing-text');

    if (!typingElement) return;

    function type() {
        const currentText = typingTexts[textIndex];

        if (isDeleting) {
            typingElement.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingElement.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
        }

        let typeSpeed = isDeleting ? 50 : 100;

        if (!isDeleting && charIndex === currentText.length) {
            // Pause at end of word
            typeSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % typingTexts.length;
            typeSpeed = 500;
        }

        setTimeout(type, typeSpeed);
    }

    // Start typing effect
    type();
}

// ============================================
// Game Cards Interaction
// ============================================

function initGameCards() {
    const gameCards = document.querySelectorAll('.game-card');

    gameCards.forEach(card => {
        card.addEventListener('click', () => {
            const gameName = card.getAttribute('data-game');

            // Remove active class from all cards
            gameCards.forEach(c => c.classList.remove('active'));

            // Add active class to clicked card
            card.classList.add('active');

            // Navigate to game page (will be implemented later)
            console.log(`Navigating to ${gameName} game...`);

            // For now, just show notification
            if (window.NeuroRehab && window.NeuroRehab.showNotification) {
                window.NeuroRehab.showNotification(
                    `Game ${getGameTitle(gameName)} akan segera tersedia!`,
                    'info'
                );
            }
        });

        // Add hover effect for game preview
        const preview = card.querySelector('.game-preview');
        if (preview) {
            card.addEventListener('mouseenter', () => {
                preview.style.transform = 'scale(1.1) rotate(5deg)';
            });

            card.addEventListener('mouseleave', () => {
                preview.style.transform = 'scale(1) rotate(0deg)';
            });
        }
    });
}

function getGameTitle(gameName) {
    const titles = {
        'piano': 'Finger Piano',
        'catch': 'Fruit Catch',
        'memory': 'Memory Pattern',
        'garden': 'Gardening Simulator'
    };
    return titles[gameName] || gameName;
}

// ============================================
// Parallax Effect for Hero
// ============================================

function initParallax() {
    const hero = document.querySelector('.hero');
    const gloveImage = document.querySelector('.glove-image');

    if (!hero || !gloveImage) return;

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroHeight = hero.offsetHeight;

        if (scrolled < heroHeight) {
            const parallaxSpeed = 0.5;
            gloveImage.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
        }
    });
}

// ============================================
// Feature Cards Animation
// ============================================

function initFeatureCardsAnimation() {
    const featureCards = document.querySelectorAll('.feature-card');

    featureCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;

        // Add hover effect for icon
        const icon = card.querySelector('.feature-icon');

        card.addEventListener('mouseenter', () => {
            if (icon) {
                icon.style.transform = 'scale(1.1) rotate(5deg)';
            }
        });

        card.addEventListener('mouseleave', () => {
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0deg)';
            }
        });
    });
}

// ============================================
// Scroll Progress Indicator
// ============================================

function initScrollProgress() {
    // Create progress bar element
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.innerHTML = '<div class="scroll-progress-bar"></div>';
    document.body.appendChild(progressBar);

    const progressBarFill = progressBar.querySelector('.scroll-progress-bar');

    window.addEventListener('scroll', () => {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrolled = window.pageYOffset;
        const progress = (scrolled / documentHeight) * 100;

        progressBarFill.style.width = `${progress}%`;
    });
}

// ============================================
// Newsletter Form (Example)
// ============================================

function handleNewsletterSubmit(event) {
    event.preventDefault();

    const emailInput = event.target.querySelector('input[type="email"]');
    const email = emailInput.value;

    if (!email) {
        window.NeuroRehab.showNotification('Mohon masukkan email Anda', 'warning');
        return;
    }

    // Simulate API call
    console.log('Subscribing email:', email);

    // Show success message
    window.NeuroRehab.showNotification('Terima kasih! Anda berhasil berlangganan newsletter', 'success');

    // Clear input
    emailInput.value = '';
}

// ============================================
// Initialize all landing page features
// ============================================

// Uncomment to enable additional features:
// initParallax();
// initFeatureCardsAnimation();
// initScrollProgress();
