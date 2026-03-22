const VERSION = "v32-custom-path";
const versionEl = document.getElementById("version");
if (versionEl) versionEl.textContent = `版本：${VERSION}`;

const BOARD_ROWS = 15;
const BOARD_COLS = 15;

// (x,y) -> index, x,y are 1-based with (1,1) at top-left
function xyToIndex(x, y) {
  const col = x - 1;
  const row = y - 1;
  return row * BOARD_COLS + col;
}

const boardCells = [];
for (let r = 0; r < BOARD_ROWS; r++) {
  for (let c = 0; c < BOARD_COLS; c++) {
    boardCells.push({ row: r, col: c, isPath: false, classes: [] });
  }
}

// ====== 家區 (3x3) ======
function paintHomeArea(x1, y1, x2, y2, className) {
  for (let y = y1; y <= y2; y++) {
    for (let x = x1; x <= x2; x++) {
      boardCells[xyToIndex(x, y)].classes.push(className);
    }
  }
}
paintHomeArea(1, 1, 3, 3, "cell-home-blue");
paintHomeArea(13, 1, 15, 3, "cell-home-red");
paintHomeArea(1, 13, 3, 15, "cell-home-green");
paintHomeArea(13, 13, 15, 15, "cell-home-yellow");

// ====== 中央 3x3（終點色修正） ======
const centerCells = [
  [7,7],[8,7],[9,7],
  [7,8],[8,8],[9,8],
  [7,9],[8,9],[9,9],
];
centerCells.forEach(([x,y]) => {
  let cls = "center-core";
  if (x === 8 && y === 7) cls = "center-red";
  else if (x === 9 && y === 8) cls = "center-yellow";
  else if (x === 8 && y === 9) cls = "center-green";
  else if (x === 7 && y === 8) cls = "center-blue";
  boardCells[xyToIndex(x,y)].classes.push(cls);
});

// ====== 外圈路徑 ======
const basePathWithColor = [
  [5,1,"yellow"], [6,1,"green"], [7,1,"blue"], [8,1,"red"], [9,1,"yellow"], [10,1,"green"],
  [11,1,"blue"], [11,2,"red"], [11,3,"yellow"], [11,4,"green"], [12,5,"blue"], [13,5,"red"],
  [14,5,"yellow"], [15,5,"green"], [15,6,"blue"], [15,7,"red"], [15,8,"yellow"], [15,9,"green"],
  [15,10,"blue"], [15,11,"red"], [14,11,"yellow"], [13,11,"green"], [12,11,"blue"], [11,12,"red"],
  [11,13,"yellow"], [11,14,"green"], [11,15,"blue"], [10,15,"red"], [9,15,"yellow"], [8,15,"green"],
  [7,15,"blue"], [6,15,"red"], [5,15,"yellow"], [5,14,"green"], [5,13,"blue"], [5,12,"red"],
  [4,11,"yellow"], [3,11,"green"], [2,11,"blue"], [1,11,"red"], [1,10,"yellow"], [1,9,"green"],
  [1,8,"blue"], [1,7,"red"], [1,6,"yellow"], [1,5,"green"], [2,5,"blue"], [3,5,"red"],
  [4,5,"yellow"], [5,4,"green"], [5,3,"blue"], [5,2,"red"]
];

const basePath = [];
const baseIndexByCell = new Map();

basePathWithColor.forEach(([x,y,color]) => {
  const idx = xyToIndex(x,y);
  baseIndexByCell.set(idx, basePath.length);
  basePath.push(idx);

  boardCells[idx].isPath = true;
  boardCells[idx].classes.push("cell-path", `cell-path-${color}`);
});

const PATH_LENGTH = basePath.length;

// ====== 起飛點 ======
const startCellsXY = {
  blue: [1,4],
  red: [12,1],
  green: [4,15],
  yellow: [12,15],
};
const startCells = {
  blue: xyToIndex(...startCellsXY.blue),
  red: xyToIndex(...startCellsXY.red),
  green: xyToIndex(...startCellsXY.green),
  yellow: xyToIndex(...startCellsXY.yellow),
};
boardCells[startCells.blue].classes.push("start-blue");
boardCells[startCells.red].classes.push("start-red");
boardCells[startCells.green].classes.push("start-green");
boardCells[startCells.yellow].classes.push("start-yellow");

// ====== 起步點 ======
const startStepXY = {
  blue: [1,5],
  red: [11,1],
  green: [5,15],
  yellow: [11,15],
};
const playerStartIndex = {
  blue: baseIndexByCell.get(xyToIndex(...startStepXY.blue)),
  red: baseIndexByCell.get(xyToIndex(...startStepXY.red)),
  green: baseIndexByCell.get(xyToIndex(...startStepXY.green)),
  yellow: baseIndexByCell.get(xyToIndex(...startStepXY.yellow)),
};

// ====== 終點通道 ======
function lineCoords(x1,y1,x2,y2) {
  const coords = [];
  if (x1 === x2) {
    const step = y1 <= y2 ? 1 : -1;
    for (let y = y1; y !== y2 + step; y += step) coords.push([x1,y]);
  } else if (y1 === y2) {
    const step = x1 <= x2 ? 1 : -1;
    for (let x = x1; x !== x2 + step; x += step) coords.push([x,y1]);
  }
  return coords;
}

