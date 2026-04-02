let ms_rows = 30;
let ms_cols = 30;
let ms_minePerc = 0.10; // 0.05 - 0.30
let game_ended = false;

const ms_playground = document.getElementById("playground");

let ms_field = [];

function generateField() {
   game_ended = false;
   ms_field = [];
   
   for (let x = 0; x < ms_cols; x++) {
      let column = [];
      for (let y = 0; y < ms_rows; y++) {
         column.push({
            mine: false,
            revealed: false,
            flagged: false,
            neigbours: 0
         });
      }
      ms_field.push(column);
   }
}

function forEachNeighbour(x, y, callback) {
   for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
         if (dx == 0 && dy == 0) continue;

         const nx = x + dx;
         const ny = y + dy;

         if (nx < 0 || ny < 0 || nx >= ms_cols || ny >= ms_rows) continue;

         callback(nx, ny);
      }
   }
}
function forEachCrossNeighbour(x, y, callback) {
   const directions = [
      [ 0, -1], // up
      [ 0,  1], // down
      [-1,  0], // left
      [ 1,  0]  // right
   ];

   for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;

      if (nx < 0 || ny < 0 || nx >= ms_cols || ny >= ms_rows) continue;

      callback(nx, ny);
   }
}

function generateMines() {
   if (ms_minePerc > 0.30) ms_minePerc = 0.30;  // 30%
   if (ms_minePerc < 0.05) ms_minePerc = 0.05;  //  5%
   const mineCount = (ms_rows * ms_cols)*ms_minePerc;

   let placed = 0;

   while (placed < mineCount) {
      const x = Math.floor(Math.random() * ms_cols);
      const y = Math.floor(Math.random() * ms_rows);

      if (ms_field[x][y].mine) continue;
      if (x === 0 && y === 0)  continue;

      ms_field[x][y].mine = true;
      placed++;

      forEachNeighbour(x, y, (nx, ny) => {
         if (!ms_field[nx][ny].mine) {
            ms_field[nx][ny].neigbours++;
         }
      });
   }
}

function renderCell(x, y, element) {
   if (game_ended) return;
   const cellData = ms_field[x][y];

   element.textContent = "";
   element.innerHTML = "";

   const icon = document.createElement("i");
   icon.classList.add("material-symbols-outlined");
   icon.style.height = '100%';
   icon.style.width  = '100%';
   icon.style.fontSize = 'small';
   icon.style.textAlign = 'center';
   icon.style.alignContent = 'center';

   if (cellData.flagged) {
      icon.textContent = "flag";
      icon.style.color = "#555"

      element.appendChild(icon);
      return;
   }

   if (!cellData.revealed) {
      icon.textContent = "question_mark";
      icon.style.color = "#333"

      element.appendChild(icon);
      return;
   }

   if (cellData.mine) {
      icon.textContent = "bomb";
      icon.style.color = "red";

      element.appendChild(icon);
      return;
   }

   if (cellData.neigbours > 0) {
      element.textContent = cellData.neigbours;
      element.style.fontWeight = "900";

      switch (cellData.neigbours) {
         case 1: element.style.color = "blue"    ; break;
         case 2: element.style.color = "green"   ; break;
         case 3: element.style.color = "red"     ; break;
         case 4: element.style.color = "darkblue"; break;
         case 5: element.style.color = "darkred" ; break;
         case 6: element.style.color = "cyan"    ; break;
         case 7: element.style.color = "black"   ; break;
         case 8: element.style.color = "gray"    ; break;

         default:
            console.log("what?");
            break;
      }
   }
}

function revealAllMines() {
   for (let x = 0; x < ms_cols; x++) {
      for (let y = 0; y < ms_rows; y++) {
         cell = ms_field[x][y];
         if (cell.mine) {
            const selector = `.ms-cell[data-x="${x}"][data-y="${y}"]`;
            const element = document.querySelector(selector);
            
            cell.revealed = true;
            renderCell(x, y, element);
         }
      }
   }

   game_ended = true;
   alert("Hai perso");
}

