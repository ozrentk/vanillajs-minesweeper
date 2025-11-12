# Vanilla JavaScript Minesweeper

A classic Minesweeper game built with pure vanilla JavaScript - no frameworks, no libraries, just clean, custom code.

## Features

- **Custom Data Structures**: Built from scratch with a custom Matrix class for game board management
- **Pure Vanilla JS**: No frameworks or dependencies - everything is custom-built
- **Classic Gameplay**: 
  - Left-click to reveal cells
  - Right-click to flag/unflag cells
  - First click is always safe
  - Auto-reveal for empty cells
- **Game Controls**:
  - Mine counter showing remaining mines
  - Timer tracking game duration
  - New Game button to restart
- **Win/Lose Conditions**: Automatic detection with appropriate feedback

## How to Play

1. Open `index.html` in your web browser
2. Click any cell to start the game
3. Left-click to reveal cells
4. Right-click to flag potential mines
5. Reveal all non-mine cells to win!

## Game Rules

- The board is a 9x9 grid with 10 hidden mines
- Numbers indicate how many mines are adjacent to that cell
- Flag cells you think contain mines
- First click is always safe (no mine will be there)
- You win by revealing all non-mine cells
- You lose if you click on a mine

## Project Structure

```
vanillajs-minesweeper/
├── index.html      # Main HTML structure
├── styles.css      # Game styling
├── game.js         # Game logic and Matrix class
└── README.md       # This file
```

## Development Approach

This project is being developed using an agentic, incremental approach with piecemeal tasks. Each feature is implemented with minimal, focused changes.

## License

See LICENSE file for details.
