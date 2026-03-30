// Dice.js
class Dice {
    constructor(imageElementId, resultElementId) {
        this.imageElement = document.getElementById(imageElementId);
        this.resultElement = document.getElementById(resultElementId);
        this.currentValue = 0;
        this.isRolling = false;
    }

    roll() {
        if (this.isRolling) return;
        this.isRolling = true;
        this.animate();

        setTimeout(() => {
            this.currentValue = Math.floor(Math.random() * 6) + 1;
            this.updateDisplay(this.currentValue);
            this.isRolling = false;
            if (window.gameInstance) {
                window.gameInstance.onDiceRolled(this.currentValue);
            }
        }, 1000 + Math.random() * 1000);
    }

    animate() {
        if (this.imageElement) {
            this.imageElement.classList.add('is-rolling');
        }
        let count = 0;
        const interval = setInterval(() => {
            const temp = Math.floor(Math.random() * 6) + 1;
            this.updateDisplay(temp);
            count++;
            if (count > 10) clearInterval(interval);
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
