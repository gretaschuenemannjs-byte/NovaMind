// =======================
// FIREBASE INITIALISIERUNG
// =======================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";

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
const auth = getAuth(app);
const db = getDatabase(app);

// =======================
// ELEMENTE
// =======================
const loginScreen = document.getElementById("login-screen");
const homeScreen = document.getElementById("home-screen");
const healthScreen = document.getElementById("health-screen");
const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const logoutBtn = document.getElementById("logout-btn");

// =======================
// LOGIN / REGISTER
// =======================
loginBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch(e) {
    alert(e.message);
  }
});

registerBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch(e) {
    alert(e.message);
  }
});

logoutBtn.addEventListener("click", () => {
  signOut(auth);
});

// Auth-State Listener
let isLoggedIn = false;
onAuthStateChanged(auth, user => {
  isLoggedIn = !!user;
  updateUI();
});

// =======================
// HOME SCREEN (unverändert)
// =======================
const homeCardsContainer = document.getElementById("home-cards");
let homeCardsData = [
  { type: "tasks", title: "ToDos", tasks: [{ text: "E-Mail beantworten", done: false }]},
  { type: "routines", title: "Routinen", tasks: [{ text: "Meditation", done: false }]},
  { type: "calendar", title: "Kalender", view: "day", tasks: []},
  { type: "motivation", title: "Motivation", quote: "Du schaffst alles, was du dir vornimmst!"}
];

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
    content.textContent = card.quote || "";

    div.appendChild(content);
    homeCardsContainer.appendChild(div);
  });
}

// =======================
// HEALTH SCREEN
// =======================
const healthContainer = document.getElementById("health-container");
const healthCalendar = document.getElementById("health-calendar");

const painTypes = ["Migräne", "Spannungskopfschmerzen", "Clusterkopfschmerzen", "Sonstige"];
const meds = ["Triptane","Paracetamol","Ibuprofen"];

let healthData = {};
if(localStorage.getItem("healthData")) healthData = JSON.parse(localStorage.getItem("healthData"));

function createHealthEntry() {
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const timeStr = now.toTimeString().slice(0,5);

  const entryDiv = document.createElement("div");
  entryDiv.classList.add("health-entry");

  // Datum & Uhrzeit nebeneinander
  const dateRow = document.createElement("div");
  dateRow.classList.add("entry-row");
  dateRow.innerHTML = `<label>Datum</label><input type="date" value="${dateStr}">` +
                      `<label>Uhrzeit</label><input type="time" value="${timeStr}">`;
  entryDiv.appendChild(dateRow);

  // Schmerzstärke
  const severityRow = document.createElement("div");
  severityRow.classList.add("entry-row");
  const slider = document.createElement("input");
  slider.type="range"; slider.min=1; slider.max=10; slider.value=5;
  const sliderVal = document.createElement("span"); sliderVal.textContent=slider.value;
  slider.addEventListener("input",()=>sliderVal.textContent=slider.value);
  severityRow.innerHTML="<label>Schmerzstärke</label>";
  severityRow.appendChild(slider); severityRow.appendChild(sliderVal);
  entryDiv.appendChild(severityRow);

  // Schmerztyp
  const typeRow = document.createElement("div");
  typeRow.classList.add("entry-row");
  const selectType = document.createElement("select");
  painTypes.forEach(pt=>{ const opt=document.createElement("option"); opt.value=pt; opt.textContent=pt; selectType.appendChild(opt); });
  const otherInput = document.createElement("input");
  otherInput.type="text"; otherInput.placeholder="Sonstiger Schmerz";
  typeRow.innerHTML="<label>Schmerzart</label>"; typeRow.appendChild(selectType); typeRow.appendChild(otherInput);
  entryDiv.appendChild(typeRow);

  // Medikamente
  const medsRow = document.createElement("div");
  medsRow.classList.add("entry-row");
  medsRow.innerHTML="<label>Medikamente</label>";
  meds.forEach(m=>{
    const btn = document.createElement("button");
    btn.type="button"; btn.textContent=m;
    btn.addEventListener("click",()=>btn.classList.toggle("selected"));
    medsRow.appendChild(btn);
  });
  const otherMed = document.createElement("input"); otherMed.placeholder="Andere Medikamente";
  medsRow.appendChild(otherMed);
  entryDiv.appendChild(medsRow);

  // Buttons speichern/löschen
  const btnRow = document.createElement("div");
  btnRow.classList.add("entry-buttons");
  const saveBtn = document.createElement("button"); saveBtn.textContent="Speichern";
  const deleteBtn = document.createElement("button"); deleteBtn.textContent="Löschen";
  saveBtn.addEventListener("click",()=>{
    const dateVal = dateRow.querySelector("input[type=date]").value;
    const timeVal = dateRow.querySelector("input[type=time]").value;
    const severityVal = parseInt(slider.value);
    let typeVal = selectType.value;
    if(typeVal==="Sonstige" && otherInput.value) typeVal=otherInput.value;
    const medVals = Array.from(medsRow.querySelectorAll("button.selected")).map(b=>b.textContent);
    if(otherMed.value) medVals.push(otherMed.value);
    if(!healthData[dateVal]) healthData[dateVal]=[];
    healthData[dateVal].push({time:timeVal,type:typeVal,severity:severityVal,meds:medVals});
    localStorage.setItem("healthData",JSON.stringify(healthData));
    renderHealthCalendar();
  });
  deleteBtn.addEventListener("click",()=>entryDiv.remove());
  btnRow.appendChild(saveBtn); btnRow.appendChild(deleteBtn);
  entryDiv.appendChild(btnRow);

  healthContainer.prepend(entryDiv);
}

// Health Kalender
function renderHealthCalendar() {
  healthCalendar.innerHTML="";
  Object.keys(healthData).sort().forEach(date=>{
    const dayDiv = document.createElement("div");
    dayDiv.textContent=date;
    const severitySum = healthData[date].reduce((a,e)=>a+e.severity/10,0);
    dayDiv.style.background=`rgba(255,0,0,${Math.min(1,severitySum)})`;
    dayDiv.style.margin="2px"; dayDiv.style.padding="6px"; dayDiv.style.borderRadius="8px";
    dayDiv.addEventListener("click",()=>alert(JSON.stringify(healthData[date],null,2)));
    healthCalendar.appendChild(dayDiv);
  });
}

// =======================
// UI UPDATE
// =======================
function updateUI() {
  if(isLoggedIn){
    loginScreen.style.display="none";
    document.querySelector(".bottom-nav").style.display="flex";
    homeScreen.classList.add("active");
    renderHomeCards();
    renderHealthCalendar();
  } else {
    loginScreen.style.display="flex";
    document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
    document.querySelector(".bottom-nav").style.display="none";
  }
}

// =======================
// INITIAL
// =======================
updateUI();
