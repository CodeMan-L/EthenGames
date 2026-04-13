const App = {
    init() {
        Storage.init();
        Renderer.init('game-canvas');
        AudioManager.init();
        UI.init();

        this._bindKeyboard();
        this._bindTouch();
        this._bindTouchButtons();
        this._bindResize();

        UI.show('home');

        const sound = Storage.getSound();
        document.getElementById('btn-sound').textContent = sound.muted ? CONFIG.JP.SOUND_OFF : CONFIG.JP.SOUND_ON;
    },

    _bindKeyboard() {
        document.addEventListener('keydown', (e) => {
            const map = {
                ArrowUp: {x: 0, y: -1},
                ArrowDown: {x: 0, y: 1},
                ArrowLeft: {x: -1, y: 0},
                ArrowRight: {x: 1, y: 0},
                w: {x: 0, y: -1},
                s: {x: 0, y: 1},
                a: {x: -1, y: 0},
                d: {x: 1, y: 0},
            };

            if (map[e.key]) {
                e.preventDefault();
                Game.setDirection(map[e.key]);
            }

            if (e.key === 'Escape' && Game.state === 'playing') {
                Game.pause();
                UI.show('pause');
            }
            if (e.key === ' ' && Game.state === 'paused') {
                Game.resume();
                UI.show('game');
            }
        });
    },

    _bindTouch() {
        let startX = 0;
        let startY = 0;

        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, {passive: true});

        document.addEventListener('touchend', (e) => {
            if (Game.state !== 'playing') return;

            const dx = e.changedTouches[0].clientX - startX;
            const dy = e.changedTouches[0].clientY - startY;
            const threshold = 30;

            if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return;

            if (Math.abs(dx) > Math.abs(dy)) {
                Game.setDirection(dx > 0 ? {x: 1, y: 0} : {x: -1, y: 0});
            } else {
                Game.setDirection(dy > 0 ? {x: 0, y: 1} : {x: 0, y: -1});
            }
        }, {passive: true});
    },

    _bindTouchButtons() {
        const map = {
            'ctrl-up': {x: 0, y: -1},
            'ctrl-down': {x: 0, y: 1},
            'ctrl-left': {x: -1, y: 0},
            'ctrl-right': {x: 1, y: 0},
        };
        Object.entries(map).forEach(([id, dir]) => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('click', () => Game.setDirection(dir));
                el.addEventListener('touchstart', (e) => { e.preventDefault(); Game.setDirection(dir); });
            }
        });
    },

    _bindResize() {
        window.addEventListener('resize', () => {
            if (Game.state === 'playing' || Game.state === 'paused') {
                Renderer.resize();
            }
        });
    },
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
