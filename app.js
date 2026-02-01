// =======================
// ELEMENTE
// =======================
const loginScreen = document.getElementById("login-screen");
const homeScreen = document.getElementById("home-screen");
const settingsScreen = document.getElementById("settings-screen");
const healthScreen = document.getElementById("health-screen");
const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const logoutBtn = document.getElementById("logout-btn");
const homeCardsContainer = document.getElementById("home-cards");
const currentDateEl = document.getElementById("current-date");
const fontSelect = document.getElementById("font-select");
const navButtons = document.querySelectorAll(".nav-btn");

// =======================
// LOGIN
// =======================
let isLoggedIn = false;

// Firebase Setup
const firebaseConfig = {
  apiKey: "AIzaSyA8TpIvsBtQQbH4qGpmNoOiDTpokQBR0NY",
  authDomain: "novamind-gs.firebaseapp.com",
  databaseURL: "https://novamind-gs-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "novamind-gs",
  storageBucket: "novamind-gs.firebasestorage.app",
  messagingSenderId: "278309634253",
  appId: "1:278309634253:web:2c0cb4a88e0e2293192984"
};
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// Login/Register Listener
loginBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await auth.signInWithEmailAndPassword(email, password);
  } catch (e) {
    alert(e.message);
  }
});
registerBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await auth.createUserWithEmailAndPassword(email, password);
  } catch (e) {
    alert(e.message);
  }
});

// Auth State
auth.onAuthStateChanged(user => {
  isLoggedIn = !!user;
  updateUI();
});

// Logout
logoutBtn.addEventListener("click", () => auth.signOut());

// =======================
// HOME SCREEN
// =======================
let homeCardsData = [
  { type: "tasks", title: "ToDos", tasks: [{ text: "E-Mail beantworten", done: false }, { text: "Meeting vorbereiten", done: false }]},
  { type: "routines", title: "Routinen", tasks: [{ text: "Meditation", done: false }, { text: "Workout", done: false }]},
  { type: "calendar", title: "Kalender", view: "day", tasks: [
      { text: "10:00 Projektbesprechung", done: false },
      { text: "15:30 Arzttermin", done: false }
    ]},
  { type: "motivation", title: "Motivation", quote: "Du schaffst alles, was du dir vornimmst!"}
];

// Datum
function updateDate() {
  const now = new Date();
  const options = { weekday:"short", day:"numeric", month:"short", year:"numeric"};
  currentDateEl.textContent = now.toLocaleDateString("de-DE", options);
}

// Home-Kacheln rendern
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

    if(card.type === "calendar") {
      const iconBar = document.createElement("div");
      iconBar.classList.add("calendar-view-icons");
      ["month","week","day"].forEach(v => {
        const btn = document.createElement("button");
        btn.innerHTML = v==="month"? "▦": v==="week"? "▮▮▮▮▮▮▮":"▬▬▬▬▬";
        btn.classList.toggle("active", card.view===v);
        btn.addEventListener("click", ()=>{ card.view=v; renderHomeCards(); });
        iconBar.appendChild(btn);
      });
      div.appendChild(iconBar);

      if(card.view==="day") for(let i=0;i<24;i++){
        const hourDiv = document.createElement("div");
        hourDiv.textContent = `${i}:00 - ${i+1}:00`;
        content.appendChild(hourDiv);
      } else if(card.view==="week"){
        const weekDiv = document.createElement("div");
        weekDiv.style.display="flex"; weekDiv.style.gap="2px";
        for(let i=0;i<7;i++){
          const dayCol = document.createElement("div");
          dayCol.style.flex="1"; dayCol.style.border="1px solid rgba(255,255,255,0.3)"; dayCol.style.height="80px";
          weekDiv.appendChild(dayCol);
        }
        content.appendChild(weekDiv);
      } else if(card.view==="month"){
        const monthDiv = document.createElement("div");
        monthDiv.style.display="grid"; monthDiv.style.gridTemplateColumns="repeat(7,1fr)"; monthDiv.style.gap="2px";
        for(let i=0;i<30;i++){
          const dayCell = document.createElement("div");
          dayCell.style.border="1px solid rgba(255,255,255,0.3)"; dayCell.style.height="40px";
          monthDiv.appendChild(dayCell);
        }
        content.appendChild(monthDiv);
      }

    } else if(card.type==="motivation"){
      content.classList.add("motivation-card");
      content.textContent = card.quote;
    } else {
      card.tasks.forEach(task=>{
        const taskDiv = document.createElement("div");
        taskDiv.classList.add("card-task");
        if(task.done) taskDiv.classList.add("completed");
        const checkbox=document.createElement("input");
        checkbox.type="checkbox";
        checkbox.checked = task.done;
        checkbox.addEventListener("change",()=>{task.done=checkbox.checked; taskDiv.classList.toggle("completed",task.done)});
        const label=document.createElement("label");
        label.textContent=task.text;
        taskDiv.appendChild(checkbox); taskDiv.appendChild(label);
        content.appendChild(taskDiv);
      });
    }
    div.appendChild(content);
    homeCardsContainer.appendChild(div);
  });

  // Drag & Drop
  let dragSrcIndex = null;
  homeCardsContainer.querySelectorAll(".home-card").forEach(card=>{
    card.draggable=true;
    card.addEventListener("dragstart",e=>{dragSrcIndex=card.dataset.index; e.dataTransfer.effectAllowed="move"});
    card.addEventListener("dragover",e=>e.preventDefault());
    card.addEventListener("drop",e=>{
      e.preventDefault();
      const targetIndex=card.dataset.index;
      const temp=homeCardsData[dragSrcIndex];
      homeCardsData.splice(dragSrcIndex,1);
      homeCardsData.splice(targetIndex,0,temp);
      renderHomeCards();
    });
  });
}

