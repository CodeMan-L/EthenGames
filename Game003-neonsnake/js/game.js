const Game = {
    level: 1,
    score: 0,
    state: 'idle',
    levelConfig: null,
    snake: null,
    aiSnake: null,
    foodManager: null,
    barriers: [],
    pendingSpawns: [],
    lastBarrierSpawn: 0,
    invincible: false,
    invincibleTimer: 0,
    isAdWatching: false,
    _loopId: null,
    _lastTime: 0,
    _moveAccum: 0,
    _aiMoveAccum: 0,
    _respawnInterval: null,
    particles: [],

    start(level) {
        this.level = level;
        this.score = 0;
        this.state = 'playing';
        this.levelConfig = CONFIG.LEVELS[level];
        this.invincible = false;
        this.invincibleTimer = 0;
        this.isAdWatching = false;
        this._moveAccum = 0;
        this._aiMoveAccum = 0;
        this.barriers = [];
        this.pendingSpawns = [];
        this.particles = [];
        this.lastBarrierSpawn = Date.now();

        this._initSnake();
        this._initAI();
        this._initFood();

        Renderer.cols = this.levelConfig.gridCols;
        Renderer.rows = this.levelConfig.gridRows;
        Renderer.resize();

        this._spawnInitialFood();
        this._updateHUD();

        if (this._loopId) cancelAnimationFrame(this._loopId);
        this._lastTime = performance.now();
        this._loopId = requestAnimationFrame(t => this._loop(t));

        AudioManager.startBgm();
    },

    _initSnake() {
        this.snake = Object.create(Snake);
        const cx = Math.floor(this.levelConfig.gridCols / 2);
        const cy = Math.floor(this.levelConfig.gridRows / 2);
        this.snake.init(cx, cy, 1);
    },

    _initAI() {
        if (!this.levelConfig.hasAI) { this.aiSnake = null; return; }
        this.aiSnake = {
            body: [],
            direction: {x: 1, y: 0},
            nextDirection: {x: 1, y: 0},
            maxLength: this.levelConfig.aiMaxLength,
            alive: true,
            respawnTimer: 0,
            _moveAccum: 0,
        };
        const sx = this.levelConfig.gridCols - 4;
        const sy = this.levelConfig.gridRows - 2;
        for (let i = 0; i < (this.levelConfig.aiInitLength || 3); i++) {
            this.aiSnake.body.push({x: sx - i, y: sy});
        }
    },

    _initFood() {
        this.foodManager = Object.create(FoodManager);
        this.foodManager.init(this.levelConfig.foodLifetime, this.levelConfig.maxFood);
    },

    _spawnInitialFood() {
        const occupied = this._getOccupiedSet();
        this.foodManager.spawn(this.levelConfig.gridCols, this.levelConfig.gridRows, occupied);
    },

    _getOccupiedSet() {
        const set = new Set();
        if (this.snake) this.snake.body.forEach(s => set.add(`${s.x},${s.y}`));
        if (this.aiSnake && this.aiSnake.alive) this.aiSnake.body.forEach(s => set.add(`${s.x},${s.y}`));
        if (this.foodManager) this.foodManager.foods.forEach(f => set.add(`${f.x},${f.y}`));
        this.levelConfig.obstacles.forEach(o => set.add(`${o.x},${o.y}`));
        this.barriers.forEach(b => set.add(`${b.x},${b.y}`));
        this.pendingSpawns.forEach(p => set.add(`${p.x},${p.y}`));
        return set;
    },

    _loop(now) {
        if (this.state !== 'playing') return;
        const dt = Math.min(now - this._lastTime, 200);
        this._lastTime = now;
        this._update(dt);
        this._render();
        this._loopId = requestAnimationFrame(t => this._loop(t));
    },

    _update(dt) {
        if (this.state !== 'playing') return;

        this._moveAccum += dt;
        if (this._moveAccum >= this.levelConfig.speed) {
            this._moveAccum -= this.levelConfig.speed;
            if (this._moveAccum > this.levelConfig.speed) this._moveAccum = 0;
            this._updateSnake();
        }

        if (this.aiSnake) {
            this._aiMoveAccum += dt;
            const aiSpeed = this.levelConfig.aiSpeed || this.levelConfig.speed + 20;
            if (this._aiMoveAccum >= aiSpeed) {
                this._aiMoveAccum -= aiSpeed;
                if (this._aiMoveAccum > aiSpeed) this._aiMoveAccum = 0;
                this._updateAI();
            }
        }

        this.foodManager.update();
        this._trySpawnFood();
        this._updateBarriers();
        this._updateInvincible(dt);
        this._updateParticles(dt);
        this._checkWin();
    },

    _updateSnake() {
        const result = this.snake.update(this.levelConfig.gridCols, this.levelConfig.gridRows);

        if (result === 'self' && !this.invincible) {
            this._onDeath();
            return;
        }

        const allObs = [...this.levelConfig.obstacles, ...this.barriers];
        if (this.snake.checkObstacleCollision(allObs) && !this.invincible) {
            this._onDeath();
            return;
        }

        if (this.aiSnake && this.aiSnake.alive) {
            const playerHead = this.snake.getHead();
            for (const seg of this.aiSnake.body) {
                if (seg.x === playerHead.x && seg.y === playerHead.y) {
                    if (!this.invincible) {
                        this._onDeath();
                        return;
                    }
                    break;
                }
            }
        }

        const fi = this.snake.checkFoodCollision(this.foodManager.foods);
        if (fi >= 0) {
            const food = this.foodManager.foods[fi];
            this.score += CONFIG.GAME.FOOD_SCORE;
            this.snake.grow();
            this._spawnParticles(food.x, food.y, CONFIG.COLORS.FOOD, 12);
            this.foodManager.remove(fi);
            AudioManager.playEat();
            this._updateHUD();
        }
    },

    _updateAI() {
        if (!this.aiSnake) return;

        if (!this.aiSnake.alive) {
            this.aiSnake.respawnTimer += this.levelConfig.aiSpeed || 160;
            if (this.aiSnake.respawnTimer >= 15000) {
                this._respawnAI();
            }
            return;
        }

        this._aiDecideDirection();

        const head = this.aiSnake.body[0];
        const newHead = {
            x: head.x + this.aiSnake.direction.x,
            y: head.y + this.aiSnake.direction.y,
        };

        const cols = this.levelConfig.gridCols;
        const rows = this.levelConfig.gridRows;

        if (newHead.x < 0) newHead.x = cols - 1;
        else if (newHead.x >= cols) newHead.x = 0;
        if (newHead.y < 0) newHead.y = rows - 1;
        else if (newHead.y >= rows) newHead.y = 0;

        for (const seg of this.aiSnake.body) {
            if (seg.x === newHead.x && seg.y === newHead.y) {
                this.aiSnake.alive = false;
                this.aiSnake.respawnTimer = 0;
                return;
            }
        }

        this.aiSnake.body.unshift(newHead);
        if (this.aiSnake.body.length > this.aiSnake.maxLength) {
            this.aiSnake.body.pop();
        }

        const fi = this.foodManager.foods.findIndex(f => f.x === newHead.x && f.y === newHead.y);
        if (fi >= 0) {
            this.foodManager.remove(fi);
            this.aiSnake.maxLength++;
        }
    },

    _aiDecideDirection() {
        const head = this.aiSnake.body[0];
        const moves = [{x: 0, y: -1}, {x: 0, y: 1}, {x: -1, y: 0}, {x: 1, y: 0}];
        const cols = this.levelConfig.gridCols;
        const rows = this.levelConfig.gridRows;

        const valid = moves.filter(m => {
            let nx = head.x + m.x;
            let ny = head.y + m.y;
            if (nx < 0) nx = cols - 1;
            else if (nx >= cols) nx = 0;
            if (ny < 0) ny = rows - 1;
            else if (ny >= rows) ny = 0;
            if (this.aiSnake.body.some(s => s.x === nx && s.y === ny)) return false;
            if (this.snake.body.some(s => s.x === nx && s.y === ny)) return false;
            if (this.levelConfig.obstacles.some(o => o.x === nx && o.y === ny)) return false;
            if (this.barriers.some(b => b.x === nx && b.y === ny)) return false;
            return true;
        });

        if (valid.length === 0) return;

        let target = null;
        let minDist = Infinity;
        for (const f of this.foodManager.foods) {
            const d = Math.abs(f.x - head.x) + Math.abs(f.y - head.y);
            if (d < minDist) { minDist = d; target = f; }
        }

        if (target) {
            valid.sort((a, b) => {
                const da = Math.abs(head.x + a.x - target.x) + Math.abs(head.y + a.y - target.y);
                const db = Math.abs(head.x + b.x - target.x) + Math.abs(head.y + b.y - target.y);
                return da - db;
            });
        }

        this.aiSnake.direction = valid[0];
    },

    _respawnAI() {
        const occupied = this._getOccupiedSet();
        const empty = [];
        for (let x = 0; x < this.levelConfig.gridCols; x++) {
            for (let y = 0; y < this.levelConfig.gridRows; y++) {
                if (!occupied.has(`${x},${y}`)) empty.push({x, y});
            }
        }
        if (empty.length === 0) return;

        const pos = empty[Math.floor(Math.random() * empty.length)];
        this.aiSnake.body = [{x: pos.x, y: pos.y}];
        this.aiSnake.direction = {x: 1, y: 0};
        this.aiSnake.alive = true;
        this.aiSnake.respawnTimer = 0;
    },

    _trySpawnFood() {
        if (this.foodManager.foods.length >= this.levelConfig.maxFood) return;
        const occupied = this._getOccupiedSet();
        this.foodManager.spawn(this.levelConfig.gridCols, this.levelConfig.gridRows, occupied);
    },

    _updateBarriers() {
        if (!this.levelConfig.hasMovingBarriers) return;

        const now = Date.now();
        this.pendingSpawns = this.pendingSpawns.filter(p => {
            if (now - p.warningStart >= this.levelConfig.barrierWarning) {
                this.barriers.push({x: p.x, y: p.y, createdAt: now});
                return false;
            }
            return true;
        });

        this.barriers = this.barriers.filter(b => now - b.createdAt < this.levelConfig.barrierLifetime);

        const total = this.barriers.length + this.pendingSpawns.length;
        if (total < 2 && now - this.lastBarrierSpawn >= this.levelConfig.barrierInterval) {
            this._spawnBarrier();
            this.lastBarrierSpawn = now;
        }
    },

    _spawnBarrier() {
        const occupied = this._getOccupiedSet();
        const empty = [];
        for (let x = 0; x < this.levelConfig.gridCols; x++) {
            for (let y = 0; y < this.levelConfig.gridRows; y++) {
                if (!occupied.has(`${x},${y}`)) empty.push({x, y});
            }
        }
        if (empty.length === 0) return;

        const pos = empty[Math.floor(Math.random() * empty.length)];
        this.pendingSpawns.push({x: pos.x, y: pos.y, warningStart: Date.now()});
    },

    _updateInvincible(dt) {
        if (!this.invincible) return;
        this.invincibleTimer -= dt;
        if (this.invincibleTimer <= 0) {
            this.invincible = false;
            this.invincibleTimer = 0;
            const indicator = document.getElementById('invincible-indicator');
            if (indicator) indicator.classList.add('hidden');
            return;
        }
        const el = document.getElementById('invincible-timer');
        if (el) el.textContent = Math.ceil(this.invincibleTimer / 1000);
    },

    _spawnParticles(gridX, gridY, color, count) {
        const cs = Renderer.cellSize;
        const px = gridX * cs + cs / 2;
        const py = gridY * cs + cs / 2;

        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
            const speed = 60 + Math.random() * 80;
            this.particles.push({
                x: px,
                y: py,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                decay: 1.5 + Math.random() * 1,
                size: 2 + Math.random() * 3,
                color: color,
            });
        }
    },

    _updateParticles(dt) {
        const sec = dt / 1000;
        this.particles = this.particles.filter(p => {
            p.x += p.vx * sec;
            p.y += p.vy * sec;
            p.vx *= 0.96;
            p.vy *= 0.96;
            p.life -= p.decay * sec;
            return p.life > 0;
        });
    },

    _onDeath() {
        const deathTime = new Date().toISOString();
        const headPos = this.snake ? {x: this.snake.body[0].x, y: this.snake.body[0].y} : null;
        console.log(`[Game] 死亡触发, 时间: ${deathTime}, 蛇头位置: ${JSON.stringify(headPos)}, 分数: ${this.score}, 状态: ${this.state}`);

        this.stop();
        Storage.addDeath();
        Storage.setBestScore(this.level, this.score);
        AudioManager.playDie();
        UI.showGameOver(this.score, Storage.getBestScore(this.level));
    },

    _checkWin() {
        if (this.score >= this.levelConfig.winScore) {
            this.stop();
            Storage.completeLevel(this.level);
            Storage.setBestScore(this.level, this.score);
            AudioManager.playVictory();
            UI.showVictory(this.level, this.score);
        }
    },

    _render() {
        const skin = Storage.getSkin();
        const moveProgress = this.levelConfig.speed > 0 ? this._moveAccum / this.levelConfig.speed : 0;
        Renderer.render({
            snake: this.snake,
            foods: this.foodManager.foods,
            foodManager: this.foodManager,
            obstacles: this.levelConfig.obstacles,
            barriers: this.barriers,
            pendingSpawns: this.pendingSpawns,
            barrierLifetime: this.levelConfig.barrierLifetime || 12000,
            aiSnake: this.aiSnake,
            invincible: this.invincible,
            skin: skin,
            particles: this.particles,
            moveProgress: moveProgress,
            gridCols: this.levelConfig.gridCols,
            gridRows: this.levelConfig.gridRows,
        });
    },

    _updateHUD() {
        const scoreEl = document.getElementById('hud-score');
        const levelEl = document.getElementById('hud-level');
        const targetEl = document.getElementById('hud-target');
        if (scoreEl) scoreEl.textContent = this.score;
        if (levelEl) levelEl.textContent = `${CONFIG.JP.LV}${this.level}`;
        if (targetEl) targetEl.textContent = `${this.score}/${this.levelConfig.winScore}`;
    },

    setDirection(dir) {
        if (this.snake && this.state === 'playing') {
            this.snake.setDirection(dir);
        }
    },

    pause() {
        if (this.state === 'playing') {
            this.state = 'paused';
            if (this._loopId) cancelAnimationFrame(this._loopId);
            AudioManager.stopBgm();
        }
    },

    resume() {
        if (this.state === 'paused') {
            this.state = 'playing';
            this._lastTime = performance.now();
            this._moveAccum = 0;
            if (this.snake) this.snake.clearBuffer();
            this._loopId = requestAnimationFrame(t => this._loop(t));
            AudioManager.startBgm();
        }
    },

    stop() {
        this.state = 'idle';
        if (this._loopId) cancelAnimationFrame(this._loopId);
        AudioManager.stopBgm();
    },

    async revive() {
        if (this.isAdWatching) {
            console.warn('[Game] 复活请求被忽略: 已在广告观看中');
            return;
        }

        this.isAdWatching = true;
        this._stopRespawnCountdown();
        const reviveStartTime = performance.now();

        console.log(`[Game] 复活流程启动, 时间: ${new Date().toISOString()}, 当前状态: ${this.state}, 分数: ${this.score}`);

        try {
            const result = await AdAdapter.showRewardedAd();

            if (result.success) {
                const head = this.snake.lastHead || this.snake.body[0] || {x: Math.floor(this.levelConfig.gridCols / 2), y: Math.floor(this.levelConfig.gridRows / 2)};

                console.log(`[Game] 广告成功, 开始复活, 复活位置: (${head.x}, ${head.y}), 上次方向: (${this.snake.lastDirection.x}, ${this.snake.lastDirection.y})`);

                this.snake.reviveAt(head.x, head.y);

                this.invincible = true;
                this.invincibleTimer = CONFIG.GAME.INVINCIBLE_DURATION;
                AudioManager.playInvincible();

                this._moveAccum = 0;
                this._aiMoveAccum = 0;
                this.particles = [];

                this.state = 'playing';
                this._lastTime = performance.now();
                this._loopId = requestAnimationFrame(t => this._loop(t));
                AudioManager.startBgm();

                UI.hideGameOver();

                const indicator = document.getElementById('invincible-indicator');
                if (indicator) indicator.classList.remove('hidden');

                const elapsed = (performance.now() - reviveStartTime).toFixed(0);
                console.log(`[Game] 复活完成, 耗时: ${elapsed}ms, 蛇身长度: ${this.snake.body.length}, 无敌时间: ${CONFIG.GAME.INVINCIBLE_DURATION}ms, 游戏状态: ${this.state}`);
            } else {
                console.warn(`[Game] 广告失败, 原因: ${result.reason || '未知'}, 重新显示游戏结束画面`);
                this._resetReviveButton();
                UI.showGameOver(this.score, Storage.getBestScore(this.level));
            }
        } catch (err) {
            console.error('[Game] 复活流程异常:', err);
            this._resetReviveButton();
            UI.showGameOver(this.score, Storage.getBestScore(this.level));
        } finally {
            this.isAdWatching = false;
        }
    },

    startRespawnCountdown() {
        let countdown = CONFIG.GAME.RESPAWN_COUNTDOWN;
        const el = document.getElementById('respawn-countdown');
        if (el) el.textContent = `(${countdown})`;

        this._respawnInterval = setInterval(() => {
            if (this.isAdWatching) return;
            countdown--;
            if (el) el.textContent = `(${countdown})`;
            if (countdown <= 0) {
                this._stopRespawnCountdown();
                UI.showFinalGameOver();
            }
        }, 1000);
    },

    _stopRespawnCountdown() {
        if (this._respawnInterval) {
            clearInterval(this._respawnInterval);
            this._respawnInterval = null;
        }
    },

    _resetReviveButton() {
        const reviveBtn = document.getElementById('btn-revive');
        if (reviveBtn) {
            reviveBtn.disabled = false;
            reviveBtn.innerHTML = `${CONFIG.JP.WATCH_AD} <span id="respawn-countdown"></span>`;
        }
    },

    getNextLevel() {
        return this.level < 3 ? this.level + 1 : null;
    },
};

window.Game = Game;
