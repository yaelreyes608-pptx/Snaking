const TILE = 32;
const ROWS = 20;
const COLS = 20;
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const sprites1 = {};
const sprites2 = {};
const foodSprites = {};
const scoredisplay1 = document.getElementById("score1");
const scoredisplay2 = document.getElementById("score2");
const p2Container = document.getElementById("p2-score-container");

const snakepaths1 = {
    head_n: "sprites/HeadN.png",
    head_s: "sprites/HeadS.png",
    head_e: "sprites/HeadE.png",
    head_w: "sprites/HeadW.png",
    body_v: "sprites/BodyV.png",
    body_h: "sprites/BodyH.png",
    body_ne: "sprites/BodyCNE.png",
    body_nw: "sprites/BodyCNW.png",
    body_es: "sprites/BodyCES.png",
    body_ws: "sprites/BodyCWS.png",
    tail_s: "sprites/TailN.png",
    tail_n: "sprites/TailS.png",
    tail_w: "sprites/TailE.png",
    tail_ea: "sprites/TailW.png"
};

const snakepaths2 = {
    head_n: "sprites/HeadN2.png",
    head_s: "sprites/HeadS2.png",
    head_e: "sprites/HeadE2.png",
    head_w: "sprites/HeadW2.png",
    body_v: "sprites/BodyV2.png",
    body_h: "sprites/BodyH2.png",
    body_ne: "sprites/BodyCNE2.png",
    body_nw: "sprites/BodyCNW2.png",
    body_es: "sprites/BodyCES2.png",
    body_ws: "sprites/BodyCWS2.png",
    tail_s: "sprites/TailN2.png",
    tail_n: "sprites/TailS2.png",
    tail_w: "sprites/TailE2.png",
    tail_ea: "sprites/TailW2.png"
};

const fruitsData = [
    { name: "apple", src: "sprites/Apple.png"},
    { name: "gapple", src: "sprites/Gapple.png"},
    { name: "cherry", src: "sprites/Cherry.png"},
    { name: "pear", src: "sprites/Pear.png"},
    { name: "strawberry", src: "sprites/Strawberry.png"},
    { name: "watermelon", src: "sprites/Watermelon.png"},
    { name: "orange", src: "sprites/Orange.png"},
];

let snake1 = [];
let snake2 = [];
let direction1 = { x: 1, y: 0 };
let direction2 = { x: -1, y: 0 };
let score1 = 0;
let score2 = 0;
let food = null;
let currentMode = 'single';
let gameInterval;

let imagesLoaded = 0;
const totalImages = (Object.keys(snakepaths1).length * 2) + fruitsData.length;

function checkLoad() {
    imagesLoaded++;
}

function loadResources() {
    for (const key in snakepaths1) {
        sprites1[key] = new Image();
        sprites1[key].onload = checkLoad;
        sprites1[key].src = snakepaths1[key];
        sprites2[key] = new Image();
        sprites2[key].onload = checkLoad;
        sprites2[key].src = snakepaths2[key];
    }

    fruitsData.forEach(fruit => {
        foodSprites[fruit.name] = new Image();
        foodSprites[fruit.name].onload = checkLoad;
        foodSprites[fruit.name].src = fruit.src;
    });
}

loadResources();

function getRandomFood() {
    return {
        x: Math.floor(Math.random() * COLS),
        y: Math.floor(Math.random() * ROWS),
        type: fruitsData[Math.floor(Math.random() * fruitsData.length)]
    };
}

function movai () {
    const head = snake2[0];
    const mov = [
        { x: 0, y: -1 }, { x: 0, y: 1 },
        { x: -1, y: 0 }, { x: 1, y: 0 }
    ];
    const valmov = mov.filter(m => !(m.x === -direction2.x && m.y === -direction2.y));
    let bestmov = direction2;
    let mindis = Infinity;

    for (const m of valmov) {
        const nextX = (head.x + m.x + COLS) % COLS;
        const nextY = (head.y + m.y + ROWS) % ROWS;
        const colP1 = snake1.some(s => s.x === nextX && s.y === nextY);
        const colP2 = snake2.some(s => s.x === nextX && s.y === nextY);

        if (!colP1 && !colP2) {
            const dx = Math.min(Math.abs(nextX - food.x), COLS - Math.abs(nextX - food.x));
            const dy = Math.min(Math.abs(nextY - food.y), ROWS - Math.abs(nextY - food.y));
            const dist = dx + dy;

            if (dist < mindis) {
                mindis = dist;
                bestmov = m;
            }
        }
    }
    direction2 = bestmov;
}

