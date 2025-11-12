// Game configuration constants
export const DIFFICULTY_LEVELS = {
    EASY: { rows: 8, cols: 8, mines: 10 },
    MEDIUM: { rows: 16, cols: 16, mines: 40 },
    HARD: { rows: 16, cols: 30, mines: 99 }
};

export const CELL_STATES = {
    HIDDEN: 'hidden',
    REVEALED: 'revealed',
    FLAGGED: 'flagged'
};

export const GAME_STATES = {
    READY: 'ready',
    PLAYING: 'playing',
    WON: 'won',
    LOST: 'lost'
};
