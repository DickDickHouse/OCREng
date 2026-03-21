const VERSION = "v29-full-rules";
const versionEl = document.getElementById("version");
if (versionEl) versionEl.textContent = `版本：${VERSION}`;

const BOARD_ROWS = 15;
const BOARD_COLS = 15;
function rcToIndex(r, c) { return r * BOARD_COLS + c; }

const boardCells = [];
for (let r = 0; r < BOARD_ROWS; r++) {
  for (let c = 0; c < BOARD_COLS; c++) {
    boardCells.push({ row: r, col: c, isPath: false, classes: [] });
  }
}

// 四角家區（2x2）
function paintHomeArea(rStart, cStart, className) {
  for (let r = rStart; r < rStart + 2; r++) {
    for (let c = cStart; c < cStart + 2; c++) {
      boardCells[rcToIndex(r, c)].classes.push(className);
    }
  }
}
paintHomeArea(0, 0, "cell-home-blue");
paintHomeArea(0, 13, "cell-home-green");
paintHomeArea(13, 0, "cell-home-yellow");
paintHomeArea(13, 13, "cell-home-red");

// 中央 3x3（上綠、右紅、下黃、左藍）
const centerCells = [
  [6,6],[6,7],[6,8],
  [7,6],[7,7],[7,8],
  [8,6],[8,7],[8,8],
];
centerCells.forEach(([r,c]) => {
  let cls = "center-core";
  if (r === 6 && c === 7) cls = "center-green";
  else if (r === 8 && c === 7) cls = "center-yellow";
  else if (r === 7 && c === 6) cls = "center-blue";
  else if (r === 7 && c === 8) cls = "center-red";
  boardCells[rcToIndex(r,c)].classes.push(cls);
});

// ✅ 外圈 52 格（真正外圍一圈，不含四角）
const basePathCoords = [];
for (let c = 1; c <= 13; c++) basePathCoords.push([0, c]);
for (let r = 1; r <= 13; r++) basePathCoords.push([r, 14]);
for (let c = 13; c >= 1; c--) basePathCoords.push([14, c]);
for (let r = 13; r >= 1; r--) basePathCoords.push([r, 0]);

const basePath = [];
const baseIndexByCell = new Map();
basePathCoords.forEach(([r,c]) => {
  const idx = rcToIndex(r,c);
  baseIndexByCell.set(idx, basePath.length);
  basePath.push(idx);
});
const PATH_LENGTH = basePath.length;

// 起飛格（四邊中點）
const startCells = {
  blue: rcToIndex(7,0),
  green: rcToIndex(0,7),
  red: rcToIndex(7,14),
  yellow: rcToIndex(14,7),
};
boardCells[startCells.blue].classes.push("start-blue");
boardCells[startCells.green].classes.push("start-green");
boardCells[startCells.red].classes.push("start-red");
boardCells[startCells.yellow].classes.push("start-yellow");

// 主路顏色分段（每色 13 格）
const colorOrder = ["blue", "green", "red", "yellow"];
const colorClassMap = {
  red: "cell-path-red",
  blue: "cell-path-blue",
  green: "cell-path-green",
  yellow: "cell-path-yellow",
};
colorOrder.forEach((color) => {
  const startIndex = baseIndexByCell.get(startCells[color]);
  for (let i = 0; i < 13; i++) {
    const idx = basePath[(startIndex + i) % basePath.length];
    boardCells[idx].classes.push(colorClassMap[color]);
  }
});
basePath.forEach((idx) => {
  boardCells[idx].isPath = true;
  if (!boardCells[idx].classes.includes("cell-path")) {
    boardCells[idx].classes.push("cell-path");
  }
});

