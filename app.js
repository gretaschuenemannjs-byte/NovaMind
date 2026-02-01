const loginScreen = document.getElementById("login-screen");
const homeScreen = document.getElementById("home-screen");
const settingsScreen = document.getElementById("settings-screen");
const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const logoutBtn = document.getElementById("logout-btn");
const homeCardsContainer = document.getElementById("home-cards");
const currentDateEl = document.getElementById("current-date");
const fontSelect = document.getElementById("font-select");

const navButtons = document.querySelectorAll(".nav-btn");

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

    // Kalender-Icons
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

      // Darstellung der Tasks je nach Ansicht
      if(card.view === "day") {
        content.innerHTML = "";
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

// Navigation
navButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    const target = document.getElementById(btn.dataset.target);
    if(target) target.classList.add("active");
    navButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// Schriftart ändern
fontSelect.addEventListener("change", () => {
  document.body.style.fontFamily = fontSelect.value;
});

// UI updaten
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

// Login/Register
loginBtn.addEventListener("click", () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .catch(error => {
      alert(error.message);
    });
});

registerBtn.addEventListener("click", () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.createUserWithEmailAndPassword(email, password)
    .catch(error => {
      alert(error.message);
    });
});


// Logout
logoutBtn.addEventListener("click", () => {
  auth.signOut();
});

// --- Schmerztracking Health Screen ---
const painEntries = []; // lokal, später Firebase pro User speichern

const intensityInput = document.getElementById("pain-intensity");
const intensityLabel = document.getElementById("pain-intensity-label");
const typeSelect = document.getElementById("pain-type");
const notesInput = document.getElementById("pain-notes");
const medToggle = document.getElementById("pain-medication-toggle");
const medFields = document.getElementById("pain-medication-fields");
const medName = document.getElementById("pain-med-name");
const medDose = document.getElementById("pain-med-dose");
const medTime = document.getElementById("pain-med-time");
const saveBtn = document.getElementById("pain-save-btn");
const exportBtn = document.getElementById("pain-export-btn");
const entriesContainer = document.getElementById("pain-entries");

// Slider Label aktualisieren
intensityInput.addEventListener("input", () => {
  intensityLabel.textContent = intensityInput.value;
});

// Medikamentenfelder ein-/ausblenden
medToggle.addEventListener("change", () => {
  medFields.style.display = medToggle.checked ? "block" : "none";
});

// Speichern
saveBtn.addEventListener("click", () => {
  const entry = {
    date: new Date().toISOString().split("T")[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    intensity: parseInt(intensityInput.value),
    type: typeSelect.value,
    notes: notesInput.value,
    medication: medToggle.checked ? [{ name: medName.value, dose: medDose.value, time: medTime.value }] : []
  };

  painEntries.push(entry);
  renderPainEntries();

  // Reset Form
  intensityInput.value = 5;
  intensityLabel.textContent = 5;
  notesInput.value = "";
  medToggle.checked = false;
  medFields.style.display = "none";
});

// Anzeigen
function renderPainEntries() {
  entriesContainer.innerHTML = "";
  painEntries.slice().reverse().forEach(entry => {
    const div = document.createElement("div");
    div.classList.add("pain-entry");
    div.innerHTML = `
      <strong>${entry.date} ${entry.time}</strong> - ${entry.type} - Stärke: ${entry.intensity}<br>
      ${entry.notes ? entry.notes + "<br>" : ""}
      ${entry.medication.length ? "Medikament: " + entry.medication.map(m => `${m.name} ${m.dose} um ${m.time}`).join(", ") : ""}
    `;
    entriesContainer.appendChild(div);
  });
}

// Export Funktion (CSV)
exportBtn.addEventListener("click", () => {
  if(!painEntries.length) return alert("Keine Einträge zum Exportieren");

  let csv = "Datum,Uhrzeit,Schmerzstärke,Typ,Notizen,Medikament,Dosierung,Medikament-Zeit\n";
  painEntries.forEach(e => {
    if(e.medication.length){
      e.medication.forEach(med => {
        csv += `${e.date},${e.time},${e.intensity},${e.type},"${e.notes}",${med.name},${med.dose},${med.time}\n`;
      });
    } else {
      csv += `${e.date},${e.time},${e.intensity},${e.type},"${e.notes}",,,\n`;
    }
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `schmerztagebuch_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
});

// Initial
auth.onAuthStateChanged(user => {
  if(user) {
    loginScreen.style.display = "none";
    homeScreen.classList.add("active");
    document.querySelector(".bottom-nav").style.display = "flex";

    renderHomeCards();
    updateDate();
  } else {
    loginScreen.style.display = "flex";
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.querySelector(".bottom-nav").style.display = "none";
  }
});

