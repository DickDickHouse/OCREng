// ========== 棋盤設定 ==========

const BOARD_ROWS = 15;
const BOARD_COLS = 15;

function rcToIndex(r, c) {
  return r * BOARD_COLS + c;
}

const boardCells = [];
for (let r = 0; r < BOARD_ROWS; r++) {
  for (let c = 0; c < BOARD_COLS; c++) {
    boardCells.push({
      row: r,
      col: c,
      isPath: false,
      classes: [],
    });
  }
}

// 四角家區（2x2）
// 你提供的座標 (1,1)-(2,2) 等等，這裡已轉成 0-based
function paintHomeArea(rStart, cStart, className) {
  for (let r = rStart; r < rStart + 2; r++) {
    for (let c = cStart; c < cStart + 2; c++) {
      boardCells[rcToIndex(r, c)].classes.push(className);
    }
  }
}
paintHomeArea(0, 0, "cell-home-blue");     // 左上藍
paintHomeArea(0, 13, "cell-home-red");     // 右上紅
paintHomeArea(13, 0, "cell-home-green");   // 左下綠
paintHomeArea(13, 13, "cell-home-yellow"); // 右下黃

// 中央 3x3 終點區
const centerCells = [
  [6,6],[6,7],[6,8],
  [7,6],[7,7],[7,8],
  [8,6],[8,7],[8,8],
];
centerCells.forEach(([r,c]) => {
  let cls = "center-core";
  if (r === 6 && c === 7) cls = "center-red";
  else if (r === 8 && c === 7) cls = "center-green";
  else if (r === 7 && c === 6) cls = "center-blue";
  else if (r === 7 && c === 8) cls = "center-yellow";
  boardCells[rcToIndex(r,c)].classes.push(cls);
});

// ========== 簡化路徑（暫時沿用） ==========

const pathIndices = [];

function pushPathCells(coords) {
  coords.forEach(([r,c]) => {
    const idx = rcToIndex(r,c);
    if (!pathIndices.includes(idx)) pathIndices.push(idx);
  });
}
function addColorToCells(coords, cls) {
  coords.forEach(([r,c]) => {
    const idx = rcToIndex(r,c);
    if (!boardCells[idx].classes.includes(cls)) {
      boardCells[idx].classes.push(cls);
    }
  });
}

// 下方紅路
const bottomPath = [
  [10,4],[10,5],[10,6],[10,7],[10,8],[10,9],[10,10]
];
pushPathCells(bottomPath);
addColorToCells(bottomPath, "cell-path-red");

// 右側藍路
const rightPath = [
  [9,10],[8,10],[7,10],[6,10],[5,10],[4,10]
];
pushPathCells(rightPath);
addColorToCells(rightPath, "cell-path-blue");

// 上方綠路
const topPath = [
  [4,10],[4,9],[4,8],[4,7],[4,6],[4,5],[4,4]
];
pushPathCells(topPath);
addColorToCells(topPath, "cell-path-green");

// 左側黃路
const leftPath = [
  [5,4],[6,4],[7,4],[8,4],[9,4]
];
pushPathCells(leftPath);
addColorToCells(leftPath, "cell-path-yellow");

pathIndices.forEach((idx) => {
  boardCells[idx].isPath = true;
  if (!boardCells[idx].classes.includes("cell-path")) {
    boardCells[idx].classes.push("cell-path");
  }
});

const PATH_LENGTH = pathIndices.length;

// 起飛格標記
const startCells = {
  red: rcToIndex(10,4),
  blue: rcToIndex(9,10),
  green: rcToIndex(4,10),
  yellow: rcToIndex(5,4),
};
boardCells[startCells.red].classes.push("start-red");
boardCells[startCells.blue].classes.push("start-blue");
boardCells[startCells.green].classes.push("start-green");
boardCells[startCells.yellow].classes.push("start-yellow");

// 起飛步數（簡化）
const startSteps = {
  red: 0,
  blue: bottomPath.length,
  green: bottomPath.length + rightPath.length,
  yellow: bottomPath.length + rightPath.length + topPath.length
};

