const FoodManager = {
    foods: [],
    lifetime: Infinity,
    maxCount: 1,

    init(lifetime, maxCount) {
        this.foods = [];
        this.lifetime = lifetime || Infinity;
        this.maxCount = maxCount || 1;
    },

    spawn(cols, rows, occupiedSet) {
        if (this.foods.length >= this.maxCount) return false;

        const empty = [];
        for (let x = 0; x < cols; x++) {
            for (let y = 0; y < rows; y++) {
                if (!occupiedSet.has(`${x},${y}`)) {
                    empty.push({x, y});
                }
            }
        }

        if (empty.length === 0) return false;

        const pos = empty[Math.floor(Math.random() * empty.length)];
        this.foods.push({
            x: pos.x,
            y: pos.y,
            createdAt: Date.now(),
        });
        return true;
    },

    remove(index) {
        this.foods.splice(index, 1);
    },

    update() {
        if (this.lifetime === Infinity) return;
        const now = Date.now();
        this.foods = this.foods.filter(f => now - f.createdAt < this.lifetime);
    },

    isWarning(food) {
        if (this.lifetime === Infinity) return false;
        const elapsed = Date.now() - food.createdAt;
        return elapsed > this.lifetime - 3000;
    },

    getOccupiedSet() {
        return new Set(this.foods.map(f => `${f.x},${f.y}`));
    },
};

window.FoodManager = FoodManager;
