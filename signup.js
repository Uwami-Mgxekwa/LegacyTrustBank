// Signup Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeSignupPage();
});

function initializeSignupPage() {
    setupSignupForm();
    setupPasswordStrength();
    setupFormValidation();
    checkExistingSession();
}

// Setup signup form handler
function setupSignupForm() {
    const signupForm = document.getElementById('signupForm');
    signupForm.addEventListener('submit', handleSignup);
}

// Handle signup form submission
async function handleSignup(e) {
    e.preventDefault();
    
    const fullName = document.getElementById('signupFullName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const username = document.getElementById('signupUsername').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    
    // Validation
    if (!fullName || !email || !username || !password || !confirmPassword) {
        showStatusMessage('Please fill in all fields', 'error');
        return;
    }
    
    if (!agreeTerms) {
        showStatusMessage('Please agree to the Terms of Service and Privacy Policy', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showStatusMessage('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 6) {
        showStatusMessage('Password must be at least 6 characters long', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showStatusMessage('Please enter a valid email address', 'error');
        return;
    }
    
    showLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if username or email already exists
    const users = JSON.parse(localStorage.getItem('ltb_users') || '[]');
    
    if (users.find(u => u.username === username)) {
        showStatusMessage('Username already exists', 'error');
        showLoading(false);
        return;
    }
    
    if (users.find(u => u.email === email)) {
        showStatusMessage('Email already registered', 'error');
        showLoading(false);
        return;
    }
    
    // Create new user
    const newUser = {
        id: Date.now().toString(),
        fullName,
        email,
        username,
        password, // In real app, this would be hashed
        createdAt: new Date().toISOString(),
        accountNumber: generateAccountNumber(),
        currentBalance: 1000.00, // Starting balance
        savingsBalance: 5000.00  // Starting savings
    };
    
    users.push(newUser);
    localStorage.setItem('ltb_users', JSON.stringify(users));
    
    showStatusMessage('Account created successfully! Redirecting to login...', 'success');
    
    // Clear form
    document.getElementById('signupForm').reset();
    
    // Redirect to login page after delay
    setTimeout(() => {
        window.location.href = `login.html?username=${encodeURIComponent(username)}&success=signup`;
    }, 2000);
    
    showLoading(false);
}

// Password strength checker
function setupPasswordStrength() {
    const passwordInput = document.getElementById('signupPassword');
    const strengthFill = document.querySelector('.strength-fill');
    const strengthText = document.querySelector('.strength-text');
    
    if (passwordInput && strengthFill && strengthText) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            const strength = calculatePasswordStrength(password);
            
            strengthFill.className = 'strength-fill';
            
            if (password.length === 0) {
                strengthFill.style.width = '0%';
                strengthText.textContent = 'Password strength';
                return;
            }
            
            switch (strength.level) {
                case 1:
                    strengthFill.classList.add('weak');
                    strengthText.textContent = 'Weak password';
                    break;
                case 2:
                    strengthFill.classList.add('fair');
                    strengthText.textContent = 'Fair password';
                    break;
                case 3:
                    strengthFill.classList.add('good');
                    strengthText.textContent = 'Good password';
                    break;
                case 4:
                    strengthFill.classList.add('strong');
                    strengthText.textContent = 'Strong password';
                    break;
            }
        });
    }
}

// Calculate password strength
function calculatePasswordStrength(password) {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    return {
        level: Math.min(score, 4),
        score: score
    };
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
    
    .signup-benefits {
        background: rgba(212, 175, 55, 0.1);
        border: 1px solid rgba(212, 175, 55, 0.3);
        border-radius: var(--radius-md);
        padding: 25px;
        backdrop-filter: blur(10px);
        margin-top: 40px;
    }
    
    .signup-benefits h4 {
        color: var(--accent-gold);
        font-size: 1rem;
        font-weight: 600;
        margin-bottom: 15px;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .benefit-info p {
        margin-bottom: 8px;
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.9);
    }
    
    .benefit-info strong {
        color: var(--accent-gold);
        margin-right: 8px;
    }
    
    .benefit-note {
        font-size: 0.8rem !important;
        color: rgba(255, 255, 255, 0.6) !important;
        font-style: italic;
        margin-top: 10px;
    }
    
    .auth-navigation {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 25px;
        padding-top: 20px;
        border-top: 1px solid rgba(212, 175, 55, 0.2);
    }
    
    .auth-link {
        color: var(--accent-gold);
        text-decoration: none;
        font-size: 0.9rem;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        transition: var(--transition-smooth);
        font-weight: 500;
    }
    
    .auth-link:hover {
        color: var(--accent-gold-light);
        text-decoration: underline;
    }
`;
document.head.appendChild(style);