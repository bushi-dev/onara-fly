# Onara Fly

おならの力で空を飛び、障害物を避けるアクション/フライトゲーム

## 遊び方

- クリック / タップ / スペースキー で上昇
- 何もしないと重力で下降
- 障害物を避けてスコアを稼ごう

## 機能

- ハイスコア保存（localStorage）
- 難易度上昇システム
- サウンド効果
- モバイル対応

## 開発

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm start
```

http://localhost:3000 でゲームにアクセス

## デプロイ（Cloudflare Pages）

1. GitHubにプッシュ
2. Cloudflare Pagesでリポジトリを接続
3. ビルド設定:
   - ビルドコマンド: なし
   - 出力ディレクトリ: ./

## 画像生成

`assets/images/IMAGE_PROMPTS.md` にAntigravity用のプロンプトが記載されています。
