// 🚨 診斷專用版：僅測試棋盤能否生成（120 行內）
console.log("[DIAG] main.js 加載中...");

// 1. 檢查 #board 元素是否存在
const boardEl = document.getElementById("board");
if (!boardEl) {
    alert("❌ [1] 錯誤：HTML 中沒有 <div id='board'></div>！");
    console.error("boardEl is null");
} else {
    console.log("[DIAG] ✅ 找到 #board 元素");
}

// 2. 初始化棋盤（僅創建 15x15 格子）
function initBoard() {
    if (!boardEl) return;
    
    console.log("[DIAG] [2] 開始生成棋盤...");
    boardEl.innerHTML = "";
    boardEl.style.display = "grid";
    boardEl.style.gridTemplateColumns = "repeat(15, 26px)";
    boardEl.style.gridTemplateRows = "repeat(15, 26px)";
    boardEl.style.gap = "2px";
    boardEl.style.background = "#fff";
    boardEl.style.borderRadius = "8px";
    boardEl.style.padding = "8px";

    for (let i = 0; i < 225; i++) { // 15×15=225
        const cell = document.createElement("div");
        cell.style.width = "26px";
        cell.style.height = "26px";
        cell.style.border = "1px solid #ccc";
        cell.style.backgroundColor = i === 0 ? "#ffcccb" : "#f8f9fa"; // 第一格標紅
        boardEl.appendChild(cell);
    }

    console.log("[DIAG] ✅ 成功添加 225 個格子");
    alert("🎉 [3] 棋盤格子已生成！\n請查看畫面：\n• 是否出現 15×15 網格？\n• 左上角第一格應為淡紅色");
}

// 3. 在頁面載入完成時執行
window.addEventListener("DOMContentLoaded", () => {
    console.log("[DIAG] DOMContentLoaded 觸發");
    setTimeout(initBoard, 300); // 確保 DOM 穩定
});
