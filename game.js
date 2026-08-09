const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 450;

let player = {
    x: 100,
    y: 300,
    width: 30,
    height: 30
};

function gameLoop() {
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#ff4fd8";
    ctx.fillRect(
        player.x,
        player.y,
        player.width,
        player.height
    );

    requestAnimationFrame(gameLoop);
}

gameLoop();
