// ========== 棋盤設定 ==========

const BOARD_ROWS = 11;
const BOARD_COLS = 11;

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

// 中央十字
for (let c = 0; c < BOARD_COLS; c++) {
  const idx = rcToIndex(5, c);
  boardCells[idx].isPath = true;
  boardCells[idx].classes.push("cell-path");
}
for (let r = 0; r < BOARD_ROWS; r++) {
  const idx = rcToIndex(r, 5);
  boardCells[idx].isPath = true;
  boardCells[idx].classes.push("cell-path");
}

// 四角的家
const homePositions = {
  green: [rcToIndex(0, 0), rcToIndex(0, 1), rcToIndex(1, 0), rcToIndex(1, 1)],
  blue:  [rcToIndex(0, 9), rcToIndex(0,10), rcToIndex(1, 9), rcToIndex(1,10)],
  red:   [rcToIndex(9, 0), rcToIndex(9, 1), rcToIndex(10,0), rcToIndex(10,1)],
  yellow:[rcToIndex(9, 9), rcToIndex(9,10), rcToIndex(10,9), rcToIndex(10,10)],
};

homePositions.green.forEach(i => boardCells[i].classes.push("cell-home-green"));
homePositions.blue.forEach(i  => boardCells[i].classes.push("cell-home-blue"));
homePositions.red.forEach(i   => boardCells[i].classes.push("cell-home-red"));
homePositions.yellow.forEach(i=> boardCells[i].classes.push("cell-home-yellow"));

// ========== 路徑定義（簡化大圈） ==========

const pathIndices = [];

function pushPathCells(coords) {
  coords.forEach(([r, c]) => {
    const idx = rcToIndex(r, c);
    if (!pathIndices.includes(idx)) pathIndices.push(idx);
  });
}
function addColorToCells(coords, cls) {
  coords.forEach(([r, c]) => {
    const idx = rcToIndex(r, c);
    if (!boardCells[idx].classes.includes(cls)) {
      boardCells[idx].classes.push(cls);
    }
  });
}

// 下方紅路
const bottomPath = [
  [8, 2], [8, 3], [8, 4], [8, 5], [8, 6], [8, 7], [8, 8],
];
pushPathCells(bottomPath);
addColorToCells(bottomPath, "cell-path-red");

// 右側藍路
const rightPath = [
  [7, 8], [6, 8], [5, 8], [4, 8], [3, 8],
];
pushPathCells(rightPath);
addColorToCells(rightPath, "cell-path-blue");

// 上方綠路
const topPath = [
  [2, 8], [2, 7], [2, 6], [2, 5], [2, 4], [2, 3], [2, 2],
];
pushPathCells(topPath);
addColorToCells(topPath, "cell-path-green");

// 左側黃路
const leftPath = [
  [3, 2], [4, 2], [5, 2], [6, 2], [7, 2],
];
pushPathCells(leftPath);
addColorToCells(leftPath, "cell-path-yellow");

// 標記為 path
pathIndices.forEach((idx) => {
  boardCells[idx].isPath = true;
  if (!boardCells[idx].classes.includes("cell-path")) {
    boardCells[idx].classes.push("cell-path");
  }
});

const PATH_LENGTH = pathIndices.length;

// 每色「視覺起飛格」的實際 index（你看到的第一格）
const startCells = {
  red:    rcToIndex(8, 2), // 下方紅路左端
  blue:   rcToIndex(7, 8), // 右側藍路下端
  green:  rcToIndex(2, 8), // 上方綠路右端
  yellow: rcToIndex(3, 2), // 左側黃路上端
};

// 幫助：把某個棋盤 index 找到它在 path 中的 step（0~PATH_LENGTH-1）
function indexToStep(cellIndex) {
  const step = pathIndices.indexOf(cellIndex);
  return step >= 0 ? step : 0;
}

// ========== 玩家 / 棋子狀態 ==========

