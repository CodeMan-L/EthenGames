class Game2048 {
    constructor() {
        this.grid = [];
        this.gridSize = 4;
        this.score = 0;
        this.currentLevel = 1;
        this.targetNumber = 256;
        this.history = [];
        this.maxHistory = 5;
        this.isGameOver = false;
        this.isWin = false;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.rewardValue = null;
    }
    
    init() {
        LevelSystem.init();
        AudioManager.init();
        UI.init();
        
        this.bindEvents();
        this.showHome();
    }
    
    bindEvents() {
        document.getElementById('btn-start').addEventListener('click', () => {
            AudioManager.resume();
            AudioManager.playClick();
            const progress = LevelSystem.getProgress();
            this.startGame(progress.currentLevel);
        });
        
        document.getElementById('btn-levels').addEventListener('click', () => {
            AudioManager.playClick();
            this.showLevels();
        });
        
        document.getElementById('btn-settings').addEventListener('click', () => {
            AudioManager.playClick();
            this.showSettings();
        });
        
        document.getElementById('btn-share').addEventListener('click', () => {
            AudioManager.playClick();
            this.shareToTikTok();
        });
        
        document.getElementById('btn-sound').addEventListener('click', () => {
            AudioManager.resume();
            AudioManager.toggleSfx();
            UI.updateSoundIcon();
        });
        
        document.getElementById('btn-home').addEventListener('click', () => {
            AudioManager.playClick();
            this.showHome();
        });
        
        document.getElementById('btn-undo').addEventListener('click', () => {
            if (this.history.length > 0) {
                this.showAdModal('undo');
            }
        });
        
        document.getElementById('btn-back-levels').addEventListener('click', () => {
            AudioManager.playClick();
            this.showHome();
        });
        
        document.getElementById('btn-back-settings').addEventListener('click', () => {
            AudioManager.playClick();
            this.showHome();
        });
        
        document.getElementById('toggle-sfx').addEventListener('change', (e) => {
            AudioManager.sfxEnabled = e.target.checked;
            AudioManager.saveSettings();
            UI.updateSoundIcon();
        });
        
        document.getElementById('toggle-bgm').addEventListener('change', (e) => {
            AudioManager.bgmEnabled = e.target.checked;
            AudioManager.saveSettings();
            if (e.target.checked) {
                AudioManager.playBgm();
            } else {
                AudioManager.stopBgm();
            }
            UI.updateSoundIcon();
        });
        
        document.getElementById('btn-reset').addEventListener('click', () => {
            this.confirmReset();
        });
        
        const gameScreen = document.getElementById('game-screen');
        
        gameScreen.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
        }, { passive: true });
        
        gameScreen.addEventListener('touchend', (e) => {
            if (this.isGameOver || this.isWin) return;
            if (!gameScreen.classList.contains('active')) return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const deltaX = touchEndX - this.touchStartX;
            const deltaY = touchEndY - this.touchStartY;
            
            const minSwipe = 30;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (Math.abs(deltaX) > minSwipe) {
                    if (deltaX > 0) {
                        this.move('right');
                    } else {
                        this.move('left');
                    }
                }
            } else {
                if (Math.abs(deltaY) > minSwipe) {
                    if (deltaY > 0) {
                        this.move('down');
                    } else {
                        this.move('up');
                    }
                }
            }
        }, { passive: true });
        
        document.addEventListener('keydown', (e) => {
            if (this.isGameOver || this.isWin) return;
            
            const keyMap = {
                'ArrowUp': 'up',
                'ArrowDown': 'down',
                'ArrowLeft': 'left',
                'ArrowRight': 'right'
            };
            
            if (keyMap[e.key]) {
                e.preventDefault();
                this.move(keyMap[e.key]);
            }
        });
    }
    
    showHome() {
        AudioManager.stopBgm();
        UI.showScreen('home');
        UI.updateHighScore();
    }
    
    showLevels() {
        UI.showScreen('levels');
        UI.renderLevels((levelId) => {
            this.startGame(levelId);
        });
    }
    
    showSettings() {
        UI.showScreen('settings');
        UI.updateSettingsUI();
    }
    
    startGame(levelId) {
        const level = LevelSystem.getLevel(levelId);
        if (!level) return;
        
        this.currentLevel = levelId;
        this.targetNumber = level.target;
        this.gridSize = level.gridSize;
        this.score = 0;
        this.history = [];
        this.isGameOver = false;
        this.isWin = false;
        
        this.initGrid();
        this.addRandomTile();
        this.addRandomTile();
        
        UI.showScreen('game');
        UI.updateGameInfo(this.currentLevel, this.score, this.targetNumber);
        this.renderBoard();
        UI.setUndoEnabled(false);
        
        AudioManager.playBgm();
        
        if (Math.random() < 0.3) {
            setTimeout(() => {
                this.showRewardModal();
            }, 2000);
        }
    }
    
    initGrid() {
        this.grid = [];
        for (let i = 0; i < this.gridSize; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.gridSize; j++) {
                this.grid[i][j] = 0;
            }
        }
        
        const board = document.getElementById('game-board');
        board.className = `grid-${this.gridSize}x${this.gridSize}`;
    }
    
    addRandomTile() {
        const emptyCells = [];
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({ row: i, col: j });
                }
            }
        }
        
        if (emptyCells.length === 0) return false;
        
        const cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        this.grid[cell.row][cell.col] = Math.random() < 0.9 ? 2 : 4;
        
        return true;
    }
    
    renderBoard() {
        const board = document.getElementById('game-board');
        board.innerHTML = '';
        
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                
                const value = this.grid[i][j];
                if (value === 0) {
                    cell.classList.add('empty');
                } else {
                    cell.textContent = value;
                    cell.setAttribute('data-value', value);
                }
                
                board.appendChild(cell);
            }
        }
    }
    
    saveState() {
        const state = {
            grid: this.grid.map(row => [...row]),
            score: this.score
        };
        
        this.history.push(state);
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }
        
        UI.setUndoEnabled(true);
    }
    
    undo() {
        if (this.history.length === 0) return;
        
        const state = this.history.pop();
        this.grid = state.grid;
        this.score = state.score;
        this.isGameOver = false;
        
        UI.updateGameInfo(this.currentLevel, this.score, this.targetNumber);
        this.renderBoard();
        
        if (this.history.length === 0) {
            UI.setUndoEnabled(false);
        }
    }
    
    move(direction) {
        this.saveState();
        
        let moved = false;
        const mergedPositions = [];
        
        const rotateGrid = (times) => {
            for (let t = 0; t < times; t++) {
                const newGrid = [];
                for (let i = 0; i < this.gridSize; i++) {
                    newGrid[i] = [];
                    for (let j = 0; j < this.gridSize; j++) {
                        newGrid[i][j] = this.grid[this.gridSize - 1 - j][i];
                    }
                }
                this.grid = newGrid;
            }
        };
        
        const rotations = { up: 0, right: 3, down: 2, left: 1 };
        rotateGrid(rotations[direction]);
        
        for (let col = 0; col < this.gridSize; col++) {
            const column = [];
            for (let row = 0; row < this.gridSize; row++) {
                if (this.grid[row][col] !== 0) {
                    column.push(this.grid[row][col]);
                }
            }
            
            const newColumn = [];
            for (let i = 0; i < column.length; i++) {
                if (i < column.length - 1 && column[i] === column[i + 1]) {
                    const merged = column[i] * 2;
                    newColumn.push(merged);
                    this.score += merged;
                    mergedPositions.push({ row: newColumn.length - 1, col });
                    i++;
                    moved = true;
                } else {
                    newColumn.push(column[i]);
                }
            }
            
            while (newColumn.length < this.gridSize) {
                newColumn.push(0);
            }
            
            for (let row = 0; row < this.gridSize; row++) {
                if (this.grid[row][col] !== newColumn[row]) {
                    moved = true;
                }
                this.grid[row][col] = newColumn[row];
            }
        }
        
        rotateGrid((4 - rotations[direction]) % 4);
        
        if (moved) {
            AudioManager.playSlide();
            
            if (mergedPositions.length > 0) {
                const maxValue = Math.max(...mergedPositions.map(p => this.grid[p.row]?.[p.col] || 0));
                if (maxValue > 0) {
                    AudioManager.playMerge(maxValue);
                }
            }
            
            this.addRandomTile();
            this.renderBoard();
            UI.updateGameInfo(this.currentLevel, this.score, this.targetNumber);
            
            this.checkWin();
            this.checkGameOver();
            
            LevelSystem.setHighScore(this.score);
            UI.updateHighScore();
        } else {
            this.history.pop();
            if (this.history.length === 0) {
                UI.setUndoEnabled(false);
            }
        }
    }
    
    checkWin() {
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] >= this.targetNumber) {
                    this.isWin = true;
                    AudioManager.stopBgm();
                    AudioManager.playVictory();
                    
                    LevelSystem.completeLevel(this.currentLevel, this.score);
                    
                    setTimeout(() => {
                        this.showWinModal();
                    }, 500);
                    return;
                }
            }
        }
    }
    
    checkGameOver() {
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] === 0) return;
            }
        }
        
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const current = this.grid[i][j];
                if (j < this.gridSize - 1 && current === this.grid[i][j + 1]) return;
                if (i < this.gridSize - 1 && current === this.grid[i + 1][j]) return;
            }
        }
        
        this.isGameOver = true;
        AudioManager.stopBgm();
        AudioManager.playGameOver();
        
        setTimeout(() => {
            this.showGameOverModal();
        }, 500);
    }
    
    showWinModal() {
        const nextLevel = this.currentLevel < LevelSystem.maxLevels ? this.currentLevel + 1 : null;
        
        UI.showModal(
            '🎉 クリアおめでとう！',
            `レベル ${this.currentLevel} クリア！\n得点：${this.score.toLocaleString()}`,
            [
                {
                    text: 'ダブル得点',
                    class: 'primary',
                    callback: () => {
                        UI.hideModal();
                        this.showAdModal('double');
                    }
                },
                nextLevel ? {
                    text: '次のレベル',
                    callback: () => {
                        UI.hideModal();
                        this.startGame(nextLevel);
                    }
                } : null,
                {
                    text: '戻る',
                    callback: () => {
                        UI.hideModal();
                        this.showHome();
                    }
                }
            ].filter(Boolean)
        );
    }
    
    showGameOverModal() {
        UI.showModal(
            '💔 ゲームオーバー',
            `得点：${this.score.toLocaleString()}\n目標：${this.targetNumber}`,
            [
                {
                    text: '広告で取り消し',
                    class: 'primary',
                    callback: () => {
                        UI.hideModal();
                        this.showAdModal('undo');
                    }
                },
                {
                    text: 'もう一度',
                    callback: () => {
                        UI.hideModal();
                        this.startGame(this.currentLevel);
                    }
                },
                {
                    text: '戻る',
                    callback: () => {
                        UI.hideModal();
                        this.showHome();
                    }
                }
            ]
        );
    }
    
    showRewardModal() {
        const level = LevelSystem.getLevel(this.currentLevel);
        const values = level.startValues;
        this.rewardValue = values[Math.floor(Math.random() * values.length)];
        
        UI.showRewardModal(
            this.rewardValue,
            () => {
                this.showAd('reward');
            },
            () => {
                this.rewardValue = null;
            }
        );
    }
    
    showAdModal(type) {
        UI.showAd(3, () => {
            AudioManager.playReward();
            
            if (type === 'undo') {
                this.undo();
            } else if (type === 'double') {
                this.score *= 2;
                LevelSystem.setHighScore(this.score);
                UI.updateHighScore();
                UI.updateGameInfo(this.currentLevel, this.score, this.targetNumber);
            } else if (type === 'reward') {
                this.addRewardTile();
            }
        });
    }
    
    addRewardTile() {
        if (!this.rewardValue) return;
        
        const emptyCells = [];
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({ row: i, col: j });
                }
            }
        }
        
        if (emptyCells.length === 0) return;
        
        const cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        this.grid[cell.row][cell.col] = this.rewardValue;
        
        this.renderBoard();
        this.rewardValue = null;
    }
    
    confirmReset() {
        UI.showModal(
            '⚠️ リセット確認',
            'すべてのゲーム進捗をリセットしますか？この操作は取り消せません。',
            [
                {
                    text: 'キャンセル',
                    callback: () => {
                        UI.hideModal();
                    }
                },
                {
                    text: 'リセット',
                    class: 'danger',
                    callback: () => {
                        LevelSystem.resetProgress();
                        UI.updateHighScore();
                        UI.hideModal();
                        UI.showModal(
                            '✅ リセット完了',
                            'すべての進捗が削除されました。',
                            [
                                {
                                    text: 'OK',
                                    callback: () => {
                                        UI.hideModal();
                                    }
                                }
                            ]
                        );
                    }
                }
            ]
        );
    }
    
    shareToTikTok() {
        const shareText = `🎮 ネオン数字マージ2048\n🏆 最高得点：${LevelSystem.getHighScore().toLocaleString()}\n🔥 クリア ${LevelSystem.getProgress().completedLevels.length}/${LevelSystem.maxLevels} レベル\n\n挑戦してね！`;
        
        if (navigator.share) {
            navigator.share({
                title: 'ネオン数字マージ2048',
                text: shareText,
                url: window.location.href
            }).catch(() => {});
        } else {
            const textArea = document.createElement('textarea');
            textArea.value = shareText;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            UI.showModal(
                '📋 コピー完了',
                '共有内容がクリップボードにコピーされました。TikTokに貼り付けてください！',
                [
                    {
                        text: 'OK',
                        callback: () => {
                            UI.hideModal();
                        }
                    }
                ]
            );
        }
    }
}

window.Game2048 = Game2048;
