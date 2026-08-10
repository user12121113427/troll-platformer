const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 900;
canvas.height = 500;

const W = canvas.width;
const H = canvas.height;

// ======================================================
// GAME STATE
// ======================================================

let state = "menu"; // menu, playing, dead, complete
let level = 1;
let score = 0;
let deaths = 0;
let cameraX = 0;
let animationTime = 0;

let levelLength = 2600;
let goalX = 2400;

const gravity = 0.65;
const jumpPower = -12;

const keys = {};


// ======================================================
// PLAYER
// ======================================================

const player = {
    x: 80,
    y: 350,

    width: 26,
    height: 55,

    speed: 5,
    velocityY: 0,

    jumping: false,
    walking: false,

    direction: 1,
    walkTime: 0
};


// ======================================================
// LEVEL DATA
// ======================================================

let platforms = [];
let traps = [];
let decorations = [];


// ======================================================
// KEYBOARD
// ======================================================

document.addEventListener("keydown", function(e) {

    keys[e.key.toLowerCase()] = true;

    if (
        e.key === "ArrowUp" ||
        e.key === " "
    ) {
        e.preventDefault();
    }

});

document.addEventListener("keyup", function(e) {

    keys[e.key.toLowerCase()] = false;

});


// ======================================================
// MOBILE BUTTONS
// ======================================================

