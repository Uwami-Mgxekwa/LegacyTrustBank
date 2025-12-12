// Legacy Trust Bank - Banking Application JavaScript
// Global State
let currentUser = null;
let userAccounts = {
    current: { balance: 4780.00, accountNumber: '0234503502200' },
    savings: { balance: 73500.00, accountNumber: '0234503502201' }
};
let transactions = [
    { id: 1, type: 'sent', account: '7459231860', payee_name: 'John Smith', amount: 4300, date: '2025-12-10', description: 'Payment', account_type: 'current' },
    { id: 2, type: 'received', account: '8910345721', payee_name: 'Mary Johnson', amount: 500, date: '2025-12-11', description: 'Transfer received', account_type: 'current' },
    { id: 3, type: 'sent', account: '6572948130', payee_name: 'ABC Store', amount: 9900, date: '2025-12-09', description: 'Bill payment', account_type: 'current' },
    { id: 4, type: 'received', account: '5432167890', payee_name: 'Salary Deposit', amount: 15000, date: '2025-12-01', description: 'Monthly salary', account_type: 'current' },
    { id: 5, type: 'sent', account: '9876543210', payee_name: 'Rent Payment', amount: 8500, date: '2025-12-01', description: 'Monthly rent', account_type: 'current' }
];

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    console.log('Banking app initializing...');
    initializeApp();
});

async function initializeApp() {
    try {
        console.log('Setting up banking app...');
        
        updateCurrentDate();
        setupEventListeners();
        
        // Check for saved session
        const savedUser = localStorage.getItem('legacyTrustUser');
        if (savedUser) {
            try {
                currentUser = JSON.parse(savedUser);
                console.log('Found saved user:', currentUser);
                await loadUserData();
                showBankingInterface();
            } catch (error) {
                console.log('Invalid saved session, clearing...');
                localStorage.removeItem('legacyTrustUser');
                showLoginScreen();
            }
        } else {
            console.log('No saved session, showing login...');
            showLoginScreen();
        }
    } catch (error) {
        console.error('App initialization error:', error);
        showLoginScreen();
    }
}

// Event Listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        console.log('Login form listener added');
    }
    
    const transferForm = document.getElementById('transferForm');
    if (transferForm) {
        transferForm.addEventListener('submit', handleTransfer);
        console.log('Transfer form listener added');
    }
    
    // Navigation buttons
    document.querySelectorAll('.nav-button[data-section]').forEach(button => {
        button.addEventListener('click', handleNavigation);
    });
    
    // PIN input
    const pinInput = document.getElementById('pinInput');
    if (pinInput) {
        pinInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') confirmPin();
        });
    }
    
    // Modal close
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('pinModal');
        if (event.target === modal) closePinModal();
    });
    
    console.log('All event listeners set up');
}

