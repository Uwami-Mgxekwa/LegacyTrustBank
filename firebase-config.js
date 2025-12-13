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
                    username: userD