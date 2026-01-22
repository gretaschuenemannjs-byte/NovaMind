const loginScreen = document.getElementById("login-screen");
const homeScreen = document.getElementById("home-screen");
const settingsScreen = document.getElementById("settings-screen");
const logoutBtn = document.getElementById("logout-btn");
const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

// Home Buttons (Beispiele)
document.getElementById("tasks-btn").addEventListener("click", () => alert("Aufgaben geöffnet"));
document.getElementById("calendar-btn").addEventListener("click", () => alert("Kalender geöffnet"));
document.getElementById("notes-btn").addEventListener("click", () => alert("Notizen geöffnet"));
document.getElementById("profile-btn").addEventListener("click", () => alert("Profil geöffnet"));

// Bottom Navigation
const navButtons = document.querySelectorAll(".nav-btn");
navButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    const target = document.getElementById(btn.dataset.target);
    target.classList.add("active");
    navButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// Auth Status prüfen
auth.onAuthStateChanged(user => {
  if(user) {
    // NEU: Sanfter Übergang Login → Home
    loginScreen.style.opacity = 1;
    loginScreen.style.transition = "opacity 0.6s ease-in-out";
    loginScreen.style.opacity = 0;

    setTimeout(() => {
      loginScreen.style.display = "none";
      homeScreen.classList.add("active");
      document.querySelector(".bottom-nav").style.display = "flex";
    }, 600); // entspricht der Transition Dauer
  } else {
    loginScreen.style.display = "flex";
    loginScreen.style.opacity = 1;
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.querySelector(".bottom-nav").style.display = "none";
  }
});

// Login
loginBtn.addEventListener("click", () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  auth.signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      console.log("Login erfolgreich:", userCredential.user.email);
      // Übergang passiert automatisch
    })
    .catch(error => alert("Login Fehler: " + error.message));
});

// Registrierung
registerBtn.addEventListener("click", () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  auth.createUserWithEmailAndPassword(email, password)
    .then(userCredential => {
      const userId = userCredential.user.uid;
      database.ref("users/" + userId).set({
        email: email,
        createdAt: new Date().toISOString()
      });
      console.log("Registrierung erfolgreich:", userCredential.user.email);
    })
    .catch(error => alert("Registrierung Fehler: " + error.message));
});

// Logout
logoutBtn.addEventListener("click", () => {
  auth.signOut().then(() => console.log("Logout erfolgreich"))
    .catch(error => console.error("Logout Fehler:", error.message));
});
