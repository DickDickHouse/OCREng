// Board.js - 棋盤類別
import GameConfig from 'GameConfig.js';

class Board {
    constructor(boardElementId) {
        this.element = document.getElementById(boardElementId);
        if (!this.element) {
            throw new Error(`找不到棋盤元素: ${boardElementId}`);
        }
        this.cells = [];
        this.boardData = []; // 用於存儲格子的額外數據
        this.paths = {}; // 存儲玩家路徑
        this.initBoardData();
        this.initPaths();
    }

    // 初始化棋盤數據 (包含路徑、家區等信息)
    initBoardData() {
        this.boardData = [];
        for (let r = 0; r < GameConfig.ROWS; r++) {
            this.boardData[r] = [];
            for (let c = 0; c < GameConfig.COLS; c++) {
                const x = c + 1;
                const y = r + 1;
                this.boardData[r][c] = {
                    x: x,
                    y: y,
                    index: GameConfig.xyToIndex(x, y),
                    isPath: false,
                    pathColor: '',
                    isHome: false,
                    homeColor: '',
                    isStart: false,
                    isFinish: false,
                    classes: []
                };

                // 標記家區
                for (const color of GameConfig.COLORS) {
                    const area = GameConfig.PATHS.homeAreas[color];
                    if (x >= area.x1 && x <= area.x2 && y >= area.y1 && y <= area.y2) {
                        this.boardData[r][c].isHome = true;
                        this.boardData[r][c].homeColor = color;
                        this.boardData[r][c].classes.push(`cell-home-${color}`);
                        break;
                    }
                }

                // 標記起飛點
                for (const color of GameConfig.COLORS) {                    const [sx, sy] = GameConfig.PATHS.startCellsXY[color];
                    if (x === sx && y === sy) {
                        this.boardData[r][c].isStart = true;
                        this.boardData[r][c].classes.push(`start-${color}`);
                        break;
                    }
                }
            }
        }
    }

    // 初始化玩家路徑
    initPaths() {
        const basePath = [];
        const baseIndexByCell = new Map();
        GameConfig.PATHS.basePathWithColor.forEach(([x, y, color]) => {
            const idx = GameConfig.xyToIndex(x, y);
            baseIndexByCell.set(idx, basePath.length);
            basePath.push(idx);
            this.boardData[y-1][x-1].isPath = true;
            this.boardData[y-1][x-1].pathColor = color;
            this.boardData[y-1][x-1].classes.push('cell-path', `cell-path-${color}`);
        });

        const PATH_LENGTH = basePath.length;

        const playerStartIndex = {
            blue: baseIndexByCell.get(GameConfig.xyToIndex(...GameConfig.PATHS.startStepXY.blue)),
            red: baseIndexByCell.get(GameConfig.xyToIndex(...GameConfig.PATHS.startStepXY.red)),
            green: baseIndexByCell.get(GameConfig.xyToIndex(...GameConfig.PATHS.startStepXY.green)),
            yellow: baseIndexByCell.get(GameConfig.xyToIndex(...GameConfig.PATHS.startStepXY.yellow)),
        };

        const homePaths = {
            red: GameConfig.lineCoords(8,2,8,7).map(([x,y]) => GameConfig.xyToIndex(x,y)),
            yellow:GameConfig.lineCoords(14,8,9,8).map(([x,y]) => GameConfig.xyToIndex(x,y)),
            green: GameConfig.lineCoords(8,14,8,9).map(([x,y]) => GameConfig.xyToIndex(x,y)),
            blue: GameConfig.lineCoords(2,8,7,8).map(([x,y]) => GameConfig.xyToIndex(x,y)),
        };

        // 標記家區路徑
        homePaths.blue.forEach(i => this.boardData[ (i / GameConfig.COLS) | 0 ][ i % GameConfig.COLS ].classes.push("cell-homepath-blue"));
        homePaths.green.forEach(i => this.boardData[ (i / GameConfig.COLS) | 0 ][ i % GameConfig.COLS ].classes.push("cell-homepath-green"));
        homePaths.red.forEach(i => this.boardData[ (i / GameConfig.COLS) | 0 ][ i % GameConfig.COLS ].classes.push("cell-homepath-red"));
        homePaths.yellow.forEach(i => this.boardData[ (i / GameConfig.COLS) | 0 ][ i % GameConfig.COLS ].classes.push("cell-homepath-yellow"));

        // 生成玩家完整路徑
        for (const color of GameConfig.COLORS) {
            const startIndex = playerStartIndex[color];
            const path = [];            let idx = startIndex;
            while (true) {
                path.push(basePath[idx]);
                if (idx === playerStartIndex[color] && path.length > 1) break; // 避免無限循環，實際上這裡需要更精確的終點判斷
                idx = (idx + 1) % basePath.length;
            }
            this.paths[color] = path.concat(homePaths[color].slice(1)); // 合併基礎路徑和家區路徑
        }
    }

