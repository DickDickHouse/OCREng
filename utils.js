// utils.js
import { BOARD_COLS } from 'config.js';

export function xyToIndex(x, y) {
    const col = x - 1;
    const row = y - 1;
    return row * BOARD_COLS + col;
}

export function randomDice() {
    return Math.floor(Math.random() * 6) + 1;
}

export function lineCoords(x1, y1, x2, y2) {
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