// 終點道（6 格）
const homePaths = {
  blue:  [rcToIndex(7,1), rcToIndex(7,2), rcToIndex(7,3), rcToIndex(7,4), rcToIndex(7,5), rcToIndex(7,6)],
  green: [rcToIndex(1,7), rcToIndex(2,7), rcToIndex(3,7), rcToIndex(4,7), rcToIndex(5,7), rcToIndex(6,7)],
  red:   [rcToIndex(7,13), rcToIndex(7,12), rcToIndex(7,11), rcToIndex(7,10), rcToIndex(7,9), rcToIndex(7,8)],
  yellow:[rcToIndex(13,7), rcToIndex(12,7), rcToIndex(11,7), rcToIndex(10,7), rcToIndex(9,7), rcToIndex(8,7)],
};
homePaths.blue.forEach(i => boardCells[i].classes.push("cell-homepath-blue"));
homePaths.green.forEach(i => boardCells[i].classes.push("cell-homepath-green"));
homePaths.red.forEach(i => boardCells[i].classes.push("cell-homepath-red"));
homePaths.yellow.forEach(i => boardCells[i].classes.push("cell-homepath-yellow"));

// ✅ 飛行格（先放在各色起飛後第 4 格）
function stepIndex(startCell, step) {
  const startIndex = baseIndexByCell.get(startCell);
  return basePath[(startIndex + step) % basePath.length];
}
const flySquares = {
  blue:  { from: stepIndex(startCells.blue, 4), dir: "fly-right", jump: 4 },
  green: { from: stepIndex(startCells.green, 4), dir: "fly-down",  jump: 4 },
  red:   { from: stepIndex(startCells.red, 4), dir: "fly-left",  jump: 4 },
  yellow:{ from: stepIndex(startCells.yellow, 4), dir: "fly-up",   jump: 4 },
};
Object.values(flySquares).forEach(f => boardCells[f.from].classes.push(f.dir));

// 安全格（起飛格 + 飛行格）
const safeCells = new Set([
  startCells.blue, startCells.green, startCells.red, startCells.yellow,
  flySquares.blue.from, flySquares.green.from, flySquares.red.from, flySquares.yellow.from,
]);

// 玩家路徑（主路 + 終點道）
const playerPaths = {};
const playerStartIndex = {};
Object.keys(startCells).forEach((color) => {
  const startIndex = baseIndexByCell.get(startCells[color]);
  playerStartIndex[color] = startIndex;
  const rotated = basePath.slice(startIndex).concat(basePath.slice(0, startIndex));
  playerPaths[color] = rotated.concat(homePaths[color]);
});
function baseIndexToProgress(color, baseIndex) {
  return (baseIndex - playerStartIndex[color] + basePath.length) % basePath.length;
}

// 玩家
const homePositions = {
  blue:  [rcToIndex(0,0), rcToIndex(0,1), rcToIndex(1,0), rcToIndex(1,1)],
  green: [rcToIndex(0,13), rcToIndex(0,14), rcToIndex(1,13), rcToIndex(1,14)],
  yellow:[rcToIndex(13,0), rcToIndex(13,1), rcToIndex(14,0), rcToIndex(14,1)],
  red:   [rcToIndex(13,13), rcToIndex(13,14), rcToIndex(14,13), rcToIndex(14,14)],
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
  return playerPaths[player.color][piece.progress];
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
  const path = playerPaths[color];

  // 飛行
  if (piece.progress < PATH_LENGTH) {
    const cellIndex = path[piece.progress];
    const fly = flySquares[color];
    if (cellIndex === fly.from) {
      piece.progress = Math.min(piece.progress + fly.jump, PATH_LENGTH - 1);
      renderPieces();
    }
  }

  // 吃子（主路、非安全格）
  if (piece.progress < PATH_LENGTH) {
    const cellIndex = path[piece.progress];
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
  const path = playerPaths[player.color];
  const maxIndex = path.length - 1;

  const homePiece = player.pieces.find(p => p.status === "home");
  const trackPiece = player.pieces.find(p => p.status !== "home");

  if (dice === 6 && homePiece) {
    homePiece.status = "track";
    homePiece.progress = 0; // 起飛
    renderPieces();
    applyFlyAndCapture(player, homePiece);
    done();
    return;
  }

  if (trackPiece) {
    const target = trackPiece.progress + dice;
    if (target > maxIndex) { done(); return; }
    animateMovePiece(player, trackPiece, target, () => {
      applyFlyAndCapture(player, trackPiece);
      if (trackPiece.progress === maxIndex) {
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
