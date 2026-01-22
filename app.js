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

// Login Status
let isLoggedIn = false;

// Tagesübersicht-Kacheln
let homeCardsData = [
  { type: "tasks", title: "ToDos", tasks: [
      { text: "E-Mail beantworten", done: false },
      { text: "Meeting vorbereiten", done: false }
    ]},
  { type: "routines", title: "Routinen", tasks: [
      { text: "Meditation", done: false },
      { text: "Workout", done: false }
    ]},
  { type: "calendar", title: "Kalender", tasks: [
      { text: "Projektbesprechung 10:00", done: false },
      { text: "Arzttermin 15:30", done: false }
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

    if(card.type === "motivation") {
      content.classList.add("motivation-card");
      content.textContent = card.quote;
    } else {
      card.tasks.forEach((task) => {
        const taskDiv = document.createElement("div");
        taskDiv.classList.add("card-task");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.done;
        checkbox.addEventListener("change", () => {
          task.done = checkbox.checked;
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
loginBtn.addEventListener("click", () => { isLoggedIn = true; updateUI(); });
registerBtn.addEventListener("click", () => { isLoggedIn = true; updateUI(); });

// Logout
logoutBtn.addEventListener("click", () => { isLoggedIn = false; updateUI(); });

// Initial
updateUI();
