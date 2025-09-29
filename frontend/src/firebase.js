// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCuMNFzKyGY4Is11c4eJhFQ6VPZLN-AXYw",
  authDomain: "srm-virtual-lab-gnu.firebaseapp.com",
  projectId: "srm-virtual-lab-gnu",
  storageBucket: "srm-virtual-lab-gnu.firebasestorage.app",
  messagingSenderId: "211161993480",
  appId: "1:211161993480:web:27d173458e82fb53bc1cbd",
  measurementId: "G-QRDH4NWGT0",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
