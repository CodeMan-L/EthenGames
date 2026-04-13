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
    
    wheel: {
        x: 0,
        y: 0,
        radius: 0,
        rotation: 0,
        speed: 0,
        baseRadius: 0
    },
    
    knife: {
        x: 0,
        y: 0,
        width: 10,
        height: 55,
        throwing: false,
        speed: 0,
        startY: 0,
        trail: [],
        rotation: 0,
        targetRotation: 0
    },
    
    colors: {
        wheel: '#ff00de',
        wheelGlow: 'rgba(255, 0, 222, 0.3)',
        knife: '#00ffff',
        knifeGlow: 'rgba(0, 255, 255, 0.5)',
        background: '#0a0a0f'
    },
    
    particles: [],
    backgroundStars: [],
    
    animationId: null,
    lastTime: 0,
    
    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleClick(e.touches[0]);
        }, { passive: false });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        this.canvas.addEventListener('mousemove', (e) => {
            e.preventDefault();
        });
        
        this.initBackgroundStars();
        
        AudioManager.init();
        LevelManager.init();
        UIManager.init();
        
        this.gameLoop(0);
    },
    
    initBackgroundStars() {
        this.backgroundStars = [];
        for (let i = 0; i < 50; i++) {
            this.backgroundStars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * 0.5 + 0.1,
                opacity: Math.random() * 0.5 + 0.3
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
        
        this.wheel.x = this.width / 2;
        this.wheel.y = this.height * 0.32;
        this.wheel.baseRadius = Math.min(this.width, this.height) * 0.25;
        this.wheel.radius = this.wheel.baseRadius;
        
        this.knife.x = this.width / 2;
        this.knife.y = this.height * 0.78;
        this.knife.startY = this.height * 0.78;
        this.knife.rotation = 0;
        this.knife.targetRotation = 0;
        
        this.initBackgroundStars();
    },
    
    startLevel() {
        this.currentLevel = LevelManager.getCurrentLevel();
        this.knivesLeft = this.currentLevel.knifeCount;
        this.knivesOnTarget = [];
        this.particles = [];
        this.knife.trail = [];
        this.knife.rotation = 0;
        this.knife.targetRotation = 0;
        this.score = 0;
        this.wheel.rotation = 0;
        this.wheel.speed = this.currentLevel.rotationSpeed;
        this.knife.throwing = false;
        this.knife.y = this.knife.startY;
        
        this.gameState = 'playing';
        
        UIManager.updateGameHUD(this.currentLevel.id, this.knivesLeft);
        UIManager.updateGameScore(this.score);
        
        AudioManager.startBGM();
    },
    
    handleClick(e) {
        if (this.gameState !== 'playing') return;
        if (this.knife.throwing || this.knivesLeft <= 0) return;
        
        AudioManager.resumeContext();
        this.throwKnife();
    },
    
    throwKnife() {
        this.knife.throwing = true;
        this.knife.speed = 18;
        this.knife.targetRotation = Math.PI * 2;
        AudioManager.playThrow();
    },
    
    update(deltaTime) {
        this.updateBackgroundStars();
        
        if (this.gameState !== 'playing') return;
        
        this.wheel.rotation += this.wheel.speed;
        
        this.updateParticles();
        
        if (this.knife.throwing) {
            this.knife.trail.push({
                x: this.knife.x,
                y: this.knife.y,
                alpha: 1
            });
            
            if (this.knife.trail.length > 15) {
                this.knife.trail.shift();
            }
            
            this.knife.y -= this.knife.speed;
            
            if (this.knife.targetRotation > 0) {
                this.knife.rotation += 0.3;
                this.knife.targetRotation -= 0.3;
            }
            
            if (this.knife.y <= this.wheel.y + this.wheel.radius) {
                this.checkCollision();
            }
        }
        
        for (let knife of this.knivesOnTarget) {
            knife.angle += this.wheel.speed;
        }
        
        this.knife.trail.forEach(t => {
            t.alpha -= 0.07;
        });
        this.knife.trail = this.knife.trail.filter(t => t.alpha > 0);
    },
    
    updateBackgroundStars() {
        for (let star of this.backgroundStars) {
            star.y += star.speed;
            if (star.y > this.height) {
                star.y = 0;
                star.x = Math.random() * this.width;
            }
        }
    },
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;
            p.vy += 0.1;
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    },
    
    createHitParticles(x, y) {
        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 2;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                color: Math.random() > 0.5 ? '#00ffff' : '#ff00de',
                size: Math.random() * 4 + 2
            });
        }
    },
    
    checkCollision() {
        const knifeAngle = this.getKnifeAngle();
        
        for (let knife of this.knivesOnTarget) {
            const angleDiff = Math.abs(this.normalizeAngle(knifeAngle - knife.angle));
            const minAngle = (this.knife.width * 1.8) / this.wheel.radius;
            
            if (angleDiff < minAngle) {
                this.gameOver('飞刀碰撞了！');
                return;
            }
        }
        
        this.knifeHit();
    },
    
    knifeHit() {
        const knifeAngle = this.getKnifeAngle();
        
        const hitX = this.wheel.x + Math.cos(knifeAngle) * this.wheel.radius;
        const hitY = this.wheel.y + Math.sin(knifeAngle) * this.wheel.radius;
        this.createHitParticles(hitX, hitY);
        
        this.knivesOnTarget.push({
            angle: knifeAngle,
            distance: this.wheel.radius
        });
        
        this.knivesLeft--;
        this.score += 100;
        
        AudioManager.playHit();
        UIManager.updateGameHUD(this.currentLevel.id, this.knivesLeft);
        UIManager.updateGameScore(this.score);
        
        this.knife.throwing = false;
        this.knife.y = this.knife.startY;
        this.knife.trail = [];
        this.knife.rotation = 0;
        this.knife.targetRotation = 0;
        
        if (this.knivesOnTarget.length >= this.currentLevel.targetKnives) {
            this.levelComplete();
        } else if (this.knivesLeft <= 0 && this.knivesOnTarget.length < this.currentLevel.targetKnives) {
            this.gameOver('飞刀用完了！');
        }
    },
    
    getKnifeAngle() {
        return Math.PI / 2 - this.wheel.rotation;
    },
    
    normalizeAngle(angle) {
        while (angle < 0) angle += Math.PI * 2;
        while (angle >= Math.PI * 2) angle -= Math.PI * 2;
        return angle;
    },
    
    levelComplete() {
        this.gameState = 'victory';
        
        const bonus = this.knivesLeft * this.currentLevel.rewards.bonusPerKnife;
        const totalScore = this.score + bonus;
        
        LevelManager.completeLevel(this.currentLevel.id, totalScore);
        LevelManager.setHighScore(totalScore);
        UIManager.updateHomeScreen();
        
        AudioManager.stopBGM();
        AudioManager.playVictory();
        
        UIManager.showVictory(totalScore, bonus);
    },
    
    gameOver(message) {
        this.gameState = 'gameover';
        
        AudioManager.stopBGM();
        AudioManager.playFail();
        
        UIManager.showGameOver(message);
    },
    
    revive() {
        this.knivesLeft = Math.max(3, this.currentLevel.knifeCount - this.knivesOnTarget.length);
        this.knife.throwing = false;
        this.knife.y = this.knife.startY;
        this.knife.rotation = 0;
        this.knife.targetRotation = 0;
        this.knife.trail = [];
        this.gameState = 'playing';
        
        UIManager.updateGameHUD(this.currentLevel.id, this.knivesLeft);
        AudioManager.startBGM();
    },
    
    restart() {
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
    
    render() {
        const ctx = this.ctx;
        
        const bgGradient = ctx.createLinearGradient(0, 0, 0, this.height);
        bgGradient.addColorStop(0, '#0a0a0f');
        bgGradient.addColorStop(0.5, '#1a1a2e');
        bgGradient.addColorStop(1, '#0a0a0f');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, this.width, this.height);
        
        this.drawBackgroundStars();
        
        this.drawWheel();
        this.drawKnivesOnTarget();
        this.drawParticles();
    },
    
    drawBackgroundStars() {
        const ctx = this.ctx;
        
        for (let star of this.backgroundStars) {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
            ctx.fill();
        }
    },
    
    drawParticles() {
        const ctx = this.ctx;
        
        for (let p of this.particles) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }
    },
    
    drawKnifeTrail() {
        if (!this.knife.throwing || this.knife.trail.length === 0) return;
        
        const ctx = this.ctx;
        
        for (let i = 0; i < this.knife.trail.length; i++) {
            const t = this.knife.trail[i];
            const size = (i / this.knife.trail.length) * 8;
            
            ctx.beginPath();
            ctx.arc(t.x, t.y, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 255, 255, ${t.alpha * 0.5})`;
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    },
    
    drawWheel() {
        const ctx = this.ctx;
        const { x, y, radius, rotation } = this.wheel;
        
        ctx.save();
        ctx.translate(x, y);
        
        ctx.shadowColor = this.colors.wheel;
        ctx.shadowBlur = 50;
        ctx.beginPath();
        ctx.arc(0, 0, radius + 10, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 0, 222, 0.3)';
        ctx.lineWidth = 20;
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        ctx.rotate(rotation);
        
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
        gradient.addColorStop(0, '#2a1a3e');
        gradient.addColorStop(0.5, '#1a1a2e');
        gradient.addColorStop(0.8, '#2a1a3e');
        gradient.addColorStop(1, this.colors.wheel);
        
        ctx.shadowColor = this.colors.wheel;
        ctx.shadowBlur = 40;
        
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        ctx.strokeStyle = this.colors.wheel;
        ctx.lineWidth = 4;
        ctx.stroke();
        
        ctx.shadowBlur = 0;
        
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const innerRadius = radius * 0.15;
            const outerRadius = radius * 0.95;
            
            ctx.beginPath();
            ctx.moveTo(
                Math.cos(angle) * innerRadius,
                Math.sin(angle) * innerRadius
            );
            ctx.lineTo(
                Math.cos(angle) * outerRadius,
                Math.sin(angle) * outerRadius
            );
            ctx.strokeStyle = `rgba(255, 0, 222, ${0.2 + (i % 2) * 0.2})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
        
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = '#0a0a0f';
        ctx.fill();
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 15;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.08, 0, Math.PI * 2);
        ctx.fillStyle = '#00ffff';
        ctx.shadowBlur = 20;
        ctx.fill();
        
        ctx.restore();
    },
    
    drawKnivesOnTarget() {
        const ctx = this.ctx;
        const { x, y, radius } = this.wheel;
        
        for (let knife of this.knivesOnTarget) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(knife.angle);
            
            const knifeX = radius - this.knife.height / 2;
            
            ctx.shadowColor = this.colors.knifeGlow;
            ctx.shadowBlur = 20;
            
            const gradient = ctx.createLinearGradient(
                knifeX - this.knife.height * 0.3, 0,
                knifeX + this.knife.height * 0.7, 0
            );
            gradient.addColorStop(0, '#00ffff');
            gradient.addColorStop(0.5, '#fff');
            gradient.addColorStop(1, '#00ffff');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(knifeX + this.knife.height * 0.7, 0);
            ctx.lineTo(knifeX, -this.knife.width / 2);
            ctx.lineTo(knifeX - this.knife.height * 0.3, -this.knife.width / 2);
            ctx.lineTo(knifeX - this.knife.height * 0.3, this.knife.width / 2);
            ctx.lineTo(knifeX, this.knife.width / 2);
            ctx.closePath();
            ctx.fill();
            
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            ctx.restore();
        }
    },

    
    drawKnife() {
        if (this.knivesLeft <= 0 && !this.knife.throwing) return;
        
        const ctx = this.ctx;
        const { x, y, width, height, rotation } = this.knife;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        
        ctx.shadowColor = this.colors.knifeGlow;
        ctx.shadowBlur = 25;
        
        const gradient = ctx.createLinearGradient(
            -height * 0.5, 0,
            height * 0.4, 0
        );
        gradient.addColorStop(0, '#00ffff');
        gradient.addColorStop(0.3, '#fff');
        gradient.addColorStop(0.7, '#00ffff');
        gradient.addColorStop(1, '#00ffff');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(height * 0.4, 0);
        ctx.lineTo(-height * 0.1, -width / 2);
        ctx.lineTo(-height * 0.3, -width / 2);
        ctx.lineTo(-height * 0.5, -width / 3);
        ctx.lineTo(-height * 0.5, width / 3);
        ctx.lineTo(-height * 0.3, width / 2);
        ctx.lineTo(-height * 0.1, width / 2);
        ctx.closePath();
        ctx.fill();
        
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(height * 0.4, 0);
        ctx.lineTo(-height * 0.1, 0);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.restore();
    },
    
    gameLoop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        this.update(deltaTime);
        this.render();
        
        this.animationId = requestAnimationFrame((t) => this.gameLoop(t));
    }
};

window.addEventListener('load', () => {
    Game.init();
});

window.Game = Game;
