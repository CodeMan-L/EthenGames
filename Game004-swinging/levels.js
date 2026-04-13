const LevelManager = {
    currentLevel: 1,
    maxUnlockedLevel: 1,
    completedLevels: [],
    assistLineActive: false,
    
    init() {
        this.loadProgress();
    },
    
    generateLevels() {
        const levels = [];
        
        for (let i = 1; i <= 30; i++) {
            const level = {
                id: i,
                rotationSpeed: this.calculateRotationSpeed(i),
                targetSize: this.calculateTargetSize(i),
                knifeCount: this.calculateKnifeCount(i),
                targetKnives: this.calculateTargetKnives(i),
                showAssistLine: i === 1,
                bossLevel: i % 5 === 0,
                rewards: {
                    score: i * 100,
                    bonusPerKnife: 50
                }
            };
            levels.push(level);
        }
        
        return levels;
    },
    
    calculateRotationSpeed(level) {
        const baseSpeed = 0.015;
        const speedIncrement = 0.002;
        const maxSpeed = 0.05;
        
        let speed = baseSpeed + (level - 1) * speedIncrement;
        
        if (level % 5 === 0) {
            speed *= 1.2;
        }
        
        return Math.min(speed, maxSpeed);
    },
    
    calculateTargetSize(level) {
        const baseSize = 0.16;
        const sizeDecrement = 0.0012;
        const minSize = 0.11;
        
        let size = baseSize - (level - 1) * sizeDecrement;
        
        if (level % 5 === 0) {
            size *= 0.95;
        }
        
        return Math.max(size, minSize);
    },
    
    calculateKnifeCount(level) {
        const baseCount = 6;
        const increment = Math.floor(level / 3);
        const maxCount = 12;
        
        let count = baseCount + increment;
        
        if (level % 5 === 0) {
            count += 2;
        }
        
        return Math.min(count, maxCount);
    },
    
    calculateTargetKnives(level) {
        const baseTarget = 4;
        const increment = Math.floor(level / 2);
        const maxTarget = 10;
        
        let target = baseTarget + increment;
        
        if (level % 5 === 0) {
            target += 1;
        }
        
        return Math.min(target, maxTarget);
    },
    
    getLevel(levelId) {
        const levels = this.generateLevels();
        return levels.find(l => l.id === levelId) || levels[0];
    },
    
    getCurrentLevel() {
        return this.getLevel(this.currentLevel);
    },
    
    nextLevel() {
        if (this.currentLevel < 30) {
            this.currentLevel++;
            this.maxUnlockedLevel = Math.max(this.maxUnlockedLevel, this.currentLevel);
            this.saveProgress();
        }
    },
    
    setLevel(levelId) {
        if (levelId >= 1 && levelId <= 30 && levelId <= this.maxUnlockedLevel) {
            this.currentLevel = levelId;
            this.saveProgress();
            return true;
        }
        return false;
    },
    
    completeLevel(levelId, score) {
        if (!this.completedLevels.includes(levelId)) {
            this.completedLevels.push(levelId);
        }
        
        if (levelId < 30) {
            this.maxUnlockedLevel = Math.max(this.maxUnlockedLevel, levelId + 1);
        }
        
        this.saveProgress();
    },
    
    isLevelUnlocked(levelId) {
        return levelId <= this.maxUnlockedLevel;
    },
    
    isLevelCompleted(levelId) {
        return this.completedLevels.includes(levelId);
    },
    
    shouldShowAssistLine() {
        const level = this.getCurrentLevel();
        return level.id === 1 || this.assistLineActive;
    },
    
    activateAssistLine() {
        this.assistLineActive = true;
    },
    
    deactivateAssistLine() {
        this.assistLineActive = false;
    },
    
    loadProgress() {
        const progress = JSON.parse(localStorage.getItem('knifeRotationProgress') || '{}');
        this.currentLevel = progress.currentLevel || 1;
        this.maxUnlockedLevel = progress.maxUnlockedLevel || 1;
        this.completedLevels = progress.completedLevels || [];
    },
    
    saveProgress() {
        const progress = {
            currentLevel: this.currentLevel,
            maxUnlockedLevel: this.maxUnlockedLevel,
            completedLevels: this.completedLevels
        };
        localStorage.setItem('knifeRotationProgress', JSON.stringify(progress));
    },
    
    resetProgress() {
        this.currentLevel = 1;
        this.maxUnlockedLevel = 1;
        this.completedLevels = [];
        this.assistLineActive = false;
        localStorage.removeItem('knifeRotationProgress');
    },
    
    getMaxLevel() {
        return this.maxUnlockedLevel;
    },
    
    getHighScore() {
        return parseInt(localStorage.getItem('knifeRotationHighScore') || '0');
    },
    
    setHighScore(score) {
        const currentHigh = this.getHighScore();
        if (score > currentHigh) {
            localStorage.setItem('knifeRotationHighScore', score.toString());
            return true;
        }
        return false;
    }
};

window.LevelManager = LevelManager;
