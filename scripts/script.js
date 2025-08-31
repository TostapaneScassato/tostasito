document.addEventListener("DOMContentLoaded", () => {
    
    function updateThemeIcon(){
        const icon = document.querySelector("#theme-toggle i.material-icons");
        if (!icon) return;
        if (document.body.classList.contains("dark")) {
            icon.textContent = "bedtime"; // luna
        } else {
            icon.textContent = "sunny"; // sole
        }
    }

    function toggleTheme(){
        document.body.classList.toggle("dark");
        localStorage.setItem("theme",
            document.body.classList.contains("dark")? "dark" : "light"
        );
        updateThemeIcon();
    }
    // dichiarazione dei pulsanti
    const homeButton = document.getElementById("homeButton");
    const settingsButton = document.getElementById("settingsButton");
    const schoolButton = document.getElementById("schoolButton");
    
    //dove portano i movitori
    if (homeButton) homeButton.addEventListener("click", () => {
        window.location.href="./homePage.html";
    })
    if (settingsButton) settingsButton.addEventListener("click", () => {
        window.location.href="./Settings.html";
    })
    if (schoolButton) schoolButton.addEventListener("click", () => {
        window.location.href="./schoolManager.html"
    })

    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
    }

    updateThemeIcon();

    document.getElementById("theme-toggle")?.addEventListener("click", toggleTheme);



    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - GRAFICO A TORTA -- COUNTDOWN
    
    const canvas = document.getElementById("pieChart");
    if (canvas) {
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
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - verifiche

    const popupOverlay = document.getElementById("popup-overlay");
    const aggiungiBtn = document.getElementById("newTestButton");
    const popup =       document.getElementById("testPopup");
    const chiudiBtn =   document.getElementById("cancelTest");
    const salvaBtn =    document.getElementById("saveTest");
    const lista =       document.getElementById("testList");
    const form =        document.getElementById("add-test-form");

    let verifiche = JSON.parse(localStorage.getItem("verifiche")) || [];
    
    function aggiornaLista() {
        lista.innerHTML = ``;

        verifiche.forEach((v, index) => {
            const tipo = v.interrogazione ? "Interrogazione" : "Scritta";

            const div = document.createElement("div");
            div.className = "testItem";

            const info = document.createElement("span");
            info.textContent = `${v.data} - ${v.materia} (${tipo})`;

            const deleteBtn = document.createElement("button");
            deleteBtn.className = "deleteTest";
            
            const icon = document.createElement("i");
            icon.className = "material-icons";
            icon.id = "deleteTest";
            icon.textContent = "delete";

            deleteBtn.appendChild(icon);

            deleteBtn.addEventListener("click", () => {
                verifiche.splice(index, 1);
                localStorage.setItem("verifiche", JSON.stringify(verifiche));
                aggiornaLista();
            })

            div.appendChild(deleteBtn);
            div.appendChild(info);
            lista.appendChild(div);
        });
    }

    function apriPopup() {
        popupOverlay.classList.remove("hidden");
    }
    function chiudiPopup() {
        popupOverlay.classList.add("hidden");
    }

    aggiungiBtn.addEventListener("click", apriPopup);
    chiudiBtn.addEventListener("click", chiudiPopup);

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const data = document.getElementById("testDate").value;
        const materia = document.getElementById("testSubject").value;
        const interrogazione = document.getElementById("interrogazione").checked;

        if (!data && materia == "null") {
            alert("Inserisci sia la data che la materia!");
            return;
        } else if (!data) {
            alert("Inserisci la data!");
            return;
        } else if (materia == "null") {
            alert("Inserisci anche la materia!");
            return;
        }
        
        verifiche.push({data, materia, interrogazione});
        localStorage.setItem("verifiche", JSON.stringify(verifiche));

        chiudiPopup();

        document.getElementById("testDate").value = "";
        document.getElementById("testSubject").value = "null";
        document.getElementById("interrogazione").checked = false;
    
        aggiornaLista();
    });
    
    aggiornaLista();
})
