// src/firebaseConfig.js

// Import Firebase core
import { initializeApp } from "firebase/app";
// Import Realtime Database
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCNmNdqte7Y_DZWLDqWTCgvtsF97PkaqUk",
  authDomain: "flame-shield.firebaseapp.com",
  databaseURL:
    "https://flame-shield-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "flame-shield",
  storageBucket: "flame-shield.appspot.com",
  messagingSenderId: "220699252135",
  appId: "1:220699252135:web:851f6d0f4d5a7e25f15282",
  measurementId: "G-10VG0MCSYE",
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Get Realtime Database reference
export const db = getDatabase(app);
