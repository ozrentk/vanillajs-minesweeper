import { DIFFICULTY_LEVELS, CELL_STATES, GAME_STATES } from './config.js';

/**
 * Represents the Minesweeper game logic
 */
export class MinesweeperGame {
    constructor(difficulty = 'EASY') {
        const config = DIFFICULTY_LEVELS[difficulty];
        this.rows = config.rows;
        this.cols = config.cols;
        this.mineCount = config.mines;
        this.board = [];
        this.gameState = GAME_STATES.READY;
        this.flagCount = 0;
        this.revealedCount = 0;
        this.startTime = null;
        
        this.initializeBoard();
    }

    /**
     * Initialize the game board with empty cells
     */
    initializeBoard() {
        this.board = [];
        for (let row = 0; row < this.rows; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.cols; col++) {
                this.board[row][col] = {
                    row,
                    col,
                    isMine: false,
                    state: CELL_STATES.HIDDEN,
                    neighborMines: 0
                };
            }
        }
    }

    /**
     * Place mines randomly on the board, avoiding the first clicked cell
     */
    placeMines(avoidRow, avoidCol) {
        let minesPlaced = 0;
        while (minesPlaced < this.mineCount) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);
            
            // Don't place mine on first clicked cell or if already has mine
            if ((row === avoidRow && col === avoidCol) || this.board[row][col].isMine) {
                continue;
            }
            
            this.board[row][col].isMine = true;
            minesPlaced++;
        }
        
        this.calculateNeighborMines();
    }

    /**
     * Calculate the number of neighboring mines for each cell
     */
    calculateNeighborMines() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (!this.board[row][col].isMine) {
                    this.board[row][col].neighborMines = this.countNeighborMines(row, col);
                }
            }
        }
    }

    /**
     * Count mines in neighboring cells
     */
    countNeighborMines(row, col) {
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                
                const newRow = row + dr;
                const newCol = col + dc;
                
                if (this.isValidCell(newRow, newCol) && this.board[newRow][newCol].isMine) {
                    count++;
                }
            }
        }
        return count;
    }

    /**
     * Check if cell coordinates are valid
     */
    isValidCell(row, col) {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
    }

    /**
     * Reveal a cell and handle game logic
     */
    revealCell(row, col) {
        if (!this.isValidCell(row, col)) return false;
        
        const cell = this.board[row][col];
        
        // Can't reveal flagged or already revealed cells
        if (cell.state === CELL_STATES.REVEALED || cell.state === CELL_STATES.FLAGGED) {
            return false;
        }

        // First move - place mines
        if (this.gameState === GAME_STATES.READY) {
            this.placeMines(row, col);
            this.gameState = GAME_STATES.PLAYING;
            this.startTime = Date.now();
        }

        cell.state = CELL_STATES.REVEALED;
        this.revealedCount++;

        // Hit a mine - game over
        if (cell.isMine) {
            this.gameState = GAME_STATES.LOST;
            this.revealAllMines();
            return true;
        }

        // If cell has no neighboring mines, reveal neighbors recursively
        if (cell.neighborMines === 0) {
            this.revealNeighbors(row, col);
        }

        // Check for win condition
        if (this.revealedCount === (this.rows * this.cols - this.mineCount)) {
            this.gameState = GAME_STATES.WON;
        }

        return true;
    }

    /**
     * Reveal neighboring cells recursively (for cells with 0 neighboring mines)
     */
    revealNeighbors(row, col) {
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                
                const newRow = row + dr;
                const newCol = col + dc;
                
                if (this.isValidCell(newRow, newCol)) {
                    const neighbor = this.board[newRow][newCol];
                    if (neighbor.state === CELL_STATES.HIDDEN) {
                        this.revealCell(newRow, newCol);
                    }
                }
            }
        }
    }

    /**
     * Toggle flag on a cell
     */
    toggleFlag(row, col) {
        if (!this.isValidCell(row, col)) return false;
        
        const cell = this.board[row][col];
        
        // Can't flag revealed cells
        if (cell.state === CELL_STATES.REVEALED) {
            return false;
        }

        if (cell.state === CELL_STATES.FLAGGED) {
            cell.state = CELL_STATES.HIDDEN;
            this.flagCount--;
        } else {
            cell.state = CELL_STATES.FLAGGED;
            this.flagCount++;
        }

        return true;
    }

    /**
     * Reveal all mines (when game is lost)
     */
    revealAllMines() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.board[row][col].isMine) {
                    this.board[row][col].state = CELL_STATES.REVEALED;
                }
            }
        }
    }

    /**
     * Get cell at position
     */
    getCell(row, col) {
        return this.isValidCell(row, col) ? this.board[row][col] : null;
    }

    /**
     * Get elapsed time in seconds
     */
    getElapsedTime() {
        if (!this.startTime) return 0;
        return Math.floor((Date.now() - this.startTime) / 1000);
    }
}
