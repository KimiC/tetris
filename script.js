const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;

let grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
let currentPiece = null;
let score = 0;
let isPaused = false;
let nextPiece = null;

const pieces = {
    I: [[1, 1, 1, 1]],
    O: [[1, 1], [1, 1]],
    T: [[0, 1, 0], [1, 1, 1]],
    S: [[0, 1, 1], [1, 1, 0]],
    Z: [[1, 1, 0], [0, 1, 1]],
    L: [[1, 0], [1, 0], [1, 1]],
    J: [[0, 1], [0, 1], [1, 1]],
};

function drawGrid() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (grid[row][col]) {
                context.fillStyle = 'cyan';
                context.fillRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                context.strokeStyle = 'black';
                context.strokeRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
}

function showNextPiece() {
    const previewCanvas = document.getElementById('nextPieceCanvas');
    const previewContext = previewCanvas.getContext('2d');
    previewContext.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

    if (!nextPiece) return;
    const { shape } = nextPiece;
    previewContext.fillStyle = 'green';
    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c]) {
                previewContext.fillRect(c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                previewContext.strokeStyle = 'black';
                previewContext.strokeRect(c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
}

function spawnPiece() {
    if (nextPiece) {
        currentPiece = nextPiece;
    } else {
        const keys = Object.keys(pieces);
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        currentPiece = { shape: pieces[randomKey], row: 0, col: Math.floor(COLS / 2) - 1 };
    }

    const keys = Object.keys(pieces);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    nextPiece = { shape: pieces[randomKey], row: 0, col: Math.floor(COLS / 2) - 1 };
    showNextPiece();
}

function drawPiece() {
    if (!currentPiece) return;
    const { shape, row, col } = currentPiece;
    context.fillStyle = 'yellow';
    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c]) {
                context.fillRect((col + c) * BLOCK_SIZE, (row + r) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                context.strokeStyle = 'black';
                context.strokeRect((col + c) * BLOCK_SIZE, (row + r) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
}

function clearLines() {
    let linesCleared = 0;
    for (let row = ROWS - 1; row >= 0; row--) {
        if (grid[row].every(cell => cell)) {
            grid.splice(row, 1);
            grid.unshift(Array(COLS).fill(0));
            linesCleared++;
        }
    }
    calculateScore(linesCleared);
}

function calculateScore(linesCleared) {
    const points = [0, 100, 300, 500, 800];
    score += points[linesCleared];
    document.getElementById('scoreDisplay').textContent = `Score: ${score}`;
}

function checkCollision() {
    const { shape, row, col } = currentPiece;
    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c]) {
                const newRow = row + r;
                const newCol = col + c;
                if (
                    newRow >= ROWS ||
                    newCol < 0 ||
                    newCol >= COLS ||
                    grid[newRow][newCol]
                ) {
                    return true;
                }
            }
        }
    }
    return false;
}

function mergePiece() {
    const { shape, row, col } = currentPiece;
    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c]) {
                grid[row + r][col + c] = shape[r][c];
            }
        }
    }
}

function update() {
    if (isPaused || checkGameOver()) return;

    if (!currentPiece) return;
    currentPiece.row++;

    if (checkCollision()) {
        currentPiece.row--;
        mergePiece();
        clearLines();
        spawnPiece();
    }

    drawGrid();
    drawPiece();
    document.getElementById('scoreDisplay').textContent = `Score: ${score}`;
}

function startGame() {
    grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    score = 0;
    document.getElementById('scoreDisplay').textContent = `Score: ${score}`;
    spawnPiece();
    setInterval(update, 500);
}

function movePiece(direction) {
    const { shape, row, col } = currentPiece;
    const newCol = col + direction;

    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c]) {
                const newRow = row + r;
                const newColPos = newCol + c;
                if (
                    newColPos < 0 ||
                    newColPos >= COLS ||
                    grid[newRow][newColPos]
                ) {
                    return; // Prevent movement if collision occurs
                }
            }
        }
    }
    currentPiece.col = newCol;
}

function rotatePiece() {
    const { shape, row, col } = currentPiece;
    const newShape = shape[0].map((_, index) => shape.map(row => row[index]).reverse());

    for (let r = 0; r < newShape.length; r++) {
        for (let c = 0; c < newShape[r].length; c++) {
            if (newShape[r][c]) {
                const newRow = row + r;
                const newCol = col + c;
                if (
                    newRow >= ROWS ||
                    newCol < 0 ||
                    newCol >= COLS ||
                    grid[newRow][newCol]
                ) {
                    return; // Prevent rotation if collision occurs
                }
            }
        }
    }
    currentPiece.shape = newShape;
}

function dropPiece() {
    const { shape, row, col } = currentPiece;
    const newRow = row + 1;

    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c]) {
                const newRowPos = newRow + r;
                const newColPos = col + c;
                if (
                    newRowPos >= ROWS ||
                    grid[newRowPos][newColPos]
                ) {
                    mergePiece();
                    clearLines();
                    spawnPiece();
                    return;
                }
            }
        }
    }
    currentPiece.row = newRow;
    drawGrid();
    drawPiece();
}

function togglePause() {
    isPaused = !isPaused;
    document.getElementById('pauseButton').textContent = isPaused ? 'Resume' : 'Pause';
}

function checkGameOver() {
    for (let col = 0; col < COLS; col++) {
        if (grid[0][col]) {
            alert('Game Over!');
            clearInterval(gameInterval);
            return true;
        }
    }
    return false;
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'p') {
        togglePause();
    }

    if (isPaused) return;

    switch (event.key) {
        case 'ArrowLeft':
            movePiece(-1);
            break;
        case 'ArrowRight':
            movePiece(1);
            break;
        case 'ArrowUp':
            rotatePiece();
            break;
        case 'ArrowDown':
            dropPiece();
            break;
    }
    drawGrid();
    drawPiece();
});

document.getElementById('startButton').addEventListener('click', startGame);