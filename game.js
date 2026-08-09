const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 450;

const player = {
    x: 70,
    y: 330,
    width: 24,
    height: 45,
    speed: 4,
    velocityY: 0,
    jumping: false,
    walking: false,
    direction: 1,
    walkTime: 0
};

const gravity = 0.6;
const jumpPower = -11;

const keys = {};

let gameOver = false;
let won = false;
let cameraX = 0;

// --------------------
// KEYBOARD CONTROLS
// --------------------

document.addEventListener("keydown", (event) => {
    keys[event.key] = true;

    if (
        event.key === " " ||
        event.key === "ArrowUp" ||
        event.key === "w"
    ) {
        event.preventDefault();

        if (!player.jumping && !gameOver && !won) {
            player.velocityY = jumpPower;
            player.jumping = true;
        }
    }

    if (event.key === "r" && gameOver) {
        restart();
    }
});

document.addEventListener("keyup", (event) => {
    keys[event.key] = false;
});

// --------------------
// MOBILE CONTROLS
// --------------------

const controls = document.createElement("div");

controls.innerHTML = `
    <button id="left">←</button>
    <button id="jump">↑</button>
    <button id="right">→</button>
`;

controls.style.position = "fixed";
controls.style.bottom = "15px";
controls.style.left = "0";
controls.style.width = "100%";
controls.style.display = "flex";
controls.style.justifyContent = "space-around";
controls.style.zIndex = "1000";
controls.style.pointerEvents = "none";

document.body.appendChild(controls);

const buttonStyle = `
    width: 70px;
    height: 70px;
    border-radius: 20px;
    border: 2px solid white;
    background: rgba(0,0,0,0.45);
    color: white;
    font-size: 32px;
    touch-action: none;
`;

document.getElementById("left").style.cssText = buttonStyle;
document.getElementById("right").style.cssText = buttonStyle;
document.getElementById("jump").style.cssText = buttonStyle;

document.getElementById("left").style.pointerEvents = "auto";
document.getElementById("right").style.pointerEvents = "auto";
document.getElementById("jump").style.pointerEvents = "auto";

function holdButton(button, key) {
    button.addEventListener("touchstart", (e) => {
        e.preventDefault();
        keys[key] = true;
    });

    button.addEventListener("touchend", (e) => {
        e.preventDefault();
        keys[key] = false;
    });

    button.addEventListener("touchcancel", () => {
        keys[key] = false;
    });
}

holdButton(document.getElementById("left"), "ArrowLeft");
holdButton(document.getElementById("right"), "ArrowRight");

document.getElementById("jump").addEventListener("touchstart", (e) => {
    e.preventDefault();

    if (!player.jumping && !gameOver && !won) {
        player.velocityY = jumpPower;
        player.jumping = true;
    }
});

// --------------------
// LEVEL
// --------------------

const platforms = [
    { x: 0, y: 390, width: 500, height: 60 },
    { x: 580, y: 390, width: 300, height: 60 },
    { x: 950, y: 340, width: 220, height: 30 },
    { x: 1250, y: 390, width: 350, height: 60 },
    { x: 1680, y: 320, width: 250, height: 30 },
    { x: 2050, y: 390, width: 500, height: 60 }
];

const spikes = [
    { x: 350, y: 370, width: 40, height: 20 },
    { x: 430, y: 370, width: 40, height: 20 },
    { x: 760, y: 370, width: 40, height: 20 },
    { x: 1080, y: 320, width: 40, height: 20 },
    { x: 1420, y: 370, width: 40, height: 20 },
    { x: 1780, y: 300, width: 40, height: 20 }
];

const goal = {
    x: 2400,
    y: 310,
    width: 40,
    height: 80
};

// --------------------
// COLLISION
// --------------------

