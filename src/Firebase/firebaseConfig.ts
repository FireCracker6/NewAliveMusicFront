import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAEWQ1iRFCOqWgdqIltcUe3Arg2RXPFaY8",
  authDomain: "alive24-266c5.firebaseapp.com",
  projectId: "alive24-266c5",
  storageBucket: "alive24-266c5.appspot.com",
  messagingSenderId: "570075225058",
  appId: "1:570075225058:web:a6c97319a102fb921737bb",
  measurementId: "G-XXN8FR84JL"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const realtimeDb = getDatabase(app);

export { app, analytics, db, realtimeDb };