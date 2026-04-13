const UIManager = {
    screens: {},
    modals: {},
    elements: {},
    
    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.updateHomeScreen();
        this.renderLevelGrid();
        this.initNeonAnimations();
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
            comboCounter: document.getElementById('combo-counter'),
            specialKnifeCharges: document.getElementById('special-knife-charges'),
            victoryScore: document.getElementById('victory-score'),
            bonusScore: document.getElementById('bonus-score'),
            failMessage: document.getElementById('fail-message'),
            soundIcon: document.getElementById('sound-icon'),
            toggleSfx: document.getElementById('toggle-sfx'),
            toggleBgm: document.getElementById('toggle-bgm'),
            levelsGrid: document.getElementById('levels-grid'),
            skinName: document.getElementById('skin-name'),
            assistItem: document.getElementById('assist-item'),
            controlHint: document.getElementById('control-hint')
        };
    },
    
    setupEventListeners() {
        const addNeonClick = (id, handler) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', () => {
                    this.playNeonClick(btn);
                    AudioManager.resumeContext();
                    handler();
                });
                
                btn.addEventListener('touchstart', () => {
                    this.createRippleEffect(btn);
                }, { passive: true });
            }
        };
        
        addNeonClick('btn-start', () => {
            AudioManager.playClick();
            this.startGame();
        });
        
        addNeonClick('btn-levels', () => {
            AudioManager.playClick();
            this.showScreen('levels');
        });
        
        addNeonClick('btn-settings', () => {
            AudioManager.playClick();
            this.showScreen('settings');
        });
        
        addNeonClick('btn-share', () => {
            AudioManager.playClick();
            this.shareToTikTok();
        });
        
        addNeonClick('btn-sound', () => {
            AudioManager.resumeContext();
            const enabled = AudioManager.toggleSFX();
            this.elements.soundIcon.textContent = enabled ? '🔊' : '🔇';
            AudioManager.playClick();
        });
        
        addNeonClick('btn-back-settings', () => {
            AudioManager.playClick();
            this.showScreen('home');
        });
        
        addNeonClick('btn-back-levels', () => {
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
        
        addNeonclick('btn-reset', () => {
            AudioManager.playClick();
            this.showNeonConfirm('确定要重置所有进度吗？', () => {
                LevelManager.resetProgress();
                this.updateHomeScreen();
                this.renderLevelGrid();
                this.showNotification('进度已重置');
            });
        });
        
        addNeonclick('btn-pause', () => {
            AudioManager.playClick();
            this.showModal('pause');
            if (window.Game) window.Game.pause();
        });
        
        addNeonclick('btn-resume', () => {
            AudioManager.playClick();
            this.hideModal('pause');
            if (window.Game) window.Game.resume();
        });
        
        addNeonclick('btn-restart-pause', () => {
            AudioManager.playClick();
            this.hideModal('pause');
            if (window.Game) window.Game.restart();
        });
        
        addNeonclick('btn-home', () => {
            AudioManager.playClick();
            this.hideModal('pause');
            this.showScreen('home');
            if (window.Game) window.Game.stop();
        });
        
        addNeonclick('btn-revive', () => {
            AudioManager.playClick();
            this.showAd('revive');
        });
        
        addNeonclick('btn-restart', () => {
            AudioManager.playClick();
            this.hideModalWithEffect('gameover');
            setTimeout(() => {
                if (window.Game) window.Game.restart();
            }, 300);
        });
        
        addNeonclick('btn-next-level', () => {
            AudioManager.playClick();
            this.hideModalWithEffect('victory');
            setTimeout(() => {
                LevelManager.nextLevel();
                if (window.Game) window.Game.startLevel();
            }, 300);
        });
        
        addNeonclick('btn-chest', () => {
            AudioManager.playClick();
            this.showAd('chest');
        });
        
        addNeonclick('btn-close-chest', () => {
            AudioManager.playClick();
            this.hideModalWithEffect('chest');
            setTimeout(() => {
                LevelManager.nextLevel();
                if (window.Game) window.Game.startLevel();
            }, 300);
        });
        
        this.elements.assistItem.addEventListener('click', () => {
            AudioManager.playClick();
            this.showAd('assist');
        });
    },
    
    playNeonClick(btn) {
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            btn.style.transform = '';
        }, 100);
        
        this.createNeonParticles(btn);
    },
    
    createRippleEffect(btn) {
        const ripple = document.createElement('div');
        ripple.className = 'neon-ripple';
        
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = '50%';
        ripple.style.top = '50%';
        ripple.style.marginLeft = -size / 2 + 'px';
        ripple.style.marginTop = -size / 2 + 'px';
        
        btn.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    },
    
    createNeonParticles(element) {
        const rect = element.getBoundingClientRect();
        const particleCount = 8;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'neon-ui-particle';
            
            const angle = (Math.PI * 2 / particleCount) * i;
            const distance = 30 + Math.random() * 20;
            const x = rect.left + rect.width / 2 + Math.cos(angle) * distance;
            const y = rect.top + rect.height / 2 + Math.sin(angle) * distance;
            
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.setProperty('--tx', Math.cos(angle) * distance + 'px');
            particle.style.setProperty('--ty', Math.sin(angle) * distance + 'px');
            
            document.body.appendChild(particle);
            
            setTimeout(() => particle.remove(), 800);
        }
    },
    
    showScreen(screenName) {
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
            screen.classList.add('screen-exit');
        });
        
        setTimeout(() => {
            Object.values(this.screens).forEach(screen => {
                screen.classList.remove('screen-exit');
            });
            
            if (this.screens[screenName]) {
                this.screens[screenName].classList.add('active');
                this.screens[screenName].classList.add('screen-enter');
                
                setTimeout(() => {
                    this.screens[screenName].classList.remove('screen-enter');
                }, 300);
            }
        }, 150);
        
        if (screenName === 'settings') {
            this.elements.toggleSfx.checked = AudioManager.sfxEnabled;
            this.elements.toggleBgm.checked = AudioManager.bgmEnabled;
        }
    },
    
    showModal(modalName) {
        if (this.modals[modalName]) {
            setTimeout(() => {
                this.modals[modalName].classList.add('active');
                this.modals[modalName].classList.add('modal-enter');
                
                this.createModalGlow(modalName);
                
                setTimeout(() => {
                    this.modals[modalName].classList.remove('modal-enter');
                }, 400);
            }, 10);
        }
    },
    
    hideModal(modalName) {
        if (this.modals[modalName]) {
            this.modals[modalName].classList.add('modal-exit');
            
            setTimeout(() => {
                this.modals[modalName].classList.remove('active');
                this.modals[modalName].classList.remove('modal-exit');
            }, 300);
        }
    },
    
    hideModalWithEffect(modalName) {
        if (this.modals[modalName]) {
            this.modals[modalName].classList.add('modal-exit');
            
            const modalContent = this.modals[modalName].querySelector('.modal-content');
            if (modalContent) {
                modalContent.classList.add('modal-shrink');
            }
            
            setTimeout(() => {
                this.modals[modalName].classList.remove('active');
                this.modals[modalName].classList.remove('modal-exit');
                if (modalContent) {
                    modalContent.classList.remove('modal-shrink');
                }
            }, 350);
        }
    },
    
    hideAllModals() {
        Object.values(this.modals).forEach(modal => {
            modal.classList.remove('active');
            modal.classList.remove('modal-enter');
            modal.classList.remove('modal-exit');
        });
    },
    
    createModalGlow(modalName) {
        const modal = this.modals[modalName];
        if (!modal) return;
        
        const glow = document.createElement('div');
        glow.className = 'modal-neon-glow';
        modal.querySelector('.modal-overlay')?.appendChild(glow);
        
        setTimeout(() => glow.remove(), 600);
    },
    
    updateHomeScreen() {
        this.animateValue(this.elements.highScore, LevelManager.getHighScore());
        this.animateValue(this.elements.maxLevel, LevelManager.getMaxLevel());
    },
    
    animateValue(element, newValue) {
        const currentValue = parseInt(element.textContent) || 0;
        const diff = newValue - currentValue;
        const duration = 500;
        const steps = 20;
        const stepValue = diff / steps;
        let step = 0;
        
        const interval = setInterval(() => {
            step++;
            element.textContent = Math.round(currentValue + stepValue * step);
            
            element.style.transform = `scale(${1 + (step / steps) * 0.1})`;
            element.style.color = step % 2 === 0 ? '#00ffff' : '#ff00de';
            
            if (step >= steps) {
                clearInterval(interval);
                element.textContent = newValue;
                element.style.transform = '';
                element.style.color = '';
            }
        }, duration / steps);
    },
    
    updateGameHUD(level, knives) {
        this.elements.currentLevel.textContent = `关卡 ${level}`;
        this.elements.knifeCount.textContent = `飞刀: ${knives}`;
        
        this.pulseElement(this.elements.currentLevel);
        this.pulseElement(this.elements.knifeCount);
    },
    
    updateGameScore(score) {
        const currentScore = parseInt(this.elements.gameScore.textContent) || 0;
        
        if (score > currentScore) {
            this.animateValue(this.elements.gameScore, score);
            this.pulseElement(this.elements.gameScore);
        } else {
            this.elements.gameScore.textContent = score;
        }
    },
    
    updateCombo(combo) {
        this.elements.comboCounter.textContent = combo;
        if (combo > 0) {
            this.elements.comboCounter.style.color = '#00ffff';
            this.elements.comboCounter.style.textShadow = '0 0 10px #00ffff, 0 0 20px #00ffff';
        } else {
            this.elements.comboCounter.style.color = '';
            this.elements.comboCounter.style.textShadow = '';
        }
    },
    
    updateSpecialKnifeCharges(charges) {
        this.elements.specialKnifeCharges.textContent = `${charges}/3`;
        if (charges > 0) {
            this.elements.specialKnifeCharges.style.color = '#ff00de';
            this.elements.specialKnifeCharges.style.textShadow = '0 0 10px #ff00de, 0 0 20px #ff00de';
        } else {
            this.elements.specialKnifeCharges.style.color = '';
            this.elements.specialKnifeCharges.style.textShadow = '';
        }
    },
    
    pulseElement(element) {
        element.classList.add('neon-pulse');
        
        setTimeout(() => {
            element.classList.remove('neon-pulse');
        }, 500);
    },
    
    showVictory(score, bonus) {
        this.elements.victoryScore.textContent = score;
        this.bonusScore.textContent = bonus;
        
        this.showModal('victory');
        
        this.createVictoryCelebration();
    },
    
    showGameOver(message) {
        this.elements.failMessage.textContent = message;
        
        this.showModal('gameover');
        
        this.createGlitchEffect(this.modals.gameover);
    },
    
    createVictoryCelebration() {
        const modal = this.modals.victory;
        if (!modal) return;
        
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                const spark = document.createElement('div');
                spark.className = 'victory-spark';
                spark.style.left = Math.random() * 100 + '%';
                spark.style.top = Math.random() * 100 + '%';
                spark.style.setProperty('--rotation', Math.random() * 360 + 'deg');
                spark.style.animationDelay = Math.random() * 0.3 + 's';
                
                modal.appendChild(spark);
                
                setTimeout(() => spark.remove(), 1500);
            }, i * 80);
        }
    },
    
    createGlitchEffect(element) {
        element.classList.add('glitch-effect');
        
        let glitchCount = 0;
        const glitchInterval = setInterval(() => {
            element.style.transform = `translate(${(Math.random() - 0.5) * 6}px, ${(Math.random() - 0.5) * 4}px) skew(${(Math.random() - 0.5) * 2}deg)`;
            
            glitchCount++;
            if (glitchCount > 8) {
                clearInterval(glitchInterval);
                element.style.transform = '';
                element.classList.remove('glitch-effect');
            }
        }, 60);
    },
    
    renderLevelGrid() {
        const grid = this.elements.levelsGrid;
        grid.innerHTML = '';
        
        for (let i = 1; i <= 30; i++) {
            const btn = document.createElement('button');
            btn.className = 'level-btn neon-level-btn';
            btn.innerHTML = `<span class="level-number">${i}</span>`;
            
            const isUnlocked = LevelManager.isLevelUnlocked(i);
            const isCompleted = LevelManager.isLevelCompleted(i);
            
            if (isCompleted) {
                btn.classList.add('completed', 'neon-completed');
                btn.innerHTML += '<span class="level-star">✓</span>';
            } else if (isUnlocked) {
                btn.classList.add('unlocked', 'neon-unlocked');
            } else {
                btn.classList.add('locked', 'neon-locked');
                btn.innerHTML = '<span class="level-lock">🔒</span>';
            }
            
            if (isUnlocked) {
                btn.addEventListener('click', () => {
                    this.playNeonClick(btn);
                    AudioManager.playClick();
                    LevelManager.setLevel(i);
                    this.startGame();
                });
                
                btn.addEventListener('mouseenter', () => {
                    this.createHoverGlow(btn);
                });
            }
            
            grid.appendChild(btn);
        }
    },
    
    createHoverGlow(btn) {
        const glow = document.createElement('div');
        glow.className = 'level-hover-glow';
        btn.appendChild(glow);
        
        setTimeout(() => glow.remove(), 400);
    },
    
    startGame() {
        this.showScreen('game');
        if (window.Game) {
            setTimeout(() => {
                window.Game.startLevel();
            }, 350);
        }
    },
    
    showAssistItem() {
        const level = LevelManager.getCurrentLevel();
        if (level.id > 1 && !LevelManager.assistLineActive) {
            this.elements.assistItem.classList.remove('hidden');
            this.elements.assistItem.classList.add('assist-enter');
            
            setTimeout(() => {
                this.elements.assistItem.classList.remove('assist-enter');
            }, 500);
        } else {
            this.elements.assistItem.classList.add('hidden');
        }
    },
    
    hideAssistItem() {
        this.elements.assistItem.classList.add('hidden');
    },
    
    showAd(type) {
        console.log(`Showing ${type} ad...`);
        
        const loadingOverlay = this.createLoadingOverlay();
        
        setTimeout(() => {
            loadingOverlay.remove();
            
            if (type === 'revive') {
                this.hideModalWithEffect('gameover');
                setTimeout(() => {
                    if (window.Game) window.Game.revive();
                }, 300);
            } else if (type === 'chest') {
                this.hideModalWithEffect('victory');
                setTimeout(() => {
                    this.showChestReward();
                }, 300);
            } else if (type === 'assist') {
                this.hideAssistItem();
                LevelManager.activateAssistLine();
                if (window.Game) window.Game.activateAssistLine();
            }
        }, 1200);
    },
    
    createLoadingOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'ad-loading-overlay';
        overlay.innerHTML = `
            <div class="ad-loading-content">
                <div class="cyber-spinner"></div>
                <p>加载广告中...</p>
            </div>
        `;
        document.body.appendChild(overlay);
        
        return overlay;
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
        
        this.createChestOpenAnimation();
    },
    
    createChestOpenAnimation() {
        const modal = this.modals.chest;
        if (!modal) return;
        
        const skinElement = this.elements.skinName;
        skinElement.classList.add('skin-reveal');
        
        setTimeout(() => {
            for (let i = 0; i < 12; i++) {
                setTimeout(() => {
                    const particle = document.createElement('div');
                    particle.className = 'chest-particle';
                    particle.style.left = '50%';
                    particle.style.top = '40%';
                    particle.style.setProperty('--angle', (i * 30) + 'deg');
                    
                    modal.appendChild(particle);
                    
                    setTimeout(() => particle.remove(), 1000);
                }, i * 60);
            }
        }, 400);
        
        setTimeout(() => {
            skinElement.classList.remove('skin-reveal');
        }, 2000);
    },
    
    shareToTikTok() {
        const shareText = '我在玩【霓虹飞刀大师】，快来挑战吧！⚡️';
        const shareUrl = window.location.href;
        
        this.showNotification('正在分享到TikTok...');
        
        if (navigator.share) {
            navigator.share({
                title: '霓虹飞刀大师',
                text: shareText,
                url: shareUrl
            }).then(() => {
                this.showNotification('分享成功！');
            }).catch(err => {
                console.log('Share failed:', err);
                this.fallbackShare(shareText, shareUrl);
            });
        } else {
            this.fallbackShare(shareText, shareUrl);
        }
    },
    
    fallbackShare(text, url) {
        const tiktokUrl = `https://www.tiktok.com/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        window.open(tiktokUrl, '_blank');
    },
    
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'neon-notification';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('notification-show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('notification-show');
            setTimeout(() => notification.remove(), 300);
        }, 2500);
    },
    
    showNeonConfirm(message, onConfirm) {
        const overlay = document.createElement('div');
        overlay.className = 'neon-confirm-overlay';
        overlay.innerHTML = `
            <div class="neon-confirm-box">
                <p class="confirm-message">${message}</p>
                <div class="confirm-buttons">
                    <button class="neon-btn confirm-btn confirm-yes">确定</button>
                    <button class="neon-btn confirm-btn confirm-no">取消</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        setTimeout(() => overlay.classList.add('confirm-active'), 10);
        
        overlay.querySelector('.confirm-yes').addEventListener('click', () => {
            AudioManager.playClick();
            onConfirm();
            overlay.classList.remove('confirm-active');
            setTimeout(() => overlay.remove(), 300);
        });
        
        overlay.querySelector('.confirm-no').addEventListener('click', () => {
            AudioManager.playClick();
            overlay.classList.remove('confirm-active');
            setTimeout(() => overlay.remove(), 300);
        });
    },
    
    initNeonAnimations() {
        document.documentElement.style.setProperty('--neon-pink', '#ff00de');
        document.documentElement.style.setProperty('--neon-cyan', '#00ffff');
        document.documentElement.style.setProperty('--neon-purple', '#8a2be2');
        
        this.initCursorTrail();
    },
    
    initCursorTrail() {
        if ('ontouchstart' in window) return;
        
        let lastTime = 0;
        const trailInterval = 50;
        
        document.addEventListener('mousemove', (e) => {
            const now = Date.now();
            if (now - lastTime < trailInterval) return;
            lastTime = now;
            
            const trail = document.createElement('div');
            trail.className = 'cursor-trail';
            trail.style.left = e.clientX + 'px';
            trail.style.top = e.clientY + 'px';
            
            document.body.appendChild(trail);
            
            setTimeout(() => trail.remove(), 500);
        });
    }
};

window.UIManager = UIManager;