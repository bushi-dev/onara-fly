// サウンド管理

const Sound = {
    sounds: {},
    bgm: null,
    isMuted: false,

    // サウンドを初期化
    init() {
        // Web Audio APIのコンテキストを作成
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // プログラムで生成するサウンド
        this.createFartSound();
        this.createCrashSound();
    },

    // おなら音を生成
    createFartSound() {
        this.sounds.fart = () => {
            if (this.isMuted) return;

            const ctx = this.audioContext;
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(150, ctx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.2);

            gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.2);
        };
    },

    // 衝突音を生成
    createCrashSound() {
        this.sounds.crash = () => {
            if (this.isMuted) return;

            const ctx = this.audioContext;
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(200, ctx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3);

            gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.3);
        };
    },

    // サウンドを再生
    play(name) {
        if (this.sounds[name]) {
            this.sounds[name]();
        }
    },

    // ミュート切り替え
    toggleMute() {
        this.isMuted = !this.isMuted;
        return this.isMuted;
    },

    // オーディオコンテキストを再開（ユーザー操作後に必要）
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
};
