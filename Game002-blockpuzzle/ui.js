const UI = {
    currentPage: 'home',
    currentModal: null,

    init() {
        this.bindEvents();
        this.updateSoundToggle();
        this.updateHighScore();
    },

    bindEvents() {
        document.addEventListener('click', (e) => {
            AudioManager.resumeContext();
        });

        document.addEventListener('touchstart', (e) => {
            AudioManager.resumeContext();
        }, { passive: true });
    },

    showPage(pageName) {
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => page.classList.remove('active'));

        const targetPage = document.getElementById(pageName + '-page');
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageName;
        }

        if (pageName === 'home') {
            if (Game.isPlaying) {
                Game.isPlaying = false;
                clearInterval(Game.timerInterval);
                AudioManager.stopBgm();
            }
            const boardElement = document.getElementById('game-board');
            if (boardElement) {
                boardElement.style.width = '';
                boardElement.style.height = '';
                boardElement.innerHTML = '';
            }
            this.updateHighScore();
        } else if (pageName === 'settings') {
            this.updateSettingsUI();
        } else if (pageName === 'level-select') {
            this.renderLevelGrid();
        }
    },

    updateHighScore() {
        const highScoreElement = document.getElementById('high-score');
        if (highScoreElement) {
            const highScore = LevelManager.getHighScore();
            highScoreElement.textContent = highScore;
        }
    },

    updateSoundToggle() {
        const soundBtn = document.getElementById('sound-toggle-btn');
        if (soundBtn) {
            soundBtn.textContent = AudioManager.soundEnabled ? '🔊' : '🔇';
        }
    },

    updateSettingsUI() {
        const soundToggle = document.getElementById('sound-toggle');
        const bgmToggle = document.getElementById('bgm-toggle');

        if (soundToggle) {
            soundToggle.classList.toggle('active', AudioManager.soundEnabled);
        }
        if (bgmToggle) {
            bgmToggle.classList.toggle('active', AudioManager.bgmEnabled);
        }
    },

    updateHealth(health) {
        const healthDisplay = document.getElementById('health-display');
        if (!healthDisplay) return;

        const hearts = healthDisplay.querySelectorAll('.health-heart');
        hearts.forEach((heart, index) => {
            if (index < health) {
                if (!heart.classList.contains('active')) {
                    heart.classList.remove('inactive', 'lose');
                    heart.classList.add('active');
                }
            } else {
                if (heart.classList.contains('active')) {
                    heart.classList.add('lose');
                    setTimeout(() => {
                        heart.classList.remove('active', 'lose');
                        heart.classList.add('inactive');
                    }, 500);
                }
            }
        });
    },

    renderLevelGrid() {
        const grid = document.getElementById('level-grid');
        if (!grid) return;

        grid.innerHTML = '';
        const progress = LevelManager.getProgress();

        for (let i = 1; i <= LevelManager.maxLevel; i++) {
            const btn = document.createElement('button');
            btn.className = 'level-btn';
            btn.textContent = i;

            const isUnlocked = LevelManager.isLevelUnlocked(i);
            const isCompleted = progress.completedLevels.includes(i);
            const stars = progress.stars[i] || 0;

            if (!isUnlocked) {
                btn.classList.add('locked');
                btn.textContent = '🔒';
            } else if (isCompleted) {
                btn.classList.add('completed');
            } else {
                btn.classList.add('current');
            }

            if (isUnlocked) {
                btn.addEventListener('click', () => {
                    AudioManager.playClick();
                    Game.startLevel(i);
                });
            }

            grid.appendChild(btn);
        }
    },

    showModal(type, data = {}) {
        const modal = document.getElementById('modal');
        const content = document.getElementById('modal-content');
        if (!modal || !content) return;

        let html = '';

        switch (type) {
            case 'victory':
                const stars = this.renderStars(data.stars);
                html = `
                    <div class="modal-title">🎉 レベルクリア!</div>
                    <div class="stars">${stars}</div>
                    <div class="modal-text">スコア</div>
                    <div class="modal-score">${data.score}</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.min(100, (data.score / data.target) * 100)}%"></div>
                    </div>
                    <div class="modal-buttons">
                        <button class="btn btn-primary btn-small" onclick="UI.hideModal(); Game.nextLevel();">次のレベル</button>
                        <button class="btn btn-secondary btn-small" onclick="UI.hideModal(); Game.restartLevel();">もう一度</button>
                        <button class="btn btn-small" onclick="UI.hideModal(); UI.showPage('home');">ホームへ</button>
                    </div>
                `;
                break;

            case 'defeat':
                const defeatTitle = data.reason === 'health' ? '💔 HP切れ!' : '⏰ 時間切れ!';
                html = `
                    <div class="modal-title defeat">${defeatTitle}</div>
                    <div class="modal-text">スコア</div>
                    <div class="modal-score">${data.score}</div>
                    <div class="modal-text">目標: ${data.target}</div>
                    <div class="modal-buttons">
                        <button class="btn btn-ad btn-small" onclick="UI.showAd('revive')">広告を見て復活</button>
                        <button class="btn btn-primary btn-small" onclick="UI.hideModal(); Game.restartLevel();">やり直す</button>
                        <button class="btn btn-small" onclick="UI.hideModal(); UI.showPage('home');">ホームへ</button>
                    </div>
                `;
                break;

            case 'pause':
                html = `
                    <div class="modal-title">⏸️ 一時停止</div>
                    <div class="modal-buttons">
                        <button class="btn btn-primary btn-small" onclick="UI.hideModal(); Game.resume();">続ける</button>
                        <button class="btn btn-secondary btn-small" onclick="UI.hideModal(); Game.restartLevel();">やり直す</button>
                        <button class="btn btn-small" onclick="UI.hideModal(); UI.showPage('home');">ホームへ</button>
                    </div>
                `;
                break;

            case 'chest':
                html = `
                    <div class="modal-title">🎁 宝箱ボーナス!</div>
                    <div class="chest-animation">📦</div>
                    <div class="modal-text">ボーナスポイント!</div>
                    <div class="modal-score">+${data.reward}</div>
                    <div class="modal-buttons">
                        <button class="btn btn-ad btn-small" onclick="UI.showAd('double');">広告を見て2倍</button>
                        <button class="btn btn-primary btn-small" onclick="UI.hideModal(); Game.addChestReward(${data.reward});">受け取る</button>
                    </div>
                `;
                break;

            case 'ad':
                html = `
                    <div class="modal-title">📺 広告再生中...</div>
                    <div class="modal-text">お待ちください</div>
                    <div class="chest-animation">⏳</div>
                `;
                break;
        }

        content.innerHTML = html;
        modal.classList.add('show');
        this.currentModal = type;
    },

    hideModal() {
        const modal = document.getElementById('modal');
        if (modal) {
            modal.classList.remove('show');
        }
        this.currentModal = null;
    },

    renderStars(count) {
        let html = '';
        for (let i = 1; i <= 3; i++) {
            html += `<span class="star ${i <= count ? 'filled' : ''}">★</span>`;
        }
        return html;
    },

    showAd(type) {
        AudioManager.playAdStart();
        Game.startWatchingAd();
        this.showModal('ad');

        setTimeout(() => {
            AudioManager.playAdEnd();
            Game.stopWatchingAd();
            this.hideModal();

            switch (type) {
                case 'revive':
                    Game.revive();
                    break;
                case 'double':
                    Game.doubleReward();
                    break;
                case 'chest':
                    Game.openChest();
                    break;
            }
        }, 2000);
    },

    showCombo(level) {
        const comboDisplay = document.getElementById('combo-display');
        if (!comboDisplay) return;

        comboDisplay.textContent = `${level}コンボ!`;
        comboDisplay.classList.remove('show');
        void comboDisplay.offsetWidth;
        comboDisplay.classList.add('show');

        AudioManager.playCombo(level);
    },

    updateGameUI(time, score, target) {
        const timeElement = document.getElementById('game-time');
        const scoreElement = document.getElementById('game-score');
        const targetElement = document.getElementById('game-target');

        if (timeElement) timeElement.textContent = time;
        if (scoreElement) scoreElement.textContent = score;
        if (targetElement) targetElement.textContent = target;
    },

    showLevelInfo(levelNum) {
        const level = LevelManager.getLevel(levelNum);
        const levelInfo = document.getElementById('level-info');
        if (levelInfo) {
            levelInfo.textContent = `Lv.${levelNum}`;
        }
    }
};

window.UI = UI;
