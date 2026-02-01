// FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyA8TpIvsBtQQbH4qGpmNoOiDTpokQBR0NY",
  authDomain: "novamind-gs.firebaseapp.com",
  databaseURL: "https://novamind-gs-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "novamind-gs",
  storageBucket: "novamind-gs.firebasestorage.app",
  messagingSenderId: "278309634253",
  appId: "1:278309634253:web:2c0cb4a88e0e2293192984"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// SCREENS
const loginScreen = document.getElementById("login-screen");
const homeScreen = document.getElementById("home-screen");
const healthScreen = document.getElementById("health-screen");
const settingsScreen = document.getElementById("settings-screen");

// ELEMENTS
const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const logoutBtn = document.getElementById("logout-btn");
const homeCardsContainer = document.getElementById("home-cards");
const healthCardsContainer = document.getElementById("health-cards");
const currentDateEl = document.getElementById("current-date");
const fontSelect = document.getElementById("font-select");
const navButtons = document.querySelectorAll(".nav-btn");

// STATE
let isLoggedIn = false;
let homeCardsData = [
  { type: "tasks", title: "ToDos", tasks: [{ text: "E-Mail beantworten", done: false }, { text: "Meeting vorbereiten", done: false }]},
  { type: "routines", title: "Routinen", tasks: [{ text: "Meditation", done: false }, { text: "Workout", done: false }]},
  { type: "calendar", title: "Kalender", view: "day", tasks: [
      { text: "10:00 Projektbesprechung", done: false },
      { text: "15:30 Arzttermin", done: false }
    ]},
  { type: "motivation", title: "Motivation", quote: "Du schaffst alles, was du dir vornimmst!"}
];

let healthData = {
  entries: [], // jeder Eintrag: {date, time, painLevel, painType, painOther, meds:[{name,hours}], notes}
  supplements: [] // jeder Eintrag: {name, time, taken}
};

// DATUM
function updateDate() {
  const now = new Date();
  const options = { weekday:"short", day:"numeric", month:"short", year:"numeric"};
  currentDateEl.textContent = now.toLocaleDateString("de-DE", options);
}

