// ✅ 階段3 修復版：解決「6點不起飛」、「點擊無反應」問題
console.log("[FIX] main.js 加載中...");

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
let validMovePieces = []; // 存 { player, pieceIndex, type, ... }
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

if (versionEl) versionEl.textContent = "v50-stage3-fix";

if (!boardEl) {
    alert("❌ 錯誤：HTML 中缺少 <div id='board'></div>");
} else {
    console.log("✅ #board 元素存在");
}

// --- 路徑定義（精簡版，確保正確）---
const basePathWithColor = [
    [2,5, "blue"], [3,5, "blue"], [4,5, "blue"],
    [5,4, "green"], [5,3, "blue"], [5,2, "blue"], [5,1, "blue"],
    [6,1, "green"], [7,1, "blue"], [8,1, "red"], [9,1, "yellow"], [10,1, "green"],
    [11,1, "blue"], [11,2, "red"], [11,3, "yellow"], [11,4, "green"],    [12,5, "blue"], [13,5, "red"], [14,5, "yellow"], [15,5, "green"],
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
});
const PATH_LENGTH = basePath.length;

const startCellsXY = {
    blue: [1,4], red: [12,1], green: [4,15], yellow: [15,12]
};
const startCells = {
    blue: xyToIndex(...startCellsXY.blue),
    red: xyToIndex(...startCellsXY.red),
    green: xyToIndex(...startCellsXY.green),
    yellow: xyToIndex(...startCellsXY.yellow)
};

const startStepXY = {
    blue: [2,5], red: [11,2], green: [5,14], yellow: [14,11]
};
const playerStartIndex = {
    blue: baseIndexByCell.get(xyToIndex(...startStepXY.blue)),
    red: baseIndexByCell.get(xyToIndex(...startStepXY.red)),
    green: baseIndexByCell.get(xyToIndex(...startStepXY.green)),
    yellow: baseIndexByCell.get(xyToIndex(...startStepXY.yellow))
};

const homeEntryCellsXY = {
    red: [8,1], yellow: [15,8], green: [8,15], blue: [1,8]
};
const homeEntryIndex = {
    red: baseIndexByCell.get(xyToIndex(...homeEntryCellsXY.red)),
    yellow: baseIndexByCell.get(xyToIndex(...homeEntryCellsXY.yellow)),
    green: baseIndexByCell.get(xyToIndex(...homeEntryCellsXY.green)),
    blue: baseIndexByCell.get(xyToIndex(...homeEntryCellsXY.blue))};

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

function baseIndexToProgress(color, baseIndex) {
    return (baseIndex - playerStartIndex[color] + PATH_LENGTH) % PATH_LENGTH;
}

function homeList(x1,y1,x2,y2) {
    const list = [];
    for (let y = y1; y <= y2; y++) {
        for (let x = x1; x <= x2; x++) list.push(xyToIndex(x,y));
    }
    return list;
}
const homePositionsFull = {
    blue: homeList(1,1,3,3),
    red:  homeList(13,1,15,3),
    green:homeList(1,13,3,15),
    yellow:homeList(13,13,15,15),
};
const homePositions = {
    blue: homePositionsFull.blue.slice(0,4),
    red:  homePositionsFull.red.slice(0,4),
    green:homePositionsFull.green.slice(0,4),
    yellow:homePositionsFull.yellow.slice(0,4),
};

function getPieceCellIndex(player, piece) {
    if (piece.status === "home") return homePositions[player.color][piece.homeIndex];
    if (piece.status === "track" && piece.progress === 0) return startCells[player.color];
    if (piece.status === "track" && piece.progress > 0) {
        if (piece.progress - 1 < playerPaths[player.color].length) {
            return playerPaths[player.color][piece.progress - 1];
        }
    }
    return homePositions[player.color][0];
}

// --- 核心邏輯 ---
function canLaunchWithDice(dice) {
    return dice === 6; // 固定 6 點起飛（階段3 簡化）
}

