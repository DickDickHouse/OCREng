const VERSION = "v32-custom-path";
const versionEl = document.getElementById("version");
if (versionEl) versionEl.textContent = `版本：${VERSION}`;

const BOARD_ROWS = 15;
const BOARD_COLS = 15;

function xyToIndex(x, y) {
  const col = x - 1;
  const row = y - 1;
  return row * BOARD_COLS + col;
}

const boardCells = [];
for (let r = 0; r < BOARD_ROWS; r++) {
  for (let c = 0; c < BOARD_COLS; c++) {
    boardCells.push({ row: r, col: c, isPath: false, classes: [] });
  }
}

function paintHomeArea(x1, y1, x2, y2, className) {
  for (let y = y1; y <= y2; y++) {
    for (let x = x1; x <= x2; x++) {
      boardCells[xyToIndex(x, y)].classes.push(className);
    }
  }
}
paintHomeArea(1, 1, 3, 3, "cell-home-blue");
paintHomeArea(13, 1, 15, 3, "cell-home-red");
paintHomeArea(1, 13, 3, 15, "cell-home-green");
paintHomeArea(13, 13, 15, 15, "cell-home-yellow");

const centerCells = [
  [7,7],[8,7],[9,7],
  [7,8],[8,8],[9,8],
  [7,9],[8,9],[9,9],
];
centerCells.forEach(([x,y]) => {
  let cls = "center-core";
  if (x === 8 && y === 7) cls = "center-red";
  else if (x === 9 && y === 8) cls = "center-yellow";
  else if (x === 8 && y === 9) cls = "center-green";
  else if (x === 7 && y === 8) cls = "center-blue";
  boardCells[xyToIndex(x,y)].classes.push(cls);
});

const basePathWithColor = [
  [5,1,"yellow"], [6,1,"green"], [7,1,"blue"], [8,1,"red"], [9,1,"yellow"], [10,1,"green"],
  [11,1,"blue"], [11,2,"red"], [11,3,"yellow"], [11,4,"green"], [12,5,"blue"], [13,5,"red"],
  [14,5,"yellow"], [15,5,"green"], [15,6,"blue"], [15,7,"red"], [15,8,"yellow"], [15,9,"green"],
  [15,10,"blue"], [15,11,"red"], [14,11,"yellow"], [13,11,"green"], [12,11,"blue"], [11,12,"red"],
  [11,13,"yellow"], [11,14,"green"], [11,15,"blue"], [10,15,"red"], [9,15,"yellow"], [8,15,"green"],
  [7,15,"blue"], [6,15,"red"], [5,15,"yellow"], [5,14,"green"], [5,13,"blue"], [5,12,"red"],
  [4,11,"yellow"], [3,11,"green"], [2,11,"blue"], [1,11,"red"], [1,10,"yellow"], [1,9,"green"],
  [1,8,"blue"], [1,7,"red"], [1,6,"yellow"], [1,5,"green"], [2,5,"blue"], [3,5,"red"],
  [4,5,"yellow"], [5,4,"green"], [5,3,"blue"], [5,2,"red"]
];

const basePath = [];
const baseIndexByCell = new Map();

basePathWithColor.forEach(([x,y,color]) => {
  const idx = xyToIndex(x,y);
  baseIndexByCell.set(idx, basePath.length);
  basePath.push(idx);

  boardCells[idx].isPath = true;
  boardCells[idx].classes.push("cell-path", `cell-path-${color}`);
});

const PATH_LENGTH = basePath.length;

const startCellsXY = {
  blue: [1,4],
  red: [12,1],
  green: [4,15],
  yellow: [12,15],
};
const startCells = {
  blue: xyToIndex(...startCellsXY.blue),
  red: xyToIndex(...startCellsXY.red),
  green: xyToIndex(...startCellsXY.green),
  yellow: xyToIndex(...startCellsXY.yellow),
};
boardCells[startCells.blue].classes.push("start-blue");
boardCells[startCells.red].classes.push("start-red");
boardCells[startCells.green].classes.push("start-green");
boardCells[startCells.yellow].classes.push("start-yellow");

