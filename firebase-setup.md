# Firebase Realtime Database Setup Guide

## 🔥 Why Firebase?
- ✅ **Always Free Tier** - 1GB storage, 10GB/month transfer
- ✅ **Real-time Sync** - Changes appear instantly across all devices
- ✅ **Never Pauses** - Google's infrastructure, 99.95% uptime
- ✅ **Offline Support** - Works without internet, syncs when back online
- ✅ **Built-in Authentication** - Secure user management

## 📋 Setup Steps

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Name: "Legacy Trust Bank"
4. Enable Google Analytics (optional)

### 2. Setup Realtime Database
1. In Firebase Console → "Realtime Database"
2. Click "Create Database"
3. Choose location (closest to your users)
4. Start in **test mode** (we'll secure it later)

### 3. Get Configuration
1. Project Settings → General → Your apps
2. Click "Web" icon (</>) 
3. Register app: "Legacy Trust Bank Web"
4. Copy the config object

### 4. Add to Your Project
Create `firebase-config.js`:
```javascript
// Firebase configuration
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com/",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

// Initialize Firebase
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const auth = getAuth(app);
```

### 5. Database Structure
```json
{
  "users": {
    "user123": {
      "profile": {
        "fullName": "John Doe",
        "email": "john@example.com",
        "username": "johndoe"
      },
      "accounts": {
        "current": {
          "balance": 1500.00,
          "accountNumber": "62012345678"
        },
        "savings": {
          "balance": 5000.00,
          "accountNumber": "62012345679"
        }
      },
      "transactions": {
        "trans1": {
          "type": "transfer",
          "amount": -100.00,
          "to": "user456",
          "timestamp": 1640995200000,
          "description": "Payment to Alice"
        }
      }
    }
  }
}
```

### 6. Real-time Sync Functions
```javascript
import { ref, set, onValue, push } from 'firebase/database';
import { database } from './firebase-config.js';

// Save user data
export function saveUserData(userId, data) {
  return set(ref(database, `users/${userId}`), data);
}

// Listen for balance changes
export function listenToBalance(userId, callback) {
  const balanceRef = ref(database, `users/${userId}/accounts`);
  return onValue(balanceRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
}

// Add transaction
export function addTransaction(userId, transaction) {
  const transRef = ref(database, `users/${userId}/transactions`);
  return push(transRef, {
    ...transaction,
    timestamp: Date.now()
  });
}
```

## 🔒 Security Rules
In Firebase Console → Realtime Database → Rules:
```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

## 🚀 Integration Benefits
- **Web ↔ Desktop Sync** - Changes appear instantly
- **Offline Support** - Works without internet
- **Conflict Resolution** - Automatic merge of changes
- **Real-time Updates** - See transactions as they happen
- **Secure** - User can only access their own data

## 💰 Cost (Always Free)
- **Storage**: 1GB (enough for 100,000+ users)
- **Bandwidth**: 10GB/month (millions of transactions)
- **Connections**: 100 simultaneous users
- **Operations**: Unlimited reads/writes

Perfect for your banking app! 🏦