const players = [
  {
    id: 0,
    name: "紅方",
    color: "red",
    colorClass: "red",
    pieces: Array.from({ length: 4 }, (_, i) => ({
      status: "home",
      homeIndex: i,
      step: 0,
    })),
  },
  {
    id: 1,
    name: "藍方",
    color: "blue",
    colorClass: "blue",
    pieces: Array.from({ length: 4 }, (_, i) => ({
      status: "home",
      homeIndex: i,
      step: 0,
    })),
  },
  {
    id: 2,
    name: "綠方",
    color: "green",
    colorClass: "green",
    pieces: Array.from({ length: 4 }, (_, i) => ({
      status: "home",
      homeIndex: i,
      step: 0,
    })),
  },
  {
    id: 3,
    name: "黃方",
    color: "yellow",
    colorClass: "yellow",
    pieces: Array.from({ length: 4 }, (_, i) => ({
      status: "home",
      homeIndex: i,
      step: 0,
    })),
  },
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

// ========== 棋盤 & 棋子渲染 ==========

function initBoard() {
  boardEl.innerHTML = "";
  boardEl.style.gridTemplateColumns = `repeat(${BOARD_COLS}, 32px)`;
  boardEl.style.gridTemplateRows = `repeat(${BOARD_ROWS}, 32px)`;
  boardCells.forEach((cellData) => {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cellData.classes.forEach((cls) => cell.classList.add(cls));
    boardEl.appendChild(cell);
  });
}

function renderPieces() {
  const cells = boardEl.getElementsByClassName("cell");

  // 先清除所有舊棋子容器與文字
  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    const oldContainer = cell.querySelector(".pieces-container");
    if (oldContainer) cell.removeChild(oldContainer);

    const oldLabel = cell.querySelector(".cell-label");
    if (oldLabel) cell.removeChild(oldLabel);
  }

  // 在每個路徑格上顯示步數 index（方便你看）
  pathIndices.forEach((cellIndex, step) => {
    const cell = cells[cellIndex];
    const label = document.createElement("div");
    label.className = "cell-label";
    label.style.position = "absolute";
    label.style.left = "2px";
    label.style.top = "2px";
    label.style.fontSize = "10px";
    label.style.color = "#999";
    label.textContent = step.toString();
    cell.appendChild(label);
  });

  // 再畫棋子
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

  const cellPiecesMap = new Map();

  players.forEach((player) => {
    const color = player.color;
    player.pieces.forEach((piece, idx) => {
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
        cellPiecesMap.get(cellIndex).push({ player, pieceIndex: idx });
      }
    });
  });

  cellPiecesMap.forEach((list, cellIndex) => {
    const cell = cells[cellIndex];
    const container = document.createElement("div");
    container.className = "pieces-container";

    list.forEach(({ player }) => {
      const pieceEl = document.createElement("div");
      pieceEl.className = `piece ${player.colorClass}`;
      container.appendChild(pieceEl);
    });

    cell.appendChild(container);
  });
}

function getFirstTrackPiece(player) {
  return player.pieces.find(p => p.status === "track") || null;
}
function getFirstHomePiece(player) {
  return player.pieces.find(p => p.status === "home") || null;
}
function getAnyTrackPieceElement(player) {
  const piece = getFirstTrackPiece(player);
  if (!piece) return null;
  const step = Math.min(piece.step, PATH_LENGTH - 1);
  const idx = pathIndices[step];
  const cells = boardEl.getElementsByClassName("cell");
  const cell = cells[idx];
  if (!cell) return null;
  return cell.querySelector(`.piece.${player.colorClass}`);
}

// ========== 動畫：逐格移動路上棋 ==========

function animateMovePiece(player, piece, targetStep, onComplete) {
  const start = piece.step;
  const end = targetStep;
  if (end <= start) {
    onComplete && onComplete();
    return;
  }

  let current = start;
  const stepTime = 300;

  function moveOne() {
    current += 1;
    piece.step = current;
    renderPieces();

    const el = getAnyTrackPieceElement(player);
    if (el) el.classList.add("piece-blink");

    if (current < end) {
      setTimeout(moveOne, stepTime);
    } else {
      onComplete && onComplete();
    }
  }

  moveOne();
}

// ========== 擲骰子動畫 + 回合流程 ==========

function randomDice() {
  return Math.floor(Math.random() * 6) + 1;
}

