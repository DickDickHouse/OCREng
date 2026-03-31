// ✅ OOP 飛行棋 - 整合版 (Flattened OOP Logic into Single File)
console.log("[INTEGRATED] main.js 加載中...");

// --- 1. 遊戲配置 ---
const BOARD_ROWS = 15;
const BOARD_COLS = 15;
const COLORS = ['red', 'blue', 'green', 'yellow'];
const PLAYER_NAMES = ['紅方', '藍方', '綠方', '黃方'];
const PIECES_PER_PLAYER = 4;

const PATHS = {
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
        green: { x1: 1, y1: 13, x2: 3, y2: 15 },        yellow: { x1: 13, y1: 13, x2: 15, y2: 15 },
    },
    homePositions: { // 家區內 4 個棋子位置
        red: [[13, 1], [15, 1], [13, 3], [15, 3]],
        blue: [[1,1], [3,1], [1,3], [3,3]],
        green: [[1,13], [3,13], [1,15], [3,15]],
        yellow: [[13,13], [15,13], [13,15], [15,15]],
    }
};

// 計算工具 (方法)
function xyToIndex(x, y) {
    const col = x - 1;
    const row = y - 1;
    return row * BOARD_COLS + col; // ✅ 修正：變量名 BOARD_COLS
}

function lineCoords(x1, y1, x2, y2) {
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

// --- 2. 棋子類別邏輯 (Flattened) ---
// 使用物件來模擬棋子，包含其方法
function createPiece(id, status = 'home', homeIndex = 0, progress = 0) {
    return {
        id,
        status,
        homeIndex,
        progress,
        reset() {
            this.status = 'home';
            this.homeIndex = 0;
            this.progress = 0;
        },
        isOnTrack() {
            return this.status === 'track';
        },
        isFinished() {
            return this.status === 'finished';
        },
        launch() {
            if (this.status === 'home') {                this.status = 'track';
                this.progress = 0;
                return true;
            }
            return false;
        },
        move(steps, maxProgress) {
            if (this.status !== 'track') return false; // ✅ 修正：補全 if 語句
            this.progress += steps;
            if (this.progress >= maxProgress) {
                this.status = 'finished';
                this.progress = maxProgress;
            }
            return true;
        }
    };
}

// --- 3. 玩家類別邏輯 (Flattened) ---
function createPlayer(id, name, color) {
    const pieces = Array.from({ length: PIECES_PER_PLAYER }, (_, i) => createPiece(`${color}-${i}`));
    
    return {
        id,
        name,
        color,
        colorClass: color,
        pieces,
        hasWon() {
            return this.pieces.every(piece => piece.isFinished());
        },
        canLaunchPiece(diceValue, rule = '6') {
            if (rule === '6' && diceValue !== 6) return false;
            if (rule === 'even' && diceValue % 2 !== 0) return false;
            if (rule === 'odd' && diceValue % 2 === 0) return false;
            return this.pieces.some(piece => piece.status === 'home');
        },
        canMovePiece(diceValue, maxProgress) {
            return this.pieces.some(piece => piece.isOnTrack() && (piece.progress + diceValue) <= maxProgress);
        },
        getMovablePieces(diceValue, maxProgress, launchRule = '6') {
            const movable = [];
            if (this.canLaunchPiece(diceValue, launchRule)) {
                this.pieces.forEach((piece, index) => {
                    if (piece.status === 'home') {
                        movable.push({ piece, index, type: 'launch', steps: diceValue });
                    }
                });
            }
            if (this.canMovePiece(diceValue, maxProgress)) {                this.pieces.forEach((piece, index) => {
                    if (piece.isOnTrack()) {
                        const targetProgress = piece.progress + diceValue;
                        if (targetProgress <= maxProgress) {
                            movable.push({ piece, index, type: 'move', target: targetProgress, steps: diceValue });
                        }
                    }
                });
            }
            return movable;
        }
    };
}

// --- 4. 棋盤類別邏輯 (Flattened) ---
function createBoard(boardElementId) {
    const element = document.getElementById(boardElementId);
    if (!element) {
        throw new Error(`找不到棋盤元素: ${boardElementId}`);
    }
    const cells = [];
    const boardData = [];
    const paths = {};
    let basePath = [];
    let baseIndexByCell = new Map();

    // 初始化棋盤數據
    function initBoardData() {
        for (let r = 0; r < BOARD_ROWS; r++) {
            boardData[r] = [];
            for (let c = 0; c < BOARD_COLS; c++) {
                const x = c + 1;
                const y = r + 1;
                boardData[r][c] = {
                    x, y,
                    index: xyToIndex(x, y),
                    classes: []
                };

                // 標記家區
                for (const color of COLORS) {
                    const area = PATHS.homeAreas[color];
                    if (x >= area.x1 && x <= area.x2 && y >= area.y1 && y <= area.y2) {
                        boardData[r][c].classes.push(`cell-home-${color}`);
                        break;
                    }
                }

                // 標記起飛點
                for (const color of COLORS) {                    const [sx, sy] = PATHS.startCellsXY[color];
                    if (x === sx && y === sy) {
                        boardData[r][c].classes.push(`start-${color}`);
                        break;
                    }
                }
            }
        }
    }

    // 初始化路徑
    function initPaths() {
        basePath = [];
        baseIndexByCell = new Map();
        PATHS.basePathWithColor.forEach(([x, y, color]) => {
            const idx = xyToIndex(x, y);
            baseIndexByCell.set(idx, basePath.length);
            basePath.push(idx);
            boardData[y-1][x-1].classes.push('cell-path', `cell-path-${color}`);
        });

        const playerStartIndex = {
            blue: baseIndexByCell.get(xyToIndex(...PATHS.startStepXY.blue)),
            red: baseIndexByCell.get(xyToIndex(...PATHS.startStepXY.red)),
            green: baseIndexByCell.get(xyToIndex(...PATHS.startStepXY.green)),
            yellow: baseIndexByCell.get(xyToIndex(...PATHS.startStepXY.yellow)),
        };

        const homePaths = {
            red: lineCoords(8,2,8,7).map(([x,y]) => xyToIndex(x,y)),
            yellow: lineCoords(14,8,9,8).map(([x,y]) => xyToIndex(x,y)),
            green: lineCoords(8,14,8,9).map(([x,y]) => xyToIndex(x,y)),
            blue: lineCoords(2,8,7,8).map(([x,y]) => xyToIndex(x,y)),
        };

        // 標記家區路徑
        homePaths.blue.forEach(i => {
            const r = Math.floor(i / BOARD_COLS);
            const c = i % BOARD_COLS;
            boardData[r][c].classes.push("cell-homepath-blue");
        });
        homePaths.green.forEach(i => {
            const r = Math.floor(i / BOARD_COLS);
            const c = i % BOARD_COLS;
            boardData[r][c].classes.push("cell-homepath-green");
        });
        homePaths.red.forEach(i => {
            const r = Math.floor(i / BOARD_COLS);
            const c = i % BOARD_COLS;
            boardData[r][c].classes.push("cell-homepath-red");        });
        homePaths.yellow.forEach(i => {
            const r = Math.floor(i / BOARD_COLS);
            const c = i % BOARD_COLS;
            boardData[r][c].classes.push("cell-homepath-yellow");
        });

        // 生成玩家路徑
        for (const color of COLORS) {
            const startIndex = playerStartIndex[color];
            const path = [];
            let idx = startIndex;
            while (true) {
                path.push(basePath[idx]);
                if (idx === playerStartIndex[color] && path.length > 1) break;
                idx = (idx + 1) % basePath.length;
            }
            paths[color] = path.concat(homePaths[color].slice(1));
        }
    }

    // 初始化 DOM
    function initDOM() {
        if (!element) return;
        element.innerHTML = '';
        element.style.display = 'grid';
        element.style.gridTemplateColumns = `repeat(${BOARD_COLS}, 26px)`;
        element.style.gridTemplateRows = `repeat(${BOARD_ROWS}, 26px)`;
        element.style.gap = '2px';
        element.style.background = '#fff';
        element.style.borderRadius = '8px';
        element.style.padding = '8px';
        element.style.margin = '0 auto';

        for (let r = 0; r < BOARD_ROWS; r++) {
            for (let c = 0; c < BOARD_COLS; c++) {
                const data = boardData[r][c];
                const cell = document.createElement('div');
                cell.classList.add('cell');
                data.classes.forEach(cls => cell.classList.add(cls));
                element.appendChild(cell);
                cells[data.index] = cell;
            }
        }
        console.log(`✅ [Board] initDOM() 完成`);
    }

    // 渲染棋子
    function renderPieces(players) {
        if (!element) return;        cells.forEach(cell => {
            const old = cell.querySelector('.pieces-container');
            if (old) cell.removeChild(old);
        });

        const cellPiecesMap = new Map();
        players.forEach(player => {
            player.pieces.forEach(piece => {
                let cellIndex;
                if (piece.status === 'home') {
                    const [x, y] = PATHS.homePositions[player.color][piece.homeIndex];
                    cellIndex = xyToIndex(x, y);
                } else if (piece.status === 'track' && piece.progress === 0) {
                    cellIndex = xyToIndex(...PATHS.startCellsXY[player.color]);
                } else if (piece.status === 'track' && piece.progress > 0 && piece.progress - 1 < paths[player.color].length) {
                    cellIndex = paths[player.color][piece.progress - 1];
                } else {
                    return;
                }

                if (!cellPiecesMap.has(cellIndex)) cellPiecesMap.set(cellIndex, []);
                cellPiecesMap.get(cellIndex).push({ player, piece });
            });
        });

        cellPiecesMap.forEach((list, cellIndex) => {
            const cell = cells[cellIndex];
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
                pieceEl.style.backgroundColor =
                    player.color === 'blue' ? '#1890ff' :
                    player.color === 'red' ? '#ff4d4f' :
                    player.color === 'green' ? '#52c41a' : '#faad14';

                container.appendChild(pieceEl);            });

            cell.appendChild(container);
        });
        console.log(`✅ [Board] renderPieces() 完成`);
    }

    // 初始化
    initBoardData();
    initPaths();

    return {
        element,
        initDOM,
        renderPieces
    };
}

