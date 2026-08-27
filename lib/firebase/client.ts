import { initializeApp, getApps, getApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCsN89OPxPbdifLofgOxy1QWgOT3Lwo06M",
  authDomain: "movies-38191.firebaseapp.com",
  projectId: "movies-38191",
  storageBucket: "movies-38191.firebasestorage.app",
  messagingSenderId: "11855617337",
  appId: "1:11855617337:web:c87da85724e2c79cfb5ce8"
};

// Initialize Firebase only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export { app };
