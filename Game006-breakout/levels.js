const LevelManager = {
    currentLevel: 1,
    maxLevel: 30,
    unlockedLevel: 1,
    levelScores: {},

    BRICK_TYPES: {
        NORMAL: 1,
        HARD: 2,
        SUPER: 3,
        INDESTRUCTIBLE: 4
    },

    COLORS: {
        1: ['#ff0066', '#ff3388'],
        2: ['#cc00ff', '#ee44ff'],
        3: ['#0044ff', '#0088ff'],
        4: ['#00cccc', '#00ffff'],
        5: ['#00ff66', '#00ff99'],
        6: ['#ffcc00', '#ffee00'],
        7: ['#ff6600', '#ff8833'],
        HARD: ['#888888', '#aaaaaa'],
        SUPER: ['#ffcc00', '#ffee00'],
        INDESTRUCTIBLE: ['#333333', '#444444']
    },

    init() {
        this.loadProgress();
    },

    loadProgress() {
        const data = JSON.parse(localStorage.getItem('neonBreakout_progress') || '{}');
        this.unlockedLevel = data.unlockedLevel || 1;
        this.levelScores = data.levelScores || {};
    },

    saveProgress() {
        localStorage.setItem('neonBreakout_progress', JSON.stringify({
            unlockedLevel: this.unlockedLevel,
            levelScores: this.levelScores
        }));
    },

    resetProgress() {
        this.unlockedLevel = 1;
        this.levelScores = {};
        this.currentLevel = 1;
        this.saveProgress();
    },

    completeLevel(level, score) {
        if (!this.levelScores[level] || score > this.levelScores[level]) {
            this.levelScores[level] = score;
        }
        if (level >= this.unlockedLevel && level < this.maxLevel) {
            this.unlockedLevel = level + 1;
        }
        this.saveProgress();
    },

    isLevelUnlocked(level) {
        return level <= this.unlockedLevel;
    },

    getLevelConfig(level) {
        const configs = this.generateLevels();
        return configs[level] || configs[1];
    },

    generateLevels() {
        const levels = {};

        levels[1] = {
            rows: 5,
            cols: 10,
            brickLayout: this.createSimpleLayout(5, 10, 1),
            ballSpeed: 4,
            lives: 3,
            paddleWidth: 100
        };

        levels[2] = {
            rows: 5,
            cols: 11,
            brickLayout: this.createSimpleLayout(5, 11, 1),
            ballSpeed: 4.5,
            lives: 3,
            paddleWidth: 95
        };

        levels[3] = {
            rows: 6,
            cols: 11,
            brickLayout: this.createSimpleLayout(6, 11, 1),
            ballSpeed: 5,
            lives: 3,
            paddleWidth: 90
        };

        levels[4] = {
            rows: 6,
            cols: 12,
            brickLayout: this.createMixedLayout(6, 12, 0.2),
            ballSpeed: 5,
            lives: 3,
            paddleWidth: 90
        };

        levels[5] = {
            rows: 7,
            cols: 12,
            brickLayout: this.createSimpleLayout(7, 12, 1),
            ballSpeed: 5.5,
            lives: 3,
            paddleWidth: 85
        };

        levels[6] = {
            rows: 7,
            cols: 13,
            brickLayout: this.createMixedLayout(7, 13, 0.3),
            ballSpeed: 5.5,
            lives: 3,
            paddleWidth: 85
        };

        levels[7] = {
            rows: 7,
            cols: 14,
            brickLayout: this.createPyramidLayout(7, 14),
            ballSpeed: 6,
            lives: 3,
            paddleWidth: 80
        };

        levels[8] = {
            rows: 8,
            cols: 14,
            brickLayout: this.createMixedLayout(8, 14, 0.35),
            ballSpeed: 6,
            lives: 3,
            paddleWidth: 80
        };

        levels[9] = {
            rows: 8,
            cols: 15,
            brickLayout: this.createSimpleLayout(8, 15, 1),
            ballSpeed: 6.5,
            lives: 3,
            paddleWidth: 75
        };

        levels[10] = {
            rows: 8,
            cols: 15,
            brickLayout: this.createHardLayout(8, 15, 0.4),
            ballSpeed: 6.5,
            lives: 2,
            paddleWidth: 75
        };

        levels[11] = {
            rows: 9,
            cols: 15,
            brickLayout: this.createPyramidLayout(9, 15),
            ballSpeed: 7,
            lives: 2,
            paddleWidth: 72
        };

        levels[12] = {
            rows: 9,
            cols: 16,
            brickLayout: this.createMixedLayout(9, 16, 0.4),
            ballSpeed: 7,
            lives: 2,
            paddleWidth: 70
        };

        levels[13] = {
            rows: 9,
            cols: 16,
            brickLayout: this.createHardLayout(9, 16, 0.45),
            ballSpeed: 7.5,
            lives: 2,
            paddleWidth: 68
        };

        levels[14] = {
            rows: 10,
            cols: 16,
            brickLayout: this.createDiamondLayout(10, 16),
            ballSpeed: 7.5,
            lives: 2,
            paddleWidth: 65
        };

        levels[15] = {
            rows: 10,
            cols: 17,
            brickLayout: this.createMixedLayout(10, 17, 0.5),
            ballSpeed: 8,
            lives: 2,
            paddleWidth: 65
        };

        levels[16] = {
            rows: 10,
            cols: 17,
            brickLayout: this.createHardLayout(10, 17, 0.5),
            ballSpeed: 8,
            lives: 2,
            paddleWidth: 62
        };

        levels[17] = {
            rows: 11,
            cols: 17,
            brickLayout: this.createPyramidLayout(11, 17),
            ballSpeed: 8.5,
            lives: 2,
            paddleWidth: 60
        };

        levels[18] = {
            rows: 11,
            cols: 18,
            brickLayout: this.createMixedLayout(11, 18, 0.55),
            ballSpeed: 8.5,
            lives: 2,
            paddleWidth: 58
        };

        levels[19] = {
            rows: 11,
            cols: 18,
            brickLayout: this.createHardLayout(11, 18, 0.55),
            ballSpeed: 9,
            lives: 2,
            paddleWidth: 55
        };

        levels[20] = {
            rows: 11,
            cols: 18,
            brickLayout: this.createSuperLayout(11, 18, 0.2),
            ballSpeed: 9,
            lives: 2,
            paddleWidth: 55
        };

        levels[21] = {
            rows: 12,
            cols: 18,
            brickLayout: this.createMixedLayout(12, 18, 0.6),
            ballSpeed: 9.5,
            lives: 2,
            paddleWidth: 52
        };

        levels[22] = {
            rows: 12,
            cols: 19,
            brickLayout: this.createHardLayout(12, 19, 0.6),
            ballSpeed: 9.5,
            lives: 2,
            paddleWidth: 50
        };

        levels[23] = {
            rows: 12,
            cols: 19,
            brickLayout: this.createDiamondLayout(12, 19),
            ballSpeed: 10,
            lives: 2,
            paddleWidth: 48
        };

        levels[24] = {
            rows: 13,
            cols: 19,
            brickLayout: this.createSuperLayout(13, 19, 0.25),
            ballSpeed: 10,
            lives: 2,
            paddleWidth: 48
        };

        levels[25] = {
            rows: 13,
            cols: 20,
            brickLayout: this.createHardLayout(13, 20, 0.65),
            ballSpeed: 10.5,
            lives: 2,
            paddleWidth: 46
        };

        levels[26] = {
            rows: 13,
            cols: 20,
            brickLayout: this.createMixedLayout(13, 20, 0.65),
            ballSpeed: 10.5,
            lives: 2,
            paddleWidth: 45
        };

        levels[27] = {
            rows: 14,
            cols: 20,
            brickLayout: this.createSuperLayout(14, 20, 0.3),
            ballSpeed: 11,
            lives: 2,
            paddleWidth: 44
        };

        levels[28] = {
            rows: 14,
            cols: 21,
            brickLayout: this.createHardLayout(14, 21, 0.7),
            ballSpeed: 11,
            lives: 2,
            paddleWidth: 42
        };

        levels[29] = {
            rows: 14,
            cols: 21,
            brickLayout: this.createSuperLayout(14, 21, 0.35),
            ballSpeed: 11.5,
            lives: 2,
            paddleWidth: 40
        };

        levels[30] = {
            rows: 15,
            cols: 22,
            brickLayout: this.createFinalLayout(15, 22),
            ballSpeed: 12,
            lives: 2,
            paddleWidth: 38
        };

        return levels;
    },

    createSimpleLayout(rows, cols, type) {
        const layout = [];
        for (let r = 0; r < rows; r++) {
            const row = [];
            const colorIndex = (r % 7) + 1;
            for (let c = 0; c < cols; c++) {
                row.push({ type: type, color: colorIndex, hits: 1 });
            }
            layout.push(row);
        }
        return layout;
    },

    createMixedLayout(rows, cols, hardRatio) {
        const layout = [];
        for (let r = 0; r < rows; r++) {
            const row = [];
            const colorIndex = (r % 7) + 1;
            for (let c = 0; c < cols; c++) {
                if (Math.random() < hardRatio) {
                    row.push({ type: this.BRICK_TYPES.HARD, color: 'HARD', hits: 2 });
                } else {
                    row.push({ type: this.BRICK_TYPES.NORMAL, color: colorIndex, hits: 1 });
                }
            }
            layout.push(row);
        }
        return layout;
    },

    createHardLayout(rows, cols, hardRatio) {
        const layout = [];
        for (let r = 0; r < rows; r++) {
            const row = [];
            for (let c = 0; c < cols; c++) {
                const rand = Math.random();
                if (rand < hardRatio * 0.3) {
                    row.push({ type: this.BRICK_TYPES.SUPER, color: 'SUPER', hits: 3 });
                } else if (rand < hardRatio) {
                    row.push({ type: this.BRICK_TYPES.HARD, color: 'HARD', hits: 2 });
                } else {
                    const colorIndex = (r % 7) + 1;
                    row.push({ type: this.BRICK_TYPES.NORMAL, color: colorIndex, hits: 1 });
                }
            }
            layout.push(row);
        }
        return layout;
    },

    createSuperLayout(rows, cols, superRatio) {
        const layout = [];
        for (let r = 0; r < rows; r++) {
            const row = [];
            for (let c = 0; c < cols; c++) {
                const rand = Math.random();
                if (rand < superRatio) {
                    row.push({ type: this.BRICK_TYPES.SUPER, color: 'SUPER', hits: 3 });
                } else if (rand < superRatio + 0.3) {
                    row.push({ type: this.BRICK_TYPES.HARD, color: 'HARD', hits: 2 });
                } else {
                    const colorIndex = (r % 7) + 1;
                    row.push({ type: this.BRICK_TYPES.NORMAL, color: colorIndex, hits: 1 });
                }
            }
            layout.push(row);
        }
        return layout;
    },

    createPyramidLayout(rows, cols) {
        const layout = [];
        const center = Math.floor(cols / 2);
        for (let r = 0; r < rows; r++) {
            const row = [];
            const width = Math.floor((r + 1) * cols / rows);
            const start = Math.floor((cols - width) / 2);
            for (let c = 0; c < cols; c++) {
                if (c >= start && c < start + width) {
                    const distFromCenter = Math.abs(c - center);
                    if (distFromCenter < 2) {
                        row.push({ type: this.BRICK_TYPES.HARD, color: 'HARD', hits: 2 });
                    } else {
                        const colorIndex = (r % 7) + 1;
                        row.push({ type: this.BRICK_TYPES.NORMAL, color: colorIndex, hits: 1 });
                    }
                } else {
                    row.push(null);
                }
            }
            layout.push(row);
        }
        return layout;
    },

    createDiamondLayout(rows, cols) {
        const layout = [];
        const centerR = Math.floor(rows / 2);
        const centerC = Math.floor(cols / 2);
        
        for (let r = 0; r < rows; r++) {
            const row = [];
            for (let c = 0; c < cols; c++) {
                const distR = Math.abs(r - centerR);
                const distC = Math.abs(c - centerC);
                const dist = distR + distC;
                
                if (dist <= Math.min(centerR, centerC) + 1) {
                    if (dist <= 2) {
                        row.push({ type: this.BRICK_TYPES.SUPER, color: 'SUPER', hits: 3 });
                    } else if (dist <= 4) {
                        row.push({ type: this.BRICK_TYPES.HARD, color: 'HARD', hits: 2 });
                    } else {
                        const colorIndex = ((r + c) % 7) + 1;
                        row.push({ type: this.BRICK_TYPES.NORMAL, color: colorIndex, hits: 1 });
                    }
                } else {
                    row.push(null);
                }
            }
            layout.push(row);
        }
        return layout;
    },

    createFinalLayout(rows, cols) {
        const layout = [];
        for (let r = 0; r < rows; r++) {
            const row = [];
            for (let c = 0; c < cols; c++) {
                const rand = Math.random();
                if (r < 2) {
                    row.push({ type: this.BRICK_TYPES.SUPER, color: 'SUPER', hits: 3 });
                } else if (r < 4) {
                    if (rand < 0.5) {
                        row.push({ type: this.BRICK_TYPES.SUPER, color: 'SUPER', hits: 3 });
                    } else {
                        row.push({ type: this.BRICK_TYPES.HARD, color: 'HARD', hits: 2 });
                    }
                } else {
                    if (rand < 0.3) {
                        row.push({ type: this.BRICK_TYPES.SUPER, color: 'SUPER', hits: 3 });
                    } else if (rand < 0.6) {
                        row.push({ type: this.BRICK_TYPES.HARD, color: 'HARD', hits: 2 });
                    } else {
                        const colorIndex = (r % 7) + 1;
                        row.push({ type: this.BRICK_TYPES.NORMAL, color: colorIndex, hits: 1 });
                    }
                }
            }
            layout.push(row);
        }
        return layout;
    },

    getBrickColor(brick) {
        if (!brick) return null;
        return this.COLORS[brick.color] || this.COLORS[brick.type];
    }
};

window.LevelManager = LevelManager;
