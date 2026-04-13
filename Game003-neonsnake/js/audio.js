const AudioManager = {
    ctx: null,
    bgmGain: null,
    sfxGain: null,
    _bgmOsc: null,
    _bgmLfo: null,
    _muted: false,

    init() {
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.bgmGain = this.ctx.createGain();
            this.sfxGain = this.ctx.createGain();
            this.bgmGain.connect(this.ctx.destination);
            this.sfxGain.connect(this.ctx.destination);

            const sound = Storage.getSound();
            this.bgmGain.gain.value = sound.bgmVolume / 100 * 0.3;
            this.sfxGain.gain.value = sound.sfxVolume / 100;
            this._muted = sound.muted;
            if (this._muted) this._muteAll();
        } catch (e) { /* Web Audio not available */ }
    },

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    startBgm() {
        if (!this.ctx || this._bgmOsc) return;
        this.resume();

        const osc = this.ctx.createOscillator();
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.value = 55;
        lfo.type = 'sine';
        lfo.frequency.value = 0.2;
        lfoGain.gain.value = 10;
        filter.type = 'lowpass';
        filter.frequency.value = 200;

        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        osc.connect(filter);
        filter.connect(this.bgmGain);

        osc.start();
        lfo.start();

        this._bgmOsc = osc;
        this._bgmLfo = lfo;
    },

    stopBgm() {
        if (this._bgmOsc) {
            try { this._bgmOsc.stop(); } catch (e) { /* ignore */ }
            try { this._bgmLfo.stop(); } catch (e) { /* ignore */ }
            this._bgmOsc = null;
            this._bgmLfo = null;
        }
    },

    playEat() {
        this._playTone(880, 0.08, 'sine', 0.3);
        setTimeout(() => this._playTone(1100, 0.06, 'sine', 0.2), 50);
    },

    playDie() {
        this._playTone(300, 0.15, 'sawtooth', 0.3);
        setTimeout(() => this._playTone(200, 0.2, 'sawtooth', 0.25), 100);
        setTimeout(() => this._playTone(100, 0.3, 'sawtooth', 0.2), 200);
    },

    playClick() {
        this._playTone(600, 0.05, 'sine', 0.15);
    },

    playVictory() {
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            setTimeout(() => this._playTone(freq, 0.15, 'sine', 0.25), i * 120);
        });
    },

    playInvincible() {
        this._playTone(1200, 0.1, 'sine', 0.15);
    },

    _playTone(freq, duration, type, volume) {
        if (!this.ctx || this._muted) return;
        this.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type || 'sine';
        osc.frequency.value = freq;
        gain.gain.value = (volume || 0.2) * (this.sfxGain.gain.value);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start();
        osc.stop(this.ctx.currentTime + duration + 0.05);
    },

    toggleMute() {
        this._muted = !this._muted;
        if (this._muted) {
            this._muteAll();
        } else {
            this._unmuteAll();
        }
        Storage.setSoundMuted(this._muted);
        return this._muted;
    },

    _muteAll() {
        if (this.bgmGain) this.bgmGain.gain.value = 0;
        if (this.sfxGain) this.sfxGain.gain.value = 0;
    },

    _unmuteAll() {
        const sound = Storage.getSound();
        if (this.bgmGain) this.bgmGain.gain.value = sound.bgmVolume / 100 * 0.3;
        if (this.sfxGain) this.sfxGain.gain.value = sound.sfxVolume / 100;
    },

    setBgmVolume(vol) {
        Storage.setBgmVolume(vol);
        if (this.bgmGain && !this._muted) {
            this.bgmGain.gain.value = vol / 100 * 0.3;
        }
    },

    setSfxVolume(vol) {
        Storage.setSfxVolume(vol);
        if (this.sfxGain && !this._muted) {
            this.sfxGain.gain.value = vol / 100;
        }
    },

    isMuted() {
        return this._muted;
    },
};

window.AudioManager = AudioManager;
