console.log("[CORE] main.js 加載中...");

const BOARD_ROWS = 15;
const BOARD_COLS = 15;

function xyToIndex(x, y) {
    const col = x - 1;
    const row = y - 1;
    return row * BOARD_COLS + col;
}

const boardEl = document.getElementById("board");
const versionEl = document.getElementById("version");
const diceImageEl = document.getElementById("dice-image");
const diceResultEl = document.getElementById("dice-result");
const rollButton = document.getElementById("roll-button");
const statusEl = document.getElementById("status");
const currentPlayerNameEl = document.getElementById("current-player-name");

if (versionEl) versionEl.textContent = "v57-fixed";

if (!boardEl) {
    alert("❌ 錯誤：HTML 中缺少 <div id='board'></div>");
} else {
    console.log("✅ #board 元素存在");
}

let currentPlayerIndex = 0;
let isAnimating = false;

const players = [
    {
        id: 0,
        name: "紅方",
        color: "red",
        colorClass: "red",
        homePositions: [[13, 1], [15, 1], [13, 3], [15, 3]],
        pieces: Array.from({length:4}, (_, i) => ({
            status: "home",
            homeIndex: i,
            progress: 0
        }))
    },
    {
        id: 1,
        name: "藍方",
        color: "blue",
        colorClass: "blue",
        homePositions: [[1,1], [3,1], [1,3], [3,3]],
        pieces: Array.from({length:4}, (_, i) => ({            status: "home",
            homeIndex: i,
            progress: 0
        }))
    },
    {
        id: 2,
        name: "綠方",
        color: "green",
        colorClass: "green",
        homePositions: [[1,13], [3,13], [1,15], [3,15]],
        pieces: Array.from({length:4}, (_, i) => ({
            status: "home",
            homeIndex: i,
            progress: 0
        }))
    },
    {
        id: 3,
        name: "黃方",
        color: "yellow",
        colorClass: "yellow",
        homePositions: [[13,13], [15,13], [13,15], [15,15]],
        pieces: Array.from({length:4}, (_, i) => ({
            status: "home",
            homeIndex: i,
            progress: 0
        }))
    },
];

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

function updateCurrentPlayerDisplay() {
    const p = players[currentPlayerIndex];
    if (currentPlayerNameEl) currentPlayerNameEl.textContent = p.name;
    if (currentPlayerNameEl) {
        currentPlayerNameEl.classList.remove(            "player-red", "player-blue", "player-green", "player-yellow"
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
    console.log("🎲 擲骰子按鈕被點擊");
    
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
                diceImageEl.classList.remove("is-rolling");                diceImageEl.src = `images/dice-${finalDice}.svg`;
            }
            if (diceResultEl) diceResultEl.textContent = finalDice.toString();
            
            setStatus(`您擲出了 ${finalDice} 點！`);
            
            setTimeout(() => {
                if (rollButton) {
                    rollButton.disabled = false;
                    isAnimating = false;
                }
            }, 1500);
        }
    }, 100);
}

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
    boardEl.style.margin = "0 auto";

    for (let r = 0; r < BOARD_ROWS; r++) {
        for (let c = 0; c < BOARD_COLS; c++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.style.width = "26px";
            cell.style.height = "26px";
            cell.style.border = "1px solid #d9d9d9";
            cell.style.position = "relative";
            
            const x = c + 1;
            const y = r + 1;
            
            if (x >= 1 && x <= 3 && y >= 1 && y <= 3) cell.classList.add("cell-home-blue");
            if (x >= 13 && x <= 15 && y >= 1 && y <= 3) cell.classList.add("cell-home-red");
            if (x >= 1 && x <= 3 && y >= 13 && y <= 15) cell.classList.add("cell-home-green");
            if (x >= 13 && x <= 15 && y >= 13 && y <= 15) cell.classList.add("cell-home-yellow");
            
            if (x === 1 && y === 4) cell.classList.add("start-blue");
            if (x === 12 && y === 1) cell.classList.add("start-red");
            if (x === 4 && y === 15) cell.classList.add("start-green");
            if (x === 15 && y === 12) cell.classList.add("start-yellow");
            boardEl.appendChild(cell);
        }
    }
    console.log(`✅ 成功創建 ${boardEl.children.length} 個格子`);
}

function renderPieces() {
    if (!boardEl) return;
    const cells = boardEl.getElementsByClassName("cell");
    if (cells.length === 0) return;
    
    for (let cell of cells) {
        const old = cell.querySelector(".pieces-container");
        if (old) cell.removeChild(old);
    }
    
    players.forEach((player) => {
        player.pieces.forEach((piece) => {
            let cellIndex;
            
            if (piece.status === "home") {
                const [x, y] = player.homePositions[piece.homeIndex];
                cellIndex = xyToIndex(x, y);
            } else {
                return;
            }
            
            const cell = cells[cellIndex];
            if (!cell) return;
            
            const container = document.createElement("div");
            container.className = "pieces-container";
            container.style.position = "absolute";
            container.style.inset = "2px";
            container.style.display = "grid";
            container.style.gridTemplateColumns = "1fr 1fr";
            container.style.gridTemplateRows = "1fr 1fr";
            
            const pieceEl = document.createElement("div");
            pieceEl.className = `piece ${player.colorClass}`;
            pieceEl.style.width = "14px";
            pieceEl.style.height = "14px";
            pieceEl.style.borderRadius = "50%";
            pieceEl.style.margin = "auto";
            pieceEl.style.boxShadow = "0 0 2px rgba(0,0,0,0.4)";
            
            pieceEl.style.backgroundColor =
                player.color === "blue" ? "#1890ff" :
                player.color === "red" ? "#ff4d4f" :                player.color === "green" ? "#52c41a" : "#faad14";
            
            container.appendChild(pieceEl);
            cell.appendChild(container);
        });
    });
    console.log("✅ 所有棋子已渲染");
}

function initGame() {
    console.log("🎮 初始化遊戲...");
    
    initBoard();
    
    players.forEach((player) => {
        player.pieces.forEach((piece, i) => {
            piece.status = "home";
            piece.homeIndex = i;
            piece.progress = 0;
        });
    });
    
    currentPlayerIndex = 0;
    isAnimating = false;
    
    renderPieces();
    updateCurrentPlayerDisplay();
    setDiceIdle();
    setStatus("");
    
    if (rollButton) {
        rollButton.disabled = false;
    }
    
    console.log("✅ 遊戲初始化完成");
}

function initEventListeners() {
    if (rollButton) {
        rollButton.addEventListener("click", handleRollDice);
        console.log("✅ 擲骰子按鈕事件綁定完成");
    }
}

window.addEventListener("DOMContentLoaded", () => {
    console.log("[CORE] DOMContentLoaded 觸發");
    initGame();
    initEventListeners();
    alert("🎉 遊戲初始化完成！\n請確認：\n• 15×15 棋盤\n• 4 個彩色家區\n• 每家 4 顆棋子在基地內\n• '擲骰子' 按鈕可點擊");
});