// Authentication
async function handleLogin(e) {
    e.preventDefault();
    console.log('Login form submitted');
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    console.log('Login attempt with username:', username);
    
    if (!username || !password) {
        showMessage('loginMessage', 'Please enter both username and password', 'error');
        return;
    }
    
    showLoading();
    
    try {
        // Demo mode authentication - simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        currentUser = {
            id: 'demo-user-' + Date.now(),
            username: username,
            fullName: username.charAt(0).toUpperCase() + username.slice(1),
            email: username + '@demo.com'
        };
        
        console.log('Login successful, user:', currentUser);
        
        localStorage.setItem('legacyTrustUser', JSON.stringify(currentUser));
        await loadUserData();
        showBankingInterface();
        
    } catch (error) {
        console.error('Login error:', error);
        showMessage('loginMessage', 'Login failed. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

function signOut() {
    console.log('Signing out user');
    localStorage.removeItem('legacyTrustUser');
    currentUser = null;
    
    // Reset forms
    const loginForm = document.getElementById('loginForm');
    const transferForm = document.getElementById('transferForm');
    if (loginForm) loginForm.reset();
    if (transferForm) transferForm.reset();
    
    showLoginScreen();
}

// Data Loading
async function loadUserData() {
    if (!currentUser) return;
    
    try {
        console.log('Loading user data for:', currentUser.username);
        showLoading();
        
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        updateUI();
        console.log('User data loaded successfully');
    } catch (error) {
        console.error('Error loading user data:', error);
    } finally {
        hideLoading();
    }
}

// UI Updates
function updateUI() {
    updateAccountBalances();
    loadRecentTransactions();
    updateSummaryCards();
    updateUserGreeting();
}

function updateAccountBalances() {
    const currentBalance = document.getElementById('currentBalance');
    const savingsBalance = document.getElementById('savingsBalance');
    
    if (currentBalance) currentBalance.textContent = userAccounts.current.balance.toFixed(2);
    if (savingsBalance) savingsBalance.textContent = userAccounts.savings.balance.toFixed(2);
}

function updateUserGreeting() {
    if (currentUser) {
        const userGreeting = document.getElementById('userGreeting');
        if (userGreeting) {
            userGreeting.textContent = `Hi, ${currentUser.fullName}`;
        }
    }
}

function updateCurrentDate() {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const currentDate = document.getElementById('currentDate');
    if (currentDate) {
        currentDate.textContent = today.toLocaleDateString('en-US', options);
    }
}

function updateSummaryCards() {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const monthlyTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
    });
    
    const income = monthlyTransactions
        .filter(t => t.type === 'received')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const expenses = monthlyTransactions
        .filter(t => t.type === 'sent')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const netChange = income - expenses;
    
    const monthlyIncome = document.getElementById('monthlyIncome');
    const monthlyExpenses = document.getElementById('monthlyExpenses');
    const netChangeEl = document.getElementById('netChange');
    
    if (monthlyIncome) monthlyIncome.textContent = `+ R ${income.toFixed(2)}`;
    if (monthlyExpenses) monthlyExpenses.textContent = `- R ${expenses.toFixed(2)}`;
    if (netChangeEl) {
        netChangeEl.textContent = `${netChange >= 0 ? '+' : ''} R ${netChange.toFixed(2)}`;
        netChangeEl.style.color = netChange >= 0 ? '#28a745' : '#dc3545';
    }
}

// Navigation
function handleNavigation(e) {
    const section = e.target.dataset.section;
    showSection(section);
    
    document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
}

function showSection(sectionName) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    
    const targetSection = document.getElementById(sectionName + 'Section');
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }
    
    switch(sectionName) {
        case 'transactions':
            loadAllTransactions();
            break;
        case 'transfer':
            loadRecentTransfers();
            break;
        case 'dashboard':
            loadRecentTransactions();
            break;
    }
}

// Transaction Display
function loadRecentTransactions() {
    const recentList = document.getElementById('recentTransactionsList');
    if (!recentList) return;
    
    if (transactions.length === 0) {
        recentList.innerHTML = '<div class="no-data">No recent transactions</div>';
        return;
    }
    
    recentList.innerHTML = '';
    transactions.slice(0, 5).forEach(transaction => {
        const transactionElement = createTransactionElement(transaction);
        recentList.appendChild(transactionElement);
    });
}

function loadAllTransactions() {
    const allList = document.getElementById('allTransactionsList');
    if (!allList) return;
    
    if (transactions.length === 0) {
        allList.innerHTML = '<div class="no-data">No transactions found</div>';
        return;
    }
    
    allList.innerHTML = '';
    transactions.forEach(transaction => {
        const transactionElement = createTransactionElement(transaction);
        allList.appendChild(transactionElement);
    });
}

function loadRecentTransfers() {
    const transfersList = document.getElementById('recentTransfersList');
    if (!transfersList) return;
    
    const sentTransactions = transactions.filter(t => t.type === 'sent').slice(0, 5);
    
    if (sentTransactions.length === 0) {
        transfersList.innerHTML = '<div class="no-data">No recent transfers</div>';
        return;
    }
    
    transfersList.innerHTML = '';
    sentTransactions.forEach(transaction => {
        const transactionElement = createTransactionElement(transaction);
        transfersList.appendChild(transactionElement);
    });
}

