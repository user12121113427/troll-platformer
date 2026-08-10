const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 450;

// =========================
// PLAYER
// =========================

const player = {
    x: 70,
    y: 335,
    width: 24,
    height: 45,
    speed: 4,
    velocityY: 0,
    jumping: false,
    walkTime: 0
};

const gravity = 0.6;
const jumpPower = -11;

const keys = {
    left: false,
    right: false
};

let cameraX = 0;
let gameOver = false;
let won = false;

let score = 0;
let bestScore = 0;

// =========================
// KEYBOARD CONTROLS
// =========================

document.addEventListener("keydown", (e) => {

    if (gameOver) {
        if (e.key === "r" || e.key === "Enter" || e.key === " ") {
            restart();
        }

        return;
    }

    if (e.key === "ArrowLeft" || e.key === "a") {
        keys.left = true;
    }

    if (e.key === "ArrowRight" || e.key === "d") {
        keys.right = true;
    }

    if (
        e.key === "ArrowUp" ||
        e.key === "w" ||
        e.key === " "
    ) {
        e.preventDefault();
        jump();
    }
});

document.addEventListener("keyup", (e) => {

    if (e.key === "ArrowLeft" || e.key === "a") {
        keys.left = false;
    }

    if (e.key === "ArrowRight" || e.key === "d") {
        keys.right = false;
    }
});

// =========================
// MOBILE CONTROLS
// =========================

const leftButton = document.getElementById("left");
const rightButton = document.getElementById("right");
const jumpButton = document.getElementById("jump");

function holdButton(button, down, up) {

    button.addEventListener("touchstart", (e) => {
        e.preventDefault();
        down();
    });

    button.addEventListener("touchend", (e) => {
        e.preventDefault();
        up();
    });

    button.addEventListener("touchcancel", up);

    button.addEventListener("mousedown", down);
    button.addEventListener("mouseup", up);
    button.addEventListener("mouseleave", up);
}

holdButton(
    leftButton,
    () => keys.left = true,
    () => keys.left = false
);

holdButton(
    rightButton,
    () => keys.right = true,
    () => keys.right = false
);

jumpButton.addEventListener("touchstart", (e) => {
    e.preventDefault();

    if (gameOver) {
        restart();
    } else {
        jump();
    }
});

jumpButton.addEventListener("mousedown", () => {

    if (gameOver) {
        restart();
    } else {
        jump();
    }
});

// =========================
// TAP SCREEN TO RESPAWN
// =========================

canvas.addEventListener("touchstart", (e) => {

    if (gameOver) {
        e.preventDefault();
        restart();
    }
});

canvas.addEventListener("click", () => {

    if (gameOver) {
        restart();
    }
});

// =========================
// JUMP
// =========================

function jump() {

    if (!player.jumping && !gameOver && !won) {

        player.velocityY = jumpPower;
        player.jumping = true;
    }
}

// =========================
// LEVEL
// =========================

const platforms = [

    {
        x: 0,
        y: 380,
        width: 450,
        height: 70
    },

    {
        x: 550,
        y: 380,
        width: 300,
        height: 70
    },

    {
        x: 950,
        y: 320,
        width: 220,
        height: 30
    },

    {
        x: 1250,
        y: 380,
        width: 400,
        height: 70
    },

    {
        x: 1750,
        y: 330,
        width: 220,
        height: 30
    },

    {
        x: 2100,
        y: 380,
        width: 600,
        height: 70
    }
];

// =========================
// SPIKES
// =========================

const spikes = [

    {
        x: 330,
        y: 360,
        width: 40,
        height: 20
    },

    {
        x: 390,
        y: 360,
        width: 40,
        height: 20
    },

    {
        x: 700,
        y: 360,
        width: 40,
        height: 20
    },

    {
        x: 1030,
        y: 300,
        width: 40,
        height: 20
    },

    {
        x: 1400,
        y: 360,
        width: 40,
        height: 20
    },

    {
        x: 1800,
        y: 310,
        width: 40,
        height: 20
    }
];