function getSnakeSprite(segment, index, snakeArray, spriteSet, dir) {
    const current = segment;

    if (index === 0) {
        if (dir.x === 1) return spriteSet.head_e;
        if (dir.x === -1) return spriteSet.head_w;
        if (dir.y === 1) return spriteSet.head_s;
        if (dir.y === -1) return spriteSet.head_n;
        return spriteSet.head_n;
    }

    const p = snakeArray[index - 1];
    const n = snakeArray[index + 1];

    if (index === snakeArray.length - 1) {

        let dx = p.x - current.x;
        let dy = p.y - current.y;
        if (dx > 1) dx = -1; else if (dx < -1) dx = 1;
        if (dy > 1) dy = -1; else if (dy < -1) dy = 1;

        if (dx === 1) return spriteSet.tail_ea;
        if (dx === -1) return spriteSet.tail_w;
        if (dy === 1) return spriteSet.tail_s;
        if (dy === -1) return spriteSet.tail_n;
    }

    let dxp = p.x - current.x;
    let dyp = p.y - current.y;
    let dxn = n.x - current.x;
    let dyn = n.y - current.y;

    if (dxp > 1) dxp = -1; else if (dxp < -1) dxp = 1;
    if (dxn > 1) dxn = -1; else if (dxn < -1) dxn = 1;
    if (dyp > 1) dyp = -1; else if (dyp < -1) dyp = 1;
    if (dyn > 1) dyn = -1; else if (dyn < -1) dyn = 1;

    if (dxp === dxn) return spriteSet.body_v;
    if (dyp === dyn) return spriteSet.body_h;

    if ((dxp === 1 && dyn === 1) || (dxn === 1 && dyp === 1)) return spriteSet.body_es; 
    if ((dxp === -1 && dyn === 1) || (dxn === -1 && dyp === 1)) return spriteSet.body_ws;
    if ((dxp === 1 && dyn === -1) || (dxn === 1 && dyp === -1)) return spriteSet.body_ne;
    if ((dxp === -1 && dyn === -1) || (dxn === -1 && dyp === -1)) return spriteSet.body_nw;
    
    return spriteSet.body_h;
}

function checkCollision(head, array) {
    return array.some(segment => head.x === segment.x && head.y === segment.y);
}

