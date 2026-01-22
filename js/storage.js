// ハイスコア保存管理

const Storage = {
    STORAGE_KEY: 'onara-fly-highscore',

    // ハイスコアを取得
    getHighScore() {
        const score = localStorage.getItem(this.STORAGE_KEY);
        return score ? parseInt(score, 10) : 0;
    },

    // ハイスコアを保存
    setHighScore(score) {
        localStorage.setItem(this.STORAGE_KEY, score.toString());
    },

    // 新記録かどうかをチェックして保存
    checkAndSaveHighScore(score) {
        const currentHigh = this.getHighScore();
        if (score > currentHigh) {
            this.setHighScore(score);
            return true; // 新記録
        }
        return false;
    }
};
