const UI = {
    elements: {},
    callbacks: {},

    init() {
        this.cacheElements();
        this.bindEvents();
        this.updateHighScore();
        this.updateSoundButton();
        this.renderLevelGrid();
    },

    cacheElements() {
        this.elements = {
            homeScreen: document.getElementById('home-screen'),
            settingsScreen: document.getElementById('settings-screen'),
            levelsScreen: document.getElementById('levels-screen'),
            gameHud: document.getElementById('game-hud'),
            pauseBtn: document.getElementById('pause-btn'),
            
            startBtn: document.getElementById('start-btn'),
            levelsBtn: document.getElementById('levels-btn'),
            settingsBtn: document.getElementById('settings-btn'),
            shareBtn: document.getElementById('share-btn'),
            soundToggle: document.getElementById('sound-toggle'),
            
            settingsBackBtn: document.getElementById('settings-back-btn'),
            levelsBackBtn: document.getElementById('levels-back-btn'),
            
            sfxToggle: document.getElementById('sfx-toggle'),
            bgmToggle: document.getElementById('bgm-toggle'),
            vibrateToggle: document.getElementById('vibrate-toggle'),
            resetBtn: document.getElementById('reset-btn'),
            
            levelsGrid: document.getElementById('levels-grid'),
            
            levelDisplay: document.getElementById('level-display'),
            scoreDisplay: document.getElementById('score-display'),
            livesDisplay: document.getElementById('lives-display'),
            homeHighScore: document.getElementById('home-high-score'),
            
            pauseModal: document.getElementById('pause-modal'),
            gameOverModal: document.getElementById('game-over-modal'),
            levelCompleteModal: document.getElementById('level-complete-modal'),
            chestModal: document.getElementById('chest-modal'),
            stuckModal: document.getElementById('stuck-modal'),
            allCompleteModal: document.getElementById('all-complete-modal'),
            
            resumeBtn: document.getElementById('resume-btn'),
            restartBtn: document.getElementById('restart-btn'),
            quitBtn: document.getElementById('quit-btn'),
            
            reviveAdBtn: document.getElementById('revive-ad-btn'),
            retryBtn: document.getElementById('retry-btn'),
            homeBtn: document.getElementById('home-btn'),
            
            finalScore: document.getElementById('final-score'),
            levelScore: document.getElementById('level-score'),
            levelLives: document.getElementById('level-lives'),
            chestReward: document.getElementById('chest-reward'),
            totalScore: document.getElementById('total-score'),
            
            doubleAdBtn: document.getElementById('double-ad-btn'),
            nextLevelBtn: document.getElementById('next-level-btn'),
            chestCloseBtn: document.getElementById('chest-close-btn'),
            bombAdBtn: document.getElementById('bomb-ad-btn'),
            stuckCancelBtn: document.getElementById('stuck-cancel-btn'),
            finalChestBtn: document.getElementById('final-chest-btn'),
            playAgainBtn: document.getElementById('play-again-btn')
        };
    },

    bindEvents() {
        this.elements.startBtn.addEventListener('click', () => {
            AudioManager.playClick();
            this.callbacks.onStart && this.callbacks.onStart();
        });

        this.elements.levelsBtn.addEventListener('click', () => {
            AudioManager.playClick();
            this.showScreen('levels');
        });

        this.elements.settingsBtn.addEventListener('click', () => {
            AudioManager.playClick();
            this.showScreen('settings');
            this.loadSettingsValues();
        });

        this.elements.shareBtn.addEventListener('click', () => {
            AudioManager.playClick();
            this.shareToTikTok();
        });

        this.elements.soundToggle.addEventListener('click', () => {
            const isMuted = !AudioManager.sfxEnabled || !AudioManager.bgmEnabled;
            AudioManager.toggleSFX(isMuted);
            AudioManager.toggleBGM(isMuted);
            this.updateSoundButton();
        });

        this.elements.settingsBackBtn.addEventListener('click', () => {
            AudioManager.playClick();
            this.showScreen('home');
        });

        this.elements.levelsBackBtn.addEventListener('click', () => {
            AudioManager.playClick();
            this.showScreen('home');
        });

        this.elements.sfxToggle.addEventListener('change', (e) => {
            AudioManager.toggleSFX(e.target.checked);
        });

        this.elements.bgmToggle.addEventListener('change', (e) => {
            AudioManager.toggleBGM(e.target.checked);
        });

        this.elements.vibrateToggle.addEventListener('change', (e) => {
            AudioManager.toggleVibrate(e.target.checked);
        });

        this.elements.resetBtn.addEventListener('click', () => {
            AudioManager.playClick();
            if (confirm('すべての進捗をリセットしますか？')) {
                LevelManager.resetProgress();
                this.renderLevelGrid();
                this.updateHighScore();
                alert('リセットしました');
            }
        });

        this.elements.pauseBtn.addEventListener('click', () => {
            AudioManager.playClick();
            this.callbacks.onPause && this.callbacks.onPause();
        });

        this.elements.resumeBtn.addEventListener('click', () => {
            AudioManager.playClick();
            this.hideModal('pause');
            this.callbacks.onResume && this.callbacks.onResume();
        });

        this.elements.restartBtn.addEventListener('click', () => {
            AudioManager.playClick();
            this.hideModal('pause');
            this.callbacks.onRestart && this.callbacks.onRestart();
        });

        this.elements.quitBtn.addEventListener('click', () => {
            AudioManager.playClick();
            this.hideModal('pause');
            this.callbacks.onQuit && this.callbacks.onQuit();
        });

        this.elements.reviveAdBtn.addEventListener('click', () => {
            AudioManager.playClick();
            this.callbacks.onReviveAd && this.callbacks.onReviveAd();
        });

        this.elements.retryBtn.addEventListener('click', () => {
            AudioManager.playClick();
            this.hideModal('gameOver');
            this.callbacks.onRestart && this.callbacks.onRestart();
        });

        this.elements.homeBtn.addEventListener('click', () => {
            AudioManager.playClick();
            this.hideModal('gameOver');
            this.callbacks.onQuit && this.callbacks.onQuit();
        });

        this.elements.doubleAdBtn.addEventListener('click', () => {
            AudioManager.playClick();
            this.callbacks.onDoubleAd && this.callbacks.onDoubleAd();
        });

        this.elements.nextLevelBtn.addEventListener('click', () => {
            AudioManager.playClick();
            this.hideModal('levelComplete');
            this.callbacks.onNextLevel && this.callbacks.onNextLevel();
        });

        this.elements.chestCloseBtn.addEventListener('click', () => {
            AudioManager.playClick();
            this.hideModal('chest');
        });

        this.elements.bombAdBtn.addEventListener('click', () => {
            AudioManager.playClick();
            this.callbacks.onBombAd && this.callbacks.onBombAd();
        });

        this.elements.stuckCancelBtn.addEventListener('click', () => {
            AudioManager.playClick();
            this.hideModal('stuck');
        });

        this.elements.finalChestBtn.addEventListener('click', () => {
            AudioManager.playClick();
            this.callbacks.onFinalChest && this.callbacks.onFinalChest();
        });

        this.elements.playAgainBtn.addEventListener('click', () => {
            AudioManager.playClick();
            this.hideModal('allComplete');
            this.callbacks.onQuit && this.callbacks.onQuit();
        });
    },

    on(event, callback) {
        this.callbacks[event] = callback;
    },

    showScreen(screen) {
        this.elements.homeScreen.classList.remove('active');
        this.elements.settingsScreen.classList.remove('active');
        this.elements.levelsScreen.classList.remove('active');
        
        switch(screen) {
            case 'home':
                this.elements.homeScreen.classList.add('active');
                break;
            case 'settings':
                this.elements.settingsScreen.classList.add('active');
                break;
            case 'levels':
                this.elements.levelsScreen.classList.add('active');
                this.renderLevelGrid();
                break;
        }
    },

    showGameUI(show) {
        if (show) {
            this.elements.gameHud.classList.add('active');
            this.elements.pauseBtn.classList.add('active');
        } else {
            this.elements.gameHud.classList.remove('active');
            this.elements.pauseBtn.classList.remove('active');
        }
    },

    hideAllScreens() {
        this.elements.homeScreen.classList.remove('active');
        this.elements.settingsScreen.classList.remove('active');
        this.elements.levelsScreen.classList.remove('active');
    },

    showModal(modal) {
        const modalEl = this.elements[modal + 'Modal'];
        if (modalEl) {
            modalEl.classList.add('active');
        }
    },

    hideModal(modal) {
        const modalEl = this.elements[modal + 'Modal'];
        if (modalEl) {
            modalEl.classList.remove('active');
        }
    },

    hideAllModals() {
        document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    },

    updateHUD(level, score, lives) {
        this.elements.levelDisplay.textContent = level;
        this.elements.scoreDisplay.textContent = score;
        this.elements.livesDisplay.textContent = '❤️'.repeat(Math.max(0, lives));
    },

    updateHighScore() {
        const scores = Object.values(LevelManager.levelScores);
        const total = scores.reduce((sum, s) => sum + s, 0);
        this.elements.homeHighScore.textContent = total;
    },

    updateSoundButton() {
        const isMuted = !AudioManager.sfxEnabled && !AudioManager.bgmEnabled;
        const icon = this.elements.soundToggle.querySelector('.icon');
        icon.textContent = isMuted ? '🔇' : '🔊';
        this.elements.soundToggle.classList.toggle('muted', isMuted);
    },

    loadSettingsValues() {
        this.elements.sfxToggle.checked = AudioManager.sfxEnabled;
        this.elements.bgmToggle.checked = AudioManager.bgmEnabled;
        this.elements.vibrateToggle.checked = AudioManager.vibrateEnabled;
    },

    renderLevelGrid() {
        this.elements.levelsGrid.innerHTML = '';
        
        for (let i = 1; i <= LevelManager.maxLevel; i++) {
            const btn = document.createElement('button');
            btn.className = 'level-btn';
            btn.textContent = i;
            
            if (LevelManager.isLevelUnlocked(i)) {
                btn.classList.add('unlocked');
                if (LevelManager.levelScores[i]) {
                    btn.classList.add('completed');
                }
                if (i === LevelManager.unlockedLevel) {
                    btn.classList.add('current');
                }
                
                btn.addEventListener('click', () => {
                    AudioManager.playClick();
                    this.callbacks.onLevelSelect && this.callbacks.onLevelSelect(i);
                });
            } else {
                btn.classList.add('locked');
                btn.textContent = '🔒';
            }
            
            this.elements.levelsGrid.appendChild(btn);
        }
    },

    showGameOver(score) {
        this.elements.finalScore.textContent = score;
        this.showModal('gameOver');
    },

    showLevelComplete(score, lives) {
        this.elements.levelScore.textContent = score;
        this.elements.levelLives.textContent = lives;
        this.showModal('levelComplete');
    },

    showChest(reward) {
        this.elements.chestReward.textContent = '+' + reward;
        this.showModal('chest');
        AudioManager.playChestOpen();
    },

    showAllComplete(totalScore) {
        this.elements.totalScore.textContent = totalScore;
        this.showModal('allComplete');
    },

    showStuck() {
        this.showModal('stuck');
    },

    shareToTikTok() {
        const shareData = {
            title: '霓虹弹球打砖块',
            text: '我在霓虹弹球打砖块中获得了' + this.elements.homeHighScore.textContent + '分！来挑战我吧！',
            url: window.location.href
        };

        if (navigator.share) {
            navigator.share(shareData).catch(() => {});
        } else {
            const text = encodeURIComponent(shareData.text + ' ' + shareData.url);
            window.open('https://www.tiktok.com/share?url=' + encodeURIComponent(shareData.url), '_blank');
        }
    },

    createParticle(x, y, color) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.width = '10px';
        particle.style.height = '10px';
        particle.style.background = color;
        particle.style.boxShadow = `0 0 10px ${color}`;
        
        document.getElementById('game-container').appendChild(particle);
        
        setTimeout(() => particle.remove(), 500);
    },

    createParticles(x, y, color, count = 8) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const offsetX = Math.cos(angle) * 30;
            const offsetY = Math.sin(angle) * 30;
            
            particle.style.left = (x + offsetX) + 'px';
            particle.style.top = (y + offsetY) + 'px';
            particle.style.width = '8px';
            particle.style.height = '8px';
            particle.style.background = color;
            particle.style.boxShadow = `0 0 10px ${color}`;
            
            document.getElementById('game-container').appendChild(particle);
            
            setTimeout(() => particle.remove(), 500);
        }
    },

    showAdModal(title, description, onComplete, onCancel) {
        const adOverlay = document.createElement('div');
        adOverlay.id = 'ad-modal-overlay';
        adOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            color: white;
            font-size: 20px;
        `;
        adOverlay.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 24px; margin-bottom: 10px; color: #00ffff;">${title}</div>
                <div style="font-size: 48px; margin-bottom: 20px;">📺</div>
                <div id="ad-countdown" style="font-size: 32px; color: #ff00de;">3</div>
                <div style="margin-top: 10px; color: #888;">${description}</div>
            </div>
        `;
        document.body.appendChild(adOverlay);
        
        let count = 3;
        const countdownEl = adOverlay.querySelector('#ad-countdown');
        
        const interval = setInterval(() => {
            count--;
            if (count > 0) {
                countdownEl.textContent = count;
            } else {
                clearInterval(interval);
                adOverlay.remove();
                onComplete && onComplete();
            }
        }, 1000);
    }
};

window.UI = UI;
