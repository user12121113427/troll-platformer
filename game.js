const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 450;

const player = {
    x: 100,
    y: 100,
    width: 30,
    height: 30,
    speed: 5,
    velocityY: 0,
    jumping: false
};

const keys = {};

document.addEventListener("keydown", (event) => {
    keys[event.key] = true;
});

document.addEventListener("keyup", (event) => {
    keys[event.key] = false;
});

function update() {

    // Move left
    if (keys["ArrowLeft"] || keys["a"]) {
        player.x -= player.speed;
    }

    // Move right
    if (keys["ArrowRight"] || keys["d"]) {
        player.x += player.speed;
    }

    // Jump
    if (
        (keys["ArrowUp"] || keys["w"] || keys[" "]) &&
        !player.jumping
    ) {
        player.velocityY = -12;
        player.jumping = true;
    }

    // Gravity
    player.velocityY += 0.5;
    player.y += player.velocityY;

    // Ground
    if (player.y + player.height >= 400) {
        player.y = 400 - player.height;
        player.velocityY = 0;
        player.jumping = false;
    }
}

function draw() {

    // Background
    ctx.fillStyle = "#24152e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ground
    ctx.fillStyle = "#35e06f";
    ctx.fillRect(0, 400, canvas.width, 50);

    // Player
    ctx.fillStyle = "#ff4fd8";
    ctx.fillRect(
        player.x,
        player.y,
        player.width,
        player.height
    );
}

function gameLoop() {
    update();
    draw();

    requestAnimationFrame(gameLoop);
}

gameLoop();
