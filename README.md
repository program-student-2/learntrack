# LearnTrack

学習時間と目標を記録するシンプルな学習トラッカー（React + Vite + Tailwind の PWA）。

- 学習記録の追加・編集・削除
- 科目別 / 週次 / 最終目標の管理と進捗予測
- 志望校ダッシュボード
- データはブラウザの `localStorage` に保存（JSON でエクスポート / インポート可能）
- PWA としてインストール可能

## 開発

```sh
npm install
npm run dev
```

## ビルド

```sh
npm run build
npm run preview
```

## 構成

- `src/App.tsx` — ルーティングと状態 (`localStorage` 永続化)
- `src/components/Layout.tsx` — サイドバー + ヘッダー
- `src/pages/` — `Home` / `Stats` / `Settings`
- `src/components/` — フォーム、履歴、ダッシュボード、目標予測カード
