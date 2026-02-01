import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";

// --- Firebase Config ---
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  databaseURL: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getDatabase();

// --- DOM Elemente ---
const loginScreen = document.getElementById("login-screen");
const homeScreen = document.getElementById("home-screen");
const settingsScreen = document.getElementById("settings-screen");
const healthScreen = document.getElementById("health-screen");
const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const logoutBtn = document.getElementById("logout-btn");
const navButtons = document.querySelectorAll(".nav-btn");

// --- LOGIN ---
loginBtn.addEventListener("click", ()=>{
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  signInWithEmailAndPassword(auth,email,password)
    .then(()=>{ loginScreen.style.display="none"; homeScreen.classList.add("active"); })
    .catch(err=>{ alert(err.message); });
});

// --- REGISTER ---
registerBtn.addEventListener("click", ()=>{
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  createUserWithEmailAndPassword(auth,email,password)
    .then(()=>{ loginScreen.style.display="none"; homeScreen.classList.add("active"); })
    .catch(err=>{ alert(err.message); });
});

// --- LOGOUT ---
logoutBtn.addEventListener("click", ()=>{
  signOut(auth).then(()=>{ location.reload(); });
});

// --- AUTH STATE ---
onAuthStateChanged(auth,(user)=>{
  if(user){ 
    loginScreen.style.display="none"; 
    homeScreen.classList.add("active"); 
  } else { 
    loginScreen.style.display="flex"; 
    document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active")); 
  }
});

// --- NAVIGATION ---
navButtons.forEach(btn=>{
  btn.addEventListener("click", ()=>{
    document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
    document.querySelectorAll(".nav-btn").forEach(b=>b.classList.remove("active"));
    document.getElementById(btn.dataset.target).classList.add("active");
    btn.classList.add("active");
  });
});

// --- Health-Screen: Schmerzeingabe ---
const painDate = document.getElementById('pain-date');
const painTime = document.getElementById('pain-time');

const now = new Date();
painDate.value = now.toISOString().split('T')[0];
painTime.value = now.toTimeString().split(' ')[0].substring(0,5);

const painLevel = document.getElementById('pain-level');
const painLevelValue = document.getElementById('pain-level-value');
painLevel.addEventListener('input', ()=>{ painLevelValue.textContent = painLevel.value; });

const addMedBtn = document.getElementById('add-medication-btn');
const medOther = document.getElementById('medication-other');
const medList = document.querySelector('.medication-list');

addMedBtn.addEventListener('click', ()=>{
  const val = medOther.value.trim();
  if(val){
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = val;
    label.appendChild(checkbox);
    label.append(val);
    medList.appendChild(label);
    medOther.value = '';
  }
});

document.getElementById('save-pain-entry').addEventListener('click', ()=>{
  const painTypeSelect = document.getElementById('pain-type-select');
  const entry = {
    date: painDate.value,
    time: painTime.value,
    level: painLevel.value,
    type: painTypeSelect.value,
    otherType: document.getElementById('pain-type-other').value,
    medications: Array.from(medList.querySelectorAll('input[type="checkbox"]:checked')).map(c=>c.value)
  };
  console.log(entry);
  alert('Eintrag gespeichert (siehe Konsole)');
});
