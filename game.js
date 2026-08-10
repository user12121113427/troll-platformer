alert("NEW GAME.JS");
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 900;
canvas.height = 500;


// =============================
// GAME
// =============================

let hearts = 3;
let gameOver = false;

let invincible = false;
let invincibleTimer = 0;


// =============================
// KEYS
// =============================

const keys = {};


// =============================
// PLAYER
// =============================

const player = {

    x: 100,
    y: 350,

    width: 28,
    height: 55,

    speed: 5,

    velocityY: 0,

    jumping: false,

    // Walking animation
    walking: false,
    walkTime: 0,

    // Direction
    direction: 1
};


// =============================
// PHYSICS
// =============================

const gravity = 0.6;
const jumpPower = -12;


// =============================
// PLATFORM
// =============================

const platform = {

    x: 0,
    y: 440,

    width: 900,
    height: 60

};


// =============================
// SPIKES
// =============================

const spikes = [

    {
        x: 450,
        y: 415,
        width: 60,
        height: 25
    },

    {
        x: 650,
        y: 415,
        width: 60,
        height: 25
    }

];


// =============================
// KEYBOARD
// =============================

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


// =============================
// MOBILE BUTTONS
// =============================

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


// LEFT

setupButton(
    "left",
    "ArrowLeft"
);


// RIGHT

setupButton(
    "right",
    "ArrowRight"
);


// JUMP

setupButton(
    "jump",
    "ArrowUp"
);


// =============================
// TAP TO REVIVE
// =============================

canvas.addEventListener(
    "click",
    function() {

        if (gameOver) {

            restartGame();

        }

    }
);


// =============================
// RESTART
// =============================

function restartGame() {

    hearts = 3;

    gameOver = false;

    player.x = 100;
    player.y = 350;

    player.velocityY = 0;

    player.jumping = false;

    player.walking = false;

    player.walkTime = 0;

    player.direction = 1;

    invincible = false;

    invincibleTimer = 0;

}


// =============================
// LOSE HEART
// =============================

function loseHeart() {

    if (gameOver) return;

    if (invincible) return;


    hearts--;


    if (hearts <= 0) {

        hearts = 0;

        gameOver = true;

        return;

    }


    // Respawn

    player.x = 100;

    player.y = 350;

    player.velocityY = 0;

    player.jumping = false;

    player.walking = false;


    // Temporary protection

    invincible = true;

    invincibleTimer = 90;

}


// =============================
// UPDATE PLAYER
// =============================

function updatePlayer() {

    if (gameOver) return;


    // Reset walking

    player.walking = false;


    // =========================
    // MOVE LEFT
    // =========================

    if (
        keys["ArrowLeft"] ||
        keys["a"]
    ) {

        player.x -= player.speed;

        player.walking = true;

        player.direction = -1;

    }


    // =========================
    // MOVE RIGHT
    // =========================

    if (
        keys["ArrowRight"] ||
        keys["d"]
    ) {

        player.x += player.speed;

        player.walking = true;

        player.direction = 1;

    }


    // =========================
    // JUMP
    // =========================

    if (
        (
            keys["ArrowUp"] ||
            keys["w"] ||
            keys[" "]
        )
        &&
        !player.jumping
    ) {

        player.velocityY = jumpPower;

        player.jumping = true;

    }


    // =========================
    // WALK ANIMATION
    // =========================

    if (
        player.walking &&
        !player.jumping
    ) {

        player.walkTime += 0.25;

    }


    // =========================
    // GRAVITY
    // =========================

    player.velocityY += gravity;

    player.y += player.velocityY;


    // =========================
    // PLATFORM
    // =========================

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


    // =========================
    // SPIKES
    // =========================

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


    // =========================
    // FALLING
    // =========================

    if (
        player.y >
        canvas.height + 100
    ) {

        loseHeart();

    }


    // =========================
    // SCREEN LIMITS
    // =========================

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


    // =========================
    // INVINCIBILITY
    // =========================

    if (invincible) {

        invincibleTimer--;

        if (invincibleTimer <= 0) {

            invincible = false;

        }

    }

}


// =============================
// BACKGROUND
// =============================

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
            360;


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

}


// =============================
// PLATFORM
// =============================

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


// =============================
// SPIKES
// =============================

function drawSpikes() {

    for (
        let i = 0;
        i < spikes.length;
        i++
    ) {

        const spike = spikes[i];


        ctx.fillStyle = "#ff1744";


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


// =============================
// STICKMAN
// =============================

function drawPlayer() {

    // Blink while invincible

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


    // Face movement direction

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


    // =========================
    // WALKING MOTION
    // =========================

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


    // =========================
    // HEAD
    // =========================

    ctx.beginPath();

    ctx.arc(
        0,
        10,
        10,
        0,
        Math.PI * 2
    );

    ctx.stroke();


    // =========================
    // BODY
    // =========================

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


    // =========================
    // ARMS
    // =========================

    ctx.beginPath();


    // Back arm

    ctx.moveTo(
        0,
        25
    );

    ctx.lineTo(
        -14,
        35 -
        armMove
    );


    // Front arm

    ctx.moveTo(
        0,
        25
    );

    ctx.lineTo(
        14,
        35 +
        armMove
    );


    ctx.stroke();


    // =========================
    // LEGS
    // =========================

    ctx.beginPath();


    // Back leg

    ctx.moveTo(
        0,
        40
    );

    ctx.lineTo(
        -11 -
        legMove,
        55
    );


    // Front leg

    ctx.moveTo(
        0,
        40
    );

    ctx.lineTo(
        11 +
        legMove,
        55
    );


    ctx.stroke();


    ctx.restore();

}


// =============================
// HEARTS
// =============================

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


// =============================
// GAME OVER
// =============================

function drawGameOver() {

    if (!gameOver) return;


    ctx.fillStyle =
        "rgba(0, 0, 0, 0.88)";


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
        "TAP THE SCREEN TO REVIVE",
        canvas.width / 2,
        270
    );


    ctx.fillStyle =
        "#ff4fae";


    ctx.font =
        "28px Arial";


    ctx.fillText(
        "♡ ♡ ♡",
        canvas.width / 2,
        320
    );


    ctx.textAlign =
        "left";

}


// =============================
// DRAW
// =============================

function draw() {

    drawBackground();

    drawPlatform();

    drawSpikes();

    drawPlayer();

    drawHearts();

    drawGameOver();

}


// =============================
// GAME LOOP
// =============================

function gameLoop() {

    updatePlayer();

    draw();

    requestAnimationFrame(
        gameLoop
    );

}


gameLoop();
