// 障害物クラス

class Obstacle {
    constructor(canvas, config, x, y) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.config = config;

        // サイズと位置
        this.width = 50;
        this.height = Utils.randomInt(40, 80);
        this.x = x || canvas.width;
        this.y = y || Utils.randomInt(50, canvas.height - 50 - this.height);

        // 速度
        this.speed = config.obstacleSpeed;

        // 画像
        this.image = null;
        this.imageLoaded = false;

        // 通過済みフラグ（スコア用）
        this.passed = false;
    }

    // 画像を設定
    setImage(image) {
        this.image = image;
        this.imageLoaded = true;
    }

    // 更新
    update(speedMultiplier = 1) {
        this.x -= this.speed * speedMultiplier;
    }

    // 描画
    render() {
        if (this.imageLoaded && this.image) {
            this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            // フォールバック: 雲の形で描画
            this.renderFallback();
        }
    }

    // フォールバック描画
    renderFallback() {
        this.ctx.save();
        this.ctx.fillStyle = '#666';

        // 雲のような形を描画
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        this.ctx.beginPath();
        this.ctx.ellipse(centerX, centerY, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // 怒った顔
        this.ctx.fillStyle = '#FFF';
        // 目
        this.ctx.beginPath();
        this.ctx.arc(centerX - 10, centerY - 5, 5, 0, Math.PI * 2);
        this.ctx.arc(centerX + 10, centerY - 5, 5, 0, Math.PI * 2);
        this.ctx.fill();

        // 眉毛（怒り）
        this.ctx.strokeStyle = '#FFF';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - 18, centerY - 15);
        this.ctx.lineTo(centerX - 5, centerY - 10);
        this.ctx.moveTo(centerX + 18, centerY - 15);
        this.ctx.lineTo(centerX + 5, centerY - 10);
        this.ctx.stroke();

        this.ctx.restore();
    }

    // 当たり判定用の矩形を取得
    getBounds() {
        const padding = 5;
        return {
            x: this.x + padding,
            y: this.y + padding,
            width: this.width - padding * 2,
            height: this.height - padding * 2
        };
    }

    // 画面外チェック
    isOffScreen() {
        return this.x + this.width < 0;
    }
}

// 障害物マネージャー
class ObstacleManager {
    constructor(canvas, config) {
        this.canvas = canvas;
        this.config = config;
        this.obstacles = [];
        this.lastSpawnTime = 0;
        this.spawnInterval = config.spawnInterval;

        // 画像
        this.obstacleImage = null;
    }

    // 画像を設定
    setImage(image) {
        this.obstacleImage = image;
    }

    // 障害物を生成
    spawn(timestamp) {
        if (timestamp - this.lastSpawnTime >= this.spawnInterval) {
            const obstacle = new Obstacle(this.canvas, this.config);
            if (this.obstacleImage) {
                obstacle.setImage(this.obstacleImage);
            }
            this.obstacles.push(obstacle);
            this.lastSpawnTime = timestamp;
        }
    }

    // 更新
    update(speedMultiplier = 1) {
        // 障害物を更新
        for (const obstacle of this.obstacles) {
            obstacle.update(speedMultiplier);
        }

        // 画面外の障害物を削除
        this.obstacles = this.obstacles.filter(o => !o.isOffScreen());
    }

    // 描画
    render() {
        for (const obstacle of this.obstacles) {
            obstacle.render();
        }
    }

    // プレイヤーとの衝突チェック
    checkCollision(player) {
        const playerBounds = player.getBounds();
        for (const obstacle of this.obstacles) {
            if (Utils.rectCollision(playerBounds, obstacle.getBounds())) {
                return true;
            }
        }
        return false;
    }

    // スコア加算のための通過チェック
    checkPassed(playerX) {
        let passed = 0;
        for (const obstacle of this.obstacles) {
            if (!obstacle.passed && obstacle.x + obstacle.width < playerX) {
                obstacle.passed = true;
                passed++;
            }
        }
        return passed;
    }

    // 難易度更新
    updateDifficulty(multiplier) {
        this.spawnInterval = this.config.spawnInterval / multiplier;
    }

    // リセット
    reset() {
        this.obstacles = [];
        this.lastSpawnTime = 0;
        this.spawnInterval = this.config.spawnInterval;
    }
}
