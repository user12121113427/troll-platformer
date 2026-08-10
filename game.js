const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 900;
canvas.height = 500;


// ========================================
// GAME STATE
// ========================================

let level = 1;
let hearts = 3;

let gameOver = false;
let levelComplete = false;

let invincible = false;
let invincibleTimer = 0;


// ========================================
// KEYS
// ========================================

const keys = {};


// ========================================
// PLAYER
// ========================================

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


// ========================================
// PHYSICS
// ========================================

const gravity = 0.6;
const jumpPower = -12;


// ========================================
// PLATFORM
// ========================================

const platform = {

    x: 0,
    y: 440,

    width: 900,
    height: 60

};


// ========================================
// LEVEL DATA
// ========================================

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


// ========================================
// CURRENT LEVEL SPIKES
// ========================================

let spikes = [];


function loadLevel() {

    spikes =
        levelData[level].spikes.map(
            spike => ({
                ...spike
            })
        );

}


// ========================================
// KEYBOARD
// ========================================

document.addEventListener(
    "keydown",
    function(event) {

        keys[event.key] = true;

        if (
            event.key === "ArrowLeft" ||
            event.key === "ArrowRight" ||
            event.key === "ArrowUp" ||
            event.key === " "
        ) {

            event.preventDefault();

        }

    }
);


document.addEventListener(
    "keyup",
    function(event) {

        keys[event.key] = false;

    }
);


// ========================================
// MOBILE BUTTONS
// ========================================

function setupButton(id, key) {

    const button =
        document.getElementById(id);

    if (!button) return;


    function press(event) {

        event.preventDefault();

        keys[key] = true;

    }


    function release(event) {

        event.preventDefault();

        keys[key] = false;

    }


    button.addEventListener(
        "touchstart",
        press,
        { passive: false }
    );

    button.addEventListener(
        "touchend",
        release,
        { passive: false }
    );

    button.addEventListener(
        "touchcancel",
        release,
        { passive: false }
    );


    button.addEventListener(
        "mousedown",
        press
    );

    button.addEventListener(
        "mouseup",
        release
    );

    button.addEventListener(
        "mouseleave",
        release
    );

}


setupButton(
    "left",
    "ArrowLeft"
);

setupButton(
    "right",
    "ArrowRight"
);

setupButton(
    "jump",
    "ArrowUp"
);


// ========================================
// SCREEN TAP
// ========================================

canvas.addEventListener(
    "click",
    function() {

        // Game Over:
        // restart CURRENT level.

        if (gameOver) {

            restartCurrentLevel();

            return;

        }


        // Level complete:
        // continue to next level.

        if (levelComplete) {

            nextLevel();

            return;

        }

    }
);


// ========================================
// RESTART CURRENT LEVEL
// ========================================

function restartCurrentLevel() {

    // Keep the current level.

    hearts = 3;

    gameOver = false;

    levelComplete = false;

    resetPlayer();

    loadLevel();

}


// ========================================
// RESET PLAYER
// ========================================

function resetPlayer() {

    player.x = 100;

    // Correct standing height.

    player.y = 385;

    player.velocityY = 0;

    player.jumping = false;

    player.walking = false;

    player.walkTime = 0;

    player.direction = 1;

    invincible = false;

    invincibleTimer = 0;

}


// ========================================
// NEXT LEVEL
// ========================================

function nextLevel() {

    levelComplete = false;

    level++;


    // After Level 3,
    // restart at Level 1.

    if (level > 3) {

        level = 1;

    }


    hearts = 3;

    resetPlayer();

    loadLevel();

}


// ========================================
// COMPLETE LEVEL
// ========================================

function completeLevel() {

    if (levelComplete) return;

    levelComplete = true;

}


// ========================================
// LOSE HEART
// ========================================

function loseHeart() {

    if (gameOver) return;

    if (levelComplete) return;

    if (invincible) return;


    hearts--;


    if (hearts <= 0) {

        hearts = 0;

        gameOver = true;

        return;

    }


    resetPlayer();

    invincible = true;

    invincibleTimer = 90;

}


// ========================================
// UPDATE PLAYER
// ========================================

