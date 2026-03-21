const VERSION = "v26-ring-debug";
const versionEl = document.getElementById("version");
if (versionEl) versionEl.textContent = `版本：${VERSION}`;

const BOARD_ROWS = 15;
const BOARD_COLS = 15;
function rcToIndex(r, c) { return r * BOARD_COLS + c; }

const boardCells = [];
for (let r = 0; r < BOARD_ROWS; r++) {
  for (let c = 0; c < BOARD_COLS; c++) {
    boardCells.push({ row: r, col: c, isPath: false, classes: [] });
  }
}

// 四角家區（2x2）
function paintHomeArea(rStart, cStart, className) {
  for (let r = rStart; r < rStart + 2; r++) {
    for (let c = cStart; c < cStart + 2; c++) {
      boardCells[rcToIndex(r, c)].classes.push(className);
    }
  }
}
paintHomeArea(0, 0, "cell-home-blue");
paintHomeArea(0, 13, "cell-home-green");
paintHomeArea(13, 0, "cell-home-yellow");
paintHomeArea(13, 13, "cell-home-red");

// 中央 3x3（上綠、右紅、下黃、左藍）
const centerCells = [
  [6,6],[6,7],[6,8],
  [7,6],[7,7],[7,8],
  [8,6],[8,7],[8,8],
];
centerCells.forEach(([r,c]) => {
  let cls = "center-core";
  if (r === 6 && c === 7) cls = "center-green";
  else if (r === 8 && c === 7) cls = "center-yellow";
  else if (r === 7 && c === 6) cls = "center-blue";
  else if (r === 7 && c === 8) cls = "center-red";
  boardCells[rcToIndex(r,c)].classes.push(cls);
});

// ✅ 外圈 52 格（明確一圈）
const basePathCoords = [
  [6,1],[6,2],[6,3],[6,4],[6,5],
  [5,6],[4,6],[3,6],[2,6],[1,6],[0,6],
  [0,7],[0,8],
  [1,8],[2,8],[3,8],[4,8],[5,8],
  [6,9],[6,10],[6,11],[6,12],[6,13],[6,14],
  [7,14],[8,14],
  [8,13],[8,12],[8,11],[8,10],[8,9],
  [9,8],[10,8],[11,8],[12,8],[13,8],[14,8],
  [14,7],[14,6],
  [13,6],[12,6],[11,6],[10,6],[9,6],
  [8,5],[8,4],[8,3],[8,2],[8,1],[8,0],
  [7,0],[6,0],
];

const basePath = [];
const baseIndexByCell = new Map();
basePathCoords.forEach(([r,c]) => {
  const idx = rcToIndex(r,c);
  baseIndexByCell.set(idx, basePath.length);
  basePath.push(idx);
});
const PATH_LENGTH = basePath.length;

// 起飛格（四邊中點）
const startCells = {
  blue: rcToIndex(6,1),
  green: rcToIndex(1,8),
  red: rcToIndex(8,13),
  yellow: rcToIndex(13,6),
};
boardCells[startCells.blue].classes.push("start-blue");
boardCells[startCells.green].classes.push("start-green");
boardCells[startCells.red].classes.push("start-red");
boardCells[startCells.yellow].classes.push("start-yellow");

// 主路顏色分段
const colorOrder = ["blue", "green", "red", "yellow"];
const colorClassMap = {
  red: "cell-path-red",
  blue: "cell-path-blue",
  green: "cell-path-green",
  yellow: "cell-path-yellow",
};
colorOrder.forEach((color) => {
  const startIndex = baseIndexByCell.get(startCells[color]);
  for (let i = 0; i < 13; i++) {
    const idx = basePath[(startIndex + i) % basePath.length];
    boardCells[idx].classes.push(colorClassMap[color]);
  }
});
basePath.forEach((idx) => {
  boardCells[idx].isPath = true;
  if (!boardCells[idx].classes.includes("cell-path")) {
    boardCells[idx].classes.push("cell-path");
  }
  boardCells[idx].classes.push("cell-path-dot"); // ✅ 外圈小點
});

// 終點道（6 格）
const homePaths = {
  blue:  [rcToIndex(7,1), rcToIndex(7,2), rcToIndex(7,3), rcToIndex(7,4), rcToIndex(7,5), rcToIndex(7,6)],
  green: [rcToIndex(1,7), rcToIndex(2,7), rcToIndex(3,7), rcToIndex(4,7), rcToIndex(5,7), rcToIndex(6,7)],
  red:   [rcToIndex(7,13), rcToIndex(7,12), rcToIndex(7,11), rcToIndex(7,10), rcToIndex(7,9), rcToIndex(7,8)],
  yellow:[rcToIndex(13,7), rcToIndex(12,7), rcToIndex(11,7), rcToIndex(10,7), rcToIndex(9,7), rcToIndex(8,7)],
};

homePaths.blue.forEach(i => boardCells[i].classes.push("cell-homepath-blue"));
homePaths.green.forEach(i => boardCells[i].classes.push("cell-homepath-green"));
homePaths.red.forEach(i => boardCells[i].classes.push("cell-homepath-red"));
homePaths.yellow.forEach(i => boardCells[i].classes.push("cell-homepath-yellow"));

// 其餘遊戲邏輯（不變）
