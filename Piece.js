// Piece.js - 棋子類別
class Piece {
    constructor(id, status = 'home', homeIndex = 0, progress = 0) {
        this.id = id; // 棋子唯一 ID
        this.status = status; // 'home', 'track', 'finished'
        this.homeIndex = homeIndex; // 在家中的索引 (0-3)
        this.progress = progress; // 在軌道上的進度
    }

    // 重置棋子狀態
    reset() {
        this.status = 'home';
        this.homeIndex = 0;
        this.progress = 0;
    }

    // 檢查棋子是否在軌道上
    isOnTrack() {
        return this.status === 'track';
    }

    // 檢查棋子是否已完成
    isFinished() {
        return this.status === 'finished';
    }

    // 起飛
    launch() {
        if (this.status === 'home') {
            this.status = 'track';
            this.progress = 0;
            return true;
        }
        return false;
    }

    // 移動棋子
    move(steps, maxProgress) {
        if (this.status !== 'track') return false;
        this.progress += steps;
        if (this.progress >= maxProgress) {
            this.status = 'finished';
            this.progress = maxProgress; // 確保進度不超過上限
        }
        return true;
    }
}

export default Piece;
