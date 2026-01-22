// ゲームメインロジック

const GAME_CONFIG = {
    gravity: 0.5,
    fartPower: -10,
    obstacleSpeed: 5,
    spawnInterval: 1500,
    difficultyIncrease: 0.1
};

class Game {
    constructor() {
        // DOM要素
        this.titleScreen = document.getElementById('title-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.gameoverScreen = document.getElementById('gameover-screen');
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        // スコア表示要素
        this.titleHighScoreEl = document.getElementById('title-high-score');
        this.gameHighScoreEl = document.getElementById('game-high-score');
        this.currentScoreEl = document.getElementById('current-score');
        this.finalScoreEl = document.getElementById('final-score');
        this.newRecordEl = document.getElementById('new-record');

        // ボタン
        this.startButton = document.getElementById('start-button');
        this.retryButton = document.getElementById('retry-button');
        this.titleButton = document.getElementById('title-button');

        // Canvas設定
        this.setupCanvas();

        // ゲーム状態
        this.isRunning = false;
        this.score = 0;
        this.startTime = 0;
        this.lastTime = 0;

        // オブジェクト
        this.player = new Player(this.canvas, GAME_CONFIG);
        this.obstacleManager = new ObstacleManager(this.canvas, GAME_CONFIG);

        // 難易度
        this.difficultyMultiplier = 1;

        // 背景
        this.backgroundOffset = 0;
        this.backgroundImage = null;

        // 初期化
        this.init();
    }

    setupCanvas() {
        this.canvas.width = 800;
        this.canvas.height = 600;

        // レスポンシブ対応
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        const container = document.getElementById('game-container');
        const containerRect = container.getBoundingClientRect();

        // コンテナサイズに合わせてCanvasを調整
        if (containerRect.width < 800) {
            const scale = containerRect.width / 800;
            this.canvas.style.width = containerRect.width + 'px';
            this.canvas.style.height = (600 * scale) + 'px';
        }
    }

    init() {
        // サウンド初期化
        Sound.init();

        // ハイスコア表示
        this.updateHighScoreDisplay();

        // イベントリスナー
        this.setupEventListeners();

        // 画像読み込み（オプション）
        this.loadImages();
    }

    setupEventListeners() {
        // スタートボタン
        this.startButton.addEventListener('click', () => this.startGame());

        // リトライボタン
        this.retryButton.addEventListener('click', () => this.startGame());

        // タイトルボタン
        this.titleButton.addEventListener('click', () => this.showTitle());

        // ゲーム操作（クリック/タップ）
        this.canvas.addEventListener('click', () => this.handleInput());
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleInput();
        });

