// Dice.js - 骰子類別
class Dice {
    constructor(imageElementId, resultElementId) {
        this.imageElement = document.getElementById(imageElementId);
        this.resultElement = document.getElementById(resultElementId);
        this.currentValue = 0;
        this.isRolling = false;
    }

    roll() {
        if (this.isRolling) return; // 防止重複投擲

        this.isRolling = true;
        this.animate();

        // 模擬投擲時間後得出結果
        setTimeout(() => {
            this.currentValue = Math.floor(Math.random() * 6) + 1;
            this.updateDisplay(this.currentValue);
            this.isRolling = false;
            // 通知遊戲控制器骰子已停止
            if (window.gameInstance) {
                 window.gameInstance.onDiceRolled(this.currentValue);
            }
        }, 1000 + Math.random() * 1000); // 隨機延遲 1-2 秒
    }

    animate() {
        if (this.imageElement) {
            this.imageElement.classList.add('is-rolling');
        }
        let animCount = 0;
        const animInterval = setInterval(() => {
            const tempValue = Math.floor(Math.random() * 6) + 1;
            this.updateDisplay(tempValue);
            animCount++;
            if (animCount > 10 && !this.isRolling) { // 如果動畫結束但仍在計時器中
                clearInterval(animInterval);
            }
        }, 100);
    }

    updateDisplay(value) {
        if (this.imageElement) {
            this.imageElement.src = `images/dice-${value}.svg`;
            this.imageElement.alt = `Dice ${value}`;
        }
        if (this.resultElement) {
            this.resultElement.textContent = value.toString();
        }
    }

    reset() {
        this.currentValue = 0;
        this.updateDisplay(0);
        if (this.imageElement) {
            this.imageElement.classList.remove('is-rolling');
            this.imageElement.src = 'images/dice-blank.svg';
            this.imageElement.alt = 'Dice idle';
        }
    }
}

export default Dice;
