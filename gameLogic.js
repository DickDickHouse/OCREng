// gameLogic.js
import { COLORS, COLOR_NAMES } from './config.js';
import { randomDice } from './utils.js';
import { 
    playerPaths, 
    safeCells,
    flySquares,
    baseIndexToProgress,
    homePositions,
    startCells
} from './paths.js';
import { getPieceCellIndex } from './board.js';

// 玩家狀態
export const players = COLORS.map((color, i) => ({
    id: i,
    name: `${COLOR_NAMES[color]}方`,
    color,
    colorClass: color,
    pieces: Array.from({length:4}, (_, idx) => ({
        status: "home",
        homeIndex: idx,
        progress: 0,
        id: `${color}-${idx}`
    }))
}));

let currentPlayerIndex = 0;
export function getCurrentPlayer() {
    return players[currentPlayerIndex];
}

export function nextPlayer() {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    return players[currentPlayerIndex];
}

// 規則
export function canLaunchWithDice(dice, rule = "6") {
    if (rule === "even") return dice % 2 === 0;
    if (rule === "odd") return dice % 2 === 1;
    return dice === 6;
}

// 獲取可行步數
export function getValidMoves(player, dice, rule = "6") {
    const moves = [];
    const maxProgress = playerPaths[player.color].length;
    
    // 起飛    if (canLaunchWithDice(dice, rule)) {
        player.pieces.forEach((piece, index) => {
            if (piece.status === "home") {
                moves.push({ type: "home", pieceIndex: index, piece, steps: dice });
            }
        });
    }
    
    // 軌道移動
    player.pieces.forEach((piece, index) => {
        if (piece.status === "track") {
            const target = piece.progress + dice;
            if (target <= maxProgress) {
                moves.push({ type: "track", pieceIndex: index, piece, target, steps: dice });
            }
        }
    });
    
    return moves;
}

// 執行移動
export function performMove(player, moveInfo, done) {
    if (!moveInfo) {
        done(false);
        return;
    }

    if (moveInfo.type === "home") {
        moveInfo.piece.status = "track";
        moveInfo.piece.progress = 0;
        done(true, moveInfo.piece);
        return;
    }

    // 移動動畫
    const start = moveInfo.piece.progress;
    const end = moveInfo.target;
    let current = start;
    const stepTime = 200;

    function moveOne() {
        current += 1;
        moveInfo.piece.progress = current;
        renderPieces // 假設此函數已匯入
        if (current < end) {
            setTimeout(moveOne, stepTime);
        } else {
            // 檢查跳躍
            checkJump(player, moveInfo.piece);            // 檢查飛行與碰撞
            const captured = applyFlyAndCapture(player, moveInfo.piece);
            
            if (captured.length > 0) {
                setTimeout(() => {
                    setBlinkingPiece(captured.map(c => c.piece));
                    setTimeout(() => {
                        setBlinkingPiece(null);
                        done(true, moveInfo.piece);
                    }, 2000);
                }, 500);
            } else {
                done(true, moveInfo.piece);
            }
        }
    }
    moveOne();
}

// 跳躍邏輯
export function checkJump(player, piece) {
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
// 飛行與碰撞
export function applyFlyAndCapture(player, piece) {
    const color = player.color;
    const captured = [];
    
    // 飛行
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
    
    // 碰撞
    if (piece.progress > 0 && piece.progress <= PATH_LENGTH) {
        const cellIndex = playerPaths[color][piece.progress - 1];
        if (!safeCells.has(cellIndex)) {
            players.forEach((op) => {
                if (op.color === color) return;
                op.pieces.forEach((opPiece) => {
                    if (opPiece.status !== "track") return;
                    const opCell = getPieceCellIndex(op, opPiece);
                    if (opCell === cellIndex) {
                        opPiece.status = "home";
                        opPiece.progress = 0;
                        captured.push({ attacker: player, victim: op, piece: opPiece });
                    }
                });
            });
        }
    }
    
    return captured;
}

// 勝利條件
export function checkWin(player) {
    const allFinished = player.pieces.every(p => p.status === "finished");
    return allFinished;
}
