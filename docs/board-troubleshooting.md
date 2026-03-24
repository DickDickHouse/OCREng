# 棋盤不顯示排查與修正方向（飛行棋 Demo）

本文件用於快速排查「棋盤不顯示」的問題，並提供可行修正方向。若下次又遇到白畫面或棋盤消失，請優先依序檢查。

---

## 1. 靜態資源路徑是否正確
**最常見原因：CSS/JS/圖片路徑錯誤**

| 類型 | 正確（相對路徑） | 可能錯誤（絕對路徑） | 影響 |
|---|---|---|---|
| CSS | `style.css?v=109` | `/OCREng/style.css?v=108` | CSS 未載入，棋盤樣式失效 |
| JS | `main.js?v=109` | `/OCREng/main.js?v=108` | JS 未載入，棋盤 DOM 不會生成 |
| 圖片 | `images/dice-1.svg` | `/OCREng/images/dice-1.svg` | 圖片載入失敗，可能導致錯誤 |

**判斷方式**：
- 打開瀏覽器 DevTools → Network / Console，看看是否有 404。
- 如果是 GitHub Pages 或子路徑部署，通常必須使用**相對路徑**。

---

## 2. JS 有沒有正常執行
`main.js` 必須成功載入，否則 `initBoard()` 不會被呼叫。

### 檢查：
- Console 是否有錯誤（例如：`Uncaught ReferenceError`）
- `boardEl` 是否為 null（表示 HTML 沒有 `#board`）

---

## 3. HTML 結構是否完整
確認 HTML 有以下區塊：

```html
<div id="board-wrapper">
  <div id="board"></div>
</div>
```

如果 `#board` 被刪掉或改名，`initBoard()` 就無法插入格子。

---

## 4. initGame 是否有執行
必須在載入時觸發：

```js
window.addEventListener("load", initGame);
```

若 `initGame` 被移除或改名，棋盤就不會初始化。

---

## 5. 常見錯誤現象與解法

| 現象 | 可能原因 | 解法 |
|---|---|---|
| 上方 UI 有，棋盤完全空白 | `main.js` 沒載到 | 改相對路徑 + 確認檔名 |
| 棋盤有，但樣式消失 | `style.css` 沒載到 | 改相對路徑 + 清快取 |
| 骰子圖片不見或 Console 錯誤 | `images/` 路徑錯 | 改成 `images/xxx.svg` |

---

## 6. 建議固定配置（避免再次發生）

**index.html 範本（相對路徑）**：
```html
<link rel="stylesheet" href="style.css?v=109" />
<script src="main.js?v=109"></script>
<img src="images/dice-1.svg" />
```

---

## 7. 如果仍無法顯示
請提供以下資訊給協助者：
- `index.html`、`style.css`、`main.js` 最新內容
- Console 錯誤截圖或訊息
- 網頁網址（如 GitHub Pages URL）

---

✅ **結論**：
棋盤不顯示時，**第一優先就是檢查路徑**。只要 CSS/JS 沒載到，棋盤一定不會出現.