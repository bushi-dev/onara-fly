// ユーティリティ関数

const Utils = {
    // ランダムな整数を生成
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // ランダムな浮動小数点数を生成
    randomFloat(min, max) {
        return Math.random() * (max - min) + min;
    },

    // 矩形同士の衝突判定（AABB）
    rectCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    },

    // 値を範囲内に制限
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },

    // 線形補間
    lerp(start, end, t) {
        return start + (end - start) * t;
    }
};
