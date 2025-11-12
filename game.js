// Minesweeper Game - Vanilla JavaScript Implementation

class Matrix {
    constructor(rows, cols, defaultValue = 0) {
        this.rows = rows;
        this.cols = cols;
        this.data = Array(rows).fill(null).map(() => 
            Array(cols).fill(defaultValue)
        );
    }

    get(row, col) {
        if (this.isValid(row, col)) {
            return this.data[row][col];
        }
        return undefined;
    }

    set(row, col, value) {
        if (this.isValid(row, col)) {
            this.data[row][col] = value;
            return true;
        }
        return false;
    }

    isValid(row, col) {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
    }

    forEach(callback) {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                callback(this.data[row][col], row, col);
            }
        }
    }
}

class MinesweeperGame {
    constructor(rows = 9, cols = 9, mineCount = 10) {
        this.rows = rows;
        this.cols = cols;
        this.mineCount = mineCount;
        this.firstClick = true;
        this.gameOver = false;
        this.gameWon = false;
        this.timerStarted = false;
        this.timerValue = 0;
        this.timerInterval = null;
        
        // Initialize matrices
        this.mineMatrix = new Matrix(rows, cols, false);
        this.revealedMatrix = new Matrix(rows, cols, false);
        this.flaggedMatrix = new Matrix(rows, cols, false);
        this.numberMatrix = new Matrix(rows, cols, 0);
        
        this.flagCount = 0;
        
        this.initializeDOM();
    }

    initializeDOM() {
        this.boardElement = document.getElementById('game-board');
        this.minesRemainingElement = document.getElementById('mines-remaining');
        this.timerElement = document.getElementById('timer-display');
        this.statusElement = document.getElementById('status-message');
        this.newGameButton = document.getElementById('new-game-btn');
        
        this.newGameButton.addEventListener('click', () => this.resetGame());
        
        this.renderBoard();
        this.updateMinesRemaining();
    }