function handleTurn() {
  if (gameEnded || isAnimating) return;

  const player = players[currentPlayerIndex];
  isAnimating = true;
  rollButton.disabled = true;

  renderPieces();

  let blinkingEl = getAnyTrackPieceElement(player);
  if (blinkingEl) blinkingEl.classList.add("piece-blink");

  const totalFrames = 10;
  const fastFrames = 7;
  const fastInterval = 120;
  const slowInterval = 400;

  const diceValues = [];
  for (let i = 0; i < totalFrames; i++) diceValues.push(randomDice());

  let time = 0;
  for (let i = 0; i < totalFrames; i++) {
    time += (i < fastFrames ? fastInterval : slowInterval);

    setTimeout(() => {
      diceResultEl.textContent = diceValues[i].toString();

      if (i === totalFrames - 1) {
        const dice = diceValues[i];

        blinkingEl = getAnyTrackPieceElement(player);
        if (blinkingEl) blinkingEl.classList.add("piece-blink");

        statusEl.textContent = `${player.name} 擲出 ${dice} 點`;
        diceResultEl.classList.add("dice-blink");

        setTimeout(() => {
          diceResultEl.classList.remove("dice-blink");

          performMoveWithLudoRules(player, dice, () => {
            renderPieces();
            const el = getAnyTrackPieceElement(player);
            if (el) el.classList.remove("piece-blink");

            isAnimating = false;
            if (!gameEnded) {
              currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
              updateCurrentPlayerDisplay();
              rollButton.disabled = false;
            }
          });
        }, 1000);
      }
    }, time);
  }
}

/**
 * 修正版起步規則：
 *  - dice = 6 且家裡有棋：
 *      直接把「第一顆在家」的棋放到該色起飛格（用 startCells[color]），
 *      並根據這個格在 path 裡的位置計算 step。
 *  - dice = 6 且家裡沒棋、有路上棋：路上棋走 6 步。
 *  - dice != 6 且有路上棋：路上棋走 dice 步。
 *  - dice != 6 且全在家：不能動。
 */
function performMoveWithLudoRules(player, dice, done) {
  const color = player.color;
  const startCellIndex = startCells[color];
  const startStep = indexToStep(startCellIndex);

  const homePiece = getFirstHomePiece(player);
  const trackPiece = getFirstTrackPiece(player);

  const homeCount = player.pieces.filter(p => p.status === "home").length;
  const trackCount = player.pieces.filter(p => p.status === "track").length;

  if (dice === 6) {
    if (homePiece) {
      statusEl.textContent =
        `${player.name} 擲到 6：家裡還有 ${homeCount} 枚，路上有 ${trackCount} 枚，` +
        `從家第 ${homePiece.homeIndex + 1} 枚起飛到起點格。`;

      homePiece.status = "track";
      homePiece.step = startStep;   // 這裡用「起飛格在 path 中的位置」
      renderPieces();
      done();
      return;
    } else if (trackPiece) {
      statusEl.textContent =
        `${player.name} 擲到 6：家裡 0 枚，只能讓路上棋走 6 步。`;
      moveTrackPieceWithDice(player, trackPiece, dice, done);
      return;
    } else {
      statusEl.textContent = `${player.name} 擲到 6，但沒有可動的棋。`;
      done();
      return;
    }
  } else {
    if (trackPiece) {
      statusEl.textContent =
        `${player.name} 擲到 ${dice}：家裡 ${homeCount} 枚，路上 ${trackCount} 枚，` +
        `讓路上棋前進 ${dice} 步。`;
      moveTrackPieceWithDice(player, trackPiece, dice, done);
      return;
    } else {
      statusEl.textContent =
        `${player.name} 擲到 ${dice}，但所有棋都在家，無法行動。`;
      done();
      return;
    }
  }
}

function moveTrackPieceWithDice(player, piece, dice, done) {
  const oldStep = piece.step;
  let targetStep = oldStep + dice;
  if (targetStep >= PATH_LENGTH) targetStep = PATH_LENGTH - 1;

  statusEl.textContent += `（從第 ${oldStep} 步走到第 ${targetStep} 步）`;

  animateMovePiece(player, piece, targetStep, () => {
    if (targetStep >= PATH_LENGTH - 1) {
      gameEnded = true;
      statusEl.textContent = `${player.name} 率先繞完一圈，獲勝！`;
      rollButton.disabled = true;
      done();
    } else {
      done();
    }
  });
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

// ========== 初始化 ==========

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
  rollButton.disabled = false;
  diceResultEl.textContent = "-";
  statusEl.textContent = "";

  initBoard();
  renderPieces();
  updateCurrentPlayerDisplay();
}

rollButton.addEventListener("click", handleTurn);
resetButton.addEventListener("click", initGame);
window.addEventListener("load", initGame);
