# Akari Math Lab

数学学習のためのポートフォリオサイト。Next.js 16 と Supabase で構築されています。

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![Supabase](https://img.shields.io/badge/Supabase-Database%20%2B%20Auth-3ECF8E)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC)

## ✨ 特徴

- 📝 **Math Diary** - 数学の学習記録をブログ形式で公開
- 📅 **Weekly Diary** - 週間日記（1週間のまとめ）を公開
- 📚 **Resources** - PDF や外部リンクを整理して公開
- 🎨 **モダンな UI** - ダークテーマ、アニメーション、レスポンシブ
- 🔐 **管理パネル** - 日記・リソース・サイト設定を GUI で管理
- ⚡ **高速** - ISR による高速なページ配信
- 🔍 **コマンドパレット** - `⌘+K` でサイト内検索

## 🚀 クイックスタート

### 1. リポジトリをクローン

```bash
git clone https://github.com/your-username/website.git
cd website
```

### 2. 依存関係をインストール

```bash
pnpm install
```

### 3. 環境変数を設定

```bash
cp .env.example .env.local
```

`.env.local` を編集して Supabase の認証情報を入力：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 4. Supabase でテーブルを作成

`docs/SUPABASE_SETUP.md` の SQL スキーマを実行

### 5. 開発サーバーを起動

```bash
pnpm dev
```

http://localhost:3000 でサイトが表示されます。

## 📁 プロジェクト構成

```
src/
├── app/                # Next.js App Router
│   ├── admin/          # 管理パネル
│   ├── api/            # API ルート
│   ├── diary/          # 日記ページ
│   ├── resources/      # リソースページ
│   └── about/          # About ページ
├── components/         # React コンポーネント
├── lib/                # ユーティリティ・データ取得
└── types/              # TypeScript 型定義
```

## 🔧 管理パネル

| ページ | URL | 機能 |
|--------|-----|------|
| ログイン | `/login` | 認証 |
| ダッシュボード | `/admin/dashboard` | 統計・概要 |
| 日記管理 | `/admin/diary` | 記事の CRUD |
| 週間日記管理 | `/admin/weekly-diary` | 週間日記の CRUD |
| リソース管理 | `/admin/resources` | 資料の管理 |
| サイト設定 | `/admin/site` | トップページ設定 |
| About 設定 | `/admin/about` | プロフィール編集 |

## 🌐 デプロイ

### Vercel（推奨）

1. GitHub リポジトリを Vercel に接続
2. 環境変数を設定
3. デプロイ

詳細は `DEPLOYMENT_CHECKLIST.md` を参照

## 📖 ドキュメント

- [Supabase セットアップ](docs/SUPABASE_SETUP.md)
- [実装サマリー](docs/IMPLEMENTATION_SUMMARY.md)
- [デプロイチェックリスト](DEPLOYMENT_CHECKLIST.md)

## 🛠️ 技術スタック

- **フレームワーク**: Next.js 16 (App Router)
- **データベース**: Supabase (PostgreSQL)
- **認証**: Supabase Auth
- **スタイリング**: Tailwind CSS
- **アニメーション**: Framer Motion
- **数式**: KaTeX
- **エディタ**: Ace Editor

## 📄 ライセンス

MIT
