const Game = {
    board: [],
    gridSize: 12,
    currentLevel: 1,
    score: 0,
    timeLeft: 60,
    targetScore: 500,
    colorCount: 4,
    isPlaying: false,
    isPaused: false,
    isProcessing: false,
    timerInterval: null,
    comboCount: 0,
    lastEliminateTime: 0,
    pendingChestReward: 0,
    health: 3,
    maxHealth: 3,
    defeatReason: 'time',
    isWatchingAd: false,

    colors: ['pink', 'cyan', 'green', 'yellow', 'orange', 'purple'],

    init() {
        this.bindEvents();
        this.setupResizeObserver();
    },

    setupResizeObserver() {
        const resizeObserver = new ResizeObserver(() => {
            this.adjustBoardSize();
        });
        
        const gamePage = document.getElementById('game-page');
        if (gamePage) {
            resizeObserver.observe(gamePage);
        }
        
        window.addEventListener('resize', () => this.adjustBoardSize());
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.adjustBoardSize(), 100);
        });
    },

    adjustBoardSize() {
        const boardElement = document.getElementById('game-board');
        if (!boardElement || !this.isPlaying) return;

        const gamePage = document.getElementById('game-page');
        if (!gamePage) return;

        const header = gamePage.querySelector('.game-header');
        const headerHeight = header ? header.offsetHeight : 60;
        
        const availableHeight = gamePage.clientHeight - headerHeight - 30;
        const availableWidth = gamePage.clientWidth - 16;
        
        const blockCount = this.gridSize;
        const gap = 2;
        const padding = 12;
        
        const totalGap = gap * (blockCount - 1);
        const totalPadding = padding;
        
        const blockSizeByWidth = (availableWidth - totalGap - totalPadding) / blockCount;
        const blockSizeByHeight = (availableHeight - totalGap - totalPadding) / blockCount;
        
        const blockSize = Math.min(blockSizeByWidth, blockSizeByHeight);
        const finalSize = blockSize * blockCount + totalGap + totalPadding;
        
        boardElement.style.width = `${finalSize}px`;
        boardElement.style.height = `${finalSize}px`;
    },

    bindEvents() {
        const board = document.getElementById('game-board');
        if (board) {
            board.addEventListener('click', (e) => {
                if (!this.isPlaying || this.isPaused || this.isProcessing) return;

                const block = e.target.closest('.block');
                if (block) {
                    const row = parseInt(block.dataset.row);
                    const col = parseInt(block.dataset.col);
                    this.handleBlockClick(row, col, block);
                }
            });

            board.addEventListener('touchstart', (e) => {
                if (!this.isPlaying || this.isPaused || this.isProcessing) return;
                
                const touch = e.touches[0];
                const target = document.elementFromPoint(touch.clientX, touch.clientY);
                const block = target ? target.closest('.block') : null;
                
                if (block) {
                    const row = parseInt(block.dataset.row);
                    const col = parseInt(block.dataset.col);
                    this.handleBlockClick(row, col, block);
                }
            }, { passive: true });
        }
    },

    startLevel(levelNum) {
        this.currentLevel = levelNum;
        const level = LevelManager.getLevel(levelNum);

        this.gridSize = level.gridSize;
        this.timeLeft = level.time;
        this.targetScore = level.target;
        this.colorCount = level.colors;
        this.score = 0;
        this.comboCount = 0;
        this.health = this.maxHealth;
        this.isPlaying = true;
        this.isPaused = false;
        this.isProcessing = false;
        this.isWatchingAd = false;
        this.defeatReason = 'time';

        UI.showPage('game');
        UI.showLevelInfo(levelNum);
        UI.updateHealth(this.health);
        this.createBoard();
        this.startTimer();

        AudioManager.startBgm();
    },

    createBoard() {
        this.board = [];
        const boardElement = document.getElementById('game-board');
        if (!boardElement) return;

        boardElement.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
        boardElement.innerHTML = '';

        for (let row = 0; row < this.gridSize; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.gridSize; col++) {
                const color = this.getRandomColor();
                this.board[row][col] = color;

                const block = document.createElement('div');
                block.className = `block ${color}`;
                block.dataset.row = row;
                block.dataset.col = col;
                boardElement.appendChild(block);
            }
        }

        setTimeout(() => this.adjustBoardSize(), 10);

        UI.updateGameUI(this.timeLeft, this.score, this.targetScore);
    },

    getRandomColor() {
        const availableColors = this.colors.slice(0, this.colorCount);
        return availableColors[Math.floor(Math.random() * availableColors.length)];
    },

    handleBlockClick(row, col, blockElement) {
        if (isNaN(row) || isNaN(col)) return;
        if (row < 0 || row >= this.gridSize || col < 0 || col >= this.gridSize) return;

        const color = this.board[row][col];
        if (!color) return;

        const connected = this.findConnectedBlocks(row, col, color);

        if (connected.length >= 3) {
            this.eliminateBlocks(connected);
        } else {
            this.wrongClick(blockElement);
        }
    },

    wrongClick(blockElement) {
        if (blockElement) {
            blockElement.classList.add('wrong-click');
            setTimeout(() => {
                blockElement.classList.remove('wrong-click');
            }, 300);
        }

        this.health--;
        UI.updateHealth(this.health);
        AudioManager.playClick();

        if (this.health <= 0) {
            this.defeatReason = 'health';
            this.endGame();
        }
    },

    findConnectedBlocks(startRow, startCol, color) {
        const visited = new Set();
        const connected = [];
        const stack = [[startRow, startCol]];

        while (stack.length > 0) {
            const [row, col] = stack.pop();
            const key = `${row},${col}`;

            if (visited.has(key)) continue;
            if (row < 0 || row >= this.gridSize || col < 0 || col >= this.gridSize) continue;
            if (this.board[row][col] !== color) continue;

            visited.add(key);
            connected.push([row, col]);

            stack.push([row - 1, col]);
            stack.push([row + 1, col]);
            stack.push([row, col - 1]);
            stack.push([row, col + 1]);
        }

        return connected;
    },

    eliminateBlocks(blocks) {
        this.isProcessing = true;

        const now = Date.now();
        if (now - this.lastEliminateTime < 1000) {
            this.comboCount++;
        } else {
            this.comboCount = 1;
        }
        this.lastEliminateTime = now;

        AudioManager.playEliminate(blocks.length);

        if (this.comboCount > 1) {
            UI.showCombo(this.comboCount);
        }

        const baseScore = blocks.length * 10;
        const comboBonus = this.comboCount > 1 ? Math.floor(baseScore * (this.comboCount - 1) * 0.5) : 0;
        const totalScore = baseScore + comboBonus;
        this.score += totalScore;

        blocks.forEach(([row, col]) => {
            this.board[row][col] = null;
        });

        this.dropBlocks();
        this.fillBoard();
        this.updateBoardDisplay();
        UI.updateGameUI(this.timeLeft, this.score, this.targetScore);

        this.isProcessing = false;

        if (this.score >= this.targetScore && !this.hasValidMoves()) {
            this.triggerChest();
        }
    },

    dropBlocks() {
        for (let col = 0; col < this.gridSize; col++) {
            let emptyRow = this.gridSize - 1;

            for (let row = this.gridSize - 1; row >= 0; row--) {
                if (this.board[row][col] !== null) {
                    if (row !== emptyRow) {
                        this.board[emptyRow][col] = this.board[row][col];
                        this.board[row][col] = null;
                    }
                    emptyRow--;
                }
            }
        }
    },

    fillBoard() {
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.board[row][col] === null) {
                    this.board[row][col] = this.getRandomColor();
                }
            }
        }
    },

    updateBoardDisplay() {
        const boardElement = document.getElementById('game-board');
        if (!boardElement) return;

        const blocks = boardElement.querySelectorAll('.block');
        const expectedCount = this.gridSize * this.gridSize;
        
        if (blocks.length !== expectedCount) {
            this.createBoard();
            return;
        }

        blocks.forEach((block, index) => {
            const row = Math.floor(index / this.gridSize);
            const col = index % this.gridSize;
            const color = this.board[row][col];

            block.className = `block ${color}`;
            block.dataset.row = row;
            block.dataset.col = col;
        });
    },

    getBlockElement(row, col) {
        return document.querySelector(`.block[data-row="${row}"][data-col="${col}"]`);
    },

    hasValidMoves() {
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const color = this.board[row][col];
                if (color) {
                    const connected = this.findConnectedBlocks(row, col, color);
                    if (connected.length >= 3) {
                        return true;
                    }
                }
            }
        }
        return false;
    },

    startTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        this.timerInterval = setInterval(() => {
            if (this.isPaused || this.isWatchingAd) return;

            this.timeLeft--;
            UI.updateGameUI(this.timeLeft, this.score, this.targetScore);

            if (this.timeLeft <= 0) {
                this.defeatReason = 'time';
                this.endGame();
            }
        }, 1000);
    },

    pause() {
        this.isPaused = true;
        UI.showModal('pause');
    },

    resume() {
        this.isPaused = false;
    },

    endGame() {
        this.isPlaying = false;
        clearInterval(this.timerInterval);
        AudioManager.stopBgm();

        if (this.score >= this.targetScore) {
            const stars = LevelManager.completeLevel(this.currentLevel, this.score);
            AudioManager.playVictory();
            UI.showModal('victory', {
                score: this.score,
                target: this.targetScore,
                stars: stars
            });
        } else {
            AudioManager.playDefeat();
            UI.showModal('defeat', {
                score: this.score,
                target: this.targetScore,
                reason: this.defeatReason
            });
        }
    },

    nextLevel() {
        if (this.currentLevel < LevelManager.maxLevel) {
            this.startLevel(this.currentLevel + 1);
        } else {
            UI.showPage('home');
        }
    },

    restartLevel() {
        this.startLevel(this.currentLevel);
    },

    revive() {
        this.health = this.maxHealth;
        this.timeLeft += 30;
        this.isPlaying = true;
        this.isWatchingAd = false;
        this.startTimer();
        AudioManager.startBgm();
        UI.updateHealth(this.health);
        UI.updateGameUI(this.timeLeft, this.score, this.targetScore);
    },

    startWatchingAd() {
        this.isWatchingAd = true;
    },

    stopWatchingAd() {
        this.isWatchingAd = false;
    },

    triggerChest() {
        if (Math.random() < 0.3) {
            this.pendingChestReward = Math.floor(this.score * 0.1);
            AudioManager.playChest();
            UI.showModal('chest', { reward: this.pendingChestReward });
        }
    },

    addChestReward(reward) {
        this.score += reward;
        UI.updateGameUI(this.timeLeft, this.score, this.targetScore);
    },

    doubleReward() {
        const doubled = this.pendingChestReward * 2;
        this.score += doubled;
        UI.updateGameUI(this.timeLeft, this.score, this.targetScore);
    },

    openChest() {
        this.triggerChest();
    }
};

window.Game = Game;
