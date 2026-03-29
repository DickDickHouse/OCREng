// ✅ 飛行棋核心 v56 - 包含基地與棋子
console.log("[CORE] main.js 加載中...");

// --- 配置 ---
const BOARD_ROWS = 15;
const BOARD_COLS = 15;

function xyToIndex(x, y) {
    const col = x - 1;
    const row = y - 1;
    return row * BOARD_COLS + col;
}

// --- DOM 元素 ---
const boardEl = document.getElementById("board");
const versionEl = document.getElementById("version");
const diceImageEl = document.getElementById("dice-image");
const diceResultEl = document.getElementById("dice-result");
const rollButton = document.getElementById("roll-button");
const statusEl = document.getElementById("status");
const currentPlayerNameEl = document.getElementById("current-player-name");

if (versionEl) versionEl.textContent = "v56-base-homes";

if (!boardEl) {
    alert("❌ 錯誤：HTML 中缺少 <div id='board'></div>");
} else {
    console.log("✅ #board 元素存在");
}

// --- 遊戲狀態 ---
let currentPlayerIndex = 0;
let gameEnded = false;
let isAnimating = false;

// 玩家與棋子定義（包含基地座標）
const players = [
    { 
        id: 0, 
        name: "紅方", 
        color: "red", 
        colorClass: "red",
        // 基地區域定義
        homeArea: { x1: 13, y1: 1, x2: 15, y2: 3 },
        // 基地內 4 個棋子位置 [x, y]
        homePositions: [[13, 1], [15, 1], [13, 3], [15, 3]],
        // 棋子狀態
        pieces: Array.from({length:4}, (_, i) => ({
            status: "home", // 初始狀態：在家
            homeIndex: i,   // 在家中的索引            progress: 0,    // 在軌道上的進度
            // 附加：記錄在家時的具體座標
            homeCoord: [13, 1] // 會在 initGame 中更新
        }))
    },
    { 
        id: 1, 
        name: "藍方", 
        color: "blue", 
        colorClass: "blue",
        homeArea: { x1: 1, y1: 1, x2: 3, y2: 3 },
        homePositions: [[1,1], [3,1], [1,3], [3,3]],
        pieces: Array.from({length:4}, (_, i) => ({
            status: "home",
            homeIndex: i,
            progress: 0,
            homeCoord: [1, 1]
        }))
    },
    { 
        id: 2, 
        name: "綠方", 
        color: "green", 
        colorClass: "green",
        homeArea: { x1: 1, y1: 13, x2: 3, y2: 15 },
        homePositions: [[1,13], [3,13], [1,15], [3,15]],
        pieces: Array.from({length:4}, (_, i) => ({
            status: "home",
            homeIndex: i,
            progress: 0,
            homeCoord: [1, 13]
        }))
    },
    { 
        id: 3, 
        name: "黃方", 
        color: "yellow", 
        colorClass: "yellow",
        homeArea: { x1: 13, y1: 13, x2: 15, y2: 15 },
        homePositions: [[13,13], [15,13], [13,15], [15,15]],
        pieces: Array.from({length:4}, (_, i) => ({
            status: "home",
            homeIndex: i,
            progress: 0,
            homeCoord: [13, 13]
        }))
    },
];

// --- 路徑定義 (簡化版，僅包含起飛點和終點隧道入口/出口) ---// 起飛點
const startCellsXY = {
    blue: [1,4],
    red: [12,1],
    green: [4,15],
    yellow: [15,12],
};
const startCells = {
    blue: xyToIndex(...startCellsXY.blue),
    red: xyToIndex(...startCellsXY.red),
    green: xyToIndex(...startCellsXY.green),
    yellow: xyToIndex(...startCellsXY.yellow),
};

// 終點隧道入口
const homeEntryCellsXY = {
    red: [8,1],
    yellow: [15,8],
    green: [8,15],
    blue: [1,8],
};

// 家區終點 (簡化：直接連接到終點)
const homePaths = {
    red: [],
    yellow: [],
    green: [],
    blue: []
};

// --- 核心邏輯 ---

