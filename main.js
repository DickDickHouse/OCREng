// ✅ 階段4：棋盤 + 棋子 + 擲骰子（隨機）+ 玩家狀態
console.log("[STAGE 4] main.js 加載中...");

const BOARD_ROWS = 15;
const BOARD_COLS = 15;

function xyToIndex(x, y) {
    const col = x - 1;
    const row = y - 1;
    return row * BOARD_COLS + col;
}

// --- 遊戲狀態 ---
let currentPlayerIndex = 0;
let gameEnded = false;
let isAnimating = false; // 控制按鈕是否可點

const players = [
    { id:0, name: "紅方", color: "red", colorClass: "red", pieces: Array.from({length:4}, (_,i) => ({status: "home", homeIndex:i, progress:0})) },
    { id:1, name: "藍方", color: "blue", colorClass: "blue", pieces: Array.from({length:4}, (_,i) => ({status: "home", homeIndex:i, progress:0})) },
    { id:2, name: "綠方", color: "green", colorClass: "green", pieces: Array.from({length:4}, (_,i) => ({status: "home", homeIndex:i, progress:0})) },
    { id:3, name: "黃方", color: "yellow", colorClass: "yellow", pieces: Array.from({length:4}, (_,i) => ({status: "home", homeIndex:i, progress:0})) },
];

// --- DOM 元素 ---
const boardEl = document.getElementById("board");
const versionEl = document.getElementById("version");
const diceImageEl = document.getElementById("dice-image");
const diceResultEl = document.getElementById("dice-result");
const rollButton = document.getElementById("roll-button");
const statusEl = document.getElementById("status");
const currentPlayerNameEl = document.getElementById("current-player-name");

if (versionEl) versionEl.textContent = "v52-stage4";

if (!boardEl) {
    alert("❌ 錯誤：HTML 中缺少 <div id='board'></div>");
} else {
    console.log("✅ #board 元素存在");
}

// --- 核心邏輯 ---

function randomDice() {
    return Math.floor(Math.random() * 6) + 1;
}

function updateCurrentPlayerDisplay() {
    const p = players[currentPlayerIndex];
    if (currentPlayerNameEl) currentPlayerNameEl.textContent = p.name;    if (currentPlayerNameEl) {
        // 移除舊的顏色類別
        currentPlayerNameEl.classList.remove(
            "player-red", "player-blue", "player-green", "player-yellow"
        );
        // 添加新的顏色類別
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
        diceImageEl.classList.add("is-idle");
        diceImageEl.src = "images/dice-blank.svg";
        diceImageEl.alt = "Dice idle";
    }
    if (diceResultEl) diceResultEl.textContent = "";
}

function setDiceRolling(isRolling) {
    if (!diceImageEl) return;
    diceImageEl.classList.toggle("is-rolling", isRolling);
}

function handleRollDice() {
    console.log("🎲 [handleRollDice] 擲骰子按鈕被點擊");
    
    // 防止重複點擊
    if (isAnimating) {
        console.log("⚠️ 正在動畫中，忽略點擊");
        return;
    }
    
    const player = players[currentPlayerIndex];
    isAnimating = true; // 開始動畫，禁止點擊
    
    if (rollButton) {
        rollButton.disabled = true;
        console.log("🔒 擲骰子按鈕已禁用");
    }
    
    // 重置骰子狀態
    if (diceImageEl) {        diceImageEl.classList.remove("is-idle");
        diceImageEl.src = "images/dice-blank.svg";
        diceImageEl.alt = "Dice rolling...";
    }
    if (diceResultEl) diceResultEl.textContent = "";
    setStatus("骰子動畫中...");

    // 開始動畫
    if (diceImageEl) {
        diceImageEl.classList.add("is-rolling");
    }

    let rollCount = 0;
    const maxRolls = 10;
    const rollInterval = setInterval(() => {
        const tempNum = randomDice(); // 每次都隨機產生
        if (diceImageEl) {
            diceImageEl.src = `images/dice-${tempNum}.svg`;
            diceImageEl.alt = `Dice ${tempNum}`;
        }
        if (diceResultEl) diceResultEl.textContent = tempNum.toString();
        
        rollCount++;
        if (rollCount >= maxRolls) {
            clearInterval(rollInterval);
            
            // 停止動畫，顯示最終結果
            const finalDice = randomDice(); // 最後結果也隨機
            if (diceImageEl) {
                diceImageEl.classList.remove("is-rolling");
                diceImageEl.src = `images/dice-${finalDice}.svg`;
                diceImageEl.alt = `Dice ${finalDice}`;
            }
            if (diceResultEl) diceResultEl.textContent = finalDice.toString();
            
            // 更新狀態
            setStatus(`${player.name} 擲出了 ${finalDice} 點！`);
            
            // 簡單換玩家邏輯（每擲一次就換人）
            setTimeout(() => {
                currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
                updateCurrentPlayerDisplay();
                setStatus(`${player.name} 的回合結束，輪到 ${players[currentPlayerIndex].name}`);
                
                // 重新啟用按鈕
                if (rollButton) {
                    rollButton.disabled = false;
                    isAnimating = false; // 重置動畫狀態
                    console.log("✅ 擲骰子按鈕已啟用");
                }            }, 1500); // 等待 1.5 秒後換人
        }
    }, 100); // 每 100ms 換一次圖片
}

