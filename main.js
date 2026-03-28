// ✅ 階段1：靜態棋盤 + 4 家起飛點棋子（無互動）
console.log("[STAGE 1] main.js 加載中...");

const BOARD_ROWS = 15;
const BOARD_COLS = 15;

function xyToIndex(x, y) {
    const col = x - 1;
    const row = y - 1;
    return row * BOARD_COLS + col;
}

// 1. 獲取 DOM 元素
const boardEl = document.getElementById("board");
const versionEl = document.getElementById("version");
if (versionEl) versionEl.textContent = "v47-stage1";

if (!boardEl) {
    alert("❌ 錯誤：HTML 中缺少 <div id='board'></div>");
    console.error("boardEl is null");
} else {
    console.log("✅ #board 元素存在");
}

// 2. 初始化棋盤網格
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
    for (let i = 0; i < BOARD_ROWS * BOARD_COLS; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.style.width = "26px";
        cell.style.height = "26px";
        cell.style.border = "1px solid #d9d9d9";
        cell.style.position = "relative";
        cell.style.backgroundColor = "#fafafa";
        boardEl.appendChild(cell);
    }
    console.log(`✅ [initBoard] 成功創建 ${boardEl.children.length} 個格子`);
}
// 3. 渲染 4 家起飛點棋子（靜態，無互動）
function renderStartPieces() {
    if (!boardEl) return;

    // 起飛點座標（x, y）
    const startPoints = [
        { color: "blue",  pos: [1, 4] },   // 藍方
        { color: "red",   pos: [12, 1] },  // 紅方
        { color: "green", pos: [4, 15] },  // 綠方
        { color: "yellow",pos: [15, 12] }  // 黃方
    ];

    // 移除舊的 pieces-container（防疊加）
    document.querySelectorAll(".pieces-container").forEach(el => el.remove());

    startPoints.forEach(({ color, pos }) => {
        const idx = xyToIndex(pos[0], pos[1]);
        const cell = boardEl.children[idx];
        if (!cell) {
            console.warn(`⚠️ 無法找到格子索引 ${idx}（${color} 起飛點）`);
            return;
        }

        // 創建容器
        const container = document.createElement("div");
        container.className = "pieces-container";
        container.style.position = "absolute";
        container.style.inset = "2px";
        container.style.display = "grid";
        container.style.gridTemplateColumns = "1fr 1fr";
        container.style.gridTemplateRows = "1fr 1fr";

        // 創建棋子
        const piece = document.createElement("div");
        piece.className = `piece ${color}`;
        piece.style.width = "14px";
        piece.style.height = "14px";
        piece.style.borderRadius = "50%";
        piece.style.margin = "auto";
        piece.style.boxShadow = "0 0 2px rgba(0,0,0,0.4)";
        // 設定顏色
        if (color === "blue") piece.style.backgroundColor = "#1890ff";
        if (color === "red")  piece.style.backgroundColor = "#ff4d4f";
        if (color === "green")piece.style.backgroundColor = "#52c41a";
        if (color === "yellow")piece.style.backgroundColor = "#faad14";

        container.appendChild(piece);
        cell.appendChild(container);
    });
    console.log("✅ [renderStartPieces] 4 顆棋子已渲染完成");
    alert("🎉 階段1完成！\n請確認畫面：\n• 15×15 棋盤網格\n• 4 顆棋子分別在：\n  藍：(1,4)｜紅：(12,1)\n  綠：(4,15)｜黃：(15,12)");
}

// 4. 啟動
window.addEventListener("DOMContentLoaded", () => {
    console.log("[STAGE 1] DOMContentLoaded 觸發");
    initBoard();
    setTimeout(renderStartPieces, 400);
});
