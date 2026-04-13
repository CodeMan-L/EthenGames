const AudioManager = {
    audioContext: null,
    sfxEnabled: true,
    bgmEnabled: true,
    bgmOscillators: [],
    bgmGainNode: null,
    isBGMPlaying: false,
    bpm: 140,
    envGain: null,
    reverbNode: null,
    
    init() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.loadSettings();
        this.createMasterGain();
    },
    
    createMasterGain() {
        this.masterGain = this.audioContext.createGain();
        this.envGain = this.audioContext.createGain();
        
        // 创建混响效果
        this.reverbNode = this.audioContext.createConvolver();
        this.loadReverbImpulse();
        
        this.masterGain.connect(this.envGain);
        this.envGain.connect(this.reverbNode);
        this.reverbNode.connect(this.audioContext.destination);
        this.envGain.connect(this.audioContext.destination);
        
        this.masterGain.gain.value = 0.7;
        this.envGain.gain.value = 0.8;
    },
    
    loadReverbImpulse() {
        // 创建简单的混响脉冲
        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * 2;
        const buffer = this.audioContext.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < length; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
        }
        
        this.reverbNode.buffer = buffer;
    },
    
    loadSettings() {
        const settings = JSON.parse(localStorage.getItem('knifeSwingingSettings') || '{}');
        this.sfxEnabled = settings.sfxEnabled !== false;
        this.bgmEnabled = settings.bgmEnabled !== false;
    },
    
    saveSettings() {
        const settings = {
            sfxEnabled: this.sfxEnabled,
            bgmEnabled: this.bgmEnabled
        };
        localStorage.setItem('knifeSwingingSettings', JSON.stringify(settings));
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
    
    playTone(frequency, duration, type = 'sine', volume = 0.3, detune = 0) {
        if (!this.sfxEnabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        oscillator.detune.value = detune;
        
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(volume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
        
        oscillator.start(now);
        oscillator.stop(now + duration);
        
        return { oscillator, gainNode };
    },
    
    playCyberNoise(duration = 0.1, volume = 0.15) {
        if (!this.sfxEnabled || !this.audioContext) return;
        
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        source.buffer = buffer;
        filter.type = 'bandpass';
        filter.frequency.value = 1000 + Math.random() * 2000;
        filter.Q.value = 2;
        
        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(volume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        source.start(now);
    },
    
    playArpeggio(notes, interval = 80, volume = 0.2) {
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, 0.12, 'square', volume * 0.7, (Math.random() - 0.5) * 20);
                this.playTone(freq * 2, 0.08, 'sine', volume * 0.3);
            }, i * interval);
        });
    },
    
    playThrow() {
        if (!this.sfxEnabled) return;
        
        this.playTone(880, 0.04, 'sawtooth', 0.18, 8);
        setTimeout(() => {
            this.playTone(1320, 0.04, 'square', 0.14, -5);
            this.playCyberNoise(0.04, 0.08);
        }, 35);
        setTimeout(() => {
            this.playTone(1760, 0.05, 'sine', 0.1, 3);
        }, 70);
    },
    
    playHit() {
        if (!this.sfxEnabled) return;
        
        this.playTone(1568, 0.06, 'square', 0.16, 4);
        this.playTone(1175, 0.08, 'sawtooth', 0.13, -6);
        this.playCyberNoise(0.08, 0.12);
        
        setTimeout(() => {
            this.playTone(2093, 0.07, 'sine', 0.14, 10);
            this.playTone(2637, 0.05, 'sine', 0.09, -8);
        }, 50);
        
        setTimeout(() => {
            this.playArpeggiator([523, 659, 784], 60, 0.12);
        }, 100);
    },
    
    playMiss() {
        if (!this.sfxEnabled) return;
        
        this.playTone(294, 0.15, 'sawtooth', 0.22, -10);
        this.playCyberNoise(0.15, 0.15);
        
        setTimeout(() => {
            this.playTone(220, 0.18, 'square', 0.19, -15);
            this.playTone(165, 0.2, 'sawtooth', 0.16, -20);
        }, 120);
        
        setTimeout(() => {
            this.playTone(147, 0.25, 'sine', 0.13, -25);
        }, 280);
    },
    
    playFail() {
        if (!this.sfxEnabled) return;
        
        const failSequence = [
            { freq: 392, time: 0, dur: 0.15, vol: 0.25, type: 'sawtooth' },
            { freq: 330, time: 150, dur: 0.17, vol: 0.23, type: 'square' },
            { freq: 262, time: 320, dur: 0.2, vol: 0.21, type: 'sawtooth' },
            { freq: 196, time: 520, dur: 0.25, vol: 0.19, type: 'sine' },
            { freq: 131, time: 770, dur: 0.35, vol: 0.16, type: 'sawtooth' }
        ];
        
        failSequence.forEach(note => {
            setTimeout(() => {
                this.playTone(note.freq, note.dur, note.type, note.vol, note.freq < 200 ? -30 : -10);
                this.playCyberNoise(note.dur * 0.6, note.vol * 0.4);
            }, note.time);
        });
    },
    
    playSpecial() {
        if (!this.sfxEnabled) return;
        
        const specialSequence = [
            { freq: 1047, time: 0, dur: 0.15, vol: 0.3, type: 'sine' },
            { freq: 1319, time: 50, dur: 0.12, vol: 0.25, type: 'sine' },
            { freq: 1568, time: 100, dur: 0.1, vol: 0.2, type: 'sine' }
        ];
        
        specialSequence.forEach(note => {
            setTimeout(() => {
                this.playTone(note.freq, note.dur, note.type, note.vol, 0);
            }, note.time);
        });
        
        // 添加特殊音效
        setTimeout(() => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = 'sawtooth';
            oscillator.frequency.value = 440;
            
            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            const now = this.audioContext.currentTime;
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            
            oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.3);
            
            oscillator.start(now);
            oscillator.stop(now + 0.3);
        }, 0);
    },
    
    playVictory() {
        if (!this.sfxEnabled) return;
        
        const victoryNotes = [
            [523, 659, 784, 1047, 1319, 1568],
            [784, 988, 1175, 1568, 1976]
        ];
        
        const mainMelody = victoryNotes[0];
        mainMelody.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, 0.18, 'sine', 0.22, (Math.random() - 0.5) * 10);
                this.playTone(freq * 1.5, 0.12, 'triangle', 0.11, 5);
                
                if (i === mainMelody.length - 1) {
                    setTimeout(() => {
                        this.playArpeggiator([1047, 1319, 1568, 2093], 70, 0.16);
                    }, 200);
                }
            }, i * 130);
        });
        
        setTimeout(() => {
            this.playCyberNoise(0.3, 0.08);
        }, 100);
    },
    
    playClick() {
        if (!this.sfxEnabled) return;
        
        this.playTone(1200, 0.03, 'sine', 0.12, 5);
        setTimeout(() => {
            this.playTone(1800, 0.03, 'sine', 0.09, -3);
        }, 25);
    },
    
    playChest() {
        if (!this.sfxEnabled) return;
        
        const chestNotes = [523, 659, 784, 880, 1047, 1319, 1568];
        chestNotes.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, 0.15, 'sine', 0.18, (Math.random() - 0.5) * 8);
                this.playTone(freq * 2, 0.1, 'triangle', 0.1, 3);
                
                if (i % 2 === 0) {
                    this.playCyberNoise(0.05, 0.06);
                }
            }, i * 90);
        });
        
        setTimeout(() => {
            for (let j = 0; j < 5; j++) {
                setTimeout(() => {
                    this.playTone(2000 + Math.random() * 2000, 0.08, 'sine', 0.08);
                }, j * 50);
            }
        }, chestNotes.length * 90);
    },
    
    playSwing() {
        if (!this.sfxEnabled) return;
        
        this.playTone(500, 0.08, 'sine', 0.12, 0);
        this.playCyberNoise(0.06, 0.06);
    },
    
    playArpeggiator(notes, interval = 100, volume = 0.15) {
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, 0.1, 'square', volume * 0.6, (Math.random() - 0.5) * 15);
                this.playTone(freq * 0.5, 0.08, 'triangle', volume * 0.4);
            }, i * interval);
        });
    },
    
    startBGM() {
        if (!this.bgmEnabled || !this.audioContext || this.isBGMPlaying) return;
        
        this.isBGMPlaying = true;
        this.playCyberBGM();
        this.playAmbientHum();
        this.playCyberWind();
    },
    
    playCyberBGM() {
        if (!this.bgmEnabled || !this.isBGMPlaying) return;
        
        const beatDuration = 60 / this.bpm;
        const barDuration = beatDuration * 4;
        
        const bassLine = [65, 65, 82, 82, 73, 73, 82, 87];
        const padChords = [
            [262, 330, 392],
            [220, 277, 330],
            [247, 311, 370],
            [196, 247, 294]
        ];
        const arpeggioPattern = [523, 659, 784, 659, 523, 659, 784, 984];
        
        let beatIndex = 0;
        let barIndex = 0;
        
        const playBeat = () => {
            if (!this.bgmEnabled || !this.isBGMPlaying) return;
            
            const currentBar = barIndex % padChords.length;
            
            if (beatIndex % 2 === 0) {
                const bassFreq = bassLine[beatIndex % bassLine.length];
                this.playTone(bassFreq, beatDuration * 0.8, 'sawtooth', 0.06, -8);
                this.playTone(bassFreq * 0.5, beatDuration * 0.6, 'sine', 0.04);
            }
            
            if (beatIndex % 4 === 0) {
                const chord = padChords[currentBar];
                chord.forEach((freq, i) => {
                    this.playTone(freq, barDuration * 0.9, 'sine', 0.025, (i - 1) * 5);
                });
            }
            
            const arpFreq = arpeggioPattern[beatIndex % arpeggioPattern.length];
            this.playTone(arpFreq, beatDuration * 0.4, 'square', 0.035, (Math.random() - 0.5) * 12);
            
            if (beatIndex % 4 === 2) {
                this.playCyberNoise(0.03, 0.015);
            }
            
            beatIndex++;
            if (beatIndex >= 16) {
                beatIndex = 0;
                barIndex++;
            }
            
            setTimeout(playBeat, beatDuration * 1000);
        };
        
        playBeat();
    },
    
    stopBGM() {
        this.isBGMPlaying = false;
        this.bgmOscillators.forEach(osc => {
            try {
                osc.stop();
            } catch (e) {}
        });
        this.bgmOscillators = [];
    },
    
    resumeContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    },
    
    playAmbientHum() {
        if (!this.bgmEnabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        oscillator.type = 'triangle';
        oscillator.frequency.value = 65;
        
        filter.type = 'lowpass';
        filter.frequency.value = 150;
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.02, now + 2);
        
        oscillator.start(now);
        
        // 缓慢调制频率
        setInterval(() => {
            if (this.bgmEnabled) {
                oscillator.frequency.value = 65 + Math.sin(Date.now() / 5000) * 5;
            }
        }, 100);
        
        this.bgmOscillators.push(oscillator);
    },
    
    playCyberWind() {
        if (!this.bgmEnabled || !this.audioContext) return;
        
        const bufferSize = this.audioContext.sampleRate * 0.5;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.3 * Math.sin(i * 0.01);
        }
        
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        source.buffer = buffer;
        source.loop = true;
        
        filter.type = 'bandpass';
        filter.frequency.value = 800 + Math.sin(Date.now() / 2000) * 300;
        
        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.015, now + 3);
        
        source.start(now);
        
        // 调制滤波器
        setInterval(() => {
            if (this.bgmEnabled) {
                filter.frequency.value = 800 + Math.sin(Date.now() / 2000) * 300;
            }
        }, 50);
        
        this.bgmOscillators.push(source);
    },
    
    playLevelStart() {
        if (!this.sfxEnabled) return;
        
        this.playTone(880, 0.1, 'sine', 0.15, 0);
        setTimeout(() => {
            this.playTone(1320, 0.12, 'sine', 0.12, 5);
            this.playTone(1760, 0.15, 'sine', 0.09, -5);
        }, 80);
        setTimeout(() => {
            this.playArpeggiator([262, 330, 392, 523], 60, 0.1);
        }, 200);
    },
    
    playLevelComplete() {
        if (!this.sfxEnabled) return;
        
        const completionNotes = [523, 659, 784, 1047, 1319];
        completionNotes.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, 0.2, 'sine', 0.2, (Math.random() - 0.5) * 10);
                if (i === completionNotes.length - 1) {
                    this.playCyberNoise(0.4, 0.1);
                }
            }, i * 120);
        });
    }
};

window.AudioManager = AudioManager;