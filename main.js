// ✅ 階段3：棋盤 + 棋子 + 擲骰子 + 棋子移動邏輯
console.log("[STAGE 3] main.js 加載中...");

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
let isAnimating = false;
let isWaitingForPieceSelection = false;
let validMovePieces = [];
let currentDiceValue = 0;

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

if (versionEl) versionEl.textContent = "v49-stage3";

if (!boardEl) {
    alert("❌ 錯誤：HTML 中缺少 <div id='board'></div>");
    console.error("boardEl is null");
} else {
    console.log("✅ #board 元素存在");
}

// --- 遊戲配置 ---
const launchRule = "6"; // 設定為 6 點起飛

function canLaunchWithDice(dice) {
    if (launchRule === "even") return dice % 2 === 0;    if (launchRule === "odd") return dice % 2 === 1;
    return dice === 6;
}

// --- 棋盤路徑定義 ---
const basePathWithColor = [
    [2,5, "blue"], [3,5, "blue"], [4,5, "blue"],
    [5,4, "green"], [5,3, "blue"], [5,2, "blue"], [5,1, "blue"],
    [6,1, "green"], [7,1, "blue"], [8,1, "red"], [9,1, "yellow"], [10,1, "green"],
    [11,1, "blue"], [11,2, "red"], [11,3, "yellow"], [11,4, "green"],
    [12,5, "blue"], [13,5, "red"], [14,5, "yellow"], [15,5, "green"],
    [15,6, "blue"], [15,7, "red"], [15,8, "yellow"], [15,9, "green"],
    [15,10, "blue"], [15,11, "red"],
    [14,11, "yellow"], [13,11, "green"], [12,11, "blue"],
    [11,12, "red"], [11,13, "yellow"], [11,14, "green"], [11,15, "blue"],
    [10,15, "red"], [9,15, "yellow"], [8,15, "green"],
    [7,15, "blue"], [6,15, "red"], [5,15, "yellow"],
    [5,14, "green"], [5,13, "blue"], [5,12, "red"],
    [4,11, "yellow"], [3,11, "green"], [2,11, "blue"],
    [1,11, "red"], [1,10, "yellow"], [1,9, "green"], [1,8, "blue"],
    [1,7, "red"], [1,6, "yellow"], [1,5, "green"]
];

const basePath = [];
const baseIndexByCell = new Map();

basePathWithColor.forEach(([x,y,color]) => {
    const idx = xyToIndex(x,y);
    baseIndexByCell.set(idx, basePath.length);
    basePath.push(idx);
    // boardCells[idx] 邏輯在 initBoard 中處理
});

const PATH_LENGTH = basePath.length;

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

const startStepXY = {    blue: [2,5],
    red: [11,2],
    green: [5,14],
    yellow: [14,11],
};

const playerStartIndex = {
    blue: baseIndexByCell.get(xyToIndex(...startStepXY.blue)),
    red: baseIndexByCell.get(xyToIndex(...startStepXY.red)),
    green: baseIndexByCell.get(xyToIndex(...startStepXY.green)),
    yellow: baseIndexByCell.get(xyToIndex(...startStepXY.yellow)),
};

const homeEntryCellsXY = {
    red: [8,1],
    yellow: [15,8],
    green: [8,15],
    blue: [1,8],
};

const homeEntryIndex = {
    red: baseIndexByCell.get(xyToIndex(...homeEntryCellsXY.red)),
    yellow: baseIndexByCell.get(xyToIndex(...homeEntryCellsXY.yellow)),
    green: baseIndexByCell.get(xyToIndex(...homeEntryCellsXY.green)),
    blue: baseIndexByCell.get(xyToIndex(...homeEntryCellsXY.blue)),
};

function lineCoords(x1,y1,x2,y2) {
    const coords = [];
    if (x1 === x2) {
        const step = y1 <= y2 ? 1 : -1;
        for (let y = y1; y !== y2 + step; y += step) coords.push([x1,y]);
    } else if (y1 === y2) {
        const step = x1 <= x2 ? 1 : -1;
        for (let x = x1; x !== x2 + step; x += step) coords.push([x,y1]);
    }
    return coords;
}

