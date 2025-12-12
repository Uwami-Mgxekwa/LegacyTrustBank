// Login Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeLoginPage();
});

function initializeLoginPage() {
    setupLoginForm();
    checkURLParams();
    setupFormValidation();
}

// Check URL parameters for success messages and pre-fill username
function checkURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Pre-fill username if provided
    const username = urlParams.get('username');
    if (username) {
        document.getElementById('loginUsername').value = decodeURIComponent(username);
    }
    
    // Show success message if redirected from signup
    const success = urlParams.get('success');
    if (success === 'signup') {
        showStatusMessage('Account created successfully! Please sign in with your credentials.', 'success');
    }
}

// Setup login form handler
function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', handleLogin);
}

// Handle login form submission
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    if (!username || !password) {
        showStatusMessage('Please fill in all fields', 'error');
        return;
    }
    
    showLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Check demo credentials
    if (username === 'demo' && password === 'demo') {
        // Demo login success
        const userData = {
            username: 'demo',
            fullName: 'Demo User',
            email: 'demo@legacytrustbank.com',
            accountType: 'demo',
            loginTime: new Date().toISOString()
        };
        
        // Store user session
        if (rememberMe) {
            localStorage.setItem('ltb_user', JSON.stringify(userData));
            localStorage.setItem('ltb_remember', 'true');
        } else {
            sessionStorage.setItem('ltb_user', JSON.stringify(userData));
        }
        
        showStatusMessage('Login successful! Redirecting...', 'success');
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
        
    } else {
        // Check if user exists in localStorage
        const users = JSON.parse(localStorage.getItem('ltb_users') || '[]');
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            // User login success
            const userData = {
                username: user.username,
                fullName: user.fullName,
                email: user.email,
                accountType: 'user',
                loginTime: new Date().toISOString()
            };
            
            // Store user session
            if (rememberMe) {
                localStorage.setItem('ltb_user', JSON.stringify(userData));
                localStorage.setItem('ltb_remember', 'true');
            } else {
                sessionStorage.setItem('ltb_user', JSON.stringify(userData));
            }
            
            showStatusMessage('Login successful! Redirecting...', 'success');
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            showStatusMessage('Invalid username or password', 'error');
        }
    }
    
    showLoading(false);
}



// Form validation
function setupFormValidation() {
    const inputs = document.querySelectorAll('input[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                validateField(this);
            }
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let message = '';
    
    // Remove existing error state
    field.classList.remove('error');
    removeFieldError(field);
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        message = 'This field is required';
    }
    
    // Email validation
    if (field.type === 'email' && value && !isValidEmail(value)) {
        isValid = false;
        message = 'Please enter a valid email address';
    }
    
    // Password confirmation validation
    if (field.id === 'confirmPassword') {
        const password = document.getElementById('signupPassword').value;
        if (value && value !== password) {
            isValid = false;
            message = 'Passwords do not match';
        }
    }
    
    // Username validation
    if (field.id === 'signupUsername' && value) {
        if (value.length < 3) {
            isValid = false;
            message = 'Username must be at least 3 characters';
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
            isValid = false;
            message = 'Username can only contain letters, numbers, and underscores';
        }
    }
    
    if (!isValid) {
        field.classList.add('error');
        showFieldError(field, message);
    }
    
    return isValid;
}

function showFieldError(field, message) {
    const wrapper = field.closest('.form-group');
    let errorElement = wrapper.querySelector('.field-error');
    
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        wrapper.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
}

function removeFieldError(field) {
    const wrapper = field.closest('.form-group');
    const errorElement = wrapper.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
}

// Utility functions
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.parentElement.querySelector('.password-toggle i');
    
    if (input.type === 'password') {
        input.type = 'text';
        button.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        button.className = 'fas fa-eye';
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function generateAccountNumber() {
    return '62' + Math.random().toString().substr(2, 8);
}

function showStatusMessage(message, type) {
    const statusElement = document.getElementById('statusMessage');
    statusElement.textContent = message;
    statusElement.className = `status-message ${type}`;
    statusElement.classList.remove('hidden');
    
    // Auto-hide after 5 seconds for non-error messages
    if (type !== 'error') {
        setTimeout(() => {
            statusElement.classList.add('hidden');
        }, 5000);
    }
}

function showLoading(show) {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (show) {
        loadingOverlay.classList.remove('hidden');
    } else {
        loadingOverlay.classList.add('hidden');
    }
}

// Check if user is already logged in
function checkExistingSession() {
    const userData = localStorage.getItem('ltb_user') || sessionStorage.getItem('ltb_user');
    if (userData) {
        // User is already logged in, redirect to dashboard
        window.location.href = 'dashboard.html';
    }
}

// Auto-fill demo credentials
function fillDemoCredentials() {
    document.getElementById('loginUsername').value = 'demo';
    document.getElementById('loginPassword').value = 'demo';
}

// Add demo credentials button functionality
document.addEventListener('DOMContentLoaded', function() {
    // Add click handler to demo credentials section
    const demoCredentials = document.querySelector('.demo-credentials');
    if (demoCredentials) {
        demoCredentials.addEventListener('click', fillDemoCredentials);
        demoCredentials.style.cursor = 'pointer';
        demoCredentials.title = 'Click to auto-fill demo credentials';
    }
});

// Check for existing session on page load
checkExistingSession();

// Add CSS for field errors
const style = document.createElement('style');
style.textContent = `
    .input-wrapper input.error {
        border-color: #dc3545;
        box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
    }
    
    .field-error {
        color: #dc3545;
        font-size: 0.8rem;
        margin-top: 5px;
        display: flex;
        align-items: center;
        gap: 5px;
    }
    
    .field-error::before {
        content: '⚠';
        font-size: 0.9rem;
    }
    
    .demo-credentials:hover {
        background: rgba(212, 175, 55, 0.15);
        transform: translateY(-1px);
        transition: all 0.3s ease;
    }
`;
document.head.appendChild(style);