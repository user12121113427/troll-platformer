const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 900;
canvas.height = 500;

const W = canvas.width;
const H = canvas.height;

// =========================
// GAME STATE
// =========================

let round = 1;
let score = 0;
let deaths = 0;

let gameOver = false;
let roundComplete = false;

let cameraX = 0;

const gravity = 0.65;
const jumpPower = -12;

// =========================
// PLAYER
// =========================

const player = {
    x: 80,
    y: 350,
    width: 26,
    height: 55,

    speed: 5,
    velocityY: 0,

    jumping: false,
    walking: false,

    direction: 1,
    walkTime: 0
};

// =========================
// CONTROLS
// =========================

const keys = {};

document.addEventListener("keydown", e => {
    keys[e.key.toLowerCase()] = true;

    if (
        e.key === "ArrowUp" ||
        e.key === " " ||
        e.key.toLowerCase() === "w"
    ) {
        e.preventDefault();
    }
});

document.addEventListener("keyup", e => {
    keys[e.key.toLowerCase()] = false;
});

// =========================
// MOBILE BUTTONS
// =========================

function setupButton(id, key) {
    const button = document.getElementById(id);

    if (!button) return;

    const press = e => {
        e.preventDefault();

        if (gameOver) {
            restartGame();
            return;
        }

        if (roundComplete) {
            nextRound();
            return;
        }

        keys[key] = true;
    };

    const release = e => {
        e.preventDefault();
        keys[key] = false;
    };

    button.addEventListener("touchstart", press, {
        passive: false
    });

    button.addEventListener("touchend", release, {
        passive: false
    });

    button.addEventListener("mousedown", press);
    button.addEventListener("mouseup", release);
    button.addEventListener("mouseleave", release);
}

setupButton("left", "arrowleft");
setupButton("right", "arrowright");
setupButton("jump", "arrowup");

// =========================
// CREATE LEVEL
// =========================

let platforms = [];
let traps = [];
let goalX = 0;

function createLevel() {

    platforms = [];
    traps = [];

    const length = 2600 + round * 600;

    // Main floor
    platforms.push({
        x: 0,
        y: 440,
        width: length,
        height: 60
    });

    // Floating platforms
    for (let x = 450; x < length - 300; x += 400) {

        const height = 340 - Math.random() * 100;

        platforms.push({
            x: x,
            y: height,
            width: 150,
            height: 25
        });
    }

    // Troll traps
    const trapCount = 5 + round * 2;

    for (let i = 0; i < trapCount; i++) {

        traps.push({
            x: 350 + i * 350 + Math.random() * 120,
            y: 420,
            width: 45,
            height: 20,
            active: true
        });
    }

    goalX = length - 180;
}

// =========================
// RESET PLAYER
// =========================

function resetPlayer() {

    player.x = 80;
    player.y = 350;

    player.velocityY = 0;
    player.jumping = false;

    cameraX = 0;
}

// =========================
// COLLISION
// =========================