function updateCurrentPlayerDisplay() {
    const p = players[currentPlayerIndex];
    if (currentPlayerNameEl) currentPlayerNameEl.textContent = p.name;
    if (currentPlayerNameEl) {
        currentPlayerNameEl.classList.remove(
            "player-red", "player-blue", "player-green", "player-yellow"
        );
        if (p.color === "red") currentPlayerNameEl.classList.add("player-red");
        if (p.color === "blue") currentPlayerNameEl.classList.add("player-blue");
        if (p.color === "green") currentPlayerNameEl.classList.add("player-green");
        if (p.color === "yellow") currentPlayerNameEl.classList.add("player-yellow");
    }
}

function setStatus(message) {
    if (statusEl) statusEl.textContent = message;
}
function setDiceIdle() {
    if (diceImageEl) {
        diceImageEl.src = "images/dice-blank.svg";
        diceImageEl.alt = "Dice idle";
    }
    if (diceResultEl) diceResultEl.textContent = "";
}

function handleRollDice() {
    console.log("🎲 [handleRollDice] 擲骰子按鈕被點擊");
    
    if (isAnimating) return;
    isAnimating = true;
    if (rollButton) rollButton.disabled = true;
    
    if (diceImageEl) {
        diceImageEl.classList.add("is-rolling");
        diceImageEl.src = "images/dice-blank.svg";
    }
    if (statusEl) statusEl.textContent = "骰子動畫中...";

    let rollCount = 0;
    const maxRolls = 10;
    const rollInterval = setInterval(() => {
        const tempNum = Math.floor(Math.random() * 6) + 1;
        if (diceImageEl) {
            diceImageEl.src = `images/dice-${tempNum}.svg`;
        }
        if (diceResultEl) diceResultEl.textContent = tempNum.toString();
        
        rollCount++;
        if (rollCount >= maxRolls) {
            clearInterval(rollInterval);
            
            const finalDice = Math.floor(Math.random() * 6) + 1;
            if (diceImageEl) {
                diceImageEl.classList.remove("is-rolling");
                diceImageEl.src = `images/dice-${finalDice}.svg`;
            }
            if (diceResultEl) diceResultEl.textContent = finalDice.toString();
            
            setStatus(`您擲出了 ${finalDice} 點！`);
            
            setTimeout(() => {
                if (rollButton) {
                    rollButton.disabled = false;
                    isAnimating = false;
                }
            }, 1500);
        }    }, 100);
}

// 初始化棋盤網格
function initBoard() {
    if (!boardEl) return;
    
    boardEl.innerHTML = "";
    boardEl.style.display = "grid";
    boardEl.style.gridTemplateColumns = `repeat(${BOARD_COLS}, 26px)`;
    boardEl.style.gridTemplateRows = `repeat(${BOARD_ROWS}, 26px)`;
    boardEl.style.gap = "2px";
    boardEl.style.background = "#fff";
    boardEl.style.borderRadius = "8px";
    boardEl.style.padding = "8px";

    // 創建 225 個格子
    for (let r = 0; r < BOARD_ROWS; r++) {
        for (let c = 0; c < BOARD_COLS; c++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.style.width = "26px";
            cell.style.height = "26px";
            cell.style.border = "1px solid #d9d9d9";
            cell.style.position = "relative";
            cell.style.backgroundColor = "#fafafa";
            
            // 檢查是否為家區
            const x = c + 1; // 1-based
            const y = r + 1; // 1-based
            
            if (x >= 1 && x <= 3 && y >= 1 && y <= 3) cell.classList.add("cell-home-blue");
            if (x >= 13 && x <= 15 && y >= 1 && y <= 3) cell.classList.add("cell-home-red");
            if (x >= 1 && x <= 3 && y >= 13 && y <= 15) cell.classList.add("cell-home-green");
            if (x >= 13 && x <= 15 && y >= 13 && y <= 15) cell.classList.add("cell-home-yellow");
            
            // 檢查是否為起飛點
            if (x === 1 && y === 4) cell.classList.add("start-blue");
            if (x === 12 && y === 1) cell.classList.add("start-red");
            if (x === 4 && y === 15) cell.classList.add("start-green");
            if (x === 15 && y === 12) cell.classList.add("start-yellow");

            boardEl.appendChild(cell);
        }
    }
    console.log(`✅ [initBoard] 成功創建 ${boardEl.children.length} 個格子`);
}

