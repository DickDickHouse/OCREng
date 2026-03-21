// ========== 棋盤設定 ==========

// 棋盤為 11 x 11 的方形
const BOARD_ROWS = 11;
const BOARD_COLS = 11;
const BOARD_SIZE = BOARD_ROWS * BOARD_COLS;

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
      isPath: false, // 是否為主跑道的一格（十字）
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

// 指定四個「起點格」附近區域（先用顏色背景區分，可之後再加真正起飛邏輯）
boardCells[rcToIndex(9, 1)].classes.push("cell-start-red");
boardCells[rcToIndex(1, 9)].classes.push("cell-start-blue");
boardCells[rcToIndex(1, 1)].classes.push("cell-start-green");
boardCells[rcToIndex(9, 9)].classes.push("cell-start-yellow");

// ========== 定義主跑道路徑（簡化版） ==========

/**
 * 我們定義一條繞十字外圍的路徑（簡化，不完全等於真實飛行棋路線，但視覺上會在十字周邊繞一圈）。
 * 這裡先做最簡單版本：沿著十字一圈走完，再回到起點。
 *
 * 為方便，我們手動列出一條「不會重複太多格子」的路線。
 * （之後你想更接近真正飛行棋，可以再一起調整。）
 */

// 這裡我用一個粗略的「大圈」：先從中間偏下往右，繞一圈回來
const pathIndices = [];

// 一些工具：把一連串 (r,c) 推進 pathIndices
function pushPathCells(coordsArray) {
  coordsArray.forEach(([r, c]) => {
    const idx = rcToIndex(r, c);
    if (!pathIndices.includes(idx)) {
      pathIndices.push(idx);
    }
  });
}

// 下方水平線 (row = 8, col 2→8)
pushPathCells([
  [8, 2], [8, 3], [8, 4], [8, 5], [8, 6], [8, 7], [8, 8],
]);
// 右側垂直線 (col = 8, row 7→3)
pushPathCells([
  [7, 8], [6, 8], [5, 8], [4, 8], [3, 8],
]);
// 上方水平線 (row = 2, col 8→2)
pushPathCells([
  [2, 8], [2, 7], [2, 6], [2, 5], [2, 4], [2, 3], [2, 2],
]);
// 左側垂直線 (col = 2, row 3→7)
pushPathCells([
  [3, 2], [4, 2], [5, 2], [6, 2], [7, 2],
]);

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

// DOM 元素
const boardEl = document.getElementById("board");
const currentPlayerNameEl = document.getElementById("current-player-name");
const diceResultEl = document.getElementById("dice-result");
const statusEl = document.getElementById("status");
const rollButton = document.getElementById("roll-button");
const newGameButton = document.getElementById("new-game-button");

// ========== 棋盤渲染 ==========

function initBoard() {
  boardEl.innerHTML = "";
  boardEl.style.gridTemplateColumns = `repeat(${BOARD_COLS}, 28px)`;
  boardEl.style.gridTemplateRows = `repeat(${BOARD_ROWS}, 28px)`;

  boardCells.forEach((cellData) => {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cellData.classes.forEach((cls) => cell.classList.add(cls));
    boardEl.appendChild(cell);
  });
}

function renderPieces() {
  const cells = boardEl.getElementsByClassName("cell");

  // 先清除所有舊棋子
  for (let cell of cells) {
    // 移除所有子元素（這一次不顯示 index，小遊戲簡潔就好）
    while (cell.firstChild) {
      cell.removeChild(cell.firstChild);
    }
  }

  // 在路徑上畫出每位玩家棋子
  players.forEach((player) => {
    // 如果還沒開始走，可以讓他停在路徑的第一格
    const step = Math.min(player.currentStep, PATH_LENGTH - 1);
    const pathIndex = pathIndices[step];
    const cell = cells[pathIndex];

    const piece = document.createElement("div");
    piece.className = `piece ${player.colorClass}`;
    cell.appendChild(piece);
  });
}

// ========== 擲骰子與回合處理 ==========

function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

function handleTurn() {
  if (gameEnded) return;

  const currentPlayer = players[currentPlayerIndex];
  const dice = rollDice();
  diceResultEl.textContent = dice.toString();

  const oldStep = currentPlayer.currentStep;
  let newStep = oldStep + dice;

  if (newStep >= PATH_LENGTH) {
    newStep = PATH_LENGTH - 1;
    gameEnded = true;
    statusEl.textContent = `${currentPlayer.name} 率先繞完一圈，獲勝！`;
    rollButton.disabled = true;
  } else {
    statusEl.textContent = `${currentPlayer.name} 從第 ${oldStep + 1} 步移動到第 ${newStep + 1} 步`;
  }

  currentPlayer.currentStep = newStep;
  renderPieces();

  if (!gameEnded) {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    updateCurrentPlayerDisplay();
  }
}

function updateCurrentPlayerDisplay() {
  const currentPlayer = players[currentPlayerIndex];
  currentPlayerNameEl.textContent = currentPlayer.name;

  // 先移除所有顏色 class
  currentPlayerNameEl.classList.remove(
    "player-red",
    "player-blue",
    "player-green",
    "player-yellow"
  );

  // 再加上對應 class
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
  rollButton.disabled = false;
  diceResultEl.textContent = "-";
  statusEl.textContent = "";

  initBoard();
  renderPieces();
  updateCurrentPlayerDisplay();
}

// 綁定事件
rollButton.addEventListener("click", handleTurn);
newGameButton.addEventListener("click", initGame);

window.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    handleTurn();
  }
});

// 頁面載入後開始
window.addEventListener("load", initGame);
