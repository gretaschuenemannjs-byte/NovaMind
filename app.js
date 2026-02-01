// -------------------
// Elemente
// -------------------
const loginScreen = document.getElementById("login-screen");
const homeScreen = document.getElementById("home-screen");
const healthScreen = document.getElementById("health-screen");
const settingsScreen = document.getElementById("settings-screen");
const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const logoutBtn = document.getElementById("logout-btn");
const homeCardsContainer = document.getElementById("home-cards");
const currentDateEl = document.getElementById("current-date");
const fontSelect = document.getElementById("font-select");
const healthCardsContainer = document.getElementById("health-cards");

const navButtons = document.querySelectorAll(".nav-btn");

let isLoggedIn = false;

// -------------------
// HOME SCREEN DATEN
// -------------------
let homeCardsData = [
  { type: "tasks", title: "ToDos", tasks: [{ text: "E-Mail beantworten", done: false }, { text: "Meeting vorbereiten", done: false }]},
  { type: "routines", title: "Routinen", tasks: [{ text: "Meditation", done: false }, { text: "Workout", done: false }]},
  { type: "calendar", title: "Kalender", view: "day", tasks: [
      { text: "10:00 Projektbesprechung", done: false },
      { text: "15:30 Arzttermin", done: false }
    ]},
  { type: "motivation", title: "Motivation", quote: "Du schaffst alles, was du dir vornimmst!"}
];

// -------------------
// HEALTH SCREEN DATEN
// -------------------
let healthEntries = []; // {date, time, painLevel, painType, meds:[{name}], notes}

// -------------------
// DATUM
// -------------------
function updateDate() {
  const now = new Date();
  const options = { weekday:"short", day:"numeric", month:"short", year:"numeric"};
  currentDateEl.textContent = now.toLocaleDateString("de-DE", options);
}

// -------------------
// HOME CARDS RENDERN
// -------------------
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
      const views = ["month", "week", "day"];
      views.forEach(v => {
        const btn = document.createElement("button");
        btn.innerHTML = v==="month"? "▦": v==="week"? "▮▮▮▮▮▮▮":"▬▬▬▬▬";
        btn.classList.toggle("active", card.view === v);
        btn.addEventListener("click", ()=>{ card.view=v; renderHomeCards(); });
        iconBar.appendChild(btn);
      });
      div.appendChild(iconBar);

      if(card.view === "day") {
        content.innerHTML = "";
        for(let i=0;i<24;i++){
          const hourDiv = document.createElement("div");
          hourDiv.textContent = `${i}:00 - ${i+1}:00`;
          content.appendChild(hourDiv);
        }
      } else if(card.view === "week") {
        const weekDiv = document.createElement("div");
        weekDiv.style.display="flex"; weekDiv.style.gap="2px";
        for(let i=0;i<7;i++){
          const dayCol = document.createElement("div");
          dayCol.style.flex="1"; dayCol.style.border="1px solid rgba(255,255,255,0.3)"; dayCol.style.height="80px";
          weekDiv.appendChild(dayCol);
        }
        content.appendChild(weekDiv);
      } else if(card.view === "month") {
        const monthDiv = document.createElement("div");
        monthDiv.style.display="grid"; monthDiv.style.gridTemplateColumns="repeat(7,1fr)"; monthDiv.style.gap="2px";
        for(let i=0;i<30;i++){
          const dayCell = document.createElement("div");
          dayCell.style.border="1px solid rgba(255,255,255,0.3)"; dayCell.style.height="40px";
          monthDiv.appendChild(dayCell);
        }
        content.appendChild(monthDiv);
      }
    } else if(card.type === "motivation") {
      content.classList.add("motivation-card");
      content.textContent = card.quote;
    } else {
      card.tasks.forEach((task) => {
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
    card.addEventListener("dragstart", (e) => {
      dragSrcIndex = card.dataset.index;
      e.dataTransfer.effectAllowed = "move";
    });
    card.addEventListener("dragover", (e) => e.preventDefault());
    card.addEventListener("drop", (e) => {
      e.preventDefault();
      const targetIndex = card.dataset.index;
      const temp = homeCardsData[dragSrcIndex];
      homeCardsData.splice(dragSrcIndex, 1);
      homeCardsData.splice(targetIndex, 0, temp);
      renderHomeCards();
    });
  });
}