function getValidMoves(player, dice) {
    const moves = [];
    const maxProgress = playerPaths[player.color].length;
    
    // ✅ 修正：明確檢查 "home"（無空格！）
    if (canLaunchWithDice(dice)) {
        player.pieces.forEach((piece, index) => {
            if (piece.status === "home") {
                moves.push({ 
                    type: "home", 
                    player: player, 
                    pieceIndex: index, 
                    piece: piece, 
                    steps: dice 
                });
            }
        });
    }
    
    player.pieces.forEach((piece, index) => {        if (piece.status === "track") {
            const target = piece.progress + dice;
            if (target <= maxProgress) {
                moves.push({ 
                    type: "track", 
                    player: player, 
                    pieceIndex: index, 
                    piece: piece, 
                    target: target, 
                    steps: dice 
                });
            }
        }
    });
    
    console.log(`[getValidMoves] 玩家 ${player.name}，骰子=${dice}，可行步數=${moves.length}`);
    return moves;
}

function performMove(player, moveInfo, done) {
    console.log(`[performMove] 執行 move: ${moveInfo.type}, pieceIndex=${moveInfo.pieceIndex}`);
    
    if (!moveInfo) {
        console.warn("[performMove] moveInfo 為 null");
        done(false);
        return;
    }

    // ✅ 修正：使用 "home"（無空格）
    if (moveInfo.type === "home") {
        const piece = moveInfo.piece;
        piece.status = "track";  // ✅ 無空格
        piece.progress = 0;
        setStatus(`${player.name}：棋子起飛了！`);
        renderPieces();
        done(true, piece);
        return;
    }
    
    // 軌道移動
    animateMovePiece(player, moveInfo.piece, moveInfo.target, () => {
        setStatus(`${player.name}：棋子向前 ${moveInfo.steps} 格`);
        done(true, moveInfo.piece);
    });
}

function animateMovePiece(player, piece, targetProgress, onComplete) {
    const start = piece.progress;
    const end = targetProgress;
    if (end <= start) {         onComplete && onComplete(); 
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

function renderPieces() {
    if (!boardEl) return;
    const cells = boardEl.getElementsByClassName("cell");
    if (cells.length === 0) return;
    
    // 清除舊棋子容器
    for (let cell of cells) {
        const old = cell.querySelector(".pieces-container");
        if (old) cell.removeChild(old);
    }
    
    // 重新渲染
    players.forEach((player) => {
        player.pieces.forEach((piece, index) => {
            const cellIndex = getPieceCellIndex(player, piece);
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
            
            if (player.color === "blue") pieceEl.style.backgroundColor = "#1890ff";            if (player.color === "red")  pieceEl.style.backgroundColor = "#ff4d4f";
            if (player.color === "green")pieceEl.style.backgroundColor = "#52c41a";
            if (player.color === "yellow")pieceEl.style.backgroundColor = "#faad14";
            
            // ✅ 修正：點擊邏輯改用 player + index 比對
            if (isWaitingForPieceSelection) {
                const isValid = validMovePieces.some(m => 
                    m.player === player && m.pieceIndex === index
                );
                if (isValid) {
                    pieceEl.classList.add("selectable");
                    pieceEl.onclick = (e) => {
                        e.stopPropagation();
                        console.log(`[click] 點擊 ${player.name} 棋子#${index}`);
                        handlePieceClick(player, index);
                    };
                }
            }
            
            container.appendChild(pieceEl);
            cell.appendChild(container);
        });
    });
}

function handlePieceClick(player, pieceIndex) {
    console.log(`[handlePieceClick] 玩家 ${player.name}，棋子索引=${pieceIndex}`);
    
    if (!isWaitingForPieceSelection) return;
    
    // ✅ 修正：用 player + pieceIndex 查找
    const moveInfo = validMovePieces.find(m => 
       .player === player && m.pieceIndex === pieceIndex
    );
    
    if (!moveInfo) {
        console.warn(`[handlePieceClick] 找不到 moveInfo for player=${player.name}, index=${pieceIndex}`);
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
        }    });
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
        currentPlayerIndex (currentPlayerIndex + 1) % players.length;
        updateCurrentPlayerDisplay();
        if (rollButton) {
            rollButton.disabled = false;
        }
    }
}

