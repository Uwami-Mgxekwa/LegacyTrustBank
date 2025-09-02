const SUPABASE_URL = 'https://qujmowmhvpzssrrkysub.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here'; // Replace with your actual anon key
let supabaseClient = null;

// Global Application State
let currentUser = null;
let userAccounts = {
    current: { balance: 0, accountNumber: '0234503502200' },
    savings: { balance: 0, accountNumber: '0234503502201' }
};
let transactions = [];
let isLoading = false;

// Application Initialization
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    try {
        // Initialize Supabase client
        if (typeof supabase !== 'undefined') {
            supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        } else {
            console.warn('Supabase not loaded, running in demo mode');
        }
        
        updateCurrentDate();
        setupEventListeners();
        
        // Check for existing session
        const savedUser = localStorage.getItem('legacyTrustUser');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            await loadUserData();
            showBankingInterface();
        } else {
            showLoginScreen();
        }
    } catch (error) {
        console.error('App initialization error:', error);
        showLoginScreen();
    }
}

// Event Listeners Setup
function setupEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Transfer form
    document.getElementById('transferForm').addEventListener('submit', handleTransfer);
    
    // Navigation buttons
    document.querySelectorAll('.nav-button[data-section]').forEach(button => {
        button.addEventListener('click', handleNavigation);
    });
    
    // PIN modal enter key
    document.getElementById('pinInput').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            confirmPin();
        }
    });
    
    // Close modal on outside click
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('pinModal');
        if (event.target === modal) {
            closePinModal();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// Authentication Functions
async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        showMessage('loginMessage', 'Please enter both username and password', 'error');
        return;
    }
    
    showLoading(true);
    
    try {
        // In production, implement proper authentication
        if (supabaseClient) {
            // Example Supabase auth integration
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: username,
                password: password
            });
            
            if (error) {
                throw new Error(error.message);
            }
            
            currentUser = {
                id: data.user.id,
                username: username,
                fullName: data.user.user_metadata?.full_name || username.toUpperCase(),
                email: data.user.email
            };
        } else {
            // Demo mode - simulate login
            await new Promise(resolve => setTimeout(resolve, 1000));
            currentUser = {
                id: 'demo-user',
                username: username,
                fullName: username.toUpperCase(),
                email: username + '@demo.com'
            };
        }
        
        localStorage.setItem('legacyTrustUser', JSON.stringify(currentUser));
        await loadUserData();
        showBankingInterface();
        
    } catch (error) {
        console.error('Login error:', error);
        showMessage('loginMessage', 'Invalid credentials. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

async function signOut() {
    try {
        if (supabaseClient) {
            await supabaseClient.auth.signOut();
        }
        
        localStorage.removeItem('legacyTrustUser');
        currentUser = null;
        userAccounts = { current: { balance: 0 }, savings: { balance: 0 } };
        transactions = [];
        
        // Clear forms
        document.getElementById('loginForm').reset();
        document.getElementById('transferForm').reset();
        
        showLoginScreen();
    } catch (error) {
        console.error('Sign out error:', error);
    }
}

// Data Loading Functions
async function loadUserData() {
    if (!currentUser) return;
    
    try {
        showLoading(true);
        
        if (supabaseClient) {
            // Load account balances
            await loadAccountBalances();
            // Load transactions
            await loadTransactionsFromDB();
        } else {
            // Demo data
            userAccounts.current.balance = 4780.00;
            userAccounts.savings.balance = 73500.00;
            transactions = [
                { id: 1, type: 'sent', account: '7459231860', payee_name: 'John Smith', amount: 4300, date: '2025-09-02', description: 'Payment', account_type: 'current' },
                { id: 2, type: 'received', account: '8910345721', payee_name: 'Mary Johnson', amount: 500, date: '2025-09-02', description: 'Transfer received', account_type: 'current' },
                { id: 3, type: 'sent', account: '6572948130', payee_name: 'ABC Store', amount: 9900, date: '2025-09-01', description: 'Bill payment', account_type: 'current' }
            ];
        }
        
        updateUI();
    } catch (error) {
        console.error('Error loading user data:', error);
        showMessage('transferStatus', 'Error loading account data', 'error');
    } finally {
        showLoading(false);
    }
}

async function loadAccountBalances() {
    if (!supabaseClient || !currentUser) return;
    
    try {
        const { data, error } = await supabaseClient
            .from('accounts')
            .select('account_type, balance, account_number')
            .eq('user_id', currentUser.id);
        
        if (error) throw error;
        
        data.forEach(account => {
            if (userAccounts[account.account_type]) {
                userAccounts[account.account_type].balance = account.balance;
                userAccounts[account.account_type].accountNumber = account.account_number;
            }
        });
    } catch (error) {
        console.error('Error loading account balances:', error);
    }
}

async function loadTransactionsFromDB() {
    if (!supabaseClient || !currentUser) return;
    
    try {
        const { data, error } = await supabaseClient
            .from('transactions')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false })
            .limit(50);
        
        if (error) throw error;
        
        transactions = data || [];
    } catch (error) {
        console.error('Error loading transactions:', error);
    }
}

