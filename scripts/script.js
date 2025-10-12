document.addEventListener("DOMContentLoaded", () => {
    
    function updateThemeIcon(){
        const icon = document.querySelector("#theme-toggle i.material-icons");
        if (!icon) return;
        if (document.body.classList.contains("light")) {
            icon.textContent = "sunny"; // sole
        } else {
            icon.textContent = "bedtime"; // luna
        }
    }

    function toggleTheme(){
        document.body.classList.toggle("light");
        localStorage.setItem("theme",
            document.body.classList.contains("light")? "light" : "dark"
        );
        updateThemeIcon();
    }
    // dichiarazione dei pulsanti
    const homeButton = document.getElementById("homeButton");
    const settingsButton = document.getElementById("settingsButton");
    const schoolButton = document.getElementById("schoolButton");
    const loginButton = document.getElementById("loginButton");
    
    //dove portano i movitori
    if (homeButton) homeButton.addEventListener("click", () => {
        window.location.href="/home";
    })
    if (settingsButton) settingsButton.addEventListener("click", () => {
        window.location.href="/settings";
    })
    if (schoolButton) schoolButton.addEventListener("click", () => {
        //window.location.href="/school";
        window.location.href="/maintenance";
    })
    if (loginButton) loginButton.addEventListener("click", () => {
        window.location.href="/workInProgress";
    })

    if (localStorage.getItem("theme") === "light") {
        document.body.classList.add("light");
    }

    updateThemeIcon();

    document.getElementById("theme-toggle")?.addEventListener("click", toggleTheme);



    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - GRAFICO A TORTA -- COUNTDOWN
    
    const canvas = document.getElementById("pieChart");
    if (canvas) {
        const ctx = canvas.getContext("2d");
        const rotation = -Math.PI/2;
        
        // date
        const startDate = new Date("2025-09-15");
        const endDate = new Date("2026-06-06");
        const today = new Date();
        
        // calcolo giorni totali e giorni passati
        const totalDays = Math.floor((endDate - startDate) / (1000*60*60*24));
        let daysPassed = Math.floor((today - startDate) / (1000*60*60*24));
        //if(daysPassed < 0) daysPassed = 0;
        if(daysPassed > totalDays) daysPassed = totalDays;
        
        // calcolo angoli in radianti
        const passedAngle = (daysPassed / totalDays) * 2 * Math.PI;
        //const remainingAngle = 2 * Math.PI - passedAngle;
        
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
        
        // festività
        const holidays = [
            ["lla Festa di Tutti i Santi", "2025-11-01"],
            ["l Patrono di Scandiano", "2025-11-25"],
            ["l'Immacolata Concezione", "2025-12-08"],
            ["lle VACANZE DI NATALE", ["2025-12-24", "2026-01-06"]],
            ["lle VACANZE DI PASQUA", ["2026-04-02", "2026-04-07"]],
            ["lla Liberazione", "2026-04-25"],
            ["lla Festa del Lavoro", "2026-05-01"],
            ["lla Festa della Repubblica", "2026-06-02"],
            ["lla FINE DELLA SCUOLAAAAAA", "2026-06-06"]
        ]

        function countSchoolDays(fromDate, toDate, holidays) {
            let count = 0;

            const singleDays = new Set();

            holidays.forEach(h => {
                const data = h[1];
                if (Array.isArray(data)) {
                    // periodo natalizio o pasquale
                    let d1 = new Date(data[0]);
                    const d2 = new Date(data[1]);
                    while (d1 <= d2) {
                        singleDays.add(d1.toDateString());
                        d1.setDate(d1.getDate() + 1);
                    }
                } else {
                    // altri giorni singoli
                    singleDays.add(new Date(data).toDateString());
                }
            });

            let d = new Date(fromDate);
            while (d <= toDate) {
                const isSunday = d.getDay() === 0;
                const isHoliday = singleDays.has(d.toDateString());

                if (!isSunday && !isHoliday) count++;
                d.setDate(d.getDate() + 1);
            }
            return count;
        }

        const effectiveDaysRemaining = countSchoolDays(startDate, endDate, holidays);

        let nextHoliday = null;
        let daysToHoliday = null;

        for (let i = 0; i < holidays.length; i++) {
            const name = holidays[i][0];
            const date = new Date(holidays[i][1]);
            const diffDays = Math.ceil((date - today) / (1000*60*60*24));

            if (diffDays >= 0) {
                nextHoliday = name;
                daysToHoliday = diffDays;
                break;
            }
        }

        const infoDiv = document.getElementById("info");

        let holidayText = "";
        if (nextHoliday) {
            holidayText = `<p style="text-align:center;"><b>Mancano </b> ${daysToHoliday} <b> giorni </b><br> a${nextHoliday}</p>`;
        } else {
            holidayText = `<p>E' estate!!</p>`;
        }

        infoDiv.innerHTML = `
        <p><b>Giorni passati:</b> ${daysPassed}</p>
        <p><b>Giorni da sopportare:</b> ${effectiveDaysRemaining}</p>
        ${holidayText}
        `;
        //<p><b>Totale giorni:</b> ${totalDays}</p>
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - verifiche

    const popupOverlay = document.getElementById("popup-overlay");
    const aggiungiBtn = document.getElementById("newTestButton");
    const chiudiBtn =   document.getElementById("cancelTest");
    const lista =       document.getElementById("testList");
    const form =        document.getElementById("add-test-form");

    let verifiche = JSON.parse(localStorage.getItem("verifiche")) || [];
    
    function aggiornaLista() {
        lista.innerHTML = ``;

        verifiche.forEach((v, index) => {
            const tipo = v.interrogazione ? "un'interrogazione" : "una verifica";

            const div = document.createElement("div");
            div.className = "testItem";

            const info = document.createElement("span");
            info.textContent = `Il ${v.data} hai ${tipo} di ${v.materia}`;

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

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - TABELLA ORARIO

    const scheduleOverlay   = document.getElementById("schedule-overlay");
    const scheduleBtn       = document.getElementById("newScheduleButton");
    const scheduleFormDiv   = document.getElementById("formRows");
    const mainTable         = document.getElementById("tabellaOrarioMain");

    const giorni    = ["lun", "mar", "mer", "gio", "ven", "sab"];
    const ore       = [1, 2, 3, 4, 5, 6];

    function generaForm() {
        scheduleFormDiv.innerHTML = "";

        ore.forEach((r) => {
            const rowDiv = document.createElement("div");
            rowDiv.className = "row";
            rowDiv.style.display = "flex";
            rowDiv.style.gap     = "5px"
            rowDiv.style.height  = "40px";
            giorni.forEach((g, c) => {
                const select = document.createElement("select");
                select.classList.add("scheduleSelect");
                select.id = `subject-${r}.${c+1}`;
                select.style.flex = "1";
                ["", "Italiano", "Storia", "Inglese", "Matematica", "C. Mate", "Informatica", "Telecom", "TPSI", "Sistemi", "Motoria", "Religione"].forEach(m => {
                    const opt = document.createElement("option");
                    opt.value = m;
                    opt.textContent = m || "---";
                    opt.style = "text-align:center";
                    select.appendChild(opt);
                });
                rowDiv.appendChild(select);
            });
            scheduleFormDiv.appendChild(rowDiv);
        });
    }

    function salvaOrario() {
        const scheduleSelects = scheduleFormDiv.querySelectorAll(".scheduleSelect");
        const orario = {};
        scheduleSelects.forEach(sel => orario[sel.id] = sel.value);
        localStorage.setItem("orario", JSON.stringify(orario));
        caricaOrario();
    }

    function caricaOrario() {
        const orario = JSON.parse(localStorage.getItem("orario")) || {};

        for (let id in orario) {
            const [riga, colonna] = id.match(/\d+/g).map(Number);
            const tableRow = mainTable.rows[riga];
            if (tableRow && tableRow.cells[colonna]) {
                tableRow.cells[colonna].textContent = orario[id] || "";
            }
        }

        scheduleFormDiv.querySelectorAll(".scheduleSelect").forEach(select => {
            if (orario[select.id] !== undefined) select.value = orario[select.id];
        });
    }

    scheduleBtn.addEventListener("click", () => {
        scheduleOverlay.classList.remove("hidden");
        generaForm();
        caricaOrario();
    });

    document.getElementById("saveSchedule").addEventListener("click", e => {
        e.preventDefault();
        salvaOrario();
        scheduleOverlay.classList.add("hidden");
    });

    document.getElementById("cancelSchedule")?.addEventListener("click", e => {
        e.preventDefault();
        scheduleOverlay.classList.add("hidden");
        caricaOrario();
    });

    generaForm();
    caricaOrario();
})
