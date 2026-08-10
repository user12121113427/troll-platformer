const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 900;
canvas.height = 500;

const keys = {};

const player = {
    x: 100,
    y: 350,
    width: 28,
    height: 55,
    speed: 5,
    velocityY: 0,
    jumping: false
};

const gravity = 0.6;
const jumpPower = -12;

// ❤️ HEART SYSTEM
let hearts = 3;
let gameOver = false;

const platform = {
    x: 0,
    y: 440,
    width: 900,
    height: 60
};

// 🪤 Simple trap
const trap = {
    x: 500,
    y: 415,
    width: 50,
    height: 25
};


// ============================
// KEYBOARD
// ============================

document.addEventListener("keydown", function(event) {

    keys[event.key] = true;

    if (
        event.key === "ArrowUp" ||
        event.key === "ArrowLeft" ||
        event.key === "ArrowRight" ||
        event.key === " "
    ) {
        event.preventDefault();
    }

});

document.addEventListener("keyup", function(event) {
    keys[event.key] = false;
});


// ============================
// TOUCH / SCREEN REVIVE
// ============================

canvas.addEventListener("click", function() {

    if (gameOver) {
        hearts = 3;
        gameOver = false;

        player.x = 100;
        player.y = 350;
        player.velocityY = 0;
        player.jumping = false;
    }

});


// ============================
// PLAYER
// ============================

function updatePlayer() {

    if (gameOver) return;

    // LEFT
    if (keys["ArrowLeft"] || keys["a"]) {
        player.x -= player.speed;
    }

    // RIGHT
    if (keys["ArrowRight"] || keys["d"]) {
        player.x += player.speed;
    }

    // JUMP
    if (
        (keys["ArrowUp"] || keys["w"] || keys[" "]) &&
        !player.jumping
    ) {

        player.velocityY = jumpPower;
        player.jumping = true;
    }

    // GRAVITY
    player.velocityY += gravity;
    player.y += player.velocityY;


    // PLATFORM COLLISION

    if (
        player.y + player.height >= platform.y &&
        player.x + player.width > platform.x &&
        player.x < platform.x + platform.width &&
        player.velocityY >= 0
    ) {

        player.y = platform.y - player.height;
        player.velocityY = 0;
        player.jumping = false;
    }


    // TRAP COLLISION

    if (
        player.x < trap.x + trap.width &&
        player.x + player.width > trap.x &&
        player.y < trap.y + trap.height &&
        player.y + player.height > trap.y
    ) {

        loseHeart();
    }


    // FALLING OFF SCREEN

    if (player.y > canvas.height + 100) {
        loseHeart();
    }


    // KEEP PLAYER ON MAP

    if (player.x < 0) {
        player.x = 0;
    }

    if (player.x > canvas.width - player.width) {
        player.x = canvas.width - player.width;
    }
}


// ============================
// LOSE HEART
// ============================

function loseHeart() {

    // Prevent losing multiple hearts instantly
    if (gameOver) return;

    hearts--;

    if (hearts <= 0) {

        hearts = 0;
        gameOver = true;

    } else {

        // Respawn player after losing a heart

        player.x = 100;
        player.y = 350;
        player.velocityY = 0;
        player.jumping = false;
    }
}


// ============================
// DRAW PLAYER
// ============================

function drawPlayer() {

    ctx.strokeStyle = "white";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";

    // HEAD

    ctx.beginPath();
    ctx.arc(
        player.x + player.width / 2,
        player.y + 10,
        10,
        0,
        Math.PI * 2
    );
    ctx.stroke();


    // BODY

    ctx.beginPath();

    ctx.moveTo(
        player.x + player.width / 2,
        player.y + 20
    );

    ctx.lineTo(
        player.x + player.width / 2,
        player.y + 40
    );

    ctx.stroke();


    // ARMS

    ctx.beginPath();

    ctx.moveTo(
        player.x + player.width / 2,
        player.y + 25
    );

    ctx.lineTo(
        player.x + 5,
        player.y + 35
    );

    ctx.moveTo(
        player.x + player.width / 2,
        player.y + 25
    );

    ctx.lineTo(
        player.x + player.width - 5,
        player.y + 35
    );

    ctx.stroke();


    // LEGS

    ctx.beginPath();

    ctx.moveTo(
        player.x + player.width / 2,
        player.y + 40
    );

    ctx.lineTo(
        player.x + 5,
        player.y + 55
    );

    ctx.moveTo(
        player.x + player.width / 2,
        player.y + 40
    );

    ctx.lineTo(
        player.x + player.width - 5,
        player.y + 55
    );

    ctx.stroke();
}


// ============================
// DRAW HEARTS
// ============================

function drawHearts() {

    ctx.font = "28px Arial";

    let text = "";

    for (let i = 0; i < 3; i++) {

        if (i < hearts) {
            text += "♥ ";
        } else {
            text += "♡ ";
        }
    }

    ctx.fillStyle = "#ff4fae";

    ctx.fillText(text, 20, 35);
}


// ============================
// DRAW PLATFORM
// ============================

function drawPlatform() {

    ctx.fillStyle = "#15151d";

    ctx.fillRect(
        platform.x,
        platform.y,
        platform.width,
        platform.height
    );

    ctx.fillStyle = "#ff4fae";

    ctx.fillRect(
        platform.x,
        platform.y,
        platform.width,
        5
    );
}


// ============================
// DRAW TRAP
// ============================

function drawTrap() {

    ctx.fillStyle = "#ff1744";

    for (let i = 0; i < 4; i++) {

        const x = trap.x + i * 12;

        ctx.beginPath();

        ctx.moveTo(x, trap.y + trap.height);
        ctx.lineTo(x + 6, trap.y);
        ctx.lineTo(x + 12, trap.y + trap.height);

        ctx.closePath();

        ctx.fill();
    }
}


// ============================
// GAME OVER
// ============================

function drawGameOver() {

    if (!gameOver) return;

    ctx.fillStyle = "rgba(0,0,0,0.85)";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.textAlign = "center";

    ctx.fillStyle = "#ff4fae";

    ctx.font = "bold 50px Georgia";

    ctx.fillText(
        "GAME OVER",
        canvas.width / 2,
        210
    );

    ctx.fillStyle = "white";

    ctx.font = "20px monospace";

    ctx.fillText(
        "TAP THE SCREEN TO REVIVE",
        canvas.width / 2,
        270
    );

    ctx.textAlign = "left";
}


// ============================
// DRAW EVERYTHING
// ============================

function draw() {

    // Background

    ctx.fillStyle = "#08000d";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Simple stars

    ctx.fillStyle = "#ff4fae";

    for (let i = 0; i < 40; i++) {

        const x = (i * 97) % canvas.width;
        const y = (i * 53) % 350;

        ctx.fillRect(x, y, 2, 2);
    }


    drawPlatform();

    drawTrap();

    drawPlayer();

    drawHearts();

    drawGameOver();
}


// ============================
// GAME LOOP
// ============================

function gameLoop() {

    updatePlayer();

    draw();

    requestAnimationFrame(gameLoop);
}

gameLoop();
