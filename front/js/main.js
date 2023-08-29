const player = document.getElementById('player');
const gameContainer = document.getElementById('game-container');
let comets = [];
let blasts = [];


let updatedData = {
    points: '',
    user: { name: 'Новое имя' }
};

//tableResult
// var xhr = new XMLHttpRequest();
// xhr.open('GET', 'https://949a-185-143-147-248.ngrok-free.app/results', true);
// xhr.onreadystatechange = function () {
//     if (xhr.readyState === 4 && xhr.status === 200) {
//         let responseData = JSON.parse(xhr.responseText);
//         console.log(responseData);
//         responseData.sort((a, b) => b.points - a.points);
//
//         const table = document.querySelector('.resultTable');
//
//         // Вывод первых 10 записей
//         for (let i = 0; i < Math.min(10, responseData.length); i++) {
//             const row = document.createElement('div');
//             row.classList.add('resultTable__row');
//
//             const nameCell = document.createElement('div');
//             const scoreCell = document.createElement('div');
//
//             nameCell.classList.add('resultTable__name');
//             scoreCell.classList.add('resultTable__score');
//
//             nameCell.textContent = responseData[i].name;
//             scoreCell.textContent = responseData[i].points;
//
//             row.appendChild(nameCell);
//             row.appendChild(scoreCell);
//             table.appendChild(row);
//         }
//     }
// };
// xhr.send();


const cometSpeed = "20s"
function createComet() {
    if(!shouldStop){
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

}

function moveComets() {
    for (const comet of comets) {
        const currentTop = parseInt(comet.style.top);
        comet.style.top = (currentTop + 1) + 'px';
    }
}

let score = 0; // Изначальное значение счетчика
let isHit = false; // Флаг для отслеживания попадания
let lives = 3;

function checkCollision() {
    for (const comet of comets) {
        const cometRect = comet.getBoundingClientRect();
        const playerRect = player.getBoundingClientRect();

        // Проверка на столкновение с синим блоком (игроком)
        if (
            playerRect.left < cometRect.right &&
            playerRect.right > cometRect.left &&
            playerRect.top < cometRect.bottom &&
            playerRect.bottom > cometRect.top
        ) {
            if (!isHit) {
                handleHit(comet);
                isHit = true;
                setTimeout(() => {
                    isHit = false;
                }, 1000); // Задержка в 1 секунду перед следующим попаданием
            }
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
            if (!isHit) {
                handleHit(comet);
                isHit = true;
                setTimeout(() => {
                    isHit = false;
                }, 1000); // Задержка в 1 секунду перед следующим попаданием
            }
        }
    }

}

function handleHit(comet) {
    comet.remove();
    const livesScore = document.querySelector('.lives')
    lives--;
    const hearts = document.querySelectorAll('.heart')
    hearts.forEach(item => {item.remove()})
    for (let i = 0; i < lives; i++){

        let heartElement = document.createElement('div')
        heartElement.classList.add('heart')
        livesScore.appendChild(heartElement)
    }

    if(lives === 0){
        gameOver()
    }
}

function updateScore(value) {
    score += value;
    const scoreElement = document.getElementById('score');
    scoreElement.textContent = `Score: ${score}`;
}

let isMobile = false;
let playerX = 0;
if ('ontouchstart' in window) {
    isMobile = true;
    player.addEventListener('touchstart', onTouchStart);
    player.addEventListener('touchmove', onTouchMove);
    player.addEventListener('touchend', onTouchEnd);
} else {
    console.log('desc')
}


function onTouchStart(event) {
    event.preventDefault();
    playerX = event.touches[0].pageX - player.offsetWidth / 2;
    player.style.left = `${playerX}px`;
}

function onTouchMove(event) {
    event.preventDefault();
    playerX = event.touches[0].pageX - player.offsetWidth / 2;
    player.style.left = `${playerX}px`;
}

function onTouchEnd(event) {
    event.preventDefault();
    stopAutoShoot();
}

let autoShootInterval;
function startAutoShoot() {
    if (!autoShootInterval) {
        autoShootInterval = setInterval(function () {
            const playerLeft = parseInt(player.style.left) + player.clientWidth / 2 - 2.5;
            const blast = document.createElement('div');
            blast.classList.add('blast');
            blast.style.left = playerLeft + 'px';
            blast.style.top = gameContainer.clientHeight - player.clientHeight + 'px';
            gameContainer.appendChild(blast);
            blasts.push(blast);
        }, 300); // Интервал между выстрелами
    }
}


function stopAutoShoot() {
    clearInterval(autoShootInterval);
    autoShootInterval = null;
}


document.addEventListener('mousemove', mouseEvent);

function mouseEvent(event){
    const x = event.clientX - gameContainer.getBoundingClientRect().left;
    player.style.left = x - player.clientWidth / 2 + 'px';
}

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

const playButton = document.getElementById('playButton');
const startScreen = document.querySelector('.start')
const nameInput = document.querySelector('.start__input')
playButton.addEventListener('click', startGame);

function startGame() {
    updatedData.user.name = nameInput.value;
    startScreen.classList.add('_hidden')
    gameLoop(); // Запустить игровой цикл
    setInterval(() => {
        if (comets.length < maxComets) {
            createComet();
        }
    }, cometInterval);
}

const maxComets = 30; // Заданное количество комет
const cometInterval = 1000; // Интервал создания комет
let shouldStop = false;


function gameLoop() {
    if(!shouldStop){
        moveComets();
        checkCollision();
        moveBlasts();
        requestAnimationFrame(gameLoop);
        if (isMobile) {
            startAutoShoot(); // Запустить автоматические выстрелы
        }
    }

}


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
    document.removeEventListener('mousemove', mouseEvent);
    shouldStop = true
    lives = 3;
    const over = document.querySelector('.over')
    const overBtn = document.querySelector('.over__btn')
    const overScore = document.querySelector('.over__text')
    updatedData.points = score
    overScore.innerHTML = `Your score: ${score}`;
    over.classList.remove('_hidden')
    console.log('game over')
    overBtn.addEventListener('click', () => {
        document.location.reload();
        // fetch('https://949a-185-143-147-248.ngrok-free.app/results', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify(updatedData)
        // })
        //     .then(response => response.json())
        //     .then(data => {
        //         console.log('обновлен:', data);
        //     })
        //     .catch(error => {
        //         console.error('Ошибка:', error);
        //     });
            })
}



// var updatedData = [
//     {points: 100, user: { name: 'Name1' } },
//     {points: 500, user: { name: 'Name2' } },
// ];




// fetch('https://949a-185-143-147-248.ngrok-free.app/results', {
//     method: 'POST',
//     headers: {
//         'Content-Type': 'application/json'
//     },
//     body: JSON.stringify(updatedData)
// })
//     .then(response => response.json())
//     .then(data => {
//         console.log('обновлен:', data);
//     })
//     .catch(error => {
//         console.error('Ошибка:', error);
//     });


//
// var xhr = new XMLHttpRequest();
// xhr.open('GET', 'https://949a-185-143-147-248.ngrok-free.app/results', true);
// xhr.onreadystatechange = function () {
//     if (xhr.readyState === 4 && xhr.status === 200) {
//         let responseData = JSON.parse(xhr.responseText);
//         console.log(responseData);
//     }
// };
// xhr.send();

