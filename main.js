const VERSION = "v44-final-fixed";
const versionEl = document.getElementById("version");
if (versionEl) versionEl.textContent = `版本：${VERSION}`;

const BOARD_ROWS = 15;
const BOARD_COLS = 15;

function xyToIndex(x, y) {
    const col = x - 1;
    const row = y - 1;
    return row * BOARD_COLS + col;
}

const boardCells = [];
for (let r = 0; r < BOARD_ROWS; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
        boardCells.push({ row: r, col: c, isPath: false, classes: [] });
    }
}

function paintHomeArea(x1, y1, x2, y2, className) {
    for (let y = y1; y <= y2; y++) {
        for (let x = x1; x <= x2; x++) {
            boardCells[xyToIndex(x, y)].classes.push(className);
        }
    }
}

paintHomeArea(1, 1, 3, 3, "cell-home-blue");
paintHomeArea(13, 1, 15, 3, "cell-home-red");
paintHomeArea(1, 13, 3, 15, "cell-home-green");
paintHomeArea(13, 13, 15, 15, "cell-home-yellow");

const centerCells = [
    [7,7],[8,7],[9,7],
    [7,8],[8,8],[9,8],
    [7,9],[8,9],[9,9],
];

// ✅ 修復：箭頭函數 => 和邏輯運算符 &&
centerCells.forEach(([x,y]) => {
    let cls = "center-core";
    if (x === 8 && y === 7) cls = "center-red";
    else if (x === 9 && y === 8) cls = "center-yellow";
    else if (x === 8 && y === 9) cls = "center-green";
    else if (x === 7 && y === 8) cls = "center-blue";
    boardCells[xyToIndex(x,y)].classes.push(cls);
});

// ✅ 根據您提供的正確路徑定義const basePathWithColor = [
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
    boardCells[idx].isPath = true;
    boardCells[idx].classes.push("cell-path", `cell-path-${color}`);
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

