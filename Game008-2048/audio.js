const AudioManager = {
    audioContext: null,
    sfxEnabled: true,
    bgmEnabled: true,
    bgmOscillators: [],
    bgmGain: null,
    bgmPlaying: false,
    
    init() {
        this.loadSettings();
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    },
    
    loadSettings() {
        const sfx = localStorage.getItem('mhszhb_sfx');
        const bgm = localStorage.getItem('mhszhb_bgm');
        this.sfxEnabled = sfx !== 'false';
        this.bgmEnabled = bgm !== 'false';
    },
    
    saveSettings() {
        localStorage.setItem('mhszhb_sfx', this.sfxEnabled.toString());
        localStorage.setItem('mhszhb_bgm', this.bgmEnabled.toString());
    },
    
    toggleSfx() {
        this.sfxEnabled = !this.sfxEnabled;
        this.saveSettings();
        return this.sfxEnabled;
    },
    
    toggleBgm() {
        this.bgmEnabled = !this.bgmEnabled;
        this.saveSettings();
        if (this.bgmEnabled) {
            this.playBgm();
        } else {
            this.stopBgm();
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
    
    playClick() {
        this.playTone(800, 0.1, 'sine', 0.2);
    },
    
    playSlide() {
        this.playTone(400, 0.08, 'sine', 0.15);
    },
    
    playMerge(value) {
        const baseFreq = 300;
        const multiplier = Math.log2(value);
        const freq = baseFreq + multiplier * 50;
        this.playTone(freq, 0.15, 'sine', 0.25);
        setTimeout(() => {
            this.playTone(freq * 1.5, 0.1, 'sine', 0.2);
        }, 50);
    },
    
    playLevelUp() {
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, 0.2, 'sine', 0.3);
            }, i * 100);
        });
    },
    
    playVictory() {
        const melody = [523, 659, 784, 659, 784, 1047];
        melody.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, 0.3, 'sine', 0.35);
            }, i * 150);
        });
    },
    
    playGameOver() {
        const notes = [392, 349, 330, 262];
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, 0.4, 'sine', 0.3);
            }, i * 200);
        });
    },
    
    playReward() {
        const notes = [784, 988, 1175, 1319];
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, 0.15, 'sine', 0.25);
            }, i * 80);
        });
    },
    
    playBgm() {
        if (!this.bgmEnabled || !this.audioContext || this.bgmPlaying) return;
        
        this.stopBgm();
        this.bgmPlaying = true;
        
        this.bgmGain = this.audioContext.createGain();
        this.bgmGain.gain.value = 0.08;
        this.bgmGain.connect(this.audioContext.destination);
        
        const playNote = (freq, startTime, duration) => {
            const osc = this.audioContext.createOscillator();
            const noteGain = this.audioContext.createGain();
            
            osc.connect(noteGain);
            noteGain.connect(this.bgmGain);
            
            osc.frequency.value = freq;
            osc.type = 'sine';
            
            noteGain.gain.setValueAtTime(0.3, startTime);
            noteGain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
            
            osc.start(startTime);
            osc.stop(startTime + duration);
            
            this.bgmOscillators.push(osc);
        };
        
        const playBgmLoop = () => {
            if (!this.bgmPlaying || !this.bgmEnabled) return;
            
            const now = this.audioContext.currentTime;
            const bpm = 120;
            const beatDuration = 60 / bpm;
            
            const melody = [
                262, 294, 330, 349, 392, 349, 330, 294,
                262, 330, 392, 523, 392, 330, 262, 196
            ];
            
            melody.forEach((note, i) => {
                playNote(note, now + i * beatDuration * 0.5, beatDuration * 0.4);
            });
            
            setTimeout(playBgmLoop, melody.length * beatDuration * 0.5 * 1000);
        };
        
        playBgmLoop();
    },
    
    stopBgm() {
        this.bgmPlaying = false;
        this.bgmOscillators.forEach(osc => {
            try {
                osc.stop();
            } catch (e) {}
        });
        this.bgmOscillators = [];
        
        if (this.bgmGain) {
            this.bgmGain.disconnect();
            this.bgmGain = null;
        }
    },
    
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
};

window.AudioManager = AudioManager;
