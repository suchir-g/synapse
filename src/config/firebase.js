// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import { getAuth, GoogleAuthProvider } from "firebase/auth"

import { getFirestore } from "firebase/firestore"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBchrnYuBXmEItI8Z8jOWj3KUgqHj_e6Vk",
  authDomain: "synapse-64a95.firebaseapp.com",
  projectId: "synapse-64a95",
  storageBucket: "synapse-64a95.appspot.com",
  messagingSenderId: "636406565683",
  appId: "1:636406565683:web:b14e70ac3892ccf2874c46",
  measurementId: "G-QT3KST3SRT",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app)
export const googleAuthProvider = new GoogleAuthProvider();

export const db = getFirestore(app)