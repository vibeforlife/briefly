// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA4TGgwwP5tLtoArVmUnzGtHg5cEuim8z0",
  authDomain: "briefly4u.firebaseapp.com",
  projectId: "briefly4u",
  storageBucket: "briefly4u.firebasestorage.app",
  messagingSenderId: "522457293490",
  appId: "1:522457293490:web:c1a14c4046cf8b1f099fab",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
