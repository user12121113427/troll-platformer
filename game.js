const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 450;

const player = {
    x: 100,
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

// -------------------------
// KEYBOARD CONTROLS
// -------------------------

document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" || e.key === "a") {
        keys.left = true;
    }

    if (e.key === "ArrowRight" || e.key === "d") {
        keys.right = true;
    }

    if (e.key === "ArrowUp" || e.key === "w" || e.key === " ") {
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

// -------------------------
// MOBILE BUTTONS
// -------------------------

const leftButton = document.getElementById("left");
const rightButton = document.getElementById("right");
const jumpButton = document.getElementById("jump");

function holdButton(button, actionDown, actionUp) {

    button.addEventListener("touchstart", (e) => {
        e.preventDefault();
        actionDown();
    });

    button.addEventListener("touchend", (e) => {
        e.preventDefault();
        actionUp();
    });

    button.addEventListener("touchcancel", () => {
        actionUp();
    });

    // Also works with mouse
    button.addEventListener("mousedown", actionDown);
    button.addEventListener("mouseup", actionUp);
    button.addEventListener("mouseleave", actionUp);
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

jumpButton.addEventListener("mousedown", () => {
    jump();
});

// -------------------------
// JUMP
// -------------------------

function jump() {

    if (!player.jumping) {
        player.velocityY = jumpPower;
        player.jumping = true;
    }
}

// -------------------------
// UPDATE
// -------------------------

function update() {

    let walking = false;

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
    } else {
        player.walkTime = 0;
    }

    // Gravity
    player.velocityY += gravity;
    player.y += player.velocityY;

    // Ground
    const ground = 380;

    if (player.y + player.height >= ground) {

        player.y = ground - player.height;

        player.velocityY = 0;

        player.jumping = false;
    }

    // Keep player inside level
    if (player.x < 0) {
        player.x = 0;
    }

    if (player.x > canvas.width - player.width) {
        player.x = canvas.width - player.width;
    }
}

// -------------------------
// DRAW STICKMAN
// -------------------------

function drawStickman() {

    const x = player.x + 12;
    const y = player.y;

    const walking =
        keys.left || keys.right;

    const legMovement = walking
        ? Math.sin(player.walkTime) * 9
        : 0;

    const armMovement = walking
        ? Math.sin(player.walkTime) * 7
        : 0;

    ctx.strokeStyle = "white";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";

    // Head
    ctx.beginPath();
    ctx.arc(x, y + 8, 9, 0, Math.PI * 2);
    ctx.stroke();

    // Body
    ctx.beginPath();
    ctx.moveTo(x, y + 17);
    ctx.lineTo(x, y + 32);
    ctx.stroke();

    // Left arm
    ctx.beginPath();
    ctx.moveTo(x, y + 20);
    ctx.lineTo(
        x - 14,
        y + 28 + armMovement
    );
    ctx.stroke();

    // Right arm
    ctx.beginPath();
    ctx.moveTo(x, y + 20);
    ctx.lineTo(
        x + 14,
        y + 28 - armMovement
    );
    ctx.stroke();

    // Left leg
    ctx.beginPath();
    ctx.moveTo(x, y + 32);
    ctx.lineTo(
        x - 9 + legMovement,
        y + 45
    );
    ctx.stroke();

    // Right leg
    ctx.beginPath();
    ctx.moveTo(x, y + 32);
    ctx.lineTo(
        x + 9 - legMovement,
        y + 45
    );
    ctx.stroke();
}

// -------------------------
// DRAW
// -------------------------

function draw() {

    // Colorful background
    const time = Date.now() / 1500;

    const red =
        Math.floor(130 + Math.sin(time) * 80);

    const blue =
        Math.floor(170 + Math.sin(time + 2) * 70);

    const green =
        Math.floor(100 + Math.sin(time + 4) * 60);

    ctx.fillStyle =
        `rgb(${red}, ${green}, ${blue})`;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    // Ground
    ctx.fillStyle = "#171717";

    ctx.fillRect(
        0,
        380,
        canvas.width,
        70
    );

    // Ground line
    ctx.fillStyle = "white";

    ctx.fillRect(
        0,
        380,
        canvas.width,
        4
    );

    // Stickman
    drawStickman();
}

// -------------------------
// GAME LOOP
// -------------------------

function gameLoop() {

    update();
    draw();

    requestAnimationFrame(gameLoop);
}

gameLoop();