function updatePlayer() {

    if (gameOver) return;

    if (levelComplete) return;


    player.walking = false;


    // --------------------------------
    // MOVE LEFT
    // --------------------------------

    if (
        keys["ArrowLeft"] ||
        keys["a"]
    ) {

        player.x -= player.speed;

        player.walking = true;

        player.direction = -1;

    }


    // --------------------------------
    // MOVE RIGHT
    // --------------------------------

    if (
        keys["ArrowRight"] ||
        keys["d"]
    ) {

        player.x += player.speed;

        player.walking = true;

        player.direction = 1;

    }


    // --------------------------------
    // WALK ANIMATION
    // --------------------------------

    if (
        player.walking &&
        !player.jumping
    ) {

        player.walkTime += 0.25;

    }


    // --------------------------------
    // JUMP
    // --------------------------------

    if (
        (
            keys["ArrowUp"] ||
            keys["w"] ||
            keys[" "]
        )
        &&
        !player.jumping
    ) {

        player.velocityY =
            jumpPower;

        player.jumping = true;

    }


    // --------------------------------
    // GRAVITY
    // --------------------------------

    player.velocityY += gravity;

    player.y += player.velocityY;


    // --------------------------------
    // PLATFORM
    // --------------------------------

    if (
        player.y + player.height >=
            platform.y

        &&

        player.x + player.width >
            platform.x

        &&

        player.x <
            platform.x +
            platform.width

        &&

        player.velocityY >= 0
    ) {

        player.y =
            platform.y -
            player.height;

        player.velocityY = 0;

        player.jumping = false;

    }


    // --------------------------------
    // SPIKES
    // --------------------------------

    for (
        let i = 0;
        i < spikes.length;
        i++
    ) {

        const spike = spikes[i];


        if (
            player.x <
                spike.x +
                spike.width

            &&

            player.x +
                player.width >
                spike.x

            &&

            player.y <
                spike.y +
                spike.height

            &&

            player.y +
                player.height >
                spike.y
        ) {

            loseHeart();

        }

    }


    // --------------------------------
    // FALLING
    // --------------------------------

    if (
        player.y >
        canvas.height + 100
    ) {

        loseHeart();

    }


    // --------------------------------
    // SCREEN LIMIT
    // --------------------------------

    if (player.x < 0) {

        player.x = 0;

    }


    if (
        player.x >
        canvas.width -
        player.width
    ) {

        player.x =
            canvas.width -
            player.width;

    }


    // --------------------------------
    // FINISH
    // --------------------------------

    const finishX =
        levelData[level].finishX;


    if (
        player.x + player.width >=
        finishX
    ) {

        completeLevel();

    }


    // --------------------------------
    // INVINCIBILITY
    // --------------------------------

    if (invincible) {

        invincibleTimer--;

        if (invincibleTimer <= 0) {

            invincible = false;

        }

    }

}


// ========================================
// BACKGROUND
// ========================================
function drawBackground() {

    const sky = ctx.createLinearGradient(
        0, 0, 0, canvas.height
    );

    sky.addColorStop(0, "#050008");
    sky.addColorStop(0.6, "#14001d");
    sky.addColorStop(1, "#30003a");

    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    // MOON

    ctx.fillStyle = "#ffd9f5";

    ctx.beginPath();
    ctx.arc(720, 100, 42, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#09000f";

    ctx.beginPath();
    ctx.arc(738, 88, 42, 0, Math.PI * 2);
    ctx.fill();


    // STARS

    for (let i = 0; i < 60; i++) {

        let x = (i * 137) % canvas.width;
        let y = (i * 71) % 320;

        ctx.fillStyle =
            i % 4 === 0 ? "#ff63c3" : "#ffffff";

        ctx.fillRect(x, y, 2, 2);
    }


    // CASTLE

    ctx.fillStyle = "#0b0012";

    ctx.fillRect(120, 300, 230, 140);
    ctx.fillRect(80, 250, 65, 190);
    ctx.fillRect(325, 235, 70, 205);


    // CASTLE ROOFS

    ctx.beginPath();
    ctx.moveTo(75, 250);
    ctx.lineTo(112, 205);
    ctx.lineTo(150, 250);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(320, 235);
    ctx.lineTo(360, 185);
    ctx.lineTo(400, 235);
    ctx.closePath();
    ctx.fill();


    // WINDOWS

    ctx.fillStyle = "#ff3dbb";

    ctx.fillRect(105, 280, 10, 20);
    ctx.fillRect(350, 265, 10, 20);

    ctx.fillRect(180, 330, 12, 18);
    ctx.fillRect(215, 330, 12, 18);
    ctx.fillRect(250, 330, 12, 18);


    // HILLS

    ctx.fillStyle = "#100018";

    ctx.beginPath();

    ctx.moveTo(0, 400);

    ctx.quadraticCurveTo(
        130, 320,
        270, 400
    );

    ctx.quadraticCurveTo(
        420, 310,
        560, 400
    );

    ctx.quadraticCurveTo(
        700, 315,
        900, 395
    );

    ctx.lineTo(900, 440);
    ctx.lineTo(0, 440);

    ctx.closePath();
    ctx.fill();


    // NEON HORIZON

    ctx.fillStyle =
        "rgba(255, 0, 180, 0.12)";

    ctx.fillRect(
        0,
        390,
        canvas.width,
        50
    );


    // LEVEL LABEL

    ctx.fillStyle = "#ff63c3";

    ctx.font = "bold 18px monospace";

    ctx.fillText(
        "LEVEL 1",
        20,
        75
    );

}
