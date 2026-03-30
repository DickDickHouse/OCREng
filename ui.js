// UI.js
class UI {
    constructor(game) {
        this.game = game;
        this.currentPlayerNameEl = document.getElementById('current-player-name');
        this.statusEl = document.getElementById('status');
        this.rollButton = document.getElementById('roll-button');
        this.launchRuleSelect = document.getElementById('launch-rule');
        this.confirmRuleButton = document.getElementById('confirm-rule');
        this.ruleStatusEl = document.getElementById('rule-status');

        this.bindEvents();
    }

    bindEvents() {
        if (this.rollButton) {
            this.rollButton.addEventListener('click', () => this.game.handleRollButtonClick());
        }
        if (this.confirmRuleButton && this.launchRuleSelect) {
            this.confirmRuleButton.addEventListener('click', () => {
                this.game.setLaunchRule(this.launchRuleSelect.value);
            });
        }
    }

    updateCurrentPlayerDisplay() {
        if (this.currentPlayerNameEl) {
            const player = this.game.getCurrentPlayer();
            this.currentPlayerNameEl.textContent = player.name;
            this.currentPlayerNameEl.classList.remove('player-red', 'player-blue', 'player-green', 'player-yellow');
            this.currentPlayerNameEl.classList.add(`player-${player.color}`);
        }
    }

    setStatus(message, isAlert = false) {
        if (this.statusEl) {
            this.statusEl.textContent = message;
            this.statusEl.classList.toggle('status-alert', isAlert);
        }
    }

    setRollButtonEnabled(enabled) {
        if (this.rollButton) {
            this.rollButton.disabled = !enabled;
        }
    }

    updateLaunchRuleDisplay(rule) {
        if (this.ruleStatusEl) {
            const labels = { '6': '6 點起飛', 'even': '雙數起飛', 'odd': '單數起飛' };
            this.ruleStatusEl.textContent = `起飛規則：${labels[rule] || '未知'}`;
        }
    }

    showGameOver(winner) {
        this.setStatus(`🎉 遊戲結束！${winner.name} 獲勝！`, true);
        this.setRollButtonEnabled(false);
    }
}

export default UI;
