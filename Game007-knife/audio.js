const AudioManager = {
    audioContext: null,
    sfxEnabled: true,
    bgmEnabled: true,
    bgmOscillator: null,
    bgmGain: null,
    isBGMPlaying: false,
    
    init() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.loadSettings();
    },
    
    loadSettings() {
        const settings = JSON.parse(localStorage.getItem('knifeGameSettings') || '{}');
        this.sfxEnabled = settings.sfxEnabled !== false;
        this.bgmEnabled = settings.bgmEnabled !== false;
    },
    
    saveSettings() {
        const settings = {
            sfxEnabled: this.sfxEnabled,
            bgmEnabled: this.bgmEnabled
        };
        localStorage.setItem('knifeGameSettings', JSON.stringify(settings));
    },
    
    toggleSFX() {
        this.sfxEnabled = !this.sfxEnabled;
        this.saveSettings();
        return this.sfxEnabled;
    },
    
    toggleBGM() {
        this.bgmEnabled = !this.bgmEnabled;
        this.saveSettings();
        if (this.bgmEnabled) {
            this.startBGM();
        } else {
            this.stopBGM();
        }
        return this.bgmEnabled;
    },
    
    playTone(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.sfxEnabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    },
    
    playThrow() {
        if (!this.sfxEnabled) return;
        this.playTone(800, 0.1, 'sine', 0.2);
        setTimeout(() => this.playTone(600, 0.05, 'sine', 0.15), 50);
    },
    
    playHit() {
        if (!this.sfxEnabled) return;
        this.playTone(1200, 0.05, 'square', 0.15);
        this.playTone(800, 0.1, 'sine', 0.2);
    },
    
    playFail() {
        if (!this.sfxEnabled) return;
        this.playTone(400, 0.2, 'sawtooth', 0.3);
        setTimeout(() => this.playTone(300, 0.3, 'sawtooth', 0.25), 150);
        setTimeout(() => this.playTone(200, 0.4, 'sawtooth', 0.2), 300);
    },
    
    playVictory() {
        if (!this.sfxEnabled) return;
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.2, 'sine', 0.25), i * 150);
        });
    },
    
    playClick() {
        if (!this.sfxEnabled) return;
        this.playTone(1000, 0.05, 'sine', 0.15);
    },
    
    playChest() {
        if (!this.sfxEnabled) return;
        const notes = [523, 659, 784, 880, 1047];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.15, 'sine', 0.2), i * 100);
        });
    },
    
    startBGM() {
        if (!this.bgmEnabled || !this.audioContext || this.isBGMPlaying) return;
        
        this.isBGMPlaying = true;
        this.playBGMLoop();
    },
    
    playBGMLoop() {
        if (!this.bgmEnabled || !this.isBGMPlaying) return;
        
        const notes = [262, 330, 392, 330, 262, 330, 392, 523];
        const duration = 0.5;
        
        notes.forEach((freq, i) => {
            setTimeout(() => {
                if (this.bgmEnabled && this.isBGMPlaying) {
                    this.playTone(freq, duration * 0.8, 'sine', 0.08);
                }
            }, i * duration * 1000);
        });
        
        setTimeout(() => {
            if (this.bgmEnabled && this.isBGMPlaying) {
                this.playBGMLoop();
            }
        }, notes.length * duration * 1000);
    },
    
    stopBGM() {
        this.isBGMPlaying = false;
    },
    
    resumeContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
};

window.AudioManager = AudioManager;