// =======================
// HEALTH SCREEN
// =======================
const healthContainer = document.getElementById("health-container");

// Schmerzarten und Medikamente
const painTypes = ["Migräne","Spannungskopfschmerzen","Clusterkopfschmerzen","Sonstige"];
const meds = ["Triptane","Paracetamol","Ibuprofen"];

let healthData = {}; // Struktur: { 'YYYY-MM-DD': [{time, type, severity, meds}] }
if(localStorage.getItem("healthData")) healthData=JSON.parse(localStorage.getItem("healthData"));

// Neues Health Entry erstellen
function createHealthEntry() {
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const timeStr = now.toTimeString().slice(0,5);

  const entryDiv = document.createElement("div");
  entryDiv.classList.add("health-entry");

  // Datum & Uhrzeit
  const dateRow = document.createElement("div");
  dateRow.classList.add("entry-row");
  dateRow.innerHTML = `<label>Datum</label><input type="date" value="${dateStr}">` +
                      `<label>Uhrzeit</label><input type="time" value="${timeStr}">`;
  entryDiv.appendChild(dateRow);

  // Schmerzstärke
  const severityRow = document.createElement("div");
  severityRow.classList.add("entry-row");
  const slider = document.createElement("input");
  slider.type="range";
  slider.min=1;
  slider.max=10;
  slider.value=5;
  const sliderVal = document.createElement("span");
  sliderVal.textContent=slider.value;
  slider.addEventListener("input",()=>sliderVal.textContent=slider.value);
  severityRow.innerHTML="<label>Schmerzstärke</label>";
  severityRow.appendChild(slider); severityRow.appendChild(sliderVal);
  entryDiv.appendChild(severityRow);

  // Schmerztyp
  const typeRow = document.createElement("div");
  typeRow.classList.add("entry-row");
  const selectType = document.createElement("select");
  painTypes.forEach(pt=>{const opt=document.createElement("option"); opt.value=pt; opt.textContent=pt; selectType.appendChild(opt)});
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
    btn.type="button";
    btn.textContent=m;
    btn.addEventListener("click",()=>btn.classList.toggle("selected"));
    medsRow.appendChild(btn);
  });
  const otherMed = document.createElement("input"); otherMed.placeholder="Andere Medikamente";
  medsRow.appendChild(otherMed);
  entryDiv.appendChild(medsRow);

  // Buttons
  const btnRow = document.createElement("div");
  btnRow.classList.add("entry-buttons");
  const saveBtn = document.createElement("button");
  saveBtn.textContent="Speichern";
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent="Löschen";
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

// Health Kalender rendern
function renderHealthCalendar() {
  const calDiv = document.getElementById("health-calendar");
  calDiv.innerHTML="";
  Object.keys(healthData).sort().forEach(date=>{
    const dayDiv = document.createElement("div");
    dayDiv.textContent=date;
    dayDiv.style.background=`rgba(255,0,0,${Math.min(1,healthData[date].reduce((a,e)=>a+e.severity/10,0))})`;
    dayDiv.style.margin="2px";
    dayDiv.style.padding="6px";
    dayDiv.style.borderRadius="8px";
    dayDiv.addEventListener("click",()=>{
      alert(JSON.stringify(healthData[date],null,2));
    });
    calDiv.appendChild(dayDiv);
  });
}

// Supplements
function renderSupplements() {
  const supDiv = document.getElementById("supplement-list");
  supDiv.innerHTML="";
  let supps = JSON.parse(localStorage.getItem("supplements")||"[]");
  supps.forEach((s,i)=>{
    const div=document.createElement("div");
    div.textContent=`${s.name} - ${s.time}`;
    const delBtn=document.createElement("button");
    delBtn.textContent="Löschen";
    delBtn.addEventListener("click",()=>{
      supps.splice(i,1);
      localStorage.setItem("supplements",JSON.stringify(supps));
      renderSupplements();
    });
    div.appendChild(delBtn);
    supDiv.appendChild(div);
  });
}

// =======================
// NAVIGATION
// =======================
navButtons.forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
    const target = document.getElementById(btn.dataset.target);
    if(target) target.classList.add("active");
    navButtons.forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// Schriftart ändern
fontSelect.addEventListener("change",()=>{
  document.body.style.fontFamily=fontSelect.value;
});

// UI aktualisieren
function updateUI() {
  if(isLoggedIn){
    loginScreen.style.display="none";
    document.querySelector(".bottom-nav").style.display="flex";
    homeScreen.classList.add("active");
    renderHomeCards();
    updateDate();
    renderHealthCalendar();
    renderSupplements();
  } else {
    loginScreen.style.display="flex";
    loginScreen.style.opacity=1;
    document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
    document.querySelector(".bottom-nav").style.display="none";
  }
}

// =======================
// INITIAL
// =======================
updateUI();