// HOME-CARDS RENDER
function renderHomeCards() {
  homeCardsContainer.innerHTML = "";
  homeCardsData.forEach((card,index)=>{
    const div = document.createElement("div");
    div.classList.add("home-card");
    div.dataset.index = index;
    const title = document.createElement("div");
    title.classList.add("card-title");
    title.textContent = card.title;
    div.appendChild(title);

    const content = document.createElement("div");
    content.classList.add("card-content");

    if(card.type==="calendar"){
      const iconBar = document.createElement("div");
      iconBar.classList.add("calendar-view-icons");
      ["month","week","day"].forEach(v=>{
        const btn=document.createElement("button");
        btn.innerHTML=v==="month"? "▦": v==="week"? "▮▮▮▮▮▮▮":"▬▬▬▬▬";
        btn.classList.toggle("active",card.view===v);
        btn.addEventListener("click",()=>{card.view=v; renderHomeCards();});
        iconBar.appendChild(btn);
      });
      div.appendChild(iconBar);

      if(card.view==="day"){
        for(let i=0;i<24;i++){
          const hourDiv=document.createElement("div");
          hourDiv.textContent=`${i}:00 - ${i+1}:00`;
          content.appendChild(hourDiv);
        }
      }else if(card.view==="week"){
        const weekDiv=document.createElement("div");
        weekDiv.style.display="flex"; weekDiv.style.gap="2px";
        for(let i=0;i<7;i++){
          const dayCol=document.createElement("div");
          dayCol.style.flex="1"; dayCol.style.border="1px solid rgba(255,255,255,0.3)"; dayCol.style.height="80px";
          weekDiv.appendChild(dayCol);
        }
        content.appendChild(weekDiv);
      }else{
        const monthDiv=document.createElement("div");
        monthDiv.style.display="grid"; monthDiv.style.gridTemplateColumns="repeat(7,1fr)"; monthDiv.style.gap="2px";
        for(let i=0;i<30;i++){
          const dayCell=document.createElement("div");
          dayCell.style.border="1px solid rgba(255,255,255,0.3)"; dayCell.style.height="40px";
          monthDiv.appendChild(dayCell);
        }
        content.appendChild(monthDiv);
      }

    }else if(card.type==="motivation"){
      content.classList.add("motivation-card");
      content.textContent=card.quote;
    }else{
      card.tasks.forEach(task=>{
        const taskDiv=document.createElement("div");
        taskDiv.classList.add("card-task");
        if(task.done) taskDiv.classList.add("completed");
        const checkbox=document.createElement("input");
        checkbox.type="checkbox"; checkbox.checked=task.done;
        checkbox.addEventListener("change",()=>{task.done=checkbox.checked; taskDiv.classList.toggle("completed",task.done);});
        const label=document.createElement("label"); label.textContent=task.text;
        taskDiv.appendChild(checkbox); taskDiv.appendChild(label); content.appendChild(taskDiv);
      });
    }

    div.appendChild(content);
    homeCardsContainer.appendChild(div);
  });

  // DRAG & DROP
  let dragSrcIndex=null;
  homeCardsContainer.querySelectorAll(".home-card").forEach(card=>{
    card.draggable=true;
    card.addEventListener("dragstart",(e)=>{dragSrcIndex=card.dataset.index; e.dataTransfer.effectAllowed="move";});
    card.addEventListener("dragover",(e)=>e.preventDefault());
    card.addEventListener("drop",(e)=>{
      e.preventDefault();
      const targetIndex=card.dataset.index;
      const temp=homeCardsData[dragSrcIndex];
      homeCardsData.splice(dragSrcIndex,1);
      homeCardsData.splice(targetIndex,0,temp);
      renderHomeCards();
    });
  });
}

