const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 900;
canvas.height = 500;


// ==============================
// GAME
// ==============================

let level = 1;
let hearts = 3;

let gameOver = false;
let levelComplete = false;


// ==============================
// KEYS
// ==============================

const keys = {};

document.addEventListener("keydown", e => {
    keys[e.key] = true;

    if (
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight" ||
        e.key === "ArrowUp" ||
        e.key === " "
    ) {
        e.preventDefault();
    }
});

document.addEventListener("keyup", e => {
    keys[e.key] = false;
});


// ==============================
// PLAYER
// ==============================

const player = {
    x: 100,
    y: 385,

    width: 28,
    height: 55,

    speed: 5,

    velocityY: 0,

    jumping: false,

    walking: false,
    walkTime: 0,

    direction: 1
};


// ==============================
// PHYSICS
// ==============================

const gravity = 0.6;
const jumpPower = -12;


// ==============================
// PLATFORM
// ==============================

const platform = {
    x: 0,
    y: 440,

    width: 900,
    height: 60
};


// ==============================
// LEVEL DATA
// ==============================

const levelData = {

    1: {
        finishX: 820,

        spikes: [
            {
                x: 450,
                y: 415,
                width: 60,
                height: 25
            }
        ]
    },

    2: {
        finishX: 820,

        spikes: [
            {
                x: 300,
                y: 415,
                width: 60,
                height: 25
            },
            {
                x: 500,
                y: 415,
                width: 60,
                height: 25
            },
            {
                x: 700,
                y: 415,
                width: 60,
                height: 25
            }
        ]
    },

    3: {
        finishX: 820,

        spikes: [
            {
                x: 250,
                y: 415,
                width: 60,
                height: 25
            },
            {
                x: 390,
                y: 415,
                width: 75,
                height: 25
            },
            {
                x: 550,
                y: 415,
                width: 60,
                height: 25
            },
            {
                x: 700,
                y: 415,
                width: 80,
                height: 25
            }
        ]
    }
};


let spikes = [];

function loadLevel() {

    spikes =
        levelData[level].spikes.map(
            spike => ({ ...spike })
        );

}


// ==============================
// RESET PLAYER
// ==============================

function resetPlayer() {

    player.x = 100;
    player.y = 385;

    player.velocityY = 0;

    player.jumping = false;

    player.walking = false;
    player.walkTime = 0;

    player.direction = 1;
}


// ==============================
// START
// ==============================

loadLevel();
resetPlayer();


// ==============================
// UPDATE
// ==============================

function updatePlayer() {

    if (gameOver) return;
    if (levelComplete) return;


    player.walking = false;


    // MOVE LEFT

    if (keys["ArrowLeft"]) {

        player.x -= player.speed;

        player.walking = true;

        player.direction = -1;
    }


    // MOVE RIGHT

    if (keys["ArrowRight"]) {

        player.x += player.speed;

        player.walking = true;

        player.direction = 1;
    }


    // WALKING ANIMATION

    if (
        player.walking &&
        !player.jumping
    ) {

        player.walkTime += 0.25;
    }


    // JUMP

    if (
        keys["ArrowUp"] &&
        !player.jumping
    ) {

        player.velocityY =
            jumpPower;

        player.jumping = true;
    }


    // GRAVITY

    player.velocityY += gravity;

    player.y += player.velocityY;


    // PLATFORM

    if (
        player.y + player.height >= platform.y &&
        player.x + player.width > platform.x &&
        player.x < platform.x + platform.width &&
        player.velocityY >= 0
    ) {

        player.y =
            platform.y -
            player.height;

        player.velocityY = 0;

        player.jumping = false;
    }


    // SCREEN LIMIT

    if (player.x < 0) {
        player.x = 0;
    }

    if (
        player.x >
        canvas.width - player.width
    ) {

        player.x =
            canvas.width -
            player.width;
    }
                }
// ==============================
// DRAW PLATFORM
// ==============================

function drawPlatform() {

    ctx.fillStyle = "#15121d";

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


// ==============================
// DRAW STICKMAN
// ==============================

function drawPlayer() {

    const x =
        player.x +
        player.width / 2;

    const y = player.y;

    ctx.save();

    ctx.translate(x, y);

    ctx.scale(
        player.direction,
        1
    );

    ctx.strokeStyle = "#ffffff";

    ctx.lineWidth = 5;

    ctx.lineCap = "round";


    let legMove = 0;
    let armMove = 0;


    if (
        player.walking &&
        !player.jumping
    ) {

        legMove =
            Math.sin(
                player.walkTime
            ) * 8;

        armMove =
            Math.sin(
                player.walkTime
            ) * 6;
    }


    // HEAD

    ctx.beginPath();

    ctx.arc(
        0,
        10,
        10,
        0,
        Math.PI * 2
    );

    ctx.stroke();


    // BODY

    ctx.beginPath();

    ctx.moveTo(0, 20);

    ctx.lineTo(0, 40);

    ctx.stroke();


    // ARMS

    ctx.beginPath();

    ctx.moveTo(0, 25);

    ctx.lineTo(
        -14,
        35 - armMove
    );

    ctx.moveTo(0, 25);

    ctx.lineTo(
        14,
        35 + armMove
    );

    ctx.stroke();


    // LEGS

    ctx.beginPath();

    ctx.moveTo(0, 40);

    ctx.lineTo(
        -11 - legMove,
        50
    );

    ctx.moveTo(0, 40);

    ctx.lineTo(
        11 + legMove,
        50
    );

    ctx.stroke();


    ctx.restore();
}


// ==============================
// DRAW
// ==============================

function draw() {

    // Temporary background

    ctx.fillStyle = "#09000f";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    drawPlatform();

    drawPlayer();
}


// ==============================
// GAME LOOP
// ==============================

function gameLoop() {

    updatePlayer();

    draw();

    requestAnimationFrame(
        gameLoop
    );
}


// ==============================
// START GAME
// ==============================

gameLoop();
