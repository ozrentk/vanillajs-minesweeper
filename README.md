# vanillajs-minesweeper

A classic Minesweeper game built with vanilla JavaScript and ES6 modules.

## Features

- Classic Minesweeper gameplay
- Clean, modern UI
- ES6 module architecture
- Built with Vite for fast development and optimized production builds

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/ozrentk/vanillajs-minesweeper.git
cd vanillajs-minesweeper
```

2. Install dependencies:
```bash
npm install
```

## Development

Start the development server:
```bash
npm run dev
```

The game will be available at `http://localhost:5173`

## Build

Build for production:
```bash
npm run build
```

The optimized files will be in the `dist/` directory.

## Preview Production Build

Preview the production build locally:
```bash
npm run preview
```

## How to Play

- Left-click to reveal a cell
- Right-click to flag a cell as a mine
- Clear all non-mine cells to win
- The numbers indicate how many mines are in adjacent cells

## Project Structure

```
vanillajs-minesweeper/
├── src/
│   ├── config.js      # Game configuration and constants
│   ├── game.js        # Core game logic
│   ├── ui.js          # UI rendering
│   ├── main.js        # Application entry point
│   └── styles.css     # Game styling
├── index.html         # HTML entry point
├── package.json       # Project dependencies
└── README.md          # This file
```

## Technologies

- Vanilla JavaScript (ES6 modules)
- Vite (build tool)
- CSS3

## License

ISC

