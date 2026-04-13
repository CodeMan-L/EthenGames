const Game = {
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,
    
    gameState: 'idle',
    currentLevel: null,
    score: 0,
    knivesLeft: 0,
    knivesOnTarget: [],
    
    // 游戏功能
    combo: 0,
    maxCombo: 0,
    specialKnifeCharges: 0,
    specialKnifeActive: false,
    
    // 性能设置
    performance: {
        deviceType: 'desktop',
        isLowEnd: false,
        particleLimit: 200,
        starCount: 80,
        renderQuality: 1.0
    },
    
    target: {
        x: 0,
        y: 0,
        radius: 0,
        rotation: 0,
        rotationSpeed: 0,
        innerRadius: 0,
        thickness: 0
    },
    
    knife: {
        x: 0,
        y: 0,
        width: 10,
        height: 55,
        throwing: false,
        vx: 0,
        vy: 0,
        startY: 0,
        trail: [],
        insertAngle: 0,
        isInserting: false,
        insertProgress: 0,
        throwStartTime: 0,
        throwPower: 1.0,
        rotation: 0,
        rotationSpeed: 0
    },
    
    colors: {
        neonPink: '#ff00de',
        neonCyan: '#00ffff',
        neonPurple: '#8a2be2',
        neonBlue: '#0088ff',
        neonYellow: '#ffd700',
        background: '#0a0015',
        gridLine: 'rgba(138, 43, 226, 0.15)'
    },
    
    particles: [],
    backgroundStars: [],
    gridOffset: 0,
    glitchTimer: 0,
    
    animationId: null,
    lastTime: 0,
    
    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.detectPerformance();
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        this.setupTouchControls();
        this.initBackgroundStars();
        
        AudioManager.init();
        LevelManager.init();
        UIManager.init();
        
        this.gameLoop(0);
    },
    
    detectPerformance() {
        // 检测设备类型
        this.performance.deviceType = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
        
        // 检测设备性能
        const isLowEnd = () => {
            // 检测内存
            const memory = navigator.deviceMemory || 4;
            // 检测CPU核心数
            const cores = navigator.hardwareConcurrency || 4;
            // 检测屏幕分辨率
            const resolution = window.screen.width * window.screen.height;
            
            return memory < 4 || cores < 4 || resolution < 1920 * 1080;
        };
        
        this.performance.isLowEnd = isLowEnd();
        
        // 根据性能调整设置
        if (this.performance.isLowEnd) {
            this.performance.particleLimit = 100;
            this.performance.starCount = 40;
            this.performance.renderQuality = 0.8;
        }
        
        console.log('Performance detected:', this.performance);
    },
    
    setupTouchControls() {
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleClick(e.touches[0]);
        }, { passive: false });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        this.canvas.addEventListener('mousedown', (e) => {
            this.handleClick(e);
        });
    },
    
    handleClick(e) {
        if (this.gameState !== 'playing') return;
        if (this.knife.throwing || this.knivesLeft <= 0) return;
        
        AudioManager.resumeContext();
        
        // 检查是否长按使用特殊飞刀
        if (this.specialKnifeCharges > 0) {
            this.throwSpecialKnife();
        } else {
            this.throwKnifeStraight();
        }
    },
    
    throwSpecialKnife() {
        this.knife.throwing = true;
        this.knife.throwStartTime = Date.now();
        this.knife.vx = 15 + this.currentLevel.rotationSpeed * 0.5;
        this.knife.vy = 0;
        this.knife.rotation = 0;
        this.knife.rotationSpeed = 0.1;
        this.knife.isSpecial = true;
        
        this.knivesLeft--;
        this.specialKnifeCharges--;
        
        this.createThrowParticles(this.knife.x, this.knife.y + 10);
        AudioManager.playThrow();
        AudioManager.playSpecial();
        
        UIManager.updateGameHUD(this.currentLevel.id, this.knivesLeft);
        UIManager.updateSpecialKnifeCharges(this.specialKnifeCharges);
    },
    
    initBackgroundStars() {
        this.backgroundStars = [];
        for (let i = 0; i < this.performance.starCount; i++) {
            this.backgroundStars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * 0.8 + 0.1,
                opacity: Math.random() * 0.6 + 0.2,
                color: ['#ff00de', '#00ffff', '#ffffff', '#8a2be2'][Math.floor(Math.random() * 4)],
                pulse: Math.random() * Math.PI * 2,
                pulseSpeed: Math.random() * 0.02 + 0.01
            });
        }
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
        
        const minDim = Math.min(this.width, this.height);
        this.target.x = this.width / 2;
        this.target.y = this.height * 0.35;
        this.target.radius = minDim * 0.18;
        this.target.innerRadius = this.target.radius * 0.6;
        this.target.thickness = this.target.radius - this.target.innerRadius;
        
        this.knife.x = this.width / 2;
        this.knife.y = this.height * 0.8;
        this.knife.startY = this.height * 0.8;
        
        this.initBackgroundStars();
    },
    
    startLevel() {
        this.currentLevel = LevelManager.getCurrentLevel();
        this.knivesLeft = this.currentLevel.knifeCount;
        this.knivesOnTarget = [];
        this.particles = [];
        this.knife.trail = [];
        this.score = 0;
        
        // 重置游戏功能
        this.combo = 0;
        this.maxCombo = 0;
        this.specialKnifeCharges = 0;
        this.specialKnifeActive = false;
        
        this.target.rotation = 0;
        this.target.rotationSpeed = this.currentLevel.rotationSpeed;
        this.target.radius = Math.min(this.width, this.height) * this.currentLevel.targetSize;
        this.target.innerRadius = this.target.radius * 0.6;
        this.target.thickness = this.target.radius - this.target.innerRadius;
        this.knife.throwing = false;
        this.knife.y = this.knife.startY;
        this.knife.isInserting = false;
        this.knife.insertProgress = 0;
        
        this.gameState = 'playing';
        
        UIManager.updateGameHUD(this.currentLevel.id, this.knivesLeft);
        UIManager.updateGameScore(this.score);
        UIManager.showAssistItem();
        
        AudioManager.startBGM();
    },
    
    throwKnifeStraight() {
        this.knife.throwing = true;
        this.knife.throwStartTime = Date.now();
        this.knife.throwPower = 1.0 + Math.random() * 0.2; // 轻微随机力量变化
        this.knife.vx = (Math.random() - 0.5) * 0.5; // 轻微随机偏移
        this.knife.vy = -25 * this.knife.throwPower;
        this.knife.rotation = 0;
        this.knife.rotationSpeed = Math.random() * 0.2 - 0.1; // 随机旋转
        AudioManager.playThrow();
        
        this.createThrowParticles(this.knife.x, this.knife.y);
        this.createThrowParticles(this.knife.x, this.knife.y + 10);
    },
    
    update(deltaTime) {
        this.updateBackgroundStars();
        this.gridOffset += 0.3;
        this.glitchTimer += deltaTime;
        
        if (this.gameState !== 'playing') return;
        
        this.updateTargetRotation();
        this.updateParticles();
        
        for (let knife of this.knivesOnTarget) {
            knife.rotation += this.target.rotationSpeed;
        }
        
        if (this.knife.isInserting) {
            this.updateInsertAnimation();
        } else if (this.knife.throwing) {
            this.updateFlyingKnife();
        }
        
        this.updateKnifeTrail();
    },
    
    updateTargetRotation() {
        this.target.rotation += this.target.rotationSpeed;
        if (this.target.rotation > Math.PI * 2) {
            this.target.rotation -= Math.PI * 2;
        }
    },
    
    updateFlyingKnife() {
        this.knife.trail.push({
            x: this.knife.x,
            y: this.knife.y,
            alpha: 1,
            size: Math.random() * 3 + 1,
            color: this.colors.neonCyan
        });
        
        if (this.knife.trail.length > 25) {
            this.knife.trail.shift();
        }
        
        // 添加旋转效果
        this.knife.rotation += this.knife.rotationSpeed;
        
        // 模拟重力和空气阻力
        this.knife.vy += 0.2; // 重力
        this.knife.vx *= 0.99; // 空气阻力
        
        this.knife.x += this.knife.vx;
        this.knife.y += this.knife.vy;
        
        // 飞行过程中生成粒子
        if (Date.now() % 10 < 5) {
            this.createTrailParticle(this.knife.x, this.knife.y);
        }
        
        this.checkCollision();
        
        if (this.knife.y < -50 || this.knife.x < -50 || this.knife.x > this.width + 50) {
            this.knifeMiss();
        }
    },
    
    updateInsertAnimation() {
        this.knife.insertProgress += 0.08;
        
        if (this.knife.insertProgress >= 1) {
            this.completeInsertion();
        }
    },
    
    completeInsertion() {
        this.knivesOnTarget.push({
            x: this.target.x + Math.cos(this.knife.insertAngle) * this.target.innerRadius,
            y: this.target.y + Math.sin(this.knife.insertAngle) * this.target.innerRadius,
            angle: this.knife.insertAngle,
            rotation: this.target.rotation
        });
        
        this.createHitParticles(
            this.target.x + Math.cos(this.knife.insertAngle) * this.target.radius,
            this.target.y + Math.sin(this.knife.insertAngle) * this.target.radius
        );
        
        this.createNeonExplosion(
            this.target.x + Math.cos(this.knife.insertAngle) * this.target.innerRadius,
            this.target.y + Math.sin(this.knife.insertAngle) * this.target.innerRadius
        );
        
        this.knivesLeft--;
        this.score += 100;
        
        AudioManager.playHit();
        UIManager.updateGameHUD(this.currentLevel.id, this.knivesLeft);
        UIManager.updateGameScore(this.score);
        
        this.resetKnife();
        
        if (this.knivesOnTarget.length >= this.currentLevel.targetKnives) {
            this.levelComplete();
        } else if (this.knivesLeft <= 0 && this.knivesOnTarget.length < this.currentLevel.targetKnives) {
            this.gameOver('飞刀用完了！');
        }
    },
    
    resetKnife() {
        this.knife.throwing = false;
        this.knife.isInserting = false;
        this.knife.isSpecial = false;
        this.knife.insertProgress = 0;
        this.knife.x = this.width / 2;
        this.knife.y = this.knife.startY;
        this.knife.trail = [];
        this.knife.vx = 0;
        this.knife.vy = 0;
    },
    
    checkCollision() {
        const dx = this.knife.x - this.target.x;
        const dy = this.knife.y - this.target.y;
        const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
        
        if (distanceFromCenter <= this.target.radius && distanceFromCenter >= this.target.innerRadius) {
            const hitAngle = Math.atan2(dy, dx);
            
            // 特殊飞刀穿透效果
            if (this.knife.isSpecial) {
                this.startInsertion(hitAngle);
                return;
            }
            
            // 检查与已有的飞刀碰撞
            const collisionBuffer = this.knife.width * 2.8; // 增加碰撞缓冲
            for (let knife of this.knivesOnTarget) {
                let knifeAngle = knife.angle - this.target.rotation;
                
                while (knifeAngle < 0) knifeAngle += Math.PI * 2;
                while (knifeAngle > Math.PI * 2) knifeAngle -= Math.PI * 2;
                
                // 计算角度差
                let angleDiff = Math.abs(hitAngle - knifeAngle);
                if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;
                
                // 角度碰撞检测
                const minAngle = collisionBuffer / this.target.innerRadius;
                if (angleDiff < minAngle) {
                    this.gameOver('飞刀碰撞了！');
                    return;
                }
            }
            
            this.startInsertion(hitAngle);
        } else if (this.knife.y <= this.target.y + this.target.radius && 
                     distanceFromCenter > this.target.radius * 1.8 &&
                     this.knife.y < this.target.y - this.target.radius * 0.3) {
            this.knifeMiss();
        }
    },
    
    startInsertion(hitAngle) {
        this.knife.throwing = false;
        this.knife.isInserting = true;
        this.knife.insertAngle = hitAngle;
        this.knife.insertProgress = 0;
    },
    
    updateBackgroundStars() {
        const time = Date.now() / 800;
        for (let star of this.backgroundStars) {
            star.y += star.speed;
            if (star.y > this.height) {
                star.y = 0;
                star.x = Math.random() * this.width;
                star.color = ['#ff00de', '#00ffff', '#ffffff', '#8a2be2'][Math.floor(Math.random() * 4)];
            }
            
            star.pulse += star.pulseSpeed;
            // 减少三角函数计算频率
            if (Date.now() % 50 < 10) {
                star.opacity = 0.3 + Math.sin(star.pulse) * 0.3 + Math.sin(time + star.x) * 0.2;
            }
        }
    },
    
    updateParticles() {
        // 限制最大粒子数量
        if (this.particles.length > this.performance.particleLimit) {
            this.particles.splice(0, this.particles.length - this.performance.particleLimit);
        }
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay || 0.02;
            p.vy += p.gravity || 0.1;
            p.size *= p.shrink || 0.98;
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    },
    
    createHitParticles(x, y) {
        const particleCount = this.performance.isLowEnd ? 15 : 25;
        const ringCount = this.performance.isLowEnd ? 8 : 12;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 8 + 4;
            const colors = [this.colors.neonCyan, this.colors.neonPink, '#ffffff', this.colors.neonYellow, this.colors.neonPurple];
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                decay: 0.025,
                gravity: 0.15,
                shrink: 0.96,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 6 + 3,
                type: 'spark'
            });
        }
        
        for (let i = 0; i < ringCount; i++) {
            const angle = (Math.PI * 2 / ringCount) * i;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * 10,
                vy: Math.sin(angle) * 10,
                life: 1.5,
                decay: 0.02,
                gravity: 0.05,
                shrink: 0.97,
                color: '#ffffff',
                size: 4,
                type: 'ring'
            });
        }
    },
    
    createNeonExplosion(x, y) {
        const explosionCount = this.performance.isLowEnd ? 10 : 15;
        for (let i = 0; i < explosionCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 12 + 8;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.2,
                decay: 0.03,
                gravity: 0.1,
                shrink: 0.95,
                color: ['#ff00de', '#00ffff', '#8a2be2', '#ffd700'][Math.floor(Math.random() * 4)],
                size: Math.random() * 4 + 2,
                type: 'neon'
            });
        }
    },
    
    createThrowParticles(x, y) {
        const throwCount = this.performance.isLowEnd ? 5 : 8;
        for (let i = 0; i < throwCount; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 20,
                y: y,
                vx: (Math.random() - 0.5) * 3,
                vy: Math.random() * 2 + 1,
                life: 0.8,
                decay: 0.04,
                gravity: 0.1,
                shrink: 0.95,
                color: this.colors.neonCyan,
                size: Math.random() * 4 + 2,
                type: 'throw'
            });
        }
    },
    
    createTrailParticle(x, y) {
        this.particles.push({
            x: x + (Math.random() - 0.5) * 5,
            y: y + (Math.random() - 0.5) * 5,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            life: 0.8,
            decay: 0.08,
            size: Math.random() * 2 + 1,
            color: this.colors.neonCyan,
            shrink: 0.95,
            type: 'trail'
        });
    },
    
    knifeHit() {
        // 特殊飞刀效果
        if (this.knife.isSpecial) {
            this.createNeonExplosion(this.knife.x, this.knife.y);
        } else {
            this.createHitParticles(this.knife.x, this.knife.y);
        }
        
        this.knivesOnTarget.push({
            x: this.knife.x,
            y: this.knife.y,
            angle: this.target.rotation,
            isSpecial: this.knife.isSpecial
        });
        
        // 连击系统
        this.combo++;
        if (this.combo > this.maxCombo) {
            this.maxCombo = this.combo;
        }
        
        // 特殊飞刀得分加成
        const baseScore = this.knife.isSpecial ? 200 : 100;
        const comboBonus = Math.min(this.combo * 10, 100);
        const specialBonus = this.knife.isSpecial ? 50 : 0;
        this.score += baseScore + comboBonus + specialBonus;
        
        // 特殊飞刀充能
        if (this.combo >= 3) {
            this.specialKnifeCharges = Math.min(this.specialKnifeCharges + 1, 3);
        }
        
        AudioManager.playHit();
        if (this.knife.isSpecial) {
            AudioManager.playSpecial();
        }
        UIManager.updateGameHUD(this.currentLevel.id, this.knivesLeft);
        UIManager.updateGameScore(this.score);
        UIManager.updateCombo(this.combo);
        UIManager.updateSpecialKnifeCharges(this.specialKnifeCharges);
        
        this.resetKnife();
        
        if (this.knivesOnTarget.length >= this.currentLevel.targetKnives) {
            this.levelComplete();
        } else if (this.knivesLeft <= 0 && this.knivesOnTarget.length < this.currentLevel.targetKnives) {
            this.gameOver('飞刀用完了！');
        }
    },
    
    knifeMiss() {
        AudioManager.playMiss();
        this.gameOver('飞刀未命中！');
    },
    
    levelComplete() {
        this.gameState = 'victory';
        
        const bonus = this.knivesLeft * this.currentLevel.rewards.bonusPerKnife;
        const totalScore = this.score + bonus;
        
        LevelManager.completeLevel(this.currentLevel.id, totalScore);
        LevelManager.setHighScore(totalScore);
        LevelManager.deactivateAssistLine();
        UIManager.updateHomeScreen();
        UIManager.hideAssistItem();
        
        AudioManager.stopBGM();
        AudioManager.playVictory();
        
        UIManager.showVictory(totalScore, bonus);
    },
    
    gameOver(message) {
        this.gameState = 'gameover';
        
        // 重置连击
        this.combo = 0;
        this.specialKnifeCharges = 0;
        
        AudioManager.stopBGM();
        AudioManager.playFail();
        
        UIManager.showGameOver(message);
        UIManager.updateCombo(0);
        UIManager.updateSpecialKnifeCharges(0);
    },
    
    revive() {
        this.knivesLeft = Math.max(3, this.currentLevel.knifeCount - this.knivesOnTarget.length);
        this.resetKnife();
        this.gameState = 'playing';
        
        UIManager.updateGameHUD(this.currentLevel.id, this.knivesLeft);
        AudioManager.startBGM();
    },
    
    restart() {
        LevelManager.deactivateAssistLine();
        this.startLevel();
    },
    
    pause() {
        this.gameState = 'paused';
        AudioManager.stopBGM();
    },
    
    resume() {
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
            AudioManager.startBGM();
        }
    },
    
    stop() {
        this.gameState = 'idle';
        AudioManager.stopBGM();
    },
    
    activateAssistLine() {
        this.aimLine.active = true;
    },
    
    render() {
        const ctx = this.ctx;
        
        this.drawCyberBackground();
        this.drawBackgroundStars();
        this.drawNeonGrid();
        this.drawTarget();
        this.drawKnivesOnTarget();
        this.drawParticles();
        this.drawKnifeTrail();
        
        if (this.knife.isInserting) {
            this.drawInsertingKnife();
        } else {
            this.drawNeonKnife();
        }
        
        if (LevelManager.shouldShowAssistLine()) {
            this.drawAssistLine();
        }
        
        this.drawScanlines();
        this.drawVignette();
    },
    
    drawCyberBackground() {
        const ctx = this.ctx;
        
        const bgGradient = ctx.createRadialGradient(
            this.width / 2, 
            this.height * 0.3, 
            0,
            this.width / 2, 
            this.height * 0.3, 
            this.height
        );
        bgGradient.addColorStop(0, '#1a0033');
        bgGradient.addColorStop(0.3, '#0f001a');
        bgGradient.addColorStop(0.7, '#0a0015');
        bgGradient.addColorStop(1, '#05000a');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, this.width, this.height);
        
        const time = Date.now() / 3000;
        const glowX = this.width / 2 + Math.sin(time) * 100;
        const glowY = this.height * 0.3 + Math.cos(time * 0.7) * 50;
        
        const ambientGlow = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, this.height * 0.6);
        ambientGlow.addColorStop(0, 'rgba(138, 43, 226, 0.15)');
        ambientGlow.addColorStop(0.5, 'rgba(255, 0, 222, 0.08)');
        ambientGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = ambientGlow;
        ctx.fillRect(0, 0, this.width, this.height);
    },
    
    drawNeonGrid() {
        const ctx = this.ctx;
        const gridSize = 60;
        const offsetY = this.gridOffset % gridSize;
        
        ctx.strokeStyle = this.colors.gridLine;
        ctx.lineWidth = 0.5;
        
        for (let x = 0; x < this.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.height);
            ctx.stroke();
        }
        
        for (let y = -gridSize + offsetY; y < this.height + gridSize; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.width, y);
            ctx.stroke();
        }
        
        const horizonGlow = ctx.createLinearGradient(0, this.height * 0.6, 0, this.height * 0.65);
        horizonGlow.addColorStop(0, 'transparent');
        horizonGlow.addColorStop(0.5, 'rgba(255, 0, 222, 0.1)');
        horizonGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = horizonGlow;
        ctx.fillRect(0, this.height * 0.6, this.width, this.height * 0.05);
    },
    
    drawBackgroundStars() {
        const ctx = this.ctx;
        
        for (let star of this.backgroundStars) {
            ctx.save();
            ctx.shadowColor = star.color;
            ctx.shadowBlur = 8;
            
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fillStyle = star.color;
            ctx.globalAlpha = star.opacity;
            ctx.fill();
            
            ctx.globalAlpha = star.opacity * 0.3;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }
    },
    
    drawTarget() {
        const ctx = this.ctx;
        const { x, y, radius, innerRadius, rotation } = this.target;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        
        ctx.shadowColor = `rgba(138, 43, 226, ${0.8 + Math.sin(Date.now() / 400) * 0.2})`;
        ctx.shadowBlur = 50 + Math.sin(Date.now() / 500) * 10;
        
        const outerGradient = ctx.createRadialGradient(0, 0, innerRadius * 0.7, 0, 0, radius);
        outerGradient.addColorStop(0, '#9b4dca');
        outerGradient.addColorStop(0.2, '#8a2be2');
        outerGradient.addColorStop(0.45, '#6a1b9a');
        outerGradient.addColorStop(0.7, '#4a148c');
        outerGradient.addColorStop(0.9, '#2a0845');
        outerGradient.addColorStop(1, '#1a0033');
        
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.arc(0, 0, innerRadius, 0, Math.PI * 2, true);
        ctx.fillStyle = outerGradient;
        ctx.fill();
        
        const pulseIntensity = 0.7 + Math.sin(Date.now() / 350) * 0.3;
        ctx.strokeStyle = `rgba(255, 0, 222, ${pulseIntensity})`;
        ctx.lineWidth = 3;
        ctx.shadowColor = `rgba(255, 0, 222, ${pulseIntensity})`;
        ctx.shadowBlur = 30 + Math.sin(Date.now() / 400) * 10;
        ctx.stroke();
        
        this.drawAnimatedRings(innerRadius, radius);
        this.drawRadialLines(innerRadius, radius);
        this.drawHexagonPattern(innerRadius, radius);
        
        ctx.shadowColor = `rgba(0, 255, 255, ${0.9 + Math.sin(Date.now() / 350) * 0.1})`;
        ctx.shadowBlur = 50 + Math.sin(Date.now() / 450) * 15;
        
        const innerGradient = ctx.createRadialGradient(-innerRadius * 0.15, -innerRadius * 0.15, 0, 0, 0, innerRadius);
        innerGradient.addColorStop(0, '#ffffff');
        innerGradient.addColorStop(0.15, '#e0ffff');
        innerGradient.addColorStop(0.3, '#00ffff');
        innerGradient.addColorStop(0.5, '#00bcd4');
        innerGradient.addColorStop(0.7, '#0097a7');
        innerGradient.addColorStop(0.85, '#006064');
        innerGradient.addColorStop(1, '#004d40');
        
        ctx.beginPath();
        ctx.arc(0, 0, innerRadius, 0, Math.PI * 2);
        ctx.fillStyle = innerGradient;
        ctx.fill();
        
        const cyanPulse = 0.75 + Math.sin(Date.now() / 380) * 0.25;
        ctx.strokeStyle = `rgba(0, 255, 255, ${cyanPulse})`;
        ctx.lineWidth = 3;
        ctx.shadowColor = `rgba(0, 255, 255, ${cyanPulse})`;
        ctx.shadowBlur = 35 + Math.sin(Date.now() / 420) * 12;
        ctx.stroke();
        
        this.drawInnerDecorations(innerRadius);
        this.drawCoreEnergy(innerRadius);
        
        ctx.restore();
    },
    
    drawAnimatedRings(innerRadius, radius) {
        const ctx = this.ctx;
        
        for (let ring = 0; ring < 5; ring++) {
            const r = innerRadius + (radius - innerRadius) * ((ring + 1) / 6);
            const alpha = 0.18 + (ring % 2) * 0.12 + Math.sin(Date.now() / 400 + ring) * 0.05;
            const pulseWidth = 1 + Math.sin(Date.now() / 350 + ring * 0.5) * 0.5;
            
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(138, 43, 226, ${alpha})`;
            ctx.lineWidth = pulseWidth;
            ctx.shadowColor = `rgba(138, 43, 226, ${alpha * 0.8})`;
            ctx.shadowBlur = 10;
            ctx.stroke();
        }
    },
    
    drawRadialLines(innerRadius, radius) {
        const ctx = this.ctx;
        const lineCount = 32;
        
        for (let i = 0; i < lineCount; i++) {
            const angle = (Math.PI * 2 / lineCount) * i;
            const pulseOffset = Math.sin(Date.now() / 400 + i * 0.3) * 0.03;
            const waveOffset = Math.sin(Date.now() / 250 + i * 0.8) * 0.01;
            
            const innerPoint = {
                x: Math.cos(angle + pulseOffset) * (innerRadius + 4),
                y: Math.sin(angle + pulseOffset) * (innerRadius + 4)
            };
            const outerPoint = {
                x: Math.cos(angle + waveOffset) * (radius - 4),
                y: Math.sin(angle + waveOffset) * (radius - 4)
            };
            
            const alpha = 0.45 + Math.sin(Date.now() / 280 + i * 0.6) * 0.25;
            const lineWidth = 1.2 + Math.sin(Date.now() / 320 + i) * 0.4;
            
            ctx.beginPath();
            ctx.moveTo(innerPoint.x, innerPoint.y);
            ctx.lineTo(outerPoint.x, outerPoint.y);
            ctx.strokeStyle = `rgba(255, 0, 222, ${alpha})`;
            ctx.lineWidth = lineWidth;
            ctx.shadowColor = `rgba(255, 0, 222, ${alpha})`;
            ctx.shadowBlur = 12 + Math.sin(Date.now() / 350 + i) * 4;
            ctx.stroke();
        }
    },
    
    drawHexagonPattern(innerRadius, radius) {
        const ctx = this.ctx;
        const midRadius = (innerRadius + radius) / 2;
        const hexSize = (radius - innerRadius) * 0.18;
        
        for (let ring = 0; ring < 3; ring++) {
            const r = midRadius + (ring - 1) * ((radius - innerRadius) * 0.2);
            const hexCount = Math.floor((Math.PI * 2 * r) / (hexSize * 2));
            
            for (let i = 0; i < hexCount; i++) {
                const angle = (Math.PI * 2 / hexCount) * i + Date.now() / 8000 * (ring % 2 ? 1 : -1);
                const hx = Math.cos(angle) * r;
                const hy = Math.sin(angle) * r;
                const alpha = 0.25 + Math.sin(Date.now() / 400 + i + ring) * 0.15;
                
                this.drawHexagon(hx, hy, hexSize * 0.6, alpha);
            }
        }
    },
    
    drawHexagon(x, y, size, alpha) {
        const ctx = this.ctx;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            const px = x + Math.cos(angle) * size;
            const py = y + Math.sin(angle) * size;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(0, 255, 255, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.shadowColor = `rgba(0, 255, 255, ${alpha * 0.6})`;
        ctx.shadowBlur = 6;
        ctx.stroke();
    },
    
    drawInnerDecorations(innerRadius) {
        const ctx = this.ctx;
        
        for (let ring = 1; ring <= 10; ring++) {
            const r = innerRadius * (ring / 11);
            const alpha = 0.14 + (ring % 2) * 0.09 + Math.sin(Date.now() / 420 + ring * 0.4) * 0.06;
            
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(0, 255, 255, ${alpha})`;
            ctx.lineWidth = 0.8 + (ring % 3) * 0.3;
            ctx.shadowColor = `rgba(0, 255, 255, ${alpha * 0.5})`;
            ctx.stroke();
        }
        
        const dotCount = 16;
        for (let i = 0; i < dotCount; i++) {
            const angle = (Math.PI * 2 / dotCount) * i;
            const dist = innerRadius * 0.72;
            const size = 3 + Math.sin(i * 4 + Date.now() / 350) * 1.5;
            const pulseAlpha = 0.55 + Math.sin(Date.now() / 380 + i * 0.7) * 0.35;
            
            ctx.beginPath();
            ctx.arc(
                Math.cos(angle) * dist,
                Math.sin(angle) * dist,
                size,
                0,
                Math.PI * 2
            );
            ctx.fillStyle = `rgba(0, 255, 255, ${pulseAlpha})`;
            ctx.shadowColor = `rgba(0, 255, 255, ${pulseAlpha})`;
            ctx.shadowBlur = 18 + Math.sin(Date.now() / 400 + i) * 6;
            ctx.fill();
        }
        
        const triangleCount = 8;
        for (let i = 0; i < triangleCount; i++) {
            const angle = (Math.PI * 2 / triangleCount) * i + Date.now() / 6000;
            const dist = innerRadius * 0.42;
            const size = innerRadius * 0.12;
            const alpha = 0.28 + Math.sin(Date.now() / 450 + i * 0.9) * 0.18;
            
            this.drawTriangle(
                Math.cos(angle) * dist,
                Math.sin(angle) * dist,
                size,
                angle,
                alpha
            );
        }
    },
    
    drawTriangle(x, y, size, rotation, alpha) {
        const ctx = this.ctx;
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
            const angle = rotation + (Math.PI * 2 / 3) * i;
            const px = x + Math.cos(angle) * size;
            const py = y + Math.sin(angle) * size;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(255, 215, 0, ${alpha})`;
        ctx.lineWidth = 1.2;
        ctx.shadowColor = `rgba(255, 215, 0, ${alpha * 0.7})`;
        ctx.shadowBlur = 8;
        ctx.stroke();
    },
    
    drawCoreEnergy(innerRadius) {
        const ctx = this.ctx;
        
        const corePulse = 0.38 + Math.sin(Date.now() / 380) * 0.17;
        ctx.globalAlpha = corePulse;
        
        const coreGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, innerRadius * 0.55);
        coreGlow.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
        coreGlow.addColorStop(0.3, 'rgba(0, 255, 255, 0.35)');
        coreGlow.addColorStop(0.6, 'rgba(255, 0, 222, 0.18)');
        coreGlow.addColorStop(1, 'transparent');
        
        ctx.beginPath();
        ctx.arc(0, 0, innerRadius * 0.55, 0, Math.PI * 2);
        ctx.fillStyle = coreGlow;
        ctx.fill();
        
        ctx.globalAlpha = 1;
        
        const energyRings = 3;
        for (let i = 0; i < energyRings; i++) {
            const r = innerRadius * (0.15 + i * 0.12);
            const rotationOffset = Date.now() / (2000 + i * 500) * (i % 2 ? 1 : -1);
            const alpha = 0.45 + Math.sin(Date.now() / 350 + i * 2) * 0.25;
            
            ctx.save();
            ctx.rotate(rotationOffset);
            
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 1.4);
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.lineWidth = 2;
            ctx.shadowColor = `rgba(255, 255, 255, ${alpha})`;
            ctx.shadowBlur = 15;
            ctx.stroke();
            
            ctx.restore();
        }
    },
    
    drawKnivesOnTarget() {
        const ctx = this.ctx;
        const { x, y, innerRadius, rotation } = this.target;
        
        for (let knife of this.knivesOnTarget) {
            const displayAngle = knife.angle - rotation;
            
            const knifeX = x + Math.cos(displayAngle) * innerRadius;
            const knifeY = y + Math.sin(displayAngle) * innerRadius;
            
            ctx.save();
            ctx.translate(knifeX, knifeY);
            ctx.rotate(displayAngle + Math.PI / 2);
            
            const glowIntensity = 0.8 + Math.sin(Date.now() / 350) * 0.2;
            ctx.shadowColor = `rgba(0, 255, 255, ${glowIntensity})`;
            ctx.shadowBlur = 20 + Math.sin(Date.now() / 400) * 8;
            
            const bladeGradient = ctx.createLinearGradient(-this.knife.height * 0.35, 0, this.knife.height * 0.45, 0);
            bladeGradient.addColorStop(0, '#0066cc');
            bladeGradient.addColorStop(0.15, '#0088ff');
            bladeGradient.addColorStop(0.35, '#00cccc');
            bladeGradient.addColorStop(0.5, '#00ffff');
            bladeGradient.addColorStop(0.65, '#ffffff');
            bladeGradient.addColorStop(0.8, '#00ffff');
            bladeGradient.addColorStop(1, '#0088ff');
            
            ctx.beginPath();
            ctx.moveTo(-this.knife.height * 0.35, 0);
            ctx.lineTo(-this.knife.height * 0.15, -this.knife.width * 0.45);
            ctx.lineTo(this.knife.height * 0.45, -this.knife.width * 0.35);
            ctx.lineTo(this.knife.height * 0.5, 0);
            ctx.lineTo(this.knife.height * 0.45, this.knife.width * 0.35);
            ctx.lineTo(-this.knife.height * 0.15, this.knife.width * 0.45);
            ctx.closePath();
            ctx.fillStyle = bladeGradient;
            ctx.fill();
            
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 1.5;
            ctx.shadowColor = 'rgba(0, 255, 255, 0.9)';
            ctx.shadowBlur = 12;
            ctx.stroke();
            
            ctx.shadowColor = 'rgba(255, 255, 255, 0.7)';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.moveTo(-this.knife.height * 0.25, 0);
            ctx.lineTo(this.knife.height * 0.3, 0);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            const handleGradient = ctx.createLinearGradient(-this.knife.height * 0.45, 0, -this.knife.height * 0.3, 0);
            handleGradient.addColorStop(0, '#8a2be2');
            handleGradient.addColorStop(0.5, '#ff00de');
            handleGradient.addColorStop(1, '#8a2be2');
            
            ctx.beginPath();
            ctx.roundRect(-this.knife.height * 0.45, -this.knife.width * 0.38, this.knife.height * 0.15, this.knife.width * 0.76, 2);
            ctx.fillStyle = handleGradient;
            ctx.shadowColor = 'rgba(255, 0, 222, 0.8)';
            ctx.shadowBlur = 10;
            ctx.fill();
            
            ctx.restore();
        }
    },
    
    drawNeonKnife() {
        const ctx = this.ctx;
        const { x, y, width, height } = this.knife;
        
        ctx.save();
        ctx.translate(x, y);
        
        const floatOffset = Math.sin(Date.now() / 350) * 4;
        ctx.translate(0, floatOffset);
        
        const glowPulse = 0.85 + Math.sin(Date.now() / 320) * 0.15;
        ctx.shadowColor = `rgba(255, 0, 222, ${glowPulse})`;
        ctx.shadowBlur = 30 + Math.sin(Date.now() / 380) * 12;
        
        const bladeGradient = ctx.createLinearGradient(-height * 0.35, 0, height * 0.45, 0);
        bladeGradient.addColorStop(0, '#cc00aa');
        bladeGradient.addColorStop(0.15, '#ff00de');
        bladeGradient.addColorStop(0.35, '#ff66ee');
        bladeGradient.addColorStop(0.5, '#ffffff');
        bladeGradient.addColorStop(0.65, '#ff66ee');
        bladeGradient.addColorStop(0.8, '#ff00de');
        bladeGradient.addColorStop(1, '#cc00aa');
        
        ctx.beginPath();
        ctx.moveTo(-height * 0.35, 0);
        ctx.lineTo(-height * 0.15, -width * 0.48);
        ctx.lineTo(height * 0.45, -width * 0.36);
        ctx.lineTo(height * 0.5, 0);
        ctx.lineTo(height * 0.45, width * 0.36);
        ctx.lineTo(-height * 0.15, width * 0.48);
        ctx.closePath();
        ctx.fillStyle = bladeGradient;
        ctx.fill();
        
        ctx.strokeStyle = '#ff00de';
        ctx.lineWidth = 2;
        ctx.shadowColor = 'rgba(255, 0, 222, 1)';
        ctx.shadowBlur = 18;
        ctx.stroke();
        
        ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(-height * 0.25, 0);
        ctx.lineTo(height * 0.32, 0);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        const energyOrbs = 3;
        for (let i = 0; i < energyOrbs; i++) {
            const orbY = -height * 0.15 + (i * height * 0.2);
            const orbAlpha = 0.5 + Math.sin(Date.now() / 280 + i * 2) * 0.4;
            const orbSize = 2 + Math.sin(Date.now() / 320 + i) * 1;
            
            ctx.beginPath();
            ctx.arc(0, orbY, orbSize, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${orbAlpha})`;
            ctx.shadowColor = `rgba(255, 255, 255, ${orbAlpha})`;
            ctx.shadowBlur = 12;
            ctx.fill();
        }
        
        const handleGradient = ctx.createLinearGradient(-height * 0.45, 0, -height * 0.3, 0);
        handleGradient.addColorStop(0, '#8a2be2');
        handleGradient.addColorStop(0.3, '#ff00de');
        handleGradient.addColorStop(0.7, '#ff00de');
        handleGradient.addColorStop(1, '#8a2be2');
        
        ctx.beginPath();
        ctx.roundRect(-height * 0.45, -width * 0.4, height * 0.15, width * 0.8, 3);
        ctx.fillStyle = handleGradient;
        ctx.shadowColor = 'rgba(255, 0, 222, 0.9)';
        ctx.shadowBlur = 15;
        ctx.fill();
        
        ctx.strokeStyle = '#ff66ee';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = 'rgba(255, 102, 238, 0.8)';
        ctx.shadowBlur = 8;
        ctx.stroke();
        
        const auraAlpha = 0.18 + Math.sin(Date.now() / 380) * 0.08;
        const auraGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, height * 0.6);
        auraGradient.addColorStop(0, `rgba(255, 0, 222, ${auraAlpha})`);
        auraGradient.addColorStop(0.5, `rgba(138, 43, 226, ${auraAlpha * 0.5})`);
        auraGradient.addColorStop(1, 'transparent');
        
        ctx.beginPath();
        ctx.arc(0, 0, height * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = auraGradient;
        ctx.fill();
        
        ctx.restore();
    },
    
    drawKnifeTrail() {
        const ctx = this.ctx;
        
        for (let i = 0; i < this.knife.trail.length; i++) {
            const point = this.knife.trail[i];
            const alpha = (i / this.knife.trail.length) * 0.7;
            const size = point.size * (i / this.knife.trail.length);
            
            ctx.save();
            ctx.shadowColor = `rgba(255, 0, 222, ${alpha})`;
            ctx.shadowBlur = 15;
            
            ctx.beginPath();
            ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 0, 222, ${alpha})`;
            ctx.globalAlpha = alpha;
            ctx.fill();
            
            ctx.globalAlpha = alpha * 0.4;
            ctx.beginPath();
            ctx.arc(point.x, point.y, size * 2, 0, Math.PI * 2);
            ctx.fillStyle = '#ff00de';
            ctx.fill();
            
            ctx.restore();
        }
    },
    
    drawInsertingKnife() {
        const ctx = this.ctx;
        const { x, y, innerRadius, rotation } = this.target;
        
        const displayAngle = this.knife.insertAngle - rotation;
        const progress = this.knife.insertProgress;
        
        const currentX = x + Math.cos(this.knife.insertAngle) * (innerRadius + (this.target.radius - innerRadius) * (1 - progress));
        const currentY = y + Math.sin(this.knife.insertAngle) * (innerRadius + (this.target.radius - innerRadius) * (1 - progress));
        
        ctx.save();
        ctx.translate(currentX, currentY);
        ctx.rotate(displayAngle + Math.PI / 2);
        
        const impactGlow = 1 + Math.sin(progress * Math.PI * 4) * 0.5;
        ctx.shadowColor = `rgba(0, 255, 255, ${impactGlow})`;
        ctx.shadowBlur = 25 + progress * 15;
        
        const bladeGradient = ctx.createLinearGradient(-this.knife.height * 0.35, 0, this.knife.height * 0.45, 0);
        bladeGradient.addColorStop(0, '#0066cc');
        bladeGradient.addColorStop(0.15, '#0088ff');
        bladeGradient.addColorStop(0.35, '#00cccc');
        bladeGradient.addColorStop(0.5, '#00ffff');
        bladeGradient.addColorStop(0.65, '#ffffff');
        bladeGradient.addColorStop(0.8, '#00ffff');
        bladeGradient.addColorStop(1, '#0088ff');
        
        ctx.beginPath();
        ctx.moveTo(-this.knife.height * 0.35, 0);
        ctx.lineTo(-this.knife.height * 0.15, -this.knife.width * 0.48);
        ctx.lineTo(this.knife.height * 0.45, -this.knife.width * 0.36);
        ctx.lineTo(this.knife.height * 0.5, 0);
        ctx.lineTo(this.knife.height * 0.45, this.knife.width * 0.36);
        ctx.lineTo(-this.knife.height * 0.15, this.knife.width * 0.48);
        ctx.closePath();
        ctx.fillStyle = bladeGradient;
        ctx.fill();
        
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.shadowColor = 'rgba(0, 255, 255, 1)';
        ctx.shadowBlur = 20;
        ctx.stroke();
        
        if (progress < 0.7) {
            const sparkCount = 5;
            for (let i = 0; i < sparkCount; i++) {
                const sparkAngle = Math.random() * Math.PI * 2;
                const sparkDist = Math.random() * 20 + 10;
                const sparkAlpha = (1 - progress) * Math.random();
                
                ctx.beginPath();
                ctx.arc(
                    Math.cos(sparkAngle) * sparkDist,
                    Math.sin(sparkAngle) * sparkDist,
                    Math.random() * 3 + 1,
                    0,
                    Math.PI * 2
                );
                ctx.fillStyle = `rgba(0, 255, 255, ${sparkAlpha})`;
                ctx.shadowColor = `rgba(0, 255, 255, ${sparkAlpha})`;
                ctx.shadowBlur = 10;
                ctx.fill();
            }
        }
        
        ctx.restore();
    },
    
    drawParticles() {
        const ctx = this.ctx;
        
        for (let p of this.particles) {
            ctx.save();
            ctx.globalAlpha = p.life;
            
            if (p.glow || p.type === 'neon' || p.type === 'trail') {
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 20 + Math.random() * 10;
            }
            
            if (p.type === 'spark' || p.type === 'throw') {
                // 主粒子
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
                
                // 光晕效果
                ctx.globalAlpha = p.life * 0.4;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
                
                // 外光晕
                ctx.globalAlpha = p.life * 0.15;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
            } else if (p.type === 'ring') {
                // 环形粒子
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.strokeStyle = p.color;
                ctx.lineWidth = 2 + Math.sin(Date.now() / 100) * 0.5;
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 15;
                ctx.stroke();
                
                // 内圈
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
                ctx.strokeStyle = p.color;
                ctx.lineWidth = 1;
                ctx.stroke();
            } else if (p.type === 'neon') {
                // 霓虹粒子
                const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
                gradient.addColorStop(0, p.color);
                gradient.addColorStop(0.3, p.color.replace(')', ', 0.7)').replace('rgb', 'rgba'));
                gradient.addColorStop(0.7, p.color.replace(')', ', 0.3)').replace('rgb', 'rgba'));
                gradient.addColorStop(1, 'transparent');
                
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();
            } else if (p.type === 'trail') {
                // 轨迹粒子
                const gradient = ctx.createLinearGradient(
                    p.x - p.vx * 5, p.y - p.vy * 5,
                    p.x, p.y
                );
                gradient.addColorStop(0, 'transparent');
                gradient.addColorStop(0.5, p.color);
                gradient.addColorStop(1, p.color.replace(')', ', 0.6)').replace('rgb', 'rgba'));
                
                ctx.beginPath();
                ctx.moveTo(p.x - p.vx * 5, p.y - p.vy * 5);
                ctx.lineTo(p.x, p.y);
                ctx.strokeStyle = gradient;
                ctx.lineWidth = p.size * 2;
                ctx.lineCap = 'round';
                ctx.stroke();
                
                // 终点粒子
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
            }
            
            ctx.restore();
        }
    },
    
    drawAssistLine() {
        const ctx = this.ctx;
        const { x, y, innerRadius } = this.target;
        
        ctx.save();
        ctx.setLineDash([8, 8]);
        ctx.lineDashOffset = -Date.now() / 50;
        
        const gradient = ctx.createLinearGradient(x, this.knife.y, x, y);
        gradient.addColorStop(0, 'rgba(0, 255, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 0, 222, 0.6)');
        gradient.addColorStop(1, 'rgba(0, 255, 255, 0.3)');
        
        ctx.beginPath();
        ctx.moveTo(x, this.knife.y);
        ctx.lineTo(x, y - innerRadius);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.shadowColor = 'rgba(0, 255, 255, 0.8)';
        ctx.shadowBlur = 10;
        ctx.stroke();
        
        ctx.setLineDash([]);
        
        ctx.beginPath();
        ctx.arc(x, y - innerRadius, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#00ffff';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 15;
        ctx.fill();
        
        ctx.restore();
    },
    
    drawScanlines() {
        const ctx = this.ctx;
        const scanlineSpacing = 4;
        const alpha = 0.03;
        
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        for (let y = 0; y < this.height; y += scanlineSpacing) {
            ctx.fillRect(0, y, this.width, 1);
        }
    },
    
    drawVignette() {
        const ctx = this.ctx;
        const vignette = ctx.createRadialGradient(
            this.width / 2,
            this.height / 2,
            this.height * 0.3,
            this.width / 2,
            this.height / 2,
            this.height * 0.8
        );
        vignette.addColorStop(0, 'transparent');
        vignette.addColorStop(0.7, 'transparent');
        vignette.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
        
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, this.width, this.height);
    },
    
    gameLoop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        this.update(deltaTime);
        this.render();
        
        this.animationId = requestAnimationFrame((t) => this.gameLoop(t));
    }
};

window.Game = Game;