const I18N = {
    en: {
        title: 'Particle Blast',
        startGame: 'Start',
        shareTikTok: 'Share to TikTok',
        score: 'Score',
        combo: 'Combo',
        gameOver: 'Game Over',
        finalScore: 'Final Score',
        watchAdRevive: 'Watch Ad to Revive',
        backToHome: 'Back to Home',
        levelComplete: 'Level Complete!',
        nextLevel: 'Next Level',
        tiktokDesc: 'Share your game score on TikTok and challenge your friends!',
        openTikTok: 'Open TikTok',
        back: 'Back',
        shuffled: 'Shuffled!',
        adLoading: 'Loading ad...',
        level: 'Lv.'
    },
    ja: {
        title: 'パーティクルブラスト',
        startGame: 'スタート',
        shareTikTok: 'TikTokでシェア',
        score: 'スコア',
        combo: 'コンボ',
        gameOver: 'ゲームオーバー',
        finalScore: '最終スコア',
        watchAdRevive: '広告を見て復活',
        backToHome: 'ホームに戻る',
        levelComplete: 'レベルクリア！',
        nextLevel: '次のレベル',
        tiktokDesc: 'TikTokでゲームスコアをシェアして、友達と対戦しよう！',
        openTikTok: 'TikTokを開く',
        back: '戻る',
        shuffled: 'シャッフル！',
        adLoading: '広告読み込み中...',
        level: 'Lv.'
    }
};

class SoundManager {
    constructor() {
        this.enabled = true;
        this.audioCtx = null;
    }

