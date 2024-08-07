import { initializeApp  } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js'

const firebaseConfig = {
    apiKey: "firebase_api_key",
    authDomain: "magnetism-simulation.firebaseapp.com",
    projectId: "magnetism-simulation",
    storageBucket: "magnetism-simulation.appspot.com",
    messagingSenderId: "424173550885",
    appId: "1:424173550885:web:94a3ef1e0297639f186ecc",
    measurementId: "G-FQ2RVRG2GY"
  };
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);