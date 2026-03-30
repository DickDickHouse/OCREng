// Game.js - 檢查點 #7
console.log("[CHECKPOINT] Game.js 已載入");

import GameConfig from './GameConfig.js';
import Player from './Player.js';
import Board from './Board.js';
import Dice from './Dice.js';
import UI from './UI.js';

class Game {
    constructor() {
        console.log("[CHECKPOINT] Game 建構子被呼叫 —— 開始初始化遊戲核心");

        this.players = GameConfig.COLORS.map((color, index) =>
            new Player(index, GameConfig.PLAYER_NAMES[index], color)
        );
        console.log(`[CHECKPOINT] Players 初始化完成: ${this.players.length} 位玩家`);

        this.currentPlayerIndex = 0;
        this.gameEnded = false;
        this.isAnimating = false; // 是否正在動畫或處理邏輯
        this.launchRule = '6'; // 預設起飛規則

        this.board = new Board('board');
        console.log("[CHECKPOINT] Board 實例已建立");

        this.dice = new Dice('dice-image', 'dice-result'); // 假設 UI 元素 ID
        console.log("[CHECKPOINT] Dice 實例已建立");

        this.ui = new UI(this);
        console.log("[CHECKPOINT] UI 實例已建立");

        // ⚠️ 關鍵：如果這裡的 log 沒出現, 表示前面某個建構子拋出錯誤，中斷了流程。
        this.board.initDOM();
        console.log("[CHECKPOINT] board.initDOM() 已執行");

        this.board.renderPieces(this.players);
        console.log("[CHECKPOINT] board.renderPieces() 已執行");

        this.ui.updateCurrentPlayerDisplay();
        console.log("[CHECKPOINT] UI 更新玩家顯示完成");

        this.dice.reset();
        this.ui.updateLaunchRuleDisplay(this.launchRule);
        this.ui.setRollButtonEnabled(true);

        // 設置全局引用，方便 Dice 回調
        window.gameInstance = this;
        console.log("[CHECKPOINT] Game 初始化完成！");
    }
    // 擲骰子按鈕點擊事件處理
    handleRollButtonClick() {
        if (this.gameEnded || this.isAnimating) return;
        this.isAnimating = true;
        this.ui.setRollButtonEnabled(false);
        this.dice.roll();
        // onDiceRolled 會在骰子停止後被呼叫
    }

    // 骰子停止後的回調
    onDiceRolled(diceValue) {
        console.log(`骰子結果: ${diceValue}`);
        const player = this.getCurrentPlayer();
        const movablePieces = player.getMovablePieces(diceValue, this.board.paths[player.color].length, this.launchRule);

        if (movablePieces.length === 0) {
            this.ui.setStatus(`${player.name}：無棋可走`);
            setTimeout(() => this.endTurn(), 1500);
        } else if (movablePieces.length === 1) {
            // 自動執行唯一選擇
            this.ui.setStatus(`${player.name}：只有一個選擇`);
            setTimeout(() => {
                this.performMove(movablePieces[0]);
            }, 500);
        } else {
 等待玩家選擇 (此處簡化為自動選擇第一個，實際應高亮棋子供選擇)
            this.ui.setStatus(`${player.name}：請選擇要移動的棋子`);
            // 在真實實現中，這裡會渲染高亮棋子並等待點擊
            // 這裡為了簡化，直接選擇第一個
            setTimeout(() => {
                this.performMove(movablePieces[0]);
            }, 500);
        }
    }

    // 執行棋子移動
    performMove(moveInfo) {
        const { piece, type, target, steps } = moveInfo;
        const player = this.players[this.currentPlayerIndex];

        if (type === 'launch') {
            piece.launch();
            this.ui.setStatus(`${player.name} 的棋子起飛了！`);
        } else if (type === 'move' && target !== undefined) {
            // 這裡可以加入動畫邏輯
            piece.move(steps, this.board.paths[player.color].length);
            this.ui.setStatus(`${player.name} 的棋子向前移動了 ${steps} 步`);
        }
        this.board.renderPieces(this.players);

        if (piece.isFinished()) {
            if (player.hasWon()) {
                this.gameEnded = true;
                this.ui.showGameOver(player);
                this.isAnimating = false;
                return;
            }
        }

        // 檢查是否獲得額外回合
        if (steps === 6) {
            this.ui.setStatus(`${player.name} 擲出 6 點，獲得額外回合！`);
            this.isAnimating = false;
            this.ui.setRollButtonEnabled(true);
        } else {
            setTimeout(() => this.endTurn(), 500); // 給予短暫時間顯示狀態
        }
    }

    // 結束當前玩家回合
    endTurn() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.ui.updateCurrentPlayerDisplay();
        this.ui.setRollButtonEnabled(true);
        this.isAnimating = false;
    }

    // 獲取當前玩家
    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    // 設定起飛規則
    setLaunchRule(rule) {
        this.launchRule = rule;
        this.ui.updateLaunchRuleDisplay(rule);
    }

    // 重新開始遊戲
    reset() {
        this.players.forEach(player => {
            player.pieces.forEach(piece => piece.reset());
        });
        this.currentPlayerIndex = 0;
        this.gameEnded = false;
        this.isAnimating = false;
        this.board.renderPieces(this.players);
        this.ui.updateCurrentPlayerDisplay();        this.dice.reset();
        this.ui.setRollButtonEnabled(true);
        this.ui.setStatus('');
    }
}

export default Game;
