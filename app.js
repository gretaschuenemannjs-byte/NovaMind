import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { getDatabase, ref, set, push, onValue, remove } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";

// Firebase config
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

// DOM Elements
const loginScreen = document.getElementById("login-screen");
const homeScreen = document.getElementById("home-screen");
const settingsScreen = document.getElementById("settings-screen");
const healthScreen = document.getElementById("health-screen");

const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const logoutBtn = document.getElementById("logout-btn");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const navButtons = document.querySelectorAll(".nav-btn");
const currentDateEl = document.getElementById("current-date");
const homeCardsContainer = document.getElementById("home-cards");
const healthCardsContainer = document.getElementById("health-cards");
const fontSelect = document.getElementById("font-select");

let userId = null;

// ======= LOGIN / AUTH =======
loginBtn.addEventListener("click", () => {
  signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value)
    .catch(err => alert(err.message));
});

registerBtn.addEventListener("click", () => {
  createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value)
    .catch(err => alert(err.message));
});

logoutBtn.addEventListener("click", () => {
  signOut(auth);
});

onAuthStateChanged(auth, user => {
  if(user) {
    userId = user.uid;
    loginScreen.style.display = "none";
    document.querySelector(".bottom-nav").style.display = "flex";
    homeScreen.classList.add("active");
    renderHomeCards();
    renderHealthCards();
    updateDate();
  } else {
    userId = null;
    loginScreen.style.display = "flex";
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.querySelector(".bottom-nav").style.display = "none";
  }
});

// ======= NAVIGATION =======
navButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    const target = document.getElementById(btn.dataset.target);
    if(target) target.classList.add("active");
    navButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// ======= FONT SETTINGS =======
fontSelect.addEventListener("change", () => {
  document.body.style.fontFamily = fontSelect.value;
});

// ======= DATE =======
function updateDate() {
  const now = new Date();
  const options = { weekday:"short", day:"numeric", month:"short", year:"numeric"};
  currentDateEl.textContent = now.toLocaleDateString("de-DE", options);
}

// ======= HOME SCREEN =======
let homeCardsData = [
  { type: "tasks", title: "ToDos", tasks: [{ text: "E-Mail beantworten", done: false }, { text: "Meeting vorbereiten", done: false }]},
  { type: "routines", title: "Routinen", tasks: [{ text: "Meditation", done: false }, { text: "Workout", done: false }]},
  { type: "calendar", title: "Kalender", view: "day", tasks: [
      { text: "10:00 Projektbesprechung", done: false },
      { text: "15:30 Arzttermin", done: false }
    ]},
  { type: "motivation", title: "Motivation", quote: "Du schaffst alles, was du dir vornimmst!"}
];

function renderHomeCards() {
  homeCardsContainer.innerHTML = "";
  homeCardsData.forEach((card,index) => {
    const div = document.createElement("div");
    div.classList.add("home-card");
    div.dataset.index = index;

    const title = document.createElement("div");
    title.classList.add("card-title");
    title.textContent = card.title;
    div.appendChild(title);

    const content = document.createElement("div");
    content.classList.add("card-content");

    if(card.type === "motivation") {
      content.classList.add("motivation-card");
      content.textContent = card.quote;
    } else {
      card.tasks.forEach(task => {
        const taskDiv = document.createElement("div");
        taskDiv.classList.add("card-task");
        if(task.done) taskDiv.classList.add("completed");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.done;
        checkbox.addEventListener("change", ()=>{
          task.done = checkbox.checked;
          taskDiv.classList.toggle("completed", task.done);
        });

        const label = document.createElement("label");
        label.textContent = task.text;

        taskDiv.appendChild(checkbox);
        taskDiv.appendChild(label);
        content.appendChild(taskDiv);
      });
    }

    div.appendChild(content);
    homeCardsContainer.appendChild(div);
  });

  // Drag & Drop
  let dragSrcIndex = null;
  homeCardsContainer.querySelectorAll(".home-card").forEach(card => {
    card.draggable = true;
    card.addEventListener("dragstart",(e)=>{
      dragSrcIndex = card.dataset.index;
      e.dataTransfer.effectAllowed = "move";
    });
    card.addEventListener("dragover", e => e.preventDefault());
    card.addEventListener("drop",(e)=>{
      e.preventDefault();
      const targetIndex = card.dataset.index;
      const temp = homeCardsData[dragSrcIndex];
      homeCardsData.splice(dragSrcIndex,1);
      homeCardsData.splice(targetIndex,0,temp);
      renderHomeCards();
    });
  });
}

