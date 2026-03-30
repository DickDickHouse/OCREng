// main.js - 檢查點 #0
console.log("[CHECKPOINT] main.js 已載入");

import Game from './Game.js';

window.addEventListener('DOMContentLoaded', () => {
    console.log("[CHECKPOINT] DOMContentLoaded 觸發");
    try {
        const game = new Game();
        console.log("[CHECKPOINT] Game 實例創建成功！");
    } catch (error) {
        console.error("[ERROR] Game 建構子拋出異常:", error);
    }
});
