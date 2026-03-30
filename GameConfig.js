// GameConfig.js - 檢查點 #1
console.log("[CHECKPOINT] GameConfig.js 已載入");

class GameConfig {
    static ROWS = 15;
    static COLS = 15;
    static COLORS = ['red', 'blue', 'green', 'yellow'];
    static PLAYER_NAMES = ['紅方', '藍方', '綠方', '黃方'];
    static PIECES_PER_PLAYER = 4;

    static PATHS = {
        basePathWithColor: [
            [2,5, "blue"], [3,5, "blue"], [4,5, "blue"],
            [5,4, "green"], [5,3, "blue"], [5,2, "blue"], [5,1, "blue"],
            [6,1, "green"], [7,1, "blue"], [8,1, "red"], [9,1, "yellow"], [10,1, "green"],
            [11,1, "blue"], [11,2, "red"], [11,3, "yellow"], [11,4, "green"],
            [12,5, "blue"], [13,5, "red"], [14,5, "yellow"], [15,5, "green"],
            [15,6, "blue"], [15,7, "red"], [15,8, "yellow"], [15,9, "green"],
            [15,10, "blue"], [15,11, "red"],
            [14,11, "yellow"], [13,11, "green"], [12,11, "blue"],
            [11,12, "red"], [11,13, "yellow"], [11,14, "green"], [11,15, "blue"],
            [10,15, "red"], [9,15, "yellow"], [8,15, "green"],
            [7,15, "blue"], [6,15, "red"], [5,15, "yellow"],
            [5,14, "green"], [5,13, "blue"], [5,12, "red"],
            [4,11, "yellow"], [3,11, "green"], [2,11, "blue"],
            [1,11, "red"], [1,10, "yellow"], [1,9, "green"], [1,8, "blue"],
            [1,7, "red"], [1,6, "yellow"], [1,5, "green"]
        ],
        startCellsXY: {
            blue: [1,4],
            red: [12,1],
            green: [4,15],
            yellow: [15,12],
        },
        startStepXY: {
            blue: [2,5],
            red: [11,2],
            green: [5,14],
            yellow: [14,11],
        },
        homeEntryCellsXY: {
            red: [8,1],
            yellow: [15,8],
            green: [8,15],
            blue: [1,8],
        },
        homeAreas: { // 家區座標 (x1, y1) 到 (x2, y2)
            red: { x1: 13, y1: 1, x2: 15, y2: 3 },
            blue: { x1: 1, y1: 1, x2: 3, y2: 3 },
            green: { x1: 1, y1: 13, x2: 3, y2: 15 },
            yellow: { x1: 13, y1: 13, x2: 15, y2: 15 },
        },
        homePositions: { // 家區內 4 個棋子位置
            red: [[13, 1], [15, 1], [13, 3], [15, 3]],
            blue: [[1,1], [3,1], [1,3], [3,3]],
            green: [[1,13], [3,13], [1,15], [3,15]],
            yellow: [[13,13], [15,13], [13,15], [15,15]],
        }
    };

    static xyToIndex(x, y) {
        const col = x - 1;
        const row = y - 1;
        return row * this.COLS + col;
    }

    static lineCoords(x1, y1, x2, y2) {
        const coords = [];
        if (x1 === x2) {
            const step = y1 <= y2 ? 1 : -1;
            for (let y = y1; y !== y2 + step; y += step) coords.push([x1, y]);
        } else if (y1 === y2) {
            const step = x1 <= x2 ? 1 : -1;
            for (let x = x1; x !== x2 + step; x += step) coords.push([x, y1]);
        }
        return coords;
    }
}

export default GameConfig;
