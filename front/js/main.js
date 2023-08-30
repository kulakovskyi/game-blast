const player = document.getElementById('player');
const gameContainer = document.getElementById('game-container');
let comets = [];
let blasts = [];

let updatedData = {
    points: '',
    user: { name: 'Новое имя' }
};

//tableResult
let xhr = new XMLHttpRequest();
xhr.open('GET', 'https://favoritpromo.com/api_toxic/users', true);
xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
        let responseData = JSON.parse(xhr.responseText);
        console.log(responseData);
        responseData.sort((a, b) => b.points - a.points);

        const table = document.querySelector('.resultTable');

        // Вывод первых 10 записей
        for (let i = 0; i < Math.min(10, responseData.length); i++) {
            const row = document.createElement('div');
            row.classList.add('resultTable__row');

            const nameCell = document.createElement('div');
            const scoreCell = document.createElement('div');

            nameCell.classList.add('resultTable__name');
            scoreCell.classList.add('resultTable__score');

            nameCell.textContent = responseData[i].user.name;
            scoreCell.textContent = responseData[i].points;

            row.appendChild(nameCell);
            row.appendChild(scoreCell);
            table.appendChild(row);
        }
    }
};
xhr.send();


let  cometSpeed = '15s' // cкорость кометы
let score = 0; // Изначальное значение счетчика
let isHit = false; // Флаг для отслеживания попадания
let lives = 3; // Количество жизней
let cometInterval = 1000; // Интервал создания комет
let shouldStop = false; // для остановки комет после проигрыша

let levelTwoAnchor = 4; // Первый якорь для ускорения
let levelTwoCometSpeed = '5s'; // Скорость кометы для второго уровня
let levelTwoCometInterval = 100; // Интервал для второго уровня



//создание комет рандомно
function createComet() {
    if(!shouldStop){
        const comet = document.createElement('div');
        comet.classList.add('comet');
        comet.style.left = Math.random() * (gameContainer.clientWidth - 50) + 'px';
        comet.style.top = '-50px'; // Start above the screen
        comet.style.animation = `fall ${cometSpeed} linear`; // Применяем заданную скорость
        gameContainer.appendChild(comet);
        comets.push(comet);

        if(score >= levelTwoAnchor) cometSpeed = levelTwoCometSpeed

    }
}

//ф-я для полета комет
function moveComets() {
    for (const comet of comets) {
        const currentTop = parseInt(comet.style.top);
        comet.style.top += (currentTop + 1) + 'px';

    }
}

// чекаем косание комет по краю экрана или по кораблю
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

//функция для полсчета попаданий кометы в корабль или на край и уменьшения жизней
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

//обновление счетчика очков
function updateScore(value) {
    score += value;
    const scoreElement = document.getElementById('score');
    scoreElement.textContent = `Score: ${score}`;
}


// отслеживание для мобилки
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

//атоматические выстрелы на мобилке
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


// cлежение за мышкой на десктопе
document.addEventListener('mousemove', mouseEvent);
function mouseEvent(event){
    const x = event.clientX - gameContainer.getBoundingClientRect().left;
    player.style.left = x - player.clientWidth / 2 + 'px';
}

// для атаки на десктопе и перемещения стрелками
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

//старт игры
const playButton = document.getElementById('playButton');
const startScreen = document.querySelector('.start')
const nameInput = document.querySelector('.start__input')
playButton.addEventListener('click', startGame);


//validation input
function validInput() {
    return new Promise((resolve, reject) => {
        let inputValue = nameInput.value;

        // Проверка на минимальное количество символов
        if (inputValue.trim().length < 4) {
            nameInput.value = '';
            nameInput.placeholder = 'Name should be at least 4 characters';
            resolve(false);
            return;
        }

        // Проверка на пустоту
        if (!inputValue.trim()) {
            nameInput.placeholder = 'Enter your name!';
            resolve(false);
            return;
        }

        // Проверка на наличие только цифр
        if (/^\d+$/.test(inputValue)) {
            nameInput.value = '';
            nameInput.placeholder = 'Can not be just numbers';
            resolve(false);
            return;
        }

        xhr.open('GET', 'https://favoritpromo.com/api_toxic/users', true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                let responseData = JSON.parse(xhr.responseText);

                // Функция для проверки уникальности имени в массиве данных
                function isNameUnique(name) {
                    return responseData.every(item => item.user.name !== name);
                }

                if (isNameUnique(inputValue)) {
                    updatedData.user.name = inputValue;
                    resolve(true);
                } else {
                    nameInput.value = '';
                    nameInput.placeholder = 'Name already exists';
                    resolve(false);
                }
            }
        };
        xhr.send();
    });
}

function startGame() {
    validInput().then(isUnique => {
        if (isUnique) {
            startScreen.classList.add('_hidden')
            gameLoop(); // Запустить игровой цикл
            console.log(cometInterval)
            let intervalCometsFun = setInterval(() => {
                createComet();

            }, cometInterval);
        } else {
            console.log('name not valid')
        }
    });

}

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

// ф-я для стреляния
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
    const loadSpinner = document.querySelector('.loading')
    let dataSent = false;
    updatedData.points = score
    overScore.innerHTML = `Your score: ${score}`;
    over.classList.remove('_hidden')
    console.log('game over')

    overBtn.addEventListener('click', () => {
        if (dataSent) {
            location.reload(); // Перезагрузить страницу при втором клике, если данные уже отправлены
            return;
        }
        // Показать индикатор загрузки и заблокировать кнопку
        loadSpinner.style.display = 'block'
        overBtn.style.pointerEvents = 'none';

        fetch('https://favoritpromo.com/api_toxic/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        })
            .then(response => response.json())
            .then(data => {
                // Скрыть индикатор загрузки и показать статус успешной отправки
                overBtn.style.pointerEvents = 'initial';
                loadSpinner.style.display = 'none'
                overBtn.innerText = 'Play again';
                dataSent = true;

            })
            .catch(error => {
                console.error('Ошибка:', error);
            });
    });
}

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
// xhr.open('GET', 'https://favoritpromo.com/api_toxic/users', true);
// xhr.onreadystatechange = function () {
//     if (xhr.readyState === 4 && xhr.status === 200) {
//         let responseData = JSON.parse(xhr.responseText);
//         console.log(responseData);
//     } else {
//         console.log('error')
//     }
// };
// xhr.send();


