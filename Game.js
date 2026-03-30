// Game.js
import GameConfig from 'GameConfig.js';
import Player from 'Player.js';
import Board from 'Board.js';
import Dice from 'Dice.js';
import UI from 'UI.js';

class Game {
    constructor() {
        this.players = GameConfig.COLORS.map((color, index) =>
            new Player(index, GameConfig.PLAYER_NAMES[index], color)
        );
        this.currentPlayerIndex = 0;
        this.gameEnded = false;
        this.isAnimating = false;
        this.launchRule = '6';

        this.board = new Board('board');
        this.dice = new Dice('dice-image', 'dice-result');
        this.ui = new UI(this);

        this.board.initDOM();
        this.board.renderPieces(this.players);
        this.ui.updateCurrentPlayerDisplay();
        this.dice.reset();
        this.ui.updateLaunchRuleDisplay(this.launchRule);
        this.ui.setRollButtonEnabled(true);

        window.gameInstance = this;
    }

    handleRollButtonClick() {
        if (this.gameEnded || this.isAnimating) return;
        this.isAnimating = true;
        this.ui.setRollButtonEnabled(false);
        this.dice.roll();
    }

    onDiceRolled(diceValue) {
        const player = this.getCurrentPlayer();
        const movablePieces = player.getMovablePieces(diceValue, this.board.paths[player.color].length, this.launchRule);

        if (movablePieces.length === 0) {
            this.ui.setStatus(`${player.name}：無棋可走`);
            setTimeout(() => this.endTurn(), 1500);
        } else if (movablePieces.length === 1) {
            this.ui.setStatus(`${player.name}：只有一個選擇`);
            setTimeout(() => {
                this.performMove(movablePieces[0]);
            }, 500);        } else {
            this.ui.setStatus(`${player.name}：請選擇要移動的棋子`);
            // 實際應用中應高亮棋子供選擇，此處簡化為自動選第一個
            setTimeout(() => {
                this.performMove(movablePieces[0]);
            }, 500);
        }
       performMove(moveInfo) {
        const { piece, type, target, steps } = moveInfo;
        const player = this.players[this.currentPlayerIndex];

        if (type === 'launch') {
            piece.launch();
            this.ui.setStatus(`${player.name} 的棋子起飛了！`);
        } else if (type === 'move' && target !== undefined) {
            piece.move(steps, this.board.paths[player.color].length);
            this.ui.setStatus(`${player.name} 的棋子向前移動了 ${steps} 步`);
        }

        this.board.renderPieces(this.players);

        if (piece.isFinished() && player.hasWon()) {
            this.gameEnded = true;
            this.ui.showGameOver(player);
            this.isAnimating = false;
            return;
        }

        if (steps === 6) {
            this.ui.setStatus(`${player.name} 擲出 6 點，獲得額外回合！`);
            this.isAnimating = false;
            this.ui.setRollButtonEnabled(true);
        } else {
            setTimeout(() => this.endTurn(), 500);
        }
    }

    endTurn() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.ui.updateCurrentPlayerDisplay();
        this.ui.setRollButtonEnabled(true);
        this.isAnimating = false;
       getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    setLaunchRule(rule) {
        this.launchRule = rule;
        this.ui.updateLaunchRuleDisplay(rule);
    }
    reset() {
        this.players.forEach(player => {
            player.pieces.forEach(piece => piece.reset());
        });
        this.currentPlayerIndex = 0;
        this.gameEnded = false;
        this.isAnimating = false;
        this.board.renderPieces(this.players);
        this.ui.updateCurrentPlayerDisplay();
        this.dice.reset();
        this.ui.setRollButtonEnabled(true);
        this.ui.setStatus('');
    }
}

export default Game;
