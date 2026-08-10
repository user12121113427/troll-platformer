const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 450;

// ===============================
// GAME SETTINGS
// ===============================

let round = 1;
let score = 0;
let gameOver = false;
let roundComplete = false;

let cameraX = 0;
let levelLength = 2500;

const gravity = 0.6;
const jumpPower = -11;

// ===============================
// PLAYER
// ===============================

const player = {
    x: 80,
    y: 300,
    width: 24,
    height: 45,

    speed: 4,
    velocityY: 0,

    jumping: false,
    walking: false,
    direction: 1,
    walkTime: 0
};

// ===============================
// CONTROLS
// ===============================

const keys = {};

document.addEventListener("keydown", e => {
    keys[e.key] = true;

    if (
        e.key === " " ||
        e.key === "ArrowUp" ||
        e.key === "w"
    ) {
        e.preventDefault();
    }

    if (gameOver) {
        restartGame();
    }
});

document.addEventListener("keyup", e => {
    keys[e.key] = false;
});

// ===============================
// TOUCH CONTROLS
// ===============================

function buttonPressed(id, key) {
    const button = document.getElementById(id);

    if (!button) return;

    button.addEventListener("touchstart", e => {
        e.preventDefault();

        if (gameOver) {
            restartGame();
            return;
        }

        keys[key] = true;
    }, { passive: false });

    button.addEventListener("touchend", e => {
        e.preventDefault();
        keys[key] = false;
    }, { passive: false });

    button.addEventListener("mousedown", () => {
        if (gameOver) {
            restartGame();
            return;
        }

        keys[key] = true;
    });

    button.addEventListener("mouseup", () => {
        keys[key] = false;
    });
}

buttonPressed("left", "ArrowLeft");
buttonPressed("right", "ArrowRight");
buttonPressed("jump", "ArrowUp");

// Tap screen to revive
canvas.addEventListener("touchstart", () => {
    if (gameOver) {
        restartGame();
    }
});

canvas.addEventListener("click", () => {
    if (gameOver) {
        restartGame();
    }
});

// ===============================
// LEVEL
// ===============================

let platforms = [];

function createLevel() {
    platforms = [];

    let x = 0;

    while (x < levelLength) {

        const width = 180 + Math.random() * 180;

        platforms.push({
            x: x,
            y: 390,
            width: width,
            height: 60
        });

        x += width;

        // Gap becomes larger every round
        const maxGap = Math.min(90 + round * 8, 160);

        x += 40 + Math.random() * maxGap;
    }

    // Final platform
    platforms.push({
        x: levelLength,
        y: 390,
        width: 300,
        height: 60
    });
}

createLevel();

// ===============================
// GOTH DECORATIONS
// ===============================

let decorations = [];

function createDecorations() {

    decorations = [];

    for (let i = 0; i < 100; i++) {

        decorations.push({
            x: Math.random() * levelLength,
            y: 40 + Math.random() * 250,
            size: 8 + Math.random() * 18,
            type: Math.floor(Math.random() * 4)
        });
    }
}

createDecorations();

// ===============================
// BACKGROUND
// ===============================

let bgTime = 0;