const homePaths = {
  red:   lineCoords(8,1,8,7).map(([x,y]) => xyToIndex(x,y)),
  yellow:lineCoords(15,8,9,8).map(([x,y]) => xyToIndex(x,y)),
  green: lineCoords(8,15,8,9).map(([x,y]) => xyToIndex(x,y)),
  blue:  lineCoords(1,8,7,8).map(([x,y]) => xyToIndex(x,y)),
};
homePaths.blue.forEach(i => boardCells[i].classes.push("cell-homepath-blue"));
homePaths.green.forEach(i => boardCells[i].classes.push("cell-homepath-green"));
homePaths.red.forEach(i => boardCells[i].classes.push("cell-homepath-red"));
homePaths.yellow.forEach(i => boardCells[i].classes.push("cell-homepath-yellow"));

// ====== 飛行隧道（箭頭移到 4,11 且向上） ======
const flySquares = {
  yellow: { from: xyToIndex(4,11), to: xyToIndex(4,10), dir: "fly-up" },
  green:  { from: xyToIndex(5,4),  to: xyToIndex(11,4), dir: "fly-right" },
  blue:   { from: xyToIndex(12,5), to: xyToIndex(12,11), dir: "fly-down" },
  red:    { from: xyToIndex(11,12),to: xyToIndex(5,12), dir: "fly-left" },
};
Object.values(flySquares).forEach(f => boardCells[f.from].classes.push(f.dir));

// ====== 跳棋顯示（不連續位置） ======
const jumpPairs = [
  [4,5,5,4],
  [11,4,12,5],
  [12,11,11,12],
  [5,12,4,11],
];
jumpPairs.forEach(([x1,y1,x2,y2]) => {
  boardCells[xyToIndex(x1,y1)].classes.push("cell-jump");
  boardCells[xyToIndex(x2,y2)].classes.push("cell-jump");
});

// ====== 斜切雙色格 ======
boardCells[xyToIndex(5,5)].classes.push("cell-split-55");
boardCells[xyToIndex(11,5)].classes.push("cell-split-115");
boardCells[xyToIndex(11,11)].classes.push("cell-split-1111");
boardCells[xyToIndex(5,11)].classes.push("cell-split-511");

// ====== 延伸梯形框 ======
boardCells[xyToIndex(4,5)].classes.push("cell-extend-45");
boardCells[xyToIndex(5,4)].classes.push("cell-extend-54");
boardCells[xyToIndex(11,4)].classes.push("cell-extend-114");
boardCells[xyToIndex(12,5)].classes.push("cell-extend-125");
boardCells[xyToIndex(12,11)].classes.push("cell-extend-1211");
boardCells[xyToIndex(11,12)].classes.push("cell-extend-1112");
boardCells[xyToIndex(4,11)].classes.push("cell-extend-411");
boardCells[xyToIndex(5,12)].classes.push("cell-extend-512");

// ====== 單邊虛線 ======
boardCells[xyToIndex(4,4)].classes.push("edge-dash-right");   // (4,4)-(5,4)
boardCells[xyToIndex(5,4)].classes.push("edge-dash-left");

boardCells[xyToIndex(5,5)].classes.push("edge-dash-bottom");  // (5,5)-(5,6)
boardCells[xyToIndex(5,6)].classes.push("edge-dash-top");

boardCells[xyToIndex(5,5)].classes.push("edge-dash-right");   // (5,5)-(6,5)
boardCells[xyToIndex(6,5)].classes.push("edge-dash-left");

boardCells[xyToIndex(11,11)].classes.push("edge-dash-top");   // (11,11)-(11,10)
boardCells[xyToIndex(11,10)].classes.push("edge-dash-bottom");

boardCells[xyToIndex(11,11)].classes.push("edge-dash-left");  // (11,11)-(10,11)
boardCells[xyToIndex(10,11)].classes.push("edge-dash-right");

// 移除 (11,11)-(12,11) & (11,11)-(11,12) → 不加任何虛線

boardCells[xyToIndex(11,12)].classes.push("edge-dash-left");  // (11,12)-(10,12)
boardCells[xyToIndex(10,12)].classes.push("edge-dash-right");

boardCells[xyToIndex(11,4)].classes.push("edge-dash-left");   // (11,4)-(10,4)
boardCells[xyToIndex(10,4)].classes.push("edge-dash-right");

boardCells[xyToIndex(11,5)].classes.push("edge-dash-left");   // (11,5)-(10,5)
boardCells[xyToIndex(10,5)].classes.push("edge-dash-right");

boardCells[xyToIndex(5,11)].classes.push("edge-dash-top");    // (5,11)-(5,10)
boardCells[xyToIndex(5,10)].classes.push("edge-dash-bottom");

boardCells[xyToIndex(5,12)].classes.push("edge-dash-left");   // (5,12)-(4,12)
boardCells[xyToIndex(4,12)].classes.push("edge-dash-right");

// ====== 其餘邏輯保持不變 ======
const safeCells = new Set([
  startCells.blue, startCells.green, startCells.red, startCells.yellow,
  flySquares.blue.from, flySquares.green.from, flySquares.red.from, flySquares.yellow.from,
]);

const playerPaths = {};
Object.keys(startCells).forEach((color) => {
  const startIndex = playerStartIndex[color];
  const rotated = basePath.slice(startIndex).concat(basePath.slice(0, startIndex));
  playerPaths[color] = rotated.concat(homePaths[color]);
});

function baseIndexToProgress(color, baseIndex) {
  return (baseIndex - playerStartIndex[color] + basePath.length) % basePath.length;
}

// ...其餘玩家/遊戲邏輯保持不變（直接沿用你現有的 main.js 後半段）