// --- 5. 骰子類別邏輯 (Flattened) ---
function createDice(imageElementId, resultElementId) {
    const imageElement = document.getElementById(imageElementId);
    const resultElement = document.getElementById(resultElementId);
    let currentValue = 0;
    let isRolling = false;

    function roll() {
        if (isRolling) return;
        isRolling = true;
        animate();

        setTimeout(() => {
            currentValue = Math.floor(Math.random() * 6) + 1;
            updateDisplay(currentValue);
            isRolling = false;
            if (window.gameInstance) {
                window.gameInstance.onDiceRolled(currentValue);
            }
        }, 1000 + Math.random() * 1000);
    }

    function animate() {
        if (imageElement) {
            imageElement.classList.add('is-rolling');
        }
        let animCount = 0;
        const animInterval = setInterval(() => {
            const tempValue = Math.floor(Math.random() * 6) + 1;
            updateDisplay(tempValue);
            animCount++;
            if (animCount > 10 && !isRolling) clearInterval(animInterval);        }, 100);
    }

    function updateDisplay(value) {
        if (imageElement) {
            imageElement.src = `images/dice-${value}.svg`;
            imageElement.alt = `Dice ${value}`;
        }
        if (resultElement) {
            resultElement.textContent = value.toString();
        }
    }

    function reset() {
        currentValue = 0;
        updateDisplay(0);
        if (imageElement) {
            imageElement.classList.remove('is-rolling');
            imageElement.src = 'images/dice-blank.svg';
            imageElement.alt = 'Dice idle';
        }
    }

    return {
        roll,
        reset
    };
}

