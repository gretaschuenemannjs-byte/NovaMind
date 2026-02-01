// --- Home Screen / Navigation (unverändert) ---
const loginScreen=document.getElementById("login-screen");
const homeScreen=document.getElementById("home-screen");
const settingsScreen=document.getElementById("settings-screen");
const loginBtn=document.getElementById("login-btn");
const registerBtn=document.getElementById("register-btn");
const logoutBtn=document.getElementById("logout-btn");
const homeCardsContainer=document.getElementById("home-cards");
const currentDateEl=document.getElementById("current-date");
const fontSelect=document.getElementById("font-select");

const navButtons=document.querySelectorAll(".nav-btn");

let isLoggedIn=false;

// Home-Kacheln Daten
let homeCardsData=[
  { type:"tasks", title:"ToDos", tasks:[{ text:"E-Mail beantworten", done:false },{ text:"Meeting vorbereiten", done:false }]},
  { type:"routines", title:"Routinen", tasks:[{ text:"Meditation", done:false },{ text:"Workout", done:false }]},
  { type:"calendar", title:"Kalender", view:"day", tasks:[{ text:"10:00 Projektbesprechung", done:false },{ text:"15:30 Arzttermin", done:false }]},
  { type:"motivation", title:"Motivation", quote:"Du schaffst alles, was du dir vornimmst!"}
];

// Datum
function updateDate(){
  const now=new Date();
  const options={ weekday:"short", day:"numeric", month:"short", year:"numeric"};
  currentDateEl.textContent=now.toLocaleDateString("de-DE",options);
}

// Home-Kacheln rendern
function renderHomeCards(){
  homeCardsContainer.innerHTML="";
  homeCardsData.forEach((card,index)=>{
    const div=document.createElement("div");
    div.classList.add("home-card");
    div.dataset.index=index;

    const title=document.createElement("div");
    title.classList.add("card-title");
    title.textContent=card.title;
    div.appendChild(title);

    const content=document.createElement("div");
    content.classList.add("card-content");

    if(card.type==="calendar"){
      const iconBar=document.createElement("div");
      iconBar.classList.add("calendar-view-icons");
      const views=["month","week","day"];
      views.forEach(v=>{
        const btn=document.createElement("button");
        btn.innerHTML=v==="month"? "▦": v==="week"? "▮▮▮▮▮▮▮":"▬▬▬▬▬";
        btn.classList.toggle("active", card.view===v);
        btn.addEventListener("click", ()=>{ card.view=v; renderHomeCards(); });
        iconBar.appendChild(btn);
      });
      div.appendChild(iconBar);

      if(card.view==="day"){
        content.innerHTML="";
        for(let i=0;i<24;i++){
          const hourDiv=document.createElement("div");
          hourDiv.textContent=`${i}:00 - ${i+1}:00`;
          content.appendChild(hourDiv);
        }
      } else if(card.view==="week"){
        const weekDiv=document.createElement("div");
        weekDiv.style.display="flex"; weekDiv.style.gap="2px";
        for(let i=0;i<7;i++){
          const dayCol=document.createElement("div");
          dayCol.style.flex="1"; dayCol.style.border="1px solid rgba(255,255,255,0.3)"; dayCol.style.height="80px";
          weekDiv.appendChild(dayCol);
        }
        content.appendChild(weekDiv);
      } else if(card.view==="month"){
        const monthDiv=document.createElement("div");
        monthDiv.style.display="grid"; monthDiv.style.gridTemplateColumns="repeat(7,1fr)"; monthDiv.style.gap="2px";
        for(let i=0;i<30;i++){
          const dayCell=document.createElement("div");
          dayCell.style.border="1px solid rgba(255,255,255,0.3)"; dayCell.style.height="40px";
          monthDiv.appendChild(dayCell);
        }
        content.appendChild(monthDiv);
      }

    } else if(card.type==="motivation"){
      content.classList.add("motivation-card");
      content.textContent=card.quote;
    } else {
      card.tasks.forEach((task)=>{
        const taskDiv=document.createElement("div");
        taskDiv.classList.add("card-task");
        if(task.done) taskDiv.classList.add("completed");
        const checkbox=document.createElement("input");
        checkbox.type="checkbox";
        checkbox.checked=task.done;
        checkbox.addEventListener("change", ()=>{ task.done=checkbox.checked; renderHomeCards(); });
        const label=document.createElement("span");
        label.textContent=task.text;
        taskDiv.appendChild(checkbox);
        taskDiv.appendChild(label);
        content.appendChild(taskDiv);
      });
    }

    div.appendChild(content);
    homeCardsContainer.appendChild(div);
  });
}

