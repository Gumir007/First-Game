import { Game } from './game.js';
import { Settings } from './settings.js';

// Инициализация canvas
const canvas = document.getElementById('gameCanvas');
if (!canvas) {
    console.error('Canvas element not found!');
} else {
    console.log('Canvas found, setting dimensions...');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    console.log('Canvas dimensions set:', canvas.width, 'x', canvas.height);
}

// Инициализация звуков и изображений
export let backgroundMusic;
export let collectSound;
export let soundEnabled = true;

try {
    backgroundMusic = new Audio('sound/background.mp3');
    collectSound = new Audio('sound/collect.mp3');
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.3;
    
    // Обработчики ошибок загрузки
    collectSound.onerror = () => {
        console.error("Не удалось загрузить звук сбора");
        collectSound = null;
    };
    
    backgroundMusic.onerror = () => {
        console.error("Не удалось загрузить фоновую музыку");
        backgroundMusic = null;
    };
} catch (e) {
    console.error("Ошибка инициализации звуков:", e);
    collectSound = null;
    backgroundMusic = null;
}

// Глобальная переменная для игры
let game = null;

// Функции для управления меню
function showMainMenu() {
    const mainMenu = document.getElementById('main-menu');
    if (mainMenu) {
        mainMenu.style.display = 'flex';
        console.log('Main menu shown');
    } else {
        console.error('Main menu element not found');
    }
}

function hideMainMenu() {
    const mainMenu = document.getElementById('main-menu');
    if (mainMenu) {
        mainMenu.style.display = 'none';
        console.log('Main menu hidden');
    }
}

// Функции для управления экраном загрузки
function showLoadingScreen() {
    const loadingScreen = document.getElementById('level-loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
        setTimeout(() => {
            loadingScreen.classList.add('visible');
        }, 10);
    }
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('level-loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.remove('visible');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 300);
    }
}

function updateLoadingProgress(percent, details) {
    const progressBar = document.getElementById('level-progress-bar');
    const loadingDetails = document.getElementById('level-loading-details');
    
    if (progressBar) {
        progressBar.style.width = `${percent}%`;
    }
    if (loadingDetails) {
        loadingDetails.style.opacity = '0';
        loadingDetails.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            loadingDetails.textContent = details;
            loadingDetails.style.opacity = '1';
            loadingDetails.style.transform = 'translateY(0)';
        }, 300);
    }
}

async function simulateLoading() {
    const steps = [
        { progress: 20, text: 'Инициализация игры...' },
        { progress: 40, text: 'Загрузка ресурсов...' },
        { progress: 60, text: 'Подготовка уровней...' },
        { progress: 80, text: 'Настройка управления...' },
        { progress: 100, text: 'Запуск игры...' }
    ];

    for (const step of steps) {
        updateLoadingProgress(step.progress, step.text);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

// Функция загрузки ресурсов
async function loadResources() {
    showLoadingScreen();
    
    const resources = [
        { type: 'image', path: 'image/apple.png', name: 'Яблоко' },
        { type: 'image', path: 'image/owl/owl.png', name: 'Сова' },
        { type: 'audio', path: 'sound/background.mp3', name: 'Фоновая музыка' },
        { type: 'audio', path: 'sound/collect.mp3', name: 'Звук сбора' },
        // Добавляем спрайты игрока
        { type: 'image', path: 'image/player/idle1.png', name: 'Спрайт покоя 1' },
        { type: 'image', path: 'image/player/idle2.png', name: 'Спрайт покоя 2' },
        { type: 'image', path: 'image/player/idle3.png', name: 'Спрайт покоя 3' },
        { type: 'image', path: 'image/player/idle4.png', name: 'Спрайт покоя 4' },
        { type: 'image', path: 'image/player/walk1.png', name: 'Спрайт ходьбы 1' },
        { type: 'image', path: 'image/player/walk2.png', name: 'Спрайт ходьбы 2' },
        { type: 'image', path: 'image/player/walk3.png', name: 'Спрайт ходьбы 3' },
        { type: 'image', path: 'image/player/walk4.png', name: 'Спрайт ходьбы 4' },
        { type: 'image', path: 'image/player/walk5.png', name: 'Спрайт ходьбы 5' },
        { type: 'image', path: 'image/player/walk6.png', name: 'Спрайт ходьбы 6' },
        { type: 'image', path: 'image/player/jump1.png', name: 'Спрайт прыжка 1' },
        { type: 'image', path: 'image/player/jump2.png', name: 'Спрайт прыжка 2' },
        { type: 'image', path: 'image/player/jump3.png', name: 'Спрайт прыжка 3' },
        { type: 'image', path: 'image/player/jump4.png', name: 'Спрайт прыжка 4' },
        { type: 'image', path: 'image/enemy/enemy1.png', name: 'Спрайт врага 1' },
        { type: 'image', path: 'image/enemy/enemy2.png', name: 'Спрайт врага 2' },
        { type: 'image', path: 'image/enemy/enemy3.png', name: 'Спрайт врага 3' }
    ];
    
    let loadedCount = 0;
    
    for (const resource of resources) {
        updateLoadingProgress(
            Math.round((loadedCount / resources.length) * 100),
            `Загрузка ${resource.name}...`
        );
        
        try {
            if (resource.type === 'image') {
                await loadImage(resource.path);
                console.log(`Изображение загружено: ${resource.path}`);
            } else if (resource.type === 'audio') {
                await loadAudio(resource.path);
                console.log(`Аудио загружено: ${resource.path}`);
            }
            loadedCount++;
        } catch (error) {
            console.error(`Ошибка загрузки ${resource.name}:`, error);
        }
    }
    
    updateLoadingProgress(100, 'Загрузка завершена!');
    await new Promise(resolve => setTimeout(resolve, 500));
    hideLoadingScreen();
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            console.log(`Изображение успешно загружено: ${src}`);
            resolve(img);
        };
        img.onerror = (e) => {
            console.error(`Ошибка загрузки изображения ${src}:`, e);
            reject(new Error(`Не удалось загрузить изображение: ${src}`));
        };
        img.src = src;
    });
}

