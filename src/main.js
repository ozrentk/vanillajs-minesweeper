import { MinesweeperGame } from './game.js';
import { GameUI } from './ui.js';
import { GAME_STATES } from './config.js';

/**
 * Main application entry point
 */
class MinesweeperApp {
    constructor() {
        this.game = null;
        this.ui = null;
        this.initialize();
    }

    /**
     * Initialize the application
     */
    initialize() {
        // Get DOM elements
        const boardElement = document.getElementById('board');
        const mineCountElement = document.getElementById('mine-count');
        const timerElement = document.getElementById('timer');
        const newGameButton = document.getElementById('new-game');

        // Start a new game
        this.startNewGame(boardElement, mineCountElement, timerElement);

        // Set up event listeners
        this.setupEventListeners(boardElement, newGameButton);
    }

    /**
     * Start a new game
     */
    startNewGame(boardElement, mineCountElement, timerElement) {
        // Clean up previous game
        if (this.ui) {
            this.ui.destroy();
        }

        // Create new game and UI
        this.game = new MinesweeperGame('EASY');
        this.ui = new GameUI(this.game, boardElement, mineCountElement, timerElement);
        
        // Render the board
        this.ui.renderBoard();
        this.ui.resetTimer();
    }

    /**
     * Set up event listeners
     */
    setupEventListeners(boardElement, newGameButton) {
        // Handle cell clicks
        boardElement.addEventListener('click', (e) => {
            if (e.target.classList.contains('cell')) {
                this.handleCellClick(e.target);
            }
        });

        // Handle right-click for flagging
        boardElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (e.target.classList.contains('cell')) {
                this.handleCellRightClick(e.target);
            }
        });

        // Handle new game button
        newGameButton.addEventListener('click', () => {
            const boardElement = document.getElementById('board');
            const mineCountElement = document.getElementById('mine-count');
            const timerElement = document.getElementById('timer');
            this.startNewGame(boardElement, mineCountElement, timerElement);
        });
    }

    /**
     * Handle left click on a cell (reveal)
     */
    handleCellClick(cellElement) {
        if (this.game.gameState === GAME_STATES.WON || 
            this.game.gameState === GAME_STATES.LOST) {
            return;
        }

        const row = parseInt(cellElement.dataset.row);
        const col = parseInt(cellElement.dataset.col);

        const wasReady = this.game.gameState === GAME_STATES.READY;
        this.game.revealCell(row, col);
        
        if (wasReady && this.game.gameState === GAME_STATES.PLAYING) {
            this.ui.startTimer();
        }

        this.ui.updateBoard();

        if (this.game.gameState === GAME_STATES.WON) {
            this.ui.stopTimer();
            this.ui.showGameOver(true);
        } else if (this.game.gameState === GAME_STATES.LOST) {
            this.ui.stopTimer();
            this.ui.showGameOver(false);
        }
    }

    /**
     * Handle right click on a cell (toggle flag)
     */
    handleCellRightClick(cellElement) {
        if (this.game.gameState === GAME_STATES.WON || 
            this.game.gameState === GAME_STATES.LOST) {
            return;
        }

        const row = parseInt(cellElement.dataset.row);
        const col = parseInt(cellElement.dataset.col);

        this.game.toggleFlag(row, col);
        this.ui.updateCell(row, col);
        this.ui.updateMineCount();
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new MinesweeperApp();
});