// -------------------
// HEALTH SCREEN RENDERN
// -------------------
function renderHealthScreen() {
  healthCardsContainer.innerHTML = "";

  // Neue Eintrag Kachel
  const addCard = document.createElement("div");
  addCard.classList.add("health-card");

  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const timeStr = now.toTimeString().split(" ")[0].substring(0,5);

  addCard.innerHTML = `
    <label>Datum:</label>
    <input type="date" id="health-date" value="${dateStr}">
    <label>Uhrzeit:</label>
    <input type="time" id="health-time" value="${timeStr}">
    <label>Schmerzstärke:</label>
    <input type="range" id="pain-level" min="0" max="10" value="0">
    <label>Schmerztyp:</label>
    <input type="text" id="pain-type" placeholder="z.B. Migräne">
    <label>Medikamente:</label>
    <select multiple id="meds-select">
      <option value="Triptane">Triptane</option>
      <option value="Paracetamol">Paracetamol</option>
      <option value="Ibuprofen">Ibuprofen</option>
    </select>
    <input type="text" id="custom-med" placeholder="Eigene Medikamente">
    <label>Notizen:</label>
    <textarea id="notes" placeholder="Notizen..."></textarea>
    <button id="save-health-entry">Speichern</button>
  `;
  healthCardsContainer.appendChild(addCard);

  // Event Listener Speichern
  document.getElementById("save-health-entry").addEventListener("click", () => {
    const entry = {
      date: document.getElementById("health-date").value,
      time: document.getElementById("health-time").value,
      painLevel: parseInt(document.getElementById("pain-level").value),
      painType: document.getElementById("pain-type").value,
      meds: Array.from(document.getElementById("meds-select").selectedOptions).map(o=>o.value),
      customMed: document.getElementById("custom-med").value,
      notes: document.getElementById("notes").value
    };
    healthEntries.push(entry);
    renderHealthCalendar();
  });

  renderHealthCalendar();
}

// -------------------
// HEALTH CALENDAR RENDERN
// -------------------
function renderHealthCalendar() {
  // Entferne alte Kalenderkarten
  const existing = document.querySelectorAll(".health-card.calendar-entry");
  existing.forEach(e => e.remove());

  // Gruppiere nach Datum
  const grouped = {};
  healthEntries.forEach(e => {
    if(!grouped[e.date]) grouped[e.date]=[];
    grouped[e.date].push(e);
  });

  Object.keys(grouped).sort().forEach(date => {
    grouped[date].forEach((entry, idx) => {
      const card = document.createElement("div");
      card.classList.add("health-card", "calendar-entry");
      card.innerHTML = `
        <strong>${date} ${entry.time}</strong>
        <div>Schmerzstärke: ${entry.painLevel}</div>
        <div>Schmerztyp: ${entry.painType}</div>
        <div>Medikamente: ${[...entry.meds, entry.customMed].filter(Boolean).join(", ")}</div>
        <div>Notizen: ${entry.notes}</div>
        <button class="delete-entry">Löschen</button>
      `;
      healthCardsContainer.appendChild(card);

      card.querySelector(".delete-entry").addEventListener("click", ()=>{
        const index = healthEntries.indexOf(entry);
        if(index>-1) healthEntries.splice(index,1);
        renderHealthCalendar();
      });
    });
  });
}

// -------------------
// NAVIGATION
// -------------------
navButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    const target = document.getElementById(btn.dataset.target);
    if(target) target.classList.add("active");
    navButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    if(btn.dataset.target==="health-screen") renderHealthScreen();
  });
});

// -------------------
// SCHRIFTART ÄNDERN
// -------------------
fontSelect.addEventListener("change", () => {
  document.body.style.fontFamily = fontSelect.value;
});

// -------------------
// UI UPDATE
// -------------------
function updateUI() {
  if(isLoggedIn) {
    loginScreen.style.display = "none";
    homeScreen.classList.add("active");
    document.querySelector(".bottom-nav").style.display = "flex";

    renderHomeCards();
    updateDate();
  } else {
    loginScreen.style.display = "flex";
    loginScreen.style.opacity = 1;
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.querySelector(".bottom-nav").style.display = "none";
  }
}

// -------------------
// LOGIN / REGISTER
// -------------------
loginBtn.addEventListener("click", () => { isLoggedIn = true; updateUI(); });
registerBtn.addEventListener("click", () => { isLoggedIn = true; updateUI(); });

// -------------------
// LOGOUT
// -------------------
logoutBtn.addEventListener("click", () => { isLoggedIn = false; updateUI(); });

// -------------------
// INITIAL
// -------------------
updateUI();
