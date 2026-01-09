// ============================================
// Authentication JavaScript
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initAuth();
});

function initAuth() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Check if already logged in
    checkAuthStatus();
}

// ============================================
// Login Handler
// ============================================

function handleLogin(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const role = formData.get('role');
    const remember = formData.get('remember');

    // Validate inputs
    if (!email || !password || !role) {
        window.NeuroRehab.showNotification('Mohon lengkapi semua field', 'warning');
        return;
    }

    // Demo credentials
    const demoCredentials = {
        patient: {
            email: 'patient@neurorehab.com',
            password: 'patient123'
        },
        therapist: {
            email: 'therapist@neurorehab.com',
            password: 'therapist123'
        }
    };

    // Check credentials
    if (email === demoCredentials[role].email && password === demoCredentials[role].password) {
        // Create user session
        const user = {
            id: generateUserId(),
            email: email,
            role: role,
            name: role === 'patient' ? 'Farhan Muamar' : 'Dr. Sarah',
            loginTime: new Date().toISOString(),
            remember: remember === 'on'
        };

        // Save to localStorage
        window.NeuroRehab.Storage.set('currentUser', user);

        // Show success message
        window.NeuroRehab.showNotification(`Selamat datang, ${user.name}!`, 'success');

        // Redirect based on role
        setTimeout(() => {
            if (role === 'patient') {
                window.location.href = '../patient/dashboard.html';
            } else {
                window.location.href = '../therapist/dashboard.html';
            }
        }, 1000);
    } else {
        window.NeuroRehab.showNotification('Email atau password salah', 'error');
    }
}

// ============================================
// Register Handler
// ============================================

function handleRegister(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    const role = formData.get('role');

    // Validate inputs
    if (!name || !email || !password || !confirmPassword || !role) {
        window.NeuroRehab.showNotification('Mohon lengkapi semua field', 'warning');
        return;
    }

    // Check password match
    if (password !== confirmPassword) {
        window.NeuroRehab.showNotification('Password tidak cocok', 'error');
        return;
    }

    // Check password strength
    if (password.length < 6) {
        window.NeuroRehab.showNotification('Password minimal 6 karakter', 'warning');
        return;
    }

    // Simulate registration
    const user = {
        id: generateUserId(),
        name: name,
        email: email,
        role: role,
        registeredAt: new Date().toISOString()
    };

    // Save user (in production, this would go to backend)
    const users = window.NeuroRehab.Storage.get('users') || [];
    users.push(user);
    window.NeuroRehab.Storage.set('users', users);

    // Show success
    window.NeuroRehab.showNotification('Registrasi berhasil! Silakan login', 'success');

    // Redirect to login
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1500);
}

// ============================================
// Demo Mode
// ============================================

function enterDemoMode() {
    const demoUser = {
        id: 'demo_user',
        email: 'demo@neurorehab.com',
        role: 'patient',
        name: 'Demo User',
        isDemo: true,
        loginTime: new Date().toISOString()
    };

    window.NeuroRehab.Storage.set('currentUser', demoUser);
    window.NeuroRehab.showNotification('Masuk ke mode demo...', 'info');

    setTimeout(() => {
        window.location.href = '../patient/dashboard.html';
    }, 1000);
}

// ============================================
// Auth Status Check
// ============================================

function checkAuthStatus() {
    const currentUser = window.NeuroRehab.Storage.get('currentUser');
    const currentPath = window.location.pathname;

    // If user is logged in and on auth page, redirect to dashboard
    if (currentUser && (currentPath.includes('login.html') || currentPath.includes('register.html'))) {
        if (currentUser.role === 'patient') {
            window.location.href = '../patient/dashboard.html';
        } else {
            window.location.href = '../therapist/dashboard.html';
        }
    }
}

// ============================================
// Logout
// ============================================

function logout() {
    const user = window.NeuroRehab.Storage.get('currentUser');

    if (user && user.remember) {
        // Keep some data for auto-login
        window.NeuroRehab.Storage.set('rememberedEmail', user.email);
    }

    window.NeuroRehab.Storage.remove('currentUser');
    window.NeuroRehab.showNotification('Berhasil logout', 'success');

    setTimeout(() => {
        window.location.href = '../auth/login.html';
    }, 1000);
}

// ============================================
// Password Toggle
// ============================================

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleButton = document.querySelector('.toggle-password');
    const icon = toggleButton.querySelector('i');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// ============================================
// Utilities
// ============================================

function generateUserId() {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function requireAuth() {
    const currentUser = window.NeuroRehab.Storage.get('currentUser');

    if (!currentUser) {
        window.NeuroRehab.showNotification('Silakan login terlebih dahulu', 'warning');
        window.location.href = '../auth/login.html';
        return null;
    }

    return currentUser;
}

function requireRole(allowedRoles) {
    const currentUser = requireAuth();

    if (!currentUser) return null;

    if (!allowedRoles.includes(currentUser.role)) {
        window.NeuroRehab.showNotification('Akses ditolak', 'error');
        window.history.back();
        return null;
    }

    return currentUser;
}

// Export functions
window.AuthManager = {
    logout,
    requireAuth,
    requireRole,
    enterDemoMode
};
