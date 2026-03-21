const VERSION = "v28-outer-perimeter";
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

// ✅ 外圈 52 格（真正外圍一圈，不含四角）
const basePathCoords = [];
// 上邊（跳過角落）
for (let c = 1; c <= 13; c++) basePathCoords.push([0, c]);
// 右邊
for (let r = 1; r <= 13; r++) basePathCoords.push([r, 14]);
// 下邊
for (let c = 13; c >= 1; c--) basePathCoords.push([14, c]);
// 左邊
for (let r = 13; r >= 1; r--) basePathCoords.push([r, 0]);

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
  blue: rcToIndex(7,0),
  green: rcToIndex(0,7),
  red: rcToIndex(7,14),
  yellow: rcToIndex(14,7),
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
  boardCells[idx].classes.push("cell-path-dot");
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

// 玩家（保留 4 顆）
const homePositions = {
  blue:  [rcToIndex(0,0), rcToIndex(0,1), rcToIndex(1,0), rcToIndex(1,1)],
  green: [rcToIndex(0,13), rcToIndex(0,14), rcToIndex(1,13), rcToIndex(1,14)],
  yellow:[rcToIndex(13,0), rcToIndex(13,1), rcToIndex(14,0), rcToIndex(14,1)],
  red:   [rcToIndex(13,13), rcToIndex(13,14), rcToIndex(14,13), rcToIndex(14,14)],
};

const players = [
  { id:0, name:"紅方", color:"red", colorClass:"red", pieces: Array.from({length:4}, (_,i)=>({status:"home", homeIndex:i, progress:0})) },
  { id:1, name:"藍方", color:"blue", colorClass:"blue", pieces: Array.from({length:4}, (_,i)=>({status:"home", homeIndex:i, progress:0})) },
  { id:2, name:"綠方", color:"green", colorClass:"green", pieces: Array.from({length:4}, (_,i)=>({status:"home", homeIndex:i, progress:0})) },
  { id:3, name:"黃方", color:"yellow", colorClass:"yellow", pieces: Array.from({length:4}, (_,i)=>({status:"home", homeIndex:i, progress:0})) },
];

const boardEl = document.getElementById("board");

function initBoard() {
  boardEl.innerHTML = "";
  boardEl.style.gridTemplateColumns = `repeat(${BOARD_COLS}, 26px)`;
  boardEl.style.gridTemplateRows = `repeat(${BOARD_ROWS}, 26px)`;

  boardCells.forEach((cellData) => {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cellData.classes.forEach((cls) => cell.classList.add(cls));
    if (cellData.isPath) cell.textContent = "•";
    boardEl.appendChild(cell);
  });
}

window.addEventListener("load", initBoard);
