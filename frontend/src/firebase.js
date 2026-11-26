// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "zyroai-afaec.firebaseapp.com",
  projectId: "zyroai-afaec",
  storageBucket: "zyroai-afaec.firebasestorage.app",
  messagingSenderId: "329023013957",
  appId: "1:329023013957:web:db5ec23e0962a7f8910f2c",
  measurementId: "G-3TQDEVJQ5D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();