// =========================
// GOAL
// =========================

const goal = {
    x: 2500,
    y: 300,
    width: 45,
    height: 80
};

// =========================
// COLLISION
// =========================

function collision(a, b) {

    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

// =========================
// UPDATE
// =========================

function update() {

    if (gameOver || won) {
        return;
    }

    let walking = false;

    if (keys.left) {

        player.x -= player.speed;
        walking = true;
    }

    if (keys.right) {

        player.x += player.speed;
        walking = true;
    }

    if (walking) {
        player.walkTime += 0.2;
    } else {
        player.walkTime = 0;
    }

    // Gravity
    player.velocityY += gravity;
    player.y += player.velocityY;

    player.jumping = true;

    // Platform collision
    for (const platform of platforms) {

        const playerBottom =
            player.y + player.height;

        if (
            player.x + player.width > platform.x &&
            player.x < platform.x + platform.width &&
            playerBottom >= platform.y &&
            playerBottom <= platform.y + 20 &&
            player.velocityY >= 0
        ) {

            player.y =
                platform.y - player.height;

            player.velocityY = 0;

            player.jumping = false;
        }
    }

    // Spikes
    for (const spike of spikes) {

        if (collision(player, spike)) {
            die();
        }
    }

    // Fall
    if (player.y > 500) {
        die();
    }

    // Goal
    if (collision(player, goal)) {
        won = true;
    }

    // Camera
    cameraX = player.x - 180;

    if (cameraX < 0) {
        cameraX = 0;
    }

    // Score
    score = Math.max(
        0,
        Math.floor(player.x / 10)
    );

    if (score > bestScore) {
        bestScore = score;
    }
}

// =========================
// DEATH
// =========================

function die() {

    gameOver = true;

    if (score > bestScore) {
        bestScore = score;
    }
}

// =========================
// RESTART
// =========================

function restart() {

    player.x = 70;
    player.y = 335;

    player.velocityY = 0;
    player.jumping = false;

    player.walkTime = 0;

    cameraX = 0;

    score = 0;

    gameOver = false;
    won = false;
}

// =========================
// GOTH BACKGROUND
// =========================

function drawBackground() {

    const time = Date.now() / 2000;

    // Dark animated gradient
    const gradient = ctx.createLinearGradient(
        0,
        0,
        0,
        canvas.height
    );

    gradient.addColorStop(
        0,
        "#090014"
    );

    gradient.addColorStop(
        0.5,
        "#1a0828"
    );

    gradient.addColorStop(
        1,
        "#050008"
    );

    ctx.fillStyle = gradient;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    // Moon
    const moonX = 650;
    const moonY = 95;

    ctx.fillStyle = "#e8d9ff";

    ctx.beginPath();

    ctx.arc(
        moonX,
        moonY,
        42,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // Moon shadow
    ctx.fillStyle = "#12051c";

    ctx.beginPath();

    ctx.arc(
        moonX + 15,
        moonY - 10,
        40,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // Stars
    for (let i = 0; i < 45; i++) {

        const x =
            (i * 137) % canvas.width;

        const y =
            20 + ((i * 71) % 220);

        const twinkle =
            0.5 +
            Math.sin(time * 3 + i) * 0.5;

        ctx.fillStyle =
            `rgba(255,255,255,${0.3 + twinkle * 0.5})`;

        ctx.fillRect(
            x,
            y,
            2,
            2
        );
    }

    // Distant gothic buildings
    ctx.fillStyle = "#0a0610";

    for (let i = 0; i < 12; i++) {

        const x =
            i * 80 -
            ((cameraX * 0.15) % 80);

        const height =
            70 + ((i * 37) % 90);

        ctx.fillRect(
            x,
            380 - height,
            65,
            height
        );

        // Spire
        ctx.beginPath();

        ctx.moveTo(
            x + 32,
            380 - height - 45
        );

        ctx.lineTo(
            x + 10,
            380 - height
        );

        ctx.lineTo(
            x + 55,
            380 - height
        );

        ctx.closePath();

        ctx.fill();
    }

    // Gothic crosses in the distance
    for (let i = 0; i < 5; i++) {

        const x =
            i * 190 -
            ((cameraX * 0.12) % 190);

        const y = 260;

        ctx.fillStyle =
            "rgba(90,60,120,0.35)";

        ctx.fillRect(
            x,
            y,
            7,
            45
        );

        ctx.fillRect(
            x - 12,
            y + 10,
            31,
            7
        );
    }
}

// =========================
// PLATFORMS
// =========================

function drawPlatforms() {

    for (const platform of platforms) {

        const x =
            platform.x - cameraX;

        // Main platform
        ctx.fillStyle = "#111";

        ctx.fillRect(
            x,
            platform.y,
            platform.width,
            platform.height
        );

        // Neon top
        ctx.fillStyle = "#b44cff";

        ctx.fillRect(
            x,
            platform.y,
            platform.width,
            4
        );

        // Small gothic decorations
        ctx.fillStyle = "#30203b";

        for (
            let decorationX = x + 25;
            decorationX < x + platform.width - 10;
            decorationX += 50
        ) {

            ctx.beginPath();

            ctx.moveTo(
                decorationX,
                platform.y + 15
            );

            ctx.lineTo(
                decorationX + 8,
                platform.y + 30
            );

            ctx.lineTo(
                decorationX + 16,
                platform.y + 15
            );

            ctx.closePath();

            ctx.fill();
        }
    }
}

// =========================
// SPIKES
// =========================

function drawSpikes() {

    for (const spike of spikes) {

        const x =
            spike.x - cameraX;

        ctx.fillStyle = "#ff2d6f";

        ctx.beginPath();

        ctx.moveTo(
            x,
            spike.y + spike.height
        );

        ctx.lineTo(
            x + spike.width / 2,
            spike.y
        );

        ctx.lineTo(
            x + spike.width,
            spike.y + spike.height
        );

        ctx.closePath();

        ctx.fill();

        // Spike glow
        ctx.strokeStyle =
            "rgba(255,45,111,0.4)";

        ctx.lineWidth = 3;

        ctx.stroke();
    }
}

// =========================
// GOAL
// =========================

function drawGoal() {

    const x =
        goal.x - cameraX;

    ctx.fillStyle = "#171018";

    ctx.fillRect(
        x,
        goal.y,
        6,
        goal.height
    );

    ctx.fillStyle = "#d75cff";

    ctx.beginPath();

    ctx.moveTo(
        x + 6,
        goal.y
    );

    ctx.lineTo(
        x + 45,
        goal.y + 18
    );

    ctx.lineTo(
        x + 6,
        goal.y + 36
    );

    ctx.closePath();

    ctx.fill();
}

// =========================
// STICKMAN
// =========================

function drawStickman() {

    const x =
        player.x - cameraX + 12;

    const y =
        player.y;

    const walking =
        keys.left || keys.right;

    const legMovement =
        walking
            ? Math.sin(player.walkTime) * 9
            : 0;

    const armMovement =
        walking
            ? Math.sin(player.walkTime) * 7
            : 0;

    // Glow
    ctx.shadowColor = "#d75cff";
    ctx.shadowBlur = 10;

    ctx.strokeStyle = "#ffffff";

    ctx.lineWidth = 5;

    ctx.lineCap = "round";

    // Head
    ctx.beginPath();

    ctx.arc(
        x,
        y + 8,
        9,
        0,
        Math.PI * 2
    );

    ctx.stroke();

    // Body
    ctx.beginPath();

    ctx.moveTo(
        x,
        y + 17
    );

    ctx.lineTo(
        x,
        y + 32
    );

    ctx.stroke();

    // Arms
    ctx.beginPath();

    ctx.moveTo(
        x,
        y + 20
    );

    ctx.lineTo(
        x - 14,
        y + 28 + armMovement
    );

    ctx.moveTo(
        x,
        y + 20
    );

    ctx.lineTo(
        x + 14,
        y + 28 - armMovement
    );

    ctx.stroke();

    // Legs
    ctx.beginPath();

    ctx.moveTo(
        x,
        y + 32
    );

    ctx.lineTo(
        x - 9 + legMovement,
        y + 45
    );

    ctx.moveTo(
        x,
        y + 32
    );

    ctx.lineTo(
        x + 9 - legMovement,
        y + 45
    );

    ctx.stroke();

    ctx.shadowBlur = 0;
}

// =========================
// SCORE
// =========================

function drawScore() {

    ctx.textAlign = "left";

    ctx.fillStyle = "#ffffff";

    ctx.font =
        "bold 18px Arial";

    ctx.fillText(
        "SCORE  " + score,
        20,
        30
    );

    ctx.fillStyle =
        "#c98cff";

    ctx.font =
        "14px Arial";

    ctx.fillText(
        "BEST  " + bestScore,
        20,
        50
    );
}

// =========================
// DEATH SCREEN
// =========================

function drawGameOver() {

    if (!gameOver) {
        return;
    }

    ctx.fillStyle =
        "rgba(5,0,10,0.82)";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.textAlign = "center";

    ctx.shadowColor = "#ff2d6f";
    ctx.shadowBlur = 15;

    ctx.fillStyle = "#ff4f8b";

    ctx.font =
        "bold 52px Arial";

    ctx.fillText(
        "YOU DIED",
        canvas.width / 2,
        180
    );

    ctx.shadowBlur = 0;

    ctx.fillStyle = "white";

    ctx.font =
        "bold 22px Arial";

    ctx.fillText(
        "SCORE  " + score,
        canvas.width / 2,
        225
    );

    ctx.fillStyle =
        "#c98cff";

    ctx.font =
        "18px Arial";

    ctx.fillText(
        "TAP ANYWHERE TO REVIVE",
        canvas.width / 2,
        270
    );

    ctx.font =
        "14px Arial";

    ctx.fillStyle =
        "rgba(255,255,255,0.6)";

    ctx.fillText(
        "or press R",
        canvas.width / 2,
        300
    );

    ctx.textAlign = "left";
}

// =========================
// WIN SCREEN
// =========================

function drawWin() {

    if (!won) {
        return;
    }

    ctx.fillStyle =
        "rgba(5,0,10,0.8)";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.textAlign = "center";

    ctx.fillStyle = "#d75cff";

    ctx.font =
        "bold 44px Arial";

    ctx.fillText(
        "LEVEL COMPLETE",
        canvas.width / 2,
        190
    );

    ctx.fillStyle = "white";

    ctx.font =
        "22px Arial";

    ctx.fillText(
        "SCORE  " + score,
        canvas.width / 2,
        235
    );

    ctx.font =
        "17px Arial";

    ctx.fillStyle =
        "#c98cff";

    ctx.fillText(
        "TAP TO PLAY AGAIN",
        canvas.width / 2,
        275
    );

    ctx.textAlign = "left";
}

// =========================
// TAP AFTER WIN
// =========================

canvas.addEventListener("touchstart", (e) => {

    if (gameOver || won) {
        e.preventDefault();
        restart();
    }
});

canvas.addEventListener("click", () => {

    if (gameOver || won) {
        restart();
    }
});

// =========================
// DRAW
// =========================

function draw() {

    drawBackground();

    drawPlatforms();

    drawSpikes();

    drawGoal();

    drawStickman();

    drawScore();

    drawGameOver();

    drawWin();
}

// =========================
// GAME LOOP
// =========================

function gameLoop() {

    update();

    draw();

    requestAnimationFrame(gameLoop);
}

gameLoop();
