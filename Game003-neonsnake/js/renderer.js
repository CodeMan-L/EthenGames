const Renderer = {
    canvas: null,
    ctx: null,
    cellSize: 30,
    cols: 20,
    rows: 12,
    MIN_CELL: 10,

    init(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
    },

    setGrid(cols, rows) {
        this.cols = cols;
        this.rows = rows;
        requestAnimationFrame(() => this.resize());
    },

    resize() {
        const container = this.canvas.parentElement;
        if (!container) return;

        const cw = container.clientWidth || 300;
        const ch = container.clientHeight || 200;
        const maxW = Math.min(cw - 16, 800);
        const maxH = Math.min(ch - 8, window.innerHeight * 0.55, 450);

        const cellW = Math.floor(Math.max(maxW, 100) / this.cols);
        const cellH = Math.floor(Math.max(maxH, 80) / this.rows);
        this.cellSize = Math.max(Math.min(cellW, cellH, 30), this.MIN_CELL);

        this.canvas.width = this.cellSize * this.cols;
        this.canvas.height = this.cellSize * this.rows;
    },

    clear() {
        this.ctx.fillStyle = CONFIG.COLORS.BG;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    },

    drawGrid() {
        const ctx = this.ctx;
        const cs = this.cellSize;
        ctx.strokeStyle = CONFIG.COLORS.GRID_LINE;
        ctx.lineWidth = 0.5;

        for (let x = 0; x <= this.cols; x++) {
            ctx.beginPath();
            ctx.moveTo(x * cs, 0);
            ctx.lineTo(x * cs, this.canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y <= this.rows; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * cs);
            ctx.lineTo(this.canvas.width, y * cs);
            ctx.stroke();
        }
    },

    drawRect(x, y, color, glow, opacity, isCircle) {
        const ctx = this.ctx;
        const cs = this.cellSize;
        const pad = Math.max(1, Math.floor(cs * 0.08));

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, opacity !== undefined ? opacity : 1));

        if (glow) {
            ctx.shadowColor = glow;
            ctx.shadowBlur = isCircle ? 15 : 10;
        }

        ctx.fillStyle = color;

        if (isCircle) {
            const cx = x * cs + cs / 2;
            const cy = y * cs + cs / 2;
            const r = Math.max(1, (cs - pad * 2) / 2);
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.fill();
        } else {
            const rx = x * cs + pad;
            const ry = y * cs + pad;
            const rw = Math.max(1, cs - pad * 2);
            const rh = Math.max(1, cs - pad * 2);
            const cr = Math.min(3, rw / 4, rh / 4);
            ctx.beginPath();
            ctx.moveTo(rx + cr, ry);
            ctx.lineTo(rx + rw - cr, ry);
            ctx.arcTo(rx + rw, ry, rx + rw, ry + cr, cr);
            ctx.lineTo(rx + rw, ry + rh - cr);
            ctx.arcTo(rx + rw, ry + rh, rx + rw - cr, ry + rh, cr);
            ctx.lineTo(rx + cr, ry + rh);
            ctx.arcTo(rx, ry + rh, rx, ry + rh - cr, cr);
            ctx.lineTo(rx, ry + cr);
            ctx.arcTo(rx, ry, rx + cr, ry, cr);
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();
    },

    drawSnake(snake, skin, invincible, moveProgress, gridCols, gridRows) {
        const headColor = skin.headColor || CONFIG.COLORS.SNAKE_HEAD;
        const bodyColor = skin.bodyColor || CONFIG.COLORS.SNAKE_BODY;
        const headOp = (skin.headOpacity !== undefined ? skin.headOpacity : 100) / 100;
        const bodyOp = (skin.bodyOpacity !== undefined ? skin.bodyOpacity : 100) / 100;
        const now = Date.now();

        const interpBody = snake.getInterpolatedBody(moveProgress || 0, gridCols, gridRows);

        for (let i = interpBody.length - 1; i >= 0; i--) {
            const seg = interpBody[i];
            const isHead = i === 0;
            let color = isHead ? headColor : bodyColor;
            let opacity = isHead ? headOp : bodyOp;
            let glowColor = color;

            if (invincible) {
                const blinkOn = Math.floor(now / 150) % 2 === 0;
                if (blinkOn) color = CONFIG.COLORS.INVINCIBLE;
                glowColor = CONFIG.COLORS.INVINCIBLE;
                opacity = isHead ? 0.85 : 0.65;
            }

            const wave = Math.sin((now / 200) + i * 0.5) * 0.08;
            const fade = 1 - (i / (interpBody.length + 5)) * 0.25;
            const finalOpacity = Math.max(0.1, opacity * fade + wave);

            this._drawSnakeSegment(seg.x, seg.y, color, glowColor, finalOpacity, isHead, i, interpBody.length);
        }

        if (interpBody.length > 0 && snake.started) {
            const head = interpBody[0];
            const visualDir = snake.getVisualDirection(moveProgress || 0);
            this._drawDirectionalGlow(head.x, head.y, visualDir, headColor, invincible);
            this._drawEyes(head.x, head.y, visualDir, invincible);
        }
    },

    _drawSnakeSegment(x, y, color, glowColor, opacity, isHead, index, totalLen) {
        const ctx = this.ctx;
        const cs = this.cellSize;
        const pad = isHead ? 1 : Math.max(1, Math.floor(cs * 0.1));

        ctx.save();
        ctx.globalAlpha = Math.max(0.1, Math.min(1, opacity));

        ctx.shadowColor = glowColor;
        ctx.shadowBlur = isHead ? 20 : 12;
        ctx.fillStyle = color;

        if (isHead) {
            const cx = x * cs + cs / 2;
            const cy = y * cs + cs / 2;
            const r = Math.max(1, (cs - pad * 2) / 2);
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.fill();

            ctx.shadowBlur = 30;
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.arc(cx, cy, r + 2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            const rx = x * cs + pad;
            const ry = y * cs + pad;
            const rw = Math.max(1, cs - pad * 2);
            const rh = Math.max(1, cs - pad * 2);
            const cr = Math.min(4, rw / 3, rh / 3);
            ctx.beginPath();
            ctx.moveTo(rx + cr, ry);
            ctx.lineTo(rx + rw - cr, ry);
            ctx.arcTo(rx + rw, ry, rx + rw, ry + cr, cr);
            ctx.lineTo(rx + rw, ry + rh - cr);
            ctx.arcTo(rx + rw, ry + rh, rx + rw - cr, ry + rh, cr);
            ctx.lineTo(rx + cr, ry + rh);
            ctx.arcTo(rx, ry + rh, rx, ry + rh - cr, cr);
            ctx.lineTo(rx, ry + cr);
            ctx.arcTo(rx, ry, rx + cr, ry, cr);
            ctx.closePath();
            ctx.fill();

            if (index < 3) {
                ctx.shadowBlur = 18;
                ctx.globalAlpha = 0.15;
                ctx.fill();
            }
        }

        ctx.restore();
    },

    _drawDirectionalGlow(x, y, dir, color, invincible) {
        const ctx = this.ctx;
        const cs = this.cellSize;
        const cx = x * cs + cs / 2;
        const cy = y * cs + cs / 2;

        const len = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
        if (len < 0.01) return;

        const fx = dir.x / len;
        const fy = dir.y / len;

        const glowColor = invincible ? CONFIG.COLORS.INVINCIBLE : color;
        const glowDist = cs * 0.35;
        const gx = cx + fx * glowDist;
        const gy = cy + fy * glowDist;

        ctx.save();
        ctx.globalAlpha = 0.25;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 12;
        ctx.fillStyle = glowColor;
        ctx.beginPath();
        ctx.arc(gx, gy, Math.max(1, cs * 0.12), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    },

    _drawEyes(x, y, dir, invincible) {
        const ctx = this.ctx;
        const cs = this.cellSize;
        const cx = x * cs + cs / 2;
        const cy = y * cs + cs / 2;
        const eyeR = Math.max(1.5, cs * 0.1);
        const off = cs * 0.16;

        const eyeColor = invincible ? CONFIG.COLORS.INVINCIBLE : '#ffffff';
        ctx.save();
        ctx.fillStyle = eyeColor;
        ctx.shadowColor = eyeColor;
        ctx.shadowBlur = 8;

        const len = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
        if (len < 0.01) {
            ctx.beginPath();
            ctx.arc(cx + off, cy - off, eyeR, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(cx + off, cy + off, eyeR, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            return;
        }

        const fx = dir.x / len;
        const fy = dir.y / len;
        const px = -fy;
        const py = fx;

        const fwdOff = off * 0.8;
        const sideOff = off;

        const e1x = cx + fx * fwdOff + px * sideOff;
        const e1y = cy + fy * fwdOff + py * sideOff;
        const e2x = cx + fx * fwdOff - px * sideOff;
        const e2y = cy + fy * fwdOff - py * sideOff;

        ctx.beginPath();
        ctx.arc(e1x, e1y, eyeR, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(e2x, e2y, eyeR, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    },

    drawFood(food, isWarning) {
        const ctx = this.ctx;
        const cs = this.cellSize;
        const cx = food.x * cs + cs / 2;
        const cy = food.y * cs + cs / 2;
        const now = Date.now();

        let color = CONFIG.COLORS.FOOD;
        if (isWarning) {
            color = Math.floor(now / 250) % 2 === 0
                ? CONFIG.COLORS.OBSTACLE_WARNING : CONFIG.COLORS.FOOD;
        }

        const pulse = 1 + Math.sin(now / 300) * 0.15;
        const baseR = Math.max(1, (cs - 4) / 2 * 0.55);
        const r = baseR * pulse;

        ctx.save();
        ctx.shadowColor = CONFIG.COLORS.FOOD_GLOW;
        ctx.shadowBlur = 20;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 35;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(cx, cy, r + 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    },

    drawObstacles(obstacles) {
        obstacles.forEach(obs => {
            this.drawRect(obs.x, obs.y, CONFIG.COLORS.OBSTACLE, CONFIG.COLORS.OBSTACLE, 0.9, false);
        });
    },

    drawBarriers(barriers, lifetime) {
        const now = Date.now();
        barriers.forEach(b => {
            const elapsed = now - b.createdAt;
            const isWarning = elapsed > lifetime - 3000;
            let color = CONFIG.COLORS.BARRIER;
            let opacity = 0.85;

            if (isWarning) {
                const blinkOn = Math.floor(now / 200) % 2 === 0;
                if (!blinkOn) { opacity = 0.4; color = CONFIG.COLORS.BARRIER_WARNING; }
            }
            this.drawRect(b.x, b.y, color, color, opacity, false);
        });
    },

    drawPendingSpawns(pending) {
        const now = Date.now();
        pending.forEach(p => {
            const blinkOn = Math.floor(now / 200) % 2 === 0;
            if (blinkOn) {
                this.drawRect(p.x, p.y, CONFIG.COLORS.BARRIER_WARNING, CONFIG.COLORS.BARRIER_WARNING, 0.3, false);
            }
        });
    },

    drawAISnake(aiSnake) {
        if (!aiSnake || !aiSnake.alive) return;

        for (let i = aiSnake.body.length - 1; i >= 0; i--) {
            const seg = aiSnake.body[i];
            const isHead = i === 0;
            const color = isHead ? CONFIG.COLORS.AI_HEAD : CONFIG.COLORS.AI_BODY;
            const fade = 1 - (i / (aiSnake.body.length + 5)) * 0.3;
            this.drawRect(seg.x, seg.y, color, color, fade, isHead);
        }

        if (aiSnake.body.length > 0) {
            const head = aiSnake.body[0];
            this._drawAIEyes(head.x, head.y, aiSnake.direction);
        }
    },

    _drawAIEyes(x, y, dir) {
        const ctx = this.ctx;
        const cs = this.cellSize;
        const cx = x * cs + cs / 2;
        const cy = y * cs + cs / 2;
        const eyeR = Math.max(1.5, cs * 0.12);
        const off = cs * 0.16;

        ctx.save();
        ctx.strokeStyle = CONFIG.COLORS.AI_EYE;
        ctx.shadowColor = CONFIG.COLORS.AI_EYE;
        ctx.shadowBlur = 8;
        ctx.lineWidth = 1.5;

        let positions;
        if (dir.x === 1) positions = [{x: cx + off, y: cy - off}, {x: cx + off, y: cy + off}];
        else if (dir.x === -1) positions = [{x: cx - off, y: cy - off}, {x: cx - off, y: cy + off}];
        else if (dir.y === -1) positions = [{x: cx - off, y: cy - off}, {x: cx + off, y: cy - off}];
        else positions = [{x: cx - off, y: cy + off}, {x: cx + off, y: cy + off}];

        positions.forEach(p => {
            ctx.beginPath();
            ctx.moveTo(p.x - eyeR, p.y - eyeR);
            ctx.lineTo(p.x + eyeR, p.y + eyeR);
            ctx.moveTo(p.x + eyeR, p.y - eyeR);
            ctx.lineTo(p.x - eyeR, p.y + eyeR);
            ctx.stroke();
        });
        ctx.restore();
    },

    drawParticles(particles) {
        const ctx = this.ctx;
        particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 8;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(0.5, p.size * p.life), 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    },

    render(state) {
        this.clear();
        this.drawGrid();
        this.drawObstacles(state.obstacles);
        this.drawBarriers(state.barriers, state.barrierLifetime);
        this.drawPendingSpawns(state.pendingSpawns);
        state.foods.forEach(f => this.drawFood(f, state.foodManager.isWarning(f)));
        this.drawAISnake(state.aiSnake);
        this.drawSnake(state.snake, state.skin, state.invincible, state.moveProgress, state.gridCols, state.gridRows);
        if (state.particles && state.particles.length > 0) {
            this.drawParticles(state.particles);
        }
    },
};

window.Renderer = Renderer;
