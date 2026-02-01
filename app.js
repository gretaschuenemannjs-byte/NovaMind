import { auth, db, ref, set, push, get, child, update, remove } from './firebase-import.js'; // falls du modular arbeitest

// Screens & DOM
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
const homeCardsContainer = document.getElementById("home-cards");
const healthCardsContainer = document.getElementById("health-cards");
const currentDateEl = document.getElementById("current-date");
const fontSelect = document.getElementById("font-select");

// --- GLOBAL DATA ---
let homeCardsData = [
  { type: "tasks", title: "ToDos", tasks: [{ text: "E-Mail beantworten", done: false }, { text: "Meeting vorbereiten", done: false }]},
  { type: "routines", title: "Routinen", tasks: [{ text: "Meditation", done: false }, { text: "Workout", done: false }]},
  { type: "calendar", title: "Kalender", view: "day", tasks: [
      { text: "10:00 Projektbesprechung", done: false },
      { text: "15:30 Arzttermin", done: false }
    ]},
  { type: "motivation", title: "Motivation", quote: "Du schaffst alles, was du dir vornimmst!"}
];

// --- USER STATE ---
let currentUser = null;
let healthData = []; // Schmerz-/Medikamenten-Einträge
let supplements = []; // tägliche Medikation

// --- DATE ---
function updateDate() {
  const now = new Date();
  const options = { weekday:"short", day:"numeric", month:"short", year:"numeric"};
  currentDateEl.textContent = now.toLocaleDateString("de-DE", options);
}

// --- LOGIN / REGISTER ---
loginBtn.addEventListener("click", async () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  try {
    const userCredential = await firebaseApp.auth.signInWithEmailAndPassword(auth, email, password);
    currentUser = userCredential.user;
    localStorage.setItem("uid", currentUser.uid);
    updateUI();
    loadHealthData();
    loadSupplements();
  } catch(e) {
    alert(e.message);
  }
});

registerBtn.addEventListener("click", async () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  try {
    const userCredential = await firebaseApp.auth.createUserWithEmailAndPassword(auth, email, password);
    currentUser = userCredential.user;
    localStorage.setItem("uid", currentUser.uid);
    updateUI();
  } catch(e) {
    alert(e.message);
  }
});

logoutBtn.addEventListener("click", async () => {
  await firebaseApp.auth.signOut(auth);
  currentUser = null;
  localStorage.removeItem("uid");
  updateUI();
});

// Persistent Login
firebaseApp.auth.onAuthStateChanged(auth, user => {
  if(user) {
    currentUser = user;
    updateUI();
    loadHealthData();
    loadSupplements();
  } else {
    currentUser = null;
    updateUI();
  }
});

// --- NAVIGATION ---
navButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    const target = document.getElementById(btn.dataset.target);
    if(target) target.classList.add("active");
    navButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// --- FONT ---
fontSelect.addEventListener("change", () => {
  document.body.style.fontFamily = fontSelect.value;
});

// --- HOME CARDS ---
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
        checkbox.addEventListener("change", () => {
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
    card.addEventListener("dragstart", e => {
      dragSrcIndex = card.dataset.index;
    });
    card.addEventListener("dragover", e => e.preventDefault());
    card.addEventListener("drop", e => {
      e.preventDefault();
      const targetIndex = card.dataset.index;
      const temp = homeCardsData[dragSrcIndex];
      homeCardsData.splice(dragSrcIndex,1);
      homeCardsData.splice(targetIndex,0,temp);
      renderHomeCards();
    });
  });
}

// --- HEALTH SCREEN ---

function loadHealthData() {
  if(!currentUser) return;
  const dbRef = ref(db, `users/${currentUser.uid}/health`);
  get(dbRef).then(snapshot => {
    healthData = snapshot.val() || [];
    renderHealthCards();
  });
}

function loadSupplements() {
  if(!currentUser) return;
  const dbRef = ref(db, `users/${currentUser.uid}/supplements`);
  get(dbRef).then(snapshot => {
    supplements = snapshot.val() || [];
    renderSupplementCards();
  });
}

function saveHealthData() {
  if(!currentUser) return;
  set(ref(db, `users/${currentUser.uid}/health`), healthData);
}

function saveSupplements() {
  if(!currentUser) return;
  set(ref(db, `users/${currentUser.uid}/supplements`), supplements);
}

// Render Health Cards
function renderHealthCards() {
  healthCardsContainer.innerHTML = "";

  healthData.forEach((entry, idx) => {
    const div = document.createElement("div");
    div.classList.add("health-card");

    div.innerHTML = `
      <h3>${entry.date}</h3>
      <label>Schmerztyp</label>
      <div>${entry.type}</div>
      <label>Intensität</label>
      <div>${entry.intensity}</div>
      <label>Notizen</label>
      <div>${entry.notes || ""}</div>
      <label>Medikamente</label>
      <div>${entry.meds.join(", ")}</div>
      <button data-idx="${idx}" class="delete-entry-btn">Eintrag löschen</button>
    `;
    healthCardsContainer.appendChild(div);
  });

  // Löschen Button
  healthCardsContainer.querySelectorAll(".delete-entry-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = btn.dataset.idx;
      healthData.splice(idx,1);
      saveHealthData();
      renderHealthCards();
    });
  });
}

// --- Supplements Cards ---
function renderSupplementCards() {
  // ähnlich wie HealthCards, mit editierbar und löschbar
}

// --- UPDATE UI ---
function updateUI() {
  if(currentUser) {
    loginScreen.style.display = "none";
    homeScreen.classList.add("active");
    document.querySelector(".bottom-nav").style.display = "flex";
    renderHomeCards();
    renderHealthCards();
    updateDate();
  } else {
    loginScreen.style.display = "flex";
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.querySelector(".bottom-nav").style.display = "none";
  }
}

// --- INITIAL ---
updateUI();
