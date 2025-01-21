const canvas = document.getElementById("tetris");
const ctx = canvas.getContext("2d");

const ROWS = 20;
const COLUMNS = 10;
const BLOCK_SIZE = 30;
let gameOver = false;
let isPaused = false;

const board = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(null));

const tetrominoes = [
    { shape: [[1, 1, 1, 1]], color: "#00FFFF" },  // I (シアン)
    { shape: [[1, 1], [1, 1]], color: "#FFFF00" }, // O (黄色)
    { shape: [[0, 1, 0], [1, 1, 1]], color: "#800080" }, // T (紫)
    { shape: [[1, 1, 0], [0, 1, 1]], color: "#FF0000" }, // Z (赤)
    { shape: [[0, 1, 1], [1, 1, 0]], color: "#00FF00" }, // S (緑)
    { shape: [[1, 0, 0], [1, 1, 1]], color: "#FFA500" }, // L (オレンジ)
    { shape: [[0, 0, 1], [1, 1, 1]], color: "#0000FF" }  // J (青)
];

let currentPiece = createPiece();
let score = 0;
let dropInterval = 500;

function createPiece() {
    const type = tetrominoes[Math.floor(Math.random() * tetrominoes.length)];
    return {
        shape: type.shape,
        color: type.color,
        x: 3,
        y: 0
    };
}

function rotate(piece) {
    const newShape = piece.shape[0].map((_, i) => piece.shape.map(row => row[i]).reverse());
    const oldX = piece.x;
    piece.shape = newShape;
    if (collide()) {
        piece.x = oldX;
        piece.shape = newShape.map(row => row.reverse()); // 回転を元に戻す
    }
}

function drawBoard() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    board.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) {
                ctx.fillStyle = cell;
                ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                ctx.strokeStyle = "black";
                ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        });
    });
}

function drawPiece() {
    ctx.fillStyle = currentPiece.color;
    currentPiece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) {
                ctx.fillStyle = currentPiece.color;
                ctx.fillRect((currentPiece.x + x) * BLOCK_SIZE, (currentPiece.y + y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                ctx.strokeStyle = "black";
                ctx.strokeRect((currentPiece.x + x) * BLOCK_SIZE, (currentPiece.y + y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        });
    });
}

function collide() {
    return currentPiece.shape.some((row, dy) => {
        return row.some((cell, dx) => {
            let x = currentPiece.x + dx;
            let y = currentPiece.y + dy;
            return cell && (y >= ROWS || board[y]?.[x]);
        });
    });
}

function mergePiece() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) {
                board[currentPiece.y + y][currentPiece.x + x] = currentPiece.color;
            }
        });
    });
}

function clearLines() {
    board.forEach((row, y) => {
        if (row.every(cell => cell)) {
            board.splice(y, 1);
            board.unshift(Array(COLUMNS).fill(null));
            score += 10;
            document.getElementById("score").textContent = `Score: ${score}`;
        }
    });
}

function dropPiece() {
    if (!isPaused && !gameOver) {
        currentPiece.y++;
        if (collide()) {
            currentPiece.y--;
            mergePiece();
            clearLines();
            currentPiece = createPiece();
            if (collide()) {
                alert("Game Over!");
                gameOver = true;
            }
        }
        drawBoard();
        drawPiece();
        setTimeout(dropPiece, dropInterval);
    }
}

function hardDrop() {
    while (!collide()) {
        currentPiece.y++;
    }
    currentPiece.y--;
    mergePiece();
    clearLines();
    currentPiece = createPiece();
    if (collide()) {
        alert("Game Over!");
        gameOver = true;
    }
    drawBoard();
    drawPiece();
}

document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
        currentPiece.x--;
        if (collide()) currentPiece.x++;
    } else if (event.key === "ArrowRight") {
        currentPiece.x++;
        if (collide()) currentPiece.x--;
    } else if (event.key === "ArrowDown") {
        currentPiece.y++;
        if (collide()) currentPiece.y--;
    } else if (event.key === " ") {
        hardDrop(); // スペースキーでハードドロップ
    } else if (event.key === "ArrowUp") {
        rotate(currentPiece); // 上矢印で回転
    } else if (event.key === "p") {
        isPaused = !isPaused;
        if (!isPaused) {
            dropPiece();
        }
    }
});

dropPiece();