function setupButton(id, key) {

    const button = document.getElementById(id);

    if (!button) return;

    function press(e) {

        e.preventDefault();

        if (state === "menu") {
            startGame();
            return;
        }

        if (state === "dead") {
            restartLevel();
            return;
        }

        if (state === "complete") {
            nextLevel();
            return;
        }

        keys[key] = true;
    }

    function release(e) {

        e.preventDefault();
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

setupButton("left", "arrowleft");
setupButton("right", "arrowright");
setupButton("jump", "arrowup");


// ======================================================
// SCREEN TAP
// ======================================================

canvas.addEventListener("click", function() {

    if (state === "menu") {

        startGame();

    } else if (state === "dead") {

        restartLevel();

    } else if (state === "complete") {

        nextLevel();

    }

});

canvas.addEventListener(
    "touchstart",
    function(e) {

        if (state === "menu") {

            startGame();

        } else if (state === "dead") {

            restartLevel();

        } else if (state === "complete") {

            nextLevel();

        }

    },
    { passive: true }
);


// ======================================================
// START GAME
// ======================================================

function startGame() {

    level = 1;
    score = 0;
    deaths = 0;

    state = "playing";

    createLevel();
    resetPlayer();
}


// ======================================================
// RESET PLAYER
// ======================================================

function resetPlayer() {

    player.x = 80;
    player.y = 350;

    player.velocityY = 0;

    player.jumping = false;
    player.walking = false;

    player.direction = 1;
    player.walkTime = 0;

    cameraX = 0;
}


// ======================================================
// LEVEL CREATION
// ======================================================

function createLevel() {

    platforms = [];
    traps = [];
    decorations = [];

    levelLength =
        2500 +
        level * 600;

    goalX =
        levelLength - 180;

    // Main floor pieces
    let x = 0;

    while (x < levelLength) {

        const width =
            Math.max(
                180,
                330 - level * 12
            );

        platforms.push({
            x: x,
            y: 440,
            width: width,
            height: 60,
            type: "normal"
        });

        x += width;

        // Bigger gaps at higher levels
        const gap =
            50 +
            Math.random() *
            (50 + level * 10);

        x += gap;
    }


    // Floating platforms appear from level 2
    if (level >= 2) {

        for (
            let i = 0;
            i < 5 + level;
            i++
        ) {

            platforms.push({

                x:
                    400 +
                    i * 420,

                y:
                    320 -
                    Math.random() * 100,

                width:
                    130 +
                    Math.random() * 70,

                height: 22,

                type: "floating"
            });
        }
    }


    // Traps
    const trapCount =
        4 + level * 2;

    for (
        let i = 0;
        i < trapCount;
        i++
    ) {

        traps.push({

            x:
                300 +
                i * 400 +
                Math.random() * 150,

            y: 440,

            width: 45,

            height: 25,

            type:
                getTrapType(),

            active: true
        });
    }


    // Special hazards
    if (level >= 3) {

        for (
            let i = 0;
            i < level - 2;
            i++
        ) {

            traps.push({

                x:
                    600 +
                    i * 600,

                y:
                    300,

                width: 30,

                height: 140,

                type: "falling",

                active: true,

                speed:
                    2 + level * 0.2
            });
        }
    }


    if (level >= 4) {

        for (
            let i = 0;
            i < level - 3;
            i++
        ) {

            platforms.push({

                x:
                    800 +
                    i * 650,

                y: 440,

                width: 180,

                height: 60,

                type: "disappearing",

                visible: true,

                timer: 0
            });
        }
    }


    createDecorations();
}


// ======================================================
// TRAP TYPES
// ======================================================

function getTrapType() {

    const types = [
        "spikes"
    ];

    if (level >= 2)
        types.push("double");

    if (level >= 3)
        types.push("moving");

    if (level >= 5)
        types.push("troll");

    return types[
        Math.floor(
            Math.random() * types.length
        )
    ];
}


// ======================================================
// DECORATIONS
// ======================================================

function createDecorations() {

    for (let i = 0; i < 80; i++) {

        decorations.push({

            x:
                Math.random() *
                levelLength,

            y:
                50 +
                Math.random() * 280,

            size:
                8 +
                Math.random() * 15,

            type:
                Math.floor(
                    Math.random() * 4
                )
        });
    }
}


// ======================================================
// LEVEL THEMES
// ======================================================

function getTheme() {

    const themes = [

        {
            name: "NEON CITY",
            top: "#10001f",
            middle: "#300044",
            bottom: "#08000e",
            neon: "#d946ef",
            secondary: "#7c3aed"
        },

        {
            name: "MOONLIT GRAVEYARD",
            top: "#020617",
            middle: "#111827",
            bottom: "#02040b",
            neon: "#38bdf8",
            secondary: "#6366f1"
        },

        {
            name: "HELLSCAPE",
            top: "#250006",
            middle: "#5c0010",
            bottom: "#120003",
            neon: "#ff1744",
            secondary: "#ff6d00"
        },

        {
            name: "TOXIC LAB",
            top: "#00140d",
            middle: "#003d28",
            bottom: "#000a06",
            neon: "#00ff9d",
            secondary: "#84ff00"
        },

        {
            name: "GLITCH WORLD",
            top: "#170018",
            middle: "#45005a",
            bottom: "#08000d",
            neon: "#ff4fd8",
            secondary: "#00e5ff"
        },

        {
            name: "VOID",
            top: "#030303",
            middle: "#120018",
            bottom: "#000000",
            neon: "#ffffff",
            secondary: "#9d4edd"
        }
    ];

    return themes[
        (level - 1) % themes.length
    ];
}


// ======================================================
// BACKGROUND
// ======================================================

function drawBackground() {

    const theme = getTheme();

    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            H
        );

    gradient.addColorStop(
        0,
        theme.top
    );

    gradient.addColorStop(
        0.5,
        theme.middle
    );

    gradient.addColorStop(
        1,
        theme.bottom
    );

    ctx.fillStyle = gradient;

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    // Neon glow circles
    for (let i = 0; i < 7; i++) {

        const x =
            ((i * 190 -
                cameraX * 0.12)
                %
                (W + 250))
            - 100;

        const y =
            70 +
            Math.sin(
                animationTime * 0.02 + i
            ) * 45;

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            35 +
            Math.sin(
                animationTime * 0.03 + i
            ) * 10,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            theme.neon + "12";

        ctx.fill();
    }


    // Stars
    for (let i = 0; i < 55; i++) {

        const x =
            ((i * 157 -
                cameraX * 0.2)
                %
                W + W)
            % W;

        const y =
            (i * 73) % 290;

        ctx.fillStyle =
            i % 3 === 0
                ? theme.neon
                : "#ffffff";

        ctx.globalAlpha =
            0.35 +
            Math.sin(
                animationTime * 0.04 + i
            ) * 0.25;

        ctx.fillRect(
            x,
            y,
            2,
            2
        );
    }

    ctx.globalAlpha = 1;


    // Moon
    ctx.shadowBlur = 25;
    ctx.shadowColor = theme.neon;

    ctx.fillStyle = theme.neon;

    ctx.beginPath();

    ctx.arc(
        760,
        90,
        42,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.shadowBlur = 0;


    // Gothic silhouettes
    ctx.fillStyle = "#050008";

    for (
        let i = 0;
        i < 12;
        i++
    ) {

        const x =
            i * 100 -
            (cameraX * 0.1 % 100);

        const height =
            80 +
            (i * 43 % 120);

        ctx.fillRect(
            x,
            440 - height,
            70,
            height
        );

        // Roof
        ctx.beginPath();

        ctx.moveTo(
            x + 35,
            440 - height - 45
        );

        ctx.lineTo(
            x,
            440 - height
        );

        ctx.lineTo(
            x + 70,
            440 - height
        );

        ctx.fill();
    }
}


// ======================================================
// LEVEL DECORATIONS
// ======================================================

function drawDecorations() {

    const theme = getTheme();

    for (const d of decorations) {

        const x =
            d.x - cameraX * 0.7;

        if (
            x < -50 ||
            x > W + 50
        ) continue;

        ctx.save();

        ctx.translate(
            x,
            d.y
        );

        ctx.strokeStyle =
            theme.neon;

        ctx.fillStyle =
            theme.neon + "55";

        ctx.lineWidth = 2;

        if (d.type === 0) {

            // Bat
            ctx.beginPath();

            ctx.moveTo(
                -d.size,
                0
            );

            ctx.lineTo(
                -d.size / 2,
                -d.size / 2
            );

            ctx.lineTo(
                0,
                0
            );

            ctx.lineTo(
                d.size / 2,
                -d.size / 2
            );

            ctx.lineTo(
                d.size,
                0
            );

            ctx.lineTo(
                d.size / 2,
                d.size / 2
            );

            ctx.lineTo(
                0,
                d.size / 3
            );

            ctx.lineTo(
                -d.size / 2,
                d.size / 2
            );

            ctx.closePath();

            ctx.fill();

        } else if (d.type === 1) {

            // Cross
            ctx.fillRect(
                -3,
                -d.size,
                6,
                d.size * 2
            );

            ctx.fillRect(
                -d.size,
                -3,
                d.size * 2,
                6
            );

        } else if (d.type === 2) {

            // Diamond
            ctx.beginPath();

            ctx.moveTo(
                0,
                -d.size
            );

            ctx.lineTo(
                d.size,
                0
            );

            ctx.lineTo(
                0,
                d.size
            );

            ctx.lineTo(
                -d.size,
                0
            );

            ctx.closePath();

            ctx.stroke();

        } else {

            // Star
            ctx.beginPath();

            for (
                let i = 0;
                i < 8;
                i++
            ) {

                const angle =
                    i * Math.PI / 4;

                const radius =
                    i % 2 === 0
                        ? d.size
                        : d.size / 3;

                const px =
                    Math.cos(angle) *
                    radius;

                const py =
                    Math.sin(angle) *
                    radius;

                if (i === 0)
                    ctx.moveTo(px, py);
                else
                    ctx.lineTo(px, py);
            }

            ctx.closePath();

            ctx.fill();
        }

        ctx.restore();
    }
}


// ======================================================
// PLATFORMS
// ======================================================

function drawPlatforms() {

    const theme = getTheme();

    for (const p of platforms) {

        if (
            p.visible === false
        ) continue;

        const x =
            p.x - cameraX;

        if (
            x + p.width < 0 ||
            x > W
        ) continue;

        ctx.shadowBlur = 12;
        ctx.shadowColor =
            theme.neon;

        ctx.fillStyle =
            "#111018";

        ctx.fillRect(
            x,
            p.y,
            p.width,
            p.height
        );

        ctx.shadowBlur = 0;

        ctx.fillStyle =
            theme.neon;

        ctx.fillRect(
            x,
            p.y,
            p.width,
            5
        );

        ctx.fillStyle =
            theme.secondary;

        ctx.fillRect(
            x,
            p.y + 5,
            p.width,
            3
        );
    }
}


// ======================================================
// TRAPS
// ======================================================

function drawTraps() {

    const theme = getTheme();

    for (const trap of traps) {

        const x =
            trap.x - cameraX;

        if (
            x < -100 ||
            x > W + 100
        ) continue;

        ctx.shadowBlur = 15;
        ctx.shadowColor = "#ff1744";

        ctx.fillStyle =
            "#ff1744";


        if (
            trap.type === "falling"
        ) {

            ctx.fillRect(
                x,
                trap.y,
                trap.width,
                trap.height
            );

        } else {

            const count =
                trap.type === "double"
                    ? 6
                    : 4;

            for (
                let i = 0;
                i < count;
                i++
            ) {

                ctx.beginPath();

                const spikeWidth =
                    trap.width / count;

                ctx.moveTo(
                    x + i * spikeWidth,
                    trap.y
                );

                ctx.lineTo(
                    x +
                    i * spikeWidth +
                    spikeWidth / 2,
                    trap.y - trap.height
                );

                ctx.lineTo(
                    x +
                    (i + 1) * spikeWidth,
                    trap.y
                );

                ctx.fill();
            }
        }

        ctx.shadowBlur = 0;
    }
}


// ======================================================
// PLAYER
// ======================================================

function drawPlayer() {

    const x =
        player.x -
        cameraX +
        player.width / 2;

    const y =
        player.y;

    ctx.save();

    ctx.translate(
        x,
        y
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

    ctx.shadowBlur = 12;
    ctx.shadowColor =
        "#ffffff";


    // Head
    ctx.beginPath();

    ctx.arc(
        0,
        11,
        10,
        0,
        Math.PI * 2
    );

    ctx.stroke();


    // Body
    ctx.beginPath();

    ctx.moveTo(
        0,
        21
    );

    ctx.lineTo(
        0,
        42
    );

    ctx.stroke();


    const walk =
        player.walking
            ? Math.sin(
                player.walkTime
            ) * 11
            : 0;


    // Arms
    ctx.beginPath();

    ctx.moveTo(
        0,
        27
    );

    ctx.lineTo(
        -14,
        36 + walk * 0.4
    );

    ctx.moveTo(
        0,
        27
    );

    ctx.lineTo(
        14,
        36 - walk * 0.4
    );

    ctx.stroke();


    // Legs
    ctx.beginPath();

    ctx.moveTo(
        0,
        42
    );

    ctx.lineTo(
        -11 + walk,
        55
    );

    ctx.moveTo(
        0,
        42
    );

    ctx.lineTo(
        11 - walk,
        55
    );

    ctx.stroke();

    ctx.shadowBlur = 0;

    ctx.restore();
}


// ======================================================
// GOAL
// ======================================================

function drawGoal() {

    const theme = getTheme();

    const x =
        goalX - cameraX;

    ctx.shadowBlur = 20;
    ctx.shadowColor =
        theme.neon;

    ctx.fillStyle =
        theme.neon;

    ctx.fillRect(
        x,
        300,
        8,
        140
    );

    ctx.shadowBlur = 0;

    ctx.fillStyle =
        "#ffffff";

    ctx.font =
        "bold 18px monospace";

    ctx.fillText(
        "EXIT",
        x - 15,
        285
    );
}


// ======================================================
// HUD
// ======================================================

function drawHUD() {

    const theme = getTheme();

    ctx.fillStyle =
        "#ffffff";

    ct
