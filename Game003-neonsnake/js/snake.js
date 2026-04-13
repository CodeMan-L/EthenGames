const Snake = {
    body: [],
    direction: {x: 0, y: 0},
    nextDirection: {x: 0, y: 0},
    growPending: 0,
    started: false,
    _moveAccum: 0,
    prevBody: [],
    lastDirection: {x: 1, y: 0},
    lastHead: null,

    _inputBuffer: [],
    _bufferMaxSize: 2,
    prevDirection: {x: 1, y: 0},

    init(startX, startY, length) {
        this.body = [];
        this.direction = {x: 0, y: 0};
        this.nextDirection = {x: 0, y: 0};
        this.growPending = 0;
        this.started = false;
        this._moveAccum = 0;
        this.prevBody = [];
        this.lastDirection = {x: 1, y: 0};
        this.lastHead = null;
        this._inputBuffer = [];
        this.prevDirection = {x: 1, y: 0};

        const len = length || 1;
        for (let i = 0; i < len; i++) {
            this.body.push({x: startX - i, y: startY});
        }
        this._syncPrevBody();
    },

    _syncPrevBody() {
        this.prevBody = this.body.map(s => ({x: s.x, y: s.y}));
    },

    setDirection(dir) {
        if (dir.x === 0 && dir.y === 0) return;

        if (!this.started) {
            this.started = true;
            this.nextDirection = {x: dir.x, y: dir.y};
            this.lastDirection = {x: dir.x, y: dir.y};
            this._inputBuffer = [];
            return;
        }

        const effectiveDir = this._inputBuffer.length > 0
            ? this._inputBuffer[this._inputBuffer.length - 1]
            : this.nextDirection;

        const isOpposite = (
            effectiveDir.x + dir.x === 0 &&
            effectiveDir.y + dir.y === 0
        );

        const isSame = (
            effectiveDir.x === dir.x &&
            effectiveDir.y === dir.y
        );

        if (isOpposite || isSame) return;

        if (this._inputBuffer.length < this._bufferMaxSize) {
            this._inputBuffer.push({x: dir.x, y: dir.y});
        } else {
            this._inputBuffer[this._inputBuffer.length - 1] = {x: dir.x, y: dir.y};
        }

        this.lastDirection = {x: dir.x, y: dir.y};
    },

    clearBuffer() {
        this._inputBuffer = [];
    },

    update(cols, rows) {
        if (!this.started) return null;

        if (this._inputBuffer.length > 0) {
            this.nextDirection = this._inputBuffer.shift();
        }

        this._syncPrevBody();
        this.lastHead = {x: this.body[0].x, y: this.body[0].y};

        this.prevDirection = {x: this.direction.x, y: this.direction.y};
        this.direction = {x: this.nextDirection.x, y: this.nextDirection.y};

        const head = this.body[0];
        const newHead = {
            x: head.x + this.direction.x,
            y: head.y + this.direction.y,
        };

        if (newHead.x < 0) newHead.x = cols - 1;
        else if (newHead.x >= cols) newHead.x = 0;
        if (newHead.y < 0) newHead.y = rows - 1;
        else if (newHead.y >= rows) newHead.y = 0;

        for (let i = 0; i < this.body.length; i++) {
            if (this.body[i].x === newHead.x && this.body[i].y === newHead.y) {
                return 'self';
            }
        }

        this.body.unshift(newHead);

        if (this.growPending > 0) {
            this.growPending--;
        } else {
            this.body.pop();
        }

        return null;
    },

    getInterpolatedBody(progress, cols, rows) {
        if (!this.started || this.prevBody.length === 0) {
            return this.body.map(s => ({x: s.x, y: s.y}));
        }

        const p = Math.max(0, Math.min(1, progress));
        const result = [];

        for (let i = 0; i < this.body.length; i++) {
            const curr = this.body[i];
            const prev = i < this.prevBody.length ? this.prevBody[i] : curr;

            let dx = curr.x - prev.x;
            let dy = curr.y - prev.y;

            if (cols && Math.abs(dx) > 1) dx = dx > 0 ? dx - cols : dx + cols;
            if (rows && Math.abs(dy) > 1) dy = dy > 0 ? dy - rows : dy + rows;

            result.push({
                x: prev.x + dx * p,
                y: prev.y + dy * p,
            });
        }

        return result;
    },

    getVisualDirection(progress) {
        const p = Math.max(0, Math.min(1, progress));
        const prev = this.prevDirection;
        const curr = this.direction;

        if (!this.started) return {x: 1, y: 0};
        if (prev.x === 0 && prev.y === 0) return {x: curr.x || 1, y: curr.y || 0};
        if (curr.x === 0 && curr.y === 0) return {x: prev.x || 1, y: prev.y || 0};
        if (prev.x === curr.x && prev.y === curr.y) return {x: curr.x, y: curr.y};

        const turnProgress = Math.min(1, p / 0.35);
        const eased = 1 - Math.pow(1 - turnProgress, 3);

        const prevAngle = Math.atan2(prev.y, prev.x);
        const currAngle = Math.atan2(curr.y, curr.x);

        let diff = currAngle - prevAngle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;

        const interpAngle = prevAngle + diff * eased;
        return {x: Math.cos(interpAngle), y: Math.sin(interpAngle)};
    },

    checkObstacleCollision(obstacles) {
        const head = this.body[0];
        for (const obs of obstacles) {
            if (obs.x === head.x && obs.y === head.y) return true;
        }
        return false;
    },

    checkFoodCollision(foods) {
        const head = this.body[0];
        for (let i = 0; i < foods.length; i++) {
            if (foods[i].x === head.x && foods[i].y === head.y) return i;
        }
        return -1;
    },

    grow() {
        this.growPending++;
    },

    getLength() {
        return this.body.length;
    },

    getHead() {
        return this.body[0];
    },

    getOccupiedSet() {
        return new Set(this.body.map(s => `${s.x},${s.y}`));
    },

    reviveAt(x, y) {
        this.body = [{x, y}];
        this.prevBody = [{x, y}];
        this.direction = {x: this.lastDirection.x, y: this.lastDirection.y};
        this.nextDirection = {x: this.lastDirection.x, y: this.lastDirection.y};
        this.prevDirection = {x: this.lastDirection.x, y: this.lastDirection.y};
        this.growPending = 0;
        this.started = true;
        this._inputBuffer = [];
    },
};

window.Snake = Snake;
