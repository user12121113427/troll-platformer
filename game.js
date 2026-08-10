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

// =========================
// KEYBOARD
// =========================

document.addEventListener("keydown", (e) => {

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
        jump();
    }

    if (e.key.toLowerCase() === "r" && gameOver) {
        restart();
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
    jump();
});

jumpButton.addEventListener("mousedown", jump);

// =========================
// JUMP
// =========================

function jump() {

    if (!player.jumping && !gameOver) {

        player.velocityY = jumpPower;
        player.jumping = true;
    }
}

// =========================
// LEVEL
// =========================

const platforms = [

    // Starting platform
    {
        x: 0,
        y: 380,
        width: 450,
        height: 70
    },

    // Platform after first gap
    {
        x: 550,
        y: 380,
        width: 300,
        height: 70
    },

    // Raised platform
    {
        x: 950,
        y: 320,
        width: 220,
        height: 30
    },

    // Long platform
    {
        x: 1250,
        y: 380,
        width: 400,
        height: 70
    },

    // Small platform
    {
        x: 1750,
        y: 330,
        width: 220,
        height: 30
    },

    // Final platform
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

    if (gameOver) {
        return;
    }

    let walking = false;

    // Movement
    if (keys.left) {

        player.x -= player.speed;
        walking = true;
    }

    if (keys.right) {

        player.x += player.speed;
        walking = true;
    }

    // Walking animation
    if (walking) {
        player.walkTime += 0.2;
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

    // Spike collision
    for (const spike of spikes) {

        if (collision(player, spike)) {

            die();
        }
    }

    // Fall into gaps
    if (player.y > 500) {

        die();
    }

    // Goal
    if (collision(player, goal)) {

        alert("LEVEL COMPLETE!");
        restart();
    }

    // Camera
    cameraX = player.x - 180;

    if (cameraX < 0) {
        cameraX = 0;
    }
}

// =========================
// DEATH
// =========================

function die() {

    gameOver = true;
}

// =========================
// RESTART
// =========================

function restart() {

    player.x = 70;
    player.y = 335;

    player.velocityY = 0;
    player.jumping = false;

    cameraX = 0;

    gameOver = false;
}

// =========================
// BACKGROUND
// =========================

function drawBackground() {

    const time = Date.now() / 1500;

    const r =
        Math.floor(120 + Math.sin(time) * 80);

    const g =
        Math.floor(100 + Math.sin(time + 2) * 70);

    const b =
        Math.floor(180 + Math.sin(time + 4) * 70);

    ctx.fillStyle =
        `rgb(${r}, ${g}, ${b})`;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    // Decorative circles
    for (let i = 0; i < 10; i++) {

        const x =
            i * 120 -
            (cameraX * 0.2 % 120);

        const y =
            80 +
            Math.sin(time + i) * 35;

        ctx.fillStyle =
            "rgba(255,255,255,0.12)";

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            35,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }
}

// =========================
// PLATFORMS
// =========================

function drawPlatforms() {

    for (const platform of platforms) {

        const x =
            platform.x - cameraX;

        ctx.fillStyle = "#181818";

        ctx.fillRect(
            x,
            platform.y,
            platform.width,
            platform.height
        );

        ctx.fillStyle = "#ffffff";

        ctx.fillRect(
            x,
            platform.y,
            platform.width,
            4
        );
    }
}

// =========================
// SPIKES
// =========================

function drawSpikes() {

    for (const spike of spikes) {

        const x =
            spike.x - cameraX;

        ctx.fillStyle = "#ff1744";

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
    }
}

// =========================
// GOAL
// =========================

function drawGoal() {

    const x =
        goal.x - cameraX;

    ctx.fillStyle = "#222";

    ctx.fillRect(
        x,
        goal.y,
        6,
        goal.height
    );

    ctx.fillStyle = "#00ff88";

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

    const legMovement =
        Math.sin(player.walkTime) * 9;

    const armMovement =
        Math.sin(player.walkTime) * 7;

    ctx.strokeStyle = "white";

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
}

// =========================
// GAME OVER SCREEN
// =========================

function drawGameOver() {

    if (!gameOver) {
        return;
    }

    ctx.fillStyle =
        "rgba(0,0,0,0.7)";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.fillStyle = "white";

    ctx.font =
        "bold 48px Arial";

    ctx.textAlign = "center";

    ctx.fillText(
        "YOU DIED",
        canvas.width / 2,
        190
    );

    ctx.font =
        "20px Arial";

    ctx.fillText(
        "Tap the jump button to restart",
        canvas.width / 2,
        235
    );

    ctx.textAlign = "left";
}

// =========================
// DRAW
// =========================

function draw() {

    drawBackground();

    drawPlatforms();

    drawSpikes();

    drawGoal();

    drawStickman();

    drawGameOver();
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
