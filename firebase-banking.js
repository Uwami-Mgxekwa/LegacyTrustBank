// Firebase-enabled Banking Functions
// This file extends banking-app.js with real-time Firebase functionality

let firebaseUser = null;
let unsubscribeUser = null;
let unsubscribeTransactions = null;

// Initialize Firebase banking features
function initializeFirebaseBanking() {
    console.log('🔥 Initializing Firebase banking features...');
    
    // Get current user from session
    const savedUser = localStorage.getItem('ltb_user') || sessionStorage.getItem('ltb_user');
    if (savedUser) {
        try {
            const userData = JSON.parse(savedUser);
            console.log('🔥 Found user data:', userData);
            
            // Only setup Firebase listeners for Firebase users
            if (userData.id && userData.accountType === 'firebase') {
                console.log('🔥 Firebase user detected, setting up listeners');
                setupFirebaseListeners(userData.id);
            } else if (userData.accountType === 'demo') {
                console.log('🔥 Demo user detected, initializing demo data');
                // Initialize demo data
                setTimeout(initializeDemoData, 100); // Small delay to ensure DOM is ready
            } else {
                console.log('🔥 Unknown user type, initializing demo data as fallback');
                setTimeout(initializeDemoData, 100);
            }
        } catch (error) {
            console.error('❌ Error parsing saved user:', error);
            // Fallback to demo data
            setTimeout(initializeDemoData, 100);
        }
    } else {
        console.log('🔥 No saved user found');
    }
}

// Initialize demo data for demo users
function initializeDemoData() {
    console.log('🔥 Initializing demo data...');
    
    // Set demo balances
    const currentBalanceElement = document.getElementById('currentBalance');
    const savingsBalanceElement = document.getElementById('savingsBalance');
    
    if (currentBalanceElement) currentBalanceElement.textContent = '4780.00';
    if (savingsBalanceElement) savingsBalanceElement.textContent = '73500.00';
    
    // Set demo summary cards
    const monthlyIncomeElement = document.getElementById('monthlyIncome');
    const monthlyExpensesElement = document.getElementById('monthlyExpenses');
    const netChangeElement = document.getElementById('netChange');
    
    if (monthlyIncomeElement) monthlyIncomeElement.textContent = '+ R 8500.00';
    if (monthlyExpensesElement) monthlyExpensesElement.textContent = '- R 3200.00';
    if (netChangeElement) {
        netChangeElement.textContent = '+ R 5300.00';
        netChangeElement.style.color = '#28a745';
    }
    
    // Add demo transactions
    const demoTransactions = [
        {
            id: 'demo1',
            type: 'transfer_in',
            amount: 2500.00,
            reference: 'Salary Payment',
            timestamp: Date.now() - 86400000, // 1 day ago
            status: 'completed'
        },
        {
            id: 'demo2',
            type: 'transfer_out',
            amount: -150.00,
            reference: 'Grocery Shopping',
            timestamp: Date.now() - 172800000, // 2 days ago
            status: 'completed'
        },
        {
            id: 'demo3',
            type: 'transfer_out',
            amount: -75.00,
            reference: 'Coffee Shop',
            timestamp: Date.now() - 259200000, // 3 days ago
            status: 'completed'
        },
        {
            id: 'demo4',
            type: 'transfer_in',
            amount: 500.00,
            reference: 'Freelance Payment',
            timestamp: Date.now() - 345600000, // 4 days ago
            status: 'completed'
        }
    ];
    
    updateTransactionsUI(demoTransactions);
}

// Setup real-time listeners for user data
function setupFirebaseListeners(userId) {
    console.log('🔥 Setting up Firebase listeners for user:', userId);
    
    // Listen to user data changes (balances, profile, etc.)
    unsubscribeUser = window.FirebaseDB.listenToUser(userId, (userData) => {
        console.log('🔥 User data updated:', userData);
        updateUIWithFirebaseData(userData);
    });
    
    // Listen to transaction changes
    unsubscribeTransactions = window.FirebaseDB.listenToTransactions(userId, (transactions) => {
        console.log('🔥 Transactions updated:', transactions);
        updateTransactionsUI(transactions);
    });
}

// Update UI with Firebase data
function updateUIWithFirebaseData(userData) {
    if (!userData || !userData.accounts) return;
    
    // Update account balances
    const currentBalanceElement = document.getElementById('currentBalance');
    const savingsBalanceElement = document.getElementById('savingsBalance');
    
    if (currentBalanceElement && userData.accounts.current) {
        currentBalanceElement.textContent = userData.accounts.current.balance.toFixed(2);
    }
    
    if (savingsBalanceElement && userData.accounts.savings) {
        savingsBalanceElement.textContent = userData.accounts.savings.balance.toFixed(2);
    }
    
    // Update summary cards if they exist
    updateFirebaseSummaryCards(userData);
    
    console.log('✅ UI updated with Firebase data');
}

