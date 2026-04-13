const LevelSystem = {
    levels: [],
    maxLevels: 30,
    
    init() {
        this.generateLevels();
    },
    
    generateLevels() {
        const targets = [
            256, 256, 512, 512, 512,
            1024, 1024, 1024, 1024, 1024,
            2048, 2048, 2048, 2048, 2048,
            4096, 4096, 4096, 4096, 4096,
            8192, 8192, 8192, 8192, 8192,
            8192, 8192, 8192, 8192, 8192
        ];
        
        const emptyCells = [
            6, 5, 5, 4, 4,
            4, 3, 3, 3, 2,
            2, 2, 2, 2, 2,
            2, 2, 2, 2, 2,
            2, 2, 2, 2, 2,
            2, 2, 2, 2, 2
        ];
        
        const startValues = [
            [2, 4], [2, 4], [2, 4, 8], [2, 4, 8], [4, 8],
            [4, 8], [4, 8, 16], [4, 8, 16], [8, 16], [8, 16],
            [8, 16, 32], [8, 16, 32], [16, 32], [16, 32], [16, 32, 64],
            [16, 32, 64], [32, 64], [32, 64], [32, 64, 128], [32, 64, 128],
            [64, 128], [64, 128], [64, 128, 256], [64, 128, 256], [128, 256],
            [128, 256], [128, 256, 512], [128, 256, 512], [256, 512], [256, 512]
        ];
        
        for (let i = 0; i < this.maxLevels; i++) {
            this.levels.push({
                id: i + 1,
                target: targets[i],
                emptyCells: emptyCells[i],
                startValues: startValues[i],
                gridSize: i < 20 ? 4 : 5,
                moves: Math.max(50 - Math.floor(i / 3), 20)
            });
        }
    },
    
    getLevel(levelId) {
        return this.levels[levelId - 1] || null;
    },
    
    getProgress() {
        const saved = localStorage.getItem('mhszhb_progress');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            currentLevel: 1,
            completedLevels: [],
            highScores: {}
        };
    },
    
    saveProgress(progress) {
        localStorage.setItem('mhszhb_progress', JSON.stringify(progress));
    },
    
    completeLevel(levelId, score) {
        const progress = this.getProgress();
        
        if (!progress.completedLevels.includes(levelId)) {
            progress.completedLevels.push(levelId);
        }
        
        if (levelId >= progress.currentLevel && levelId < this.maxLevels) {
            progress.currentLevel = levelId + 1;
        }
        
        if (!progress.highScores[levelId] || score > progress.highScores[levelId]) {
            progress.highScores[levelId] = score;
        }
        
        this.saveProgress(progress);
        return progress;
    },
    
    isLevelUnlocked(levelId) {
        const progress = this.getProgress();
        return levelId <= progress.currentLevel;
    },
    
    isLevelCompleted(levelId) {
        const progress = this.getProgress();
        return progress.completedLevels.includes(levelId);
    },
    
    resetProgress() {
        localStorage.removeItem('mhszhb_progress');
        localStorage.removeItem('mhszhb_highscore');
    },
    
    getHighScore() {
        return parseInt(localStorage.getItem('mhszhb_highscore')) || 0;
    },
    
    setHighScore(score) {
        const current = this.getHighScore();
        if (score > current) {
            localStorage.setItem('mhszhb_highscore', score.toString());
            return true;
        }
        return false;
    }
};

window.LevelSystem = LevelSystem;