updateDate();
renderHomeCards();

// Navigation
navButtons.forEach(btn=>{
  btn.addEventListener("click", ()=>{
    document.querySelector(".screen.active")?.classList.remove("active");
    document.getElementById(btn.dataset.target).classList.add("active");
    navButtons.forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// Schriftart
fontSelect.addEventListener("change", ()=>{ document.body.style.fontFamily=fontSelect.value; });

// --- Logout (Platzhalter, Firebase-Integration später) ---
logoutBtn.addEventListener("click", ()=>{ alert("Logout funktioniert noch nicht, wird später eingebaut."); });

// --- SCHMERZTRACKING ---
const painEntries=[];
const intensityInput=document.getElementById("pain-intensity");
const intensityLabel=document.getElementById("pain-intensity-label");
const typeSelect=document.getElementById("pain-type");
const notesInput=document.getElementById("pain-notes");
const medCheckboxes=document.querySelectorAll(".med-checkbox");
const saveBtn=document.getElementById("pain-save-btn");
const exportBtn=document.getElementById("pain-export-btn");
const calendarContainer=document.getElementById("calendar-entries");

intensityInput.addEventListener("input",()=>{ intensityLabel.textContent=intensityInput.value; });

saveBtn.addEventListener("click",()=>{
  const meds=Array.from(medCheckboxes).filter(c=>c.checked).map(c=>c.value);
  const entry={
    date:new Date().toISOString().split("T")[0],
    intensity:parseInt(intensityInput.value),
    type:typeSelect.value,
    notes:notesInput.value,
    medications:meds
  };
  painEntries.push(entry);
  intensityInput.value=5; intensityLabel.textContent=5; notesInput.value="";
  medCheckboxes.forEach(c=>c.checked=false);
  renderCalendar();
});

exportBtn.addEventListener("click",()=>{
  if(!painEntries.length) return alert("Keine Einträge zum Exportieren");
  let csv="Datum,Schmerzstärke,Typ,Notizen,Medikamente\n";
  painEntries.forEach(e=>{ csv+=`${e.date},${e.intensity},${e.type},"${e.notes}","${e.medications.join(";")}"\n`; });
  const blob=new Blob([csv],{type:"text/csv"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url; a.download=`schmerztagebuch_${new Date().toISOString().split("T")[0]}.csv`; a.click();
  URL.revokeObjectURL(url);
});

function renderCalendar(){
  calendarContainer.innerHTML="";
  for(let i=1;i<=30;i++){
    const dayCell=document.createElement("div");
    dayCell.classList.add("calendar-cell");
    dayCell.innerHTML=`<strong>${i}</strong>`;
    const dayStr=new Date(new Date().getFullYear(),new Date().getMonth(),i).toISOString().split("T")[0];
    const entriesForDay=painEntries.filter(e=>e.date===dayStr);
    entriesForDay.forEach(e=>{
      const div=document.createElement("span");
      div.classList.add("entry",e.type==="Migräne"?"migraine":e.type==="Spannungskopfschmerz"?"tension":"other");
      div.textContent=`Schmerz: ${e.intensity}`;
      dayCell.appendChild(div);
      e.medications.forEach(med=>{
        const medDiv=document.createElement("span");
        medDiv.classList.add("entry","medication");
        medDiv.textContent=med;
        dayCell.appendChild(medDiv);
      });
    });
    calendarContainer.appendChild(dayCell);
  }
}

// --- SUPPLEMENTS / TABLETTENVERWALTUNG ---
const supplementAddBtn=document.getElementById("supplement-add-btn");
const supplementNameInput=document.getElementById("supplement-name");
const supplementTimeInput=document.getElementById("supplement-time");
const supplementListDiv=document.getElementById("supplement-list");
let supplements=[];

supplementAddBtn.addEventListener("click",()=>{
  if(!supplementNameInput.value||!supplementTimeInput.value) return;
  const sup={name:supplementNameInput.value,time:supplementTimeInput.value};
  supplements.push(sup);
  supplementNameInput.value=""; supplementTimeInput.value="";
  renderSupplements();
});

function renderSupplements(){
  supplementListDiv.innerHTML="";
  supplements.forEach((s,i)=>{
    const div=document.createElement("div");
    div.innerHTML=`<span>${s.name} um ${s.time}</span><button onclick="removeSupplement(${i})">X</button>`;
    supplementListDiv.appendChild(div);
  });
}

window.removeSupplement=function(i){
  supplements.splice(i,1);
  renderSupplements();
}
