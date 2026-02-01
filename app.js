import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyA8TpIvsBtQQbH4qGpmNoOiDTpokQBR0NY",
  authDomain: "novamind-gs.firebaseapp.com",
  databaseURL: "https://novamind-gs-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "novamind-gs",
  storageBucket: "novamind-gs.firebasestorage.app",
  messagingSenderId: "278309634253",
  appId: "1:278309634253:web:2c0cb4a88e0e2293192984"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getDatabase();

const loginScreen = document.getElementById("login-screen");
const homeScreen = document.getElementById("home-screen");
const settingsScreen = document.getElementById("settings-screen");
const healthScreen = document.getElementById("health-screen");
const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const logoutBtn = document.getElementById("logout-btn");
const navButtons = document.querySelectorAll(".nav-btn");

loginBtn.addEventListener("click", () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      loginScreen.style.display = "none";
      homeScreen.classList.add("active");
    })
    .catch(err => { alert(err.message); });
});

registerBtn.addEventListener("click", () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      loginScreen.style.display = "none";
      homeScreen.classList.add("active");
    })
    .catch(err => { alert(err.message); });
});

logoutBtn && logoutBtn.addEventListener("click", () => {
  signOut(auth).then(() => { location.reload(); });
});

onAuthStateChanged(auth, (user) => {
  if(user) {
    loginScreen.style.display = "none";
    homeScreen.classList.add("active");
  } else {
    loginScreen.style.display = "flex";
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  }
});

// NAVIGATION
navButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    document.getElementById(btn.dataset.target).classList.add("active");
    btn.classList.add("active");
  });
});
