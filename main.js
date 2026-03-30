// main.js - 遊戲入口點
import Game from './Game.js';

let gameInstance = null;

window.addEventListener('DOMContentLoaded', () => {
    console.log('[OOP] DOM 加載完成，初始化遊戲...');
    gameInstance = new Game();
    console.log('[OOP] 遊戲初始化完成！');
});
