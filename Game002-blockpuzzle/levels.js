const LevelManager = {
    levels: [],
    maxLevel: 30,

    init() {
        this.generateLevels();
    },

    generateLevels() {
        for (let i = 1; i <= this.maxLevel; i++) {
            const level = this.createLevel(i);
            this.levels.push(level);
        }
    },

    createLevel(levelNum) {
        const baseTime = 60;
        const baseTarget = 500;
        const baseColors = 4;

        let time = Math.max(30, baseTime - Math.floor(levelNum / 5) * 5);
        let target = baseTarget + (levelNum - 1) * 150;
        let colors = Math.min(6, baseColors + Math.floor((levelNum - 1) / 6));
        let gridSize = 12;

        if (levelNum >= 25) {
            target += 200;
        }

        const stars = this.calculateStarThresholds(target);

        return {
            level: levelNum,
            time: time,
            target: target,
            colors: colors,
            gridSize: gridSize,
            stars: stars
        };
    },

    calculateStarThresholds(baseTarget) {
        return {
            one: baseTarget,
            two: Math.floor(baseTarget * 1.5),
            three: Math.floor(baseTarget * 2)
        };
    },

    getLevel(levelNum) {
        if (levelNum < 1 || levelNum > this.maxLevel) {
            return this.levels[0];
        }
        return this.levels[levelNum - 1];
    },

    getProgress() {
        const progress = localStorage.getItem('neonBlock_progress');
        return progress ? JSON.parse(progress) : {
            currentLevel: 1,
            completedLevels: [],
            highScores: {},
            stars: {}
        };
    },

    saveProgress(progress) {
        localStorage.setItem('neonBlock_progress', JSON.stringify(progress));
    },

    completeLevel(levelNum, score) {
        const progress = this.getProgress();
        const level = this.getLevel(levelNum);

        if (!progress.completedLevels.includes(levelNum)) {
            progress.completedLevels.push(levelNum);
        }

        if (!progress.highScores[levelNum] || score > progress.highScores[levelNum]) {
            progress.highScores[levelNum] = score;
        }

        const stars = this.getStarsForScore(levelNum, score);
        if (!progress.stars[levelNum] || stars > progress.stars[levelNum]) {
            progress.stars[levelNum] = stars;
        }

        if (levelNum >= progress.currentLevel && levelNum < this.maxLevel) {
            progress.currentLevel = levelNum + 1;
        }

        this.saveProgress(progress);
        return stars;
    },

    getStarsForScore(levelNum, score) {
        const level = this.getLevel(levelNum);
        if (score >= level.stars.three) return 3;
        if (score >= level.stars.two) return 2;
        if (score >= level.stars.one) return 1;
        return 0;
    },

    isLevelUnlocked(levelNum) {
        if (levelNum === 1) return true;
        const progress = this.getProgress();
        return progress.completedLevels.includes(levelNum - 1);
    },

    getHighScore() {
        const progress = this.getProgress();
        let total = 0;
        for (const key in progress.highScores) {
            total += progress.highScores[key];
        }
        return total;
    },

    resetProgress() {
        localStorage.removeItem('neonBlock_progress');
        return {
            currentLevel: 1,
            completedLevels: [],
            highScores: {},
            stars: {}
        };
    }
};

window.LevelManager = LevelManager;
