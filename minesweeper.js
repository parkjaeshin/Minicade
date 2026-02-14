const ROWS = 10;
const COLS = 10;
const MINES = 10;

let board = [];
let revealedCount = 0;
let gameOver = false;
let timerInterval;
let startTime;

const boardElement = document.getElementById('game-board');
const mineCountElement = document.getElementById('mine-count');
const timerElement = document.getElementById('timer');
const messageElement = document.getElementById('message');
const resetBtn = document.getElementById('reset-btn');

function initGame() {
    board = [];
    revealedCount = 0;
    gameOver = false;
    clearInterval(timerInterval);
    timerElement.textContent = '0';
    messageElement.textContent = '';
    mineCountElement.textContent = MINES;

    boardElement.style.gridTemplateColumns = `repeat(${COLS}, var(--cell-size))`;
    boardElement.innerHTML = '';

    // Create board array
    for (let r = 0; r < ROWS; r++) {
        board[r] = [];
        for (let c = 0; c < COLS; c++) {
            board[r][c] = {
                r, c,
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                neighborMines: 0
            };
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.r = r;
            cell.dataset.c = c;
            cell.addEventListener('click', () => handleClick(r, c));
            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                handleRightClick(r, c);
            });
            boardElement.appendChild(cell);
        }
    }

    // Place mines
    let minesPlaced = 0;
    while (minesPlaced < MINES) {
        let r = Math.floor(Math.random() * ROWS);
        let c = Math.floor(Math.random() * COLS);
        if (!board[r][c].isMine) {
            board[r][c].isMine = true;
            minesPlaced++;
        }
    }

    // Calculate neighbor mines
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (board[r][c].isMine) continue;
            let count = 0;
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    let nr = r + dr;
                    let nc = c + dc;
                    if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc].isMine) {
                        count++;
                    }
                }
            }
            board[r][c].neighborMines = count;
        }
    }
}

function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
        timerElement.textContent = Math.floor((Date.now() - startTime) / 1000);
    }, 1000);
}

function handleClick(r, c) {
    if (gameOver || board[r][c].isRevealed || board[r][c].isFlagged) return;

    if (revealedCount === 0) startTimer();

    revealCell(r, c);

    if (board[r][c].isMine) {
        endGame(false);
    } else if (revealedCount === ROWS * COLS - MINES) {
        endGame(true);
    }
}

function handleRightClick(r, c) {
    if (gameOver || board[r][c].isRevealed) return;

    board[r][c].isFlagged = !board[r][c].isFlagged;
    const cell = boardElement.children[r * COLS + c];
    cell.classList.toggle('flagged');

    let flaggedCount = 0;
    for (let row of board) {
        for (let col of row) {
            if (col.isFlagged) flaggedCount++;
        }
    }
    mineCountElement.textContent = MINES - flaggedCount;
}

function revealCell(r, c) {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS || board[r][c].isRevealed || board[r][c].isFlagged) return;

    board[r][c].isRevealed = true;
    revealedCount++;
    const cell = boardElement.children[r * COLS + c];
    cell.classList.add('revealed');

    if (board[r][c].isMine) {
        cell.classList.add('mine');
        cell.textContent = '💣';
    } else {
        if (board[r][c].neighborMines > 0) {
            cell.textContent = board[r][c].neighborMines;
            cell.setAttribute('data-mines', board[r][c].neighborMines);
        } else {
            // Flood fill
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    revealCell(r + dr, c + dc);
                }
            }
        }
    }
}

function endGame(win) {
    gameOver = true;
    clearInterval(timerInterval);
    if (win) {
        messageElement.textContent = '승리했습니다! 🎉';
        messageElement.style.color = 'var(--accent-color)';
    } else {
        messageElement.textContent = '게임 오버! 💥';
        messageElement.style.color = 'var(--mine-color)';
        // Reveal all mines
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (board[r][c].isMine) {
                    const cell = boardElement.children[r * COLS + c];
                    cell.classList.add('revealed', 'mine');
                    cell.textContent = '💣';
                }
            }
        }
    }
}

resetBtn.addEventListener('click', initGame);

initGame();