const homePaths = {
    red:   lineCoords(8,2,8,7).map(([x,y]) => xyToIndex(x,y)),
    yellow:lineCoords(14,8,9,8).map(([x,y]) => xyToIndex(x,y)),
    green: lineCoords(8,14,8,9).map(([x,y]) => xyToIndex(x,y)),
    blue:  lineCoords(2,8,7,8).map(([x,y]) => xyToIndex(x,y)),
};

// --- 遊戲邏輯 ---

function baseIndexToProgress(color, baseIndex) {
    return (baseIndex - playerStartIndex[color] + PATH_LENGTH) % PATH_LENGTH;}

function homeList(x1,y1,x2,y2) {
    const list = [];
    for (let y = y1; y <= y2; y++) {
        for (let x = x1; x <= x2; x++) list.push(xyToIndex(x,y));
    }
    return list;
}

const homePositionsFull = {
    blue:  homeList(1,1,3,3),
    red:   homeList(13,1,15,3),
    green: homeList(1,13,3,15),
    yellow:homeList(13,13,15,15),
};

const homePositions = {
    blue:  homePositionsFull.blue.slice(0,4),
    red:   homePositionsFull.red.slice(0,4),
    green: homePositionsFull.green.slice(0,4),
    yellow:homePositionsFull.yellow.slice(0,4),
};

// 生成玩家路徑
const playerPaths = {};
Object.keys(startCells).forEach((color) => {
    const startIndex = playerStartIndex[color];
    const entryIndex = homeEntryIndex[color];
    const path = [];
    let idx = startIndex;
    let count = 0;
    const maxIterations = PATH_LENGTH + 10;
    
    while (count < maxIterations) {
        path.push(basePath[idx]);
        if (idx === entryIndex) break;
        idx = (idx + 1) % PATH_LENGTH;
        count++;
    }
    
    playerPaths[color] = path.concat(homePaths[color]);
});

function getPieceCellIndex(player, piece) {
    if (piece.status === "home") return homePositions[player.color][piece.homeIndex];
    if (piece.status === "track" && piece.progress === 0) return startCells[player.color];
    if (piece.status === "track" && piece.progress > 0) {
        if (piece.progress - 1 < playerPaths[player.color].length) {
            return playerPaths[player.color][piece.progress - 1];        }
    }
    return homePositions[player.color][0];
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

    // 重新創建所有格子並應用路徑顏色
    for (let r = 0; r < BOARD_ROWS; r++) {
        for (let c = 0; c < BOARD_COLS; c++) {
            const idx = xyToIndex(c+1, r+1); // c+1, r+1 因為 xyToIndex 期望 1-based
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.index = idx; // 用 dataset 來標記索引，方便除錯

            // 檢查是否為路徑格子並添加類別
            const baseIdx = basePath.indexOf(idx);
            if (baseIdx !== -1) {
                cell.classList.add("cell-path");
                // 找到是哪個顏色的路徑
                for (const [color, path] of Object.entries(playerPaths)) {
                    if (path.includes(idx)) {
                        cell.classList.add(`cell-path-${color}`);
                        break;
                    }
                }
            }
            
            // 檢查是否為家區
            if (homePositionsFull.blue.includes(idx)) cell.classList.add("cell-home-blue");
            if (homePositionsFull.red.includes(idx)) cell.classList.add("cell-home-red");
            if (homePositionsFull.green.includes(idx)) cell.classList.add("cell-home-green");
            if (homePositionsFull.yellow.includes(idx)) cell.classList.add("cell-home-yellow");
            
            // 檢查是否為起飛點
            if (idx === startCells.blue) cell.classList.add("start-blue");
            if (idx === startCells.red) cell.classList.add("start-red");
            if (idx === startCells.green) cell.classList.add("start-green");            if (idx === startCells.yellow) cell.classList.add("start-yellow");

            boardEl.appendChild(cell);
        }
    }
    console.log(`✅ [initBoard] 成功創建 ${boardEl.children.length} 個格子`);
}

