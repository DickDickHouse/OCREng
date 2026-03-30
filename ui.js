// UI.js - 檢查點 #6
console.log("[CHECKPOINT] UI.js 已載入");

class UI {
    constructor(game) {
        console.log("[CHECKPOINT] UI 建構子被呼叫");
        this.game = game; // 持有 Game 的引用
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
            const currentPlayer = this.game.getCurrentPlayer();
            this.currentPlayerNameEl.textContent = currentPlayer.name;

            // 清除舊的顏色類別
            this.currentPlayerNameEl.classList.remove('player-red', 'player-blue', 'player-green', 'player-yellow');
            // 添加新的顏色類別
            this.currentPlayerNameEl.classList.add(`player-${currentPlayer.color}`);
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
            const ruleLabels = { '6': '6 點起飛', 'even': '雙數起飛', 'odd': '單數起飛' };
            this.ruleStatusEl.textContent = `起飛規則：${ruleLabels[rule] || '未知'}`;
        }
    }

    // 遊戲結束提示
    showGameOver(winner) {
        this.setStatus(`🎉 遊戲結束！${winner.name} 獲勝！`, true);
        this.setRollButtonEnabled(false);
    }
}

export default UI;
