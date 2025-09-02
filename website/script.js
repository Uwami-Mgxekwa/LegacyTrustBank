const SUPABASE_URL = 'https://qujmowmhvpzssrrkysub.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1am1vd21odnB6c3Nycmt5c3ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NDI2ODksImV4cCI6MjA3MjExODY4OX0.94S_bdTvBe94GLkSZNNXUOqesanNRQ1jT3UL6IeshG4';

// Global State
let currentUser = null;
let supabaseClient = null;
let userAccounts = {
    current: { balance: 0, accountNumber: '0234503502200' },
    savings: { balance: 0, accountNumber: '0234503502201' }
};
let transactions = [];

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    try {
        // Hide loading overlay immediately
        hideLoading();
        
        // Initialize Supabase
        if (typeof supabase !== 'undefined') {
            supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }
        
        updateCurrentDate();
        setupEventListeners();
        
        // Check for saved session
        const savedUser = localStorage.getItem('legacyTrustUser');
        if (savedUser) {
            try {
                currentUser = JSON.parse(savedUser);
                await loadUserData();
                showBankingInterface();
            } catch (error) {
                localStorage.removeItem('legacyTrustUser');
                showLoginScreen();
            }
        } else {
            showLoginScreen();
        }
    } catch (error) {
        console.error('App initialization error:', error);
        hideLoading();
        showLoginScreen();
    }
}

// Event Listeners
function setupEventListeners() {
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('transferForm').addEventListener('submit', handleTransfer);
    
    document.querySelectorAll('.nav-button[data-section]').forEach(button => {
        button.addEventListener('click', handleNavigation);
    });
    
    document.getElementById('pinInput').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') confirmPin();
    });
    
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('pinModal');
        if (event.target === modal) closePinModal();
    });
}

// Authentication
async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        showMessage('loginMessage', 'Please enter both username and password', 'error');
        return;
    }
    
    showLoading();
    
    try {
        // Demo mode authentication
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        currentUser = {
            id: 'demo-user',
            username: username,
            fullName: username.toUpperCase(),
            email: username + '@demo.com'
        };
        
        localStorage.setItem('legacyTrustUser', JSON.stringify(currentUser));
        await loadUserData();
        showBankingInterface();
        
    } catch (error) {
        showMessage('loginMessage', 'Login failed. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

function signOut() {
    localStorage.removeItem('legacyTrustUser');
    currentUser = null;
    userAccounts = { 
        current: { balance: 0, accountNumber: '0234503502200' }, 
        savings: { balance: 0, accountNumber: '0234503502201' } 
    };
    transactions = [];
    
    document.getElementById('loginForm').reset();
    document.getElementById('transferForm').reset();
    showLoginScreen();
}

// Data Loading
async function loadUserData() {
    if (!currentUser) return;
    
    try {
        showLoading();
        
        // Demo data
        userAccounts.current.balance = 4780.00;
        userAccounts.savings.balance = 73500.00;
        transactions = [
            { id: 1, type: 'sent', account: '7459231860', payee_name: 'John Smith', amount: 4300, date: '2025-09-02', description: 'Payment', account_type: 'current' },
            { id: 2, type: 'received', account: '8910345721', payee_name: 'Mary Johnson', amount: 500, date: '2025-09-02', description: 'Transfer received', account_type: 'current' },
            { id: 3, type: 'sent', account: '6572948130', payee_name: 'ABC Store', amount: 9900, date: '2025-09-01', description: 'Bill payment', account_type: 'current' }
        ];
        
        updateUI();
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
    document.getElementById('currentBalance').textContent = userAccounts.current.balance.toFixed(2);
    document.getElementById('savingsBalance').textContent = userAccounts.savings.balance.toFixed(2);
}

function updateUserGreeting() {
    if (currentUser) {
        document.getElementById('userGreeting').textContent = `Hi, ${currentUser.fullName}`;
    }
}

function updateCurrentDate() {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = today.toLocaleDateString('en-US', options);
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
    
    document.getElementById('monthlyIncome').textContent = `+ R ${income.toFixed(2)}`;
    document.getElementById('monthlyExpenses').textContent = `- R ${expenses.toFixed(2)}`;
    document.getElementById('netChange').textContent = `${netChange >= 0 ? '+' : ''} R ${netChange.toFixed(2)}`;
    document.getElementById('netChange').style.color = netChange >= 0 ? '#28a745' : '#dc3545';
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
    
    summary.innerHTML = `
        <p><strong>From:</strong> ${transferDetails.fromAccount.charAt(0).toUpperCase() + transferDetails.fromAccount.slice(1)} Account</p>
        <p><strong>To:</strong> ${transferDetails.payeeName}</p>
        <p><strong>Account:</strong> ${transferDetails.payeeAccount}</p>
        <p><strong>Amount:</strong> R ${transferDetails.amount.toFixed(2)}</p>
        ${transferDetails.message ? `<p><strong>Reference:</strong> ${transferDetails.message}</p>` : ''}
    `;
    
    window.pendingTransfer = transferDetails;
    modal.style.display = 'block';
    document.getElementById('pinInput').focus();
}

function closePinModal() {
    document.getElementById('pinModal').style.display = 'none';
    document.getElementById('pinInput').value = '';
    window.pendingTransfer = null;
}

async function confirmPin() {
    const pin = document.getElementById('pinInput').value;
    
    if (pin !== '1234') {
        alert('Incorrect PIN. Please try again.');
        document.getElementById('pinInput').value = '';
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
        
        document.getElementById('transferForm').reset();
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
    const accountFilter = document.getElementById('accountFilter').value;
    const typeFilter = document.getElementById('typeFilter').value;
    const dateFrom = document.getElementById('dateFromFilter').value;
    const dateTo = document.getElementById('dateToFilter').value;
    
    let filteredTransactions = [...transactions];
    
    if (accountFilter !== 'all') {
        filteredTransactions = filteredTransactions.filter(t => t.account_type === accountFilter);
    }
    
    if (typeFilter !== 'all') {
        filteredTransactions = filteredTransactions.filter(t => t.type === typeFilter);
    }
    
    if (dateFrom) {
        filteredTransactions = filteredTransactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= new Date(dateFrom);
        });
    }
    
    if (dateTo) {
        filteredTransactions = filteredTransactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate <= new Date(dateTo);
        });
    }
    
    const allList = document.getElementById('allTransactionsList');
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
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.classList.remove('hidden');
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.classList.add('hidden');
}

function showLoginScreen() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('bankingInterface').classList.add('hidden');
    document.getElementById('username').focus();
}

function showBankingInterface() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('bankingInterface').classList.remove('hidden');
    showSection('dashboard');
}