// UI Update Functions
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
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    document.getElementById('currentDate').textContent = today.toLocaleDateString('en-US', options);
}

function updateSummaryCards() {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const monthlyTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date || t.created_at);
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

// Navigation Functions
function handleNavigation(e) {
    const section = e.target.dataset.section;
    showSection(section);
    
    // Update active button
    document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
}

function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionName + 'Section');
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }
    
    // Load section-specific data
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

// Transaction Display Functions
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
    const amountClass = transaction.type === 'sent' ? 'sent' : 'received';
    const icon = transaction.type === 'sent' ? '↗' : '↙';
    const sign = transaction.type === 'sent' ? '-' : '+';
    
    const displayDate = new Date(transaction.date || transaction.created_at).toLocaleDateString();
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
        <div class="transaction-amount ${amountClass}">${sign} R ${parseFloat(transaction.amount).toFixed(2)}</div>
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
    
    // Validation
    if (!payeeAccount || !payeeName || !amount || amount <= 0) {
        showMessage('transferStatus', 'Please fill in all required fields with valid values', 'error');
        return;
    }
    
    if (amount > userAccounts[fromAccount].balance) {
        showMessage('transferStatus', `Insufficient funds in your ${fromAccount} account`, 'error');
        return;
    }
    
    // Show confirmation modal
    showPinModal({
        fromAccount,
        payeeAccount,
        payeeName,
        amount,
        message
    });
}

function showPinModal(transferDetails) {
    const modal = document.getElementById('pinModal');
    const summary = document.getElementById('transferSummary');
    
    // Create transfer summary
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
    
    // Simple PIN validation (in production, validate against user's actual PIN)
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
        showLoading(true);
        
        const { fromAccount, payeeAccount, payeeName, amount, message } = transferDetails;
        
        // Update local balance
        userAccounts[fromAccount].balance -= amount;
        
        // Create transaction record
        const newTransaction = {
            id: Date.now(), // Temporary ID for demo
            user_id: currentUser.id,
            type: 'sent',
            account: payeeAccount,
            payee_name: payeeName,
            amount: amount,
            date: new Date().toISOString().split('T')[0],
            description: message || 'Money transfer',
            account_type: fromAccount,
            created_at: new Date().toISOString()
        };
        
        if (supabaseClient) {
            // Save to database
            const { error: transactionError } = await supabaseClient
                .from('transactions')
                .insert([newTransaction]);
            
            if (transactionError) throw transactionError;
            
            // Update account balance in database
            const { error: balanceError } = await supabaseClient
                .from('accounts')
                .update({ balance: userAccounts[fromAccount].balance })
                .eq('user_id', currentUser.id)
                .eq('account_type', fromAccount);
            
            if (balanceError) throw balanceError;
        }
        
        // Add to local transactions
        transactions.unshift(newTransaction);
        
        // Update UI
        updateUI();
        
        // Clear form
        document.getElementById('transferForm').reset();
        
        // Show success message
        showMessage('transferStatus', 
            `R ${amount.toFixed(2)} sent successfully to ${payeeName}`, 
            'success'
        );
        
    } catch (error) {
        console.error('Transfer error:', error);
        showMessage('transferStatus', 'Transfer failed. Please try again.', 'error');
        
        // Revert balance change on error
        userAccounts[transferDetails.fromAccount].balance += transferDetails.amount;
        updateAccountBalances();
    } finally {
        showLoading(false);
    }
}