function drawBackground() {

    bgTime += 0.01;

    const gradient = ctx.createLinearGradient(
        0,
        0,
        0,
        canvas.height
    );

    const hue = (bgTime * 40 + round * 45) % 360;

    gradient.addColorStop(
        0,
        `hsl(${hue}, 65%, 12%)`
    );

    gradient.addColorStop(
        1,
        `hsl(${(hue + 80) % 360}, 70%, 5%)`
    );

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid
    ctx.strokeStyle = `hsla(${(hue + 40) % 360}, 100%, 65%, 0.12)`;
    ctx.lineWidth = 1;

    for (let x = -cameraX % 50; x < canvas.width; x += 50) {

        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for (let y = 0; y < canvas.height; y += 50) {

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // Glowing circles
    for (let i = 0; i < 8; i++) {

        const x =
            ((i * 150 - cameraX * 0.2) %
                (canvas.width + 200)) - 100;

        const y =
            70 + Math.sin(bgTime + i) * 40;

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            30 + Math.sin(bgTime * 2 + i) * 10,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            `hsla(${(hue + i * 40) % 360},100%,60%,0.06)`;

        ctx.fill();
    }
}

// ===============================
// GOTH DECOR
// ===============================

function drawDecorations() {

    decorations.forEach(d => {

        const x = d.x - cameraX;

        if (x < -50 || x > canvas.width + 50) return;

        ctx.save();

        ctx.translate(x, d.y);

        ctx.strokeStyle = "rgba(255,255,255,0.35)";
        ctx.fillStyle = "rgba(255,255,255,0.15)";

        if (d.type === 0) {

            // Bat
            ctx.beginPath();

            ctx.moveTo(-d.size, 0);
            ctx.lineTo(-d.size / 2, -d.size / 2);
            ctx.lineTo(0, 0);
            ctx.lineTo(d.size / 2, -d.size / 2);
            ctx.lineTo(d.size, 0);
            ctx.lineTo(d.size / 2, d.size / 3);
            ctx.lineTo(0, d.size / 4);
            ctx.lineTo(-d.size / 2, d.size / 3);

            ctx.closePath();
            ctx.fill();

        } else if (d.type === 1) {

            // Moon
            ctx.beginPath();

            ctx.arc(
                0,
                0,
                d.size,
                0,
                Math.PI * 2
            );

            ctx.stroke();

        } else if (d.type === 2) {

            // Diamond
            ctx.beginPath();

            ctx.moveTo(0, -d.size);
            ctx.lineTo(d.size, 0);
            ctx.lineTo(0, d.size);
            ctx.lineTo(-d.size, 0);

            ctx.closePath();
            ctx.stroke();

        } else {

            // Tiny star
            ctx.beginPath();

            for (let i = 0; i < 8; i++) {

                const a = i * Math.PI / 4;

                const r =
                    i % 2 === 0
                        ? d.size
                        : d.size / 3;

                const px = Math.cos(a) * r;
                const py = Math.sin(a) * r;

                if (i === 0)
                    ctx.moveTo(px, py);
                else
                    ctx.lineTo(px, py);
            }

            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();
    });
}

// ===============================
// PLATFORM DRAWING
// ===============================

function drawPlatforms() {

    platforms.forEach(p => {

        const x = p.x - cameraX;

        if (x + p.width < 0 || x > canvas.width)
            return;

        // Neon top
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#ff2bd6";

        ctx.fillStyle = "#111";

        ctx.fillRect(
            x,
            p.y,
            p.width,
            p.height
        );

        ctx.shadowBlur = 0;

        ctx.fillStyle = "#ff2bd6";

        ctx.fillRect(
            x,
            p.y,
            p.width,
            5
        );

        // Purple bottom
        ctx.fillStyle = "#6b1aff";

        ctx.fillRect(
            x,
            p.y + 5,
            p.width,
            5
        );
    });
}

// ===============================
// STICKMAN
// ===============================

function drawPlayer() {

    const x = player.x - cameraX;
    const y = player.y;

    ctx.save();

    ctx.translate(x + player.width / 2, y);

    ctx.scale(player.direction, 1);

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";

    ctx.shadowBlur = 12;
    ctx.shadowColor = "#ffffff";

    // Head
    ctx.beginPath();

    ctx.arc(
        0,
        8,
        9,
        0,
        Math.PI * 2
    );

    ctx.stroke();

    // Body
    ctx.beginPath();

    ctx.moveTo(0, 17);
    ctx.lineTo(0, 32);

    ctx.stroke();

    // Walking animation
    let legOffset = 0;

    if (player.walking) {

        legOffset =
            Math.sin(player.walkTime) * 7;
    }

    // Arms
    ctx.beginPath();

    ctx.moveTo(0, 20);

    ctx.lineTo(
        -9,
        28 + legOffset * 0.4
    );

    ctx.moveTo(0, 20);

    ctx.lineTo(
        9,
        28 - legOffset * 0.4
    );

    ctx.stroke();

    // Legs
    ctx.beginPath();

    ctx.moveTo(0, 32);

    ctx.lineTo(
        -8 + legOffset,
        44
    );

    ctx.moveTo(0, 32);

    ctx.lineTo(
        8 - legOffset,
        44
    );

    ctx.stroke();

    ctx.restore();
}

// ===============================
// MOVEMENT
// ===============================

function movePlayer() {

    player.walking = false;

    if (
        keys["ArrowRight"] ||
        keys["d"] ||
        keys["D"]
    ) {

        player.x += player.speed;

        player.direction = 1;

        player.walking = true;
        player.walkTime += 0.25;
    }

    if (
        keys["ArrowLeft"] ||
        keys["a"] ||
        keys["A"]
    ) {

        player.x -= player.speed;

        player.direction = -1;

        player.walking = true;
        player.walkTime += 0.25;
    }

    // Jump
    if (
        (
            keys["ArrowUp"] ||
            keys["w"] ||
            keys["W"] ||
            keys[" "]
        ) &&
        !player.jumping
    ) {

        player.velocityY = jumpPower;
        player.jumping = true;
    }

    player.velocityY += gravity;
    player.y += player.velocityY;

    // Platform collision
    let standing = false;

    platforms.forEach(p => {

        if (
            player.x + player.width > p.x &&
            player.x < p.x + p.width &&
            player.y + player.height >= p.y &&
            player.y + player.height <= p.y + 20 &&
            player.velocityY >= 0
        ) {

            player.y =
                p.y - player.height;

            player.velocityY = 0;

            player.jumping = false;

            standing = true;
        }
    });

    if (!standing && player.y < 385) {
        player.jumping = true;
    }

    // Camera
    cameraX = player.x - 150;

    if (cameraX < 0)
        cameraX = 0;

    if (cameraX > levelLength - 400)
        cameraX = levelLength - 400;

    // Death
    if (player.y > canvas.height + 100) {

        gameOver = true;
    }

    // Don't walk backwards too far
    if (player.x < 20)
        player.x = 20;

    // Round complete
    if (player.x > levelLength + 100) {

        completeRound();
    }
}

// ===============================
// SCORE
// ===============================

function updateScore() {

    if (!gameOver && !roundComplete) {

        score += 0.02;
    }
}

// ===============================
// ROUND COMPLETE
// ===============================

function completeRound() {

    if (roundComplete)
        return;

    roundComplete = true;

    setTimeout(() => {

        round++;

        score += 500;

        levelLength += 500;

        player.x = 80;
        player.y = 300;

        cameraX = 0;

        gameOver = false;
        roundComplete = false;

        createLevel();
        createDecorations();

    }, 2500);
}

// ===============================
// UI
// ===============================

function drawUI() {

    ctx.shadowBlur = 0;

    // Score
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px Arial";

    ctx.fillText(
        "SCORE: " + Math.floor(score),
        20,
        30
    );

    // Round
    ctx.fillText(
        "ROUND " + round,
        20,
        58
    );

    // Difficulty
    ctx.font = "14px Arial";

    ctx.fillStyle = "#ff4de1";

    ctx.fillText(
        "DIFFICULTY: " +
        Math.min(round, 10),
        20,
        80
    );

    // Game over
    if (gameOver) {

        ctx.fillStyle =
            "rgba(0,0,0,0.78)";

        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.textAlign = "center";

        ctx.fillStyle = "#ff2bd6";

        ctx.font = "bold 48px Arial";

        ctx.fillText(
            "YOU DIED",
            canvas.width / 2,
            180
        );

        ctx.fillStyle = "#ffffff";

        ctx.font = "22px Arial";

        ctx.fillText(
            "TAP THE SCREEN TO REVIVE",
            canvas.width / 2,
            230
        );

        ctx.font = "18px Arial";

        ctx.fillText(
            "Score: " + Math.floor(score),
            canvas.width / 2,
            270
        );

        ctx.textAlign = "left";
    }

    // Round complete
    if (roundComplete) {

        ctx.fillStyle =
            "rgba(0,0,0,0.75)";

        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.textAlign = "center";

        ctx.fillStyle = "#ff2bd6";

        ctx.font = "bold 42px Arial";

        ctx.fillText(
            "ROUND COMPLETE",
            canvas.width / 2,
            190
        );

        ctx.fillStyle = "#ffffff";

        ctx.font = "20px Arial";

        ctx.fillText(
            "GET READY FOR ROUND " +
            (round + 1),
            canvas.width / 2,
            235
        );

        ctx.fillText(
            "+500 SCORE",
            canvas.width / 2,
            270
        );

        ctx.textAlign = "left";
    }
}

// ===============================
// RESTART
// ===============================

function restartGame() {

    gameOver = false;
    roundComplete = false;

    player.x = 80;
    player.y = 300;
    player.velocityY = 0;
    player.jumping = false;

    cameraX = 0;
}

// ===============================
// MAIN LOOP
// ===============================

function gameLoop() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    drawBackground();
    drawDecorations();
    drawPlatforms();

    if (!gameOver && !roundComplete) {

        movePlayer();
        updateScore();
    }

    drawPlayer();
    drawUI();

    requestAnimationFrame(gameLoop);
}

gameLoop();
