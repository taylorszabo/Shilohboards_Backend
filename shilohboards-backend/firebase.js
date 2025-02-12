// firebase.init.js
const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');
const { getStorage } = require('firebase/storage'); // If you will be working with storage, add this
require('dotenv').config(); //Import the dotenv library to access the .env file

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY, // These values will come from .env file.  See instruction below
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app) // If you are using storage
module.exports = { db, storage }; // Export db for use in your app

