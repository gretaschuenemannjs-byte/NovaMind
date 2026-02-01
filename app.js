import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

// Firebase-Konfiguration (wie zuvor)
const firebaseConfig = {
  apiKey: "AIzaSyA8TpIvsBtQQbH4qGpmNoOiDTpokQBR0NY",
  authDomain: "novamind-gs.firebaseapp.com",
  databaseURL: "https://novamind-gs-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "novamind-gs",
  storageBucket: "novamind-gs.firebasestorage.app",
  messagingSenderId: "278309634253",
  appId: "1:278309634253:web:2c0cb4a88e0e2293192984"
};

// Firebase Init
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Elemente
const loginScreen = document.getElementById("login-screen");
const homeScreen = document.getElementById("home-screen");
const healthScreen = document.getElementById("health-screen");
const profileScreen = document.getElementById("profile-screen");
const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const logoutBtn = document.getElementById("logout-btn");
const navButtons = document.querySelectorAll(".nav-btn");

// Health Elemente
const healthDate = document.getElementById("health-date");
const healthTime = document.getElementById("health-time");
const painLevel = document.getElementById("pain-level");
const painValue = document.getElementById("pain-value");
const painType = document.getElementById("pain-type");
const painOther = document.getElementById("pain-other");
const meds = document.getElementById("meds");
const medOther = document.getElementById("med-other");
const saveHealth = document.getElementById("save-health");
const exportHealth = document.getElementById("export-health");
const healthCalendar = document.getElementById("health-calendar");

// Login/Register
loginBtn.addEventListener("click", ()=>{
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  signInWithEmailAndPassword(auth,email,password).catch(err=>alert(err.message));
});

registerBtn.addEventListener("click", ()=>{
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  createUserWithEmailAndPassword(auth,email,password).catch(err=>alert(err.message));
});

// Logout
logoutBtn.addEventListener("click", ()=> signOut(auth));

// Auth State
onAuthStateChanged(auth,user=>{
  if(user){
    loginScreen.style.display="none";
    document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
    homeScreen.classList.add("active");
    document.querySelector(".bottom-nav").style.display="flex";
  } else {
    loginScreen.style.display="flex";
    document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
    document.querySelector(".bottom-nav").style.display="none";
  }
});

// Navigation
navButtons.forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
    const target = document.getElementById(btn.dataset.target);
    if(target) target.classList.add("active");
    navButtons.forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// Health-Screen Logik
const healthEntries = JSON.parse(localStorage.getItem("healthEntries"))||[];

function renderHealthCalendar(){
  healthCalendar.innerHTML="";
  healthEntries.forEach((e,i)=>{
    const div=document.createElement("div");
    div.classList.add("home-card");
    div.innerHTML=`<strong>${e.date} ${e.time}</strong><br>Typ: ${e.pain}<br>Stärke: ${e.level}<br>Medikamente: ${e.meds.join(", ")}<br><button data-index="${i}" class="delete-health">Löschen</button>`;
    healthCalendar.appendChild(div);
  });
  document.querySelectorAll(".delete-health").forEach(btn=>{
    btn.addEventListener("click",(ev)=>{
      const idx = ev.target.dataset.index;
      healthEntries.splice(idx,1);
      localStorage.setItem("healthEntries",JSON.stringify(healthEntries));
      renderHealthCalendar();
    });
  });
}

// Slider Update
painLevel.addEventListener("input",()=>{ painValue.textContent=painLevel.value; });

// Speichern
saveHealth.addEventListener("click",()=>{
  const entry={
    date: healthDate.value,
    time: healthTime.value,
    pain: painType.value==="Sonstige"?painOther.value:painType.value,
    level: painLevel.value,
    meds: Array.from(meds.selectedOptions).map(o=>o.value).concat(medOther.value?medOther.value:[])
  };
  healthEntries.push(entry);
  localStorage.setItem("healthEntries",JSON.stringify(healthEntries));
  renderHealthCalendar();
});

// PDF Export
exportHealth.addEventListener("click",()=>{
  const doc = new jsPDF();
  healthEntries.forEach((e,i)=>{
    doc.text(`${e.date} ${e.time} | Typ: ${e.pain} | Stärke: ${e.level} | Meds: ${e.meds.join(", ")}`,10,10+i*10);
  });
  doc.save("health-export.pdf");
});

// Init Health-Date & Time
const now = new Date();
healthDate.value = now.toISOString().split("T")[0];
healthTime.value = now.toTimeString().split(" ")[0].substring(0,5);
renderHealthCalendar();