// Filter Functions
function applyFilters() {
    const accountFilter = document.getElementById('accountFilter').value;
    const typeFilter = document.getElementById('typeFilter').value;
    const dateFrom = document.getElementById('dateFromFilter').value;
    const dateTo = document.getElementById('dateToFilter').value;
    
    let filteredTransactions = [...transactions];
    
    // Apply filters
    if (accountFilter !== 'all') {
        filteredTransactions = filteredTransactions.filter(t => t.account_type === accountFilter);
    }
    
    if (typeFilter !== 'all') {
        filteredTransactions = filteredTransactions.filter(t => t.type === typeFilter);
    }
    
    if (dateFrom) {
        filteredTransactions = filteredTransactions.filter(t => {
            const transactionDate = new Date(t.date || t.created_at);
            return transactionDate >= new Date(dateFrom);
        });
    }
    
    if (dateTo) {
        filteredTransactions = filteredTransactions.filter(t => {
            const transactionDate = new Date(t.date || t.created_at);
            return transactionDate <= new Date(dateTo);
        });
    }
    
    // Update display
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

// Utility Functions
function showMessage(elementId, message, type) {
    const messageElement = document.getElementById(elementId);
    if (!messageElement) return;
    
    messageElement.textContent = message;
    messageElement.className = `status-message ${type}`;
    messageElement.classList.remove('hidden');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        messageElement.classList.add('hidden');
    }, 5000);
}

function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
        overlay.classList.remove('hidden');
        isLoading = true;
    } else {
        overlay.classList.add('hidden');
        isLoading = false;
    }
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

// Data Refresh Function
async function refreshData() {
    if (!currentUser || isLoading) return;
    
    try {
        showLoading(true);
        await loadUserData();
        showMessage('transferStatus', 'Data refreshed successfully', 'success');
    } catch (error) {
        console.error('Refresh error:', error);
        showMessage('transferStatus', 'Failed to refresh data', 'error');
    } finally {
        showLoading(false);
    }
}

// Keyboard Shortcuts
function handleKeyboardShortcuts(e) {
    // Only handle shortcuts when not in input fields
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return;
    }
    
    // Alt + key combinations
    if (e.altKey) {
        switch(e.key) {
            case '1':
                e.preventDefault();
                showSection('dashboard');
                setActiveNavButton('dashboard');
                break;
            case '2':
                e.preventDefault();
                showSection('transactions');
                setActiveNavButton('transactions');
                break;
            case '3':
                e.preventDefault();
                showSection('transfer');
                setActiveNavButton('transfer');
                break;
            case '4':
                e.preventDefault();
                showSection('notifications');
                setActiveNavButton('notifications');
                break;
            case 'r':
                e.preventDefault();
                refreshData();
                break;
            case 'q':
                e.preventDefault();
                if (confirm('Are you sure you want to sign out?')) {
                    signOut();
                }
                break;
        }
    }
    
    // Escape key to close modals
    if (e.key === 'Escape') {
        closePinModal();
    }
}

function setActiveNavButton(sectionName) {
    document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
    const targetButton = document.querySelector(`[data-section="${sectionName}"]`);
    if (targetButton) {
        targetButton.classList.add('active');
    }
}

// Account Number Formatting
function formatAccountNumber(input) {
    // Remove all non-digits
    let value = input.value.replace(/\D/g, '');
    
    // Limit to 10 digits
    value = value.substring(0, 10);
    
    // Format as XXXX-XXXX-XX
    if (value.length > 4) {
        value = value.substring(0, 4) + '-' + value.substring(4);
    }
    if (value.length > 9) {
        value = value.substring(0, 9) + '-' + value.substring(9);
    }
    
    input.value = value;
}

// Add account number formatting to payee account field
document.addEventListener('DOMContentLoaded', function() {
    const payeeAccountField = document.getElementById('payeeAccount');
    if (payeeAccountField) {
        payeeAccountField.addEventListener('input', function() {
            formatAccountNumber(this);
        });
    }
});

// Form Validation Enhancement
function validateTransferForm() {
    const form = document.getElementById('transferForm');
    const inputs = form.querySelectorAll('input[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = '#dc3545';
            isValid = false;
        } else {
            input.style.borderColor = '#e9ecef';
        }
    });
    
    return isValid;
}