function createTransactionElement(transaction) {
    const item = document.createElement('div');
    item.className = 'transaction-item';
    
    const iconClass = transaction.type === 'sent' ? 'sent' : 'received';
    const icon = transaction.type === 'sent' ? '↗' : '↙';
    const sign = transaction.type === 'sent' ? '-' : '+';
    
    const displayDate = new Date(transaction.date).toLocaleDateString();
    const payeeName = transaction.payee_name || 'Unknown';
    const accountNumber = transaction.account || 'Unknown';
    
    item.innerHTML = `
        <div style="display: flex; align-items: center;">
            <div class="transaction-icon ${iconClass}">${icon}</div>
            <div class="transaction-details">
                <div class="transaction-account">${payeeName}</div>
                <div class="transaction-date">Acc: ${accountNumber} • ${displayDate}</div>
            </div>
        </div>
        <div class="transaction-amount ${iconClass}">${sign} R ${parseFloat(transaction.amount).toFixed(2)}</div>
    `;
    
    return item;
}

// Transfer Functions
async function handleTransfer(e) {
    e.preventDefault();
    
    const fromAccount = document.getElementById('fromAccount').value;
    const payeeAccount = document.getElementById('payeeAccount').value.trim();
    const payeeName = document.getElementById('payeeName').value.trim();
    const amount = parseFloat(document.getElementById('transferAmount').value);
    const message = document.getElementById('transferMessage').value.trim();
    
    if (!payeeAccount || !payeeName || !amount || amount <= 0) {
        showMessage('transferStatus', 'Please fill in all required fields', 'error');
        return;
    }
    
    if (amount > userAccounts[fromAccount].balance) {
        showMessage('transferStatus', 'Insufficient funds', 'error');
        return;
    }
    
    showPinModal({ fromAccount, payeeAccount, payeeName, amount, message });
}

function showPinModal(transferDetails) {
    const modal = document.getElementById('pinModal');
    const summary = document.getElementById('transferSummary');
    
    if (!modal || !summary) return;
    
    summary.innerHTML = `
        <p><strong>From:</strong> ${transferDetails.fromAccount.charAt(0).toUpperCase() + transferDetails.fromAccount.slice(1)} Account</p>
        <p><strong>To:</strong> ${transferDetails.payeeName}</p>
        <p><strong>Account:</strong> ${transferDetails.payeeAccount}</p>
        <p><strong>Amount:</strong> R ${transferDetails.amount.toFixed(2)}</p>
        ${transferDetails.message ? `<p><strong>Reference:</strong> ${transferDetails.message}</p>` : ''}
    `;
    
    window.pendingTransfer = transferDetails;
    modal.style.display = 'block';
    
    const pinInput = document.getElementById('pinInput');
    if (pinInput) pinInput.focus();
}

function closePinModal() {
    const modal = document.getElementById('pinModal');
    const pinInput = document.getElementById('pinInput');
    
    if (modal) modal.style.display = 'none';
    if (pinInput) pinInput.value = '';
    window.pendingTransfer = null;
}

async function confirmPin() {
    const pinInput = document.getElementById('pinInput');
    if (!pinInput) return;
    
    const pin = pinInput.value;
    
    if (pin !== '1234') {
        alert('Incorrect PIN. Please try again.');
        pinInput.value = '';
        return;
    }
    
    if (window.pendingTransfer) {
        await processTransfer(window.pendingTransfer);
        closePinModal();
    }
}

