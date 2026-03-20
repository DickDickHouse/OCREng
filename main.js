// ========== 棋盤設定 ==========

// 棋盤為 11 x 11 的方形
const BOARD_ROWS = 11;
const BOARD_COLS = 11;

// 幫助函式：把 row, col 轉成一維 index
function rcToIndex(r, c) {
  return r * BOARD_COLS + c;
}

// 建立一個棋盤，每格有類型：空、主跑道、起點等
const boardCells = [];

// 先全部填空格
for (let r = 0; r < BOARD_ROWS; r++) {
  for (let c = 0; c < BOARD_COLS; c++) {
    boardCells.push({
      row: r,
      col: c,
      isPath: false, // 是否為主跑道的一格（十字/跑道）
      classes: [],   // 額外 CSS class
    });
  }
}

/**
 * 簡化版十字型主跑道：
 * - 中間行 (row = 5) 的所有格子是水平路
 * - 中間列 (col = 5) 的所有格子是垂直路
 * 這樣會形成一個「十字」。
 */
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

// 四個角落附近標記為玩家「家」區域（目前只是背景裝飾）
boardCells[rcToIndex(0, 0)].classes.push("cell-home-green");
boardCells[rcToIndex(0, 1)].classes.push("cell-home-green");
boardCells[rcToIndex(1, 0)].classes.push("cell-home-green");
boardCells[rcToIndex(1, 1)].classes.push("cell-home-green");

boardCells[rcToIndex(0, 9)].classes.push("cell-home-blue");
boardCells[rcToIndex(0, 10)].classes.push("cell-home-blue");
boardCells[rcToIndex(1, 9)].classes.push("cell-home-blue");
boardCells[rcToIndex(1, 10)].classes.push("cell-home-blue");

boardCells[rcToIndex(9, 0)].classes.push("cell-home-red");
boardCells[rcToIndex(9, 1)].classes.push("cell-home-red");
boardCells[rcToIndex(10, 0)].classes.push("cell-home-red");
boardCells[rcToIndex(10, 1)].classes.push("cell-home-red");

boardCells[rcToIndex(9, 9)].classes.push("cell-home-yellow");
boardCells[rcToIndex(9, 10)].classes.push("cell-home-yellow");
boardCells[rcToIndex(10, 9)].classes.push("cell-home-yellow");
boardCells[rcToIndex(10, 10)].classes.push("cell-home-yellow");

// ========== 定義主跑道路徑（簡化版，帶顏色） ==========

const pathIndices = [];

// 幫助工具：把一連串 (r,c) 推進 pathIndices
function pushPathCells(coordsArray) {
  coordsArray.forEach(([r, c]) => {
    const idx = rcToIndex(r, c);
    if (!pathIndices.includes(idx)) {
      pathIndices.push(idx);
    }
  });
}

// 幫助工具：為一段格子加上顏色 class（讓不同方向有不同底色）
function addColorToCells(coordsArray, className) {
  coordsArray.forEach(([r, c]) => {
    const idx = rcToIndex(r, c);
    if (!boardCells[idx].classes.includes(className)) {
      boardCells[idx].classes.push(className);
    }
  });
}

// 下方水平線 (row = 8, col 2→8) - 紅色路段
const bottomPath = [
  [8, 2], [8, 3], [8, 4], [8, 5], [8, 6], [8, 7], [8, 8],
];
pushPathCells(bottomPath);
addColorToCells(bottomPath, "cell-path-red");

// 右側垂直線 (col = 8, row 7→3) - 藍色路段
const rightPath = [
  [7, 8], [6, 8], [5, 8], [4, 8], [3, 8],
];
pushPathCells(rightPath);
addColorToCells(rightPath, "cell-path-blue");

// 上方水平線 (row = 2, col 8→2) - 綠色路段
const topPath = [
  [2, 8], [2, 7], [2, 6], [2, 5], [2, 4], [2, 3], [2, 2],
];
pushPathCells(topPath);
addColorToCells(topPath, "cell-path-green");

// 左側垂直線 (col = 2, row 3→7) - 黃色路段
const leftPath = [
  [3, 2], [4, 2], [5, 2], [6, 2], [7, 2],
];
pushPathCells(leftPath);
addColorToCells(leftPath, "cell-path-yellow");

// 讓這些格子都被標記為 path（主跑道）
pathIndices.forEach((idx) => {
  boardCells[idx].isPath = true;
  if (!boardCells[idx].classes.includes("cell-path")) {
    boardCells[idx].classes.push("cell-path");
  }
});

const PATH_LENGTH = pathIndices.length;

// ========== 玩家設定 ==========

const players = [
  { id: 0, name: "紅方", colorClass: "red", currentStep: 0 },
  { id: 1, name: "藍方", colorClass: "blue", currentStep: 0 },
  { id: 2, name: "綠方", colorClass: "green", currentStep: 0 },
  { id: 3, name: "黃方", colorClass: "yellow", currentStep: 0 },
];

let currentPlayerIndex = 0;
let gameEnded = false;
let isAnimating = false; // 是否正在動畫中（擲骰子或移動）

// DOM 元素
const boardEl = document.getElementById("board");
const currentPlayerNameEl = document.getElementById("current-player-name");
const diceResultEl = document.getElementById("dice-result");
const statusEl = document.getElementById("status");
const rollButton = document.getElementById("roll-button");
const resetButton = document.getElementById("reset-button");

