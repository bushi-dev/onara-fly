// プレイヤークラス

class Player {
    constructor(canvas, config) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.config = config;

        // サイズと位置
        this.width = 50;
        this.height = 50;
        this.x = 100;
        this.y = canvas.height / 2 - this.height / 2;

        // 物理演算
        this.velocity = 0;
        this.gravity = config.gravity;
        this.fartPower = config.fartPower;

        // 状態
        this.isFlying = false;

        // パーティクル
        this.particles = [];

        // 画像（後で設定可能）
        this.image = null;
        this.flyImage = null;
        this.imageLoaded = false;
    }

    // 画像を設定
    setImages(normalImage, flyImage) {
        this.image = normalImage;
        this.flyImage = flyImage;
        this.imageLoaded = true;
    }

    // おならで上昇
    fart() {
        this.velocity = this.fartPower;
        this.isFlying = true;

        // パーティクルを生成
        this.createFartParticles();

        // サウンド再生
        Sound.play('fart');
    }

    // パーティクル生成
    createFartParticles() {
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: this.x,
                y: this.y + this.height,
                vx: Utils.randomFloat(-2, -0.5),
                vy: Utils.randomFloat(1, 3),
                size: Utils.randomFloat(5, 15),
                alpha: 1,
                color: Utils.randomInt(0, 1) === 0 ? '#90EE90' : '#FFFF99'
            });
        }
    }

    // 更新
    update(deltaTime) {
        // 重力適用
        this.velocity += this.gravity;

        // 位置更新
        this.y += this.velocity;

        // 飛行状態の更新
        this.isFlying = this.velocity < 0;

        // パーティクル更新
        this.updateParticles();
    }

    // パーティクル更新
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.03;
            p.size *= 0.98;

            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    // 描画
    render() {
        // パーティクル描画
        this.renderParticles();

        // プレイヤー描画
        if (this.imageLoaded && this.image) {
            const img = this.isFlying && this.flyImage ? this.flyImage : this.image;
            this.ctx.drawImage(img, this.x, this.y, this.width, this.height);
        } else {
            // フォールバック: 画像がない場合は図形で描画
            this.renderFallback();
        }
    }

    // フォールバック描画
    renderFallback() {
        this.ctx.save();

        // 体
        this.ctx.fillStyle = '#FFD93D';
        this.ctx.beginPath();
        this.ctx.ellipse(
            this.x + this.width / 2,
            this.y + this.height / 2,
            this.width / 2,
            this.height / 2,
            0, 0, Math.PI * 2
        );
        this.ctx.fill();

        // 顔
        this.ctx.fillStyle = '#000';
        // 目
        this.ctx.beginPath();
        this.ctx.arc(this.x + this.width * 0.35, this.y + this.height * 0.4, 4, 0, Math.PI * 2);
        this.ctx.arc(this.x + this.width * 0.65, this.y + this.height * 0.4, 4, 0, Math.PI * 2);
        this.ctx.fill();

        // 口
        this.ctx.beginPath();
        if (this.isFlying) {
            // 驚いた口
            this.ctx.arc(this.x + this.width / 2, this.y + this.height * 0.65, 8, 0, Math.PI * 2);
        } else {
            // 笑顔
            this.ctx.arc(this.x + this.width / 2, this.y + this.height * 0.55, 10, 0, Math.PI);
        }
        this.ctx.fill();

        this.ctx.restore();
    }

    // パーティクル描画
    renderParticles() {
        this.ctx.save();
        for (const p of this.particles) {
            this.ctx.globalAlpha = p.alpha;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.restore();
    }

    // 当たり判定用の矩形を取得
    getBounds() {
        // 少し小さめの当たり判定
        const padding = 5;
        return {
            x: this.x + padding,
            y: this.y + padding,
            width: this.width - padding * 2,
            height: this.height - padding * 2
        };
    }

    // 画面外チェック
    isOutOfBounds() {
        return this.y < -this.height || this.y > this.canvas.height;
    }

    // リセット
    reset() {
        this.y = this.canvas.height / 2 - this.height / 2;
        this.velocity = 0;
        this.isFlying = false;
        this.particles = [];
    }
}
