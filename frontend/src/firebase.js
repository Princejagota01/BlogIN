// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
 
// Your web app's Firebase configuration
// console.log("HI FIREBASE.js")
// console.log(import.meta.env.VITE_FIREBASE_API_KEY);
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ,
  authDomain: "blogin-01.firebaseapp.com",
  projectId: "blogin-01",
  storageBucket: "blogin-01.firebasestorage.app",
  messagingSenderId: "316856231504",
  appId: "1:316856231504:web:a8aca1194e0b90d7ea5355"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);