function update() {

    if (currentMode === 'pve') movai();

    const head1 = {
        x: (snake1[0].x + direction1.x + COLS) % COLS,
        y: (snake1[0].y + direction1.y + ROWS) % ROWS
    };

    let head2 = null;
    if (currentMode === 'pvp' || currentMode === "pve") {
        head2 = {
            x: (snake2[0].x + direction2.x + COLS) % COLS,
            y: (snake2[0].y + direction2.y + ROWS) % ROWS
        };
    }

    let loser = null;

    if (checkCollision(head1, snake1)) loser = "P1";
    if (currentMode === 'pvp' || currentMode === 'pve') {
        if (checkCollision(head2, snake2)) loser = "P2";
        if (checkCollision(head1, snake2)) loser = "P1";
        if (checkCollision(head2, snake1)) loser = "P2";
        if (head2 && head1.x === head2.x && head1.y === head2.y) loser = "Both";
    }

    if (loser) {
        clearInterval(gameInterval);
        if (currentMode === 'single' || currentMode === 'pve') {
            fetch('/update-score', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({score: score1, mode: currentMode})
            })
            .then(res => res.json())
            .then(data => {
                let msg = `Fin del juego. Perdedor: ${loser}. Tu puntaje: ${score1}`;
                if (data.isNewRecord) msg += '\n¡Nuevo récord!';
                alert(msg);
                document.getElementById('game-screen').classList.add('hidden');
                document.getElementById('mode-screen').classList.remove('hidden');
            })
            .catch(err => {
                alert(`Fin del juego. Perdedor: ${loser}`);
                document.getElementById('game-screen').classList.add('hidden');
                document.getElementById('mode-screen').classList.remove('hidden');
            });
        } else {
            alert(loser === "Both" ? "Empate técnico" : `Fin del juego. Perdedor: ${loser}`);
            document.getElementById('game-screen').classList.add('hidden');
            document.getElementById('mode-screen').classList.remove('hidden');
        }
        return;
        return;
    }

    //p1
    snake1.unshift(head1);
    if (head1.x === food.x && head1.y === food.y) {
        score1 += 10;
        scoredisplay1.innerText = score1;
        food = getRandomFood();
    } else {
        snake1.pop();
    }

    //p2ai
    if ((currentMode === 'pvp' && head2 || currentMode === 'pve') && head2) {
        snake2.unshift(head2);
        if (head2.x === food.x && head2.y === food.y) {
            score2 += 10;
            scoredisplay2.innerText = score2;
            food = getRandomFood();
        } else {
            snake2.pop();
        }
    }

    draw();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //p1
    snake1.forEach((s, i) => {
        const img = getSnakeSprite(s, i, snake1, sprites1, direction1);
        if (img && img.complete) ctx.drawImage(img, s.x * TILE, s.y * TILE, TILE, TILE);
    });

    //p2
    if (currentMode === 'pvp' || currentMode === 'pve') {
        snake2.forEach((s, i) => {
            const img = getSnakeSprite(s, i, snake2, sprites2, direction2);
            if (img && img.complete) ctx.drawImage(img, s.x * TILE, s.y * TILE, TILE, TILE);
        });
    }

    if (food && foodSprites[food.type.name]) {
        ctx.drawImage(foodSprites[food.type.name], food.x * TILE, food.y * TILE, TILE, TILE);
    }
}

document.addEventListener("keydown", e => {
    //p1
    const key = e.key.toLowerCase();
    if (key === "w" && direction1.y === 0) direction1 = { x: 0, y: -1 };
    if (key === "s" && direction1.y === 0) direction1 = { x: 0, y: 1 };
    if (key === "a" && direction1.x === 0) direction1 = { x: -1, y: 0 };
    if (key === "d" && direction1.x === 0) direction1 = { x: 1, y: 0 };

    //p2
    if (currentMode === 'pvp') {
        if (e.key === "ArrowUp" && direction2.y === 0) direction2 = { x: 0, y: -1 };
        if (e.key === "ArrowDown" && direction2.y === 0) direction2 = { x: 0, y: 1 };
        if (e.key === "ArrowLeft" && direction2.x === 0) direction2 = { x: -1, y: 0 };
        if (e.key === "ArrowRight" && direction2.x === 0) direction2 = { x: 1, y: 0 };
    }
});

function startGame() {
    if (gameInterval) clearInterval(gameInterval);
    food = getRandomFood();
    gameInterval = setInterval(update, 200);
}

window.addEventListener('init-game', (event) => {
    currentMode = event.detail;
    score1 = 0;
    score2 = 0;
    scoredisplay1.innerText = "0";
    
    snake1 = [{ x: 5, y: 10 }, { x: 4, y: 10 }, { x: 3, y: 10 }];
    direction1 = { x: 1, y: 0 };

    if (currentMode === 'pvp' || currentMode === 'pve') {
        p2Container.classList.remove('hidden');
        scoredisplay2.innerText = "0";
        snake2 = [{ x: 14, y: 10 }, { x: 15, y: 10 }, { x: 16, y: 10 }];
        direction2 = { x: 0, y: -1 };
    } else {
        p2Container.classList.add('hidden');
        snake2 = [];
    }

window.addEventListener('stop-game', () => {
    if (gameInterval) clearInterval(gameInterval);
});

    startGame();
});