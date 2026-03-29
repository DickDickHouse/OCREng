// main.js
import { initDOM } from './ui.js';
import { renderPieces } from './ui.js';
import { initPlayerPaths } from './board.js';

window.addEventListener("DOMContentLoaded", () => {
    console.log("[MAIN] 開始初始化...");
    
    // 1. 初始化 DOM
    initDOM();
    
    // 2. 初始化棋盤
    if (!document.getElementById("board")) {
        console.error("❌ 找不到 #board 元素！");
        return;
    }
    
    // 3. 初始化遊戲
    document.getElementById("board").innerHTML = "";
    document.getElementById("board").style.display = "grid";
    document.getElementById("board").style.gridTemplateColumns = `repeat(${15}, 26px)`;
    document.getElementById("board").style.gridTemplateRows = `repeat(${15}, 26px)`;
    document.getElementById("board").style.gap = "2px";
    document.getElementById("board").style.background = "#fff";
    document.getElementById("board").style.borderRadius = "8px";
    document.getElementById("board").style.padding = "8px";

    // 4. 填充格子
    boardCells.forEach((cellData) => {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cellData.classes.forEach(cls => cell.classList.add(cls));
        document.getElementById("board").appendChild(cell);
    });

    // 5. 渲染初始棋子
    renderPieces();
    
    // 6. 更新玩家顯示
    updateCurrentPlayerDisplay();
    
    // 7. 綁定事件
    const rollButton = document.getElementById("roll-button");
    if (rollButton) {
        rollButton.addEventListener("click", handleRollDice);
    }

    console.log("[MAIN] 初始化完成！");    
});