async function processTransfer(transferDetails) {
    try {
        showLoading();
        
        const { fromAccount, payeeAccount, payeeName, amount, message } = transferDetails;
        
        // Update balance
        userAccounts[fromAccount].balance -= amount;
        
        // Create transaction
        const newTransaction = {
            id: Date.now(),
            user_id: currentUser.id,
            type: 'sent',
            account: payeeAccount,
            payee_name: payeeName,
            amount: amount,
            date: new Date().toISOString().split('T')[0],
            description: message || 'Money transfer',
            account_type: fromAccount
        };
        
        transactions.unshift(newTransaction);
        updateUI();
        
        const transferForm = document.getElementById('transferForm');
        if (transferForm) transferForm.reset();
        
        showMessage('transferStatus', `R ${amount.toFixed(2)} sent successfully to ${payeeName}`, 'success');
        
    } catch (error) {
        console.error('Transfer error:', error);
        showMessage('transferStatus', 'Transfer failed. Please try again.', 'error');
        userAccounts[transferDetails.fromAccount].balance += transferDetails.amount;
        updateAccountBalances();
    } finally {
        hideLoading();
    }
}

// Filter Functions
function applyFilters() {
    const accountFilter = document.getElementById('accountFilter');
    const typeFilter = document.getElementById('typeFilter');
    const dateFromFilter = document.getElementById('dateFromFilter');
    const dateToFilter = document.getElementById('dateToFilter');
    
    if (!accountFilter || !typeFilter) return;
    
    let filteredTransactions = [...transactions];
    
    if (accountFilter.value !== 'all') {
        filteredTransactions = filteredTransactions.filter(t => t.account_type === accountFilter.value);
    }
    
    if (typeFilter.value !== 'all') {
        filteredTransactions = filteredTransactions.filter(t => t.type === typeFilter.value);
    }
    
    if (dateFromFilter && dateFromFilter.value) {
        filteredTransactions = filteredTransactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= new Date(dateFromFilter.value);
        });
    }
    
    if (dateToFilter && dateToFilter.value) {
        filteredTransactions = filteredTransactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate <= new Date(dateToFilter.value);
        });
    }
    
    const allList = document.getElementById('allTransactionsList');
    if (!allList) return;
    
    if (filteredTransactions.length === 0) {
        allList.innerHTML = '<div class="no-data">No transactions match your filters</div>';
        return;
    }
    
    allList.innerHTML = '';
    filteredTransactions.forEach(transaction => {
        const transactionElement = createTransactionElement(transaction);
        allList.appendChild(transactionElement);
    });
}

async function refreshData() {
    if (!currentUser) return;
    await loadUserData();
    showMessage('transferStatus', 'Data refreshed successfully', 'success');
}

// Utility Functions
function showMessage(elementId, message, type) {
    const messageElement = document.getElementById(elementId);
    if (!messageElement) return;
    
    messageElement.textContent = message;
    messageElement.className = `status-message ${type}`;
    messageElement.classList.remove('hidden');
    
    setTimeout(() => {
        messageElement.classList.add('hidden');
    }, 5000);
}

function showLoading() {
    // Create loading overlay if it doesn't exist
    let overlay = document.getElementById('loadingOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-spinner"></div>
            <div class="loading-text">Loading...</div>
        `;
        document.body.appendChild(overlay);
    }
    overlay.classList.remove('hidden');
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.classList.add('hidden');
}

function showLoginScreen() {
    console.log('Showing login screen');
    const loginScreen = document.getElementById('loginScreen');
    const bankingInterface = document.getElementById('bankingInterface');
    
    if (loginScreen) loginScreen.classList.remove('hidden');
    if (bankingInterface) bankingInterface.classList.add('hidden');
    
    const usernameInput = document.getElementById('username');
    if (usernameInput) usernameInput.focus();
}

function showBankingInterface() {
    console.log('Showing banking interface');
    const loginScreen = document.getElementById('loginScreen');
    const bankingInterface = document.getElementById('bankingInterface');
    
    if (loginScreen) loginScreen.classList.add('hidden');
    if (bankingInterface) bankingInterface.classList.remove('hidden');
    
    showSection('dashboard');
}

// Global functions for onclick handlers
window.signOut = signOut;
window.refreshData = refreshData;
window.applyFilters = applyFilters;
window.confirmPin = confirmPin;
window.closePinModal = closePinModal;

console.log('Banking app script loaded successfully');