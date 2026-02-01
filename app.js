// ==================== LOGIN & AUTH ====================
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

let isLoggedIn = false;

// ==================== HOME CARDS ====================
let homeCardsData = [
  { type: "tasks", title: "ToDos", tasks: [{ text: "E-Mail beantworten", done: false }, { text: "Meeting vorbereiten", done: false }]},
  { type: "routines", title: "Routinen", tasks: [{ text: "Meditation", done: false }, { text: "Workout", done: false }]},
  { type: "calendar", title: "Kalender", view: "day", tasks: [
      { text: "10:00 Projektbesprechung", done: false },
      { text: "15:30 Arzttermin", done: false }
    ]},
  { type: "motivation", title: "Motivation", quote: "Du schaffst alles, was du dir vornimmst!"}
];

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
        for(let i=0;i<24;i++){
          const hourDiv = document.createElement("div");
          hourDiv.textContent = `${i}:00 - ${i+1}:00`;
          content.appendChild(hourDiv);
        }
      } else if(card.view === "week") {
        const weekDiv = document.createElement("div");
        weekDiv.style.display = "flex"; weekDiv.style.gap="2px";
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

// ==================== NAVIGATION ====================
navButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    const target = document.getElementById(btn.dataset.target);
    if(target) target.classList.add("active");
    navButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// ==================== SETTINGS ====================
fontSelect.addEventListener("change", () => {
  document.body.style.fontFamily = fontSelect.value;
});

// ==================== LOGIN & LOGOUT ====================
loginBtn.addEventListener("click", () => { isLoggedIn = true; updateUI(); });
registerBtn.addEventListener("click", () => { isLoggedIn = true; updateUI(); });
logoutBtn.addEventListener("click", () => { isLoggedIn = false; updateUI(); });

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

// ==================== INITIAL ====================
updateUI();

// ==================== HEALTH SCREEN ====================
const painIntensity = document.getElementById("pain-intensity");
const painLabel = document.getElementById("pain-intensity-label");
const painType = document.getElementById("pain-type");
const painNotes = document.getElementById("pain-notes");
const medCheckboxes = document.querySelectorAll(".med-checkbox");
const painSaveBtn = document.getElementById("pain-save-btn");
const painExportBtn = document.getElementById("pain-export-btn");
const calendarEntries = document.getElementById("calendar-entries");
const supplementName = document.getElementById("supplement-name");
const supplementTime = document.getElementById("supplement-time");
const supplementAddBtn = document.getElementById("supplement-add-btn");
const supplementList = document.getElementById("supplement-list");

let painData = [];
let supplements = [];

// Slider Label
painIntensity.addEventListener("input", () => {
  painLabel.textContent = painIntensity.value;
});

// Pain Save
painSaveBtn.addEventListener("click", () => {
  const meds = Array.from(medCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
  const entry = {
    date: new Date(),
    intensity: painIntensity.value,
    type: painType.value,
    notes: painNotes.value,
    meds: meds
  };
  painData.push(entry);
  renderPainCalendar();
  alert("Eintrag gespeichert");
});

// Render Calendar
function renderPainCalendar() {
  calendarEntries.innerHTML = "";
  painData.forEach(entry => {
    const div = document.createElement("div");
    div.classList.add("calendar-entry");
    div.style.borderLeft = `4px solid hsl(${entry.intensity*36}, 80%, 50%)`; // Farbcode nach Intensität
    div.textContent = `${entry.date.toLocaleString()}: ${entry.type}, Medikamente: ${entry.meds.join(", ")}`;
    calendarEntries.appendChild(div);
  });
}

// Supplements
supplementAddBtn.addEventListener("click", () => {
  if(!supplementName.value || !supplementTime.value) return;
  supplements.push({name: supplementName.value, time: supplementTime.value});
  renderSupplements();
  supplementName.value = "";
  supplementTime.value = "";
});

function renderSupplements() {
  supplementList.innerHTML = "";
  supplements.forEach((s, i) => {
    const div = document.createElement("div");
    div.textContent = `${s.time} - ${s.name}`;
    const delBtn = document.createElement("button");
    delBtn.textContent = "❌";
    delBtn.addEventListener("click", () => {
      supplements.splice(i,1);
      renderSupplements();
    });
    div.appendChild(delBtn);
    supplementList.appendChild(div);
  });
}

// Export CSV
painExportBtn.addEventListener("click", () => {
  let csv = "Datum,Zeit,Intensität,Typ,Medikamente,Notizen\n";
  painData.forEach(e => {
    csv += `"${e.date.toLocaleDateString()}","${e.date.toLocaleTimeString()}","${e.intensity}","${e.type}","${e.meds.join(";")}","${e.notes}"\n`;
  });
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "pain_export.csv";
  link.click();
});