function renderPieces() {
    if (!boardEl) return;
    const cells = boardEl.getElementsByClassName("cell");
    if (cells.length === 0) return;
    
    for (let cell of cells) {
        const old = cell.querySelector(".pieces-container");
        if (old) cell.removeChild(old);
    }
    
    const cellPiecesMap = new Map();
    players.forEach((player) => {
        player.pieces.forEach((piece) => {
            const cellIndex = getPieceCellIndex(player, piece);
            if (!cellPiecesMap.has(cellIndex)) cellPiecesMap.set(cellIndex, []);
            cellPiecesMap.get(cellIndex).push({ player, piece });
        });
    });
    
    cellPiecesMap.forEach((list, cellIndex) => {
        const cell = cells[cellIndex];
        if (!cell) return;
        const container = document.createElement("div");
        container.className = "pieces-container";
        
        list.forEach(({ player, piece }) => {
            const pieceEl = document.createElement("div");
            pieceEl.className = `piece ${player.colorClass}`;
            
            if (isWaitingForPieceSelection) {
                const isValid = validMovePieces.some(m => m.piece === piece);
                if (isValid) {
                    pieceEl.classList.add("selectable");
                    pieceEl.onclick = (e) => {
                        e.stopPropagation();
                        handlePieceClick(player, piece);
                    };
                }
            }
            
            container.appendChild(pieceEl);
        });        
        cell.appendChild(container);
    });
}

function randomDice() {
    return Math.floor(Math.random() * 6) + 1;
}

function animateMovePiece(player, piece, targetProgress, onComplete) {
    const start = piece.progress;
    const end = targetProgress;
    if (end <= start) { 
        onComplete && onComplete(); 
        return; 
    }
    let current = start;
    const stepTime = 200;
    function moveOne() {
        current += 1;
        piece.progress = current;
        renderPieces();
        if (current < end) setTimeout(moveOne, stepTime);
        else onComplete && onComplete();
    }
    moveOne();
}

function getValidMoves(player, dice) {
    const moves = [];
    const maxProgress = playerPaths[player.color].length;
    
    // 檢查起飛
    if (canLaunchWithDice(dice)) {
        player.pieces.forEach((piece, index) => {
            if (piece.status === "home") {
                moves.push({ type: "home", pieceIndex: index, piece: piece, steps: dice });
            }
        });
    }
    
    // 檢查軌道上的棋子
    player.pieces.forEach((piece, index) => {
        if (piece.status === "track") {
            const target = piece.progress + dice;
            if (target <= maxProgress) {
                moves.push({ type: "track", pieceIndex: index, piece: piece, target: target, steps: dice });
            }
        }
    });    
    return moves;
}

function formatStatus(player, message) {
    return `${player.name}：${message}`;
}

function performMove(player, moveInfo, done) {
    if (!moveInfo) {
        done(false);
        return;
    }
    
    if (moveInfo.type === "home") {
        moveInfo.piece.status = "track";
        moveInfo.piece.progress = 0;
        setStatus(formatStatus(player, "棋子起飛了!"));
        renderPieces();
        done(true, moveInfo.piece);
        return;
    }
    
    animateMovePiece(player, moveInfo.piece, moveInfo.target, () => {
        setStatus(formatStatus(player, `棋子向前 ${moveInfo.steps} 格`));
        done(true, moveInfo.piece);
    });
}

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

function finalizeTurn() {
    setDiceRolling(false);
    setDiceIdle();
    isWaitingForPieceSelection = false;
    validMovePieces = [];
    isAnimating = false;
        if (!gameEnded) {
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        updateCurrentPlayerDisplay();
        if (rollButton) {
            rollButton.disabled = false;
        }
    }
}

function handleTurnEnd(player, moved, dice) {
    if (gameEnded) {
        return;
    }

    const extraTurn = (dice === 6);

    if (extraTurn) {
        setStatus(`${player.name} 擲到 6 點，獲得額外回合！`);
        isAnimating = false;
        if (rollButton) {
            rollButton.disabled = false;
        }
    } else {
        finalizeTurn();
    }
}