    renderBoard() {
        this.boardElement.innerHTML = '';
        this.boardElement.style.gridTemplateColumns = `repeat(${this.cols}, 40px)`;
        this.boardElement.style.gridTemplateRows = `repeat(${this.rows}, 40px)`;
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                cell.addEventListener('click', (e) => this.handleCellClick(row, col, e));
                cell.addEventListener('contextmenu', (e) => this.handleCellRightClick(row, col, e));
                
                this.boardElement.appendChild(cell);
            }
        }
    }

    placeMines(excludeRow, excludeCol) {
        let minesPlaced = 0;
        const excludeCells = new Set();
        
        // Exclude the first clicked cell and its neighbors
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const r = excludeRow + dr;
                const c = excludeCol + dc;
                if (this.mineMatrix.isValid(r, c)) {
                    excludeCells.add(`${r},${c}`);
                }
            }
        }
        
        while (minesPlaced < this.mineCount) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);
            
            if (!this.mineMatrix.get(row, col) && !excludeCells.has(`${row},${col}`)) {
                this.mineMatrix.set(row, col, true);
                minesPlaced++;
            }
        }
        
        this.calculateNumbers();
    }

    calculateNumbers() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (!this.mineMatrix.get(row, col)) {
                    let count = 0;
                    for (let dr = -1; dr <= 1; dr++) {
                        for (let dc = -1; dc <= 1; dc++) {
                            if (dr === 0 && dc === 0) continue;
                            const newRow = row + dr;
                            const newCol = col + dc;
                            if (this.mineMatrix.isValid(newRow, newCol) && 
                                this.mineMatrix.get(newRow, newCol)) {
                                count++;
                            }
                        }
                    }
                    this.numberMatrix.set(row, col, count);
                }
            }
        }
    }

    handleCellClick(row, col, event) {
        event.preventDefault();
        
        if (this.gameOver || this.gameWon) return;
        if (this.revealedMatrix.get(row, col)) return;
        if (this.flaggedMatrix.get(row, col)) return;
        
        // First click - place mines
        if (this.firstClick) {
            this.placeMines(row, col);
            this.firstClick = false;
            this.startTimer();
        }
        
        this.revealCell(row, col);
    }

    handleCellRightClick(row, col, event) {
        event.preventDefault();
        
        if (this.gameOver || this.gameWon) return;
        if (this.revealedMatrix.get(row, col)) return;
        
        const isFlagged = this.flaggedMatrix.get(row, col);
        this.flaggedMatrix.set(row, col, !isFlagged);
        
        if (isFlagged) {
            this.flagCount--;
        } else {
            this.flagCount++;
        }
        
        this.updateMinesRemaining();
        this.updateCell(row, col);
    }

    revealCell(row, col) {
        if (!this.mineMatrix.isValid(row, col)) return;
        if (this.revealedMatrix.get(row, col)) return;
        if (this.flaggedMatrix.get(row, col)) return;
        
        this.revealedMatrix.set(row, col, true);
        
        // Hit a mine
        if (this.mineMatrix.get(row, col)) {
            this.gameOver = true;
            this.endGame(false);
            return;
        }
        
        this.updateCell(row, col);
        
        // If empty cell (no adjacent mines), reveal neighbors
        if (this.numberMatrix.get(row, col) === 0) {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    this.revealCell(row + dr, col + dc);
                }
            }
        }
        
        this.checkWinCondition();
    }

    updateCell(row, col) {
        const cell = this.boardElement.querySelector(
            `[data-row="${row}"][data-col="${col}"]`
        );
        
        if (!cell) return;
        
        if (this.flaggedMatrix.get(row, col)) {
            cell.className = 'cell flagged';
            cell.textContent = '🚩';
        } else if (this.revealedMatrix.get(row, col)) {
            cell.className = 'cell revealed';
            
            if (this.mineMatrix.get(row, col)) {
                cell.classList.add('mine');
                cell.textContent = '💣';
            } else {
                const number = this.numberMatrix.get(row, col);
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

    updateMinesRemaining() {
        const remaining = this.mineCount - this.flagCount;
        this.minesRemainingElement.textContent = remaining.toString().padStart(2, '0');
    }

    startTimer() {
        if (this.timerStarted) return;
        this.timerStarted = true;
        
        this.timerInterval = setInterval(() => {
            this.timerValue++;
            this.timerElement.textContent = this.timerValue.toString().padStart(3, '0');
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    checkWinCondition() {
        let revealedCount = 0;
        let totalSafeCells = this.rows * this.cols - this.mineCount;
        
        this.revealedMatrix.forEach((revealed) => {
            if (revealed) revealedCount++;
        });
        
        if (revealedCount === totalSafeCells) {
            this.gameWon = true;
            this.endGame(true);
        }
    }

    endGame(won) {
        this.stopTimer();
        
        if (won) {
            this.statusElement.textContent = '🎉 You Won! Congratulations!';
            this.statusElement.className = 'win';
        } else {
            this.statusElement.textContent = '💥 Game Over! You hit a mine.';
            this.statusElement.className = 'lose';
            this.revealAllMines();
        }
    }

    revealAllMines() {
        this.mineMatrix.forEach((isMine, row, col) => {
            if (isMine) {
                this.revealedMatrix.set(row, col, true);
                this.updateCell(row, col);
            }
        });
    }

    resetGame() {
        this.stopTimer();
        
        this.firstClick = true;
        this.gameOver = false;
        this.gameWon = false;
        this.timerStarted = false;
        this.timerValue = 0;
        this.flagCount = 0;
        
        this.mineMatrix = new Matrix(this.rows, this.cols, false);
        this.revealedMatrix = new Matrix(this.rows, this.cols, false);
        this.flaggedMatrix = new Matrix(this.rows, this.cols, false);
        this.numberMatrix = new Matrix(this.rows, this.cols, 0);
        
        this.timerElement.textContent = '000';
        this.statusElement.textContent = '';
        this.statusElement.className = '';
        
        this.updateMinesRemaining();
        this.renderBoard();
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new MinesweeperGame(9, 9, 10);
});
