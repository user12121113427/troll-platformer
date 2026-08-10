const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let W = 900;
let H = 500;

canvas.width = W;
canvas.height = H;


// =============================
// GAME STATE
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

    jumping: false
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

document.addEventListener("keydown", function(event) {

    keys[event.key] = true;

    if (
        event.key === "ArrowLeft" ||
        event.key === "ArrowRight" ||
        event.key === "ArrowUp" ||
        event.key === " "
    ) {
        event.preventDefault();
    }

});


document.addEventListener("keyup", function(event) {

    keys[event.key] = false;

});


// =============================
// MOBILE BUTTONS
// =============================

function setupButton(id, key) {

    const button = document.getElementById(id);

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


setupButton("left", "ArrowLeft");
setupButton("right", "ArrowRight");
setupButton("jump", "ArrowUp");


// =============================
// SCREEN TAP
// =============================

canvas.addEventListener("click", function() {

    if (gameOver) {

        restartGame();

    }

});


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


    player.x = 100;
    player.y = 350;

    player.velocityY = 0;

    player.jumping = false;


    invincible = true;

    invincibleTimer = 90;

}


// =============================
// UPDATE PLAYER
// =============================

function updatePlayer() {

    if (gameOver) return;


    // LEFT

    if (
        keys["ArrowLeft"] ||
        keys["a"]
    ) {

        player.x -= player.speed;

    }


    // RIGHT

    if (
        keys["ArrowRight"] ||
        keys["d"]
    ) {

        player.x += player.speed;

    }


    // JUMP

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


    // GRAVITY

    player.velocityY += gravity;

    player.y += player.velocityY;


    // PLATFORM COLLISION

    if (
        player.y + player.height >= platform.y
        &&
        player.x + player.width > platform.x
        &&
        player.x < platform.x + platform.width
        &&
        player.velocityY >= 0
    ) {

        player.y =
            platform.y -
            player.height;

        player.velocityY = 0;

        player.jumping = false;

    }


    // SPIKE COLLISION

    for (
        let i = 0;
        i < spikes.length;
        i++
    ) {

        const spike = spikes[i];


        if (
            player.x <
                spike.x + spike.width
            &&
            player.x + player.width >
                spike.x
            &&
            player.y <
                spike.y + spike.height
            &&
            player.y + player.height >
                spike.y
        ) {

            loseHeart();

        }

    }


    // FALLING

    if (
        player.y >
        canvas.height + 100
    ) {

        loseHeart();

    }


    // KEEP PLAYER ON SCREEN

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


    // INVINCIBILITY TIMER

    if (invincible) {

        invincibleTimer--;

        if (invincibleTimer <= 0) {

            invincible = false;

        }

    }

}


// =============================
// DRAW BACKGROUND
// =============================

function drawBackground() {

    ctx.fillStyle = "#08000d";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // stars

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
// DRAW PLATFORM
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
// DRAW SPIKES
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
            x < spike.x + spike.width;
            x += 15
        ) {

            ctx.beginPath();

            ctx.moveTo(
                x,
                spike.y + spike.height
            );

            ctx.lineTo(
                x + 7.5,
                spike.y
            );

            ctx.lineTo(
                x + 15,
                spike.y + spike.height
            );

            ctx.closePath();

            ctx.fill();

        }

    }

}


// =============================
// DRAW PLAYER
// =============================

function drawPlayer() {

    // flashing after hit

    if (
        invincible &&
        Math.floor(invincibleTimer / 6) % 2 === 0
    ) {

        return;

    }


    const centerX =
        player.x +
        player.width / 2;

    const topY =
        player.y;


    ctx.strokeStyle = "#ffffff";

    ctx.lineWidth = 5;

    ctx.lineCap = "round";


    // HEAD

    ctx.beginPath();

    ctx.arc(
        centerX,
        topY + 10,
        10,
        0,
        Math.PI * 2
    );

    ctx.stroke();


    // BODY

    ctx.beginPath();

    ctx.moveTo(
        centerX,
        topY + 20
    );

    ctx.lineTo(
        centerX,
        topY + 40
    );

    ctx.stroke();


    // ARMS

    ctx.beginPath();

    ctx.moveTo(
        centerX,
        topY + 25
    );

    ctx.lineTo(
        centerX - 14,
        topY + 35
    );


    ctx.moveTo(
        centerX,
        topY + 25
    );

    ctx.lineTo(
        centerX + 14,
        topY + 35
    );

    ctx.stroke();


    // LEGS

    ctx.beginPath();

    ctx.moveTo(
        centerX,
        topY + 40
    );

    ctx.lineTo(
        centerX - 11,
        topY + 55
    );


    ctx.moveTo(
        centerX,
        topY + 40
    );

    ctx.lineTo(
        centerX + 11,
        topY + 55
    );

    ctx.stroke();

}


// =============================
// DRAW HEARTS
// =============================

function drawHearts() {

    ctx.font = "30px Arial";

    let heartsText = "";


    for (
        let i = 0;
        i < 3;
        i++
    ) {

        if (i < hearts) {

            heartsText += "♥ ";

        } else {

            heartsText += "♡ ";

        }

    }


    ctx.fillStyle = "#ff4fae";

    ctx.fillText(
        heartsText,
        20,
        38
    );

}


// =============================
// GAME OVER SCREEN
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


    ctx.textAlign = "center";


    ctx.fillStyle = "#ff4fae";

    ctx.font =
        "bold 52px Georgia";


    ctx.fillText(
        "GAME OVER",
        canvas.width / 2,
        210
    );


    ctx.fillStyle = "#ffffff";

    ctx.font =
        "20px monospace";


    ctx.fillText(
        "TAP THE SCREEN TO REVIVE",
        canvas.width / 2,
        270
    );


    ctx.fillStyle = "#ff4fae";

    ctx.font =
        "28px Arial";


    ctx.fillText(
        "♡ ♡ ♡",
        canvas.width / 2,
        320
    );


    ctx.textAlign = "left";

}


// =============================
// DRAW EVERYTHING
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