function collision(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

// --------------------
// UPDATE
// --------------------

function update() {

    if (gameOver || won) {
        return;
    }

    player.walking = false;

    // Movement
    if (keys["ArrowLeft"] || keys["a"]) {
        player.x -= player.speed;
        player.direction = -1;
        player.walking = true;
    }

    if (keys["ArrowRight"] || keys["d"]) {
        player.x += player.speed;
        player.direction = 1;
        player.walking = true;
    }

    // Animation
    if (player.walking) {
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

        const playerBottom = player.y + player.height;

        if (
            player.x + player.width > platform.x &&
            player.x < platform.x + platform.width &&
            playerBottom >= platform.y &&
            playerBottom <= platform.y + 20 &&
            player.velocityY >= 0
        ) {
            player.y = platform.y - player.height;
            player.velocityY = 0;
            player.jumping = false;
        }
    }

    // Camera
    cameraX = player.x - 150;

    if (cameraX < 0) {
        cameraX = 0;
    }

    // Spikes
    for (const spike of spikes) {
        if (collision(player, spike)) {
            gameOver = true;
        }
    }

    // Falling
    if (player.y > canvas.height + 100) {
        gameOver = true;
    }

    // Goal
    if (collision(player, goal)) {
        won = true;
    }
}

// --------------------
// DRAW BACKGROUND
// --------------------

function drawBackground() {

    const time = Date.now() / 3000;

    const r = Math.floor(120 + Math.sin(time) * 80);
    const g = Math.floor(100 + Math.sin(time + 2) * 80);
    const b = Math.floor(180 + Math.sin(time + 4) * 70);

    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Background circles
    for (let i = 0; i < 12; i++) {
        const x = i * 100 - (cameraX * 0.2) % 100;
        const y = 80 + Math.sin(time + i) * 40;

        ctx.beginPath();
        ctx.arc(x, y, 35, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.12)";
        ctx.fill();
    }
}

// --------------------
// DRAW PLATFORMS
// --------------------

function drawPlatforms() {

    for (const platform of platforms) {

        const x = platform.x - cameraX;

        ctx.fillStyle = "#222";
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
            5
        );
    }
}

// --------------------
// DRAW SPIKES
// --------------------

function drawSpikes() {

    for (const spike of spikes) {

        const x = spike.x - cameraX;

        ctx.fillStyle = "#ff1744";

        ctx.beginPath();

        ctx.moveTo(x, spike.y + spike.height);
        ctx.lineTo(x + spike.width / 2, spike.y);
        ctx.lineTo(x + spike.width, spike.y + spike.height);

        ctx.closePath();
        ctx.fill();
    }
}

// --------------------
// DRAW STICKMAN
// --------------------

function drawPlayer() {

    const x = player.x - cameraX;
    const y = player.y;

    ctx.save();

    ctx.strokeStyle = "#111";
    ctx.fillStyle = "#111";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";

    // Head
    ctx.beginPath();
    ctx.arc(x + 12, y + 8, 8, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.beginPath();
    ctx.moveTo(x + 12, y + 16);
    ctx.lineTo(x + 12, y + 32);
    ctx.stroke();

    // Arms
    const armMove = player.walking
        ? Math.sin(player.walkTime) * 7
        : 0;

    ctx.beginPath();
    ctx.moveTo(x + 12, y + 20);
    ctx.lineTo(x - 2, y + 28 + armMove);
    ctx.moveTo(x + 12, y + 20);
    ctx.lineTo(x + 26, y + 28 - armMove);
    ctx.stroke();

    // Legs
    const legMove = player.walking
        ? Math.sin(player.walkTime) * 8
        : 0;

    ctx.beginPath();
    ctx.moveTo(x + 12, y + 32);
    ctx.lineTo(x + 3, y + 45 + legMove);
    ctx.moveTo(x + 12, y + 32);
    ctx.lineTo(x + 21, y + 45 - legMove);
    ctx.stroke();

    ctx.restore();
}

// --------------------
// DRAW GOAL
// --------------------

function drawGoal() {

    const x = goal.x - cameraX;

    ctx.fillStyle = "#111";
    ctx.fillRect(x, goal.y, 6, goal.height);

    ctx.fillStyle = "#00ff88";

    ctx.beginPath();
    ctx.moveTo(x + 6, goal.y);
    ctx.lineTo(x + 40, goal.y + 15);
    ctx.lineTo(x + 6, goal.y + 30);
    ctx.closePath();
    ctx.fill();
}

// --------------------
// UI
// --------------------

function drawUI() {

    ctx.fillStyle = "white";
    ctx.font = "20px Arial";

    ctx.fillText("TROLL PLATFORMER", 20, 30);

    if (gameOver) {

        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "45px Arial";
        ctx.fillText("YOU DIED", 285, 200);

        ctx.font = "20px Arial";
        ctx.fillText("Tap R or press R to restart", 270, 240);
    }

    if (won) {

        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#00ff88";
        ctx.font = "45px Arial";
        ctx.fillText("LEVEL COMPLETE!", 235, 200);

        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.fillText("You survived the troll level.", 280, 240);
    }
}

// --------------------
// RESTART
// --------------------

function restart() {

    player.x = 70;
    player.y = 330;
    player.velocityY = 0;
    player.jumping = false;

    cameraX = 0;

    gameOver = false;
    won = false;
}

// --------------------
// GAME LOOP
// --------------------

function gameLoop() {

    update();

    drawBackground();
    drawPlatforms();
    drawSpikes();
    drawGoal();
    drawPlayer();
    drawUI();

    requestAnimationFrame(gameLoop);
}

gameLoop();
