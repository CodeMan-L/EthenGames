const Storage = {
    _data: null,

    init() {
        try {
            const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
            this._data = raw ? JSON.parse(raw) : this._defaults();
        } catch (e) {
            this._data = this._defaults();
        }
        this._ensureFields();
    },

    _defaults() {
        return {
            levelProgress: {1: true},
            bestScores: {},
            totalDeaths: 0,
            skin: {
                preset: 'neon',
                headColor: null,
                bodyColor: null,
                headOpacity: 100,
                bodyOpacity: 100,
            },
            unlockedPresets: ['neon'],
            unlockedColors: [],
            sound: {
                bgmVolume: CONFIG.GAME.DEFAULT_BGM_VOLUME,
                sfxVolume: CONFIG.GAME.DEFAULT_SFX_VOLUME,
                muted: false,
            },
        };
    },

    _ensureFields() {
        const d = this._data;
        const def = this._defaults();
        if (!d.levelProgress) d.levelProgress = def.levelProgress;
        if (!d.bestScores) d.bestScores = def.bestScores;
        if (d.totalDeaths === undefined) d.totalDeaths = 0;
        if (!d.skin) d.skin = def.skin;
        if (d.skin.headOpacity === undefined) d.skin.headOpacity = 100;
        if (d.skin.bodyOpacity === undefined) d.skin.bodyOpacity = 100;
        if (!d.sound) d.sound = def.sound;
        if (d.sound.muted === undefined) d.sound.muted = false;
        if (!d.unlockedPresets) d.unlockedPresets = ['neon'];
        if (!d.unlockedColors) d.unlockedColors = [];
        this._save();
    },

    _save() {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(this._data));
        } catch (e) { /* ignore */ }
    },

    isLevelUnlocked(level) {
        return !!this._data.levelProgress[level];
    },

    unlockLevel(level) {
        this._data.levelProgress[level] = true;
        this._save();
    },

    completeLevel(level) {
        this._data.levelProgress[level] = true;
        if (level < 3) this._data.levelProgress[level + 1] = true;
        this._save();
    },

    getBestScore(level) {
        return this._data.bestScores[level] || 0;
    },

    setBestScore(level, score) {
        if (score > this.getBestScore(level)) {
            this._data.bestScores[level] = score;
            this._save();
            return true;
        }
        return false;
    },

    getDeaths() {
        return this._data.totalDeaths;
    },

    addDeath() {
        this._data.totalDeaths++;
        this._save();
    },

    getSkin() {
        return {...this._data.skin};
    },

    setSkinPreset(presetId) {
        const preset = CONFIG.SKINS.presets.find(p => p.id === presetId);
        if (preset) {
            this._data.skin.preset = presetId;
            this._data.skin.headColor = preset.head;
            this._data.skin.bodyColor = preset.body;
            this._save();
        }
    },

    setSkinColor(part, color) {
        if (part === 'head') this._data.skin.headColor = color;
        else if (part === 'body') this._data.skin.bodyColor = color;
        this._data.skin.preset = 'custom';
        this._save();
    },

    setSkinOpacity(part, value) {
        if (part === 'head') this._data.skin.headOpacity = value;
        else if (part === 'body') this._data.skin.bodyOpacity = value;
        this._save();
    },

    getSound() {
        return {...this._data.sound};
    },

    setSoundMuted(muted) {
        this._data.sound.muted = muted;
        this._save();
    },

    setBgmVolume(vol) {
        this._data.sound.bgmVolume = vol;
        this._save();
    },

    setSfxVolume(vol) {
        this._data.sound.sfxVolume = vol;
        this._save();
    },

    resetAll() {
        this._data = this._defaults();
        this._save();
    },

    isPresetUnlocked(presetId) {
        return this._data.unlockedPresets.includes(presetId);
    },

    unlockPreset(presetId) {
        if (!this._data.unlockedPresets.includes(presetId)) {
            this._data.unlockedPresets.push(presetId);
            this._save();
        }
    },

    isColorUnlocked(colorId) {
        return this._data.unlockedColors.includes(colorId);
    },

    unlockColor(colorId) {
        if (!this._data.unlockedColors.includes(colorId)) {
            this._data.unlockedColors.push(colorId);
            this._save();
        }
    },
};

window.Storage = Storage;
