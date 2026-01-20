const firebaseConfig = {
  apiKey: "DEINE_API_KEY",
  authDomain: "DEIN_PROJECT.firebaseapp.com",
  databaseURL: "https://DEIN_PROJECT.firebaseio.com",
  projectId: "DEIN_PROJECT",
  storageBucket: "DEIN_PROJECT.appspot.com",
  messagingSenderId: "DEINE_ID",
  appId: "DEIN_APP_ID"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.database();

const loginScreen = document.getElementById("login-screen");
const mainApp = document.getElementById("main-app");
const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");

loginBtn.addEventListener("click", () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      loginScreen.style.display = "none";
      mainApp.style.display = "block";
    })
    .catch(err => alert(err.message));
});

registerBtn.addEventListener("click", () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      loginScreen.style.display = "none";
      mainApp.style.display = "block";
      const uid = auth.currentUser.uid;
      db.ref("users/" + uid).set({
        calendar: [],
        routines: [],
        todos: []
      });
    })
    .catch(err => alert(err.message));
});

/* Navigation */
const buttons = document.querySelectorAll(".bottom-nav button");
const screens = document.querySelectorAll(".screen");

buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    buttons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    screens.forEach(s => s.classList.remove("active"));
    document.getElementById(btn.dataset.screen + "-screen").classList.add("active");
  });
});
