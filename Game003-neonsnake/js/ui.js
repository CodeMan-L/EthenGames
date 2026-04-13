const UI = {
    screens: {},
    _resetInterval: null,

    init() {
        this.screens = {
            home: document.getElementById('screen-home'),
            levels: document.getElementById('screen-levels'),
            game: document.getElementById('screen-game'),
            pause: document.getElementById('screen-pause'),
            gameover: document.getElementById('screen-gameover'),
            victory: document.getElementById('screen-victory'),
            skin: document.getElementById('screen-skin'),
            settings: document.getElementById('screen-settings'),
        };
        this._bindHome();
        this._bindLevels();
        this._bindGame();
        this._bindPause();
        this._bindGameOver();
        this._bindVictory();
        this._bindSkin();
        this._bindSettings();
    },

    show(name) {
        const overlayScreens = ['pause', 'gameover', 'victory'];
        const isOverlay = overlayScreens.includes(name);

        if (isOverlay) {
            Object.keys(this.screens).forEach(key => {
                if (overlayScreens.includes(key)) {
                    this.screens[key].classList.remove('active');
                }
            });
            if (this.screens[name]) this.screens[name].classList.add('active');
        } else {
            Object.values(this.screens).forEach(s => s.classList.remove('active'));
            if (this.screens[name]) this.screens[name].classList.add('active');
        }

        if (name === 'levels') this._updateLevelCards();
        if (name === 'skin') this._initSkinScreen();
        if (name === 'settings') this._initSettingsScreen();
    },

    _bindHome() {
        document.getElementById('btn-start').onclick = () => {
            AudioManager.playClick();
            this.show('game');
            requestAnimationFrame(() => Game.start(1));
        };
        document.getElementById('btn-levels').onclick = () => {
            AudioManager.playClick();
            this.show('levels');
        };
        document.getElementById('btn-skin').onclick = () => {
            AudioManager.playClick();
            this.show('skin');
        };
        document.getElementById('btn-settings').onclick = () => {
            AudioManager.playClick();
            this.show('settings');
        };
    },

    _bindLevels() {
        document.getElementById('btn-back-levels').onclick = () => {
            AudioManager.playClick();
            this.show('home');
        };
        document.querySelectorAll('.level-card').forEach(card => {
            card.onclick = () => {
                const lv = parseInt(card.dataset.level);
                if (Storage.isLevelUnlocked(lv)) {
                    AudioManager.playClick();
                    this.show('game');
                    requestAnimationFrame(() => Game.start(lv));
                }
            };
        });
    },

    _bindGame() {
        document.getElementById('btn-pause').onclick = () => {
            AudioManager.playClick();
            Game.pause();
            this.show('pause');
        };
        document.getElementById('btn-sound').onclick = () => {
            const muted = AudioManager.toggleMute();
            document.getElementById('btn-sound').textContent = muted ? CONFIG.JP.SOUND_OFF : CONFIG.JP.SOUND_ON;
        };
    },

    _bindPause() {
        document.getElementById('btn-resume').onclick = () => {
            AudioManager.playClick();
            this.screens.pause.classList.remove('active');
            Game.resume();
        };
        document.getElementById('btn-quit').onclick = () => {
            AudioManager.playClick();
            Game.stop();
            this.screens.pause.classList.remove('active');
            this.show('home');
        };
    },

    _bindGameOver() {
        document.getElementById('btn-revive').onclick = () => {
            AudioManager.playClick();
            const reviveBtn = document.getElementById('btn-revive');
            reviveBtn.disabled = true;
            reviveBtn.innerHTML = '読み込み中...';
            Game.revive();
        };
        document.getElementById('btn-home-over').onclick = () => {
            AudioManager.playClick();
            this.screens.gameover.classList.remove('active');
            this.show('home');
        };
    },

    _bindVictory() {
        document.getElementById('btn-next').onclick = () => {
            AudioManager.playClick();
            const next = Game.getNextLevel();
            this.screens.victory.classList.remove('active');
            if (next) {
                this.show('game');
                requestAnimationFrame(() => Game.start(next));
            } else {
                this.show('home');
            }
        };
        document.getElementById('btn-home-victory').onclick = () => {
            AudioManager.playClick();
            this.screens.victory.classList.remove('active');
            this.show('home');
        };
    },

    _bindSkin() {
        document.getElementById('btn-back-skin').onclick = () => {
            AudioManager.playClick();
            this.show('home');
        };
    },

    _bindSettings() {
        document.getElementById('btn-back-settings').onclick = () => {
            AudioManager.playClick();
            this.show('home');
        };
    },

    _updateLevelCards() {
        document.querySelectorAll('.level-card').forEach(card => {
            const lv = parseInt(card.dataset.level);
            const unlocked = Storage.isLevelUnlocked(lv);
            const best = Storage.getBestScore(lv);
            const cfg = CONFIG.LEVELS[lv];

            card.classList.toggle('locked', !unlocked);
            card.querySelector('.level-name').textContent = cfg.name;
            card.querySelector('.level-sub').textContent = cfg.subtitle;
            card.querySelector('.level-best').textContent = unlocked ? `${CONFIG.JP.BEST}: ${best}` : '🔒';
        });
    },

    showGameOver(score, best) {
        document.getElementById('over-score').textContent = score;
        document.getElementById('over-best').textContent = best;
        const reviveBtn = document.getElementById('btn-revive');
        reviveBtn.style.display = '';
        reviveBtn.disabled = false;
        reviveBtn.innerHTML = `${CONFIG.JP.WATCH_AD} <span id="respawn-countdown"></span>`;
        this.show('gameover');
        Game.startRespawnCountdown();
        console.log(`[UI] 游戏结束画面显示, 分数: ${score}, 最高: ${best}`);
    },

    hideGameOver() {
        this.screens.gameover.classList.remove('active');
        console.log('[UI] 游戏结束画面已隐藏, 复活成功');
    },

    showFinalGameOver() {
        document.getElementById('btn-revive').style.display = 'none';
        const countdownEl = document.getElementById('respawn-countdown');
        if (countdownEl) countdownEl.textContent = '(0)';
    },

    showVictory(level, score) {
        document.getElementById('victory-level').textContent = `${CONFIG.JP.LV}${level} ${CONFIG.LEVELS[level].name}`;
        document.getElementById('victory-score').textContent = score;
        const nextBtn = document.getElementById('btn-next');
        nextBtn.style.display = level >= 3 ? 'none' : '';
        this.show('victory');
    },

    _initSkinScreen() {
        const skin = Storage.getSkin();
        this._renderPresets(skin);
        this._renderCustomColors(skin);
        this._renderSlots(skin);
        this._renderOpacity(skin);
        this._renderPreview(skin);
        this._initDragDrop();
    },

    _renderPresets(skin) {
        const container = document.getElementById('preset-list');
        container.innerHTML = '';
        CONFIG.SKINS.presets.forEach(p => {
            const unlocked = Storage.isPresetUnlocked(p.id);
            const el = document.createElement('div');
            el.className = `preset-card${skin.preset === p.id ? ' active' : ''}${!unlocked ? ' locked' : ''}`;
            el.innerHTML = `
                <div class="preset-preview">
                    <span style="background:${p.head};width:20px;height:20px;border-radius:50%;display:inline-block;box-shadow:0 0 8px ${p.head}"></span>
                    <span style="background:${p.body};width:20px;height:20px;border-radius:4px;display:inline-block;box-shadow:0 0 8px ${p.body}"></span>
                </div>
                <div class="preset-name">${unlocked ? p.name : '🔒'}</div>
            `;
            el.onclick = () => {
                AudioManager.playClick();
                if (!unlocked) {
                    this._unlockPreset(p.id);
                    return;
                }
                Storage.setSkinPreset(p.id);
                this._initSkinScreen();
            };
            container.appendChild(el);
        });
    },

    async _unlockPreset(presetId) {
        const result = await AdAdapter.showRewardedAd();
        if (result.success) {
            Storage.unlockPreset(presetId);
            Storage.setSkinPreset(presetId);
            this._initSkinScreen();
        }
    },

    _renderCustomColors(skin) {
        const container = document.getElementById('custom-colors');
        container.innerHTML = '';
        CONFIG.SKINS.custom.forEach(c => {
            const unlocked = Storage.isColorUnlocked(c.id);
            const el = document.createElement('div');
            el.className = `color-swatch${!unlocked ? ' locked-color' : ''}`;
            el.style.backgroundColor = unlocked ? c.color : '#333';
            el.style.boxShadow = unlocked ? `0 0 6px ${c.color}` : '0 0 6px #555';
            el.draggable = unlocked;
            el.title = unlocked ? c.name : '🔒 広告を見て解除';
            el.dataset.color = c.color;
            el.dataset.colorId = c.id;
            if (unlocked) {
                el.ondragstart = (e) => e.dataTransfer.setData('color', c.color);
            }
            el.onclick = () => {
                AudioManager.playClick();
                if (!unlocked) {
                    this._unlockColor(c.id);
                    return;
                }
                Storage.setSkinColor('head', c.color);
                this._initSkinScreen();
            };
            container.appendChild(el);
        });
    },

    async _unlockColor(colorId) {
        const result = await AdAdapter.showRewardedAd();
        if (result.success) {
            Storage.unlockColor(colorId);
            this._initSkinScreen();
        }
    },

    _renderSlots(skin) {
        const headSlot = document.getElementById('slot-head');
        const bodySlot = document.getElementById('slot-body');
        const headColor = skin.headColor || CONFIG.COLORS.SNAKE_HEAD;
        const bodyColor = skin.bodyColor || CONFIG.COLORS.SNAKE_BODY;

        headSlot.style.backgroundColor = headColor;
        headSlot.style.boxShadow = `0 0 12px ${headColor}`;
        bodySlot.style.backgroundColor = bodyColor;
        bodySlot.style.boxShadow = `0 0 12px ${bodyColor}`;
    },

    _renderOpacity(skin) {
        const headSlider = document.getElementById('opacity-head');
        const bodySlider = document.getElementById('opacity-body');
        const headVal = document.getElementById('opacity-head-val');
        const bodyVal = document.getElementById('opacity-body-val');

        headSlider.value = skin.headOpacity;
        bodySlider.value = skin.bodyOpacity;
        headVal.textContent = `${skin.headOpacity}%`;
        bodyVal.textContent = `${skin.bodyOpacity}%`;

        headSlider.oninput = () => {
            Storage.setSkinOpacity('head', parseInt(headSlider.value));
            headVal.textContent = `${headSlider.value}%`;
            this._renderPreview(Storage.getSkin());
        };
        bodySlider.oninput = () => {
            Storage.setSkinOpacity('body', parseInt(bodySlider.value));
            bodyVal.textContent = `${bodySlider.value}%`;
            this._renderPreview(Storage.getSkin());
        };
    },

    _renderPreview(skin) {
        const head = document.querySelector('.preview-head');
        const bodies = document.querySelectorAll('.preview-body');
        const headColor = skin.headColor || CONFIG.COLORS.SNAKE_HEAD;
        const bodyColor = skin.bodyColor || CONFIG.COLORS.SNAKE_BODY;

        if (head) {
            head.style.backgroundColor = headColor;
            head.style.boxShadow = `0 0 10px ${headColor}`;
            head.style.opacity = skin.headOpacity / 100;
        }
        bodies.forEach(b => {
            b.style.backgroundColor = bodyColor;
            b.style.boxShadow = `0 0 8px ${bodyColor}`;
            b.style.opacity = skin.bodyOpacity / 100;
        });
    },

    _initDragDrop() {
        const slots = document.querySelectorAll('.skin-slot');
        slots.forEach(slot => {
            slot.ondragover = (e) => { e.preventDefault(); slot.classList.add('drag-over'); };
            slot.ondragleave = () => slot.classList.remove('drag-over');
            slot.ondrop = (e) => {
                e.preventDefault();
                slot.classList.remove('drag-over');
                const color = e.dataTransfer.getData('color');
                const part = slot.dataset.part;
                if (color && part) {
                    Storage.setSkinColor(part, color);
                    this._initSkinScreen();
                }
            };
        });

        const swatches = document.querySelectorAll('.color-swatch');
        swatches.forEach(sw => {
            sw.ontouchstart = (e) => sw.classList.add('dragging');
            sw.ontouchend = (e) => {
                sw.classList.remove('dragging');
                const touch = e.changedTouches[0];
                const target = document.elementFromPoint(touch.clientX, touch.clientY);
                const slot = target?.closest('.skin-slot');
                if (slot) {
                    const color = sw.dataset.color;
                    const part = slot.dataset.part;
                    if (color && part) {
                        Storage.setSkinColor(part, color);
                        this._initSkinScreen();
                    }
                }
            };
        });
    },

    _initSettingsScreen() {
        const sound = Storage.getSound();
        const bgmSlider = document.getElementById('bgm-slider');
        const sfxSlider = document.getElementById('sfx-slider');
        const bgmVal = document.getElementById('bgm-val');
        const sfxVal = document.getElementById('sfx-val');

        bgmSlider.value = sound.bgmVolume;
        sfxSlider.value = sound.sfxVolume;
        bgmVal.textContent = `${sound.bgmVolume}%`;
        sfxVal.textContent = `${sound.sfxVolume}%`;

        bgmSlider.oninput = () => {
            AudioManager.setBgmVolume(parseInt(bgmSlider.value));
            bgmVal.textContent = `${bgmSlider.value}%`;
        };
        sfxSlider.oninput = () => {
            AudioManager.setSfxVolume(parseInt(sfxSlider.value));
            sfxVal.textContent = `${sfxSlider.value}%`;
        };

        document.getElementById('btn-reset').onclick = () => {
            document.getElementById('reset-modal').classList.remove('hidden');
        };
        document.getElementById('btn-cancel-reset').onclick = () => {
            document.getElementById('reset-modal').classList.add('hidden');
        };
        document.getElementById('btn-confirm-reset').onclick = () => {
            Storage.resetAll();
            document.getElementById('reset-modal').classList.add('hidden');
            this.show('home');
        };
    },
};

window.UI = UI;
