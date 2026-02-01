// ====== LOGIN + FIREBASE SETUP ======
const loginScreen = document.getElementById("login-screen");
const homeScreen = document.getElementById("home-screen");
const settingsScreen = document.getElementById("profile-screen");
const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const logoutBtn = document.getElementById("logout-btn");
const homeCardsContainer = document.getElementById("home-cards");
const currentDateEl = document.getElementById("current-date");
const fontSelect = document.getElementById("font-select");
const healthCardsContainer = document.getElementById("health-cards");

const navButtons = document.querySelectorAll(".nav-btn");

// Firebase CDN muss im HTML eingebunden sein
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { getDatabase, ref, set, push, get, child, remove } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";

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
const db = getDatabase(app);

setPersistence(auth, browserLocalPersistence);

let currentUser = null;
let homeCardsData = [
  { type: "tasks", title: "ToDos", tasks: [{ text: "E-Mail beantworten", done: false }, { text: "Meeting vorbereiten", done: false }]},
  { type: "routines", title: "Routinen", tasks: [{ text: "Meditation", done: false }, { text: "Workout", done: false }]},
  { type: "calendar", title: "Kalender", view: "day", tasks: [
      { text: "10:00 Projektbesprechung", done: false },
      { text: "15:30 Arzttermin", done: false }
    ]},
  { type: "motivation", title: "Motivation", quote: "Du schaffst alles, was du dir vornimmst!"}
];

let healthData = []; // Array für Health-Einträge

// ====== LOGIN + REGISTER ======
loginBtn.addEventListener("click", () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  signInWithEmailAndPassword(auth, email, password)
    .then(userCredential => { currentUser = userCredential.user; updateUI(); loadHealthData(); })
    .catch(err => alert(err.message));
});

registerBtn.addEventListener("click", () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  createUserWithEmailAndPassword(auth, email, password)
    .then(userCredential => { currentUser = userCredential.user; updateUI(); })
    .catch(err => alert(err.message));
});

// Logout
logoutBtn.addEventListener("click", () => {
  signOut(auth).then(() => { currentUser = null; updateUI(); });
});

// Firebase State Listener
onAuthStateChanged(auth, user => {
  if(user){ currentUser = user; updateUI(); loadHealthData(); }
  else{ currentUser = null; updateUI(); }
});

// ====== NAVIGATION ======
navButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    const target = document.getElementById(btn.dataset.target);
    if(target) target.classList.add("active");
    navButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// ====== FONT CHANGE ======
fontSelect.addEventListener("change", () => {
  document.body.style.fontFamily = fontSelect.value;
});

// ====== HOME SCREEN ======
function updateDate() {
  const now = new Date();
  const options = { weekday:"short", day:"numeric", month:"short", year:"numeric"};
  currentDateEl.textContent = now.toLocaleDateString("de-DE", options);
}

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

    if(card.type === "motivation"){ content.classList.add("motivation-card"); content.textContent = card.quote; }
    else{ 
      card.tasks.forEach(task => {
        const taskDiv = document.createElement("div");
        taskDiv.classList.add("card-task");
        if(task.done) taskDiv.classList.add("completed");
        const checkbox = document.createElement("input"); checkbox.type="checkbox"; checkbox.checked=task.done;
        checkbox.addEventListener("change", ()=>{ task.done = checkbox.checked; taskDiv.classList.toggle("completed", task.done); });
        const label = document.createElement("label"); label.textContent = task.text;
        taskDiv.appendChild(checkbox); taskDiv.appendChild(label); content.appendChild(taskDiv);
      });
    }

    div.appendChild(content); homeCardsContainer.appendChild(div);
  });

  // Drag & Drop
  let dragSrcIndex = null;
  homeCardsContainer.querySelectorAll(".home-card").forEach(card => {
    card.draggable = true;
    card.addEventListener("dragstart", e => { dragSrcIndex = card.dataset.index; e.dataTransfer.effectAllowed = "move"; });
    card.addEventListener("dragover", e => e.preventDefault());
    card.addEventListener("drop", e => {
      e.preventDefault();
      const targetIndex = card.dataset.index;
      const temp = homeCardsData[dragSrcIndex];
      homeCardsData.splice(dragSrcIndex, 1);
      homeCardsData.splice(targetIndex, 0, temp);
      renderHomeCards();
    });
  });
}

