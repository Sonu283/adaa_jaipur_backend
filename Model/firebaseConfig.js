const { initializeApp } = require('firebase/app');
const { getFirestore, collection } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyDzu0OL-w9C0wblqY1YyY1RsvCHYJjcPP8",
  authDomain: "adaa-jaipur-213ec.firebaseapp.com",
  projectId: "adaa-jaipur-213ec",
  storageBucket: "adaa-jaipur-213ec.firebasestorage.app",
  messagingSenderId: "755020894693",
  appId: "1:755020894693:web:015e042afe20caedeb1f0c",
  measurementId: "G-NSHLPRK78X"
};
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

console.log("Connected to Firestore database successfully.");

module.exports = db;