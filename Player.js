import Piece from './Piece.js';
import GameConfig from './GameConfig.js';

class Player {
    constructor(id, name, color) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.colorClass = color; // 通常與 color 相同
        this.pieces = Array.from({ length: GameConfig.PIECES_PER_PLAYER }, (_, i) => new Piece(`${color}-${i}`));
    }

    // 檢查玩家是否所有棋子都已完成
    hasWon() {
        return this.pieces.every(piece => piece.isFinished());
    }

    // 檢查玩家是否可以起飛棋子 (例如，只有 6 點可以起飛)
    canLaunchPiece(diceValue, rule = '6') {
        if (rule === '6' && diceValue !== 6) return false;
        if (rule === 'even' && diceValue % 2 !== 0) return false;
        if (rule === 'odd' && diceValue % 2 === 0) return false;

        // 檢查是否有在家的棋子
        return this.pieces.some(piece => piece.status === 'home');
    }

    // 檢查玩家是否可以移動棋子 (棋子在軌道上，且移動後不超過上限)
    canMovePiece(diceValue, maxProgress) {
        return this.pieces.some(piece => piece.isOnTrack() && (piece.progress + diceValue) <= maxProgress);
    }

    // 獲取玩家所有可移動的棋子 (起飛或在軌道上)
    getMovablePieces(diceValue, maxProgress, launchRule = '6') {
        const movable = [];
        if (this.canLaunchPiece(diceValue, launchRule)) {
            this.pieces.forEach((piece, index) => {
                if (piece.status === 'home') {
                    movable.push({ piece, index, type: 'launch', steps: diceValue });
                }
            });
        }
        if (this.canMovePiece(diceValue, maxProgress)) {
            this.pieces.forEach((piece, index) => {
                if (piece.isOnTrack()) {
                    const targetProgress = piece.progress + diceValue;
                    if (targetProgress <= maxProgress) {
                        movable.push({ piece, index, type: 'move', target: targetProgress, steps: diceValue });
                    }
                }
            });
        }
        return movable;
    }
}

export default Player;