// --- 6. UI 類別邏輯 (Flattened) ---
function createUI(game) {
    const currentPlayerNameEl = document.getElementById('current-player-name');
    const statusEl = document.getElementById('status');
    const rollButton = document.getElementById('roll-button');
    const launchRuleSelect = document.getElementById('launch-rule');
    const confirmRuleButton = document.getElementById('confirm-rule');
    const ruleStatusEl = document.getElementById('rule-status');

    function bindEvents() {
        if (rollButton) {
            rollButton.addEventListener('click', () => game.handleRollButtonClick());
        }
        if (confirmRuleButton && launchRuleSelect) {
            confirmRuleButton.addEventListener('click', () => {
                game.setLaunchRule(launchRuleSelect.value);
            });
        }
    }

    function updateCurrentPlayerDisplay() {        if (currentPlayerNameEl) {
            const currentPlayer = game.getCurrentPlayer();
            currentPlayerNameEl.textContent = currentPlayer.name;
            currentPlayerNameEl.classList.remove('player-red', 'player-blue', 'player-green', 'player-yellow');
            currentPlayerNameEl.classList.add(`player-${currentPlayer.color}`);
        }
    }

    function setStatus(message, isAlert = false) {
        if (statusEl) {
            statusEl.textContent = message;
            statusEl.classList.toggle('status-alert', isAlert);
        }
    }

    function setRollButtonEnabled(enabled) {
        if (rollButton) {
            rollButton.disabled = !enabled;
        }
    }

    function updateLaunchRuleDisplay(rule) {
        if (ruleStatusEl) {
            const labels = { '6': '6 點起飛', 'even': '雙數起飛', 'odd': '單數起飛' };
            ruleStatusEl.textContent = `起飛規則：${labels[rule] || '未知'}`;
        }
    }

    function showGameOver(winner) {
        setStatus(`🎉 遊戲結束！${winner.name} 獲勝！`, true);
        setRollButtonEnabled(false);
    }

    bindEvents(); // 初始化時就綁定事件

    return {
        updateCurrentPlayerDisplay,
        setStatus,
        setRollButtonEnabled,
        updateLaunchRuleDisplay,
        showGameOver
    };
}