    // 初始化棋盤 DOM
    initDOM() {
        if (!this.element) return;
        this.element.innerHTML = '';
        this.element.style.display = 'grid';
        this.element.style.gridTemplateColumns = `repeat(${GameConfig.COLS}, 26px)`;
        this.element.style.gridTemplateRows = `repeat(${GameConfig.ROWS}, 26px)`;
        this.element.style.gap = '2px';
        this.element.style.background = '#fff';
        this.element.style.borderRadius = '8px';
        this.element.style.padding = '8px';
        this.element.style.margin = '0 auto';

        for (let r = 0; r < GameConfig.ROWS; r++) {
            for (let c = 0; c < GameConfig.COLS; c++) {
                const data = this.boardData[r][c];
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.index = data.index; // 可選，用於 debug
                data.classes.forEach(cls => cell.classList.add(cls));
                this.element.appendChild(cell);
                this.cells[data.index] = cell; // 將 DOM 元素存入索引數組
            }
        }
    }

    // 渲染棋子
    renderPieces(players) {
        if (!this.element) return;
        // 清除所有舊棋子
        this.cells.forEach(cell => {
            const oldContainer = cell.querySelector('.pieces-container');
            if (oldContainer) cell.removeChild(oldContainer);
        });

        // 按格子收集棋子
        const cellPiecesMap = new Map();
        players.forEach(player => {
            player.pieces.forEach(piece => {
                let cellIndex;                if (piece.status === 'home') {
                    const [x, y] = GameConfig.PATHS.homePositions[player.color][piece.homeIndex];
                    cellIndex = GameConfig.xyToIndex(x, y);
                } else if (piece.status === 'track' && piece.progress === 0) {
                    cellIndex = GameConfig.xyToIndex(...GameConfig.PATHS.startCellsXY[player.color]);
                } else if (piece.status === 'track' && piece.progress > 0 && piece.progress - 1 < this.paths[player.color].length) {
                    cellIndex = this.paths[player.color][piece.progress - 1];
                } else if (piece.status === 'finished') {
                    // 可以選擇將 finished 的棋子放在特定位置或隱藏
                    return; // 暫時不渲染已完成的棋子
                } else {
                    // 其他狀態，例如錯誤狀態
                    return;
                }

                if (!cellPiecesMap.has(cellIndex)) cellPiecesMap.set(cellIndex, []);
                cellPiecesMap.get(cellIndex).push({ player, piece });
            });
        });

        // 渲染每個格子的棋子
        cellPiecesMap.forEach((list, cellIndex) => {
            const cell = this.cells[cellIndex];
            if (!cell) return;
            const container = document.createElement('div');
            container.className = 'pieces-container';
            container.style.position = 'absolute';
            container.style.inset = '2px';
            container.style.display = 'grid';
            container.style.gridTemplateColumns = '1fr 1fr';
            container.style.gridTemplateRows = '1fr 1fr';

            list.forEach(({ player, piece }) => {
                const pieceEl = document.createElement('div');
                pieceEl.className = `piece ${player.colorClass}`;
                pieceEl.style.width = '14px';
                pieceEl.style.height = '14px';
                pieceEl.style.borderRadius = '50%';
                pieceEl.style.margin = 'auto';
                pieceEl.style.boxShadow = '0 0 2px rgba(0,0,0,0.4)';
                pieceEl.style.backgroundColor = player.color === 'blue' ? '#1890ff' : player.color === 'red' ? '#ff4d4f' : player.color === 'green' ? '#52c41a' : '#faad14';

                container.appendChild(pieceEl);
            });

            cell.appendChild(container);
       export default Board;
