// Firebase Configuration for Legacy Trust Bank
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getDatabase, ref, set, get, onValue, push, update, remove } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCQVJVCql1uF6DBS9d8-xHkjaaoBXMRSjA",
    authDomain: "legacytrustbank-4c985.firebaseapp.com",
    databaseURL: "https://legacytrustbank-4c985-default-rtdb.firebaseio.com",
    projectId: "legacytrustbank-4c985",
    storageBucket: "legacytrustbank-4c985.firebasestorage.app",
    messagingSenderId: "122544195628",
    appId: "1:122544195628:web:60aa36f1b4b5945244e989",
    measurementId: "G-Y67MBM2W0N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const auth = getAuth(app);

console.log('🔥 Firebase initialized successfully');

// Database helper functions
export const FirebaseDB = {
    // User Management
    async createUser(userData) {
        try {
            const userRef = ref(database, `users/${userData.id}`);
            await set(userRef, {
                profile: {
                    fullName: userData.fullName,
                    email: userData.email,
                    username: userData.username,
                    createdAt: userData.createdAt
                },
                accounts: {
                    current: {
                        balance: userData.currentBalance || 1000.00,
                        accountNumber: userData.accountNumber,
                        type: 'current'
                    },
                    savings: {
                        balance: userData.savingsBalance || 5000.00,
                        accountNumber: (parseInt(userData.accountNumber) + 1).toString(),
                        type: 'savings'
                    }
                },
                transactions: {},
                lastUpdated: Date.now()
            });
            console.log('✅ User created in Firebase:', userData.username);
            return true;
        } catch (error) {
            console.error('❌ Error creating user:', error);
            return false;
        }
    },

    // Get user data
    async getUser(userId) {
        try {
            const userRef = ref(database, `users/${userId}`);
            const snapshot = await get(userRef);
            if (snapshot.exists()) {
                return snapshot.val();
            }
            return null;
        } catch (error) {
            console.error('❌ Error getting user:', error);
            return null;
        }
    },

    // Listen to user data changes (real-time)
    listenToUser(userId, callback) {
        const userRef = ref(database, `users/${userId}`);
        return onValue(userRef, (snapshot) => {
            if (snapshot.exists()) {
                callback(snapshot.val());
            }
        });
    },

    // Update account balance
    async updateBalance(userId, accountType, newBalance) {
        try {
            const balanceRef = ref(database, `users/${userId}/accounts/${accountType}/balance`);
            await set(balanceRef, newBalance);
            
            // Update last modified timestamp
            const timestampRef = ref(database, `users/${userId}/lastUpdated`);
            await set(timestampRef, Date.now());
            
            console.log(`✅ ${accountType} balance updated to:`, newBalance);
            return true;
        } catch (error) {
            console.error('❌ Error updating balance:', error);
            return false;
        }
    },

    // Add transaction
    async addTransaction(userId, transaction) {
        try {
            const transactionRef = ref(database, `users/${userId}/transactions`);
            const newTransactionRef = push(transactionRef);
            
            const transactionData = {
                ...transaction,
                id: newTransactionRef.key,
                timestamp: Date.now(),
                date: new Date().toISOString()
            };
            
            await set(newTransactionRef, transactionData);
            
            // Update last modified timestamp
            const timestampRef = ref(database, `users/${userId}/lastUpdated`);
            await set(timestampRef, Date.now());
            
            console.log('✅ Transaction added:', transactionData);
            return transactionData;
        } catch (error) {
            console.error('❌ Error adding transaction:', error);
            return null;
        }
    },

    // Listen to transactions (real-time)
    listenToTransactions(userId, callback) {
        const transactionsRef = ref(database, `users/${userId}/transactions`);
        return onValue(transactionsRef, (snapshot) => {
            const transactions = [];
            if (snapshot.exists()) {
                const data = snapshot.val();
                Object.keys(data).forEach(key => {
                    transactions.push({ id: key, ...data[key] });
                });
                // Sort by timestamp (newest first)
                transactions.sort((a, b) => b.timestamp - a.timestamp);
            }
            callback(transactions);
        });
    },

    // Transfer money between accounts
    async transferMoney(fromUserId, toUserId, amount, fromAccount, reference) {
        try {
            // Get current balances
            const fromUserData = await this.getUser(fromUserId);
            const currentBalance = fromUserData.accounts[fromAccount].balance;
            
            if (currentBalance < amount) {
                throw new Error('Insufficient funds');
            }

            // Update sender's balance
            const newBalance = currentBalance - amount;
            await this.updateBalance(fromUserId, fromAccount, newBalance);

            // Add transaction for sender
            await this.addTransaction(fromUserId, {
                type: 'transfer_out',
                amount: -amount,
                account: fromAccount,
                toUser: toUserId,
                reference: reference,
                status: 'completed'
            });

            // If transferring to another user (not just between own accounts)
            if (toUserId !== fromUserId) {
                // Update receiver's balance (assuming current account)
                const toUserData = await this.getUser(toUserId);
                if (toUserData) {
                    const toBalance = toUserData.accounts.current.balance + amount;
                    await this.updateBalance(toUserId, 'current', toBalance);

                    // Add transaction for receiver
                    await this.addTransaction(toUserId, {
                        type: 'transfer_in',
                        amount: amount,
                        account: 'current',
                        fromUser: fromUserId,
                        reference: reference,
                        status: 'completed'
                    });
                }
            }

            console.log('✅ Transfer completed successfully');
            return true;
        } catch (error) {
            console.error('❌ Transfer failed:', error);
            throw error;
        }
    },

    // Find user by username
    async findUserByUsername(username) {
        try {
            const usersRef = ref(database, 'users');
            const snapshot = await get(usersRef);
            
            if (snapshot.exists()) {
                const users = snapshot.val();
                for (const userId in users) {
                    if (users[userId].profile && users[userId].profile.username === username) {
                        return { id: userId, ...users[userId] };
                    }
                }
            }
            return null;
        } catch (error) {
            console.error('❌ Error finding user:', error);
            return null;
        }
    },

    // Check if username exists
    async usernameExists(username) {
        const user = await this.findUserByUsername(username);
        return user !== null;
    },

    // Check if email exists
    async emailExists(email) {
        try {
            const usersRef = ref(database, 'users');
            const snapshot = await get(usersRef);
            
            if (snapshot.exists()) {
                const users = snapshot.val();
                for (const userId in users) {
                    if (users[userId].profile && users[userId].profile.email === email) {
                        return true;
                    }
                }
            }
            return false;
        } catch (error) {
            console.error('❌ Error checking email:', error);
            return false;
        }
    }
};

// Authentication helper functions
export const FirebaseAuth = {
    // Create account with email/password
    async createAccount(email, password, userData) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Create user profile in database
            await FirebaseDB.createUser({
                ...userData,
                id: user.uid
            });
            
            console.log('✅ Account created successfully:', user.uid);
            return { success: true, user: user };
        } catch (error) {
            console.error('❌ Account creation failed:', error);
            return { success: false, error: error.message };
        }
    },

    // Sign in with email/password
    async signIn(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            console.log('✅ Sign in successful:', user.uid);
            return { success: true, user: user };
        } catch (error) {
            console.error('❌ Sign in failed:', error);
            return { success: false, error: error.message };
        }
    },

    // Sign out
    async signOut() {
        try {
            await signOut(auth);
            console.log('✅ Sign out successful');
            return true;
        } catch (error) {
            console.error('❌ Sign out failed:', error);
            return false;
        }
    },

    // Listen to auth state changes
    onAuthStateChanged(callback) {
        return onAuthStateChanged(auth, callback);
    }
};

// Export for global access
window.FirebaseDB = FirebaseDB;
window.FirebaseAuth = FirebaseAuth;