const startStepXY = {
  blue: [1,5],
  red: [11,1],
  green: [5,15],
  yellow: [11,15],
};
const playerStartIndex = {
  blue: baseIndexByCell.get(xyToIndex(...startStepXY.blue)),
  red: baseIndexByCell.get(xyToIndex(...startStepXY.red)),
  green: baseIndexByCell.get(xyToIndex(...startStepXY.green)),
  yellow: baseIndexByCell.get(xyToIndex(...startStepXY.yellow)),
};

function lineCoords(x1,y1,x2,y2) {
  const coords = [];
  if (x1 === x2) {
    const step = y1 <= y2 ? 1 : -1;
    for (let y = y1; y !== y2 + step; y += step) coords.push([x1,y]);
  } else if (y1 === y2) {
    const step = x1 <= x2 ? 1 : -1;
    for (let x = x1; x !== x2 + step; x += step) coords.push([x,y1]);
  }
  return coords;
}

const homePaths = {
  red:   lineCoords(8,1,8,7).map(([x,y]) => xyToIndex(x,y)),
  yellow:lineCoords(15,8,9,8).map(([x,y]) => xyToIndex(x,y)),
  green: lineCoords(8,15,8,9).map(([x,y]) => xyToIndex(x,y)),
  blue:  lineCoords(1,8,7,8).map(([x,y]) => xyToIndex(x,y)),
};
homePaths.blue.forEach(i => boardCells[i].classes.push("cell-homepath-blue"));
homePaths.green.forEach(i => boardCells[i].classes.push("cell-homepath-green"));
homePaths.red.forEach(i => boardCells[i].classes.push("cell-homepath-red"));
homePaths.yellow.forEach(i => boardCells[i].classes.push("cell-homepath-yellow"));

// 飛行隧道 → 黃色箭頭移到 (4,11) 且向上
const flySquares = {
  yellow: { from: xyToIndex(4,11), to: xyToIndex(4,10), dir: "fly-up" },
  green:  { from: xyToIndex(5,4),  to: xyToIndex(11,4), dir: "fly-right" },
  blue:   { from: xyToIndex(12,5), to: xyToIndex(12,11), dir: "fly-down" },
  red:    { from: xyToIndex(11,12),to: xyToIndex(5,12), dir: "fly-left" },
};
Object.values(flySquares).forEach(f => boardCells[f.from].classes.push(f.dir));

const jumpPairs = [
  [4,5,5,4],
  [11,4,12,5],
  [12,11,11,12],
  [5,12,4,11],
];
jumpPairs.forEach(([x1,y1,x2,y2]) => {
  boardCells[xyToIndex(x1,y1)].classes.push("cell-jump");
  boardCells[xyToIndex(x2,y2)].classes.push("cell-jump");
});

boardCells[xyToIndex(5,5)].classes.push("cell-split-55");
boardCells[xyToIndex(11,5)].classes.push("cell-split-115");
boardCells[xyToIndex(11,11)].classes.push("cell-split-1111");
boardCells[xyToIndex(5,11)].classes.push("cell-split-511");

boardCells[xyToIndex(4,5)].classes.push("cell-extend-45");
boardCells[xyToIndex(5,4)].classes.push("cell-extend-54");
boardCells[xyToIndex(11,4)].classes.push("cell-extend-114");
boardCells[xyToIndex(12,5)].classes.push("cell-extend-125");
boardCells[xyToIndex(12,11)].classes.push("cell-extend-1211");
boardCells[xyToIndex(11,12)].classes.push("cell-extend-1112");
boardCells[xyToIndex(4,11)].classes.push("cell-extend-411");
boardCells[xyToIndex(5,12)].classes.push("cell-extend-512");

// 單邊虛線
boardCells[xyToIndex(4,4)].classes.push("edge-dash-right");
boardCells[xyToIndex(5,4)].classes.push("edge-dash-left");

boardCells[xyToIndex(5,5)].classes.push("edge-dash-bottom");
boardCells[xyToIndex(5,6)].classes.push("edge-dash-top");

boardCells[xyToIndex(5,5)].classes.push("edge-dash-right");
boardCells[xyToIndex(6,5)].classes.push("edge-dash-left");

