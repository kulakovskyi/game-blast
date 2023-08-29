const player = document.getElementById('player');
const gameContainer = document.getElementById('game-container');
let comets = [];
let blasts = [];


const cometSpeed = "7s"
function createComet() {
    const comet = document.createElement('div');
    comet.classList.add('comet');
    comet.style.left = Math.random() * (gameContainer.clientWidth - 50) + 'px';
    comet.style.top = '-50px'; // Start above the screen
    comet.style.animation = `fall ${cometSpeed} linear`; // Применяем заданную скорость
    gameContainer.appendChild(comet);
    comets.push(comet);

    if (comets.length > maxComets) {
        const removedComet = comets.shift();
        removedComet.remove();
    }
}

function moveComets() {
    for (const comet of comets) {
        const currentTop = parseInt(comet.style.top);
        comet.style.top = (currentTop + 1) + 'px';
    }
}

let score = 0; // Изначальное значение счетчика

function checkCollision() {
    for (const comet of comets) {
        const cometRect = comet.getBoundingClientRect();
        const playerRect = player.getBoundingClientRect();

        // Проверка на столкновение с синим блоком (игроком)
        if (
            cometRect.left < playerRect.right &&
            cometRect.right > playerRect.left &&
            cometRect.top < playerRect.bottom &&
            cometRect.bottom > playerRect.top
        ) {
            gameOver();
        }

        for (const blast of blasts) {
            const blastRect = blast.getBoundingClientRect();
            if (
                blastRect.left < cometRect.right &&
                blastRect.right > cometRect.left &&
                blastRect.top < cometRect.bottom &&
                blastRect.bottom > cometRect.top
            ) {
                comet.remove();
                comets = comets.filter(c => c !== comet);
                blast.remove();
                blasts = blasts.filter(b => b !== blast);
                updateScore(1)
            }
        }

        // Проверка на достижение нижней границы экрана
        if (cometRect.bottom >= window.innerHeight) {
            gameOver();
        }
    }
}

function updateScore(value) {
    score += value;
    const scoreElement = document.getElementById('score');
    scoreElement.textContent = `Score: ${score}`;
}


document.addEventListener('mousemove', (event) => {
    const x = event.clientX - gameContainer.getBoundingClientRect().left;
    player.style.left = x - player.clientWidth / 2 + 'px';
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
        const playerLeft = parseInt(player.style.left);
        player.style.left = (playerLeft - 10) + 'px';
    } else if (event.key === 'ArrowRight') {
        const playerLeft = parseInt(player.style.left);
        player.style.left = (playerLeft + 10) + 'px';
    } else if (event.key === ' ') {
        shoot();
    }
});

gameLoop();

const maxComets = 30; // Заданное количество комет
const cometInterval = 1000; // Интервал создания комет

function gameLoop() {
    moveComets();
    checkCollision();
    moveBlasts();
    requestAnimationFrame(gameLoop);
}

setInterval(() => {
    if (comets.length < maxComets) {
        createComet();
    }
}, cometInterval);


function shoot() {
    const blast = document.createElement('div');
    blast.classList.add('blast');
    const playerLeft = parseInt(player.style.left) + player.clientWidth / 2 - 2.5;
    blast.style.left = playerLeft + 'px';
    blast.style.top = gameContainer.clientHeight - player.clientHeight + 'px';
    gameContainer.appendChild(blast);
    blasts.push(blast);
}

function moveBlasts() {
    for (const blast of blasts) {
        const currentTop = parseInt(blast.style.top);
        if (currentTop <= 0) {
            blast.remove();
            blasts = blasts.filter(b => b !== blast);
        } else {
            blast.style.top = (currentTop - 10) + 'px';
        }
    }
}

function gameOver() {
    alert('Game Over');
    location.reload();
}