// ====== HEALTH SCREEN ======
function renderHealthCards(){
  healthCardsContainer.innerHTML = "";

  // Einträge hinzufügen
  const addCard = document.createElement("div");
  addCard.classList.add("health-card");

  const title = document.createElement("h3"); title.textContent="Neuer Eintrag"; addCard.appendChild(title);

  const dateInput = document.createElement("input"); dateInput.type="date"; addCard.appendChild(dateInput);
  const timeInput = document.createElement("input"); timeInput.type="time"; addCard.appendChild(timeInput);
  const painInput = document.createElement("input"); painInput.type="number"; painInput.placeholder="Schmerzstärke 1-10"; addCard.appendChild(painInput);

  const painTypeInput = document.createElement("select");
  ["Kopfschmerz","Migräne","Andere"].forEach(p=>{ const o=document.createElement("option"); o.value=o.text=p; painTypeInput.appendChild(o); });
  addCard.appendChild(painTypeInput);

  const medInput = document.createElement("select"); medInput.multiple=true;
  ["Triptane","Paracetamol","Ibuprofen"].forEach(m=>{ const o=document.createElement("option"); o.value=o.text=m; medInput.appendChild(o); });
  addCard.appendChild(medInput);

  const noteInput = document.createElement("textarea"); noteInput.placeholder="Notizen..."; addCard.appendChild(noteInput);

  const saveBtn = document.createElement("button"); saveBtn.textContent="Speichern";
  saveBtn.addEventListener("click", ()=>{ 
    if(!dateInput.value) return alert("Datum erforderlich");
    const newEntry = {
      date: dateInput.value, time: timeInput.value, pain: painInput.value,
      type: painTypeInput.value, medications: Array.from(medInput.selectedOptions).map(o=>o.value), note: noteInput.value
    };
    const newRef = push(ref(db, `health/${currentUser.uid}`));
    set(newRef,newEntry).then(()=>{ loadHealthData(); });
  });
  addCard.appendChild(saveBtn);

  healthCardsContainer.appendChild(addCard);

  // vorhandene Einträge
  healthData.forEach((entry)=>{
    const card = document.createElement("div"); card.classList.add("health-card");
    const t=document.createElement("h3"); t.textContent=`${entry.date} ${entry.time}`; card.appendChild(t);
    const p=document.createElement("div"); p.textContent=`Schmerz: ${entry.pain} | Typ: ${entry.type}`; card.appendChild(p);
    const m=document.createElement("div"); m.textContent=`Medikamente: ${entry.medications.join(", ")}`; card.appendChild(m);
    if(entry.note){ const n=document.createElement("div"); n.textContent=`Notiz: ${entry.note}`; card.appendChild(n); }

    const delBtn=document.createElement("button"); delBtn.textContent="Löschen";
    delBtn.addEventListener("click", ()=>{
      remove(child(ref(db, `health/${currentUser.uid}`), entry.id)).then(()=>{ loadHealthData(); });
    });
    card.appendChild(delBtn);

    healthCardsContainer.appendChild(card);
  });
}

function loadHealthData(){
  if(!currentUser) return;
  get(ref(db, `health/${currentUser.uid}`)).then(snapshot=>{
    healthData=[];
    snapshot.forEach(snap=>{
      const val=snap.val(); val.id=snap.key; healthData.push(val);
    });
    renderHealthCards();
  });
}

// ====== UPDATE UI ======
function updateUI(){
  if(currentUser){
    loginScreen.style.display="none";
    homeScreen.classList.add("active");
    document.querySelector(".bottom-nav").style.display="flex";
    renderHomeCards(); updateDate(); renderHealthCards();
  } else {
    loginScreen.style.display="flex";
    document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
    document.querySelector(".bottom-nav").style.display="none";
  }
}

// ====== INITIAL ======
updateUI();

