// main.js - 終極修復版 (v55)
console.log("[MAIN] 開始載入...");

// 1. 安全獲取 DOM 元素（嚴格檢查空格）
const boardEl = document.getElementById("board");
const rollButton = document.getElementById("roll-button");
const diceImageEl = document.getElementById("dice-image");
const diceResultEl = document.getElementById("dice-result");
const statusEl = document.getElementById("status");
const currentPlayerNameEl = document.getElementById("current-player-name");

if (!boardEl) {
    console.error("❌ 錯誤：找不到 #board 元素！");
    alert("請檢查 index.html 是否包含 <div id='board'></div>");
} else {
    console.log("✅ #board 已找到");
}

// 2. 初始化棋盤（最簡潔版本）
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

    // 創建 225 個格子
    for (let i = 0; i < 225; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.style.width = "26px";
        cell.style.height = "26px";
        cell.style.border = "1px solid #d9d9d9";
        cell.style.backgroundColor = i === 0 ? "#ffcccb" : "#fafafa";
        boardEl.appendChild(cell);
    }
    console.log("✅ 棋盤初始化完成");
}

// 3. 渲染 4 顆棋子
function renderPieces() {
    if (!boardEl) return;
    const cells = boardEl.children;
    
    // 起飛點座標 (x, y)
    const points = [        { color: "blue", x: 1, y: 4 },   // 藍方
        { color: "red", x: 12, y: 1 },   // 紅方
        { color: "green", x: 4, y: 15 },  // 綠方
        { color: "yellow", x: 15, y: 12 } // 黃方
    ];

    points.forEach(({color, x, y}) => {
        const idx = (y-1)*15 + (x-1);
        const cell = cells[idx];
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
function handleRollDice() {
    console.log("🎲 擲骰子按鈕被點擊");
    
    if (!rollButton) return;
    rollButton.disabled = true;

    if (diceImageEl) {
        diceImageEl.add("is-rolling");
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
            
            if (statusEl) statusEl.textContent = `您擲出了 ${finalDice} 點！`;
            
            // 重新啟用按鈕
            setTimeout(() => {
                if (rollButton) rollButton.disabled = false;
            }, 1000);
        }
    }, 100);
}

// 5. 初始化
window.addEventListener("DOMContentLoaded", () => {
    console.log("[MAIN] DOMContentLoaded 觸發");
    
    // 初始化棋盤
    initBoard();
    
    // 渲染棋子
    renderPieces();
    
    // 綁定事件
    if (rollButton) {
        rollButton.addEventListener("click", handleRollDice);
        console.log("✅ 擲骰子按鈕事件已綁定");
    }
    
    // 提示
    alert("🎉 最小版已啟動！\n請確認：\n• 15×15 棋盤\n• 4 顆棋子\n• 擲骰子按鈕可點擊");
});
