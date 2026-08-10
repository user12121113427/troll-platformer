const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 450;

// ==================================================
// GAME STATE
// ==================================================

let round = 1;
let score = 0;
let bestScore = 0;

let gameOver = false;
let roundComplete = false;

let cameraX = 0;

// ==================================================
// PLAYER
// ==================================================

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

// ==================================================
// LEVEL DATA
// ==================================================

let platforms = [];
let spikes = [];

let goal = {
    x: 0,
    y: 0,
    width: 45,
    height: 80
};

// ==================================================
// MOBILE CONTROLS
// ==================================================

const leftButton = document.getElementById("left");
const rightButton = document.getElementById("right");
const jumpButton = document.getElementById("jump");

function holdButton(button, down, up) {

    if (!button) return;

    button.addEventListener("touchstart", function(e) {
        e.preventDefault();
        down();
    });

    button.addEventListener("touchend", function(e) {
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
    function() {
        keys.left = true;
    },
    function() {
        keys.left = false;
    }
);

holdButton(
    rightButton,
    function() {
        keys.right = true;
    },
    function() {
        keys.right = false;
    }
);

if (jumpButton) {

    jumpButton.addEventListener("touchstart", function(e) {

        e.preventDefault();

        if (gameOver) {
            restartRound();
        } else if (roundComplete) {
            nextRound();
        } else {
            jump();
        }
    });

    jumpButton.addEventListener("mousedown", function() {

        if (gameOver) {
            restartRound();
        } else if (roundComplete) {
            nextRound();
        } else {
            jump();
        }
    });
}

// ==================================================
// KEYBOARD
// ==================================================

document.addEventListener("keydown", function(e) {

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

        e.preventDefault();

        if (gameOver) {
            restartRound();
        } else if (roundComplete) {
            nextRound();
        } else {
            jump();
        }
    }

    if (e.key.toLowerCase() === "r") {

        if (gameOver) {
            restartRound();
        }
    }
});

document.addEventListener("keyup", function(e) {

    if (e.key === "ArrowLeft" || e.key === "a") {
        keys.left = false;
    }

    if (e.key === "ArrowRight" || e.key === "d") {
        keys.right = false;
    }
});

// ==================================================
// TAP SCREEN TO REVIVE / NEXT ROUND
// ==================================================

canvas.addEventListener("touchstart", function(e) {

    if (gameOver) {

        e.preventDefault();
        restartRound();

    } else if (roundComplete) {

        e.preventDefault();
        nextRound();
    }
});

canvas.addEventListener("click", function() {

    if (gameOver) {

        restartRound();

    } else if (roundComplete) {

        nextRound();
    }
});

// ==================================================
// JUMP
// ==================================================

function jump() {

    if (
        !player.jumping &&
        !gameOver &&
        !roundComplete
    ) {

        player.velocityY = jumpPower;
        player.jumping = true;
    }
}

// ==================================================
// CREATE ROUND
// ==================================================

function createRound() {

    platforms = [];
    spikes = [];

    // ----------------------------------------------
    // Difficulty
    // ----------------------------------------------

    const difficulty = round;

    const gapSize =
        Math.min(100 + difficulty * 5, 160);

    const platformSize =
        Math.max(300 - difficulty * 8, 170);

    const spikeChance =
        Math.min(0.25 + difficulty * 0.04, 0.7);

    // ----------------------------------------------
    // Starting platform
    // ----------------------------------------------

    platforms.push({
        x: 0,
        y: 380,
        width: 500,
        height: 70
    });

    let currentX = 500;

    // ----------------------------------------------
    // Generate platforms
    // ----------------------------------------------

    const numberOfPlatforms =
        7 + difficulty * 2;

    for (
        let i = 0;
        i < numberOfPlatforms;
        i++
    ) {

        // Gap

        const gap =
            gapSize +
            Math.random() * 50;

        currentX += gap;

        // Platform

        const width =
            platformSize +
            Math.random() * 100;

        const raisedChance =
            Math.min(0.15 + difficulty * 0.03, 0.55);

        let platformY = 380;

        if (Math.random() < raisedChance) {

            platformY =
                300 +
                Math.random() * 60;
        }

        platforms.push({

            x: currentX,

            y: platformY,

            width: width,

            height: 70
        });

        // ------------------------------------------
        // Spikes
        // ------------------------------------------

        if (
            Math.random() < spikeChance &&
            width > 190
        ) {

            const spikeCount =
                difficulty >= 4
                    ? 2
                    : 1;

            for (
                let s = 0;
                s < spikeCount;
                s++
            ) {

                spikes.push({

                    x:
                        currentX +
                        80 +
                        s * 55,

                    y:
                        platformY - 20,

                    width: 40,

                    height: 20
                });
            }
        }

        currentX += width;
    }

    // ----------------------------------------------
    // Final platform
    // ----------------------------------------------

    currentX += gapSize;

    platforms.push({

        x: currentX,

        y: 380,

        width: 500,

        height: 70
    });

    // ----------------------------------------------
    // Goal
    // ----------------------------------------------

    goal = {

        x: currentX + 400,

        y: 300,

        width: 45,

        height: 80
    };
}

// ==================================================
// COLLISION
// ==================================================

function collision(a, b) {

    return (

        a.x < b.x + b.width &&

        a.x + a.width > b.x &&

        a.y < b.y + b.height &&

        a.y + a.height > b.y
    );
}

// ==================================================
// UPDATE
// ==================================================

function update() {

    if (
        gameOver ||
        roundComplete
    ) {
        return;
    }

    let walking = false;

    // ----------------------------------------------
    // Movement
    // ----------------------------------------------

    if (keys.left) {

        player.x -= player.speed;

        walking = true;
    }

    if (keys.right) {

        player.x += player.speed;

        walking = true;
    }

    // ----------------------------------------------
    // Walking animation
    // ----------------------------------------------

    if (walking) {

        player.walkTime += 0.2;

    } else {

        player.walkTime = 0;
    }

    // ----------------------------------------------
    // Gravity
    // ----------------------------------------------

    player.velocityY += gravity;

    player.y += player.velocityY;

    player.jumping = true;

    // ----------------------------------------------
    // Platform collision
    // ----------------------------------------------

    for (const platform of platforms) {

        const bottom =
            player.y + player.height;

        if (

            player.x + player.width >
                platform.x &&

            player.x <
                platform.x + platform.width &&

            bottom >= platform.y &&

            bottom <=
                platform.y + 25 &&

            player.velocityY >= 0

        ) {

            player.y =
                platform.y - player.height;

            player.velocityY = 0;

            player.jumping = false;
        }
    }

    // ----------------------------------------------
    // Spike collision
    // ----------------------------------------------

    for (const spike of spikes) {

        if (collision(player, spike)) {

            die();

            return;
        }
    }

    // ----------------------------------------------
    // Fall into gap
    // ----------------------------------------------

    if (player.y > 520) {

        die();

        return;
    }

    // ----------------------------------------------
    // Goal
    // ----------------------------------------------

    if (collision(player, goal)) {

        finishRound();

        return;
    }

    // ----------------------------------------------
    // Camera
    // ----------------------------------------------

    cameraX =
        player.x - 180;

    if (cameraX < 0) {

        cameraX = 0;
    }

    // ----------------------------------------------
    // Score
    // ----------------------------------------------

    score =
        Math.max(
            score,
            Math.floor(
                player.x / 10
            )
        );

    if (score > bestScore) {

        bestScore = score;
    }
}

// ==================================================
// DIE
// ==================================================

function die() {

    gameOver = true;

    if (score > bestScore) {

        bestScore = score;
    }
}

// ==================================================
// RESTART CURRENT ROUND
// ==================================================

function restartRound() {

    player.x = 70;
    player.y = 335;

    player.velocityY = 0;

    player.jumping = false;

    player.walkTime = 0;

    cameraX = 0;

    gameOver = false;

    roundComplete = false;

    // Keep score, but give a small penalty

    score =
        Math.max(
            0,
            score - 10
        );
}

// ==================================================
// FINISH ROUND
// ==================================================

function finishRound() {

    roundComplete = true;

    if (score > bestScore) {

        bestScore = score;
    }
}

// ==================================================
// NEXT ROUND
// ==================================================

function nextRound() {

    round++;

    roundComplete = false;

    gameOver = false;

    player.x = 70;
    player.y = 335;

    player.velocityY = 0;

    player.jumping = false;

    player.walkTime = 0;

    cameraX = 0;

    // Increase movement speed

    player.speed =
        Math.min(
            4 + round * 0.25,
            7
        );

    createRound();
}

// ==================================================
// GOTH BACKGROUND
// ==================================================

function drawBackground() {

    const time =
        Date.now() / 2000;

    // ----------------------------------------------
    // Background gradient
    // ----------------------------------------------

    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            canvas.height
        );

    const hueShift =
        (round - 1) * 8;

    gradient.addColorStop(
        0,
        `hsl(${275 + hueShift}, 50%, 6%)`
    );

    gradient.addColorStop(
        0.5,
        `hsl(${285 + hueShift}, 55%, 12%)`
    );

    gradient.addColorStop(
        1,
        `hsl(${260 + hueShift}, 50%, 4%)`
    );

    ctx.fillStyle = gradient;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    // ----------------------------------------------
    // Moon
    // ----------------------------------------------

    const moonX = 650;
    const moonY = 90;

    ctx.shadowColor =
        "#d9b3ff";

    ctx.shadowBlur = 25;

    ctx.fillStyle =
        "#eee2ff";

    ctx.beginPath();

    ctx.arc(
        moonX,
        moonY,
        43,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.shadowBlur = 0;

    // Moon shadow

    ctx.fillStyle =
        `hsl(${275 + hueShift}, 50%, 8%)`;

    ctx.beginPath();

    ctx.arc(
        moonX + 16,
        moonY - 10,
        40,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // ----------------------------------------------
    // Stars
    // ----------------------------------------------

    for (let i = 0; i < 55; i++) {

        const x =
            (i * 137) %
            canvas.width;

        const y =
            20 +
            ((i * 71) % 230);

        const twinkle =
            0.4 +
            Math.sin(
                time * 3 + i
            ) * 0.4;

        ctx.fillStyle =
            `rgba(255,255,255,${twinkle})`;

        ctx.fillRect(
            x,
            y,
            2,
            2
        );
    }

    // ----------------------------------------------
    // Gothic buildings
    // ----------------------------------------------

    ctx.fillStyle =
        "#08040d";

    for (let i = 0; i < 14; i++) {

        const x =
            i * 75 -
            (
                cameraX * 0.15 %
                75
            );

        const height =
            60 +
            ((i * 47) % 100);

        ctx.fillRect(
            x,
            380 - height,
            60,
            height
        );

        // Tower

        ctx.beginPath();

        ctx.moveTo(
            x + 30,
            380 - height - 45
        );

        ctx.lineTo(
            x + 8,
            380 - height
        );

        ctx.lineTo(
            x + 52,
            380 - height
        );

        ctx.closePath();

        ctx.fill();

        // Window

        ctx.fillStyle =
            "rgba(190,100,255,0.35)";

        ctx.fillRect(
            x + 25,
            390 - height,
            8,
            16
        );

        ctx.fillStyle =
            "#08040d";
    }

    // ----------------------------------------------
    // Gothic crosses
    // ----------------------------------------------

    for (let i = 0; i < 5; i++) {

        const x =
            i * 190 -
            (
                cameraX * 0.12 %
                190
            );

        const y = 260;

        ctx.fillStyle =
            "rgba(180,100,230,0.25)";

        ctx.fillRect(
            x,
            y,
            7,
            45
        );

        ctx.fillRect(
            x - 12,
            y + 10,
            31,
            7
        );
    }
}

// ==================================================
// DRAW PLATFORMS
// ==================================================

function drawPlatforms() {

    for (const platform of platforms) {

        const x =
            platform.x - cameraX;

        // Platform

        ctx.fillStyle =
            "#100d14";

        ctx.fillRect(
            x,
            platform.y,
            platform.width,
            platform.height
        );

        // Neon top

        ctx.fillStyle =
            "#b84cff";

        ctx.fillRect(
            x,
            platform.y,
            platform.width,
            4
        );

        // Gothic decorations

        ctx.fillStyle =
            "#382043";

        for (
            let d = x + 20;
            d < x + platform.width - 10;
            d += 55
        ) {

            ctx.beginPath();

            ctx.moveTo(
                d,
                platform.y + 15
            );

            ctx.lineTo(
                d + 9,
                platform.y + 32
            );

            ctx.lineTo(
                d + 18,
                platform.y + 15
            );

            ctx.closePath();

            ctx.fill();
        }
    }
}

// ==================================================
// DRAW SPIKES
// ==================================================

function drawSpikes() {

    for (const spike of spikes) {

        const x =
            spike.x - cameraX;

        ctx.shadowColor =
            "#ff176f";

        ctx.shadowBlur = 10;

        ctx.fillStyle =
            "#ff176f";

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

        ctx.shadowBlur = 0;
    }
}

// ==================================================
// DRAW GOAL
// ==================================================

function drawGoal() {

    const x =
        goal.x - cameraX;

    ctx.fillStyle =
        "#181018";

    ctx.fillRect(
        x,
        goal.y,
        6,
        goal.height
    );

    ctx.shadowColor =
        "#d75cff";

    ctx.shadowBlur = 15;

    ctx.fillStyle =
        "#d75cff";

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

    ctx.shadowBlur = 0;
}

// ==================================================
// DRAW STICKMAN
// ==================================================

function drawStickman() {

    const x =
        player.x -
        cameraX +
        12;

    const y =
        player.y;

    const walking =
        keys.left ||
        keys.right;

    const legMovement =
        walking
            ? Math.sin(
                player.walkTime
            ) * 9
            : 0;

    const armMovement =
        walking
            ? Math.sin(
                player.walkTime
            ) * 7
            : 0;

    ctx.shadowColor =
        "#d75cff";

    ctx.shadowBlur = 12;

    ctx.strokeStyle =
        "#ffffff";

    ctx.lineWidth = 5;

    ctx.lineCap =
        "round";

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

    