function initBoard() {
    if (!boardEl) {
        setStatus("錯誤：找不到棋盤元素！", true);
        return;
    }
    boardEl.innerHTML = "";
    boardEl.style.display = "grid";
    boardEl.style.gridTemplateColumns = `repeat(${BOARD_COLS}, 26px)`;
    boardEl.style.gridTemplateRows = `repeat(${BOARD_ROWS}, 26px)`;
    boardEl.style.gap = "2px";
    boardEl.style.background = "#fff";
    boardEl.style.borderRadius = "8px";
    boardEl.style.padding = "8px";

    // 重新創建所有格子
    for (let r = 0; r < BOARD_ROWS; r++) {
        for (let c = 0; c < BOARD_COLS; c++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.style.width = "26px";
            cell.style.height = "26px";
            cell.style.border = "1px solid #d9d9d9";
            cell.style.position = "relative";
            cell.style.backgroundColor = "#fafafa";
            boardEl.appendChild(cell);
        }
    }
    console.log(`✅ [initBoard] 成功創建 ${boardEl.children.length} 個格子`);
}

function renderPieces() {
    if (!boardEl) return;
    const cells = boardEl.getElementsByClassName("cell");
    if (cells.length === 0) return;
    
    // 清除舊的 pieces-container
    for (let cell of cells) {
        const old = cell.querySelector(".pieces-container");
        if (old) cell.removeChild(old);
    }
    
    // 重新渲染棋子（目前只渲染起飛點的棋子作為示意）
    const startPoints = [
        { color: "blue",  pos: [1, 4] },   // 藍方
        { color: "red",   pos: [12, 1] },  // 紅方        { color: "green", pos: [4, 15] },  // 綠方
        { color: "yellow",pos: [15, 12] }  // 黃方
    ];

    startPoints.forEach(({ color, pos }) => {
        const idx = xyToIndex(pos[0], pos[1]);
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
        
        // 設定顏色
        if (color === "blue") piece.style.backgroundColor = "#1890ff";
        if (color === "red")  piece.style.backgroundColor = "#ff4d4f";
        if (color === "green")piece.style.backgroundColor = "#52c41a";
        if (color === "yellow")piece.style.backgroundColor = "#faad14";

        container.appendChild(piece);
        cell.appendChild(container);
    });

    console.log("✅ [renderPieces] 棋子已渲染");
}

function initEventListeners() {
    if (rollButton) {
        rollButton.disabled = false;
        rollButton.addEventListener("click", handleRollDice);
        console.log("✅ [initEventListeners] 擲骰子按鈕事件監聽已綁定");
    }
}

function initGame() {
    console.log("🎮 初始化遊戲...");
    // 初始化棋盤
    initBoard();    
    // 初始化遊戲狀態
    players.forEach((player) => {
        player.pieces.forEach((p, i) => {
            p.status = "home";
            p.homeIndex = i;
            p.progress = 0;
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

// 6. 啟動
window.addEventListener("DOMContentLoaded", () => {
    console.log("[STAGE 4] DOMContentLoaded 觸發");
    initGame();
    initEventListeners();
    alert("🎉 階段4完成！\n請確認畫面：\n• 棋盤 + 4 顆棋子\n• '目前玩家' 顯示正確\n• '擲骰子' 按鈕\n• 點擊按鈕可擲骰（隨機數字）\n• 擲完後換玩家");
});
