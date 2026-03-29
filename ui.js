// ui.js
import { BOARD_ROWS, BOARD_COLS, DICE_IMAGES } from './config.js';
import { randomDice } from './utils.js';
import { 
    players, 
    getCurrentPlayer, 
    nextPlayer,
    getValidMoves,
    performMove,
    checkWin
} from './gameLogic.js';
import { 
    boardCells,
    getPieceCellIndex,
    playerPaths,
    homePositions,
    startCells
} from './board.js';

// DOM 元素
let boardEl, currentPlayerNameEl, diceImageEl, diceResultEl, rollButton, statusEl;

export function initDOM() {
    boardEl = document.getElementById("board");
    currentPlayerNameEl = document.getElementById("current-player-name");
    diceImageEl = document.getElementById("dice-image");
    diceResultEl = document.getElementById("dice-result");
    rollButton = document.getElementById("roll-button");
    statusEl = document.getElementById("status");
}

// 狀態顯示
export function setStatus(message, alert = false) {
    if (statusEl) {
        statusEl = message;
        statusEl.classList.toggle("status-alert", alert);
    }
}

// 骰子控制
export function setDiceImage(value) {
    if (diceImageEl) {
        diceImageEl.src = DICE_IMAGES[value] || DICE_IMAGES.blank;
        diceImageEl.alt = `Dice ${value}`;
    }
    if (diceResultEl) diceResultEl.textContent = value.toString();
}

export function setDiceIdle() {
    if (diceImageEl) {        diceImageEl.src = DICE_IMAGES.blank;
        diceImageEl.alt = "Dice idle";
    }
    if (diceResultEl) diceResultEl.textContent = "";
    if (boardEl) boardEl.classList.remove("is-rolling");
}

export function setDiceRolling(isRolling) {
    if (boardEl) {
        boardEl.classList.toggle("is-rolling", isRolling);
    }
}

// 棋子渲染
let blinkingPieces = new Set();
export function setBlinkingPiece(pieces) {
    blinkingPieces.clear();
    if (Array.isArray(pieces)) {
        pieces.forEach(piece => blinkingPieces.add(piece));
    } else if (pieces) {
        blinkingPieces.add(pieces);
    }
    renderPieces();
}

export function renderPieces() {
    if (!boardEl) return;
    const cells = boardEl.children;
    if (cells.length === 0) return;
    
    // 清除舊的
    for (let cell of cells) {
        const old = cell.querySelector(".pieces-container");
        if (old) cell.removeChild(old);
    }
    
    // 渲染新棋子
    players.forEach(player => {
        player.pieces.forEach(piece => {
            const cellIndex = getCellIndex(player, piece);
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
            pieceEl.style.backgroundColor = 
                player.color === "blue" ? "#1890ff" :
                player.color === "red" ? "#ff4d4f" :
                player.color === "green" ? "#52c41a" : "#faad14";
            
            if (blinkingPieces.has(piece)) {
                pieceEl.classList.add("piece-blink");
            }
            
            container.appendChild(pieceEl);
            cell.appendChild(container);
        });
    });
}

// 更新玩家顯示
export function updateCurrentPlayerDisplay() {
    const p = getCurrentPlayer();
    if (currentPlayerNameEl) {
        currentPlayerNameEl.textContent = p.name;
        currentPlayerNameEl.className = `player-${p.color}`;
    }
}

// 擲骰子
let isAnimating = false;
let isWaitingForPieceSelection = false;
let validMovePieces = [];
let currentDiceValue = 0;

export function handleRollDice() {
    if (isAnimating || isWaitingForPieceSelection) return;
    
    const player = getCurrentPlayer();
    isAnimating = true;
    if (rollButton) rollButton.disabled = true;
    
    setDiceRolling(true);
    let rollCount = 0;
    const maxRolls = 10;
    
    const rollInterval = setInterval(() => {        const tempNum = randomDice();
        setDiceImage(tempNum);
        rollCount++;
        if (rollCount >= maxRolls) {
            clearInterval(rollInterval);
            const finalDice = randomDice();
            currentDiceValue = finalDice;
            setDiceImage(finalDice);
            setDiceRolling(false);
            
            const moves = getValidMoves(player, finalDice);
            validMovePieces = moves;
            
            if (moves.length === 0) {
                setStatus(`${player.name}：無棋可走`);
                setTimeout(() => {
                    handleTurnEnd(player, false, finalDice);
                }, 1000);
            } else if (moves.length === 1) {
                setStatus(`${player.name}：只有一步可走`);
                setTimeout(() => {
                    handlePieceClick(player, moves[0].piece);
                }, 500);
            } else {
                setStatus(`${player.name}：請選擇要移動的棋子`);
                isWaitingForPieceSelection = true;
                setBlinkingPiece(moves.map(m => m.piece));
                if (rollButton) rollButton.disabled = true;
            }
        }
    }, 100);
}

// 點擊棋子
export function handlePieceClick(player, piece) {
    if (!isWaitingForPieceSelection) return;
    
    const moveInfo = validMovePieces.find(m => m.piece === piece);
    if (!moveInfo) return;
    
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

// 回合結束
export function handleTurnEnd(player, moved, dice) {
    if (checkWin(player)) {
        setStatus(`🎉 遊戲結束！${player.name} 獲勝！`, true);
        return;
    }
    
    const extraTurn = (dice === 6);
    if (extraTurn) {
        setStatus(`${player.name} 擲到 6 點，獲得額外回合！`);
        isAnimating = false;
        if (rollButton) rollButton.disabled = false;
    } else {
        finalizeTurn();
    }
}

function finalizeTurn() {
    setDiceIdle();
    setBlinkingPiece(null);
    isWaitingForPieceSelection = false;
    isAnimating = false;
    
    nextPlayer();
    updateCurrentPlayerDisplay();
    if (rollButton) rollButton.disabled = false;
}
