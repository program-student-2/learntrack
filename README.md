<div align="center">
  <img src="public/pwa-192x192.png" width="120" alt="LearnTrack" />

  <h1>LearnTrack</h1>

  <p>
    学習時間と目標を記録する、シンプルでプライベートな学習トラッカー。<br/>
    React + TypeScript + Vite ・ Tailwind v4 ・ Firebase Auth ・ PWA
  </p>
</div>

---

## 機能

- 学習記録の追加 / 編集 / 削除（科目タグ付き）
- 週次 / 最終目標 / 科目別目標と、達成予定日の自動予測
- 志望校ダッシュボード（総合達成率 + 科目別プログレス）
- 直近7日の学習時間グラフ
- JSON でのバックアップ / 復元（端末間の移行用）
- Firebase Google 認証 + 自分のメールだけ許可するアロウリスト
- PWA としてインストール可能（ホーム画面 / スタートメニューから起動）

データはブラウザの `localStorage` に保存される（端末ローカル / クラウド同期なし）。

## クイックスタート

```sh
npm install
cp .env.example .env.local   # Firebase の値を入れる（下記参照）
npm run dev
```

本番ビルドの動作確認（PWA を試したいときはこちら）：

```sh
npm run build
npm run preview
```

## Firebase セットアップ

1. [Firebase Console](https://console.firebase.google.com/) で新規プロジェクト作成
2. Web アプリを追加 → 表示される `firebaseConfig` の値を控える
3. Authentication → Sign-in method → **Google** を有効化
4. ローカルに `.env.local` を作って以下を埋める：

| 環境変数 | 内容 |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase apiKey |
| `VITE_FIREBASE_AUTH_DOMAIN` | `xxx.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | プロジェクトID |
| `VITE_FIREBASE_STORAGE_BUCKET` | `xxx.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | 数字のID |
| `VITE_FIREBASE_APP_ID` | `1:xxx:web:xxx` |
| `VITE_ALLOWED_EMAILS` | サインインを許可するメール（カンマ区切り。空なら全許可）|

> 許可リストはクライアント側チェック。UI ゲートとしては機能するが、データ保護を厳密にやるなら Firestore + セキュリティルールが必要（本アプリは localStorage 完結のため簡易ゲートで十分）。

## スクリプト

| コマンド | 用途 |
|---|---|
| `npm run dev` | 開発サーバ起動 |
| `npm run build` | TypeScript + Vite ビルド |
| `npm run preview` | ビルド済みを配信（PWA動作確認用） |
| `npm run lint` | ESLint |
| `npm run icons` | `public/icon.svg` から PWA 用 PNG / favicon を再生成 |

## プロジェクト構成

```
src/
├── App.tsx                       ルーティング + 状態（localStorage 永続化）
├── lib/
│   ├── firebase.ts               Firebase 初期化 + 許可メール判定
│   └── auth.tsx                  AuthProvider / useAuth
├── components/
│   ├── Layout.tsx                サイドバー + ヘッダー + 背景アニメ
│   ├── LoginScreen.tsx           サインイン画面
│   ├── LearningForm.tsx          記録フォーム
│   ├── HistoryList.tsx           履歴リスト
│   ├── GoalPredictionCard.tsx    最終目標と達成予測
│   ├── TargetSchoolDashboard.tsx 志望校ダッシュボード
│   ├── DashboardStats.tsx        7日チャート + サマリー
│   └── ui/
│       ├── Surface.tsx           共通グラスカード
│       └── BrandIcon.tsx         ブランドロゴ（SVG）
├── pages/
│   ├── Home.tsx
│   ├── Stats.tsx
│   └── Settings.tsx              バックアップ / 復元もここ
└── types.ts
```

## データ管理

- 学習記録と設定はブラウザの `localStorage` に保存される
- 設定 → 「バックアップをダウンロード」で全データを JSON エクスポート
- 別端末や別ブラウザに移行するときは、復元側でその JSON を読み込む
- バックアップファイル（`learntrack_backup_*.json`）は `.gitignore` 済み

## ライセンス

Private — 個人利用
