import { initializeApp  } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { GoogleAuthProvider, getAuth, signOut, signInWithPopup  } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, addDoc, collection } 
  from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "firebase_api_key",
  authDomain: "magnetism-simulation.firebaseapp.com",
  projectId: "magnetism-simulation",
  storageBucket: "magnetism-simulation.appspot.com",
  messagingSenderId: "424173550885",
  appId: "1:424173550885:web:94a3ef1e0297639f186ecc",
  measurementId: "G-FQ2RVRG2GY"
};

if (location.hostname === "localhost" || location.hostname === "127.0.0.1")
{
  const response = await fetch("/api_key.txt");
  const text = await response.text();
  firebaseConfig.apiKey = text;
}

const app = initializeApp(firebaseConfig);

const GoogleProvider = new GoogleAuthProvider();

const auth = getAuth();
const db = getFirestore(app)
auth.useDeviceLanguage();

function signInFailed(error)
{
  // Handle Errors here.
  const errorCode = error.code;
  const errorMessage = error.message;
  // The email of the user's account used.
  const email = error.customData.email;
  // The AuthCredential type that was used.
  const credential = GoogleAuthProvider.credentialFromError(error);
  console.log(error)
}

async function signIn()
{
  const sign_in_result = await (signInWithPopup(auth, GoogleProvider).catch(signInFailed))
  return sign_in_result.user;
}

export { app, auth, signIn, db, doc, setDoc, getDoc, addDoc, collection }