// Enhanced Error Handling
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    showMessage('transferStatus', 'An unexpected error occurred. Please refresh the page.', 'error');
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    showMessage('transferStatus', 'An unexpected error occurred. Please try again.', 'error');
});

// Auto-save form data (excluding sensitive fields)
function saveFormData() {
    const payeeName = document.getElementById('payeeName').value;
    const transferMessage = document.getElementById('transferMessage').value;
    
    if (payeeName || transferMessage) {
        const formData = {
            payeeName: payeeName,
            transferMessage: transferMessage,
            timestamp: Date.now()
        };
        
        localStorage.setItem('transferFormData', JSON.stringify(formData));
    }
}

function loadFormData() {
    const savedData = localStorage.getItem('transferFormData');
    if (savedData) {
        try {
            const formData = JSON.parse(savedData);
            
            // Only load if saved within last hour
            if (Date.now() - formData.timestamp < 3600000) {
                document.getElementById('payeeName').value = formData.payeeName || '';
                document.getElementById('transferMessage').value = formData.transferMessage || '';
            } else {
                localStorage.removeItem('transferFormData');
            }
        } catch (error) {
            console.error('Error loading form data:', error);
            localStorage.removeItem('transferFormData');
        }
    }
}

// Clear saved form data on successful transfer
function clearSavedFormData() {
    localStorage.removeItem('transferFormData');
}

// Add form auto-save listeners
document.addEventListener('DOMContentLoaded', function() {
    const payeeNameField = document.getElementById('payeeName');
    const messageField = document.getElementById('transferMessage');
    
    if (payeeNameField && messageField) {
        payeeNameField.addEventListener('input', saveFormData);
        messageField.addEventListener('input', saveFormData);
        
        // Load saved data when transfer section is shown
        setTimeout(loadFormData, 100);
    }
});

// Update processTransfer to clear saved data on success
const originalProcessTransfer = processTransfer;
processTransfer = async function(transferDetails) {
    try {
        await originalProcessTransfer(transferDetails);
        clearSavedFormData();
    } catch (error) {
        throw error;
    }
};

// Session timeout handling
let sessionTimeout;
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

function resetSessionTimeout() {
    clearTimeout(sessionTimeout);
    if (currentUser) {
        sessionTimeout = setTimeout(() => {
            alert('Your session has expired. Please log in again.');
            signOut();
        }, SESSION_TIMEOUT);
    }
}

// Reset timeout on user activity
document.addEventListener('click', resetSessionTimeout);
document.addEventListener('keydown', resetSessionTimeout);

// Initialize session timeout on login
const originalShowBankingInterface = showBankingInterface;
showBankingInterface = function() {
    originalShowBankingInterface();
    resetSessionTimeout();
};

// Accessibility improvements
function initializeAccessibility() {
    // Add ARIA labels and descriptions
    document.querySelectorAll('.nav-button').forEach((button, index) => {
        button.setAttribute('aria-label', button.textContent.trim());
        button.setAttribute('tabindex', '0');
    });
    
    // Add keyboard navigation for transaction items
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab' && e.target.classList.contains('transaction-item')) {
            e.target.style.outline = '2px solid #667eea';
        }
    });
    
    // Announce balance updates to screen readers
    const balanceElements = document.querySelectorAll('[id$="Balance"]');
    balanceElements.forEach(element => {
        element.setAttribute('aria-live', 'polite');
    });
}

// Call accessibility setup after DOM is loaded
document.addEventListener('DOMContentLoaded', initializeAccessibility);

// Performance optimization - debounced search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Debounced filter application
const debouncedApplyFilters = debounce(applyFilters, 300);

// Add real-time filtering
document.addEventListener('DOMContentLoaded', function() {
    const filterInputs = document.querySelectorAll('#accountFilter, #typeFilter, #dateFromFilter, #dateToFilter');
    filterInputs.forEach(input => {
        input.addEventListener('change', debouncedApplyFilters);
    });
});