// Update transactions UI
function updateTransactionsUI(transactions) {
    const recentTransactionsList = document.getElementById('recentTransactionsList');
    const allTransactionsList = document.getElementById('allTransactionsList');
    
    if (!transactions || transactions.length === 0) {
        if (recentTransactionsList) {
            recentTransactionsList.innerHTML = '<div class="no-data">No transactions yet</div>';
        }
        if (allTransactionsList) {
            allTransactionsList.innerHTML = '<div class="no-data">No transactions yet</div>';
        }
        return;
    }
    
    // Generate transaction HTML
    const transactionHTML = transactions.map(transaction => {
        const isPositive = transaction.amount > 0;
        const icon = isPositive ? '↗️' : '↙️';
        const amountClass = isPositive ? 'received' : 'sent';
        const date = new Date(transaction.timestamp).toLocaleDateString();
        const time = new Date(transaction.timestamp).toLocaleTimeString();
        
        return `
            <div class="transaction-item">
                <div style="display: flex; align-items: center; flex: 1;">
                    <div class="transaction-icon ${amountClass}">
                        ${icon}
                    </div>
                    <div class="transaction-details">
                        <div class="transaction-account">
                            ${transaction.reference || transaction.type || 'Transaction'}
                        </div>
                        <div class="transaction-date">${date} at ${time}</div>
                    </div>
                </div>
                <div class="transaction-amount ${amountClass}">
                    ${isPositive ? '+' : ''}R ${Math.abs(transaction.amount).toFixed(2)}
                </div>
            </div>
        `;
    }).join('');
    
    // Update recent transactions (last 5)
    if (recentTransactionsList) {
        const recentHTML = transactions.slice(0, 5).map(transaction => {
            const isPositive = transaction.amount > 0;
            const icon = isPositive ? '↗️' : '↙️';
            const amountClass = isPositive ? 'received' : 'sent';
            const date = new Date(transaction.timestamp).toLocaleDateString();
            
            return `
                <div class="transaction-item">
                    <div style="display: flex; align-items: center; flex: 1;">
                        <div class="transaction-icon ${amountClass}">
                            ${icon}
                        </div>
                        <div class="transaction-details">
                            <div class="transaction-account">
                                ${transaction.reference || transaction.type || 'Transaction'}
                            </div>
                            <div class="transaction-date">${date}</div>
                        </div>
                    </div>
                    <div class="transaction-amount ${amountClass}">
                        ${isPositive ? '+' : ''}R ${Math.abs(transaction.amount).toFixed(2)}
                    </div>
                </div>
            `;
        }).join('');
        
        recentTransactionsList.innerHTML = recentHTML || '<div class="no-data">No recent transactions</div>';
    }
    
    // Update all transactions
    if (allTransactionsList) {
        allTransactionsList.innerHTML = transactionHTML;
    }
    
    console.log('✅ Transactions UI updated');
}

// Update summary cards with calculated data
function updateFirebaseSummaryCards(userData) {
    console.log('🔥 Updating summary cards with data:', userData);
    
    // Set default values first
    const monthlyIncomeElement = document.getElementById('monthlyIncome');
    const monthlyExpensesElement = document.getElementById('monthlyExpenses');
    const netChangeElement = document.getElementById('netChange');
    
    if (!userData || !userData.transactions || Object.keys(userData.transactions).length === 0) {
        console.log('🔥 No transactions found, setting default values');
        if (monthlyIncomeElement) monthlyIncomeElement.textContent = '+ R 0.00';
        if (monthlyExpensesElement) monthlyExpensesElement.textContent = '- R 0.00';
        if (netChangeElement) {
            netChangeElement.textContent = 'R 0.00';
            netChangeElement.style.color = '#28a745';
        }
        return;
    }
    
    try {
        const transactions = Object.values(userData.transactions);
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        // Calculate monthly income and expenses
        let monthlyIncome = 0;
        let monthlyExpenses = 0;
        
        transactions.forEach(transaction => {
            if (transaction && transaction.timestamp && transaction.amount !== undefined) {
                const transactionDate = new Date(transaction.timestamp);
                if (transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear) {
                    if (transaction.amount > 0) {
                        monthlyIncome += transaction.amount;
                    } else {
                        monthlyExpenses += Math.abs(transaction.amount);
                    }
                }
            }
        });
        
        const netChange = monthlyIncome - monthlyExpenses;
        
        // Update UI elements
        if (monthlyIncomeElement) {
            monthlyIncomeElement.textContent = `+ R ${monthlyIncome.toFixed(2)}`;
        }
        
        if (monthlyExpensesElement) {
            monthlyExpensesElement.textContent = `- R ${monthlyExpenses.toFixed(2)}`;
        }
        
        if (netChangeElement) {
            netChangeElement.textContent = `${netChange >= 0 ? '+' : ''}R ${netChange.toFixed(2)}`;
            netChangeElement.style.color = netChange >= 0 ? '#28a745' : '#dc3545';
        }
        
        console.log('✅ Summary cards updated successfully');
    } catch (error) {
        console.error('❌ Error updating summary cards:', error);
        // Fallback to default values
        if (monthlyIncomeElement) monthlyIncomeElement.textContent = '+ R 0.00';
        if (monthlyExpensesElement) monthlyExpensesElement.textContent = '- R 0.00';
        if (netChangeElement) {
            netChangeElement.textContent = 'R 0.00';
            netChangeElement.style.color = '#28a745';
        }
    }
}

