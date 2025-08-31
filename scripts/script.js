document.addEventListener("DOMContentLoaded", () => {

    // dichiarazione dei pulsanti
    const homeButton = document.getElementById("homeButton");
    const settingsButton = document.getElementById("settingsButton");
    const schoolButton = document.getElementById("schoolButton");
    
    //dove portano i movitori
    homeButton.addEventListener("click", () => {
        window.location.href="./homePage.html";
    })
    settingsButton.addEventListener("click", () => {
        window.location.href="./workInProgress.html";
    })
    schoolButton.addEventListener("click", () => {
        window.location.href="./schoolManager.html"
    })

})

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - GRAFICO A TORTA -- COUNTDOWN

const canvas = document.getElementById("pieChart");
const ctx = canvas.getContext("2d");
const rotation = -Math.PI/2;

// date
const startDate = new Date("2025-09-16");
const endDate = new Date("2026-09-30");
const today = new Date();

// calcolo giorni totali e giorni passati
const totalDays = Math.floor((endDate - startDate) / (1000*60*60*24));
let daysPassed = Math.floor((today - startDate) / (1000*60*60*24));
//if(daysPassed < 0) daysPassed = 0;
if(daysPassed > totalDays) daysPassed = totalDays;

// calcolo angoli in radianti
const passedAngle = (daysPassed / totalDays) * 2 * Math.PI;
const remainingAngle = 2 * Math.PI - passedAngle;

// disegno grafico a torta
ctx.clearRect(0,0,canvas.width,canvas.height);
const centerX = canvas.width/2;
const centerY = canvas.height/2;
const radius = 150;

// parte passata (verde → rosso in base al progresso)
ctx.beginPath();
ctx.moveTo(centerX, centerY);
ctx.arc(centerX, centerY, radius, 0 + rotation, passedAngle + rotation);
ctx.closePath();
ctx.fillStyle = "green"; // colore dei giorni passati
ctx.fill();

// parte rimanente
ctx.beginPath();
ctx.moveTo(centerX, centerY);
ctx.arc(centerX, centerY, radius, passedAngle + rotation, 2*Math.PI + rotation);
ctx.closePath();
ctx.fillStyle = "#ddd"; // colore dei giorni futuri
ctx.fill();

const daysRemaining = totalDays - daysPassed;

const infoDiv = document.getElementById("info");
infoDiv.innerHTML = `
  <p><b>Giorni passati:</b> ${daysPassed}</p>
  <p><b>Giorni da sopportare:</b> ${daysRemaining}</p>
  <p><b>Totale giorni:</b> ${totalDays}</p>
`;