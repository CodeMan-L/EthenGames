const AudioManager = {
    ctx: null,
    sfxEnabled: true,
    bgmEnabled: true,
    vibrateEnabled: true,
    bgmOscillators: [],
    bgmGain: null,
    bgmPlaying: false,

    init() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.loadSettings();
    },

    loadSettings() {
        const settings = JSON.parse(localStorage.getItem('neonBreakout_settings') || '{}');
        this.sfxEnabled = settings.sfxEnabled !== false;
        this.bgmEnabled = settings.bgmEnabled !== false;
        this.vibrateEnabled = settings.vibrateEnabled !== false;
    },

    saveSettings() {
        localStorage.setItem('neonBreakout_settings', JSON.stringify({
            sfxEnabled: this.sfxEnabled,
            bgmEnabled: this.bgmEnabled,
            vibrateEnabled: this.vibrateEnabled
        }));
    },

    resumeContext() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    playTone(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.sfxEnabled || !this.ctx) return;
        
        this.resumeContext();
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + duration);
    },

    playClick() {
        this.playTone(800, 0.1, 'square', 0.2);
        this.vibrate(10);
    },

    playBounce() {
        this.playTone(400 + Math.random() * 200, 0.1, 'sine', 0.25);
    },

    playPaddleHit() {
        this.playTone(300, 0.15, 'triangle', 0.3);
        this.vibrate(20);
    },

    playBrickBreak(pitch = 0) {
        const baseFreq = 500 + pitch * 50;
        this.playTone(baseFreq, 0.15, 'square', 0.2);
        this.playTone(baseFreq * 1.5, 0.1, 'sine', 0.15);
        this.vibrate(15);
    },

    playWallHit() {
        this.playTone(200, 0.1, 'triangle', 0.2);
    },

    playLoseLife() {
        this.playTone(200, 0.3, 'sawtooth', 0.3);
        this.playTone(150, 0.4, 'sawtooth', 0.2);
        this.vibrate([50, 30, 50]);
    },

    playGameOver() {
        const notes = [400, 350, 300, 250];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.3, 'sawtooth', 0.3), i * 200);
        });
        this.vibrate([100, 50, 100, 50, 100]);
    },

    playLevelComplete() {
        const melody = [523, 659, 784, 1047];
        melody.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, 0.2, 'sine', 0.3);
                this.playTone(freq * 1.5, 0.15, 'triangle', 0.15);
            }, i * 150);
        });
        this.vibrate([30, 30, 30, 30, 100]);
    },

    playChestOpen() {
        const notes = [523, 659, 784, 880, 1047];
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, 0.25, 'sine', 0.35);
            }, i * 100);
        });
        this.vibrate([20, 20, 20, 20, 50]);
    },

    playPowerUp() {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.playTone(600 + i * 100, 0.1, 'sine', 0.2);
            }, i * 50);
        }
        this.vibrate(30);
    },

    playBomb() {
        this.playTone(100, 0.5, 'sawtooth', 0.4);
        this.playTone(80, 0.6, 'square', 0.3);
        setTimeout(() => {
            for (let i = 0; i < 3; i++) {
                this.playTone(200 + Math.random() * 300, 0.2, 'noise', 0.2);
            }
        }, 100);
        this.vibrate([100, 30, 100]);
    },

    startBGM() {
        if (!this.bgmEnabled || !this.ctx || this.bgmPlaying) return;
        
        this.resumeContext();
        this.bgmPlaying = true;
        
        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        this.bgmGain.connect(this.ctx.destination);
        
        this.playBGMLoop();
    },

    playBGMLoop() {
        if (!this.bgmPlaying || !this.bgmEnabled) return;
        
        const bassline = [
            { note: 65.41, dur: 0.25 },
            { note: 82.41, dur: 0.25 },
            { note: 98.00, dur: 0.25 },
            { note: 82.41, dur: 0.25 }
        ];
        
        const melody = [
            { note: 261.63, dur: 0.125 },
            { note: 329.63, dur: 0.125 },
            { note: 392.00, dur: 0.125 },
            { note: 329.63, dur: 0.125 },
            { note: 293.66, dur: 0.125 },
            { note: 349.23, dur: 0.125 },
            { note: 440.00, dur: 0.125 },
            { note: 349.23, dur: 0.125 }
        ];
        
        let time = this.ctx.currentTime;
        
        bassline.forEach(({ note, dur }) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(note, time);
            
            gain.gain.setValueAtTime(0.1, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + dur * 0.9);
            
            osc.connect(gain);
            gain.connect(this.bgmGain);
            
            osc.start(time);
            osc.stop(time + dur);
            
            time += dur;
        });
        
        time = this.ctx.currentTime;
        melody.forEach(({ note, dur }) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(note, time);
            
            gain.gain.setValueAtTime(0.05, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + dur * 0.8);
            
            osc.connect(gain);
            gain.connect(this.bgmGain);
            
            osc.start(time);
            osc.stop(time + dur);
            
            time += dur;
        });
        
        setTimeout(() => {
            if (this.bgmPlaying && this.bgmEnabled) {
                this.playBGMLoop();
            }
        }, 1000);
    },

    stopBGM() {
        this.bgmPlaying = false;
        if (this.bgmGain) {
            this.bgmGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
        }
    },

    toggleSFX(enabled) {
        this.sfxEnabled = enabled;
        this.saveSettings();
    },

    toggleBGM(enabled) {
        this.bgmEnabled = enabled;
        this.saveSettings();
        if (enabled) {
            this.startBGM();
        } else {
            this.stopBGM();
        }
    },

    toggleVibrate(enabled) {
        this.vibrateEnabled = enabled;
        this.saveSettings();
    },

    vibrate(pattern) {
        if (!this.vibrateEnabled || !navigator.vibrate) return;
        
        if (Array.isArray(pattern)) {
            navigator.vibrate(pattern);
        } else {
            navigator.vibrate(pattern);
        }
    }
};

window.AudioManager = AudioManager;
