// 棋盤格數（0 ~ BOARD_SIZE-1）
const BOARD_SIZE = 10;

// 兩位玩家：紅方、藍方
const players = [
  { name: "紅方", colorClass: "red", position: 0 },
  { name: "藍方", colorClass: "blue", position: 0 },
];

let currentPlayerIndex = 0;
let gameEnded = false;

const boardEl = document.getElementById("board");
const currentPlayerNameEl = document.getElementById("current-player-name");
const diceResultEl = document.getElementById("dice-result");
const statusEl = document.getElementById("status");
const rollButton = document.getElementById("roll-button");

// 初始化棋盤
function initBoard() {
  boardEl.innerHTML = "";
  for (let i = 0; i < BOARD_SIZE; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";

    // 顯示格子索引（小字）
    const indexLabel = document.createElement("div");
    indexLabel.className = "cell-index";
    indexLabel.textContent = i.toString();
    cell.appendChild(indexLabel);

    boardEl.appendChild(cell);
  }
}

// 根據玩家位置，在棋盤上顯示棋子
function renderPieces() {
  // 清理舊棋子
  const cells = boardEl.getElementsByClassName("cell");
  for (let cell of cells) {
    // 移除 index 以外的子元素（也就是棋子）
    while (cell.childNodes.length > 1) {
      cell.removeChild(cell.lastChild);
    }
  }

  // 將每位玩家的棋子畫上去
  players.forEach((player) => {
    const position = player.position;
    if (position >= 0 && position < BOARD_SIZE) {
      const cell = cells[position];
      const piece = document.createElement("div");
      piece.className = `piece ${player.colorClass}`;
      cell.appendChild(piece);
    }
  });
}

// 擲骰子（1~6）
function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

// 處理一次回合
function handleTurn() {
  if (gameEnded) return;

  const currentPlayer = players[currentPlayerIndex];
  const dice = rollDice();
  diceResultEl.textContent = dice.toString();

  const oldPos = currentPlayer.position;
  let newPos = oldPos + dice;

  // 若超出終點，就停在終點
  if (newPos >= BOARD_SIZE - 1) {
    newPos = BOARD_SIZE - 1;
    gameEnded = true;
    statusEl.textContent = `${currentPlayer.name} 到達終點，獲勝！`;
    rollButton.disabled = true;
  } else {
    statusEl.textContent = `${currentPlayer.name} 從 ${oldPos} 走到 ${newPos}`;
  }

  currentPlayer.position = newPos;
  renderPieces();

  // 換下一位玩家
  if (!gameEnded) {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    currentPlayerNameEl.textContent = players[currentPlayerIndex].name;
  }
}

// 綁定按鈕事件
rollButton.addEventListener("click", handleTurn);

// 初始化狀態
function initGame() {
  currentPlayerIndex = 0;
  players[0].position = 0;
  players[1].position = 0;
  gameEnded = false;
  rollButton.disabled = false;
  diceResultEl.textContent = "-";
  statusEl.textContent = "";
  currentPlayerNameEl.textContent = players[currentPlayerIndex].name;

  initBoard();
  renderPieces();
}

// 頁面載入完成後執行初始化
window.addEventListener("load", initGame);