boardCells[xyToIndex(11,11)].classes.push("edge-dash-top");
boardCells[xyToIndex(11,10)].classes.push("edge-dash-bottom");

boardCells[xyToIndex(11,11)].classes.push("edge-dash-left");
boardCells[xyToIndex(10,11)].classes.push("edge-dash-right");

boardCells[xyToIndex(11,12)].classes.push("edge-dash-left");
boardCells[xyToIndex(10,12)].classes.push("edge-dash-right");

boardCells[xyToIndex(11,4)].classes.push("edge-dash-left");
boardCells[xyToIndex(10,4)].classes.push("edge-dash-right");

boardCells[xyToIndex(11,5)].classes.push("edge-dash-left");
boardCells[xyToIndex(10,5)].classes.push("edge-dash-right");

boardCells[xyToIndex(5,11)].classes.push("edge-dash-top");
boardCells[xyToIndex(5,10)].classes.push("edge-dash-bottom");

boardCells[xyToIndex(5,12)].classes.push("edge-dash-left");
boardCells[xyToIndex(4,12)].classes.push("edge-dash-right");

// ====== 其餘邏輯 ======
const safeCells = new Set([
  startCells.blue, startCells.green, startCells.red, startCells.yellow,
  flySquares.blue.from, flySquares.green.from, flySquares.red.from, flySquares.yellow.from,
]);

const playerPaths = {};
Object.keys(startCells).forEach((color) => {
  const startIndex = playerStartIndex[color];
  const rotated = basePath.slice(startIndex).concat(basePath.slice(0, startIndex));
  playerPaths[color] = rotated.concat(homePaths[color]);
});

function baseIndexToProgress(color, baseIndex) {
  return (baseIndex - playerStartIndex[color] + basePath.length) % basePath.length;
}

// 玩家資料與遊戲邏輯（與你原本一致）
function homeList(x1,y1,x2,y2) {
  const list = [];
  for (let y = y1; y <= y2; y++) {
    for (let x = x1; x <= x2; x++) list.push(xyToIndex(x,y));
  }
  return list;
}
const homePositionsFull = {
  blue:  homeList(1,1,3,3),
  red:   homeList(13,1,15,3),
  green: homeList(1,13,3,15),
  yellow:homeList(13,13,15,15),
};
const homePositions = {
  blue:  homePositionsFull.blue.slice(0,4),
  red:   homePositionsFull.red.slice(0,4),
  green: homePositionsFull.green.slice(0,4),
  yellow:homePositionsFull.yellow.slice(0,4),
};

const players = [
  { id:0, name:"紅方", color:"red", colorClass:"red", pieces: Array.from({length:4}, (_,i)=>({status:"home", homeIndex:i, progress:0})) },
  { id:1, name:"藍方", color:"blue", colorClass:"blue", pieces: Array.from({length:4}, (_,i)=>({status:"home", homeIndex:i, progress:0})) },
  { id:2, name:"綠方", color:"green", colorClass:"green", pieces: Array.from({length:4}, (_,i)=>({status:"home", homeIndex:i, progress:0})) },
  { id:3, name:"黃方", color:"yellow", colorClass:"yellow", pieces: Array.from({length:4}, (_,i)=>({status:"home", homeIndex:i, progress:0})) },
];

let currentPlayerIndex = 0;
let gameEnded = false;
let isAnimating = false;

const boardEl = document.getElementById("board");
const currentPlayerNameEl = document.getElementById("current-player-name");
const diceResultEl = document.getElementById("dice-result");
const statusEl = document.getElementById("status");
const rollButton = document.getElementById("roll-button");
const resetButton = document.getElementById("reset-button");

function getPieceCellIndex(player, piece) {
  if (piece.status === "home") return homePositions[player.color][piece.homeIndex];
  if (piece.progress === 0) return startCells[player.color];
  return playerPaths[player.color][piece.progress - 1];
}

function initBoard() {
  boardEl.innerHTML = "";
  boardEl.style.gridTemplateColumns = `repeat(${BOARD_COLS}, 26px)`;
  boardEl.style.gridTemplateRows = `repeat(${BOARD_ROWS}, 26px)`;

  boardCells.forEach((cellData) => {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cellData.classes.forEach((cls) => cell.classList.add(cls));
    boardEl.appendChild(cell);
  });
}

