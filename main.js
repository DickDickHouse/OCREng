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

// 四個角落附近標記為玩家「家」區域（暫時只是背景裝飾）
const homePositions = {
  green: [rcToIndex(0, 0), rcToIndex(0, 1), rcToIndex(1, 0), rcToIndex(1, 1)],
  blue:  [rcToIndex(0, 9), rcToIndex(0,10), rcToIndex(1, 9), rcToIndex(1,10)],
  red:   [rcToIndex(9, 0), rcToIndex(9, 1), rcToIndex(10,0), rcToIndex(10,1)],
  yellow:[rcToIndex(9, 9), rcToIndex(9,10), rcToIndex(10,9), rcToIndex(10,10)],
};

homePositions.green.forEach(idx => boardCells[idx].classes.push("cell-home-green"));
homePositions.blue.forEach(idx  => boardCells[idx].classes.push("cell-home-blue"));
homePositions.red.forEach(idx   => boardCells[idx].classes.push("cell-home-red"));
homePositions.yellow.forEach(idx=> boardCells[idx].classes.push("cell-home-yellow"));

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

// 定義各顏色玩家的「起點步數」
const startSteps = {
  red:   0,                         // 紅方從 bottomPath 起點
  blue:  bottomPath.length,         // 紅跑完下方接右側
  green: bottomPath.length + rightPath.length,
  yellow:bottomPath.length + rightPath.length + topPath.length
};

// ========== 玩家＆棋子設定 ==========

/**
 * 每顏色 4 棋：
 *  - status: "home" 或 "track"
 *  - homeIndex: 對應 homePositions[color] 陣列裡第幾格
 *  - step: 在 path 上的步數（只在 status = "track" 有用）
 */
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