function loadAudio(src) {
    return new Promise((resolve, reject) => {
        const audio = new Audio();
        audio.oncanplaythrough = () => {
            console.log(`Аудио успешно загружено: ${src}`);
            resolve(audio);
        };
        audio.onerror = (e) => {
            console.error(`Ошибка загрузки аудио ${src}:`, e);
            reject(new Error(`Не удалось загрузить аудио: ${src}`));
        };
        audio.src = src;
    });
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM загружен');

    // Получаем все необходимые элементы
    const elements = {
        canvas: document.getElementById('gameCanvas'),
        mainMenu: document.getElementById('main-menu'),
        settingsMenu: document.getElementById('settings-menu'),
        newGameBtn: document.getElementById('new-game-btn'),
        continueBtn: document.getElementById('continue-btn'),
        settingsBtn: document.getElementById('settings-btn'),
        backBtn: document.getElementById('back-btn'),
        musicToggle: document.getElementById('music-toggle'),
        volumeSlider: document.getElementById('volume-slider'),
        volumeValue: document.getElementById('volume-value')
    };

    // Проверяем наличие всех элементов
    const missingElements = Object.entries(elements)
        .filter(([key, element]) => !element)
        .map(([key]) => key);

    if (missingElements.length > 0) {
        console.error('Missing DOM elements:', missingElements);
        return;
    }

    // Инициализация настроек
    const settings = new Settings();
    
    // Установка начальных значений
    elements.musicToggle.checked = settings.isMusicEnabled();
    elements.volumeSlider.value = settings.getVolume();
    elements.volumeValue.textContent = settings.getVolume();

    // Инициализация игры
    game = new Game(elements.canvas);

    // Обработчики событий
    elements.newGameBtn.addEventListener('click', async () => {
        elements.mainMenu.style.display = 'none';
        showLoadingScreen();
        await simulateLoading();
        game.start();
        hideLoadingScreen();
    });

    elements.continueBtn.addEventListener('click', () => {
        elements.mainMenu.style.display = 'none';
        game.continue();
    });

    elements.settingsBtn.addEventListener('click', () => {
        elements.mainMenu.style.display = 'none';
        elements.settingsMenu.style.display = 'flex';
    });

    elements.backBtn.addEventListener('click', () => {
        elements.settingsMenu.style.display = 'none';
        elements.mainMenu.style.display = 'flex';
    });

    elements.musicToggle.addEventListener('change', (e) => {
        settings.setMusicEnabled(e.target.checked);
        game.getAudioManager().setMusicEnabled(e.target.checked);
    });

    elements.volumeSlider.addEventListener('input', (e) => {
        const value = e.target.value;
        elements.volumeValue.textContent = value;
        settings.setVolume(value);
        game.getAudioManager().setVolume(value / 100);
    });

    // Показываем главное меню при загрузке
    elements.mainMenu.style.display = 'flex';
});

// Обработчики событий клавиатуры
window.addEventListener('keydown', (e) => {
    if (game && game.player) {
        switch(e.key.toLowerCase()) {
            case 'w':
            case 'arrowup':
                game.player.keys.w.pressed = true;
                break;
            case 'a':
            case 'arrowleft':
                game.player.keys.a.pressed = true;
                break;
            case 's':
            case 'arrowdown':
                game.player.keys.s.pressed = true;
                break;
            case 'd':
            case 'arrowright':
                game.player.keys.d.pressed = true;
                break;
            case ' ':
                game.player.keys[" "].pressed = true;
                break;
        }
    }
});

window.addEventListener('keyup', (e) => {
    if (game && game.player) {
        switch(e.key.toLowerCase()) {
            case 'w':
            case 'arrowup':
                game.player.keys.w.pressed = false;
                break;
            case 'a':
            case 'arrowleft':
                game.player.keys.a.pressed = false;
                break;
            case 's':
            case 'arrowdown':
                game.player.keys.s.pressed = false;
                break;
            case 'd':
            case 'arrowright':
                game.player.keys.d.pressed = false;
                break;
            case ' ':
                game.player.keys[" "].pressed = false;
                break;
        }
    }
}); 