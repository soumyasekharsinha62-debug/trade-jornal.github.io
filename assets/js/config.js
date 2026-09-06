import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAs3DLGHarVRXbl-WrBZS2XkO8TiAQY3e4",
  authDomain: "ashutosh-35bc7.firebaseapp.com",
  databaseURL: "https://ashutosh-35bc7-default-rtdb.firebaseio.com",
  projectId: "ashutosh-35bc7",
  storageBucket: "ashutosh-35bc7.firebasestorage.app",
  messagingSenderId: "556551238804",
  appId: "1:556551238804:web:7ae7fb6206fb0e3d6cb081",
  measurementId: "G-K1G05FVDYQ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

setPersistence(auth, browserLocalPersistence);

export { auth, db };
