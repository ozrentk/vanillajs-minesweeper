import { CELL_STATES, GAME_STATES } from './config.js';

/**
 * Handles UI rendering and updates for the Minesweeper game
 */
export class GameUI {
    constructor(game, boardElement, mineCountElement, timerElement) {
        this.game = game;
        this.boardElement = boardElement;
        this.mineCountElement = mineCountElement;
        this.timerElement = timerElement;
        this.timerInterval = null;
    }

    /**
     * Render the entire game board
     */
    renderBoard() {
        this.boardElement.innerHTML = '';
        this.boardElement.style.gridTemplateColumns = `repeat(${this.game.cols}, 30px)`;
        this.boardElement.style.gridTemplateRows = `repeat(${this.game.rows}, 30px)`;

        for (let row = 0; row < this.game.rows; row++) {
            for (let col = 0; col < this.game.cols; col++) {
                const cell = this.game.getCell(row, col);
                const cellElement = this.createCellElement(cell);
                this.boardElement.appendChild(cellElement);
            }
        }

        this.updateMineCount();
    }

    /**
     * Create a DOM element for a cell
     */
    createCellElement(cell) {
        const cellElement = document.createElement('div');
        cellElement.className = 'cell';
        cellElement.dataset.row = cell.row;
        cellElement.dataset.col = cell.col;

        this.updateCellElement(cellElement, cell);

        return cellElement;
    }

    /**
     * Update a cell element based on cell state
     */
    updateCellElement(cellElement, cell) {
        cellElement.className = 'cell';

        if (cell.state === CELL_STATES.REVEALED) {
            cellElement.classList.add('revealed');
            
            if (cell.isMine) {
                cellElement.classList.add('mine');
                cellElement.textContent = '💣';
            } else if (cell.neighborMines > 0) {
                cellElement.textContent = cell.neighborMines;
                cellElement.classList.add(`neighbor-${cell.neighborMines}`);
            }
        } else if (cell.state === CELL_STATES.FLAGGED) {
            cellElement.classList.add('flagged');
            cellElement.textContent = '🚩';
        } else {
            cellElement.classList.add('hidden');
        }
    }

    /**
     * Update a specific cell in the UI
     */
    updateCell(row, col) {
        const cell = this.game.getCell(row, col);
        const cellElement = this.boardElement.querySelector(
            `[data-row="${row}"][data-col="${col}"]`
        );
        
        if (cellElement && cell) {
            this.updateCellElement(cellElement, cell);
        }
    }

    /**
     * Update the entire board UI
     */
    updateBoard() {
        for (let row = 0; row < this.game.rows; row++) {
            for (let col = 0; col < this.game.cols; col++) {
                this.updateCell(row, col);
            }
        }
    }

    /**
     * Update mine count display
     */
    updateMineCount() {
        const remaining = this.game.mineCount - this.game.flagCount;
        this.mineCountElement.textContent = remaining;
    }

    /**
     * Start the timer
     */
    startTimer() {
        if (this.timerInterval) return;
        
        this.timerInterval = setInterval(() => {
            if (this.game.gameState === GAME_STATES.PLAYING) {
                this.timerElement.textContent = this.game.getElapsedTime();
            }
        }, 1000);
    }

    /**
     * Stop the timer
     */
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    /**
     * Reset the timer
     */
    resetTimer() {
        this.stopTimer();
        this.timerElement.textContent = '0';
    }

    /**
     * Show game over message
     */
    showGameOver(won) {
        setTimeout(() => {
            if (won) {
                alert(`Congratulations! You won in ${this.game.getElapsedTime()} seconds!`);
            } else {
                alert('Game Over! You hit a mine!');
            }
        }, 100);
    }

    /**
     * Clean up resources
     */
    destroy() {
        this.stopTimer();
    }
}