// 根據所有玩家棋子狀態，畫出棋子（家 + 路上）
function renderPieces() {
  const cells = boardEl.getElementsByClassName("cell");

  // 清除舊的棋子容器
  for (let cell of cells) {
    const oldContainer = cell.querySelector(".pieces-container");
    if (oldContainer) {
      cell.removeChild(oldContainer);
    }
  }

  // 每格對應哪些棋子（顏色 + pieceIndex）
  const cellPiecesMap = new Map();

  players.forEach((player) => {
    const color = player.color;

    player.pieces.forEach((piece, idx) => {
      let cellIndex = null;

      if (piece.status === "home") {
        // 在家：放在 homePositions[color] 對應 index
        const homeList = homePositions[color];
        if (homeList && homeList[piece.homeIndex] !== undefined) {
          cellIndex = homeList[piece.homeIndex];
        }
      } else if (piece.status === "track") {
        const step = Math.min(piece.step, PATH_LENGTH - 1);
        cellIndex = pathIndices[step];
      }

      if (cellIndex !== null && cellIndex !== undefined) {
        if (!cellPiecesMap.has(cellIndex)) {
          cellPiecesMap.set(cellIndex, []);
        }
        cellPiecesMap.get(cellIndex).push({ player, pieceIndex: idx });
      }
    });
  });

  // 把棋子畫出來
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

// 取得某顏色的「任一顆在路上的棋子」（簡化：選第一顆）
function getFirstTrackPiece(player) {
  return player.pieces.find((p) => p.status === "track") || null;
}

// 取得某顏色的「第一顆在家的棋」
function getFirstHomePiece(player) {
  return player.pieces.find((p) => p.status === "home") || null;
}

// 取得目前玩家在路上的其中一顆棋子對應的 DOM element（用於閃爍）
function getAnyTrackPieceElement(player) {
  const cells = boardEl.getElementsByClassName("cell");

  // 找這個玩家的第一顆在路上的棋
  const piece = getFirstTrackPiece(player);
  if (!piece) return null;

  const step = Math.min(piece.step, PATH_LENGTH - 1);
  const pathIndex = pathIndices[step];
  const cell = cells[pathIndex];
  if (!cell) return null;

  const pieceEl = cell.querySelector(`.piece.${player.colorClass}`);
  return pieceEl;
}

// ========== 動畫：逐格移動某顆棋子 ==========

function animateMovePiece(player, piece, targetStep, onComplete) {
  const start = piece.step;
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
    piece.step = current;
    renderPieces();

    // 讓這顆棋保持閃爍
    const el = getAnyTrackPieceElement(player);
    if (el) {
      el.classList.add("piece-blink");
    }

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

// 執行一次完整的擲骰子流程：
// 1) 目前玩家棋子閃爍
// 2) 骰子亂數動畫
// 3) 點數停下後閃 1 秒
// 4) 根據飛行棋起步規則移動
function handleTurn() {
  if (gameEnded || isAnimating) return;

  const player = players[currentPlayerIndex];
  isAnimating = true;
  rollButton.disabled = true;

  // 先更新一次畫面，確保家裡或路上有棋子 DOM
  renderPieces();

  // 讓「這個玩家」的路上棋（如果有）先閃爍；如果還都在家，暫時不會看到棋閃
  let blinkingTargetEl = getAnyTrackPieceElement(player);
  if (blinkingTargetEl) {
    blinkingTargetEl.classList.add("piece-blink");
  }

  // 計畫顯示 10 個隨機數字
  const totalFrames = 10;
  const fastFrames = 7;
  const fastInterval = 120;
  const slowInterval = 400;

  const diceValues = [];
  for (let i = 0; i < totalFrames; i++) {
    diceValues.push(randomDice());
  }

  let time = 0;
  for (let i = 0; i < totalFrames; i++) {
    time += (i < fastFrames ? fastInterval : slowInterval);

    setTimeout(() => {
      diceResultEl.textContent = diceValues[i].toString();

      if (i === totalFrames - 1) {
        const dice = diceValues[i];

        // 重新確認一次「閃爍的目標棋」
        blinkingTargetEl = getAnyTrackPieceElement(player);
        if (blinkingTargetEl) {
          blinkingTargetEl.classList.add("piece-blink");
        }

        // 顯示計畫文字（稍後真正執行）
        statusEl.textContent = `${player.name} 擲出 ${dice} 點`;

        // 讓點數閃爍 1 秒
        diceResultEl.classList.add("dice-blink");
        setTimeout(() => {
          diceResultEl.classList.remove("dice-blink");

          // 開始依照起步規則實際移動
          performMoveWithLudoRules(player, dice, () => {
            // 移動完成後，關閉本玩家的棋子閃爍
            renderPieces();
            const el = getAnyTrackPieceElement(player);
            if (el) {
              el.classList.remove("piece-blink");
            }

            isAnimating = false;

            if (!gameEnded) {
              // 換下一個玩家
              currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
              updateCurrentPlayerDisplay();
              rollButton.disabled = false;
            }
          });
        }, 1000); // 點數閃 1 秒
      }
    }, time);
  }
}

/**
 * 依照簡化的飛行棋起步規則，決定這回合怎麼動：
 * - 如果骰子是 6：
 *   - 若家裡還有棋，優先把第一顆在家的棋放到起點
 *   - 否則，如果有在路上的棋，讓第一顆在路上的棋走 6 步
 * - 如果骰子不是 6：
 *   - 若有在路上的棋，讓第一顆在路上的棋往前走骰子步數
 *   - 若全在家，則跳過（這回合無法行動）
 */
function performMoveWithLudoRules(player, dice, done) {
  const color = player.color;
  const startStep = startSteps[color];

  const homePiece = getFirstHomePiece(player);
  const trackPiece = getFirstTrackPiece(player);

  if (dice === 6) {
    if (homePiece) {
      // 從家起飛到起點
      homePiece.status = "track";
      homePiece.step = startStep;
      statusEl.textContent = `${player.name} 擲到 6，從家裡起飛！`;
      renderPieces();
      // 起飛這一步先不動畫走格（直接到起點），之後若你要也可以做格子動畫
      done();
      return;
    } else if (trackPiece) {
      // 沒有在家的棋，就讓路上的棋走 6 格
      moveTrackPieceWithDice(player, trackPiece, dice, done);
      return;
    } else {
      // 理論上不會發生：既沒有家棋也沒有路棋
      done();
      return;
    }
  } else {
    // 骰子不是 6，只能移動路上的棋（若有）
    if (trackPiece) {
      moveTrackPieceWithDice(player, trackPiece, dice, done);
      return;
    } else {
      // 全在家且不是 6，不能動
      statusEl.textContent = `${player.name} 全在家且不是 6，無法行動。`;
      done();
      return;
    }
  }
}

// 讓某顆在路上的棋走指定骰子步數（含逐格動畫與勝利檢查）
function moveTrackPieceWithDice(player, piece, dice, done) {
  const oldStep = piece.step;
  let targetStep = oldStep + dice;

  if (targetStep >= PATH_LENGTH) {
    targetStep = PATH_LENGTH - 1;
  }

  statusEl.textContent = `${player.name} 從第 ${oldStep} 步走到第 ${targetStep} 步`;

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
  const currentPlayer = players[currentPlayerIndex];
  currentPlayerNameEl.textContent = currentPlayer.name;

  currentPlayerNameEl.classList.remove(
    "player-red",
    "player-blue",
    "player-green",
    "player-yellow"
  );

  if (currentPlayer.color === "red") {
    currentPlayerNameEl.classList.add("player-red");
  } else if (currentPlayer.color === "blue") {
    currentPlayerNameEl.classList.add("player-blue");
  } else if (currentPlayer.color === "green") {
    currentPlayerNameEl.classList.add("player-green");
  } else if (currentPlayer.color === "yellow") {
    currentPlayerNameEl.classList.add("player-yellow");
  }
}

// ========== 初始化遊戲 ==========

function initGame() {
  // 重置玩家棋子
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

// 綁定事件
rollButton.addEventListener("click", handleTurn);
resetButton.addEventListener("click", initGame);

// 頁面載入後開始
window.addEventListener("load", initGame);
