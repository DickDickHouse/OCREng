// ... [前面的程式碼保持不變] ...

function renderPieces() {
    if (!boardEl) return;
    const cells = boardEl.getElementsByClassName("cell");
    if (cells.length === 0) return;
    
    // 清除舊的 pieces-container
    for (let cell of cells) {
        const old = cell.querySelector(".pieces-container");
        if (old) cell.removeChild(old);
    }

    // ✅ 修正：直接根據 (x, y) 座標計算索引，並確保範圍正確
    const startPoints = [
        { color: "blue",  x: 1, y: 4 },   // 藍方：第1列第4行
        { color: "red",   x: 12, y: 1 },  // 紅方：第12列第1行
        { color: "green", x: 4, y: 15 },  // 綠方：第4列第15行（最底行）
        { color: "yellow",x: 15, y: 12 }  // 黃方：第15列第12行
    ];

    startPoints.forEach(({ color, x, y }) => {
        // ✅ 安全檢查：x, y 是否在 1~15 範圍內
        if (x < 1 || x > 15 || y < 1 || y > 15) {
            console.warn(`⚠️ 起飛點 (${x},${y}) 超出棋盤範圍`);
            return;
        }

        // 計算索引：row = y-1, col = x-1
        const idx = (y - 1) * BOARD_COLS + (x - 1);
        
        // 再次安全檢查
        if (idx < 0 || idx >= cells.length) {
            console.warn(`⚠️ 索引 ${idx} 超出 cells 範圍（總數 ${cells.length}）`);
            return;
        }

        const cell = cells[idx];
        if (!cell) return;

        const container = document.createElement("div");
        container.className = "pieces-container";
        container.style.position = "absolute";
        container.style.inset = "2px";
        container.style.display = "grid";
        container.style.gridTemplateColumns = "1fr 1fr";
        container.style.gridTemplateRows = "1fr 1fr";

        const piece = document.createElement("div");
        piece.className = `piece ${color}`;
        piece.style.width = "14px";
        piece.style.height = "14px";
        piece.style.borderRadius = "50%";
        piece.style.margin = "auto";
        piece.style.boxShadow = "0 0 2px rgba(0,0,0,0.4)";
        
        // 設定顏色
        if (color === "blue") piece.style.backgroundColor = "#1890ff";
        if (color === "red")  piece.style.backgroundColor = "#ff4d4f";
        if (color === "green")piece.style.backgroundColor = "#52c41a";
        if (color === "yellow")piece.style.backgroundColor = "#faad14";

        container.appendChild(piece);
        cell.appendChild(container);
    });

    console.log("✅ [renderPieces] 4 顆棋子已渲染（含綠方）");
}