function renderPieces() {
  const cells = boardEl.getElementsByClassName("cell");
  for (let cell of cells) {
    const old = cell.querySelector(".pieces-container");
    if (old) cell.removeChild(old);
  }

  const cellPiecesMap = new Map();
  players.forEach((player) => {
    player.pieces.forEach((piece) => {
      const cellIndex = getPieceCellIndex(player, piece);
      if (!cellPiecesMap.has(cellIndex)) cellPiecesMap.set(cellIndex, []);
      cellPiecesMap.get(cellIndex).push(player);
    });
  });

  cellPiecesMap.forEach((list, cellIndex) => {
    const cell = cells[cellIndex];
    const container = document.createElement("div");
    container.className = "pieces-container";

    list.forEach((player) => {
      const pieceEl = document.createElement("div");
      pieceEl.className = `piece ${player.colorClass}`;
      container.appendChild(pieceEl);
    });

    cell.appendChild(container);
  });
}

function randomDice() {
  return Math.floor(Math.random() * 6) + 1;
}

function animateMovePiece(player, piece, targetProgress, onComplete) {
  const start = piece.progress;
  const end = targetProgress;
  if (end <= start) { onComplete && onComplete(); return; }

  let current = start;
  const stepTime = 250;

  function moveOne() {
    current += 1;
    piece.progress = current;
    renderPieces();

    if (current < end) setTimeout(moveOne, stepTime);
    else onComplete && onComplete();
  }

  moveOne();
}

function applyFlyAndCapture(player, piece) {
  const color = player.color;

  if (piece.progress > 0 && piece.progress <= PATH_LENGTH) {
    const cellIndex = playerPaths[color][piece.progress - 1];
    const fly = flySquares[color];
    if (fly && cellIndex === fly.from) {
      const targetIndex = baseIndexByCell.get(fly.to);
      if (targetIndex !== undefined) {
        piece.progress = baseIndexToProgress(color, targetIndex) + 1;
        renderPieces();
      }
    }
  }

  if (piece.progress > 0 && piece.progress <= PATH_LENGTH) {
    const cellIndex = playerPaths[color][piece.progress - 1];
    if (!safeCells.has(cellIndex)) {
      players.forEach((op) => {
        if (op.color === color) return;
        op.pieces.forEach((opPiece) => {
          if (opPiece.status === "home") return;
          const opCell = getPieceCellIndex(op, opPiece);
          if (opCell === cellIndex) {
            opPiece.status = "home";
            opPiece.progress = 0;
          }
        });
      });
    }
  }

  renderPieces();
}

function performMoveWithRules(player, dice, done) {
  const maxProgress = playerPaths[player.color].length;

  const homePiece = player.pieces.find(p => p.status === "home");
  const trackPiece = player.pieces.find(p => p.status !== "home");

  if (dice === 6 && homePiece) {
    homePiece.status = "track";
    homePiece.progress = 0;
    renderPieces();
    done();
    return;
  }

  if (trackPiece) {
    const target = trackPiece.progress + dice;
    if (target > maxProgress) { done(); return; }
    animateMovePiece(player, trackPiece, target, () => {
      applyFlyAndCapture(player, trackPiece);
      if (trackPiece.progress === maxProgress) {
        gameEnded = true;
        statusEl.textContent = `${player.name} 抵達終點，獲勝！`;
        rollButton.disabled = true;
      }
      done();
    });
    return;
  }

  done();
}

function updateCurrentPlayerDisplay() {
  const p = players[currentPlayerIndex];
  currentPlayerNameEl.textContent = p.name;

  currentPlayerNameEl.classList.remove(
    "player-red","player-blue","player-green","player-yellow"
  );
  if (p.color === "red") currentPlayerNameEl.classList.add("player-red");
  if (p.color === "blue") currentPlayerNameEl.classList.add("player-blue");
  if (p.color === "green") currentPlayerNameEl.classList.add("player-green");
  if (p.color === "yellow") currentPlayerNameEl.classList.add("player-yellow");
}