// ========== 玩家設定 ==========
// 2x2 家區內的 4 個格子
const homePositions = {
  blue:  [rcToIndex(0,0), rcToIndex(0,1), rcToIndex(1,0), rcToIndex(1,1)],
  red:   [rcToIndex(0,13), rcToIndex(0,14), rcToIndex(1,13), rcToIndex(1,14)],
  green: [rcToIndex(13,0), rcToIndex(13,1), rcToIndex(14,0), rcToIndex(14,1)],
  yellow:[rcToIndex(13,13), rcToIndex(13,14), rcToIndex(14,13), rcToIndex(14,14)],
};

const players = [
  { id:0, name:"紅方", color:"red", colorClass:"red", pieces: Array.from({length:4}, (_,i)=>({status:"home", homeIndex:i, step:0})) },
  { id:1, name:"藍方", color:"blue", colorClass:"blue", pieces: Array.from({length:4}, (_,i)=>({status:"home", homeIndex:i, step:0})) },
  { id:2, name:"綠方", color:"green", colorClass:"green", pieces: Array.from({length:4}, (_,i)=>({status:"home", homeIndex:i, step:0})) },
  { id:3, name:"黃方", color:"yellow", colorClass:"yellow", pieces: Array.from({length:4}, (_,i)=>({status:"home", homeIndex:i, step:0})) },
];

let currentPlayerIndex = 0;
let gameEnded = false;
let isAnimating = false;

// DOM
const boardEl = document.getElementById("board");
const currentPlayerNameEl = document.getElementById("current-player-name");
const diceResultEl = document.getElementById("dice-result");
const statusEl = document.getElementById("status");
const rollButton = document.getElementById("roll-button");
const resetButton = document.getElementById("reset-button");

// ========== 棋盤渲染 ==========

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
    const color = player.color;
    player.pieces.forEach((piece) => {
      let cellIndex = null;

      if (piece.status === "home") {
        const list = homePositions[color];
        if (list && list[piece.homeIndex] !== undefined) {
          cellIndex = list[piece.homeIndex];
        }
      } else if (piece.status === "track") {
        const step = Math.min(piece.step, PATH_LENGTH - 1);
        cellIndex = pathIndices[step];
      }

      if (cellIndex !== null && cellIndex !== undefined) {
        if (!cellPiecesMap.has(cellIndex)) cellPiecesMap.set(cellIndex, []);
        cellPiecesMap.get(cellIndex).push(player);
      }
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

// ========== 擲骰子與移動（保留簡化規則） ==========

function randomDice() {
  return Math.floor(Math.random() * 6) + 1;
}

function animateMovePiece(player, piece, targetStep, onComplete) {
  const start = piece.step;
  const end = targetStep;
  if (end <= start) { onComplete && onComplete(); return; }

  let current = start;
  const stepTime = 300;

  function moveOne() {
    current += 1;
    piece.step = current;
    renderPieces();

    if (current < end) setTimeout(moveOne, stepTime);
    else onComplete && onComplete();
  }

  moveOne();
}

function handleTurn() {
  if (gameEnded || isAnimating) return;

  const player = players[currentPlayerIndex];
  isAnimating = true;
  rollButton.disabled = true;

  const dice = randomDice();
  diceResultEl.textContent = dice.toString();

  performMoveWithLudoRules(player, dice, () => {
    isAnimating = false;
    if (!gameEnded) {
      currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
      updateCurrentPlayerDisplay();
      rollButton.disabled = false;
    }
  });
}

function performMoveWithLudoRules(player, dice, done) {
  const homePiece = player.pieces.find(p => p.status === "home");
  const trackPiece = player.pieces.find(p => p.status === "track");

  if (dice === 6 && homePiece) {
    homePiece.status = "track";
    homePiece.step = startSteps[player.color];
    renderPieces();
    done();
    return;
  }

  if (trackPiece) {
    let targetStep = trackPiece.step + dice;
    if (targetStep >= PATH_LENGTH) targetStep = PATH_LENGTH - 1;
    animateMovePiece(player, trackPiece, targetStep, done);
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

function initGame() {
  players.forEach((player) => {
    player.pieces.forEach((p, i) => {
      p.status = "home";
      p.homeIndex = i;
      p.step = 0;
    });
  });

  currentPlayerIndex = 0;
  gameEnded = false;
  isAnimating = false;

  initBoard();
  renderPieces();
  updateCurrentPlayerDisplay();
}

rollButton.addEventListener("click", handleTurn);
resetButton.addEventListener("click", initGame);
window.addEventListener("load", initGame);