function handleLeftClick(e) {
   const element = e.currentTarget;

   const x = Number(element.dataset.x);
   const y = Number(element.dataset.y);
   
   const cell = ms_field[x][y];

   if (cell.flagged || cell.revealed) return;

   if (cell.mine) {
      revealAllMines();
      return;
   }

   floodFill(x, y);
}
function handleRightClick(e) {
   e.preventDefault();
   const element = e.currentTarget;

   const x = Number(element.dataset.x);
   const y = Number(element.dataset.y);
   
   const cell = ms_field[x][y];
   if (cell.revealed) return;

   cell.flagged = !cell.flagged;

   renderCell(x, y, element);
}

function floodFill(x, y) {
   const cell = ms_field[x][y];
   if (cell.revealed || cell.flagged) return;

   cell.revealed = true;
   if (cell.mine) return;

   const selector = `.ms-cell[data-x="${x}"][data-y="${y}"]`;
   const element = document.querySelector(selector);

   renderCell(x, y, element);

   checkVictory();

   if (cell.neigbours > 0) return;

   forEachNeighbour(x, y, (nx, ny) => {
      floodFill(nx, ny);
   });
   
}

function generateGrid() {
   if (ms_playground) {
      // clean the old grid
      ms_playground.innerHTML = ``;

      // create the base template
      ms_playground.style.gridTemplateColumns = `repeat(${ms_cols}, 1fr)`;
      ms_playground.style.gridTemplateRows = `repeat(${ms_rows}, 1fr)`;

      // create the base field
      generateField();
      generateMines();
      //logTable();
   
      // fill the grid with cells and get user input
      for (let x = 0; x < ms_cols; x++) {
         for (let y = 0; y < ms_rows; y++) {
            const cell = document.createElement("div");
            cell.classList.add("ms-cell");
            cell.dataset.x = x;
            cell.dataset.y = y;
            ms_playground.appendChild(cell);
            renderCell(x, y, cell);

            cell.addEventListener("click", handleLeftClick);
            cell.addEventListener("contextmenu", handleRightClick);
         }
      }
   }
}
generateGrid();

function checkVictory() {
   let revealedCells = 0;
   let totalSafeCells = ms_rows * ms_cols;

   for (let x = 0; x < ms_cols; x++) {
      for (let y = 0; y < ms_rows; y++) {
         const cell = ms_field[x][y];
         
         if (!cell.mine && cell.revealed) {
            revealedCells++;
         }
         if (cell.mine) {
            totalSafeCells--;
         }
      }
   }
   if (revealedCells === totalSafeCells) {
      game_ended = true;
      alert("HAI VINTO!!")
   }
}

const ms_reset = document.getElementById("ms-resetButton")?.addEventListener("click", () => {
   generateGrid();
})

document.getElementById("ms-minePercentage")?.addEventListener("change", () => {
   value = document.getElementById("ms-minePercentage").value;
   ms_minePerc = value/100;

   document.getElementById("ms-minePercentageLabel").textContent = `Percentuale di mine: ${value}% `;
})
/* COMING SOON
document.getElementById("ms-playgroundWidth")?.addEventListener("change", () => {
   value = document.getElementById("ms-playgroundWidth").value;
   ms_cols = value;

   document.getElementById("ms-playgroundWidthLabel").textContent = `Larghezza: ${ms_cols} colonne `;
})

document.getElementById("ms-playgroundHeight")?.addEventListener("change", () => {
   value = document.getElementById("ms-playgroundHeight").value;
   ms_rows = value;

   document.getElementById("ms-playgroundHeightLabel").textContent = `Altezza: ${ms_rows} righe `;
})
*/
document.getElementById("ms-optionsReset")?.addEventListener("click", () => {
   ms_minePerc = 0.10;
   //ms_cols = 30;
   //ms_rows = 30;

   document.getElementById("ms-minePercentage").value = 10;
   document.getElementById("ms-minePercentageLabel").textContent = `Percentuale di mine: 10% `;
/* COMING SOON
   document.getElementById("ms-playgroundWidth").value = 30;
   document.getElementById("ms-playgroundWidthLabel").textContent = `Larghezza: 30 colonne `;

   document.getElementById("ms-playgroundHeight").value = 30;
   document.getElementById("ms-playgroundHeightLabel").textContent = `Altezza: 30 righe `;
*/
})

/* [DEBUG ONLY] */
function logTable() {
   console.table(
      ms_field.map(row =>
         row.map(c => c.mine ? "M" : c.neigbours)
      )
   );
}
