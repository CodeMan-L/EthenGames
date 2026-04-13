const AudioManager = {
    audioContext: null,
    soundEnabled: true,
    bgmEnabled: true,
    bgmOscillator: null,
    bgmGain: null,
    isBgmPlaying: false,

    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.loadSettings();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    },

    loadSettings() {
        const soundEnabled = localStorage.getItem('neonBlock_soundEnabled');
        const bgmEnabled = localStorage.getItem('neonBlock_bgmEnabled');
        
        if (soundEnabled !== null) {
            this.soundEnabled = soundEnabled === 'true';
        }
        if (bgmEnabled !== null) {
            this.bgmEnabled = bgmEnabled === 'true';
        }
    },

    saveSettings() {
        localStorage.setItem('neonBlock_soundEnabled', this.soundEnabled);
        localStorage.setItem('neonBlock_bgmEnabled', this.bgmEnabled);
    },

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.saveSettings();
        return this.soundEnabled;
    },

    toggleBgm() {
        this.bgmEnabled = !this.bgmEnabled;
        this.saveSettings();
        if (this.bgmEnabled) {
            this.startBgm();
        } else {
            this.stopBgm();
        }
        return this.bgmEnabled;
    },

    playTone(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.soundEnabled || !this.audioContext) return;

        try {
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }

            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.type = type;
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

            gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (e) {
            console.warn('Error playing tone:', e);
        }
    },

    playClick() {
        if (!this.soundEnabled) return;
        this.playTone(800, 0.1, 'sine', 0.2);
    },

    playEliminate(count) {
        if (!this.soundEnabled) return;
        
        const baseFreq = 400;
        for (let i = 0; i < Math.min(count, 5); i++) {
            setTimeout(() => {
                this.playTone(baseFreq + i * 100, 0.15, 'sine', 0.25);
            }, i * 50);
        }
    },

    playCombo(level) {
        if (!this.soundEnabled) return;
        
        const frequencies = [523, 659, 784, 1047, 1319];
        const freq = frequencies[Math.min(level - 1, frequencies.length - 1)];
        
        this.playTone(freq, 0.2, 'sine', 0.3);
        setTimeout(() => {
            this.playTone(freq * 1.25, 0.15, 'sine', 0.25);
        }, 100);
    },

    playVictory() {
        if (!this.soundEnabled) return;
        
        const melody = [523, 659, 784, 1047, 784, 1047];
        melody.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, 0.3, 'sine', 0.3);
            }, i * 150);
        });
    },

    playDefeat() {
        if (!this.soundEnabled) return;
        
        const melody = [400, 350, 300, 250];
        melody.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, 0.4, 'sine', 0.25);
            }, i * 200);
        });
    },

    playChest() {
        if (!this.soundEnabled) return;
        
        const melody = [523, 659, 784, 1047, 1319, 1568];
        melody.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, 0.2, 'sine', 0.25);
            }, i * 80);
        });
    },

    playAdStart() {
        if (!this.soundEnabled) return;
        this.playTone(600, 0.2, 'triangle', 0.2);
        setTimeout(() => {
            this.playTone(800, 0.2, 'triangle', 0.2);
        }, 150);
    },

    playAdEnd() {
        if (!this.soundEnabled) return;
        this.playTone(800, 0.2, 'triangle', 0.2);
        setTimeout(() => {
            this.playTone(1000, 0.3, 'triangle', 0.25);
        }, 150);
    },

    startBgm() {
        if (!this.bgmEnabled || !this.audioContext || this.isBgmPlaying) return;

        try {
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }

            this.isBgmPlaying = true;
            this.playBgmLoop();
        } catch (e) {
            console.warn('Error starting BGM:', e);
        }
    },

    playBgmLoop() {
        if (!this.bgmEnabled || !this.isBgmPlaying) return;

        const notes = [262, 294, 330, 349, 392, 349, 330, 294];
        const noteDuration = 0.4;
        let noteIndex = 0;

        const playNote = () => {
            if (!this.bgmEnabled || !this.isBgmPlaying) return;

            if (this.soundEnabled) {
                this.playTone(notes[noteIndex], noteDuration * 0.8, 'sine', 0.08);
            }

            noteIndex = (noteIndex + 1) % notes.length;
            setTimeout(playNote, noteDuration * 1000);
        };

        playNote();
    },

    stopBgm() {
        this.isBgmPlaying = false;
    },

    resumeContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
};

window.AudioManager = AudioManager;