        // キーボード
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                this.handleInput();
            }
        });
    }

    loadImages() {
        // プレイヤー画像
        const playerImg = new Image();
        playerImg.src = 'assets/images/player.png';
        playerImg.onload = () => {
            const flyImg = new Image();
            flyImg.src = 'assets/images/player-fly.png';
            flyImg.onload = () => {
                this.player.setImages(playerImg, flyImg);
            };
        };

        // 障害物画像
        const obstacleImg = new Image();
        obstacleImg.src = 'assets/images/obstacle.png';
        obstacleImg.onload = () => {
            this.obstacleManager.setImage(obstacleImg);
        };

        // 背景画像
        const bgImg = new Image();
        bgImg.src = 'assets/images/background.png';
        bgImg.onload = () => {
            this.backgroundImage = bgImg;
        };
    }

    handleInput() {
        if (this.isRunning) {
            Sound.resume();
            this.player.fart();
        }
    }

    startGame() {
        // 画面切り替え
        this.titleScreen.classList.add('hidden');
        this.gameoverScreen.classList.add('hidden');
        this.gameScreen.classList.remove('hidden');

        // ゲーム状態リセット
        this.isRunning = true;
        this.score = 0;
        this.difficultyMultiplier = 1;
        this.startTime = performance.now();

        // オブジェクトリセット
        this.player.reset();
        this.obstacleManager.reset();

        // スコア表示更新
        this.updateScoreDisplay();
        this.updateHighScoreDisplay();

        // サウンド
        Sound.resume();

        // ゲームループ開始
        this.lastTime = performance.now();
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }

    gameLoop(timestamp) {
        if (!this.isRunning) return;

        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(timestamp, deltaTime);
        this.render();

        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }

    update(timestamp, deltaTime) {
        // 難易度更新（10秒ごとに上昇）
        const elapsedSeconds = (timestamp - this.startTime) / 1000;
        this.difficultyMultiplier = 1 + Math.floor(elapsedSeconds / 10) * GAME_CONFIG.difficultyIncrease;
        this.obstacleManager.updateDifficulty(this.difficultyMultiplier);

        // プレイヤー更新
        this.player.update(deltaTime);

        // 障害物更新
        this.obstacleManager.spawn(timestamp);
        this.obstacleManager.update(this.difficultyMultiplier);

        // 衝突判定
        if (this.obstacleManager.checkCollision(this.player)) {
            this.gameOver();
            return;
        }

        // 画面外判定
        if (this.player.isOutOfBounds()) {
            this.gameOver();
            return;
        }

        // スコア更新
        const passed = this.obstacleManager.checkPassed(this.player.x);
        this.score += passed * 10;

        // 時間経過でもスコア加算
        this.score += Math.floor(deltaTime / 100);

        this.updateScoreDisplay();

        // 背景スクロール
        this.backgroundOffset += 2 * this.difficultyMultiplier;
        if (this.backgroundOffset >= this.canvas.width) {
            this.backgroundOffset = 0;
        }
    }

    render() {
        // 背景クリア
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 背景描画
        this.renderBackground();

        // 障害物描画
        this.obstacleManager.render();

        // プレイヤー描画
        this.player.render();
    }

    renderBackground() {
        if (this.backgroundImage) {
            // 画像背景（スクロール）
            this.ctx.drawImage(this.backgroundImage, -this.backgroundOffset, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(this.backgroundImage, this.canvas.width - this.backgroundOffset, 0, this.canvas.width, this.canvas.height);
        } else {
            // フォールバック: グラデーション背景
            const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
            gradient.addColorStop(0, '#87CEEB');
            gradient.addColorStop(1, '#E0F6FF');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // 装飾的な雲
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            const cloudX = (200 - this.backgroundOffset % 400 + this.canvas.width) % (this.canvas.width + 200) - 100;
            this.ctx.beginPath();
            this.ctx.arc(cloudX, 100, 40, 0, Math.PI * 2);
            this.ctx.arc(cloudX + 30, 80, 30, 0, Math.PI * 2);
            this.ctx.arc(cloudX + 60, 100, 35, 0, Math.PI * 2);
            this.ctx.fill();

            const cloudX2 = (500 - this.backgroundOffset % 600 + this.canvas.width) % (this.canvas.width + 200) - 100;
            this.ctx.beginPath();
            this.ctx.arc(cloudX2, 200, 35, 0, Math.PI * 2);
            this.ctx.arc(cloudX2 + 40, 190, 40, 0, Math.PI * 2);
            this.ctx.fill();

            // 地面
            this.ctx.fillStyle = '#90EE90';
            this.ctx.fillRect(0, this.canvas.height - 20, this.canvas.width, 20);
        }
    }

    gameOver() {
        this.isRunning = false;

        // 衝突音
        Sound.play('crash');

        // ハイスコアチェック
        const isNewRecord = Storage.checkAndSaveHighScore(this.score);

        // 画面更新
        this.finalScoreEl.textContent = this.score;
        if (isNewRecord) {
            this.newRecordEl.classList.remove('hidden');
        } else {
            this.newRecordEl.classList.add('hidden');
        }

        // 画面切り替え
        this.gameScreen.classList.add('hidden');
        this.gameoverScreen.classList.remove('hidden');

        this.updateHighScoreDisplay();
    }

    showTitle() {
        this.gameoverScreen.classList.add('hidden');
        this.gameScreen.classList.add('hidden');
        this.titleScreen.classList.remove('hidden');
        this.updateHighScoreDisplay();
    }

    updateScoreDisplay() {
        this.currentScoreEl.textContent = this.score;
    }

    updateHighScoreDisplay() {
        const highScore = Storage.getHighScore();
        this.titleHighScoreEl.textContent = highScore;
        this.gameHighScoreEl.textContent = highScore;
    }
}

// ゲーム開始
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});
