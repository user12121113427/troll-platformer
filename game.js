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
