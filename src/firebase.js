import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAfANsEkhX21h5wsSaHoEzTX3UUOFhg0gY",
    authDomain: "myproject-12463.firebaseapp.com",
    projectId: "myproject-12463",
    storageBucket: "myproject-12463.firebasestorage.app",
    messagingSenderId: "625131100557",
    appId: "1:625131100557:web:6049d671b98b62425785c4",
    measurementId: "G-6QJB5281BR"
  };

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);