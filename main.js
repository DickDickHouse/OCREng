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
  if (x === 8 && y === 7) cls = "center-red";       // 紅隊終點
  else if (x === 9 && y === 8) cls = "center-yellow"; // 黃隊終點
  else if (x === 8 && y === 9) cls = "center-green";  // 綠隊終點
