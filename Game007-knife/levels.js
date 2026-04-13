const LevelManager = {
    currentLevel: 1,
    maxUnlockedLevel: 1,
    completedLevels: [],
    
    init() {
        this.loadProgress();
    },
    
    generateLevels() {
        const levels = [];
        
        for (let i = 1; i <= 30; i++) {
            const level = {
                id: i,
                rotationSpeed: this.calculateRotationSpeed(i),
                knifeCount: this.calculateKnifeCount(i),
                targetKnives: this.calculateTargetKnives(i),
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
        const baseSpeed = 0.02;
        const speedIncrement = 0.003;
        const maxSpeed = 0.08;
        
        let speed = baseSpeed + (level - 1) * speedIncrement;
        
        if (level % 5 === 0) {
            speed *= 1.3;
        }
        
        return Math.min(speed, maxSpeed);
    },
    
    calculateKnifeCount(level) {
        const baseCount = 5;
        const increment = Math.floor(level / 3);
        const maxCount = 15;
        
        return Math.min(baseCount + increment, maxCount);
    },
    
    calculateTargetKnives(level) {
        const baseTarget = 3;
        const increment = Math.floor(level / 2);
        const maxTarget = 12;
        
        return Math.min(baseTarget + increment, maxTarget);
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
    
    loadProgress() {
        const progress = JSON.parse(localStorage.getItem('knifeGameProgress') || '{}');
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
        localStorage.setItem('knifeGameProgress', JSON.stringify(progress));
    },
    
    resetProgress() {
        this.currentLevel = 1;
        this.maxUnlockedLevel = 1;
        this.completedLevels = [];
        localStorage.removeItem('knifeGameProgress');
    },
    
    getMaxLevel() {
        return this.maxUnlockedLevel;
    },
    
    getHighScore() {
        return parseInt(localStorage.getItem('knifeGameHighScore') || '0');
    },
    
    setHighScore(score) {
        const currentHigh = this.getHighScore();
        if (score > currentHigh) {
            localStorage.setItem('knifeGameHighScore', score.toString());
            return true;
        }
        return false;
    }
};

window.LevelManager = LevelManager;