function handleTurn() {
  if (gameEnded || isAnimating) return;

  const player = players[currentPlayerIndex];
  isAnimating = true;
  rollButton.disabled = true;

  const dice = randomDice();
  diceResultEl.textContent = dice.toString();

  performMoveWithRules(player, dice, () => {
    isAnimating = false;
    if (!gameEnded) {
      currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
      updateCurrentPlayerDisplay();
      rollButton.disabled = false;
    }
  });
}

function initGame() {
  players.forEach((player) => {
    player.pieces.forEach((p, i) => {
      p.status = "home";
      p.homeIndex = i;
      p.progress = 0;
    });
  });

  currentPlayerIndex = 0;
  gameEnded = false;
  isAnimating = false;

  initBoard();
  renderPieces();
  updateCurrentPlayerDisplay();
  statusEl.textContent = "";
}

rollButton.addEventListener("click", handleTurn);
resetButton.addEventListener("click", initGame);
window.addEventListener("load", initGame);
```

---

# ✅ style.css（完整）
````css name=style.css
body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  margin: 16px;
  text-align: center;
  background-color: #f0f2f5;
}

h1 { margin-bottom: 12px; }

#controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  align-items: center;
  margin-bottom: 8px;
}

.info-block {
  background-color: #ffffff;
  padding: 6px 10px;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  font-size: 14px;
}

#current-player-name { font-weight: bold; }

.player-red { color: #ff4d4f; }
.player-blue { color: #1890ff; }
.player-green { color: #52c41a; }
.player-yellow { color: #faad14; }

.button-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.button-block button {
  padding: 6px 12px;
  font-size: 14px;
  border-radius: 4px;
  border: none;
}

#roll-button { background-color: #1890ff; color: #fff; }
#roll-button:disabled { background-color: #d9d9d9; color: #888; }

#reset-button { background-color: #52c41a; color: #fff; }

#status { margin: 4px 0; min-height: 20px; color: #333; font-size: 14px; }
#dice-result { font-weight: bold; font-size: 18px; }

#version {
  color: #d00;
  font-weight: bold;
  margin-bottom: 6px;
}

#board-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}

#board {
  display: grid;
  grid-template-columns: repeat(15, 26px);
  grid-template-rows: repeat(15, 26px);
  gap: 2px;
  margin: 0 auto;
  padding: 10px;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.18);
}

.cell {
  width: 26px;
  height: 26px;
  border: 1px solid #d9d9d9;
  position: relative;
  background-color: #fafafa;
}

/* 主路 */
.cell-path { background-color: #e0e0e0; }
.cell-path-red { background-color: #ffcccc; }
.cell-path-blue { background-color: #cce3ff; }
.cell-path-green { background-color: #ccffd7; }
.cell-path-yellow { background-color: #ffe6b8; }

/* 跳棋顯示 */
.cell-jump {
  outline: none;
  outline-offset: 0;
}
.cell-jump::after {
  content: "跳";
  position: absolute;
  top: 1px;
  left: 2px;
  font-size: 10px;
  color: #555;
}

/* 斜切格 */
.cell-split-55 { background: linear-gradient(45deg, #ffe6b8 0 50%, #ccffd7 50% 100%); }
.cell-split-115 { background: linear-gradient(135deg, #ccffd7 0 50%, #cce3ff 50% 100%); }
.cell-split-1111 { background: linear-gradient(45deg, #ffcccc 0 50%, #cce3ff 50% 100%); }
.cell-split-511 { background: linear-gradient(135deg, #ffe6b8 0 50%, #ffcccc 50% 100%); }

/* 虛線分割線 */
.cell-split-55::after,
.cell-split-115::after,
.cell-split-1111::after,
.cell-split-511::after {
  content: "";
  position: absolute;
  inset: 2px;
  border-top: 2px dashed #333;
  transform-origin: center;
}
.cell-split-55::after, .cell-split-1111::after { transform: rotate(45deg); }
.cell-split-115::after, .cell-split-511::after { transform: rotate(-45deg); }

/* 梯形虛線框 */
.cell-extend-45::before,
.cell-extend-54::before,
.cell-extend-114::before,
.cell-extend-125::before,
.cell-extend-1211::before,
.cell-extend-1112::before,
.cell-extend-411::before,
.cell-extend-512::before {
  content: "";
  position: absolute;
  box-sizing: border-box;
  border: 2px dashed #333;
  pointer-events: none;
}
.cell-extend-45::before { left: 0; top: 0; width: calc(200% + 2px); height: 100%; clip-path: polygon(0 0, 50% 0, 100% 100%, 0 100%); }
.cell-extend-54::before { left: 0; top: 0; width: 100%; height: calc(200% + 2px); clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 100%); }
.cell-extend-114::before { left: 0; top: 0; width: 100%; height: calc(200% + 2px); clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 100%); }
.cell-extend-125::before { left: calc(-100% - 2px); top: 0; width: calc(200% + 2px); height: 100%; clip-path: polygon(50% 0, 100% 0, 100% 100%, 0 100%); }
.cell-extend-1211::before { left: calc(-100% - 2px); top: 0; width: calc(200% + 2px); height: 100%; clip-path: polygon(50% 0, 100% 0, 100% 100%, 0 100%); }
.cell-extend-1112::before { left: 0; top: calc(-100% - 2px); width: 100%; height: calc(200% + 2px); clip-path: polygon(50% 0, 100% 0, 100% 100%, 0 100%); }
.cell-extend-411::before { left: 0; top: 0; width: calc(200% + 2px); height: 100%; clip-path: polygon(0 0, 50% 0, 100% 100%, 0 100%); }
.cell-extend-512::before { left: 0; top: calc(-100% - 2px); width: 100%; height: calc(200% + 2px); clip-path: polygon(50% 0, 100% 0, 100% 100%, 0 100%); }

/* 單邊虛線 */
.edge-dash-right::after,
.edge-dash-left::after,
.edge-dash-top::after,
.edge-dash-bottom::after {
  content: "";
  position: absolute;
  pointer-events: none;
}
.edge-dash-right::after { top: 2px; bottom: 2px; right: -1px; width: 0; border-right: 2px dashed #333; }
.edge-dash-left::after { top: 2px; bottom: 2px; left: -1px; width: 0; border-left: 2px dashed #333; }
.edge-dash-top::after { left: 2px; right: 2px; top: -1px; height: 0; border-top: 2px dashed #333; }
.edge-dash-bottom::after { left: 2px; right: 2px; bottom: -1px; height: 0; border-bottom: 2px dashed #333; }

/* 其他樣式 */
.cell-homepath-red { background-color: #ffb3b3; }
.cell-homepath-blue { background-color: #b3d9ff; }
.cell-homepath-green { background-color: #b3ffb3; }
.cell-homepath-yellow { background-color: #ffe0a3; }

.cell-home-red { background-color: #ffd6d6; }
.cell-home-blue { background-color: #d6e8ff; }
.cell-home-green { background-color: #d7ffd6; }
.cell-home-yellow { background-color: #ffe7ba; }

.center-blue { background-color: #b3d9ff; }
.center-green { background-color: #b3ffb3; }
.center-red { background-color: #ffb3b3; }
.center-yellow { background-color: #ffe0a3; }
.center-core { background-color: #ffffff; }

.start-red::after,
.start-blue::after,
.start-green::after,
.start-yellow::after {
  content: "";
  position: absolute;
  inset: 5px;
  border-radius: 50%;
  border: 2px solid #555;
  background-color: #fff;
}
.start-red::after { border-color: #ff4d4f; }
.start-blue::after { border-color: #1890ff; }
.start-green::after { border-color: #52c41a; }
.start-yellow::after { border-color: #faad14; }

.fly-up::after,
.fly-down::after,
.fly-left::after,
.fly-right::after {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
  color: #333;
}
.fly-up::after { content: "↑"; }
.fly-down::after { content: "↓"; }
.fly-left::after { content: "←"; }
.fly-right::after { content: "→"; }

.pieces-container {
  position: absolute;
  inset: 2px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
}

.piece {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  margin: auto;
  box-shadow: 0 0 2px rgba(0,0,0,0.4);
}
.piece.red { background-color: #ff4d4f; }
.piece.blue { background-color: #1890ff; }
.piece.green { background-color: #52c41a; }
.piece.yellow { background-color: #faad14; }
