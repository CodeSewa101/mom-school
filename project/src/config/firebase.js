import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  // Add your Firebase config here
  apiKey: "AIzaSyDlyySCrr1FRylVzdcUhfTQ-EKyy-pgIas",
  authDomain: "school-managementsys.firebaseapp.com",
  projectId: "school-managementsys",
  storageBucket: "school-managementsys.firebasestorage.app",
  messagingSenderId: "617066181611",
  appId: "1:617066181611:web:3cb9e8bd63437bcdbe9fae",
  measurementId: "G-LKBW98KVCQ"

};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;