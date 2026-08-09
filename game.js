const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 450;

const player = {
    x: 100,
    y: 340,
    speed: 4,
    velocityY: 0,
    jumping: false,
    walking: false,
    direction: 1,
    walkTime: 0
};

const keys = {};

document.addEventListener("keydown", (event) => {
    keys[event.key] = true;
});

document.addEventListener("keyup", (event) => {
    keys[event.key] = false;
});

function update() {
    player.walking = false;

    // Move left
    if (keys["ArrowLeft"] || keys["a"]) {
        player.x -= player.speed;
        player.direction = -1;
        player.walking = true;
    }

    // Move right
    if (keys["ArrowRight"] || keys["d"]) {
        player.x += player.speed;
        player.direction = 1;
        player.walking = true;
    }

    // Walking animation
    if (player.walking) {
        player.walkTime += 0.18;
    } else {
        player.walkTime = 0;
    }

    // Jump
    if (
        (keys["ArrowUp"] || keys["w"] || keys[" "]) &&
        !player.jumping
    ) {
        player.velocityY = -11;
        player.jumping = true;
    }

    // Gravity
    player.velocityY += 0.5;
    player.y += player.velocityY;

    // Ground
    if (player.y >= 340) {
        player.y = 340;
        player.velocityY = 0;
        player.jumping = false;
    }

    // Keep player on screen
    if (player.x < 20) {
        player.x = 20;
    }

    if (player.x > canvas.width - 20) {
        player.x = canvas.width - 20;
    }
}

function drawStickman() {
    const x = player.x;
    const y = player.y;

    // Animation angle
    const legSwing = player.walking
        ? Math.sin(player.walkTime) * 12
        : 0;

    const armSwing = player.walking
        ? Math.sin(player.walkTime) * 10
        : 0;

    ctx.strokeStyle = "#ffffff";
    ctx.fillStyle = "#ffffff";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";

    // Head
    ctx.beginPath();
    ctx.arc(x, y - 35, 12, 0, Math.PI * 2);
    ctx.stroke();

    // Body
    ctx.beginPath();
    ctx.moveTo(x, y - 23);
    ctx.lineTo(x, y + 15);
    ctx.stroke();

    // Arms
    ctx.beginPath();

    ctx.moveTo(x, y - 15);
    ctx.lineTo(
        x - 18 + armSwing,
        y + 3
    );

    ctx.moveTo(x, y - 15);
    ctx.lineTo(
        x + 18 - armSwing,
        y + 3
    );

    ctx.stroke();

    // Legs
    ctx.beginPath();

    ctx.moveTo(x, y + 15);
    ctx.lineTo(
        x - 12 + legSwing,
        y + 40
    );

    ctx.moveTo(x, y + 15);
    ctx.lineTo(
        x + 12 - legSwing,
        y + 40
    );

    ctx.stroke();
}

function draw() {
    // Background
    ctx.fillStyle = "#24152e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ground
    ctx.fillStyle = "#35e06f";
    ctx.fillRect(0, 380, canvas.width, 70);

    // Ground line
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 380, canvas.width, 4);

    // Stickman
    drawStickman();
}

function gameLoop() {
    update();
    draw();

    requestAnimationFrame(gameLoop);
}

gameLoop();    