// ======= HEALTH SCREEN =======
let healthData = []; // aus Firebase oder lokal
function renderHealthCards() {
  if(!userId) return;
  healthCardsContainer.innerHTML = "";

  // Formular Kachel für neuen Eintrag
  const addCard = document.createElement("div");
  addCard.classList.add("health-card");
  const title = document.createElement("h3");
  title.textContent = "Neuer Eintrag";
  addCard.appendChild(title);

  const dateInput = document.createElement("input");
  dateInput.type = "date";
  addCard.appendChild(dateInput);

  const timeInput = document.createElement("input");
  timeInput.type = "time";
  addCard.appendChild(timeInput);

  const painLevel = document.createElement("select");
  ["1","2","3","4","5"].forEach(l => {
    const opt = document.createElement("option");
    opt.value = l;
    opt.textContent = l;
    painLevel.appendChild(opt);
  });
  addCard.appendChild(painLevel);

  const painType = document.createElement("input");
  painType.type = "text";
  painType.placeholder = "Schmerzart";
  addCard.appendChild(painType);

  const notes = document.createElement("textarea");
  notes.placeholder = "Notizen";
  addCard.appendChild(notes);

  const meds = document.createElement("select");
  ["Triptane","Paracetamol","Ibuprofen"].forEach(m => {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = m;
    meds.appendChild(opt);
  });
  addCard.appendChild(meds);

  const addBtn = document.createElement("button");
  addBtn.textContent = "Eintrag speichern";
  addBtn.addEventListener("click", ()=>{
    if(!dateInput.value || !timeInput.value) return alert("Datum & Zeit auswählen");
    const newEntry = {
      date: dateInput.value,
      time: timeInput.value,
      pain: painLevel.value,
      type: painType.value,
      notes: notes.value,
      meds: meds.value
    };
    healthData.push(newEntry);
    push(ref(db,"health/"+userId), newEntry);
    renderHealthCards();
  });
  addCard.appendChild(addBtn);
  healthCardsContainer.appendChild(addCard);

  // bestehende Einträge aus Firebase abrufen
  const dbRef = ref(db,"health/"+userId);
  onValue(dbRef, snapshot=>{
    const data = snapshot.val();
    healthCardsContainer.querySelectorAll(".entry-card").forEach(c=>c.remove());
    if(data){
      Object.keys(data).forEach(key=>{
        const entry = data[key];
        const card = document.createElement("div");
        card.classList.add("health-card","entry-card");
        const h = document.createElement("h3");
        h.textContent = entry.date+" "+entry.time;
        card.appendChild(h);

        const p = document.createElement("div");
        p.textContent = `Schmerzstärke: ${entry.pain}, Art: ${entry.type}, Med: ${entry.meds}`;
        card.appendChild(p);

        const n = document.createElement("div");
        n.textContent = entry.notes;
        card.appendChild(n);

        const delBtn = document.createElement("button");
        delBtn.textContent = "Löschen";
        delBtn.addEventListener("click", ()=>{
          remove(ref(db,"health/"+userId+"/"+key));
        });
        card.appendChild(delBtn);
        healthCardsContainer.appendChild(card);
      });
    }
  });
}

// ======= INITIAL UI =======
document.addEventListener("DOMContentLoaded", ()=>{
  renderHomeCards();
  renderHealthCards();
  updateDate();
});
