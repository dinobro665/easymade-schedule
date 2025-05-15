import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC2bd38MehZcqKO1nbSGOcinmOA7mqkSp0",
  authDomain: "easymade-schedule.firebaseapp.com",
  projectId: "easymade-schedule",
  storageBucket: "easymade-schedule.firebasestorage.app",
  messagingSenderId: "572292635556",
  appId: "1:572292635556:web:eca8586f1323df2c2fbf31",
  measurementId: "G-MYH04PGJYJ"
};

const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