function handleTurnEnd(player, moved, dice) {
    if (gameEnded) return;
    
    const extraTurn = (dice === 6);
    if (extraTurn) {
        setStatus(`${player.name} 擲到 6 點，獲得額外回合！`);
        isAnimating = false;
        if (rollButton) rollButton.disabled = false;
    } else {
        finalizeTurn();
    }
}

function handleRollDice() {
    console.log("🎲 [handleRollDice] 擲骰子按鈕被點擊");
    
    if (gameEnded || isAnimating || isWaitingForPieceSelection) return;    
    const player = players[currentPlayerIndex];
    isAnimating = true;
    if (rollButton) rollButton.disabled = true;
    
    // 骰子動畫
    if (diceImageEl) {
        diceImageEl.classList.remove("is-idle");
        diceImageEl.classList.add("is-rolling");
    }
    if (statusEl) statusEl.textContent = "骰子動畫中...";
    
    let rollCount = 0;
    const maxRolls = 10;
    const rollInterval =(() => {
        const tempNum = Math.floor(Math.random() * 6) + 1;
        if (diceImageEl) {
            diceImageEl.src = `images/dice-${tempNum}.svg`;
            diceImageEl.alt = `Dice ${tempNum}`;
        }
        if (diceResultEl) diceResultEl.textContent = tempNum.toString();
        
        rollCount++;
        if (rollCount >= maxRolls) {
            clearInterval(rollInterval);
            
            const finalDice = Math.floor(Math.random() * 6) + 1;
            currentDiceValue = finalDice;
            if (diceImageEl) {
                diceImageEl.classList.remove("is-rolling");
                diceImageEl.src = `images/dice-${finalDice}.svg`;
                diceImageEl.alt = `Dice ${finalDice}`;
            }
            if (diceResultEl) diceResultEl.textContent = finalDice.toString();
            
            // ✅ 關鍵：計算可行步數
            const moves = getValidMoves(player, finalDice);
            validMovePieces = moves;
            
            if (moves.length === 0) {
                setStatus(`${player.name}：無棋可走`);
                setTimeout(() => handleTurnEnd(player, false, finalDice), 1000);
            } else if (moves.length === 1) {
                setStatus(`${player.name}：只有一步可走`);
                // 自動執行（因為只有一個選擇）
                setTimeout(() => {
                    const move = moves[0];
                    handlePieceClick(move.player, move.pieceIndex);
                }, 500);
            } else {                setStatus(`${player.name}：請選擇要移動的棋子`);
                isWaitingForPieceSelection = true;
                isAnimating = false;
                if (rollButton) rollButton.disabled = true;
            }
        }
    }, 100);
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

function setStatus(message) {
    if (statusEl) statusEl.textContent = message;
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
    }    console.log("✅ initBoard 完成");
}

function initGame() {
    initBoard();
    players.forEach(p => p.pieces.forEach(piece => {
        piece.status = "home";
        piece.progress = 0;
    }));
    currentPlayerIndex = 0;
    gameEnded = false;
    isAnimating = false;
    isWaitingForPieceSelection = false;
    validMovePieces = [];
    currentDiceValue = 0;
    
    renderPieces();
    updateCurrentPlayerDisplay();
    setDiceIdle();
    setStatus("");
    if (rollButton) rollButton.disabled = false;
}

// 初始化
window.addEventListener("DOMContentLoaded", () => {
    console.log("[FIX] DOMContentLoaded 觸發");
    initGame();
    
    if (rollButton) {
        rollButton.addEventListener("click", handleRollDice);
        console.log("✅ 擲骰子按鈕事件綁定完成");
    }
    
    alert("🎉 階段3 修復版已完成！\n請測試：\n1. 擲骰子\n2. 若為6點，應自動起飛或提示選擇\n3. 點擊棋子應觸發移動");
});
