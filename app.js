// Elemente
const loginScreen = document.getElementById("login-screen");
const homeScreen = document.getElementById("home-screen");
const settingsScreen = document.getElementById("settings-screen");
const logoutBtn = document.getElementById("logout-btn");
const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const navButtons = document.querySelectorAll(".nav-btn");

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

// Auth simuliert (Firebase o.ä. ersetzen)
let isLoggedIn = false;

function updateUI() {
  if(isLoggedIn) {
    loginScreen.style.display = "none";
    homeScreen.classList.add("active");
    document.querySelector(".bottom-nav").style.display = "flex";
  } else {
    loginScreen.style.display = "flex";
    loginScreen.style.opacity = 1;
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.querySelector(".bottom-nav").style.display = "none";
  }
}

loginBtn.addEventListener("click", () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  // Firebase Login hier
  console.log("Login mit:", email);
  isLoggedIn = true;
  updateUI();
});

registerBtn.addEventListener("click", () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  // Firebase Registration hier
  console.log("Registrierung mit:", email);
  isLoggedIn = true;
  updateUI();
});

logoutBtn.addEventListener("click", () => {
  console.log("Logout");
  isLoggedIn = false;
  updateUI();
});

// Initial UI
updateUI();
