const TILE = 32;
const ROWS = 20;
const COLS = 20;
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const sprites = {};
const snakePaths = {
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

const fruitsData = [
    { name: "apple", src: "sprites/Apple.png"},
    { name: "gapple", src: "sprites/Gapple.png"},
    { name: "cherry", src: "sprites/Cherry.png"},
    { name: "pear", src: "sprites/Pear.png"},
    { name: "strawberry", src: "sprites/Strawberry.png"},
    { name: "watermelon", src: "sprites/Watermelon.png"},
    { name: "orange", src: "sprites/Orange.png"},
];

let imagesLoaded = 0;
const totalImages = Object.keys(snakePaths).length + fruitsData.length;

function checkLoad() {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        startGame();
    }
}

for (const key in snakePaths) {
    sprites[key] = new Image();
    sprites[key].onload = checkLoad;
    sprites[key].src = snakePaths[key];
}

fruitsData.forEach(fruit => {
    sprites[fruit.name] = new Image();
    sprites[fruit.name].onload = checkLoad;
    sprites[fruit.name].src = fruit.src;
});

let snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
];

let direction = { x: 1, y: 0 };
let food = getRandomFood();

function getRandomFood() {
  return {
    x: Math.floor(Math.random() * COLS),
    y: Math.floor(Math.random() * ROWS),
    type: fruitsData[Math.floor(Math.random() * fruitsData.length)]
  };
}

function getSnakeSprite(segment, index, snakeArray) {
    const current = segment;

    if (index === 0) {
        if (direction.x === 1) return sprites.head_e;
        if (direction.x === -1) return sprites.head_w;
        if (direction.y === 1) return sprites.head_s;
        if (direction.y === -1) return sprites.head_n;
    }

    if (index === snakeArray.length - 1) {
        const p = snakeArray[index - 1];
        if (p.x > current.x) return sprites.tail_e;
        if (p.x < current.x) return sprites.tail_w;
        if (p.y > current.y) return sprites.tail_s;
        if (p.y < current.y) return sprites.tail_n;
    }

    const p = snakeArray[index - 1];
    const n = snakeArray[index + 1];

    if (p.x === n.x) return sprites.body_v;
    if (p.y === n.y) return sprites.body_h;

    const dx_p = p.x - current.x;
    const dy_p = p.y - current.y;
    const dx_n = n.x - current.x;
    const dy_n = n.y - current.y;

    if ((dx_p === 1 && dy_n === 1) || (dx_n === 1 && dy_p === 1)) return sprites.body_es; 
    if ((dx_p === -1 && dy_n === 1) || (dx_n === -1 && dy_p === 1)) return sprites.body_ws;
    if ((dx_p === 1 && dy_n === -1) || (dx_n === 1 && dy_p === -1)) return sprites.body_ne;
    if ((dx_p === -1 && dy_n === -1) || (dx_n === -1 && dy_p === -1)) return sprites.body_nw;
    
    return sprites.body_h;
}

function update() {
    const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };

    if (head.x < 0) head.x = COLS - 1;
    if (head.x >= COLS) head.x = 0;
    if (head.y < 0) head.y = ROWS - 1;
    if (head.y >= ROWS) head.y = 0;

for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
        alert("¡Perdiste");
        location.reload();
        return;
    }
}

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        food = getRandomFood();
    } else {
        snake.pop();
    }
    draw();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    snake.forEach((s, index) => {
        const img = getSnakeSprite(s, index, snake);
        if (img && img.complete) {
            ctx.drawImage(img, s.x * TILE, s.y * TILE, TILE, TILE);
        }
    });

    if (food.type && sprites[food.type.name]) {
        ctx.drawImage(sprites[food.type.name], food.x * TILE, food.y * TILE, TILE, TILE);
    }
}

document.addEventListener("keydown", e => {
    if (e.key === "w" && direction.y === 0) direction = { x: 0, y: -1 };
    if (e.key === "s" && direction.y === 0) direction = { x: 0, y: 1 };
    if (e.key === "a" && direction.x === 0) direction = { x: -1, y: 0 };
    if (e.key === "d" && direction.x === 0) direction = { x: 1, y: 0 };
});

let gameInterval;
function startGame() {
    if (gameInterval) return;
    gameInterval = setInterval(update, 150);
}