// HEALTH SCREEN RENDER
function renderHealthScreen(){
  healthCardsContainer.innerHTML="";
  // Schmerz Eintrag Card
  const entryCard=document.createElement("div");
  entryCard.classList.add("health-card");

  // DATE & TIME
  const now=new Date();
  const dateInput=document.createElement("input");
  dateInput.type="date"; dateInput.value=now.toISOString().split("T")[0];
  const timeInput=document.createElement("input");
  timeInput.type="time"; timeInput.value=now.toTimeString().split(" ")[0].slice(0,5);

  const dateTimeContainer=document.createElement("div");
  dateTimeContainer.style.display="flex"; dateTimeContainer.style.gap="8px";
  dateTimeContainer.appendChild(dateInput); dateTimeContainer.appendChild(timeInput);
  entryCard.appendChild(dateTimeContainer);

  // Schmerzstärke Slider
  const painLabel=document.createElement("label"); painLabel.textContent="Schmerzstärke";
  const painSlider=document.createElement("input");
  painSlider.type="range"; painSlider.min="1"; painSlider.max="10"; painSlider.value="1";
  entryCard.appendChild(painLabel); entryCard.appendChild(painSlider);

  // Schmerzart
  const painTypeLabel=document.createElement("label"); painTypeLabel.textContent="Schmerzart";
  const painTypeSelect=document.createElement("select");
  ["Migräne","Kopfschmerz","Sonstige"].forEach(type=>{const opt=document.createElement("option"); opt.value=type; opt.textContent=type; painTypeSelect.appendChild(opt);});
  const painOtherInput=document.createElement("input"); painOtherInput.type="text"; painOtherInput.placeholder="Weitere Schmerzen";
  entryCard.appendChild(painTypeLabel); entryCard.appendChild(painTypeSelect); entryCard.appendChild(painOtherInput);

  // Medikamente
  const medsLabel=document.createElement("label"); medsLabel.textContent="Tabletten genommen";
  const medsContainer=document.createElement("div"); medsContainer.style.display="flex"; medsContainer.style.flexWrap="wrap"; medsContainer.style.gap="4px";
  ["Triptane","Paracetamol","Ibuprofen"].forEach(med=>{
    const btn=document.createElement("button"); btn.textContent=med;
    btn.addEventListener("click",()=>{addMed(med);});
    medsContainer.appendChild(btn);
  });
  const otherMedInput=document.createElement("input"); otherMedInput.type="text"; otherMedInput.placeholder="Weitere Medikamente";
  medsContainer.appendChild(otherMedInput);

  entryCard.appendChild(medsLabel); entryCard.appendChild(medsContainer);

  // Notizen
  const notesLabel=document.createElement("label"); notesLabel.textContent="Notizen";
  const notesInput=document.createElement("textarea"); notesInput.placeholder="Eigene Notizen";
  entryCard.appendChild(notesLabel); entryCard.appendChild(notesInput);

  // Buttons speichern/löschen/PDF
  const btnContainer=document.createElement("div"); btnContainer.style.display="flex"; btnContainer.style.gap="8px";
  const saveBtn=document.createElement("button"); saveBtn.textContent="Speichern"; saveBtn.addEventListener("click",()=>saveEntry());
  const deleteBtn=document.createElement("button"); deleteBtn.textContent="Löschen"; deleteBtn.addEventListener("click",()=>deleteEntry());
  const pdfBtn=document.createElement("button"); pdfBtn.textContent="Export PDF"; pdfBtn.addEventListener("click",()=>exportPDF());
  btnContainer.appendChild(saveBtn); btnContainer.appendChild(deleteBtn); btnContainer.appendChild(pdfBtn);

  entryCard.appendChild(btnContainer);

  healthCardsContainer.appendChild(entryCard);

  function addMed(name){
    if(!otherMedInput.value) return;
    const medName=otherMedInput.value;
    otherMedInput.value="";
  }

  function saveEntry(){
    const entry={
      date:dateInput.value,
      time:timeInput.value,
      painLevel:painSlider.value,
      painType:painTypeSelect.value,
      painOther:painOtherInput.value,
      meds:[], notes:notesInput.value
    };
    healthData.entries.push(entry);
    renderHealthScreen();
  }

  function deleteEntry(){
    healthData.entries.pop();
    renderHealthScreen();
  }

  function exportPDF(){
    alert("PDF-Export (platzhalter)");
  }
}

// NAVIGATION
navButtons.forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
    const target=document.getElementById(btn.dataset.target);
    if(target) target.classList.add("active");
    navButtons.forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    if(btn.dataset.target==="health-screen") renderHealthScreen();
  });
});

// Schriftart
fontSelect.addEventListener("change",()=>{document.body.style.fontFamily=fontSelect.value;});

// UI Update
function updateUI(){
  if(isLoggedIn){
    loginScreen.style.display="none";
    homeScreen.classList.add("active");
    document.querySelector(".bottom-nav").style.display="flex";
    renderHomeCards(); updateDate();
  }else{
    loginScreen.style.display="flex";
    loginScreen.style.opacity=1;
    document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
    document.querySelector(".bottom-nav").style.display="none";
  }
}

// LOGIN / REGISTER
loginBtn.addEventListener("click",()=>{
  const email=document.getElementById("email").value;
  const password=document.getElementById("password").value;
  auth.signInWithEmailAndPassword(email,password)
    .then(()=>{isLoggedIn=true; updateUI();})
    .catch(err=>alert(err.message));
});

registerBtn.addEventListener("click",()=>{
  const email=document.getElementById("email").value;
  const password=document.getElementById("password").value;
  auth.createUserWithEmailAndPassword(email,password)
    .then(()=>{isLoggedIn=true; updateUI();})
    .catch(err=>alert(err.message));
});

// LOGOUT
logoutBtn.addEventListener("click",()=>{auth.signOut();isLoggedIn=false;updateUI();});

// CHECK LOGIN STATE
auth.onAuthStateChanged(user=>{isLoggedIn=!!user; updateUI();});

// INITIAL
updateUI();