// ========== 棋盤渲染 ==========

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

  // 先清除所有舊棋子容器
  for (let cell of cells) {
    const oldContainer = cell.querySelector(".pieces-container");
    if (oldContainer) {
      cell.removeChild(oldContainer);
    }
  }

  // 對每一格記錄有哪些玩家在這一格
  const cellPiecesMap = new Map(); // key: cellIndex, value: array of players

  players.forEach((player) => {
    const step = Math.min(player.currentStep, PATH_LENGTH - 1);
    const pathIndex = pathIndices[step];

    if (!cellPiecesMap.has(pathIndex)) {
      cellPiecesMap.set(pathIndex, []);
    }
    cellPiecesMap.get(pathIndex).push(player);
  });

  // 依照 cellPiecesMap，為每一格建立容器並放入多顆棋
  cellPiecesMap.forEach((playersInCell, cellIndex) => {
    const cell = cells[cellIndex];

    const container = document.createElement("div");
    container.className = "pieces-container";

    playersInCell.forEach((player) => {
      const piece = document.createElement("div");
      piece.className = `piece ${player.colorClass}`;
      container.appendChild(piece);
    });

    cell.appendChild(container);
  });
}

// ========== 動畫：逐格移動棋子 ==========

function animateMove(player, targetStep, onComplete) {
  const start = player.currentStep;
  const end = targetStep;
  const stepDiff = end - start;
  if (stepDiff <= 0) {
    if (onComplete) onComplete();
    return;
  }

  let current = start;
  const stepTime = 300; // 每格 0.3 秒

  function moveOneStep() {
    current += 1;
    player.currentStep = current;
    renderPieces();

    if (current < end) {
      setTimeout(moveOneStep, stepTime);
    } else {
      if (onComplete) onComplete();
    }
  }

  moveOneStep();
}

// ========== 擲骰子動畫與回合處理 ==========

function randomDice() {
  return Math.floor(Math.random() * 6) + 1;
}

// 執行一次完整的擲骰子流程：先動畫，再真正移動
function handleTurn() {
  if (gameEnded || isAnimating) return;

  const currentPlayer = players[currentPlayerIndex];
  isAnimating = true;
  rollButton.disabled = true;

  // 計畫顯示 10 個隨機數字
  const totalFrames = 10;
  const fastFrames = 7; // 前 7 次快一點
  const slowFrames = totalFrames - fastFrames;

  const fastInterval = 120; // ms
  const slowInterval = 400; // ms

  const diceValues = [];
  for (let i = 0; i < totalFrames; i++) {
    diceValues.push(randomDice());
  }

  let time = 0;
  for (let i = 0; i < totalFrames; i++) {
    if (i < fastFrames) {
      time += fastInterval;
    } else {
      time += slowInterval;
    }

    setTimeout(() => {
      diceResultEl.textContent = diceValues[i].toString();

      // 最後一個 frame：用這個點數做真正移動
      if (i === totalFrames - 1) {
        const dice = diceValues[i];
        const oldStep = currentPlayer.currentStep;
        let targetStep = oldStep + dice;

        if (targetStep >= PATH_LENGTH) {
          targetStep = PATH_LENGTH - 1;
        }

        statusEl.textContent = `${currentPlayer.name} 將從第 ${oldStep} 步走到第 ${targetStep} 步`;

        animateMove(currentPlayer, targetStep, () => {
          if (targetStep >= PATH_LENGTH - 1) {
            gameEnded = true;
            statusEl.textContent = `${currentPlayer.name} 率先繞完一圈，獲勝！`;
            rollButton.disabled = true;
            isAnimating = false;
          } else {
            currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
            updateCurrentPlayerDisplay();
            isAnimating = false;
            rollButton.disabled = false;
          }
        });
      }
    }, time);
  }
}

function updateCurrentPlayerDisplay() {
  const currentPlayer = players[currentPlayerIndex];
  currentPlayerNameEl.textContent = currentPlayer.name;

  currentPlayerNameEl.classList.remove(
    "player-red",
    "player-blue",
    "player-green",
    "player-yellow"
  );

  if (currentPlayer.colorClass === "red") {
    currentPlayerNameEl.classList.add("player-red");
  } else if (currentPlayer.colorClass === "blue") {
    currentPlayerNameEl.classList.add("player-blue");
  } else if (currentPlayer.colorClass === "green") {
    currentPlayerNameEl.classList.add("player-green");
  } else if (currentPlayer.colorClass === "yellow") {
    currentPlayerNameEl.classList.add("player-yellow");
  }
}

// ========== 初始化遊戲 ==========

function initGame() {
  currentPlayerIndex = 0;
  players.forEach((p) => (p.currentStep = 0));
  gameEnded = false;
  isAnimating = false;
  rollButton.disabled = false;
  diceResultEl.textContent = "-";
  statusEl.textContent = "";

  initBoard();
  renderPieces();
  updateCurrentPlayerDisplay();
}

// 綁定事件
rollButton.addEventListener("click", handleTurn);
resetButton.addEventListener("click", initGame);

// 頁面載入後開始
window.addEventListener("load", initGame);
