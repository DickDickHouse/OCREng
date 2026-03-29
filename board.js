// board.js
import { BOARD_ROWS, BOARD_COLS } from './config.js';
import { xyToIndex } from './utils.js';
import { 
    boardCells, 
    startCells, 
    homePaths, 
    flySquares, 
    jumpPairs,
    safeCells,
    homeEntryIndex,
    playerStartIndex,
    basePath,
    baseIndexByCell,
    homePaths as homePathsDef
} from './paths.js';

// 初始化棋盤格子數據
export const boardCells = [];
for (let r = 0; r < BOARD_ROWS; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
        boardCells.push({ row: r, col: c, isPath: false, classes: [] });
    }
}

// 畫家區
export function paintHomeArea(x1, y1, x2, y2, className) {
    for (let y = y1; y <= y2; y++) {
        for (let x = x1; x <= x2; x++) {
            boardCells[xyToIndex(x, y)].classes.push(className);
        }
    }
}

paintHomeArea(1, 1, 3, 3, "cell-home-blue");
paintHomeArea(13 1, 15, 3, "cell-home-red");
paintHomeArea(1, 13, 3, 15, "cell-home-green");
paintHomeArea(13, 13, 15, 15, "cell-home-yellow");

// 中心格
const centerCells = [
    [7,7],[8,7],[9,7],
    [7,8],[8,8],[9,8],
    [7,9],[8,9],[9,9],
];
centerCells.forEach(([x,y]) => {
    let cls = "center-core";
    if (x === 8 && y === 7) cls = "center-red";
    else if (x === 9 && y === 8) cls = "center-yellow";
    else if (x === 8 && y === 9) cls = "center-green";    else if (x === 7 && y === 8) cls = "center-blue";
    boardCells[xyToIndex(x,y)].classes.push(cls);
});

// 標記路徑
basePath.forEach((idx, i) => {
    const color = basePathWithColor[i][2];
    boardCells[idx].isPath = true;
    boardCells[idx].classes.push("cell-path", `cell-path-${color}`);
});

// 標記起飛點
boardCells[startCells.blue].classes.push("start-blue");
boardCells[startCells.red].classes.push("start-red");
boardCells[startCells.green].classes.push("start-green");
boardCells[startCells.yellow].classes.push("start-yellow");

// 標記家區終點
homePathsDef.blue.forEach(i => boardCells[i].classes.push("cell-homepath-blue"));
homePathsDef.green.forEach(i => boardCells[i].classes.push("cell-homepath-green"));
homePathsDef.red.forEach(i => boardCells[i].classes.push("cell-homepath-red"));
homePathsDef.yellow.forEach(i => boardCells[i].classes.push("cell-homepath-yellow"));

// 標記飛行與跳躍
Object.values(flySquares).forEach(f => boardCells[f.from].classes.push(f.dir));
jumpPairs.forEach(([x1,y1,x2,y2]) => {
    boardCells[xyToIndex(x1,y1)].classes.push("cell-jump");
    boardCells[xyToIndex(x2,y2)].classes.push("cell-jump");
});

// 標記分界格
boardCells[xyToIndex(5,5)].classes.push("cell-split-55");
boardCells[xyToIndex(11,5)].classes.push("cell-split-115");
boardCells[xyToIndex(11,11)].classes.push("cell-split-1111");
boardCells[xyToIndex(5,11)].classes.push("cell-split-511");

// 生成玩家路徑
export const playerPaths = {};
export function initPlayerPaths() {
    Object.keys(startCells).forEach((color) => {
        const startIndex = playerStartIndex[color];
        const entryIndex = homeEntryIndex[color];
        const path = [];
        let idx = startIndex;
        while (true) {
            path.push(basePath[idx]);
            if (idx === entryIndex) break;
            idx = (idx + 1) % basePath.length;
        }
        playerPaths[color] = path.concat(homePathsDef[color].slice(1));    });
}

initPlayerPaths();

// 棋子位置計算
export function getPieceCellIndex(player, piece) {
    if (piece.status === "home") {
        return homePositions[player.color][piece.homeIndex];
    }
    if (piece.status === "track" && piece.progress === 0) {
        return startCells[player.color];
    }
    if (piece.status === "track" && piece.progress > 0) {
        if (piece.progress - 1 < playerPaths[player.color].length) {
            return playerPaths[player.color][piece.progress - 1];
        }
    }
    return homePositions[player.color][0];
}
