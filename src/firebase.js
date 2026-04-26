import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBFFdCevJhnPPTf4uCGS4yWZ6t5VJZJFz4",
  authDomain: "project-1-b124d.firebaseapp.com",
  projectId: "project-1-b124d",
  storageBucket: "project-1-b124d.appspot.com",
  messagingSenderId: "137574142452",
  appId: "1:137574142452:web:bf9b29f62777875fd9a9a1"
};

const app = initializeApp(firebaseConfig);

// ✅ THIS LINE WAS MISSING
export const auth = getAuth(app);