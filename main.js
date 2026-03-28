// ✅ 階段2：靜態棋盤 + 棋子 + 擲骰子按鈕互動（UI層）
console.log("[STAGE 2] main.js 加載中...");

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
const diceImageEl = document.getElementById("dice-image");
const diceResultEl = document.getElementById("dice-result");
const rollButton = document.getElementById("roll-button");
const statusEl = document.getElementById("status");

if (versionEl) versionEl.textContent = "v48-stage2";

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
        cell.style.position = "relative";        cell.style.backgroundColor = "#fafafa";
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
        if (color === "green")piece.style.backgroundColor = "#52c41a";        if (color === "yellow")piece.style.backgroundColor = "#faad14";

        container.appendChild(piece);
        cell.appendChild(container);
    });

    console.log("✅ [renderStartPieces] 4 顆棋子已渲染完成");
}

// 4. 擲骰子邏輯（僅 UI 反饋，不觸發遊戲邏輯）
function handleRollDice() {
    console.log("🎲 [handleRollDice] 擲骰子按鈕被點擊");
    
    // 1. 按鈕禁用（防止重複點擊）
    if (rollButton) {
        rollButton.disabled = true;
        console.log("🔒 擲骰子按鈕已禁用");
    }
    
    // 2. 重置骰子狀態
    if (diceImageEl) {
        diceImageEl.classList.remove("is-rolling");
        diceImageEl.src = "images/dice-blank.svg";
        diceImageEl.alt = "Dice rolling...";
    }
    if (diceResultEl) diceResultEl.textContent = "";
    if (statusEl) statusEl.textContent = "骰子動畫中...";

    // 3. 開始動畫
    if (diceImageEl) {
        diceImageEl.classList.add("is-rolling");
    }

    let rollCount = 0;
    const maxRolls = 10;
    const rollInterval = setInterval(() => {
        const tempNum = Math.floor(Math.random() * 6) + 1;
        if (diceImageEl) {
            diceImageEl.src = `images/dice-${tempNum}.svg`;
            diceImageEl.alt = `Dice ${tempNum}`;
        }
        if (diceResultEl) diceResultEl.textContent = tempNum.toString();
        
        rollCount++;
        if (rollCount >= maxRolls) {
            clearInterval(rollInterval);
            
            // 4. 停止動畫，顯示最終結果
            const finalDice = Math.floor(Math.random() * 6) + 1;
            if (diceImageEl) {                diceImageEl.classList.remove("is-rolling");
                diceImageEl.src = `images/dice-${finalDice}.svg`;
                diceImageEl.alt = `Dice ${finalDice}`;
            }
            if (diceResultEl) diceResultEl.textContent = finalDice.toString();
            
            // 5. 更新狀態
            if (statusEl) statusEl.textContent = `您擲出了 ${finalDice} 點！`;
            
            // 6. 重新啟用按鈕
            if (rollButton) {
                rollButton.disabled = false;
                console.log("✅ 擲骰子按鈕已啟用");
            }
            
            console.log(`✅ [handleRollDice] 擲出 ${finalDice} 點`);
        }
    }, 100); // 每 100ms 換一次圖片
}

// 5. 初始化按鈕事件監聽
function initEventListeners() {
    if (rollButton) {
        rollButton.disabled = false; // 啟用按鈕
        rollButton.addEventListener("click", handleRollDice);
        console.log("✅ [initEventListeners] 擲骰子按鈕事件監聽已綁定");
    }
}

// 6. 啟動
window.addEventListener("DOMContentLoaded", () => {
    console.log("[STAGE 2] DOMContentLoaded 觸發");
    initBoard();
    setTimeout(() => {
        renderStartPieces();
        initEventListeners(); // 在棋子渲染後綁定事件
        alert("🎉 階段2完成！\n請確認畫面：\n• 棋盤 + 4 顆棋子\n• '擲骰子' 按鈕已啟用\n• 點擊按鈕可看到動畫和結果");
    }, 400);
});
