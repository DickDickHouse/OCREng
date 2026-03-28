// ✅ 最小可行版：確保棋盤一定顯示
console.log("[DIAG] main.js 已載入");

const BOARD_ROWS = 15;
const BOARD_COLS = 15;

function xyToIndex(x, y) {
    return (y - 1) * BOARD_COLS + (x - 1);
}

// 1. 獲取 DOM
const boardEl = document.getElementById("board");
const versionEl = document.getElementById("version");
const rollButton = document.getElementById("roll-button");
const diceImageEl = document.getElementById("dice-image");
const diceResultEl = document.getElementById("dice-result");
const statusEl = document.getElementById("status");

if (versionEl) versionEl.textContent = "v51-minimal";

if (!boardEl) {
    alert("❌ 錯誤：HTML 中缺少 <div id='board'></div>");
} else {
    console.log("✅ #board 存在");
}

// 2. 初始化棋盤
function initBoard() {
    if (!boardEl) return;
    
    boardEl.innerHTML = "";
    boardEl.style.display = "grid";
    boardEl.style.gridTemplateColumns = "repeat(15, 26px)";
    boardEl.style.gridTemplateRows = "repeat(15, 26px)";
    boardEl.style.gap = "2px";
    boardEl.style.background = "#fff";
    boardEl.style.borderRadius = "8px";
    boardEl.style.padding = "8px";

    for (let i = 0; i < 225; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.style.width = "26px";
        cell.style.height = "26px";
        cell.style.border = "1px solid #ccc";
        cell.style.backgroundColor = i === 0 ? "#ffcccb" : "#f8f9fa";
        boardEl.appendChild(cell);
    }
    console.log("✅ 225 個格子已生成");
}
// 3. 渲染 4 顆棋子
function renderPieces() {
    if (!boardEl) return;
    
    // 起飛點座標 (x, y)
    const points = [
        { color: "blue",  pos: [1, 4] },   // 藍
        { color: "red",   pos: [12, 1] },  // 紅
        { color: "green", pos: [4, 15] },  // 綠
        { color: "yellow",pos: [15, 12] }  // 黃
    ];

    points.forEach(({color, pos}) => {
        const idx = xyToIndex(pos[0], pos[1]);
        const cell = boardEl.children[idx];
        if (!cell) return;

        const container = document.createElement("div");
        container.className = "pieces-container";
        container.style.position = "absolute";
        container.style.inset = "2px";
        container.style.display = "grid";
        container.style.gridTemplateColumns = "1fr 1fr";
        container.style.gridTemplateRows = "1fr 1fr";

        const piece = document.createElement("div");
        piece.className = `piece ${color}`;
        piece.style.width = "14px";
        piece.style.height = "14px";
        piece.style.borderRadius = "50%";
        piece.style.margin = "auto";
        piece.style.boxShadow = "0 0 2px rgba(0,0,0,0.4)";
        piece.style.backgroundColor = 
            color === "blue" ? "#1890ff" :
            color === "red"  ? "#ff4d4f" :
            color === "green"? "#52c41a" : "#faad14";

        container.appendChild(piece);
        cell.appendChild(container);
    });
    console.log("✅ 4 顆棋子已渲染");
}

// 4. 擲骰子功能（僅 UI）
function handleRoll() {
    if (!rollButton) return;
    rollButton.disabled = true;
    
    if (diceImageEl) {        diceImageEl.classList.add("is-rolling");
        diceImageEl.src = "images/dice-3.svg"; // 先顯示一個圖
    }
    if (diceResultEl) diceResultEl.textContent = "3";
    if (statusEl) statusEl.textContent = "骰出 3 點！";

    setTimeout(() => {
        if (diceImageEl) diceImageEl.classList.remove("is-rolling");
        if (rollButton) rollButton.disabled = false;
    }, 1000);
}

// 5. 啟動
window.addEventListener("DOMContentLoaded", () => {
    console.log("[DIAG] DOMContentLoaded 觸發");
    initBoard();
    renderPieces();
    
    if (rollButton) {
        rollButton.addEventListener("click", handleRoll);
        console.log("✅ 擲骰子按鈕綁定完成");
    }
    
    alert("🎉 最小版已啟動！\n請確認：\n• 15×15 棋盤\n• 4 顆棋子\n• 擲骰子按鈕可點擊");
});
