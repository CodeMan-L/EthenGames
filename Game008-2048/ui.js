const UI = {
    screens: {},
    elements: {},
    
    init() {
        this.screens = {
            home: document.getElementById('home-screen'),
            game: document.getElementById('game-screen'),
            levels: document.getElementById('levels-screen'),
            settings: document.getElementById('settings-screen')
        };
        
        this.elements = {
            highScore: document.getElementById('high-score'),
            currentLevel: document.getElementById('current-level'),
            currentScore: document.getElementById('current-score'),
            targetNumber: document.getElementById('target-number'),
            gameBoard: document.getElementById('game-board'),
            levelsGrid: document.getElementById('levels-grid'),
            modalOverlay: document.getElementById('modal-overlay'),
            modalBox: document.getElementById('modal-box'),
            modalTitle: document.getElementById('modal-title'),
            modalMessage: document.getElementById('modal-message'),
            modalButtons: document.getElementById('modal-buttons'),
            rewardModal: document.getElementById('reward-modal'),
            rewardText: document.getElementById('reward-text'),
            rewardPreview: document.getElementById('reward-preview'),
            adPlaceholder: document.getElementById('ad-placeholder'),
            adTimer: document.getElementById('ad-timer'),
            toggleSfx: document.getElementById('toggle-sfx'),
            toggleBgm: document.getElementById('toggle-bgm'),
            btnSound: document.getElementById('btn-sound'),
            btnUndo: document.getElementById('btn-undo')
        };
        
        this.updateHighScore();
        this.updateSoundIcon();
        this.updateSettingsUI();
    },
    
    showScreen(screenName) {
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });
        
        if (this.screens[screenName]) {
            this.screens[screenName].classList.add('active');
        }
    },
    
    updateHighScore() {
        const score = LevelSystem.getHighScore();
        this.elements.highScore.textContent = score.toLocaleString();
    },
    
    updateGameInfo(level, score, target) {
        this.elements.currentLevel.textContent = level;
        this.elements.currentScore.textContent = score.toLocaleString();
        this.elements.targetNumber.textContent = target;
    },
    
    updateSoundIcon() {
        const icon = this.elements.btnSound.querySelector('.icon');
        if (AudioManager.sfxEnabled && AudioManager.bgmEnabled) {
            icon.textContent = '🔊';
            this.elements.btnSound.classList.remove('muted');
        } else if (AudioManager.sfxEnabled || AudioManager.bgmEnabled) {
            icon.textContent = '🔉';
            this.elements.btnSound.classList.remove('muted');
        } else {
            icon.textContent = '🔇';
            this.elements.btnSound.classList.add('muted');
        }
    },
    
    updateSettingsUI() {
        this.elements.toggleSfx.checked = AudioManager.sfxEnabled;
        this.elements.toggleBgm.checked = AudioManager.bgmEnabled;
    },
    
    renderLevels(onLevelSelect) {
        const grid = this.elements.levelsGrid;
        grid.innerHTML = '';
        
        for (let i = 1; i <= LevelSystem.maxLevels; i++) {
            const level = LevelSystem.getLevel(i);
            const btn = document.createElement('button');
            btn.className = 'level-btn';
            
            const isUnlocked = LevelSystem.isLevelUnlocked(i);
            const isCompleted = LevelSystem.isLevelCompleted(i);
            const progress = LevelSystem.getProgress();
            const isCurrent = i === progress.currentLevel;
            
            if (!isUnlocked) {
                btn.classList.add('locked');
            } else if (isCompleted) {
                btn.classList.add('completed');
            } else if (isCurrent) {
                btn.classList.add('current');
            }
            
            btn.innerHTML = `
                <span class="level-num">${i}</span>
                <span class="level-target">${level.target}</span>
            `;
            
            if (isUnlocked) {
                btn.addEventListener('click', () => {
                    AudioManager.playClick();
                    onLevelSelect(i);
                });
            }
            
            grid.appendChild(btn);
        }
    },
    
    showModal(title, message, buttons) {
        this.elements.modalTitle.textContent = title;
        this.elements.modalMessage.textContent = message;
        this.elements.modalButtons.innerHTML = '';
        
        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.className = `neon-btn ${btn.class || ''}`;
            button.textContent = btn.text;
            button.addEventListener('click', () => {
                AudioManager.playClick();
                btn.callback();
            });
            this.elements.modalButtons.appendChild(button);
        });
        
        this.elements.modalOverlay.classList.remove('hidden');
    },
    
    hideModal() {
        this.elements.modalOverlay.classList.add('hidden');
    },
    
    showRewardModal(value, onWatch, onClose) {
        this.elements.rewardText.textContent = `広告を見て ${value} ブロックをゲット！`;
        this.elements.rewardPreview.textContent = value;
        this.elements.rewardPreview.style.background = this.getNumberGradient(value);
        this.elements.rewardPreview.style.color = value >= 8 ? '#fff' : 'var(--neon-cyan)';
        this.elements.rewardPreview.style.textShadow = `0 0 20px ${this.getNumberColor(value)}`;
        
        const watchBtn = document.getElementById('btn-watch-ad');
        const closeBtn = document.getElementById('btn-close-reward');
        
        watchBtn.onclick = () => {
            AudioManager.playClick();
            this.hideRewardModal();
            onWatch();
        };
        
        closeBtn.onclick = () => {
            AudioManager.playClick();
            this.hideRewardModal();
            onClose();
        };
        
        this.elements.rewardModal.classList.remove('hidden');
    },
    
    hideRewardModal() {
        this.elements.rewardModal.classList.add('hidden');
    },
    
    getNumberColor(value) {
        const colors = {
            2: '#00ffff', 4: '#00ffff', 8: '#ff00ff',
            16: '#ff00ff', 32: '#ff8000', 64: '#ff8000',
            128: '#00ff80', 256: '#00ff80', 512: '#0080ff',
            1024: '#8000ff', 2048: '#ff00ff'
        };
        return colors[value] || '#ffd700';
    },
    
    getNumberGradient(value) {
        if (value >= 2048) {
            return 'linear-gradient(135deg, #ff00ff, #8000ff)';
        } else if (value >= 1024) {
            return 'linear-gradient(135deg, #3a1a5e, #4a2a6e)';
        } else if (value >= 512) {
            return 'linear-gradient(135deg, #1a3a5e, #2a4a6e)';
        } else if (value >= 256) {
            return 'linear-gradient(135deg, #1a4a3e, #2a5a4e)';
        } else if (value >= 128) {
            return 'linear-gradient(135deg, #2a4a1e, #3a5a2e)';
        } else if (value >= 64) {
            return 'linear-gradient(135deg, #5a2a1e, #6a2a2e)';
        } else if (value >= 32) {
            return 'linear-gradient(135deg, #4a1a1e, #5a1a2e)';
        } else if (value >= 16) {
            return 'linear-gradient(135deg, #3a1a2e, #4a1a3e)';
        } else if (value >= 8) {
            return 'linear-gradient(135deg, #2a1a3e, #3a1a4e)';
        }
        return 'linear-gradient(135deg, #1a2a3e, #1a3a4e)';
    },
    
    showAd(duration, onComplete) {
        this.elements.adPlaceholder.classList.remove('hidden');
        let remaining = duration;
        
        const timer = setInterval(() => {
            remaining--;
            this.elements.adTimer.textContent = remaining;
            
            if (remaining <= 0) {
                clearInterval(timer);
                this.elements.adPlaceholder.classList.add('hidden');
                onComplete();
            }
        }, 1000);
        
        this.elements.adTimer.textContent = remaining;
    },
    
    setUndoEnabled(enabled) {
        this.elements.btnUndo.disabled = !enabled;
    }
};

window.UI = UI;
