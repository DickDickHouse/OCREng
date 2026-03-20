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
