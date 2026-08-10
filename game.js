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
    y: 345,

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

// Moved down slightly so the stickman's
// feet aren't covered by the platform.

const platform = {

    x: 0,
    y: 448,

    width: 900,
    height: 52

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
                y: 423,
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
                y: 423,
                width: 60,
                height: 25
            },

            {
                x: 500,
                y: 423,
                width: 60,
                height: 25
            },

            {
                x: 700,
                y: 423,
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
                y: 423,
                width: 60,
                height: 25
            },

            {
                x: 390,
                y: 423,
                width: 75,
                height: 25
            },

            {
                x: 550,
                y: 423,
                width: 60,
                height: 25
            },

            {
                x: 700,
                y: 423,
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

    // IMPORTANT:
    // Do NOT set level = 1 here.

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

    player.y =
        platform.y -
        player.height;


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

    ctx.fillStyle = "#08000d";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Stars

    for (
        let i = 0;
        i < 60;
        i++
    ) {

        const x =
            (i * 97) %
            canvas.width;

        const y =
            (i * 53) %
            350;


        ctx.fillStyle =
            i % 3 === 0
                ? "#ff4fae"
                : "#ffffff";


        ctx.globalAlpha = 0.4;

        ctx.fillRect(
            x,
            y,
            2,
            2
        );

    }


    ctx.globalAlpha = 1;


    // Level number

    ctx.fillStyle =
        "rgba(255,79,174,0.08)";

    ctx.font =
        "bold 150px Arial";

    ctx.textAlign =
        "center";

    ctx.fillText(
        level,
        canvas.width / 2,
        200
    );

    ctx.textAlign =
        "left";

}


// ========================================
// PLATFORM
// ========================================

function drawPlatform() {

    ctx.fillStyle =
        "#15121d";

    ctx.fillRect(
        platform.x,
        platform.y,
        platform.width,
        platform.height
    );


    ctx.fillStyle =
        "#ff4fae";

    ctx.fillRect(
        platform.x,
        platform.y,
        platform.width,
        5
    );

}


// ========================================
// SPIKES
// ========================================

function drawSpikes() {

    for (
        let i = 0;
        i < spikes.length;
        i++
    ) {

        const spike = spikes[i];


        ctx.fillStyle =
            "#ff1744";


        for (
            let x = spike.x;
            x <
            spike.x +
            spike.width;
            x += 15
        ) {

            ctx.beginPath();

            ctx.moveTo(
                x,
                spike.y +
                spike.height
            );

            ctx.lineTo(
                x + 7.5,
                spike.y
            );

            ctx.lineTo(
                x + 15,
                spike.y +
                spike.height
            );

            ctx.closePath();

            ctx.fill();

        }

    }

}


// ========================================
// FINISH
// ========================================

function drawFinish() {

    const finishX =
        levelData[level].finishX;


    ctx.fillStyle =
        "rgba(255,79,174,0.15)";

    ctx.fillRect(
        finishX - 15,
        100,
        60,
        340
    );


    ctx.strokeStyle =
        "#ff4fae";

    ctx.lineWidth = 5;

    ctx.strokeRect(
        finishX,
        320,
        40,
        120
    );


    ctx.fillStyle =
        "#ff4fae";

    ctx.fillRect(
        finishX - 5,
        315,
        50,
        8
    );


    ctx.fillStyle =
        "#ffffff";

    ctx.font =
        "14px monospace";

    ctx.textAlign =
        "center";

    ctx.fillText(
        "FINISH",
        finishX + 20,
        300
    );

    ctx.textAlign =
        "left";

}


// ========================================
// STICKMAN
// ========================================

function drawPlayer() {

    if (
        invincible &&
        Math.floor(
            invincibleTimer / 6
        ) % 2 === 0
    ) {

        return;

    }


    const centerX =
        player.x +
        player.width / 2;

    const topY =
        player.y;


    ctx.save();


    ctx.translate(
        centerX,
        topY
    );


    ctx.scale(
        player.direction,
        1
    );


    ctx.strokeStyle =
        "#ffffff";

    ctx.lineWidth = 5;

    ctx.lineCap =
        "round";


    let legMove = 0;

    let armMove = 0;


    if (
        player.walking &&
        !player.jumping
    ) {

        legMove =
            Math.sin(
                player.walkTime
            ) * 9;

        armMove =
            Math.sin(
                player.walkTime
            ) * 7;

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

    ctx.moveTo(
        0,
        20
    );

    ctx.lineTo(
        0,
        40
    );

    ctx.stroke();


    // ARMS

    ctx.beginPath();

    ctx.moveTo(
        0,
        25
    );

    ctx.lineTo(
        -14,
        35 - armMove
    );


    ctx.moveTo(
        0,
        25
    );

    ctx.lineTo(
        14,
        35 + armMove
    );

    ctx.stroke();


    // LEGS

    ctx.beginPath();

    ctx.moveTo(
        0,
        40
    );

    ctx.lineTo(
        -11 - legMove,
        55
    );


    ctx.moveTo(
        0,
        40
    );

    ctx.lineTo(
        11 + legMove,
        55
    );

    ctx.stroke();


    ctx.restore();

}


// ========================================
// HEARTS
// ========================================

function drawHearts() {

    ctx.font =
        "30px Arial";


    let text = "";


    for (
        let i = 0;
        i < 3;
        i++
    ) {

        if (i < hearts) {

            text += "♥ ";

        } else {

            text += "♡ ";

        }

    }


    ctx.fillStyle =
        "#ff4fae";


    ctx.fillText(
        text,
        20,
        38
    );

}


// ========================================
// LEVEL COMPLETE
// ========================================

function drawLevelComplete() {

    if (!levelComplete) return;


    ctx.fillStyle =
        "rgba(5,0,8,0.9)";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    ctx.textAlign =
        "center";


    ctx.fillStyle =
        "#ff4fae";

    ctx.font =
        "bold 52px Georgia";

    ctx.fillText(
        "LEVEL COMPLETE",
        canvas.width / 2,
        210
    );


    ctx.fillStyle =
        "#ffffff";

    ctx.font =
        "20px monospace";


    if (level < 3) {

        ctx.fillText(
            "TAP TO CONTINUE",
            canvas.width / 2,
            270
        );

    } else {

        ctx.fillText(
            "TAP TO RESTART",
            canvas.width / 2,
            270
        );

    }


    ctx.textAlign =
        "left";

}


// ========================================
// GAME OVER
// ========================================

function drawGameOver() {

    if (!gameOver) return;


    ctx.fillStyle =
        "rgba(0,0,0,0.9)";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    ctx.textAlign =
        "center";


    ctx.fillStyle =
        "#ff4fae";

    ctx.font =
        "bold 52px Georgia";

    ctx.fillText(
        "GAME OVER",
        canvas.width / 2,
        210
    );


    ctx.fillStyle =
        "#ffffff";

    ctx.font =
        "20px monospace";

    ctx.fillText(
        "TAP TO RETRY LEVEL " + level,
        canvas.width / 2,
        270
    );


    ctx.textAlign =
        "left";

}


// ========================================
// DRAW
// ========================================

function draw() {

    drawBackground();

    drawPlatform();

    drawSpikes();

    drawFinish();

    drawPlayer();

    drawHearts();

    drawLevelComplete();

    drawGameOver();

}


// ========================================
// GAME LOOP
// ========================================

function gameLoop() {

    updatePlayer();

    draw();

    requestAnimationFrame(
        gameLoop
    );

}


// ========================================
// START
// ========================================

loadLevel();

resetPlayer();

gameLoop();