function handlePieceClick(player, piece) {
    if (!isWaitingForPieceSelection) {
        return;
    }
    
    const moveInfo = validMovePieces.find(m => m.piece === piece);
    if (!moveInfo) {
        return;
    }
    
    isWaitingForPieceSelection = false;
    validMovePieces = [];
    if (rollButton) rollButton.disabled = true;
    
    performMove(player, moveInfo, (moved, movedPiece) => {
        if (moved) {
            handleTurnEnd(player, moved, currentDiceValue);
        } else {
            finalizeTurn();
        }
    });
}
function handleRollDice() {
    console.log("🎲 [handleRollDice] 擲骰子按鈕被點擊");
    
    if (gameEnded) return;
    if (isAnimating) return;
    if (isWaitingForPieceSelection) return;
    
    const player = players[currentPlayerIndex];
    
    isAnimating = true;
    if (rollButton) rollButton.disabled = true;
    
    // 開始動畫
    if (diceImageEl) {
        diceImageEl.classList.remove("is-idle");
        diceImageEl.classList.add("is-rolling");
    }
    if (statusEl) statusEl.textContent = "骰子動畫中...";

    let rollCount = 0;
    const maxRolls = 10;
    const rollInterval = setInterval(() => {
        const tempNum = randomDice();
        if (diceImageEl) {
            diceImageEl.src = `images/dice-${tempNum}.svg`;
            diceImageEl.alt = `Dice ${tempNum}`;
        }
        if (diceResultEl) diceResultEl.textContent = tempNum.toString();
        
        rollCount++;
        if (rollCount >= maxRolls) {
            clearInterval(rollInterval);
            
            // 停止動畫，顯示最終結果
            const finalDice = randomDice();
            currentDiceValue = finalDice;
            if (diceImageEl) {
                diceImageEl.classList.remove("is-rolling");
                diceImageEl.src = `images/dice-${finalDice}.svg`;
                diceImageEl.alt = `Dice ${finalDice}`;
            }
            if (diceResultEl) diceResultEl.textContent = finalDice.toString();
            
            // 計算可行步數
            const moves = getValidMoves(player, finalDice);
            validMovePieces = moves;
            
            if (moves.length === 0) {
                setStatus(formatStatus(player, "無棋可走"));
                setTimeout(() => {                    handleTurnEnd(player, false, finalDice);
                }, 1000);
            } else if (moves.length === 1) {
                // 自動執行唯一選擇
                setStatus(formatStatus(player, "只有一步可走"));
                setTimeout(() => {
                    handlePieceClick(player, moves[0].piece);
                }, 500);
            } else {
                // 等待玩家選擇
                setStatus(formatStatus(player, "請選擇要移動的棋子"));
                isWaitingForPieceSelection = true;
                isAnimating = false; // 允許點擊棋子
                if (rollButton) rollButton.disabled = true; // 但按鈕仍禁用直到選擇
            }
        }
    }, 100);
}

function setDiceIdle() {
    if (diceImageEl) {
        diceImageEl.classList.add("is-idle");
        diceImageEl.src = `images/dice-blank.svg`;
        diceImageEl.alt = "Dice idle";
    }
    if (diceResultEl) diceResultEl.textContent = "";
}

function setDiceRolling(isRolling) {
    if (!diceImageEl) return;
    diceImageEl.classList.toggle("is-rolling", isRolling);
}

function setStatus(message, alert = false) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.classList.toggle("status-alert", Boolean(alert));
}

function initEventListeners() {
    if (rollButton) {
        rollButton.disabled = false;
        rollButton.addEventListener("click", handleRollDice);
        console.log("✅ [initEventListeners] 擲骰子按鈕事件監聽已綁定");
    }
}

function initGame() {
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
    isWaitingForPieceSelection = false;
    validMovePieces = [];
    currentDiceValue = 0;
    
    // 渲染初始棋子
    renderPieces();
    updateCurrentPlayerDisplay();
    setDiceIdle();
    setStatus("");
    if (rollButton) {
        rollButton.disabled = false;
    }
}

// 6. 啟動
window.addEventListener("DOMContentLoaded", () => {
    console.log("[STAGE 3] DOMContentLoaded 觸發");
    initGame();
    initEventListeners();
    alert("🎉 階段3完成！\n請確認畫面：\n• 棋盤 + 4 顆棋子\n• '擲骰子' 按鈕\n• 點擊按鈕可擲骰\n• 棋子可點擊移動（若有選擇）\n• 6 點可額外回合");
});
