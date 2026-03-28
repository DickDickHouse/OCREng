// ✅ 零錯誤診斷版 —— 2025-03-29 測試通過
console.log("[DIAG] main.js 已載入");

// 1. 確認 DOM 元素
const boardEl = document.getElementById("board");
if (!boardEl) {
    alert("❌ 錯誤：HTML 中缺少 <div id='board'></div>");
} else {
    console.log("✅ #board 存在");
}

// 2. 初始化棋盤（15×15）
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
        cell.style.width = "26px";
        cell.style.height = "26px";
        cell.style.border = "1px solid #ccc";
        cell.style.backgroundColor = i === 0 ? "#ffcccb" : "#f8f9fa";
        boardEl.appendChild(cell);
    }
    console.log("✅ 225 個格子已生成");
    
    // 🔥 強制彈窗（關鍵！）
    setTimeout(() => {
        alert("🎉 成功！棋盤已生成。\n請看畫面：15×15 網格，左上角第一格為淡紅色。");
    }, 300);
}

// 3. 啟動
document.addEventListener("DOMContentLoaded", () => {
    console.log("[DIAG] DOMContentLoaded 觸發");
    initBoard();
});
