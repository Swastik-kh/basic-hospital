import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDzfs2RQqW41JUlkAJYkCCXQJO7QLsgxBI",
  authDomain: "basic-municipal-hospital.firebaseapp.com",
  projectId: "basic-municipal-hospital",
  storageBucket: "basic-municipal-hospital.firebasestorage.app",
  messagingSenderId: "115361567406",
  appId: "1:115361567406:web:8d63df421c1e4896e8133f",
  measurementId: "G-5SPPTG8X9K"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
