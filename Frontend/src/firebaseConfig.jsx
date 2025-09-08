// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// ✅ Your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyCNmNdqte7Y_DZWLDqWTCgvtsF97PkaqUk",
  authDomain: "flame-shield.firebaseapp.com",
  databaseURL: "https://flame-shield-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "flame-shield",
  storageBucket: "flame-shield.appspot.com",
  messagingSenderId: "220699252135",
  appId: "1:220699252135:web:851f6d0f4d5a7e25f15282",
  measurementId: "G-10VG0MCSYE",
};

// ✅ Initialize Firebase app once
const app = initializeApp(firebaseConfig);

// ✅ Initialize Realtime Database
export const db = getDatabase(app);

// Optional: Export app if needed elsewhere (e.g., authentication)
export default app;