// Export data functionality
function exportTransactions() {
    if (transactions.length === 0) {
        alert('No transactions to export');
        return;
    }
    
    const csvContent = [
        ['Date', 'Type', 'Payee', 'Account', 'Amount', 'Description'].join(','),
        ...transactions.map(t => [
            t.date || new Date(t.created_at).toISOString().split('T')[0],
            t.type,
            t.payee_name,
            t.account,
            t.amount,
            t.description || ''
        ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Complete the printTransactions function
function printTransactions() {
    const printWindow = window.open('', '', 'height=600,width=800');
    const transactionsHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Transaction History - Legacy Trust Bank</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
                .transaction { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
                .transaction:last-child { border-bottom: none; }
                .amount { font-weight: bold; }
                .sent { color: #d32f2f; }
                .received { color: #388e3c; }
                @media print { body { margin: 0; } }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Legacy Trust Bank</h1>
                <h2>Transaction History</h2>
                <p>Account Holder: ${currentUser ? currentUser.fullName : 'N/A'}</p>
                <p>Generated on: ${new Date().toLocaleDateString()}</p>
            </div>
            <div class="transactions">
                ${transactions.map(t => `
                    <div class="transaction">
                        <div>
                            <div><strong>${t.payee_name}</strong></div>
                            <div>Account: ${t.account}</div>
                            <div>Date: ${new Date(t.date || t.created_at).toLocaleDateString()}</div>
                            ${t.description ? `<div>Note: ${t.description}</div>` : ''}
                        </div>
                        <div class="amount ${t.type}">${t.type === 'sent' ? '-' : '+'} R ${parseFloat(t.amount).toFixed(2)}</div>
                    </div>
                `).join('')}
            </div>
        </body>
        </html>
    `;
    
    printWindow.document.write(transactionsHTML);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 250);
}

// Add export and print buttons to transactions section
function addExportButtons() {
    const transactionsSection = document.getElementById('transactionsSection');
    if (!transactionsSection) return;
    
    const existingActions = transactionsSection.querySelector('.transaction-actions');
    if (existingActions) return; // Already added
    
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'transaction-actions';
    actionsDiv.style.cssText = `
        display: flex;
        gap: 15px;
        margin-bottom: 20px;
        justify-content: flex-end;
    `;
    
    const exportBtn = document.createElement('button');
    exportBtn.className = 'filter-btn';
    exportBtn.innerHTML = '📁 Export CSV';
    exportBtn.onclick = exportTransactions;
    
    const printBtn = document.createElement('button');
    printBtn.className = 'filter-btn';
    printBtn.innerHTML = '🖨️ Print';
    printBtn.onclick = printTransactions;
    
    actionsDiv.appendChild(exportBtn);
    actionsDiv.appendChild(printBtn);
    
    const filterSection = transactionsSection.querySelector('.filter-section');
    if (filterSection) {
        filterSection.parentNode.insertBefore(actionsDiv, filterSection.nextSibling);
    }
}

// Fix the loading overlay issue
function fixLoadingOverlay() {
    // Ensure loading overlay is hidden by default
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
        isLoading = false;
    }
}

// Enhanced error handling for failed initialization
async function safeInitializeApp() {
    try {
        // Hide loading overlay first
        fixLoadingOverlay();
        
        // Initialize Supabase client with better error handling
        if (typeof supabase !== 'undefined') {
            try {
                supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            } catch (supabaseError) {
                console.warn('Supabase initialization failed, running in demo mode:', supabaseError);
                supabaseClient = null;
            }
        } else {
            console.warn('Supabase not loaded, running in demo mode');
        }
        
        updateCurrentDate();
        setupEventListeners();
        
        // Add export buttons when DOM is ready
        setTimeout(addExportButtons, 100);
        
        // Check for existing session with timeout
        const savedUser = localStorage.getItem('legacyTrustUser');
        if (savedUser) {
            try {
                currentUser = JSON.parse(savedUser);
                await Promise.race([
                    loadUserData(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
                ]);
                showBankingInterface();
            } catch (error) {
                console.warn('Failed to load user data, clearing session:', error);
                localStorage.removeItem('legacyTrustUser');
                currentUser = null;
                showLoginScreen();
            }
        } else {
            showLoginScreen();
        }
    } catch (error) {
        console.error('App initialization error:', error);
        fixLoadingOverlay();
        showLoginScreen();
    }
}

// Replace the original initialization
const originalInitializeApp = initializeApp;
initializeApp = safeInitializeApp;

// Fix processTransfer function wrapper that was causing issues
if (typeof originalProcessTransfer !== 'undefined') {
    // Reset to original function to avoid recursive calls
    processTransfer = originalProcessTransfer;
}

// Enhanced form data management
function enhancedSaveFormData() {
    try {
        const payeeName = document.getElementById('payeeName')?.value || '';
        const transferMessage = document.getElementById('transferMessage')?.value || '';
        
        if (payeeName || transferMessage) {
            const formData = {
                payeeName: payeeName,
                transferMessage: transferMessage,
                timestamp: Date.now()
            };
            
            localStorage.setItem('transferFormData', JSON.stringify(formData));
        }
    } catch (error) {
        console.warn('Could not save form data:', error);
    }
}

function enhancedLoadFormData() {
    try {
        const savedData = localStorage.getItem('transferFormData');
        if (savedData) {
            const formData = JSON.parse(savedData);
            
            // Only load if saved within last hour
            if (Date.now() - formData.timestamp < 3600000) {
                const payeeNameField = document.getElementById('payeeName');
                const messageField = document.getElementById('transferMessage');
                
                if (payeeNameField) payeeNameField.value = formData.payeeName || '';
                if (messageField) messageField.value = formData.transferMessage || '';
            } else {
                localStorage.removeItem('transferFormData');
            }
        }
    } catch (error) {
        console.warn('Could not load form data:', error);
        localStorage.removeItem('transferFormData');
    }
}

// Add keyboard shortcuts help
function showKeyboardShortcuts() {
    const shortcuts = [
        'Alt + 1: Dashboard',
        'Alt + 2: Transactions', 
        'Alt + 3: Transfer Funds',
        'Alt + 4: Notifications',
        'Alt + R: Refresh Data',
        'Alt + Q: Sign Out',
        'Esc: Close Modals'
    ];
    
    alert('Keyboard Shortcuts:\n\n' + shortcuts.join('\n'));
}

// Add help button functionality
function addHelpButton() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    
    const helpBtn = document.createElement('button');
    helpBtn.className = 'nav-button';
    helpBtn.innerHTML = '❓ Help';
    helpBtn.onclick = showKeyboardShortcuts;
    
    const signOutBtn = sidebar.querySelector('.sign-out-btn');
    if (signOutBtn) {
        sidebar.insertBefore(helpBtn, signOutBtn);
    }
}

// Enhanced session management
function checkSessionValidity() {
    const savedUser = localStorage.getItem('legacyTrustUser');
    if (savedUser && currentUser) {
        try {
            const userData = JSON.parse(savedUser);
            if (userData.id !== currentUser.id) {
                // Session mismatch, sign out
                signOut();
                return false;
            }
        } catch (error) {
            console.warn('Invalid session data:', error);
            signOut();
            return false;
        }
    }
    return true;
}

// Auto-retry failed operations
async function retryOperation(operation, maxRetries = 3, delay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
    }
}

// Network status monitoring
function initializeNetworkMonitoring() {
    if ('navigator' in window && 'onLine' in navigator) {
        window.addEventListener('online', () => {
            showMessage('transferStatus', 'Connection restored', 'success');
            if (currentUser) {
                refreshData();
            }
        });
        
        window.addEventListener('offline', () => {
            showMessage('transferStatus', 'Connection lost - working offline', 'error');
        });
    }
}

// Initialize enhanced features
document.addEventListener('DOMContentLoaded', function() {
    // Add small delay to ensure DOM is fully ready
    setTimeout(() => {
        addHelpButton();
        initializeNetworkMonitoring();
        
        // Enhanced form listeners
        const payeeNameField = document.getElementById('payeeName');
        const messageField = document.getElementById('transferMessage');
        
        if (payeeNameField) {
            payeeNameField.addEventListener('input', enhancedSaveFormData);
        }
        if (messageField) {
            messageField.addEventListener('input', enhancedSaveFormData);
        }
        
        // Load saved form data
        enhancedLoadFormData();
    }, 100);
});

// Enhanced transfer processing with success callback
async function enhancedProcessTransfer(transferDetails) {
    try {
        showLoading(true);
        
        const { fromAccount, payeeAccount, payeeName, amount, message } = transferDetails;
        
        // Validate session before processing
        if (!checkSessionValidity()) {
            throw new Error('Session invalid');
        }
        
        // Update local balance
        userAccounts[fromAccount].balance -= amount;
        
        // Create transaction record
        const newTransaction = {
            id: Date.now(),
            user_id: currentUser.id,
            type: 'sent',
            account: payeeAccount,
            payee_name: payeeName,
            amount: amount,
            date: new Date().toISOString().split('T')[0],
            description: message || 'Money transfer',
            account_type: fromAccount,
            created_at: new Date().toISOString()
        };
        
        if (supabaseClient) {
            // Save to database with retry
            await retryOperation(async () => {
                const { error: transactionError } = await supabaseClient
                    .from('transactions')
                    .insert([newTransaction]);
                
                if (transactionError) throw transactionError;
                
                // Update account balance in database
                const { error: balanceError } = await supabaseClient
                    .from('accounts')
                    .update({ balance: userAccounts[fromAccount].balance })
                    .eq('user_id', currentUser.id)
                    .eq('account_type', fromAccount);
                
                if (balanceError) throw balanceError;
            });
        }
        
        // Add to local transactions
        transactions.unshift(newTransaction);
        
        // Update UI
        updateUI();
        
        // Clear form and saved data
        document.getElementById('transferForm').reset();
        localStorage.removeItem('transferFormData');
        
        // Show success message
        showMessage('transferStatus', 
            `R ${amount.toFixed(2)} sent successfully to ${payeeName}`, 
            'success'
        );
        
    } catch (error) {
        console.error('Transfer error:', error);
        showMessage('transferStatus', 'Transfer failed. Please try again.', 'error');
        
        // Revert balance change on error
        userAccounts[transferDetails.fromAccount].balance += transferDetails.amount;
        updateAccountBalances();
    } finally {
        showLoading(false);
    }
}

// Replace the problematic processTransfer wrapper
processTransfer = enhancedProcessTransfer;

// Add transaction search functionality
function searchTransactions(searchTerm) {
    if (!searchTerm.trim()) {
        loadAllTransactions();
        return;
    }
    
    const filteredTransactions = transactions.filter(transaction => 
        transaction.payee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.account.includes(searchTerm) ||
        (transaction.description && transaction.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    const allList = document.getElementById('allTransactionsList');
    if (filteredTransactions.length === 0) {
        allList.innerHTML = '<div class="no-data">No transactions found for your search</div>';
        return;
    }
    
    allList.innerHTML = '';
    filteredTransactions.forEach(transaction => {
        const transactionElement = createTransactionElement(transaction);
        allList.appendChild(transactionElement);
    });
}

// Add search field to transactions section
function addSearchField() {
    const transactionsSection = document.getElementById('transactionsSection');
    if (!transactionsSection || transactionsSection.querySelector('.search-field')) return;
    
    const searchDiv = document.createElement('div');
    searchDiv.className = 'form-group search-field';
    searchDiv.style.marginBottom = '20px';
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.id = 'transactionSearch';
    searchInput.placeholder = 'Search transactions by name, account, or description...';
    searchInput.style.cssText = `
        width: 100%;
        padding: 15px;
        border: 2px solid #e9ecef;
        border-radius: 10px;
        font-size: 16px;
    `;
    
    searchInput.addEventListener('input', debounce(function() {
        searchTransactions(this.value);
    }, 300));
    
    searchDiv.appendChild(searchInput);
    
    const filterSection = transactionsSection.querySelector('.filter-section');
    if (filterSection) {
        transactionsSection.insertBefore(searchDiv, filterSection.nextSibling);
    }
}

// Clear all filters
function clearFilters() {
    document.getElementById('accountFilter').value = 'all';
    document.getElementById('typeFilter').value = 'all';
    document.getElementById('dateFromFilter').value = '';
    document.getElementById('dateToFilter').value = '';
    
    const searchField = document.getElementById('transactionSearch');
    if (searchField) {
        searchField.value = '';
    }
    
    loadAllTransactions();
}

// Add clear filters button
function addClearFiltersButton() {
    const filterSection = document.querySelector('.filter-section .filter-controls');
    if (!filterSection || filterSection.querySelector('.clear-filters-btn')) return;
    
    const clearBtn = document.createElement('button');
    clearBtn.className = 'filter-btn clear-filters-btn';
    clearBtn.innerHTML = '🗑️ Clear';
    clearBtn.onclick = clearFilters;
    clearBtn.style.background = '#6c757d';
    
    filterSection.appendChild(clearBtn);
}

// Account number validation
function validateAccountNumber(accountNumber) {
    // Remove formatting characters
    const cleanNumber = accountNumber.replace(/[^0-9]/g, '');
    
    // Check if it's 10 digits
    if (cleanNumber.length !== 10) {
        return false;
    }
    
    // Simple check to prevent self-transfer
    const userAccountNumbers = [
        userAccounts.current.accountNumber?.replace(/[^0-9]/g, ''),
        userAccounts.savings.accountNumber?.replace(/[^0-9]/g, '')
    ];
    
    if (userAccountNumbers.includes(cleanNumber)) {
        return false;
    }
    
    return true;
}

// Enhanced transfer validation
function enhancedValidateTransferForm() {
    const form = document.getElementById('transferForm');
    const payeeAccount = document.getElementById('payeeAccount').value;
    const amount = parseFloat(document.getElementById('transferAmount').value);
    const fromAccount = document.getElementById('fromAccount').value;
    
    // Reset previous error styling
    form.querySelectorAll('input, select').forEach(input => {
        input.style.borderColor = '#e9ecef';
    });
    
    let isValid = true;
    let errorMessage = '';
    
    // Validate required fields
    const requiredFields = form.querySelectorAll('input[required], select[required]');
    requiredFields.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = '#dc3545';
            isValid = false;
        }
    });
    
    // Validate account number format
    if (payeeAccount && !validateAccountNumber(payeeAccount)) {
        document.getElementById('payeeAccount').style.borderColor = '#dc3545';
        errorMessage = 'Invalid account number format or attempting self-transfer';
        isValid = false;
    }
    
    // Validate amount
    if (amount && amount > userAccounts[fromAccount]?.balance) {
        document.getElementById('transferAmount').style.borderColor = '#dc3545';
        errorMessage = 'Insufficient funds in selected account';
        isValid = false;
    }
    
    if (!isValid && errorMessage) {
        showMessage('transferStatus', errorMessage, 'error');
    }
    
    return isValid;
}

// Add real-time form validation
function setupFormValidation() {
    const transferForm = document.getElementById('transferForm');
    if (!transferForm) return;
    
    transferForm.addEventListener('input', debounce(function() {
        enhancedValidateTransferForm();
    }, 500));
}

// Initialize enhanced features after DOM load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        addSearchField();
        addClearFiltersButton();
        setupFormValidation();
    }, 200);
});

// Performance monitoring
function trackPerformance() {
    if ('performance' in window) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const loadTime = performance.now();
                console.log(`App loaded in ${loadTime.toFixed(2)}ms`);
            }, 0);
        });
    }
}

// Initialize performance tracking
trackPerformance();

// Better error recovery
function recoverFromError() {
    // Clear any stuck loading states
    showLoading(false);
    
    // Reset form states
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.style.borderColor = '#e9ecef';
        });
    });
    
    // Hide any lingering modals
    closePinModal();
    
    // Clear status messages
    document.querySelectorAll('.status-message').forEach(msg => {
        msg.classList.add('hidden');
    });
}

// Auto-recovery on errors
window.addEventListener('error', function(e) {
    console.error('Global error caught:', e.error);
    setTimeout(recoverFromError, 100);
});

// Prevent form resubmission
window.addEventListener('beforeunload', function(e) {
    if (isLoading) {
        e.preventDefault();
        e.returnValue = 'Transfer in progress. Are you sure you want to leave?';
    }
});

// Final initialization check
document.addEventListener('DOMContentLoaded', function() {
    // Ensure app initializes even if there are issues
    setTimeout(() => {
        if (document.getElementById('loginScreen').classList.contains('hidden') && 
            document.getElementById('bankingInterface').classList.contains('hidden')) {
            console.warn('No interface showing, forcing login screen');
            showLoginScreen();
        }
    }, 1000);
});