    _ensureCtx() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
        return this.audioCtx;
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    playClick() {
        if (!this.enabled) return;
        const ctx = this._ensureCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.08);
    }

    playPop() {
        if (!this.enabled) return;
        const ctx = this._ensureCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
    }

    playCombo() {
        if (!this.enabled) return;
        const ctx = this._ensureCtx();
        const notes = [523, 659, 784];
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.06);
            gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.12);
            osc.start(ctx.currentTime + i * 0.06);
            osc.stop(ctx.currentTime + i * 0.06 + 0.12);
        });
    }

    playError() {
        if (!this.enabled) return;
        const ctx = this._ensureCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
    }

    playGameOver() {
        if (!this.enabled) return;
        const ctx = this._ensureCtx();
        const notes = [400, 350, 300, 200];
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
            gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.15);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.2);
            osc.start(ctx.currentTime + i * 0.15);
            osc.stop(ctx.currentTime + i * 0.15 + 0.2);
        });
    }

    playStart() {
        if (!this.enabled) return;
        const ctx = this._ensureCtx();
        const notes = [440, 554, 659, 880];
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
            gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.15);
            osc.start(ctx.currentTime + i * 0.08);
            osc.stop(ctx.currentTime + i * 0.08 + 0.15);
        });
    }

    playLand() {
        if (!this.enabled) return;
        const ctx = this._ensureCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.06);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.06);
    }

    playShuffle() {
        if (!this.enabled) return;
        const ctx = this._ensureCtx();
        const notes = [440, 554, 440, 659];
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.05);
            gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.05 + 0.08);
            osc.start(ctx.currentTime + i * 0.05);
            osc.stop(ctx.currentTime + i * 0.05 + 0.08);
        });
    }

    playLevelClear() {
        if (!this.enabled) return;
        const ctx = this._ensureCtx();
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
            gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.2);
            osc.start(ctx.currentTime + i * 0.1);
            osc.stop(ctx.currentTime + i * 0.1 + 0.2);
        });
    }

    playSnap() {
        if (!this.enabled) return;
        const ctx = this._ensureCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.05);
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.logicalWidth = 480;
        this.logicalHeight = 640;
        this.canvas.width = this.logicalWidth;
        this.canvas.height = this.logicalHeight;

        this.blockSize = 40;
        this.gridWidth = 12;
        this.gridHeight = 16;
        this.blocks = [];
        this.particles = [];
        this.fallingBlocks = [];
        this.slidingBlocks = [];
        this.eliminatingBlocks = [];
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.lives = 3;
        this.currentLevel = 1;
        this.isAnimating = false;
        this.shuffleHint = null;
        this.shuffleHintTimer = 0;
        this.lang = 'en';
        this.blocksEliminated = 0;
        this.levelTransitionAlpha = 0;
        this.isLevelTransitioning = false;

        this.sound = new SoundManager();

        this.scoreElement = document.getElementById('score');
        this.comboElement = document.getElementById('combo');
        this.homeScreen = document.getElementById('homeScreen');
        this.gameOverScreen = document.getElementById('gameOver');
        this.finalScoreElement = document.getElementById('finalScore');
        this.startButton = document.getElementById('startButton');
        this.retryButton = document.getElementById('retryButton');
        this.homeButton = document.getElementById('homeButton');
        this.levelButtons = document.querySelectorAll('.level-button');
        this.langButtons = document.querySelectorAll('.lang-button');
        this.volumeToggle = document.getElementById('volumeToggle');
        this.gameCloseBtn = document.getElementById('gameCloseBtn');
        this.gameInfo = document.getElementById('gameInfo');
        this.livesContainer = document.getElementById('livesContainer');
        this.tiktokButton = document.getElementById('tiktokButton');
        this.tiktokScreen = document.getElementById('tiktokScreen');
        this.tiktokCloseBtn = document.getElementById('tiktokCloseBtn');
        this.levelCompleteOverlay = document.getElementById('levelComplete');
        this.levelCompleteScore = document.getElementById('levelCompleteScore');
        this.nextLevelBtn = document.getElementById('nextLevelBtn');

        this.allColors = [
            '#E63946', '#2EC4B6', '#3A86FF', '#FFBE0B', '#A855F7', '#FF6F91',
            '#06D6A0', '#F77F00', '#7209B7', '#4CC9F0', '#D62828', '#80ED99',
            '#FB5607', '#3A0CA3', '#4361EE', '#F72585'
        ];

        this.levelConfig = {
            1: { colorCount: 5, totalBlocks: 144, blocksPerColor: 29 },
            2: { colorCount: 6, totalBlocks: 160, blocksPerColor: 27 },
            3: { colorCount: 8, totalBlocks: 176, blocksPerColor: 22 },
            4: { colorCount: 10, totalBlocks: 192, blocksPerColor: 20 },
            5: { colorCount: 12, totalBlocks: 192, blocksPerColor: 16 }
        };

        this.isGameOver = false;
        this.isPlaying = false;
        this.lastTime = 0;
        this.gravity = 1800;

        this.hintConfig = {
            idleTimeThreshold: 5,
            highlightColor: '#FFBE0B',
            flashFrequency: 3,
            highlightDuration: 3,
            minPromptInterval: 10
        };

        this.hintState = {
            idleTime: 0,
            lastHintTime: -Infinity,
            activeHint: null,
            hintTimer: 0,
            flashPhase: 0
        };

        this.applyLanguage(this.lang);
        this.setupEventListeners();
        this.startGameLoop();
    }

    t(key) {
        return I18N[this.lang][key] || I18N['en'][key] || key;
    }

    applyLanguage(lang) {
        this.lang = lang;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (I18N[lang] && I18N[lang][key]) {
                el.textContent = I18N[lang][key];
            }
        });
        this.levelButtons.forEach(btn => {
            const lv = btn.dataset.level;
            btn.textContent = this.t('level') + lv;
        });
    }

    setupEventListeners() {
        this.startButton.addEventListener('click', () => {
            this.sound.playStart();
            this.startGame();
        });

        this.tiktokButton.addEventListener('click', () => {
            this.sound.playClick();
            this.tiktokScreen.classList.add('visible');
        });

        this.tiktokCloseBtn.addEventListener('click', () => {
            this.sound.playClick();
            this.tiktokScreen.classList.remove('visible');
        });

        this.levelButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.sound.playClick();
                this.levelButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                this.currentLevel = parseInt(button.dataset.level);
            });
        });

        this.langButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.sound.playClick();
                this.langButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                this.applyLanguage(button.dataset.lang);
            });
        });

        this.canvas.addEventListener('click', (e) => {
            if (!this.isPlaying || this.isAnimating) return;

            this.resetIdleTimer();

            const rect = this.canvas.getBoundingClientRect();
            const mouseX = (e.clientX - rect.left) / rect.width * this.logicalWidth;
            const mouseY = (e.clientY - rect.top) / rect.height * this.logicalHeight;

            const gridX = Math.floor(mouseX / this.blockSize);
            const gridY = Math.floor(mouseY / this.blockSize);

            if (gridX >= 0 && gridX < this.gridWidth && gridY >= 0 && gridY < this.gridHeight) {
                this.checkAndRemoveBlocks(gridX, gridY);
            }
        });

        this.retryButton.addEventListener('click', () => {
            this.sound.playClick();
            this.watchAdAndRetry();
        });

        this.homeButton.addEventListener('click', () => {
            this.sound.playClick();
            this.returnToHome();
        });

        this.nextLevelBtn.addEventListener('click', () => {
            this.sound.playClick();
            this.goToNextLevel();
        });

        this.volumeToggle.addEventListener('click', () => {
            const enabled = this.sound.toggle();
            this.volumeToggle.textContent = enabled ? '🔊' : '🔇';
        });

        this.gameCloseBtn.addEventListener('click', () => {
            this.sound.playClick();
            this.returnToHome();
        });

        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.resizeCanvas(), 100);
        });
    }

    resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const safeTop = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-top')) || 0;
        const safeBottom = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-bottom')) || 0;
        const safeLeft = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-left')) || 0;
        const safeRight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-right')) || 0;

        const paddingH = Math.round(Math.min(window.innerWidth * 0.04, 24));
        const paddingV = Math.round(Math.min(window.innerHeight * 0.02, 16));

        const availWidth = window.innerWidth - safeLeft - safeRight - paddingH * 2;
        const availHeight = window.innerHeight - safeTop - safeBottom - paddingV * 2;

        const gameRatio = this.logicalWidth / this.logicalHeight;
        const screenRatio = availWidth / availHeight;

        let displayWidth, displayHeight;

        if (screenRatio > gameRatio) {
            displayHeight = availHeight;
            displayWidth = displayHeight * gameRatio;
        } else {
            displayWidth = availWidth;
            displayHeight = displayWidth / gameRatio;
        }

        this.canvas.style.width = displayWidth + 'px';
        this.canvas.style.height = displayHeight + 'px';
        this.canvas.style.position = 'absolute';
        this.canvas.style.left = (safeLeft + paddingH + (availWidth - displayWidth) / 2) + 'px';
        this.canvas.style.top = (safeTop + paddingV + (availHeight - displayHeight) / 2) + 'px';

        const renderWidth = Math.round(displayWidth * dpr);
        const renderHeight = Math.round(displayHeight * dpr);

        if (this.canvas.width !== renderWidth || this.canvas.height !== renderHeight) {
            this.canvas.width = renderWidth;
            this.canvas.height = renderHeight;
        }

        this.displayScaleX = renderWidth / this.logicalWidth;
        this.displayScaleY = renderHeight / this.logicalHeight;
        this.ctx.setTransform(this.displayScaleX, 0, 0, this.displayScaleY, 0, 0);
    }

    startGame() {
        this.homeScreen.classList.add('fade-out');
        setTimeout(() => {
            this.homeScreen.style.display = 'none';
            this.homeScreen.classList.remove('fade-out');
        }, 400);

        this.gameOverScreen.classList.remove('visible');
        this.levelCompleteOverlay.classList.remove('visible');
        this.score = 0;
        this.combo = 0;
        this.lives = 3;
        this.isGameOver = false;
        this.isPlaying = true;
        this.isAnimating = false;
        this.fallingBlocks = [];
        this.slidingBlocks = [];
        this.eliminatingBlocks = [];
        this.shuffleHint = null;
        this.blocksEliminated = 0;
        this.hintState = {
            idleTime: 0,
            lastHintTime: -Infinity,
            activeHint: null,
            hintTimer: 0,
            flashPhase: 0
        };
        this.gameInfo.style.display = 'block';
        this.livesContainer.style.display = 'block';
        this.gameCloseBtn.style.display = 'flex';
        this.updateLivesDisplay();
        this.updateScoreDisplay();
        this.updateComboDisplay();
        this.initBlocks();
    }

    getLevelColors(level) {
        const count = this.levelConfig[level].colorCount;
        return this.allColors.slice(0, count);
    }

    initBlocks() {
        const config = this.levelConfig[this.currentLevel];
        const colors = this.getLevelColors(this.currentLevel);
        const totalBlocks = config.totalBlocks;

        const filledRows = Math.ceil(totalBlocks / this.gridWidth);
        const lastRowBlocks = totalBlocks % this.gridWidth || this.gridWidth;

        let colorPool = [];
        const baseCount = Math.floor(totalBlocks / config.colorCount);
        const remainder = totalBlocks % config.colorCount;

        for (let i = 0; i < config.colorCount; i++) {
            const count = baseCount + (i < remainder ? 1 : 0);
            for (let j = 0; j < count; j++) {
                colorPool.push(colors[i]);
            }
        }

        this.shuffleArray(colorPool);

        this.blocks = [];
        let idx = 0;
        for (let y = 0; y < this.gridHeight; y++) {
            this.blocks[y] = [];
            const rowBlocks = (y < filledRows - 1) ? this.gridWidth : (y === filledRows - 1 ? lastRowBlocks : 0);
            for (let x = 0; x < this.gridWidth; x++) {
                if (y < filledRows && x < rowBlocks && idx < colorPool.length) {
                    this.blocks[y][x] = {
                        color: colorPool[idx++],
                        x: x,
                        y: y,
                        renderY: y * this.blockSize,
                        renderX: x * this.blockSize,
                        scale: 1,
                        alpha: 1
                    };
                } else {
                    this.blocks[y][x] = null;
                }
            }
        }

        if (!this.hasValidMatch()) {
            this.initBlocks();
            return;
        }

        this.ensureValidMatches();
    }

    shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }

    hasValidMatch() {
        const visited = Array(this.gridHeight).fill().map(() => Array(this.gridWidth).fill(false));

        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                if (!this.blocks[y] || !this.blocks[y][x] || visited[y][x]) continue;

                const color = this.blocks[y][x].color;
                const group = this.findConnectedBlocks(x, y, color);

                for (const pos of group) {
                    visited[pos.y][pos.x] = true;
                }

                if (group.length >= 3) {
                    return true;
                }
            }
        }
        return false;
    }

    findAnyValidMatch() {
        const visited = Array(this.gridHeight).fill().map(() => Array(this.gridWidth).fill(false));

        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                if (!this.blocks[y] || !this.blocks[y][x] || visited[y][x]) continue;

                const color = this.blocks[y][x].color;
                const group = this.findConnectedBlocks(x, y, color);

                for (const pos of group) {
                    visited[pos.y][pos.x] = true;
                }

                if (group.length >= 3) {
                    return group;
                }
            }
        }
        return null;
    }

    ensureValidMatches() {
        let attempts = 0;
        while (!this.hasValidMatch() && attempts < 100) {
            this.shuffleBoardColors();
            attempts++;
        }

        if (!this.hasValidMatch()) {
            this.forceCreateMatch();
        }
    }

    shuffleBoardColors() {
        const colors = [];
        const positions = [];

        for (let y = 0; y < this.gridHeight; y++) {
            if (!this.blocks[y]) continue;
            for (let x = 0; x < this.gridWidth; x++) {
                if (this.blocks[y][x]) {
                    colors.push(this.blocks[y][x].color);
                    positions.push({x, y});
                }
            }
        }

        this.shuffleArray(colors);

        for (let i = 0; i < positions.length; i++) {
            this.blocks[positions[i].y][positions[i].x].color = colors[i];
        }
    }

    forceCreateMatch() {
        const colors = this.getLevelColors(this.currentLevel);
        const color = colors[Math.floor(Math.random() * colors.length)];

        for (let y = 0; y < this.gridHeight - 2; y++) {
            for (let x = 0; x < this.gridWidth - 2; x++) {
                if (this.blocks[y][x] && this.blocks[y][x + 1] && this.blocks[y][x + 2]) {
                    this.blocks[y][x].color = color;
                    this.blocks[y][x + 1].color = color;
                    this.blocks[y][x + 2].color = color;
                    return;
                }
            }
        }
    }

    checkAndRemoveBlocks(x, y) {
        if (!this.blocks[y] || !this.blocks[y][x]) return;
        const targetColor = this.blocks[y][x].color;
        const connectedBlocks = this.findConnectedBlocks(x, y, targetColor);

        if (connectedBlocks.length >= 3) {
            this.resetIdleTimer();
            this.removeBlocks(connectedBlocks);
            this.updateScore(connectedBlocks.length);
            this.updateCombo();
            if (this.combo >= 3) {
                this.sound.playCombo();
            } else {
                this.sound.playPop();
            }
        } else {
            this.sound.playError();

            if (!this.hasValidMatch()) {
                this.shuffleBoardColors();
                this.ensureValidMatches();
                this.sound.playShuffle();
                this.shuffleHint = { text: this.t('shuffled'), timer: 2.0 };
            } else {
                this.lives--;
                this.updateLivesDisplay();
                if (this.lives <= 0) {
                    this.gameOver();
                }
            }
        }
    }

    findConnectedBlocks(x, y, color) {
        const visited = new Uint8Array(this.gridHeight * this.gridWidth);
        const stack = [x, y];
        const connected = [];

        while (stack.length > 0) {
            const cy = stack.pop();
            const cx = stack.pop();

            if (cx < 0 || cx >= this.gridWidth || cy < 0 || cy >= this.gridHeight) continue;
            const key = cy * this.gridWidth + cx;
            if (visited[key]) continue;
            if (!this.blocks[cy] || !this.blocks[cy][cx] || this.blocks[cy][cx].color !== color) continue;

            visited[key] = 1;
            connected.push({x: cx, y: cy});

            stack.push(cx + 1, cy);
            stack.push(cx - 1, cy);
            stack.push(cx, cy + 1);
            stack.push(cx, cy - 1);
        }

        return connected;
    }

    removeBlocks(blocks) {
        this.eliminatingBlocks = [];
        blocks.forEach(({x, y}) => {
            this.createParticles(x, y, this.blocks[y][x].color);
            this.eliminatingBlocks.push({
                x: x,
                y: y,
                color: this.blocks[y][x].color,
                scale: 1,
                alpha: 1
            });
            this.blocks[y][x] = null;
            this.blocksEliminated++;
        });

        this.isAnimating = true;
        this.eliminationTimer = 0.25;
    }

    createParticles(x, y, color) {
        const particleCount = 20 + this.combo * 3;
        const centerX = (x + 0.5) * this.blockSize;
        const centerY = (y + 0.5) * this.blockSize;

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 / particleCount) * i + Math.random() * 0.1;
            const speed = 3 + Math.random() * 4 + this.combo * 0.8;
            const size = 2 + Math.random() * 4;
            const decay = 0.02 + Math.random() * 0.04;

            this.particles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: size,
                color: color,
                life: 1.0,
                decay: decay
            });
        }

        if (this.combo >= 5) {
            this.createComboEffect(centerX, centerY, color);
        }
    }

    createComboEffect(x, y, color) {
        for (let i = 0; i < 10; i++) {
            const angle = (Math.PI * 2 / 10) * i;
            const speed = 5 + Math.random() * 3;

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 4 + Math.random() * 3,
                color: '#fff',
                life: 1.2,
                decay: 0.015,
                isSpecial: true
            });
        }
    }

    applyGravity() {
        this.fallingBlocks = [];

        for (let x = 0; x < this.gridWidth; x++) {
            let emptyRow = this.gridHeight - 1;

            for (let y = this.gridHeight - 1; y >= 0; y--) {
                if (this.blocks[y] && this.blocks[y][x]) {
                    if (y !== emptyRow) {
                        const block = this.blocks[y][x];
                        this.blocks[emptyRow][x] = block;
                        this.blocks[y][x] = null;

                        const fromY = y * this.blockSize;
                        const toY = emptyRow * this.blockSize;

                        this.fallingBlocks.push({
                            gridX: x,
                            gridY: emptyRow,
                            renderY: fromY,
                            targetY: toY,
                            velocity: 0,
                            bounces: 0
                        });

                        block.renderY = fromY;
                        block.y = emptyRow;
                    }
                    emptyRow--;
                }
            }

            const colors = this.getLevelColors(this.currentLevel);
            let newBlockIndex = 0;
            for (let y = emptyRow; y >= 0; y--) {
                if (!this.blocks[y]) this.blocks[y] = [];
                const color = colors[Math.floor(Math.random() * colors.length)];
                this.blocks[y][x] = {
                    color: color,
                    x: x,
                    y: y,
                    renderY: -(newBlockIndex + 1) * this.blockSize,
                    renderX: x * this.blockSize,
                    scale: 1,
                    alpha: 1
                };

                this.fallingBlocks.push({
                    gridX: x,
                    gridY: y,
                    renderY: -(newBlockIndex + 1) * this.blockSize,
                    targetY: y * this.blockSize,
                    velocity: 0,
                    bounces: 0
                });

                newBlockIndex++;
            }
        }

        if (this.fallingBlocks.length > 0) {
            this.isAnimating = true;
        }
    }

    applySnap() {
        this.slidingBlocks = [];
        let hasSnapped = false;

        const isolated = [];
        for (let y = 0; y < this.gridHeight; y++) {
            if (!this.blocks[y]) continue;
            for (let x = 0; x < this.gridWidth; x++) {
                if (!this.blocks[y][x]) continue;
                let hasNeighbor = false;
                if (y > 0 && this.blocks[y - 1] && this.blocks[y - 1][x]) hasNeighbor = true;
                if (y < this.gridHeight - 1 && this.blocks[y + 1] && this.blocks[y + 1][x]) hasNeighbor = true;
                if (x > 0 && this.blocks[y][x - 1]) hasNeighbor = true;
                if (x < this.gridWidth - 1 && this.blocks[y][x + 1]) hasNeighbor = true;
                if (!hasNeighbor) {
                    isolated.push({x, y});
                }
            }
        }

        for (const pos of isolated) {
            const block = this.blocks[pos.y][pos.x];
            if (!block) continue;

            let bestX = pos.x;
            let found = false;

            for (let nx = pos.x - 1; nx >= 0; nx--) {
                if (this.blocks[pos.y][nx]) break;

                let hasAdj = false;
                if (pos.y > 0 && this.blocks[pos.y - 1] && this.blocks[pos.y - 1][nx]) hasAdj = true;
                if (pos.y < this.gridHeight - 1 && this.blocks[pos.y + 1] && this.blocks[pos.y + 1][nx]) hasAdj = true;
                if (nx > 0 && this.blocks[pos.y][nx - 1]) hasAdj = true;

                if (hasAdj) {
                    bestX = nx;
                    found = true;
                    break;
                }
            }

            if (!found) {
                for (let nx = pos.x + 1; nx < this.gridWidth; nx++) {
                    if (this.blocks[pos.y][nx]) break;

                    let hasAdj = false;
                    if (pos.y > 0 && this.blocks[pos.y - 1] && this.blocks[pos.y - 1][nx]) hasAdj = true;
                    if (pos.y < this.gridHeight - 1 && this.blocks[pos.y + 1] && this.blocks[pos.y + 1][nx]) hasAdj = true;
                    if (nx < this.gridWidth - 1 && this.blocks[pos.y][nx + 1]) hasAdj = true;

                    if (hasAdj) {
                        bestX = nx;
                        found = true;
                        break;
                    }
                }
            }

            if (bestX !== pos.x) {
                this.blocks[pos.y][pos.x] = null;
                this.blocks[pos.y][bestX] = block;

                const fromX = pos.x * this.blockSize;
                const toX = bestX * this.blockSize;

                this.slidingBlocks.push({
                    gridX: bestX,
                    gridY: pos.y,
                    fromRenderX: fromX,
                    toRenderX: toX,
                    progress: 0
                });

                block.renderX = fromX;
                block.x = bestX;
                hasSnapped = true;
            }
        }

        if (hasSnapped) {
            this.sound.playSnap();
        }

        return hasSnapped;
    }

    hasIsolatedBlocks() {
        for (let y = 0; y < this.gridHeight; y++) {
            if (!this.blocks[y]) continue;
            for (let x = 0; x < this.gridWidth; x++) {
                if (!this.blocks[y][x]) continue;
                let hasNeighbor = false;
                if (y > 0 && this.blocks[y - 1] && this.blocks[y - 1][x]) hasNeighbor = true;
                if (y < this.gridHeight - 1 && this.blocks[y + 1] && this.blocks[y + 1][x]) hasNeighbor = true;
                if (x > 0 && this.blocks[y][x - 1]) hasNeighbor = true;
                if (x < this.gridWidth - 1 && this.blocks[y][x + 1]) hasNeighbor = true;
                if (!hasNeighbor) return true;
            }
        }
        return false;
    }

    checkLevelComplete() {
        const config = this.levelConfig[this.currentLevel];
        if (this.blocksEliminated >= config.totalBlocks) {
            this.sound.playLevelClear();
            this.levelCompleteScore.textContent = this.score;
            this.levelCompleteOverlay.classList.add('visible');
            return true;
        }
        return false;
    }

    goToNextLevel() {
        this.levelCompleteOverlay.classList.remove('visible');

        this.isLevelTransitioning = true;
        this.levelTransitionAlpha = 0;

        const nextLevel = this.currentLevel + 1;
        if (nextLevel > 5) {
            this.returnToHome();
            return;
        }

        this.currentLevel = nextLevel;
        this.levelButtons.forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.dataset.level) === nextLevel) {
                btn.classList.add('active');
            }
        });

        this.combo = 0;
        this.blocksEliminated = 0;
        this.fallingBlocks = [];
        this.slidingBlocks = [];
        this.eliminatingBlocks = [];
        this.isAnimating = false;
        this.shuffleHint = null;

        this.updateComboDisplay();

        setTimeout(() => {
            this.initBlocks();
            this.isLevelTransitioning = false;
        }, 500);
    }

    updateFallingBlocks(dt) {
        if (!this.isAnimating || this.eliminatingBlocks.length > 0) return;

        if (this.slidingBlocks.length > 0) {
            this.updateSlidingBlocks(dt);
            return;
        }

        let allSettled = true;
        const bounceDecay = 0.3;
        const maxBounces = 2;

        for (const fb of this.fallingBlocks) {
            if (fb.bounces > maxBounces) continue;

            fb.velocity += this.gravity * dt;
            fb.renderY += fb.velocity * dt;

            if (fb.renderY >= fb.targetY) {
                fb.renderY = fb.targetY;
                fb.bounces++;

                if (fb.bounces <= maxBounces) {
                    fb.velocity = -fb.velocity * bounceDecay;
                    allSettled = false;
                    if (fb.bounces === 1) {
                        this.sound.playLand();
                    }
                } else {
                    fb.velocity = 0;
                    fb.renderY = fb.targetY;
                }
            } else {
                allSettled = false;
            }
        }

        if (allSettled) {
            this.isAnimating = false;
            this.fallingBlocks = [];

            for (let y = 0; y < this.gridHeight; y++) {
                if (!this.blocks[y]) continue;
                for (let x = 0; x < this.gridWidth; x++) {
                    if (this.blocks[y][x]) {
                        this.blocks[y][x].renderY = y * this.blockSize;
                        this.blocks[y][x].renderX = x * this.blockSize;
                    }
                }
            }

            if (this.hasIsolatedBlocks()) {
                this.applySnap();
                if (this.slidingBlocks.length > 0) {
                    this.isAnimating = true;
                }
            }

            if (!this.hasValidMatch() && this.slidingBlocks.length === 0) {
                this.shuffleBoardColors();
                this.ensureValidMatches();
                this.sound.playShuffle();
                this.shuffleHint = { text: this.t('shuffled'), timer: 2.0 };
            }

            if (!this.checkLevelComplete() && this.slidingBlocks.length === 0) {
                this.isAnimating = false;
            }
        }
    }

    updateSlidingBlocks(dt) {
        const slideSpeed = 12;
        let allDone = true;

        for (const sb of this.slidingBlocks) {
            sb.progress += dt * slideSpeed;
            if (sb.progress >= 1) {
                sb.progress = 1;
            } else {
                allDone = false;
            }

            const eased = 1 - Math.pow(1 - sb.progress, 3);
            const block = this.blocks[sb.gridY] && this.blocks[sb.gridY][sb.gridX];
            if (block) {
                block.renderX = sb.fromRenderX + (sb.toRenderX - sb.fromRenderX) * eased;
            }
        }

        if (allDone) {
            this.slidingBlocks = [];
            for (let y = 0; y < this.gridHeight; y++) {
                if (!this.blocks[y]) continue;
                for (let x = 0; x < this.gridWidth; x++) {
                    if (this.blocks[y][x]) {
                        this.blocks[y][x].renderX = x * this.blockSize;
                    }
                }
            }

            if (!this.hasValidMatch()) {
                this.shuffleBoardColors();
                this.ensureValidMatches();
                this.sound.playShuffle();
                this.shuffleHint = { text: this.t('shuffled'), timer: 2.0 };
            }

            if (!this.checkLevelComplete()) {
                this.isAnimating = false;
            }
        }
    }

    updateEliminationAnimation(dt) {
        if (this.eliminatingBlocks.length === 0) return;

        this.eliminationTimer -= dt;
        const progress = 1 - Math.max(0, this.eliminationTimer) / 0.25;

        for (const eb of this.eliminatingBlocks) {
            eb.scale = 1 - progress;
            eb.alpha = 1 - progress;
        }

        if (this.eliminationTimer <= 0) {
            this.eliminatingBlocks = [];
            this.applyGravity();
        }
    }

    updateScore(blockCount) {
        const baseScore = blockCount * 10;
        const comboBonus = this.combo * 8;
        const totalScore = baseScore + comboBonus;
        this.score += totalScore;
        this.updateScoreDisplay();
    }

    updateScoreDisplay() {
        this.scoreElement.textContent = this.score;
    }

    updateCombo() {
        this.combo++;
        this.updateComboDisplay();
        if (this.combo > this.maxCombo) {
            this.maxCombo = this.combo;
        }
    }

    updateComboDisplay() {
        this.comboElement.textContent = this.combo;
    }

    updateLivesDisplay() {
        this.livesContainer.innerHTML = '';
        for (let i = 0; i < this.lives; i++) {
            this.livesContainer.innerHTML += '<span class="heart">❤</span>';
        }
    }

    gameOver() {
        this.isGameOver = true;
        this.isPlaying = false;
        this.isAnimating = false;
        this.sound.playGameOver();
        this.finalScoreElement.textContent = this.score;
        this.gameOverScreen.classList.add('visible');
    }

    watchAdAndRetry() {
        this.retryButton.textContent = this.t('adLoading');
        this.retryButton.disabled = true;

        setTimeout(() => {
            this.lives = 1;
            this.updateLivesDisplay();
            this.gameOverScreen.classList.remove('visible');
            this.isGameOver = false;
            this.isPlaying = true;
            this.isAnimating = false;
            this.retryButton.textContent = this.t('watchAdRevive');
            this.retryButton.disabled = false;
            this.sound.playStart();
        }, 2000);
    }

    returnToHome() {
        this.gameOverScreen.classList.remove('visible');
        this.levelCompleteOverlay.classList.remove('visible');
        this.tiktokScreen.classList.remove('visible');
        this.homeScreen.style.display = 'flex';
        this.isPlaying = false;
        this.isAnimating = false;
        this.gameInfo.style.display = 'none';
        this.livesContainer.style.display = 'none';
        this.gameCloseBtn.style.display = 'none';
    }

    resetIdleTimer() {
        this.hintState.idleTime = 0;
        if (this.hintState.activeHint) {
            this.hintState.activeHint = null;
            this.hintState.hintTimer = 0;
        }
    }

    findBestMatch() {
        const visited = new Uint8Array(this.gridHeight * this.gridWidth);
        const allGroups = [];

        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                if (!this.blocks[y] || !this.blocks[y][x]) continue;
                const key = y * this.gridWidth + x;
                if (visited[key]) continue;

                const color = this.blocks[y][x].color;
                const group = this.findConnectedBlocks(x, y, color);

                for (const pos of group) {
                    visited[pos.y * this.gridWidth + pos.x] = 1;
                }

                if (group.length >= 3) {
                    allGroups.push(group);
                }
            }
        }

        if (allGroups.length === 0) return null;

        allGroups.sort((a, b) => b.length - a.length);

        const maxLen = allGroups[0].length;
        const topGroups = allGroups.filter(g => g.length === maxLen);

        return topGroups[Math.floor(Math.random() * topGroups.length)];
    }

    updateIdleHint(dt) {
        if (!this.isPlaying || this.isAnimating || this.isGameOver) return;

        if (this.hintState.activeHint) {
            this.hintState.hintTimer -= dt;
            this.hintState.flashPhase += dt * this.hintConfig.flashFrequency * Math.PI * 2;

            if (this.hintState.hintTimer <= 0) {
                this.hintState.activeHint = null;
                this.hintState.hintTimer = 0;
                this.hintState.flashPhase = 0;
            }
            return;
        }

        this.hintState.idleTime += dt;

        if (this.hintState.idleTime >= this.hintConfig.idleTimeThreshold) {
            const now = performance.now() / 1000;
            if (now - this.hintState.lastHintTime >= this.hintConfig.minPromptInterval) {
                const bestMatch = this.findBestMatch();
                if (bestMatch) {
                    this.hintState.activeHint = bestMatch;
                    this.hintState.hintTimer = this.hintConfig.highlightDuration;
                    this.hintState.flashPhase = 0;
                    this.hintState.lastHintTime = now;
                    this.hintState.idleTime = 0;
                }
            }
        }
    }

    drawHintHighlight() {
        if (!this.hintState.activeHint) return;

        const alpha = 0.4 + 0.6 * Math.abs(Math.sin(this.hintState.flashPhase));
        const color = this.hintConfig.highlightColor;

        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 3;
        this.ctx.shadowBlur = 12;
        this.ctx.shadowColor = color;

        for (const pos of this.hintState.activeHint) {
            const block = this.blocks[pos.y] && this.blocks[pos.y][pos.x];
            const rx = block ? block.renderX : pos.x * this.blockSize;
            const ry = block ? block.renderY : pos.y * this.blockSize;
            const bs = this.blockSize - 2;

            this.ctx.beginPath();
            this.ctx.roundRect(rx - 1, ry - 1, bs + 2, bs + 2, 5);
            this.ctx.stroke();
        }

        this.ctx.restore();
    }

    updateParticles(deltaTime) {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.1;
            particle.life -= particle.decay;

            if (particle.isSpecial) {
                particle.size += 0.1;
            }

            return particle.life > 0;
        });
    }

    drawBlock(x, y, renderY, color, renderX, scale, alpha) {
        const rx = renderX !== undefined ? renderX : x * this.blockSize;
        const ry = renderY;
        const s = scale !== undefined ? scale : 1;
        const a = alpha !== undefined ? alpha : 1;
        const bs = this.blockSize - 2;

        this.ctx.save();
        this.ctx.globalAlpha = a;

        if (s !== 1) {
            const cx = rx + this.blockSize / 2;
            const cy = ry + this.blockSize / 2;
            this.ctx.translate(cx, cy);
            this.ctx.scale(s, s);
            this.ctx.translate(-cx, -cy);
        }

        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.roundRect(rx, ry, bs, bs, 4);
        this.ctx.fill();

        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        this.ctx.fillRect(rx + 2, ry + 2, bs - 4, 3);

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        this.ctx.fillRect(rx + 2, ry + bs - 5, bs - 4, 3);

        this.ctx.restore();
    }

    draw() {
        this.ctx.fillStyle = '#0a0a1a';
        this.ctx.fillRect(0, 0, this.logicalWidth, this.logicalHeight);

        if (!this.isPlaying && !this.isLevelTransitioning) return;

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(0, 0, this.logicalWidth, this.logicalHeight);
        this.ctx.clip();

        const fallingSet = new Set();
        for (const fb of this.fallingBlocks) {
            fallingSet.add(`${fb.gridX},${fb.gridY}`);
        }

        const slidingSet = new Set();
        for (const sb of this.slidingBlocks) {
            slidingSet.add(`${sb.gridX},${sb.gridY}`);
        }

        for (let y = 0; y < this.gridHeight; y++) {
            if (!this.blocks[y]) continue;
            for (let x = 0; x < this.gridWidth; x++) {
                const block = this.blocks[y][x];
                if (block && !fallingSet.has(`${x},${y}`) && !slidingSet.has(`${x},${y}`)) {
                    this.drawBlock(x, y, block.renderY, block.color, block.renderX);
                }
            }
        }

        for (const fb of this.fallingBlocks) {
            const block = this.blocks[fb.gridY] && this.blocks[fb.gridY][fb.gridX];
            if (block) {
                this.drawBlock(fb.gridX, fb.gridY, fb.renderY, block.color, block.renderX);
            }
        }

        for (const sb of this.slidingBlocks) {
            const block = this.blocks[sb.gridY] && this.blocks[sb.gridY][sb.gridX];
            if (block) {
                this.drawBlock(sb.gridX, sb.gridY, block.renderY, block.color, block.renderX);
            }
        }

        for (const eb of this.eliminatingBlocks) {
            if (eb.alpha > 0) {
                this.drawBlock(eb.x, eb.y, eb.y * this.blockSize, eb.color, eb.x * this.blockSize, eb.scale, eb.alpha);
            }
        }

        this.ctx.restore();

        this.drawHintHighlight();

        this.particles.forEach(particle => {
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();

            if (particle.isSpecial) {
                this.ctx.shadowBlur = 20;
                this.ctx.shadowColor = particle.color;
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
            }
        });

        this.ctx.globalAlpha = 1;

        if (this.shuffleHint && this.shuffleHint.timer > 0) {
            this.ctx.save();
            this.ctx.font = 'bold 28px "Segoe UI", Arial, sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillStyle = '#FFBE0B';
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = '#FFBE0B';
            this.ctx.fillText(this.shuffleHint.text, this.logicalWidth / 2, this.logicalHeight / 2);
            this.ctx.restore();
        }

        if (this.isLevelTransitioning) {
            this.ctx.fillStyle = `rgba(10, 10, 26, ${this.levelTransitionAlpha})`;
            this.ctx.fillRect(0, 0, this.logicalWidth, this.logicalHeight);

            if (this.levelTransitionAlpha > 0.3) {
                this.ctx.save();
                this.ctx.font = 'bold 32px "Segoe UI", Arial, sans-serif';
                this.ctx.textAlign = 'center';
                this.ctx.fillStyle = '#00f5d4';
                this.ctx.shadowBlur = 20;
                this.ctx.shadowColor = '#00f5d4';
                this.ctx.globalAlpha = Math.min(1, (this.levelTransitionAlpha - 0.3) / 0.3);
                this.ctx.fillText(
                    this.t('level') + this.currentLevel,
                    this.logicalWidth / 2,
                    this.logicalHeight / 2
                );
                this.ctx.restore();
            }
        }
    }

    gameLoop(timestamp) {
        const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
        this.lastTime = timestamp;

        if (this.shuffleHint) {
            this.shuffleHint.timer -= dt;
            if (this.shuffleHint.timer <= 0) {
                this.shuffleHint = null;
            }
        }

        if (this.isLevelTransitioning) {
            this.levelTransitionAlpha = Math.min(1, this.levelTransitionAlpha + dt * 3);
        }

        this.updateEliminationAnimation(dt);
        this.updateFallingBlocks(dt);
        this.updateIdleHint(dt);
        this.updateParticles(dt);
        this.draw();

        requestAnimationFrame((time) => this.gameLoop(time));
    }

    startGameLoop() {
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

window.addEventListener('load', () => {
    new Game();
});