// --- 7. 遊戲主控制器邏輯 (Flattened) ---
function createGame() {
    const players = COLORS.map((color, index) => createPlayer(index, PLAYER_NAMES[index], color));
    let currentPlayerIndex = 0;
    let gameEnded = false;
    let isAnimating = false;    let launchRule = '6';

    const board = createBoard('board');
    const dice = createDice('dice-image', 'dice-result');
    const ui = createUI(this); // 注意：這裡的 'this' 指向 createGame 返回的物件

    // 注意：需要在物件完全建立後，才能將 ui 引用傳入
    function initGameAfterCreation() {
        board.initDOM();
        board.renderPieces(players);
        ui.updateCurrentPlayerDisplay();
        dice.reset();
        ui.updateLaunchRuleDisplay(launchRule);
        ui.setRollButtonEnabled(true);

        window.gameInstance = this; // 設置全局引用
        console.log("✅ [Game] 初始化完成！");
    }

    function handleRollButtonClick() {
        if (gameEnded || isAnimating) return;
        isAnimating = true;
        ui.setRollButtonEnabled(false);
        dice.roll();
    }

    function onDiceRolled(diceValue) {
        console.log(`🎲 骰子結果: ${diceValue}`);
        const player = getCurrentPlayer();
        const movablePieces = player.getMovablePieces(diceValue, board.paths[player.color].length, launchRule);

        if (movablePieces.length === 0) {
            ui.setStatus(`${player.name}：無棋可走`);
            setTimeout(() => endTurn(), 1500);
        } else if (movablePieces.length === 1) {
            ui.setStatus(`${player.name}：只有一個選擇`);
            setTimeout(() => {
                performMove(movablePieces[0]);
            }, 500);
        } else {
            ui.setStatus(`${player.name}：請選擇要移動的棋子`);
            setTimeout(() => {
                performMove(movablePieces[0]); // 簡化：自動選擇第一個
            }, 500);
        }
    }

    function performMove(moveInfo) {
        const { piece, type, target, steps } = moveInfo;
        const player = players[currentPlayerIndex];        if (type === 'launch') {
            piece.launch();
            ui.setStatus(`${player.name} 的棋子起飛了！`);
        } else if (type === 'move' && target !== undefined) {
            piece.move(steps, board.paths[player.color].length);
            ui.setStatus(`${player.name} 的棋子向前移動了 ${steps} 步`);
        }
        board.renderPieces(players);

        if (piece.isFinished() && player.hasWon()) {
            gameEnded = true; // ✅ 修正：賦值運算符
            ui.showGameOver(player);
            isAnimating = false;
            return;
        }

        if (steps === 6) {
            ui.setStatus(`${player.name} 擲出 6 點，獲得額外回合！`);
            isAnimating = false;
            ui.setRollButtonEnabled(true);
        } else {
            setTimeout(() => endTurn(), 500);
        }
    }

    function endTurn() {
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        ui.updateCurrentPlayerDisplay();
        ui.setRollButtonEnabled(true);
        isAnimating = false;
    }

    function getCurrentPlayer() {
        return players[currentPlayerIndex];
    }

    function setLaunchRule(rule) {
        launchRule = rule;
        ui.updateLaunchRuleDisplay(rule);
    }

    function reset() {
        players.forEach(player => {
            player.pieces.forEach(piece => piece.reset());
        });
        currentPlayerIndex = 0;
        gameEnded = false;
        isAnimating = false;
        board.renderPieces(players);
        ui.updateCurrentPlayerDisplay();        dice.reset();
        ui.setRollButtonEnabled(true);
        ui.setStatus('');
    }

    // 返回物件，包含所有方法
    const gameObj = {
        players,
        handleRollButtonClick,
        onDiceRolled,
        performMove,
        endTurn,
        getCurrentPlayer,
        setLaunchRule,
        reset
    };

    // 在物件建立完成後初始化
    initGameAfterCreation.call(gameObj);

    return gameObj;
}

// --- 8. 啟動遊戲 ---
window.addEventListener('DOMContentLoaded', () => {
    console.log("[INTEGRATED] DOMContentLoaded 觸發");
    const game = createGame(); // 創建遊戲實例
    console.log("[INTEGRATED] 遊戲初始化完成！");
});
