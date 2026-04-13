const Game = {
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,
    
    state: 'idle',
    currentLevel: 1,
    score: 0,
    lives: 3,
    
    paddle: null,
    balls: [],
    bricks: [],
    
    touchStartX: 0,
    touchX: 0,
    isTouching: false,
    
    lastTime: 0,
    deltaTime: 0,
    
    particles: [],
    glowIntensity: 0,
    
    adWatched: {
        revive: false,
        double: false,
        bomb: false
    },

    powerUps: [],
    activePowerUps: {
        expand: { active: false, timer: 0, cooldown: 0 },
        multiBall: { active: false, timer: 0, cooldown: 0 },
        laser: { active: false, timer: 0, cooldown: 0 }
    },
    lasers: [],
    
    POWER_UP_TYPES: {
        EXPAND: {
            id: 'expand',
            name: '拡張',
            icon: '📏',
            color: '#00ff88',
            glowColor: 'rgba(0, 255, 136, 0.8)',
            duration: 20000,
            cooldown: 0,
            dropChance: 0.08,
            description: 'パドル拡大'
        },
        MULTI_BALL: {
            id: 'multiBall',
            name: 'マルチボール',
            icon: '⚡',
            color: '#aa00ff',
            glowColor: 'rgba(170, 0, 255, 0.8)',
            duration: 0,
            cooldown: 0,
            dropChance: 0.06,
            description: 'ボール3分割'
        },
        LASER: {
            id: 'laser',
            name: 'レーザー',
            icon: '🔫',
            color: '#ff0044',
            glowColor: 'rgba(255, 0, 68, 0.8)',
            duration: 8000,
            cooldown: 0,
            dropChance: 0.05,
            description: 'レーザー発射'
        }
    },
    laserAutoFireTimer: 0,

    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        this.setupTouchControls();
        this.setupUICallbacks();
        
        AudioManager.init();
        LevelManager.init();
        UI.init();
        
        this.state = 'idle';
        this.render();
    },

    resize() {
        const dpr = window.devicePixelRatio || 1;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.height + 'px';
        
        this.ctx.scale(dpr, dpr);
        
        if (this.paddle) {
            this.paddle.width = this.getPaddleWidth();
            this.paddle.y = this.height - 80;
        }
    },

    getPaddleWidth() {
        const config = LevelManager.getLevelConfig(this.currentLevel);
        const baseWidth = config.paddleWidth || 80;
        let width = Math.max(baseWidth, this.width * 0.15);
        
        if (this.activePowerUps.expand.active) {
            width *= 1.5;
        }
        
        return width;
    },

    setupTouchControls() {
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            AudioManager.resumeContext();
            
            this.isTouching = true;
            this.touchStartX = e.touches[0].clientX;
            this.touchX = e.touches[0].clientX;
            
            if (this.state === 'playing' || this.state === 'ready') {
                const clickedPU = this.checkPowerUpClick(this.touchX, e.touches[0].clientY);
                if (clickedPU) {
                    this.isTouching = false;
                    return;
                }
            }
            
            if (this.state === 'ready') {
                this.launchBall();
            }
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!this.isTouching) return;
            
            this.touchX = e.touches[0].clientX;
            
            if (this.paddle && (this.state === 'playing' || this.state === 'ready')) {
                const deltaX = this.touchX - this.touchStartX;
                this.paddle.x += deltaX * 0.8;
                this.touchStartX = this.touchX;
                
                this.paddle.x = Math.max(0, Math.min(this.width - this.paddle.width, this.paddle.x));
            }
        }, { passive: false });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.isTouching = false;
        }, { passive: false });

        this.canvas.addEventListener('mousedown', (e) => {
            AudioManager.resumeContext();
            this.isTouching = true;
            this.touchStartX = e.clientX;
            this.touchX = e.clientX;
            
            if (this.state === 'playing' || this.state === 'ready') {
                const clickedPU = this.checkPowerUpClick(e.clientX, e.clientY);
                if (clickedPU) {
                    this.isTouching = false;
                    return;
                }
            }
            
            if (this.state === 'ready') {
                this.launchBall();
            }
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.isTouching) return;
            
            this.touchX = e.clientX;
            
            if (this.paddle && (this.state === 'playing' || this.state === 'ready')) {
                const deltaX = this.touchX - this.touchStartX;
                this.paddle.x += deltaX * 0.8;
                this.touchStartX = this.touchX;
                
                this.paddle.x = Math.max(0, Math.min(this.width - this.paddle.width, this.paddle.x));
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            this.isTouching = false;
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.isTouching = false;
        });
    },

    setupUICallbacks() {
        UI.on('onStart', () => this.startGame(1));
        UI.on('onLevelSelect', (level) => this.startGame(level));
        UI.on('onPause', () => this.pauseGame());
        UI.on('onResume', () => this.resumeGame());
        UI.on('onRestart', () => this.restartLevel());
        UI.on('onQuit', () => this.quitGame());
        UI.on('onReviveAd', () => this.watchAdRevive());
        UI.on('onDoubleAd', () => this.watchAdDouble());
        UI.on('onNextLevel', () => this.nextLevel());
        UI.on('onBombAd', () => this.watchAdBomb());
        UI.on('onFinalChest', () => this.watchAdFinalChest());
    },

    checkPowerUpClick(x, y) {
        const startX = 15;
        const startY = this.height - 140;
        const iconSize = 36;
        const spacing = 50;
        
        const keyMap = ['expand', 'multiBall', 'laser'];
        
        for (let i = 0; i < keyMap.length; i++) {
            const puX = startX + i * spacing;
            const puY = startY;
            
            if (x >= puX && x <= puX + iconSize && y >= puY && y <= puY + iconSize) {
                const key = keyMap[i];
                this.watchAdForPowerUp(key);
                return true;
            }
        }
        return false;
    },

    watchAdForPowerUp(powerUpKey) {
        const previousState = this.state;
        this.state = 'paused';
        
        UI.showAdModal('道具激活', '观看广告激活道具', () => {
            switch (powerUpKey) {
                case 'expand':
                    this.activateExpand();
                    break;
                case 'multiBall':
                    this.activateMultiBall();
                    break;
                case 'laser':
                    this.activateLaser();
                    break;
            }
            this.state = previousState === 'paused' ? 'ready' : previousState;
            if (this.state === 'ready' && !this.balls.some(b => b.attached)) {
                this.state = 'playing';
            }
        }, () => {
            this.state = previousState === 'paused' ? 'ready' : previousState;
        });
    },

    startGame(level) {
        this.currentLevel = level;
        this.score = 0;
        this.lives = LevelManager.getLevelConfig(level).lives || 3;
        this.adWatched = { revive: false, double: false, bomb: false };
        
        this.resetPowerUps();
        this.initLevel();
        
        UI.hideAllScreens();
        UI.hideAllModals();
        UI.showGameUI(true);
        UI.updateHUD(this.currentLevel, this.score, this.lives);
        
        AudioManager.startBGM();
        
        this.state = 'ready';
    },

    resetPowerUps() {
        this.powerUps = [];
        this.lasers = [];
        this.activePowerUps = {
            expand: { active: false, timer: 0, cooldown: 0 },
            multiBall: { active: false, timer: 0, cooldown: 0 },
            laser: { active: false, timer: 0, cooldown: 0 }
        };
    },

    initLevel() {
        const config = LevelManager.getLevelConfig(this.currentLevel);
        
        const baseW = Math.max(config.paddleWidth || 80, this.width * 0.15);
        
        this.paddle = {
            x: this.width / 2 - baseW / 2,
            y: this.height - 80,
            width: baseW,
            height: 15,
            speed: 8,
            baseWidth: baseW
        };
        
        const ballSpeed = config.ballSpeed || 5;
        this.balls = [{
            x: this.width / 2,
            y: this.paddle.y - 15,
            radius: 10,
            dx: 0,
            dy: 0,
            speed: ballSpeed,
            attached: true
        }];
        
        this.initBricks(config);
        this.particles = [];
    },

    initBricks(config) {
        this.bricks = [];
        const layout = config.brickLayout;
        
        const padding = 4;
        const topOffset = 70;
        const sideMargin = 10;
        
        const availableWidth = this.width - sideMargin * 2;
        const cols = config.cols;
        const rows = config.rows;
        
        const brickWidth = (availableWidth - padding * (cols - 1)) / cols;
        const brickHeight = 18;
        
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const brickData = layout[r] ? layout[r][c] : null;
                if (brickData) {
                    this.bricks.push({
                        x: sideMargin + c * (brickWidth + padding),
                        y: topOffset + r * (brickHeight + padding),
                        width: brickWidth,
                        height: brickHeight,
                        visualWidth: brickWidth * 0.85,
                        visualHeight: brickHeight * 0.85,
                        visualOffsetX: brickWidth * 0.075,
                        visualOffsetY: brickHeight * 0.075,
                        type: brickData.type,
                        color: brickData.color,
                        hits: brickData.hits,
                        maxHits: brickData.hits,
                        visible: true
                    });
                }
            }
        }
    },

    launchBall() {
        const mainBall = this.balls.find(b => b.attached);
        if (!mainBall) return;
        
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.5;
        mainBall.dx = Math.cos(angle) * mainBall.speed;
        mainBall.dy = Math.sin(angle) * mainBall.speed;
        mainBall.attached = false;
        
        AudioManager.playBounce();
        this.state = 'playing';
    },

    pauseGame() {
        if (this.state === 'playing' || this.state === 'ready') {
            this.state = 'paused';
            UI.showModal('pause');
            AudioManager.stopBGM();
        }
    },

    resumeGame() {
        if (this.state === 'paused') {
            const hasAttachedBall = this.balls.some(b => b.attached);
            this.state = hasAttachedBall ? 'ready' : 'playing';
            AudioManager.startBGM();
        }
    },

    restartLevel() {
        this.lives = LevelManager.getLevelConfig(this.currentLevel).lives || 3;
        this.adWatched.revive = false;
        this.resetPowerUps();
        this.initLevel();
        this.state = 'ready';
        UI.updateHUD(this.currentLevel, this.score, this.lives);
    },

    quitGame() {
        this.state = 'idle';
        AudioManager.stopBGM();
        UI.showGameUI(false);
        UI.hideAllModals();
        UI.showScreen('home');
        UI.updateHighScore();
    },

    nextLevel() {
        if (this.currentLevel < LevelManager.maxLevel) {
            this.currentLevel++;
            this.adWatched = { revive: false, double: false, bomb: false };
            this.resetPowerUps();
            this.initLevel();
            this.state = 'ready';
            UI.updateHUD(this.currentLevel, this.score, this.lives);
        } else {
            this.showAllComplete();
        }
    },

    update(timestamp) {
        if (this.state !== 'playing') return;
        
        this.deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;
        
        if (this.deltaTime > 0.1) this.deltaTime = 0.016;
        
        this.updateBalls();
        this.updatePowerUps();
        this.updateLasers();
        this.updateParticles();
        this.updateActivePowerUps();
        this.checkCollisions();
        this.checkWin();
        
        UI.updateHUD(this.currentLevel, this.score, this.lives);
    },

    updateBalls() {
        for (let i = this.balls.length - 1; i >= 0; i--) {
            const ball = this.balls[i];
            
            if (ball.attached) {
                ball.x = this.paddle.x + this.paddle.width / 2;
                ball.y = this.paddle.y - ball.radius;
                continue;
            }
            
            ball.x += ball.dx;
            ball.y += ball.dy;
            
            if (ball.x - ball.radius < 0) {
                ball.x = ball.radius;
                ball.dx = -ball.dx;
                AudioManager.playWallHit();
            }
            if (ball.x + ball.radius > this.width) {
                ball.x = this.width - ball.radius;
                ball.dx = -ball.dx;
                AudioManager.playWallHit();
            }
            if (ball.y - ball.radius < 0) {
                ball.y = ball.radius;
                ball.dy = -ball.dy;
                AudioManager.playWallHit();
            }
            
            if (ball.y + ball.radius > this.height) {
                this.balls.splice(i, 1);
                
                if (this.balls.length === 0) {
                    this.loseLife();
                }
            }
        }
    },

    checkCollisions() {
        for (const ball of this.balls) {
            if (ball.attached) continue;
            
            if (ball.y + ball.radius >= this.paddle.y &&
                ball.y - ball.radius <= this.paddle.y + this.paddle.height &&
                ball.x >= this.paddle.x &&
                ball.x <= this.paddle.x + this.paddle.width) {
                
                const hitPos = (ball.x - this.paddle.x) / this.paddle.width;
                const angle = (hitPos - 0.5) * Math.PI * 0.7;
                
                ball.dx = Math.sin(angle) * ball.speed;
                ball.dy = -Math.cos(angle) * ball.speed;
                
                ball.y = this.paddle.y - ball.radius;
                
                AudioManager.playPaddleHit();
                this.addGlowEffect();
            }
            
            for (let i = this.bricks.length - 1; i >= 0; i--) {
                const brick = this.bricks[i];
                if (!brick.visible) continue;
                
                if (ball.x + ball.radius > brick.x &&
                    ball.x - ball.radius < brick.x + brick.width &&
                    ball.y + ball.radius > brick.y &&
                    ball.y - ball.radius < brick.y + brick.height) {
                    
                    const overlapLeft = ball.x + ball.radius - brick.x;
                    const overlapRight = brick.x + brick.width - (ball.x - ball.radius);
                    const overlapTop = ball.y + ball.radius - brick.y;
                    const overlapBottom = brick.y + brick.height - (ball.y - ball.radius);
                    
                    const minOverlapX = Math.min(overlapLeft, overlapRight);
                    const minOverlapY = Math.min(overlapTop, overlapBottom);
                    
                    if (minOverlapX < minOverlapY) {
                        ball.dx = -ball.dx;
                    } else {
                        ball.dy = -ball.dy;
                    }
                    
                    this.hitBrick(brick, i);
                    break;
                }
            }
        }
        
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const pu = this.powerUps[i];
            pu.y += pu.speed;
            pu.rotation += 0.05;
            
            if (pu.y > this.height) {
                this.powerUps.splice(i, 1);
                continue;
            }
            
            if (pu.x + pu.radius > this.paddle.x &&
                pu.x - pu.radius < this.paddle.x + this.paddle.width &&
                pu.y + pu.radius > this.paddle.y &&
                pu.y - pu.radius < this.paddle.y + this.paddle.height) {
                
                this.collectPowerUp(pu);
                this.powerUps.splice(i, 1);
            }
        }
    },

    hitBrick(brick, index) {
        brick.hits--;
        
        if (brick.hits <= 0) {
            brick.visible = false;
            
            const points = brick.type * 10 * this.currentLevel;
            this.score += points;
            
            const colors = LevelManager.getBrickColor(brick);
            this.createBrickParticles(brick, colors[0]);
            
            AudioManager.playBrickBreak(brick.type);
            
            this.tryDropPowerUp(brick);
        } else {
            AudioManager.playBounce();
        }
    },

    tryDropPowerUp(brick) {
        const puTypes = Object.values(this.POWER_UP_TYPES);
        
        for (const puType of puTypes) {
            if (Math.random() < puType.dropChance) {
                this.powerUps.push({
                    x: brick.x + brick.width / 2,
                    y: brick.y + brick.height / 2,
                    radius: 18,
                    speed: 2.5,
                    rotation: 0,
                    type: puType
                });
                break;
            }
        }
    },

    collectPowerUp(pu) {
        AudioManager.playPowerUp();
        
        switch (pu.type.id) {
            case 'expand':
                this.activateExpand();
                break;
            case 'multiBall':
                this.activateMultiBall();
                break;
            case 'laser':
                this.activateLaser();
                break;
        }
        
        this.createCollectParticles(pu.x, pu.y, pu.type.color);
    },

    activateExpand() {
        const pu = this.activePowerUps.expand;
        
        if (pu.active) {
            pu.timer = this.POWER_UP_TYPES.EXPAND.duration;
            return;
        }
        
        pu.active = true;
        pu.timer = this.POWER_UP_TYPES.EXPAND.duration;
        
        const newWidth = this.paddle.baseWidth * 1.5;
        const center = this.paddle.x + this.paddle.width / 2;
        this.paddle.width = newWidth;
        this.paddle.x = center - this.paddle.width / 2;
        this.paddle.x = Math.max(0, Math.min(this.width - this.paddle.width, this.paddle.x));
    },

    activateMultiBall() {
        const activeBalls = this.balls.filter(b => !b.attached);
        if (activeBalls.length === 0) return;
        
        const newBalls = [];
        
        for (const sourceBall of activeBalls) {
            const baseAngle = Math.atan2(sourceBall.dy, sourceBall.dx);
            const spreadAngles = [-0.4, 0.4];
            
            for (const spread of spreadAngles) {
                const angle = baseAngle + spread;
                newBalls.push({
                    x: sourceBall.x,
                    y: sourceBall.y,
                    radius: sourceBall.radius,
                    dx: Math.cos(angle) * sourceBall.speed,
                    dy: Math.sin(angle) * sourceBall.speed,
                    speed: sourceBall.speed,
                    attached: false
                });
            }
        }
        
        this.balls = this.balls.concat(newBalls);
    },

    activateLaser() {
        const pu = this.activePowerUps.laser;
        
        if (pu.active) {
            pu.timer = this.POWER_UP_TYPES.LASER.duration;
            return;
        }
        
        pu.active = true;
        pu.timer = this.POWER_UP_TYPES.LASER.duration;
        this.laserAutoFireTimer = 0;
        this.fireLaser();
    },

    fireLaser() {
        const pu = this.activePowerUps.laser;
        if (!pu.active) return;
        
        this.lasers.push({
            x: this.paddle.x + 10,
            y: this.paddle.y,
            width: 6,
            height: 25,
            speed: 12
        });
        
        this.lasers.push({
            x: this.paddle.x + this.paddle.width - 16,
            y: this.paddle.y,
            width: 6,
            height: 25,
            speed: 12
        });
        
        AudioManager.playTone(800, 0.1, 'square', 0.2);
    },

    updateLasers() {
        for (let i = this.lasers.length - 1; i >= 0; i--) {
            const laser = this.lasers[i];
            laser.y -= laser.speed;
            
            if (laser.y < 0) {
                this.lasers.splice(i, 1);
                continue;
            }
            
            for (const brick of this.bricks) {
                if (!brick.visible) continue;
                
                if (laser.x + laser.width > brick.x &&
                    laser.x < brick.x + brick.width &&
                    laser.y < brick.y + brick.height &&
                    laser.y + laser.height > brick.y) {
                    
                    this.hitBrick(brick, this.bricks.indexOf(brick));
                    this.lasers.splice(i, 1);
                    break;
                }
            }
        }
    },

    updatePowerUps() {
        for (const pu of this.powerUps) {
            pu.y += pu.speed;
            pu.rotation += 0.05;
        }
    },

    updateActivePowerUps() {
        const dt = this.deltaTime * 1000;
        
        for (const key in this.activePowerUps) {
            const pu = this.activePowerUps[key];
            
            if (pu.timer > 0) {
                pu.timer -= dt;
                if (pu.timer <= 0) {
                    pu.timer = 0;
                    pu.active = false;
                    
                    if (key === 'expand') {
                        const center = this.paddle.x + this.paddle.width / 2;
                        this.paddle.width = this.paddle.baseWidth;
                        this.paddle.x = center - this.paddle.width / 2;
                        this.paddle.x = Math.max(0, Math.min(this.width - this.paddle.width, this.paddle.x));
                    }
                    
                    if (key === 'laser') {
                        this.laserAutoFireTimer = 0;
                    }
                }
            }
        }
        
        if (this.activePowerUps.laser.active) {
            this.laserAutoFireTimer += dt;
            if (this.laserAutoFireTimer >= 300) {
                this.laserAutoFireTimer -= 300;
                this.fireLaser();
            }
        }
    },

    createCollectParticles(x, y, color) {
        for (let i = 0; i < 15; i++) {
            const angle = (Math.PI * 2 / 15) * i;
            const speed = 3 + Math.random() * 2;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: 4 + Math.random() * 3,
                color: color,
                alpha: 1,
                decay: 0.03
            });
        }
    },

    createBrickParticles(brick, color) {
        const centerX = brick.x + brick.width / 2;
        const centerY = brick.y + brick.height / 2;
        
        for (let i = 0; i < 10; i++) {
            const angle = (Math.PI * 2 / 10) * i + Math.random() * 0.5;
            const speed = 2 + Math.random() * 3;
            
            this.particles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: 2 + Math.random() * 2,
                color: color,
                alpha: 1,
                decay: 0.02 + Math.random() * 0.02
            });
        }
    },

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1;
            p.alpha -= p.decay;
            
            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }
    },

    loseLife() {
        this.lives--;
        AudioManager.playLoseLife();
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            this.resetBall();
            this.state = 'ready';
        }
    },

    resetBall() {
        const config = LevelManager.getLevelConfig(this.currentLevel);
        const ballSpeed = config.ballSpeed || 5;
        
        this.balls = [{
            x: this.paddle.x + this.paddle.width / 2,
            y: this.paddle.y - 15,
            radius: 10,
            dx: 0,
            dy: 0,
            speed: ballSpeed,
            attached: true
        }];
    },

    gameOver() {
        this.state = 'gameover';
        AudioManager.stopBGM();
        AudioManager.playGameOver();
        UI.showGameOver(this.score);
    },

    checkWin() {
        const remaining = this.bricks.filter(b => b.visible && b.type !== LevelManager.BRICK_TYPES.INDESTRUCTIBLE);
        
        if (remaining.length === 0) {
            this.levelComplete();
        }
    },

    levelComplete() {
        this.state = 'complete';
        AudioManager.stopBGM();
        AudioManager.playLevelComplete();
        
        LevelManager.completeLevel(this.currentLevel, this.score);
        UI.updateHighScore();
        
        if (this.currentLevel >= LevelManager.maxLevel) {
            this.showAllComplete();
        } else {
            UI.showLevelComplete(this.score, this.lives);
        }
    },

    showAllComplete() {
        UI.showAllComplete(this.score);
    },

    watchAdRevive() {
        const previousState = this.state;
        this.state = 'paused';
        
        this.simulateAd(() => {
            this.lives = 1;
            this.adWatched.revive = true;
            UI.hideModal('gameOver');
            this.resetBall();
            this.state = 'ready';
            UI.updateHUD(this.currentLevel, this.score, this.lives);
            AudioManager.startBGM();
        }, () => {
            this.state = previousState;
        });
    },

    watchAdDouble() {
        const previousState = this.state;
        this.state = 'paused';
        
        this.simulateAd(() => {
            const bonus = this.score;
            this.score += bonus;
            this.adWatched.double = true;
            UI.hideModal('levelComplete');
            UI.showChest(bonus);
            setTimeout(() => {
                this.nextLevel();
            }, 1500);
        }, () => {
            this.state = previousState;
        });
    },

    watchAdBomb() {
        const previousState = this.state;
        this.state = 'paused';
        
        this.simulateAd(() => {
            this.adWatched.bomb = true;
            this.bombBottomRow();
            UI.hideModal('stuck');
            AudioManager.playBomb();
            this.state = 'playing';
        }, () => {
            this.state = previousState;
        });
    },

    watchAdFinalChest() {
        const previousState = this.state;
        this.state = 'paused';
        
        this.simulateAd(() => {
            const bonus = 1000;
            this.score += bonus;
            UI.hideModal('allComplete');
            UI.showChest(bonus);
            setTimeout(() => {
                this.quitGame();
            }, 2000);
        }, () => {
            this.state = previousState;
        });
    },

    simulateAd(callback, onCancel) {
        UI.hideAllModals();
        
        const adOverlay = document.createElement('div');
        adOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            color: white;
            font-size: 20px;
        `;
        adOverlay.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 48px; margin-bottom: 20px;">📺</div>
                <div id="ad-countdown" style="font-size: 32px; color: #00ffff;">3</div>
                <div style="margin-top: 10px; color: #888;">広告再生中...</div>
            </div>
        `;
        document.body.appendChild(adOverlay);
        
        let count = 3;
        const countdownEl = adOverlay.querySelector('#ad-countdown');
        
        const interval = setInterval(() => {
            count--;
            if (count > 0) {
                countdownEl.textContent = count;
            } else {
                clearInterval(interval);
                adOverlay.remove();
                callback();
            }
        }, 1000);
    },

    bombBottomRow() {
        const maxY = Math.max(...this.bricks.filter(b => b.visible).map(b => b.y));
        const bottomBricks = this.bricks.filter(b => b.visible && b.y >= maxY - 30);
        
        bottomBricks.forEach(brick => {
            if (brick.type !== LevelManager.BRICK_TYPES.INDESTRUCTIBLE) {
                brick.visible = false;
                const colors = LevelManager.getBrickColor(brick);
                this.createBrickParticles(brick, colors[0]);
            }
        });
    },

    addGlowEffect() {
        this.glowIntensity = 1;
    },

    render(timestamp) {
        this.lastTime = timestamp || 0;
        
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        this.drawBackground();
        
        if (this.state !== 'idle') {
            this.drawBricks();
            this.drawPowerUps();
            this.drawPaddle();
            this.drawBalls();
            this.drawLasers();
            this.drawParticles();
            this.drawPowerUpUI();
        }
        
        if (this.glowIntensity > 0) {
            this.glowIntensity -= 0.05;
        }
        
        this.update(timestamp);
        
        requestAnimationFrame((t) => this.render(t));
    },

    drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#0a0a1a');
        gradient.addColorStop(0.5, '#1a0a2e');
        gradient.addColorStop(1, '#0a1a2e');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.drawGridLines();
    },

    drawGridLines() {
        this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
        this.ctx.lineWidth = 1;
        
        const gridSize = 40;
        
        for (let x = 0; x < this.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y < this.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
    },

    drawPaddle() {
        const p = this.paddle;
        
        this.ctx.save();
        
        let gradient = this.ctx.createLinearGradient(p.x, p.y, p.x + p.width, p.y);
        
        if (this.activePowerUps.expand.active) {
            gradient.addColorStop(0, '#00ff88');
            gradient.addColorStop(0.5, '#00ffff');
            gradient.addColorStop(1, '#00ff88');
            this.ctx.shadowColor = '#00ff88';
        } else if (this.activePowerUps.laser.active) {
            gradient.addColorStop(0, '#ff0044');
            gradient.addColorStop(0.5, '#ff00de');
            gradient.addColorStop(1, '#ff0044');
            this.ctx.shadowColor = '#ff0044';
        } else {
            gradient.addColorStop(0, '#00ffff');
            gradient.addColorStop(0.5, '#ff00de');
            gradient.addColorStop(1, '#00ffff');
            this.ctx.shadowColor = '#00ffff';
        }
        
        this.ctx.shadowBlur = 20 + this.glowIntensity * 20;
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.roundRect(p.x, p.y, p.width, p.height, 8);
        this.ctx.fill();
        
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        this.ctx.restore();
    },

    drawBalls() {
        for (const ball of this.balls) {
            this.ctx.save();
            
            this.ctx.shadowColor = '#ff00de';
            this.ctx.shadowBlur = 15;
            
            const gradient = this.ctx.createRadialGradient(ball.x - 3, ball.y - 3, 0, ball.x, ball.y, ball.radius);
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(0.5, '#ff00de');
            gradient.addColorStop(1, '#aa0088');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        }
    },

    drawBricks() {
        this.bricks.forEach(brick => {
            if (!brick.visible) return;
            
            this.ctx.save();
            
            const colors = LevelManager.getBrickColor(brick);
            const vx = brick.x + brick.visualOffsetX;
            const vy = brick.y + brick.visualOffsetY;
            const vw = brick.visualWidth;
            const vh = brick.visualHeight;
            
            const gradient = this.ctx.createLinearGradient(vx, vy, vx + vw, vy + vh);
            gradient.addColorStop(0, colors[0]);
            gradient.addColorStop(1, colors[1]);
            
            this.ctx.shadowColor = colors[0];
            this.ctx.shadowBlur = 8;
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.roundRect(vx, vy, vw, vh, 3);
            this.ctx.fill();
            
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
            
            if (brick.hits < brick.maxHits) {
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                this.ctx.fill();
                
                for (let i = 0; i < brick.maxHits - brick.hits; i++) {
                    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
                    this.ctx.lineWidth = 1.5;
                    this.ctx.beginPath();
                    this.ctx.moveTo(vx + 3 + i * 6, vy + 3);
                    this.ctx.lineTo(vx + vw - 3 - i * 6, vy + vh - 3);
                    this.ctx.stroke();
                }
            }
            
            this.ctx.restore();
        });
    },

    drawPowerUps() {
        for (const pu of this.powerUps) {
            this.ctx.save();
            this.ctx.translate(pu.x, pu.y);
            this.ctx.rotate(pu.rotation);
            
            this.ctx.shadowColor = pu.type.glowColor;
            this.ctx.shadowBlur = 15;
            
            const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, pu.radius);
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(0.5, pu.type.color);
            gradient.addColorStop(1, pu.type.color);
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, pu.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(pu.type.icon, 0, 0);
            
            this.ctx.restore();
        }
    },

    drawLasers() {
        for (const laser of this.lasers) {
            this.ctx.save();
            
            this.ctx.shadowColor = '#ff0044';
            this.ctx.shadowBlur = 10;
            
            const gradient = this.ctx.createLinearGradient(laser.x, laser.y + laser.height, laser.x, laser.y);
            gradient.addColorStop(0, 'rgba(255, 0, 68, 0.3)');
            gradient.addColorStop(1, '#ff0044');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(laser.x, laser.y, laser.width, laser.height);
            
            this.ctx.restore();
        }
    },

    drawParticles() {
        this.particles.forEach(p => {
            this.ctx.save();
            this.ctx.globalAlpha = p.alpha;
            this.ctx.shadowColor = p.color;
            this.ctx.shadowBlur = 8;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    },

    drawPowerUpUI() {
        const startX = 15;
        const startY = this.height - 140;
        const iconSize = 44;
        const spacing = 60;
        
        const keyMap = {
            'expand': 'EXPAND',
            'multiBall': 'MULTI_BALL',
            'laser': 'LASER'
        };
        
        const customIcons = {
            'expand': '▭',
            'multiBall': '⚡',
            'laser': '🔫'
        };
        
        let index = 0;
        for (const key in this.activePowerUps) {
            const pu = this.activePowerUps[key];
            const puType = this.POWER_UP_TYPES[keyMap[key]];
            
            const x = startX + index * spacing;
            const y = startY;
            
            this.ctx.save();
            
            this.ctx.globalAlpha = 1;
            
            if (pu.active) {
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
                this.ctx.shadowColor = puType.glowColor;
                this.ctx.shadowBlur = 20;
                this.ctx.shadowOffsetX = 0;
                this.ctx.shadowOffsetY = 0;
            } else {
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            }
            
            this.ctx.beginPath();
            this.ctx.roundRect(x, y, iconSize, iconSize, 8);
            this.ctx.fill();
            
            if (pu.active) {
                this.ctx.strokeStyle = puType.color;
                this.ctx.lineWidth = 2;
                this.ctx.shadowColor = puType.color;
                this.ctx.shadowBlur = 15;
                this.ctx.stroke();
            } else {
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }
            
            this.ctx.shadowBlur = 0;
            
            if (pu.active) {
                this.ctx.fillStyle = puType.color;
            } else {
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            }
            
            this.ctx.font = '24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(customIcons[key], x + iconSize / 2, y + iconSize / 2);
            
            if (pu.active && pu.timer > 0) {
                const timerSec = Math.ceil(pu.timer / 1000);
                
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
                this.ctx.beginPath();
                this.ctx.roundRect(x, y + iconSize + 2, iconSize, 18, 6);
                this.ctx.fill();
                
                this.ctx.fillStyle = puType.color;
                this.ctx.font = 'bold 14px Arial';
                this.ctx.fillText(timerSec + 's', x + iconSize / 2, y + iconSize + 12);
            }
            
            this.ctx.restore();
            index++;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Game.init();
});

window.Game = Game;