// 渲染棋子（基地 + 軌道）
function renderPieces() {    if (!boardEl) return;
    const cells = boardEl.getElementsByClassName("cell");
    if (cells.length === 0) return;
    
    // 清除所有舊棋子
    for (let cell of cells) {
        const old = cell.querySelector(".pieces-container");
        if (old) cell.removeChild(old);
    }
    
    // 渲染所有棋子
    players.forEach((player) => {
        player.pieces.forEach((piece) => {
            let cellIndex;
            
            // 決定棋子位置
            if (piece.status === "home") {
                // 在基地內
                const [x, y] = player.homePositions[piece.homeIndex];
                cellIndex = xyToIndex(x, y);
            } else if (piece.status === "track" && piece.progress === 0) {
                // 在起飛點
                cellIndex = startCells[player.color];
            } else {
                // 其他狀態（軌道上）先不處理
                return; // 跳過本次循環
            }
            
            const cell = cells[cellIndex];
            if (!cell) return;
            
            // 創建容器
            const container = document.createElement("div");
            container.className = "pieces-container";
            container.style.position = "absolute";
            container.style.inset = "2px";
            container.style.display = "grid";
            container.style.gridTemplateColumns = "1fr 1fr";
            container.style.gridTemplateRows = "1fr 1fr";
            
            // 創建棋子
            const pieceEl = document.createElement("div");
            pieceEl.className = `piece ${player.colorClass}`;
            pieceEl.style.width = "14px";
            pieceEl.style.height = "14px";
            pieceEl.style.borderRadius = "50%";
            pieceEl.style.margin = "auto";
            pieceEl.style.boxShadow = "0 0 2px rgba(0,0,0,0.4)";
            
            // 設定顏色            if (player.color === "blue") pieceEl.style.backgroundColor = "#1890ff";
            if (player.color === "red")  pieceEl.style.backgroundColor = "#ff4d4f";
            if (player.color === "green")pieceEl.style.backgroundColor = "#52c41a";
            if (player.color === "yellow")pieceEl.style.backgroundColor = "#faad14";

            container.appendChild(pieceEl);
            cell.appendChild(container);
        });
    });
    console.log("✅ [renderPieces] 所有棋子（基地+起飛點）已渲染");
}

// 初始化遊戲狀態
function initGame() {
    console.log("🎮 初始化遊戲...");
    
    // 初始化棋盤
    initBoard();
    
    // 初始化玩家棋子狀態
    players.forEach((player) => {
        player.pieces.forEach((piece, i) => {
            piece.status = "home";
            piece.homeIndex = i;
            piece.progress = 0;
            // 重要：設定棋子在基地的正確座標
            piece.homeCoord = player.homePositions[i];
        });
    });
    
    currentPlayerIndex = 0;
    gameEnded = false;
    isAnimating = false;
    
    // 渲染初始棋子
    renderPieces();
    
    // 更新玩家顯示
    updateCurrentPlayerDisplay();
    
    // 重置骰子
    setDiceIdle();
    
    // 清空狀態
    setStatus("");
    
    // 啟用按鈕
    if (rollButton) {
        rollButton.disabled = false;
    }    
    console.log("✅ 遊戲初始化完成");
}

// 初始化事件監聽
function initEventListeners() {
    if (rollButton) {
        rollButton.addEventListener("click", handleRollDice);
        console.log("✅ 擲骰子按鈕事件綁定完成");
    }
}

// 啟動
window.addEventListener("DOMContentLoaded", () => {
    console.log("[CORE] DOMContentLoaded 觸發");
    initGame();
    initEventListeners();
    alert("🎉 遊戲初始化完成！\n請確認：\n• 15×15 棋盤\n• 4 個彩色家區\n• 每家 4 顆棋子在基地內\n• 4 顆棋子在起飛點\n• '擲骰子' 按鈕可點擊");
});
