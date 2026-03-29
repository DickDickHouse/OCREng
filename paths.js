// paths.js
import { BOARD_ROWS, BOARD_COLS, PATH_LENGTH } from './config.js';
import { xyToIndex, lineCoords } from './utils.js';

// 路徑定義
const basePathWithColor = [
    [2,5, "blue"], [3,5, "blue"], [4,5, "blue"],
    [5,4, "green"], [5,3, "blue"], [5,2, "blue"], [5,1, "blue"],
    [6,1, "green"], [7,1, "blue"], [8,1, "red"], [9,1, "yellow"], [10,1, "green"],
    [11,1, "blue"], [11,2, "red"], [11,3, "yellow"], [11,4, "green"],
    [12,5, "blue"], [13,5, "red"], [14,5, "yellow"], [15,5, "green"],
    [15,6, "blue"], [15,7, "red"], [15,8, "yellow"], [15,9, "green"],
    [15,10, "blue"], [15,11, "red"],
    [14,11, "yellow"], [13,11, "green"], [12,11, "blue"],
    [11,12, "red"], [11,13, "yellow"], [11,14 "green"], [11,15, "blue"],
    [10,15, "red"], [9,15, "yellow"], [8,15, "green"],
    [7,15, "blue"], [6,15, "red"], [5,15, "yellow"],
    [5,14, "green"], [5,13, "blue"], [5,12, "red"],
    [4,11, "yellow"], [3,11, "green"], [2,11, "blue"],
    [1,11, "red"], [1,10, "yellow"], [1,9, "green"], [1,8, "blue"],
    [1,7, "red"], [1,6, "yellow"], [1,5, "green"]
];

export const basePath = [];
export const baseIndexByCell = new Map();

basePathWithColor.forEach(([x,y,color]) => {
    const idx = xyToIndex(x,y);
    baseIndexByCell.set(idx, basePath.length);
    basePath.push(idx);
});

// 起飛點
export const startCellsXY = {
    blue: [1,4],
    red: [12,1],
    green: [4,15],
    yellow: [15,12],
};

export const startCells = {
    blue: xyToIndex(...startCellsXY.blue),
    red: xyToIndex(...startCellsXY.red),
    green: xyToIndex(...startCellsXY.green),
    yellow: xyToIndex(...startCellsXY.yellow),
};

// 第一步
export const startStepXY = {
    blue: [2,5],    red: [11,2],
    green: [5,14],
    yellow: [14,11],
};

export const playerStartIndex = {
    blue: baseIndexByCell.get(xyToIndex(...startStepXY.blue)),
    red: baseIndexByCell.get(xyToIndex(...startStepXY.red)),
    green: baseIndexByCell.get(xyToIndex(...startStepXY.green)),
    yellow: baseIndexByCell.get(xyToIndex(...startStepXY.yellow)),
};

// 終點入口
export const homeEntryCellsXY = {
    red: [8,1],
    yellow: [15,8],
    green: [8,15],
    blue: [1,8],
};

export const homeEntryIndex = {
    red: baseIndexByCell.get(xyToIndex(...homeEntryCellsXY.red)),
    yellow: baseIndexByCell.get(xyToIndex(...homeEntryCellsXY.yellow)),
    green: baseIndexByCell.get(xyToIndex(...homeEntryCellsXY.green)),
    blue: baseIndexByCell.get(xyToIndex(...homeEntryCellsXY.blue)),
};

// 家區
export const homePaths = {
    red: lineCoords(8,2,8,7).map(([x,y]) => xyToIndex(x,y)),
    yellow: lineCoords(14,8,9,8).map(([x,y]) => xyToIndex(x,y)),
    green: lineCoords(8,14,8,9).map(([x,y]) => xyToIndex(x,y)),
    blue: lineCoords(2,8,7,8).map(([x,y]) => xyToIndex(x,y)),
};

// 飛行
export const flySquares = {
    yellow: { from: xyToIndex(4,11), to: xyToIndex(4,15), dir: "fly-up" },
    green:  { from: xyToIndex(5,4),  to: xyToIndex(11,4), dir: "fly-right" },
    blue:   { from: xyToIndex(12,5), to: xyToIndex(12,11), dir: "fly-down" },
    red:    { from: xyToIndex(11,12),to: xyToIndex(5,12), dir: "fly-left" },
};

// 跳躍
export const jumpPairs = [
    [4,5,5,4],
    [11,4,12,5],
    [12,11,11,12],
    [5,12,4,11],
];
// 安全格子（不會被吃）
export const safeCells = new Set([
    startCells.blue, startCells.green, startCells.red, startCells.yellow,
    flySquares.blue.from, flySquares.green.from, flySquares.red.from, flySquares.yellow.from,
]);

// 計算進度
export function baseIndexToProgress(color, baseIndex) {
    return (baseIndex - playerStartIndex[color] + PATH_LENGTH) % PATH_LENGTH;
}