function touching(a, b) {

    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

// =========================
// PLAYER DEATH
// =========================

function die() {

    if (gameOver) return;

    deaths++;

    gameOver = true;
}

// =========================
// ROUND COMPLETE
// =========================

function completeRound() {

    if (roundComplete) return;

    roundComplete = true;

    score += 100 * round;
}

// =========================
// NEXT ROUND
// =========================

function nextRound() {

    round++;

    roundComplete = false;
    gameOver = false;

    resetPlayer();
    createLevel();
}

// =========================
// RESTART
// =========================

function restartGame() {

    round = 1;
    score = 0;
    deaths = 0;

    gameOver = false;
    roundComplete = false;

    resetPlayer();
    createLevel();
}

// =========================
// UPDATE
// =========================

function update() {

    if (gameOver || roundComplete) {
        return;
    }

    player.walking = false;

    // LEFT
    if (keys["arrowleft"] || keys["a"]) {

        player.x -= player.speed;

        player.direction = -1;
        player.walking = true;
    }

    // RIGHT
    if (keys["arrowright"] || keys["d"]) {

        player.x += player.speed;

        player.direction = 1;
        player.walking = true;
    }

    // JUMP
    if (
        (keys["arrowup"] ||
            keys["w"] ||
            keys[" "]) &&
        !player.jumping
    ) {

        player.velocityY = jumpPower;
        player.jumping = true;
    }

    // Gravity
    player.velocityY += gravity;
    player.y += player.velocityY;

    // Platform collision
    let landed = false;

    for (const platform of platforms) {

        const playerBottom =
            player.y + player.height;

        const previousBottom =
            playerBottom - player.velocityY;

        if (
            player.x + player.width > platform.x &&
            player.x < platform.x + platform.width &&
            playerBottom >= platform.y &&
            previousBottom <= platform.y &&
            player.velocityY >= 0
        ) {

            player.y =
                platform.y - player.height;

            player.velocityY = 0;

            landed = true;
        }
    }

    player.jumping = !landed;

    // Trap collision
    for (const trap of traps) {

        if (!trap.active) continue;

        const hitbox = {
            x: trap.x,
            y: trap.y - trap.height,
            width: trap.width,
            height: trap.height
        };

        if (touching(player, hitbox)) {

            die();
        }
    }

    // Falling
    if (player.y > H + 100) {
        die();
    }

    // Prevent going backwards too far
    if (player.x < 0) {
        player.x = 0;
    }

    // Camera
    cameraX = player.x - 180;

    if (cameraX < 0) {
        cameraX = 0;
    }

    // Walking animation
    if (player.walking) {
        player.walkTime += 0.2;
    }

    // Goal
    if (player.x >= goalX) {
        completeRound();
    }
}

// =========================
// DRAW BACKGROUND
// =========================

function drawBackground() {

    // Gradient sky
    const gradient = ctx.createLinearGradient(
        0,
        0,
        0,
        H
    );

    gradient.addColorStop(0, "#090014");
    gradient.addColorStop(0.5, "#21002f");
    gradient.addColorStop(1, "#08000f");

    ctx.fillStyle = gradient;

    ctx.fillRect(0, 0, W, H);

    // Neon moon
    ctx.beginPath();

    ctx.arc(
        760,
        90,
        45,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#d946ef";
    ctx.shadowBlur = 30;
    ctx.shadowColor = "#d946ef";

    ctx.fill();

    ctx.shadowBlur = 0;

    // Stars
    for (let i = 0; i < 45; i++) {

        const x =
            ((i * 173) % W);

        const y =
            ((i * 79) % 300);

        ctx.fillStyle =
            i % 3 === 0
                ? "#ff4fd8"
                : "#8b5cf6";

        ctx.fillRect(
            x,
            y,
            2,
            2
        );
    }

    // Gothic crosses
    for (let x = 80; x < W; x += 230) {

        ctx.strokeStyle = "#5b146f";
        ctx.lineWidth = 3;

        ctx.beginPath();

        ctx.moveTo(x, 280);
        ctx.lineTo(x, 330);

        ctx.moveTo(x - 12, 295);
        ctx.lineTo(x + 12, 295);

        ctx.stroke();
    }
}

// =========================
// DRAW PLATFORMS
// =========================

function drawPlatforms() {

    for (const platform of platforms) {

        const x = platform.x - cameraX;

        if (
            x + platform.width < 0 ||
            x > W
        ) continue;

        // Glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#00ff9d";

        ctx.fillStyle = "#14151c";

        ctx.fillRect(
            x,
            platform.y,
            platform.width,
            platform.height
        );

        // Neon edge
        ctx.shadowBlur = 8;
        ctx.strokeStyle = "#00ff9d";
        ctx.lineWidth = 3;

        ctx.strokeRect(
            x,
            platform.y,
            platform.width,
            platform.height
        );

        ctx.shadowBlur = 0;
    }
}

// =========================
// DRAW TRAPS
// =========================

function drawTraps() {

    for (const trap of traps) {

        const x = trap.x - cameraX;

        if (x < -100 || x > W + 100) {
            continue;
        }

        ctx.fillStyle = "#ff1744";
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#ff1744";

        // spikes
        for (let i = 0; i < 4; i++) {

            ctx.beginPath();

            ctx.moveTo(
                x + i * 11,
                trap.y
            );

            ctx.lineTo(
                x + 5 + i * 11,
                trap.y - 20
            );

            ctx.lineTo(
                x + 10 + i * 11,
                trap.y
            );

            ctx.fill();
        }

        ctx.shadowBlur = 0;
    }
}

// =========================
// DRAW STICKMAN
// =========================

function drawStickman() {

    const x =
        player.x - cameraX;

    const y =
        player.y;

    ctx.save();

    ctx.translate(
        x + player.width / 2,
        y
    );

    ctx.scale(
        player.direction,
        1
    );

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";

    ctx.shadowBlur = 12;
    ctx.shadowColor = "#ffffff";

    // Head
    ctx.beginPath();

    ctx.arc(
        0,
        12,
        11,
        0,
        Math.PI * 2
    );

    ctx.stroke();

    // Body
    ctx.beginPath();

    ctx.moveTo(0, 23);
    ctx.lineTo(0, 43);

    ctx.stroke();

    const walk =
        player.walking
            ? Math.sin(player.walkTime) * 12
            : 0;

    // Arms
    ctx.beginPath();

    ctx.moveTo(0, 27);
    ctx.lineTo(-14, 35 + walk * 0.4);

    ctx.moveTo(0, 27);
    ctx.lineTo(14, 35 - walk * 0.4);

    ctx.stroke();

    // Legs
    ctx.beginPath();

    ctx.moveTo(0, 43);
    ctx.lineTo(-12, 55 + walk);

    ctx.moveTo(0, 43);
    ctx.lineTo(12, 55 - walk);

    ctx.stroke();

    ctx.restore();
}

// =========================
// DRAW GOAL
// =========================

function drawGoal() {

    const x = goalX - cameraX;

    ctx.fillStyle = "#ff00cc";
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#ff00cc";

    ctx.fillRect(
        x,
        300,
        8,
        140
    );

    ctx.fillStyle = "#ffffff";

    ctx.font = "bold 18px Arial";

    ctx.fillText(
        "EXIT",
        x - 15,
        285
    );

    ctx.shadowBlur = 0;
}

// =========================
// HUD
// =========================

function drawHUD() {

    ctx.fillStyle = "#ffffff";

    ctx.font = "bold 20px Arial";

    ctx.fillText(
        "ROUND " + round,
        25,
        35
    );

    ctx.fillStyle = "#ff4fd8";

    ctx.fillText(
        "SCORE: " + score,
        25,
        65
    );

    ctx.fillStyle = "#aaaaaa";

    ctx.font = "14px Arial";

    ctx.fillText(
        "GOTH TROLL PLATFORMER",
        25,
        88
    );
}

// =========================
// GAME OVER SCREEN
// =========================

function drawGameOver() {

    ctx.fillStyle =
        "rgba(0,0,0,0.78)";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );

    ctx.textAlign = "center";

    ctx.fillStyle = "#ff1744";

    ctx.font = "bold 50px Arial";

    ctx.fillText(
        "YOU DIED",
        W / 2,
        190
    );

    ctx.fillStyle = "#ffffff";

    ctx.font = "22px Arial";

    ctx.fillText(
        "Tap the screen to respawn",
        W / 2,
        240
    );

    ctx.font = "18px Arial";

    ctx.fillStyle = "#ff4fd8";

    ctx.fillText(
        "Score: " + score,
        W / 2,
        280
    );

    ctx.textAlign = "left";
}

// =========================
// ROUND COMPLETE
// =========================

function drawRoundComplete() {

    ctx.fillStyle =
        "rgba(5,0,15,0.85)";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );

    ctx.textAlign = "center";

    ctx.fillStyle = "#00ff9d";

    ctx.font = "bold 45px Arial";

    ctx.fillText(
        "ROUND COMPLETE",
        W / 2,
        190
    );

    ctx.fillStyle = "#ffffff";

    ctx.font = "22px Arial";

    ctx.fillText(
        "Round " + round + " cleared!",
        W / 2,
        235
    );

    ctx.fillStyle = "#ff4fd8";

    ctx.fillText(
        "+ " + (100 * round) + " SCORE",
        W / 2,
        275
    );

    ctx.fillStyle = "#aaaaaa";

    ctx.font = "18px Arial";

    ctx.fillText(
        "Tap the screen for Round " +
        (round + 1),
        W / 2,
        330
    );

    ctx.textAlign = "left";
}

// =========================
// DRAW EVERYTHING
// =========================

function draw() {

    ctx.clearRect(
        0,
        0,
        W,
        H
    );

    drawBackground();
    drawPlatforms();
    drawTraps();
    drawGoal();
    drawStickman();
    drawHUD();

    if (gameOver) {
        drawGameOver();
    }

    if (roundComplete) {
        drawRoundComplete();
    }
}

// =========================
// GAME LOOP
// =========================

function gameLoop() {

    update();
    draw();

    requestAnimationFrame(gameLoop);
}

// =========================
// TAP SCREEN TO RESPAWN
// =========================

canvas.addEventListener(
    "click",
    () => {

        if (gameOver) {
            restartGame();
        }
        else if (roundComplete) {
            nextRound();
        }

    }
);

document.addEventListener(
    "touchstart",
    e => {

        if (
            e.target === canvas &&
            (gameOver || roundComplete)
        ) {

            if (gameOver) {
                restartGame();
            }
            else {
                nextRound();
            }
        }

    },
    { passive: true }
);

// =========================
// START
// =========================

createLevel();
gameLoop();
