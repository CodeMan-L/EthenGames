const UIManager = {
    screens: {},
    modals: {},
    elements: {},
    
    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.updateHomeScreen();
        this.renderLevelGrid();
    },
    
    cacheElements() {
        this.screens = {
            home: document.getElementById('home-screen'),
            settings: document.getElementById('settings-screen'),
            levels: document.getElementById('levels-screen'),
            game: document.getElementById('game-screen')
        };
        
        this.modals = {
            pause: document.getElementById('pause-modal'),
            gameover: document.getElementById('gameover-modal'),
            victory: document.getElementById('victory-modal'),
            chest: document.getElementById('chest-modal')
        };
        
        this.elements = {
            highScore: document.getElementById('high-score'),
            maxLevel: document.getElementById('max-level'),
            currentLevel: document.getElementById('current-level'),
            knifeCount: document.getElementById('knife-count'),
            gameScore: document.getElementById('game-score'),
            victoryScore: document.getElementById('victory-score'),
            bonusScore: document.getElementById('bonus-score'),
            failMessage: document.getElementById('fail-message'),
            soundIcon: document.getElementById('sound-icon'),
            toggleSfx: document.getElementById('toggle-sfx'),
            toggleBgm: document.getElementById('toggle-bgm'),
            levelsGrid: document.getElementById('levels-grid'),
            skinName: document.getElementById('skin-name')
        };
    },
    
    setupEventListeners() {
        document.getElementById('btn-start').addEventListener('click', () => {
            AudioManager.playClick();
            AudioManager.resumeContext();
            this.startGame();
        });
        
        document.getElementById('btn-levels').addEventListener('click', () => {
            AudioManager.playClick();
            this.showScreen('levels');
        });
        
        document.getElementById('btn-settings').addEventListener('click', () => {
            AudioManager.playClick();
            this.showScreen('settings');
        });
        
        document.getElementById('btn-share').addEventListener('click', () => {
            AudioManager.playClick();
            this.shareToTikTok();
        });
        
        document.getElementById('btn-sound').addEventListener('click', () => {
            AudioManager.resumeContext();
            const enabled = AudioManager.toggleSFX();
            this.elements.soundIcon.textContent = enabled ? '🔊' : '🔇';
            AudioManager.playClick();
        });
        
        document.getElementById('btn-back-settings').addEventListener('click', () => {
            AudioManager.playClick();
            this.showScreen('home');
        });
        
        document.getElementById('btn-back-levels').addEventListener('click', () => {
            AudioManager.playClick();
            this.showScreen('home');
        });
        
        document.getElementById('toggle-sfx').addEventListener('change', (e) => {
            AudioManager.sfxEnabled = e.target.checked;
            AudioManager.saveSettings();
            if (e.target.checked) AudioManager.playClick();
        });
        
        document.getElementById('toggle-bgm').addEventListener('change', (e) => {
            AudioManager.bgmEnabled = e.target.checked;
            AudioManager.saveSettings();
            if (e.target.checked) {
                AudioManager.startBGM();
            } else {
                AudioManager.stopBGM();
            }
        });
        
        document.getElementById('btn-reset').addEventListener('click', () => {
            AudioManager.playClick();
            if (confirm('确定要重置所有进度吗？')) {
                LevelManager.resetProgress();
                this.updateHomeScreen();
                this.renderLevelGrid();
                alert('进度已重置');
            }
        });
        
        document.getElementById('btn-pause').addEventListener('click', () => {
            AudioManager.playClick();
            this.showModal('pause');
            if (window.Game) window.Game.pause();
        });
        
        document.getElementById('btn-resume').addEventListener('click', () => {
            AudioManager.playClick();
            this.hideModal('pause');
            if (window.Game) window.Game.resume();
        });
        
        document.getElementById('btn-restart-pause').addEventListener('click', () => {
            AudioManager.playClick();
            this.hideModal('pause');
            if (window.Game) window.Game.restart();
        });
        
        document.getElementById('btn-home').addEventListener('click', () => {
            AudioManager.playClick();
            this.hideModal('pause');
            this.showScreen('home');
            if (window.Game) window.Game.stop();
        });
        
        document.getElementById('btn-revive').addEventListener('click', () => {
            AudioManager.playClick();
            this.showAd('revive');
        });
        
        document.getElementById('btn-restart').addEventListener('click', () => {
            AudioManager.playClick();
            this.hideModal('gameover');
            if (window.Game) window.Game.restart();
        });
        
        document.getElementById('btn-next-level').addEventListener('click', () => {
            AudioManager.playClick();
            this.hideModal('victory');
            LevelManager.nextLevel();
            if (window.Game) window.Game.startLevel();
        });
        
        document.getElementById('btn-chest').addEventListener('click', () => {
            AudioManager.playClick();
            this.showAd('chest');
        });
        
        document.getElementById('btn-close-chest').addEventListener('click', () => {
            AudioManager.playClick();
            this.hideModal('chest');
            LevelManager.nextLevel();
            if (window.Game) window.Game.startLevel();
        });
    },
    
    showScreen(screenName) {
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });
        
        if (this.screens[screenName]) {
            this.screens[screenName].classList.add('active');
        }
        
        if (screenName === 'settings') {
            this.elements.toggleSfx.checked = AudioManager.sfxEnabled;
            this.elements.toggleBgm.checked = AudioManager.bgmEnabled;
        }
    },
    
    showModal(modalName) {
        if (this.modals[modalName]) {
            this.modals[modalName].classList.add('active');
        }
    },
    
    hideModal(modalName) {
        if (this.modals[modalName]) {
            this.modals[modalName].classList.remove('active');
        }
    },
    
    hideAllModals() {
        Object.values(this.modals).forEach(modal => {
            modal.classList.remove('active');
        });
    },
    
    updateHomeScreen() {
        this.elements.highScore.textContent = LevelManager.getHighScore();
        this.elements.maxLevel.textContent = LevelManager.getMaxLevel();
    },
    
    updateGameHUD(level, knives) {
        this.elements.currentLevel.textContent = `关卡 ${level}`;
        this.elements.knifeCount.textContent = `飞刀: ${knives}`;
    },
    
    updateGameScore(score) {
        this.elements.gameScore.textContent = score;
    },
    
    showVictory(score, bonus) {
        this.elements.victoryScore.textContent = score;
        this.elements.bonusScore.textContent = bonus;
        this.showModal('victory');
    },
    
    showGameOver(message) {
        this.elements.failMessage.textContent = message;
        this.showModal('gameover');
    },
    
    renderLevelGrid() {
        const grid = this.elements.levelsGrid;
        grid.innerHTML = '';
        
        for (let i = 1; i <= 30; i++) {
            const btn = document.createElement('button');
            btn.className = 'level-btn';
            btn.textContent = i;
            
            const isUnlocked = LevelManager.isLevelUnlocked(i);
            const isCompleted = LevelManager.isLevelCompleted(i);
            
            if (isCompleted) {
                btn.classList.add('completed');
            } else if (isUnlocked) {
                btn.classList.add('unlocked');
            } else {
                btn.classList.add('locked');
                btn.textContent = '';
            }
            
            if (isUnlocked) {
                btn.addEventListener('click', () => {
                    AudioManager.playClick();
                    LevelManager.setLevel(i);
                    this.startGame();
                });
            }
            
            grid.appendChild(btn);
        }
    },
    
    startGame() {
        this.showScreen('game');
        if (window.Game) {
            window.Game.startLevel();
        }
    },
    
    showAd(type) {
        console.log(`Showing ${type} ad...`);
        
        setTimeout(() => {
            if (type === 'revive') {
                this.hideModal('gameover');
                if (window.Game) window.Game.revive();
            } else if (type === 'chest') {
                this.hideModal('victory');
                this.showChestReward();
            }
        }, 1000);
    },
    
    showChestReward() {
        const skins = [
            '霓虹飞刀', '彩虹飞刀', '火焰飞刀', '冰霜飞刀',
            '闪电飞刀', '星空飞刀', '樱花飞刀', '黄金飞刀'
        ];
        const randomSkin = skins[Math.floor(Math.random() * skins.length)];
        this.elements.skinName.textContent = randomSkin;
        
        AudioManager.playChest();
        this.showModal('chest');
    },
    
    shareToTikTok() {
        const shareText = '我在玩【霓虹旋转飞刀】，快来挑战吧！';
        const shareUrl = window.location.href;
        
        if (navigator.share) {
            navigator.share({
                title: '霓虹旋转飞刀',
                text: shareText,
                url: shareUrl
            }).catch(err => console.log('Share failed:', err));
        } else {
            const tiktokUrl = `https://www.tiktok.com/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
            window.open(tiktokUrl, '_blank');
        }
    }
};

window.UIManager = UIManager;
