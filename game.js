// Minesweeper Game - Vanilla JavaScript Implementation

// Matrix utility functions (functional approach)
function createMatrix(rows, cols, defaultValue = 0) {
    return {
        rows: rows,
        cols: cols,
        data: Array(rows).fill(null).map(() => 
            Array(cols).fill(defaultValue)
        )
    };
}

function matrixGet(matrix, row, col) {
    if (matrixIsValid(matrix, row, col)) {
        return matrix.data[row][col];
    }
    return undefined;
}

function matrixSet(matrix, row, col, value) {
    if (matrixIsValid(matrix, row, col)) {
        matrix.data[row][col] = value;
        return true;
    }
    return false;
}

function matrixIsValid(matrix, row, col) {
    return row >= 0 && row < matrix.rows && col >= 0 && col < matrix.cols;
}

function matrixForEach(matrix, callback) {
    for (let row = 0; row < matrix.rows; row++) {
        for (let col = 0; col < matrix.cols; col++) {
            callback(matrix.data[row][col], row, col);
        }
    }
}

// Minesweeper Game - Functional component approach
function createMinesweeperGame(rows = 9, cols = 9, mineCount = 10, domConfig = {}) {
    // Game state
    const state = {
        rows: rows,
        cols: cols,
        mineCount: mineCount,
        firstClick: true,
        gameOver: false,
        gameWon: false,
        timerStarted: false,
        timerValue: 0,
        timerInterval: null,
        flagCount: 0,
        
        // Initialize matrices
        mineMatrix: createMatrix(rows, cols, false),
        revealedMatrix: createMatrix(rows, cols, false),
        flaggedMatrix: createMatrix(rows, cols, false),
        numberMatrix: createMatrix(rows, cols, 0),
        
        // DOM elements
        boardElement: null,
        minesRemainingElement: null,
        timerElement: null,
        statusElement: null,
        newGameButton: null
    };

    // Initialize DOM with configurable element IDs
    function initializeDOM(config) {
        const {
            boardId = 'game-board',
            minesRemainingId = 'mines-remaining',
            timerDisplayId = 'timer-display',
            statusMessageId = 'status-message',
            newGameBtnId = 'new-game-btn'
        } = config;
        
        state.boardElement = document.getElementById(boardId);
        state.minesRemainingElement = document.getElementById(minesRemainingId);
        state.timerElement = document.getElementById(timerDisplayId);
        state.statusElement = document.getElementById(statusMessageId);
        state.newGameButton = document.getElementById(newGameBtnId);
        
        state.newGameButton.addEventListener('click', () => resetGame());
        
        renderBoard();
        updateMinesRemaining();
    }

    function renderBoard() {
        state.boardElement.innerHTML = '';
        
        for (let row = 0; row < state.rows; row++) {
            for (let col = 0; col < state.cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                cell.addEventListener('click', (e) => handleCellClick(row, col, e));
                cell.addEventListener('contextmenu', (e) => handleCellRightClick(row, col, e));
                
                state.boardElement.appendChild(cell);
            }
        }
    }

    function placeMines(excludeRow, excludeCol) {
        let minesPlaced = 0;
        const excludeCells = new Set();
        
        // Exclude the first clicked cell and its neighbors
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const r = excludeRow + dr;
                const c = excludeCol + dc;
                if (matrixIsValid(state.mineMatrix, r, c)) {
                    excludeCells.add(`${r},${c}`);
                }
            }
        }
        
        while (minesPlaced < state.mineCount) {
            const row = Math.floor(Math.random() * state.rows);
            const col = Math.floor(Math.random() * state.cols);
            
            if (!matrixGet(state.mineMatrix, row, col) && !excludeCells.has(`${row},${col}`)) {
                matrixSet(state.mineMatrix, row, col, true);
                minesPlaced++;
            }
        }
        
        calculateNumbers();
    }

    function calculateNumbers() {
        for (let row = 0; row < state.rows; row++) {
            for (let col = 0; col < state.cols; col++) {
                if (!matrixGet(state.mineMatrix, row, col)) {
                    let count = 0;
                    for (let dr = -1; dr <= 1; dr++) {
                        for (let dc = -1; dc <= 1; dc++) {
                            if (dr === 0 && dc === 0) continue;
                            const newRow = row + dr;
                            const newCol = col + dc;
                            if (matrixIsValid(state.mineMatrix, newRow, newCol) && 
                                matrixGet(state.mineMatrix, newRow, newCol)) {
                                count++;
                            }
                        }
                    }
                    matrixSet(state.numberMatrix, row, col, count);
                }
            }
        }
    }

    function handleCellClick(row, col, event) {
        event.preventDefault();
        
        if (state.gameOver || state.gameWon) return;
        if (matrixGet(state.revealedMatrix, row, col)) return;
        if (matrixGet(state.flaggedMatrix, row, col)) return;
        
        // First click - place mines
        if (state.firstClick) {
            placeMines(row, col);
            state.firstClick = false;
            startTimer();
        }
        
        revealCell(row, col);
    }

    function handleCellRightClick(row, col, event) {
        event.preventDefault();
        
        if (state.gameOver || state.gameWon) return;
        if (matrixGet(state.revealedMatrix, row, col)) return;
        
        const isFlagged = matrixGet(state.flaggedMatrix, row, col);
        matrixSet(state.flaggedMatrix, row, col, !isFlagged);
        
        if (isFlagged) {
            state.flagCount--;
        } else {
            state.flagCount++;
        }
        
        updateMinesRemaining();
        updateCell(row, col);
    }

    function revealCell(row, col) {
        if (!matrixIsValid(state.mineMatrix, row, col)) return;
        if (matrixGet(state.revealedMatrix, row, col)) return;
        if (matrixGet(state.flaggedMatrix, row, col)) return;
        
        matrixSet(state.revealedMatrix, row, col, true);
        
        // Hit a mine
        if (matrixGet(state.mineMatrix, row, col)) {
            state.gameOver = true;
            endGame(false);
            return;
        }
        
        updateCell(row, col);
        
        // If empty cell (no adjacent mines), reveal neighbors
        if (matrixGet(state.numberMatrix, row, col) === 0) {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    revealCell(row + dr, col + dc);
                }
            }
        }
        
        checkWinCondition();
    }

    function updateCell(row, col) {
        const cell = state.boardElement.querySelector(
            `[data-row="${row}"][data-col="${col}"]`
        );
        
        if (!cell) return;
        
        if (matrixGet(state.flaggedMatrix, row, col)) {
            cell.className = 'cell flagged';
            cell.textContent = '🚩';
        } else if (matrixGet(state.revealedMatrix, row, col)) {
            cell.className = 'cell revealed';
            
            if (matrixGet(state.mineMatrix, row, col)) {
                cell.classList.add('mine');
                cell.textContent = '💣';
            } else {
                const number = matrixGet(state.numberMatrix, row, col);
                if (number > 0) {
                    cell.textContent = number;
                    cell.classList.add(`number-${number}`);
                } else {
                    cell.textContent = '';
                }
            }
        } else {
            cell.className = 'cell';
            cell.textContent = '';
        }
    }

    function updateMinesRemaining() {
        const remaining = state.mineCount - state.flagCount;
        state.minesRemainingElement.textContent = remaining.toString().padStart(2, '0');
    }

    function startTimer() {
        if (state.timerStarted) return;
        state.timerStarted = true;
        
        state.timerInterval = setInterval(() => {
            state.timerValue++;
            state.timerElement.textContent = state.timerValue.toString().padStart(3, '0');
        }, 1000);
    }

    function stopTimer() {
        if (state.timerInterval) {
            clearInterval(state.timerInterval);
            state.timerInterval = null;
        }
    }

    function checkWinCondition() {
        let revealedCount = 0;
        let totalSafeCells = state.rows * state.cols - state.mineCount;
        
        matrixForEach(state.revealedMatrix, (revealed) => {
            if (revealed) revealedCount++;
        });
        
        if (revealedCount === totalSafeCells) {
            state.gameWon = true;
            endGame(true);
        }
    }

    function endGame(won) {
        stopTimer();
        
        if (won) {
            state.statusElement.textContent = '🎉 You Won! Congratulations!';
            state.statusElement.className = 'win';
        } else {
            state.statusElement.textContent = '💥 Game Over! You hit a mine.';
            state.statusElement.className = 'lose';
            revealAllMines();
        }
    }

    function revealAllMines() {
        matrixForEach(state.mineMatrix, (isMine, row, col) => {
            if (isMine) {
                matrixSet(state.revealedMatrix, row, col, true);
                updateCell(row, col);
            }
        });
    }

    function resetGame() {
        stopTimer();
        
        state.firstClick = true;
        state.gameOver = false;
        state.gameWon = false;
        state.timerStarted = false;
        state.timerValue = 0;
        state.flagCount = 0;
        
        state.mineMatrix = createMatrix(state.rows, state.cols, false);
        state.revealedMatrix = createMatrix(state.rows, state.cols, false);
        state.flaggedMatrix = createMatrix(state.rows, state.cols, false);
        state.numberMatrix = createMatrix(state.rows, state.cols, 0);
        
        state.timerElement.textContent = '000';
        state.statusElement.textContent = '';
        state.statusElement.className = '';
        
        updateMinesRemaining();
        renderBoard();
    }

    // Initialize the game
    initializeDOM(domConfig);

    // Return public API
    return {
        resetGame,
        initializeDOM
    };
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = createMinesweeperGame(9, 9, 10, {
        boardId: 'game-board',
        minesRemainingId: 'mines-remaining',
        timerDisplayId: 'timer-display',
        statusMessageId: 'status-message',
        newGameBtnId: 'new-game-btn'
    });
});