// Firebase-enabled transfer function
async function firebaseTransferMoney(fromAccount, toAccount, amount, reference) {
    const savedUser = localStorage.getItem('ltb_user') || sessionStorage.getItem('ltb_user');
    if (!savedUser) {
        throw new Error('No user session found');
    }
    
    const userData = JSON.parse(savedUser);
    const userId = userData.id;
    
    try {
        // For now, handle internal transfers (between own accounts)
        if (fromAccount !== toAccount) {
            // Get current user data
            const currentUserData = await window.FirebaseDB.getUser(userId);
            const fromBalance = currentUserData.accounts[fromAccount].balance;
            const toBalance = currentUserData.accounts[toAccount].balance;
            
            if (fromBalance < amount) {
                throw new Error('Insufficient funds');
            }
            
            // Update balances
            await window.FirebaseDB.updateBalance(userId, fromAccount, fromBalance - amount);
            await window.FirebaseDB.updateBalance(userId, toAccount, toBalance + amount);
            
            // Add transactions
            await window.FirebaseDB.addTransaction(userId, {
                type: 'transfer_out',
                amount: -amount,
                account: fromAccount,
                toAccount: toAccount,
                reference: reference,
                status: 'completed'
            });
            
            await window.FirebaseDB.addTransaction(userId, {
                type: 'transfer_in',
                amount: amount,
                account: toAccount,
                fromAccount: fromAccount,
                reference: reference,
                status: 'completed'
            });
        } else {
            // External transfer (to another user by account number)
            await window.FirebaseDB.transferMoney(userId, toAccount, amount, fromAccount, reference);
        }
        
        return true;
    } catch (error) {
        console.error('Firebase transfer error:', error);
        throw error;
    }
}

// Cleanup Firebase listeners
function cleanupFirebaseListeners() {
    if (unsubscribeUser) {
        unsubscribeUser();
        unsubscribeUser = null;
    }
    
    if (unsubscribeTransactions) {
        unsubscribeTransactions();
        unsubscribeTransactions = null;
    }
    
    console.log('🔥 Firebase listeners cleaned up');
}

// Override the original transfer function
if (typeof handleTransfer === 'function') {
    const originalHandleTransfer = handleTransfer;
    
    window.handleTransfer = async function(e) {
        e.preventDefault();
        
        const fromAccount = document.getElementById('fromAccount').value;
        const payeeAccount = document.getElementById('payeeAccount').value;
        const payeeName = document.getElementById('payeeName').value;
        const amount = parseFloat(document.getElementById('transferAmount').value);
        const reference = document.getElementById('transferMessage').value || `Transfer to ${payeeName}`;
        
        if (!fromAccount || !payeeAccount || !payeeName || !amount || amount <= 0) {
            showTransferStatus('Please fill in all required fields', 'error');
            return;
        }
        
        try {
            showTransferStatus('Processing transfer...', 'info');
            
            // Use Firebase transfer function
            await firebaseTransferMoney(fromAccount, payeeAccount, amount, reference);
            
            showTransferStatus('Transfer completed successfully!', 'success');
            
            // Clear form
            document.getElementById('transferForm').reset();
            
        } catch (error) {
            console.error('Transfer failed:', error);
            showTransferStatus(error.message || 'Transfer failed. Please try again.', 'error');
        }
    };
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initializeFirebaseBanking, 100); // Small delay to ensure Firebase is ready
    });
} else {
    setTimeout(initializeFirebaseBanking, 100);
}

// Cleanup on page unload
window.addEventListener('beforeunload', cleanupFirebaseListeners);

console.log('🔥 Firebase banking module loaded');

// Export functions for global access
window.firebaseTransferMoney = firebaseTransferMoney;
window.setupFirebaseListeners = setupFirebaseListeners;
window.cleanupFirebaseListeners = cleanupFirebaseListeners;