import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

// Firebase-Konfiguration
const firebaseConfig = {
  apiKey: "AIzaSyA8TpIvsBtQQbH4qGpmNoOiDTpokQBR0NY",
  authDomain: "novamind-gs.firebaseapp.com",
  databaseURL: "https://novamind-gs-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "novamind-gs",
  storageBucket: "novamind-gs.firebasestorage.app",
  messagingSenderId: "278309634253",
  appId: "1:278309634253:web:2c0cb4a88e0e2293192984"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Screens & Elemente
const loginScreen = document.getElementById("login-screen");
const homeScreen = document.getElementById("home-screen");
const healthScreen = document.getElementById("health-screen");
const profileScreen = document.getElementById("profile-screen");
const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const logoutBtn = document.getElementById("logout-btn");
const homeCardsContainer = document.getElementById("home-cards");
const currentDateEl = document.getElementById("current-date");
const navButtons = document.querySelectorAll(".nav-btn");

// Health Elements
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

let isLoggedIn = false;

// Home-Kacheln Daten
let homeCardsData = [
  { type: "tasks", title: "ToDos", tasks: [{ text: "E-Mail beantworten", done: false }, { text: "Meeting vorbereiten", done: false }]},
  { type: "routines", title: "Routinen", tasks: [{ text: "Meditation", done: false }, { text: "Workout", done: false }]},
  { type: "calendar", title: "Kalender", view: "day", tasks: [
      { text: "10:00 Projektbesprechung", done: false },
      { text: "15:30 Arzttermin", done: false }
    ]},
  { type: "motivation", title: "Motivation", quote: "Du schaffst alles, was du dir vornimmst!"}
];

// Health Data
let healthEntries = JSON.parse(localStorage.getItem("healthEntries")) || [];

// Datum Home-Screen
function updateDate() {
  const now = new Date();
  const options = { weekday:"short", day:"numeric", month:"short", year:"numeric"};
  currentDateEl.textContent = now.toLocaleDateString("de-DE", options);
}

// Render Home Cards
function renderHomeCards() {
  homeCardsContainer.innerHTML = "";
  homeCardsData.forEach((card, index) => {
    const div = document.createElement("div");
    div.classList.add("home-card");
    div.dataset.index = index;
    const title = document.createElement("div");
    title.classList.add("card-title");
    title.textContent = card.title;
    div.appendChild(title);
    const content = document.createElement("div");
    content.classList.add("card-content");

    if(card.type === "motivation") content.textContent = card.quote;
    else if(card.tasks) {
      card.tasks.forEach(task=>{
        const taskDiv = document.createElement("div");
        taskDiv.classList.add("card-task");
        if(task.done) taskDiv.classList.add("completed");
        const checkbox = document.createElement("input"); checkbox.type="checkbox"; checkbox.checked=task.done;
        checkbox.addEventListener("change", ()=>{task.done=checkbox.checked; taskDiv.classList.toggle("completed", task.done)});
        const label = document.createElement("label"); label.textContent=task.text;
        taskDiv.appendChild(checkbox); taskDiv.appendChild(label);
        content.appendChild(taskDiv);
      });
    }

    div.appendChild(content);
    homeCardsContainer.appendChild(div);
  });
}

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

// Health Slider Update
painLevel.addEventListener("input", ()=>{ painValue.textContent = painLevel.value; });

// Save Health Entry
saveHealth.addEventListener("click", ()=>{
  const entry = {
    date: healthDate.value,
    time: healthTime.value,
    pain: painType.value==="Sonstige"? painOther.value : painType.value,
    level: painLevel.value,
    meds: Array.from(meds.selectedOptions).map(o=>o.value).concat(medOther.value?medOther.value:[])
  };
  healthEntries.push(entry);
  localStorage.setItem("healthEntries", JSON.stringify(healthEntries));
  renderHealthCalendar();
});

// Render Health Calendar
function renderHealthCalendar(){
  healthCalendar.innerHTML="";
  healthEntries.forEach((e, i)=>{
    const div=document.createElement("div");
    div.classList.add("home-card");
    div.style.background="rgba(255,255,255,0.15)";
    div.style.cursor="default";
    div.innerHTML=`<strong>${e.date} ${e.time}</strong><br>Typ: ${e.pain}<br>Stärke: ${e.level}<br>Medikamente: ${e.meds.join(", ")}<br><button data-index="${i}" class="delete-health">Löschen</button>`;
    healthCalendar.appendChild(div);
  });
  document.querySelectorAll(".delete-health").forEach(btn=>{
    btn.addEventListener("click",(ev)=>{
      const idx = ev.target.dataset.index;
      healthEntries.splice(idx,1);
      localStorage.setItem("healthEntries", JSON.stringify(healthEntries));
      renderHealthCalendar();
    });
  });
}

// Initial Health-Date & Time
const now = new Date();
healthDate.value = now.toISOString().split("T")[0];
healthTime.value = now.toTimeString().split(" ")[0].substring(0,5);
renderHealthCalendar();

// PDF Export
exportHealth.addEventListener("click", ()=>{
  const doc = new jsPDF();
  healthEntries.forEach((e, i)=>{
    doc.text(`${e.date} ${e.time} | Typ: ${e.pain} | Stärke: ${e.level} | Meds: ${e.meds.join(", ")}`,10,10+i*10);
  });
  doc.save("health-export.pdf");
});

// Login/Register
loginBtn.addEventListener("click", ()=>{
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  signInWithEmailAndPassword(auth,email,password)
    .catch(err=>alert(err.message));
});

registerBtn.addEventListener("click", ()=>{
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  createUserWithEmailAndPassword(auth,email,password)
    .catch(err=>alert(err.message));
});

// Logout
logoutBtn.addEventListener("click", ()=>{ signOut(auth); });

// Auth State
onAuthStateChanged(auth,user=>{
  isLoggedIn = !!user;
  updateUI();
});

// Update UI
function updateUI(){
  if(isLoggedIn){
    loginScreen.style.display="none";
    document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
    homeScreen.classList.add("active");
    document.querySelector(".bottom-nav").style.display="flex";
    renderHomeCards();
    updateDate();
  } else {
    loginScreen.style.display="flex";
    document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
    document.querySelector(".bottom-nav").style.display="none";
  }
}

// Initial Home UI
updateUI();
