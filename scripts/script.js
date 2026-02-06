async function loadSettings() {
    const res = await fetch("/api/settings");
    if (!res.ok) return null;
    return await res.json();
}

async function saveSettings(obj) {
    await fetch("/api/settings", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(obj)
    });
}

let isLoggedIn = false;

fetch("/api/me")
    .then(r => r.json())
    .then(data => {
        isLoggedIn = data.logged_in;
    });

document.addEventListener("DOMContentLoaded", () => {

    function updateThemeIcon(){
        const icon = document.querySelector("#theme-toggle i.material-icons");
        const paragraph = document.querySelector("#theme-toggle p.mainParagraph");
        if (!icon) return;
        if (document.body.classList.contains("light")) {
            icon.textContent = "sunny"; // sole
            paragraph.textContent = "Tema chiaro";
        } else {
            icon.textContent = "bedtime"; // luna
            paragraph.textContent = "Tema scuro";
        }
    }

    function toggleTheme(){
        document.body.classList.toggle("light");
        const tema = document.body.classList.contains("light") ? "light" : "dark";
        if (typeof saveSettings === "function") saveSettings({ tema });
        else localStorage.setItem("tema", tema);
        updateThemeIcon();
    }

    if (typeof loadSettings === "function") {
        loadSettings().then(settings => {
            if (settings?.tema === "light") document.body.classList.add("light");
        }).catch(() => {
            if (localStorage.getItem("tema") === "light") document.body.classList.add("light");
        });
    } else if (localStorage.getItem("tema") === "light") {
        document.body.classList.add("light");
    }
    updateThemeIcon();

    document.getElementById("theme-toggle")?.addEventListener("click", toggleTheme);

    // dichiarazione dei pulsanti
    const homeButton = document.getElementById("homeButton");
    const settingsButton = document.getElementById("settingsButton");
    const schoolButton = document.getElementById("schoolButton");
    const loginButton = document.getElementById("loginButton");
    const dashboardButton = document.getElementById("dashboardButton");
    const hiddenPagesButton = document.getElementById("hiddenPagesButton");
    const modifyAccountButton = document.getElementById("modifyAccountButton");
    
    //dove portano i movitori
    if (homeButton) homeButton.addEventListener("click", () => {
        window.location.href="/home";
    })
    if (settingsButton) settingsButton.addEventListener("click", () => {
        window.location.href="/settings";
    })
    if (schoolButton) schoolButton.addEventListener("click", () => {
        window.location.href="/school";
    })
    if (loginButton) loginButton.addEventListener("click", () => {
        window.location.href="/login";
    })
    if (dashboardButton) dashboardButton.addEventListener("click", () => {
        window.location.href ="/dashboard";
    })
    if (hiddenPagesButton) hiddenPagesButton.addEventListener("click", () => {
        window.location.href="/hiddenPages";
    })
    if (modifyAccountButton) modifyAccountButton.addEventListener("click", () => {
        window.location.href="/workInProgress"
    })

    // pagine nascoste
    const hp_error400 = document.getElementById("hp_error400");
    const hp_error403 = document.getElementById("hp_error403");
    const hp_error404 = document.getElementById("hp_error404");
    const hp_error405 = document.getElementById("hp_error405");
    const hp_error5xx = document.getElementById("hp_error5xx");
    const hp_maintenance = document.getElementById("hp_maintenance");
    const hp_workInProgress = document.getElementById("hp_workInProgress");
    const hp_stylecss = document.getElementById("hp_stylecss");
    const hp_scriptjs = document.getElementById("hp_scriptjs");
    const hp_robotstxt = document.getElementById("hp_robotstxt");

    if (hp_error400) hp_error400.addEventListener("click", () => {
        window.location.href="/errors/400";
    })
    if (hp_error403) hp_error403.addEventListener("click", () => {
        window.location.href="/errors/403";
    })
    if (hp_error404) hp_error404.addEventListener("click", () => {
        window.location.href="/errors/404";
    })
    if (hp_error405) hp_error405.addEventListener("click", () => {
        window.location.href="/errors/405";
    })
    if (hp_error5xx) hp_error5xx.addEventListener("click", () => {
        window.location.href="/errors/5xx?code=200&text=Oll+Korrect";
    })
    if (hp_maintenance) hp_maintenance.addEventListener("click", () => {
        window.location.href="/maintenance";
    })
    if (hp_workInProgress) hp_workInProgress.addEventListener("click", () => {
        window.location.href="/workInProgress";
    })
    if (hp_stylecss) hp_stylecss.addEventListener("click", () => {
        window.location.href="/styles/style.css";
    })
    if (hp_scriptjs) hp_scriptjs.addEventListener("click", () => {
        window.location.href="/scripts/script.js";
    })
    if (hp_robotstxt) hp_robotstxt.addEventListener("click", () => {
        window.location.href="/robots.txt";
    })

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - GRAFICO A TORTA -- COUNTDOWN
    
    let percentToShow = -1;

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
        
        // disegno grafico a torta
        ctx.clearRect(0,0,canvas.width,canvas.height);
        const centerX = canvas.width/2;
        const centerY = canvas.height/2;
        const radius = 150;
        
        // parte passata
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
        
        // festività
        const holidays = [
            ["lla Festa di Tutti i Santi", "2025-11-01"],
            ["l Patrono di Scandiano", "2025-11-25"],
            ["ll'Immacolata Concezione", "2025-12-08"],
            ["lle VACANZE DI NATALE", "2025-12-24"],
            ["lla fine delle VACANZE DI NATALE :(", "2026-01-06"],
            ["lle VACANZE DI PASQUA", "2026-04-02"],
            ["lla fine delle VACANZE DI PASQUA", "2026-04-07"],
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
                singleDays.add(new Date(data).toDateString());
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

        const daysToSufferThrough = countSchoolDays(today, endDate, holidays);

        let nextHoliday = null;
        let daysToHoliday = null;

        for (let i = 0; i < holidays.length; i++) {
            const name = holidays[i][0];
            const date = new Date(holidays[i][1]);
            const diffDays = Math.ceil((date - today) / (1000*60*60*24));

            if (diffDays > 0) {
                nextHoliday = name;
                daysToHoliday = diffDays;
                break;
            }
        }

        const infoDiv = document.getElementById("info");

        let holidayText = "";
        if (nextHoliday) {
            if (daysToHoliday == 1) holidayText = `<p style="text-align:center;"><b>Manca </b> ${daysToHoliday} <b> giorno </b><br> a${nextHoliday}</p>`;
            else holidayText = `<p style="text-align:center;"><b>Mancano </b> ${daysToHoliday} <b> giorni </b><br> a${nextHoliday}</p>`;
        } else {
            holidayText = `<p>E' estate!!</p>`;
        }

        infoDiv.innerHTML = `
        <p><b>Giorni passati:</b> ${daysPassed}</p>
        <p><b>Giorni da sopportare:</b> ${daysToSufferThrough}</p>
        ${holidayText}
        `;
        //<p><b>Totale giorni:</b> ${totalDays}</p>

        percentToShow = ((daysPassed / totalDays)*100).toFixed(1);
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - tooltip che segue il cursore

    /* 
        I DID NOT CREATE THIS CODE!!!!! 
        you can find the original tutorial where i copied this part of the code here:
        https://codingartistweb.com/2022/01/div-follow-mouse-cursor-html-css-javascript/
    */
   
    let myDiv = document.getElementById("percentRemaining");
    if (myDiv) {
        //Detect touch device
        function isTouchDevice() {
            try {
                //We try to create TouchEvent. It would fail for desktops and throw error
                document.createEvent("TouchEvent");
                return true;
            } catch (e) {
                return false;
            }
        }
        const move = (e) => {
        //Try, catch to avoid any errors for touch screens (Error thrown when user doesn't move his finger)
        try {
            //PageX and PageY return the position of client's cursor from top left of screen
            var x = !isTouchDevice() ? e.pageX : e.touches[0].pageX;
            var y = !isTouchDevice() ? e.pageY : e.touches[0].pageY;
        } catch (e) {}
        //set left and top of div based on mouse position
        myDiv.style.left = x - 25 + "px";
        myDiv.style.top = y - 50 + "px";
        };
        //For mouse
        document.addEventListener("mousemove", (e) => {
        move(e);
        });
        //For touch
        document.addEventListener("touchmove", (e) => {
        move(e);
        });
        
        // from this point on, resumes my actual work :)
    
        document.getElementById("percentRemaining").innerHTML = `${percentToShow}%`;
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - verifiche

    const popupOverlay = document.getElementById("popup-overlay");
    const aggiungiBtn = document.getElementById("newTestButton");
    const vecchieBtn =  document.getElementById("removeOldTestsButton");
    const chiudiBtn =   document.getElementById("cancelTest");
    const lista =       document.getElementById("testList");
    const form =        document.getElementById("add-test-form");

    let verifiche = [];
    
    function ordinaVerifichePerData() {
        verifiche.sort((a, b) => a.data.localeCompare(b.data));
    }

    if (vecchieBtn) vecchieBtn.addEventListener("click", () => {
        const oggi = new Date().toISOString().split("T")[0];
        
        verifiche.forEach((v, index) => {

            if (v.data < oggiFull) {
                verifiche.splice(index, 1);
                if (typeof saveSettings === "function") saveSettings({ verifiche: JSON.stringify(verifiche) });
                else localStorage.setItem("verifiche", JSON.stringify(verifiche));
                aggiornaLista();
            }
        })  
    });

    function aggiornaLista() {
        if (lista) lista.innerHTML = ``;

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
                if (typeof saveSettings === "function") saveSettings({ verifiche: JSON.stringify(verifiche) });
                else localStorage.setItem("verifiche", JSON.stringify(verifiche));
                aggiornaLista();
            });

            div.appendChild(deleteBtn);
            div.appendChild(info);
            lista.appendChild(div);
        });
    }

    if (typeof loadSettings === "function") {
        loadSettings().then(settings => {
            verifiche = JSON.parse(settings?.verifiche || "[]")
            ordinaVerifichePerData();
            aggiornaLista();
        }).catch(() => {
            verifiche = JSON.parse(localStorage.getItem("verifiche") || "[]");
            ordinaVerifichePerData();
            aggiornaLista();
        });
    } else {
        verifiche = JSON.parse(localStorage.getItem("verifiche") || "[]");
        aggiornaLista();
    }

    function apriPopup() {
        popupOverlay.classList.remove("hidden");
    }
    function chiudiPopup() {
        popupOverlay.classList.add("hidden");
    }

    if (aggiungiBtn) aggiungiBtn.addEventListener("click", apriPopup);
    if (chiudiBtn) chiudiBtn.addEventListener("click", chiudiPopup);

    if (form) form.addEventListener("submit", (e) => {
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
        ordinaVerifichePerData();
        if (typeof saveSettings === "function") saveSettings({ verifiche: JSON.stringify(verifiche) });
        else localStorage.setItem("verifiche", JSON.stringify(verifiche));

        chiudiPopup();

        document.getElementById("testDate").value = "";
        document.getElementById("testSubject").value = "null";
        document.getElementById("interrogazione").checked = false;
    
        aggiornaLista();
    });

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - TABELLA ORARIO

    const scheduleOverlay   = document.getElementById("schedule-overlay");
    const scheduleBtn       = document.getElementById("newScheduleButton");
    const scheduleFormDiv   = document.getElementById("formRows");
    
    let orario = {};
    function caricaOrario() {
        const mainTable = document.getElementById("tabellaOrarioMain");
        if (!mainTable) return;
        
        for (let id in orario) {
            const [row, column] = id.match(/\d+/g).map(Number);
            const tableRow = mainTable.rows[row];
            if (tableRow && tableRow.cells[column])
                tableRow.cells[column].textContent = orario[id] || "";
        }
        
        document.querySelectorAll(".scheduleSelect").forEach(select => {
            if (orario[select.id] !== undefined) select.value = orario[select.id];
        });
    }
    
    function generaForm() {
        if (!scheduleFormDiv) return;
        scheduleFormDiv.innerHTML = "";

        const giorni    = ["lun", "mar", "mer", "gio", "ven", "sab"];
        const ore       = [1, 2, 3, 4, 5, 6];
        
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
                select.addEventListener("change", () => {
                    orario[select.id] = select.value;
                    if (typeof saveSettings === "function") saveSettings({ orario: JSON.stringify(orario) });
                    else localStorage.setItem("orario", JSON.stringify(orario));
                });
            });

            scheduleFormDiv.appendChild(rowDiv);
        });
    }
    
    if (typeof loadSettings === "function") {
        loadSettings().then(settings => {
            orario = JSON.parse(settings?.orario || "{}");
            caricaOrario();
        }).catch(() => {
            orario = JSON.parse(localStorage.getItem("orario") || "{}");
            caricaOrario();
        });
    } else {
        orario = JSON.parse(localStorage.getItem("orario") || "{}");
        caricaOrario();
    }

    function salvaOrario() {
        const scheduleSelects = scheduleFormDiv.querySelectorAll(".scheduleSelect");
        orario = {};
        scheduleSelects.forEach(sel => orario[sel.id] = sel.value);
        
        if (typeof saveSettings === "function") saveSettings({ orario: JSON.stringify(orario) });
        else localStorage.setItem("orario", JSON.stringify(orario));
        caricaOrario();
    }

    if (scheduleBtn) scheduleBtn.addEventListener("click", () => {
        scheduleOverlay.classList.remove("hidden");
        generaForm();
        caricaOrario();
    });

    const saveSchedule = document.getElementById("saveSchedule");

    if (saveSchedule) saveSchedule.addEventListener("click", e => {
        e.preventDefault();
        salvaOrario();
        scheduleOverlay.classList.add("hidden");
    });

    document.getElementById("cancelSchedule")?.addEventListener("click", e => {
        e.preventDefault();
        scheduleOverlay.classList.add("hidden");
        caricaOrario();
    });
})