boardCells[startCells.blue].classes.push("start-blue");
boardCells[startCells.red].classes.push("start-red");
boardCells[startCells.green].classes.push("start-green");
boardCells[startCells.yellow].classes.push("start-yellow");
const startStepXY = {
    blue: [2,5],
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

homePaths.blue.forEach(i => boardCells[i].classes.push("cell-homepath-blue"));
homePaths.green.forEach(i => boardCells[i].classes.push("cell-homepath-green"));
homePaths.red.forEach(i => boardCells[i].classes.push("cell-homepath-red"));homePaths.yellow.forEach(i => boardCells[i].classes.push("cell-homepath-yellow"));

const flySquares = {
    yellow: { from: xyToIndex(4,11), to: xyToIndex(4,15), dir: "fly-up" },
    green:  { from: xyToIndex(5,4),  to: xyToIndex(11,4), dir: "fly-right" },
    blue:   { from: xyToIndex(12,5), to: xyToIndex(12,11), dir: "fly-down" },
    red:    { from: xyToIndex(11,12),to: xyToIndex(5,12), dir: "fly-left" },
};

Object.values(flySquares).forEach(f => boardCells[f.from].classes.push(f.dir));

const jumpPairs = [
    [4,5,5,4],
    [11,4,12,5],
    [12,11,11,12],
    [5,12,4,11],
];
jumpPairs.forEach(([x1,y1,x2,y2]) => {
    boardCells[xyToIndex(x1,y1)].classes.push("cell-jump");
    boardCells[xyToIndex(x2,y2)].classes.push("cell-jump");
});

boardCells[xyToIndex(5,5)].classes.push("cell-split-55");
boardCells[xyToIndex(11,5)].classes.push("cell-split-115");
boardCells[xyToIndex(11,11)].classes.push("cell-split-1111");
boardCells[xyToIndex(5,11)].classes.push("cell-split-511");

const safeCells = new Set([
    startCells.blue, startCells.green, startCells.red, startCells.yellow,
    flySquares.blue.from, flySquares.green.from, flySquares.red.from, flySquares.yellow.from,
]);

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

// ✅ 修復：字串無多餘空格，箭頭函數正確
const players = [
    { id:0, name: "紅方", color: "red", colorClass: "red", pieces: Array.from({length:4}, (_,i) => ({status: "home", homeIndex:i, progress:0})) },
    { id:1, name: "藍方", color: "blue", colorClass: "blue", pieces: Array.from({length:4}, (_,i) => ({status: "home", homeIndex:i, progress:0})) },
    { id:2, name: "綠方", color: "green", colorClass: "green", pieces: Array.from({length:4}, (_,i) => ({status: "home", homeIndex:i, progress:0})) },
    { id:3, name: "黃方", color: "yellow", colorClass: "yellow", pieces: Array.from({length:4}, (_,i) => ({status: "home", homeIndex:i, progress:0})) },
];

let currentPlayerIndex = 0;
let gameEnded = false;
let isAnimating = false;
let isWaitingForPieceSelection = false;
let validMovePieces = [];
let currentDiceValue = 0;

const blinkingPieces = new Set();

// ✅ 修復：getElementById 參數無空格
const boardEl = document.getElementById("board");
const currentPlayerNameEl = document.getElementById("current-player-name");
const diceResultEl = document.getElementById("dice-result");
const diceImageEl = document.getElementById("dice-image");
const diceDisplayEl = document.querySelector(".dice-display");const statusEl = document.getElementById("status");
const rollButton = document.getElementById("roll-button");
const resetButton = document.getElementById("reset-button");
const launchRuleSelect = document.getElementById("launch-rule");
const confirmRuleButton = document.getElementById("confirm-rule");
const ruleStatusEl = document.getElementById("rule-status");

const CAPTURE_BLINK_MS = 2000;
const DICE_IDLE_IMAGE = "images/dice-blank.svg";
const STATUS_ALERT_CLASS = "status-alert";

const COLOR_NAMES = {
    red: "紅棋",
    blue: "藍棋",
    green: "綠棋",
    yellow: "黃棋",
};

let launchRule = "6";

function getLaunchRuleLabel(rule) {
    if (rule === "even") return "雙數";
    if (rule === "odd") return "單數";
    return "6 點";
}

function updateLaunchRuleDisplay() {
    if (ruleStatusEl) ruleStatusEl.textContent = `起飛規則：${getLaunchRuleLabel(launchRule)}`;
}

function setLaunchRule(rule) {
    launchRule = rule || "6";
    updateLaunchRuleDisplay();
}

function canLaunchWithDice(dice) {
    if (launchRule === "even") return dice % 2 === 0;
    if (launchRule === "odd") return dice % 2 === 1;
    return dice === 6;
}

if (launchRuleSelect) setLaunchRule(launchRuleSelect.value);
if (confirmRuleButton) {
    confirmRuleButton.addEventListener("click", () => {
        if (!launchRuleSelect) return;
        setLaunchRule(launchRuleSelect.value);
    });
}

function setStatus(message, alert = false) {    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.classList.toggle(STATUS_ALERT_CLASS, Boolean(alert));
}

function setDiceImage(value) {
    if (diceImageEl) {
        diceImageEl.src = `images/dice-${value}.svg`;
        diceImageEl.alt = `Dice ${value}`;
    }
    if (diceResultEl) diceResultEl.textContent = value.toString();
}

function setDiceIdle() {
    if (diceDisplayEl) diceDisplayEl.classList.add("is-idle");
    if (diceImageEl) {
        diceImageEl.src = DICE_IDLE_IMAGE;
        diceImageEl.alt = "Dice idle";
    }
    if (diceResultEl) diceResultEl.textContent = "";
}

function setDiceActive() {
    if (diceDisplayEl) diceDisplayEl.classList.remove("is-idle");
}

function setDiceRolling(isRolling) {
    if (!diceImageEl) return;
    diceImageEl.classList.toggle("is-rolling", isRolling);
}

function setBlinkingPiece(pieces) {
    blinkingPieces.clear();
    if (!pieces) {
        renderPieces();
        return;
    }
    if (Array.isArray(pieces)) {
        pieces.forEach((piece) => blinkingPieces.add(piece));
    } else {
        blinkingPieces.add(pieces);
    }
    renderPieces();
}

function getPieceCellIndex(player, piece) {
    if (piece.status === "home") return homePositions[player.color][piece.homeIndex];
    if (piece.status === "track" && piece.progress === 0) return startCells[player.color];
    if (piece.status === "track" && piece.progress > 0) {
        if (piece.progress - 1 < playerPaths[player.color].length) {            return playerPaths[player.color][piece.progress - 1];
        }
    }
    return homePositions[player.color][0];
}

function initBoard() {
    if (!boardEl) {
        setStatus("錯誤：找不到棋盤元素！", true);
        return;
    }
    boardEl.innerHTML = "";
    boardEl.style.gridTemplateColumns = `repeat(${BOARD_COLS}, 26px)`;
    boardEl.style.gridTemplateRows = `repeat(${BOARD_ROWS}, 26px)`;
    boardCells.forEach((cellData) => {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cellData.classes.forEach((cls) => cell.classList.add(cls));
        boardEl.appendChild(cell);
    });
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
            
            if (blinkingPieces.has(piece)) {
                pieceEl.classList.add("piece-blink");
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

function checkJump(player, piece) {
    if (piece.progress > 0 && piece.progress <= PATH_LENGTH) {
        const cellIndex = playerPaths[player.color][piece.progress - 1];
        const cellData = boardCells[cellIndex];
        const playerColorClass = `cell-path-${player.color}`;        
        if (cellData.classes.includes(playerColorClass)) {
            const currentBaseIdx = baseIndexByCell.get(cellIndex);
            if (currentBaseIdx !== undefined) {
                for (let i = 1; i < PATH_LENGTH; i++) {
                    const nextIdx = (currentBaseIdx + i) % PATH_LENGTH;
                    const nextCellIdx = basePath[nextIdx];
                    const nextCellData = boardCells[nextCellIdx];
                    
                    if (nextCellData.classes.includes(playerColorClass)) {
                        const jumpProgress = baseIndexToProgress(player.color, nextCellIdx) + 1;
                        if (jumpProgress > piece.progress) {
                            piece.progress = jumpProgress;
                            renderPieces();
                            setStatus(`${player.name} 觸發跳躍！`);
                            return true;
                        }
                        break; 
                    }
                }
            }
        }
    }
    return false;
}

function applyFlyAndCapture(player, piece) {
    const color = player.color;
    const captured = [];
    
    if (piece.progress > 0 && piece.progress <= PATH_LENGTH) {
        const cellIndex = playerPaths[color][piece.progress - 1];
        const fly = flySquares[color];
        if (fly && cellIndex === fly.from) {
            const targetIndex = baseIndexByCell.get(fly.to);
            if (targetIndex !== undefined) {
                piece.progress = baseIndexToProgress(color, targetIndex) + 1;
                renderPieces();
                setStatus(`${player.name} 觸發飛行！`);
            }
        }
    }
    
    if (piece.progress > 0 && piece.progress <= PATH_LENGTH) {
        const cellIndex = playerPaths[color][piece.progress - 1];
        if (!safeCells.has(cellIndex)) {
            players.forEach((op) => {
                if (op.color === color) return;
                op.pieces.forEach((opPiece) => {
                    if (opPiece.status !== "track") return;                    const opCell = getPieceCellIndex(op, opPiece);
                    if (opCell === cellIndex) {
                        opPiece.status = "home";
                        opPiece.progress = 0;
                        captured.push({ attacker: player, victim: op, piece: opPiece });
                    }
                });
            });
        }
    }
    
    if (captured.length > 0) {
        renderPieces();
    }
    return captured;
}

function getValidMoves(player, dice) {
    const moves = [];
    const maxProgress = playerPaths[player.color].length;
    
    if (canLaunchWithDice(dice)) {
        player.pieces.forEach((piece, index) => {
            if (piece.status === "home") {
                moves.push({ type: "home", pieceIndex: index, piece: piece, steps: dice });
            }
        });
    }
    
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

function formatCaptureMessage(player, capturedList) {
    const attackerName = COLOR_NAMES[player.color] || player.name;
    const victimNames = capturedList.map((entry) => COLOR_NAMES[entry.victim.color] || entry.victim.name);
    const victimText = victimNames.join("、");
    return `${victimText} 被${attackerName} 打飛了！${victimText} 回基地！`;}

function checkWin(player) {
    const allFinished = player.pieces.every(p => p.status === "finished");
    if (allFinished) {
        gameEnded = true;
        setStatus(`🎉 遊戲結束！${player.name} 獲勝！`, true);
        if (rollButton) rollButton.disabled = true;
        return true;
    }
    return false;
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
        checkJump(player, moveInfo.piece);
        const captured = applyFlyAndCapture(player, moveInfo.piece);
        
        if (captured.length > 0) {
            setStatus(formatCaptureMessage(player, captured), true);
            setBlinkingPiece(captured.map((entry) => entry.piece));
            setTimeout(() => {
                setBlinkingPiece(null);
                done(true, moveInfo.piece);
            }, CAPTURE_BLINK_MS);
            return;
        }
        
        const endProgress = moveInfo.piece.progress;
        
        if (endProgress === playerPaths[player.color].length) {
            moveInfo.piece.status = "finished";
            setStatus(formatStatus(player, "棋子到終點站了!"));
            if (checkWin(player)) {
                done(true, moveInfo.piece);
                return;            }
        } else if (endProgress > PATH_LENGTH) {
            setStatus(formatStatus(player, "棋子快到終點了!"));
        } else {
            setStatus(formatStatus(player, `棋子向前 ${moveInfo.steps} 格`));
        }

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
    setBlinkingPiece(null);
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

    if (extraTurn) {        setStatus(`${player.name} 擲到 6 點，獲得額外回合！`);
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

function handleTurn() {
    if (gameEnded) {
        return;
    }
    
    if (isAnimating) {
        isAnimating = false;
        isWaitingForPieceSelection = false;
        if (rollButton) rollButton.disabled = false;
    }
    
    if (isWaitingForPieceSelection) {
        return;
    }
    
    const player = players[currentPlayerIndex];
        isAnimating = true;
    if (rollButton) rollButton.disabled = true;
    
    setDiceActive();
    let rollTicks = 0;
    const maxTicks = 10;
    setDiceRolling(true);
    
    const rollInterval = setInterval(() => {
        const temp = randomDice();
        setDiceImage(temp);
        rollTicks += 1;
        if (rollTicks >= maxTicks) {
            clearInterval(rollInterval);
            const dice = randomDice();
            currentDiceValue = dice;
            setDiceImage(dice);
            setDiceRolling(false);
            
            const moves = getValidMoves(player, dice);
            validMovePieces = moves;
            
            if (moves.length === 0) {
                setStatus(formatStatus(player, "無棋可走"));
                setTimeout(() => {
                    handleTurnEnd(player, false, dice);
                }, 1000);
            } else if (moves.length === 1) {
                setStatus(formatStatus(player, "只有一步可走"));
                setBlinkingPiece(moves[0].piece);
                setTimeout(() => {
                    handlePieceClick(player, moves[0].piece);
                }, 500);
            } else {
                setStatus(formatStatus(player, "請選擇要移動的棋子"));
                isWaitingForPieceSelection = true;
                isAnimating = false;
                setBlinkingPiece(moves.map(m => m.piece));
                if (rollButton) rollButton.disabled = true;
            }
        }
    }, 80);
}

function safeInitGame() {
    try {
        initGame();
    } catch (error) {
        setStatus("初始化失敗：" + error.message, true);
    }}

function initGame() {
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
    setBlinkingPiece(null);
    initBoard();
    renderPieces();
    updateCurrentPlayerDisplay();
    setDiceIdle();
    updateLaunchRuleDisplay();
    setStatus("");
    if (rollButton) {
        rollButton.disabled = false;
    }
}

if (rollButton) rollButton.addEventListener("click", handleTurn);
if (resetButton) resetButton.addEventListener("click", safeInitGame);
window.addEventListener("DOMContentLoaded", safeInitGame);
window.addEventListener("load", safeInitGame);
