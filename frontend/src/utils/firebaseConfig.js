import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyCpDUf5X2FaXRfnQP9PdqASNfEeawtL2YU",
    authDomain: "frameforge-app.firebaseapp.com",
    projectId: "frameforge-app",
    storageBucket: "frameforge-app.firebasestorage.app",
    messagingSenderId: "824448340937",
    appId: "1:824448340937:web:edda1404d6d4ddb5b14e18",
    measurementId: "G-DY5KLHEGNH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
