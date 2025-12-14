# 実装サマリー

## 概要

Akari Math Lab は Next.js 16 と Supabase を使用した数学学習ポートフォリオサイトです。
管理パネルから日記、リソース、サイト設定を管理できます。

## 技術スタック

| 技術 | 用途 |
|------|------|
| Next.js 16 (App Router) | フロントエンド・サーバーサイド |
| Supabase | データベース・認証 |
| Tailwind CSS | スタイリング |
| Framer Motion | アニメーション |
| KaTeX | 数式レンダリング |
| Ace Editor | リッチテキストエディタ |

## アーキテクチャ

```
src/
├── app/                    # Next.js App Router
│   ├── admin/              # 管理パネル
│   │   ├── dashboard/      # ダッシュボード
│   │   ├── diary/          # 日記管理
│   │   ├── weekly-diary/   # 週間日記管理
│   │   ├── resources/      # リソース管理
│   │   ├── site/           # サイト設定
│   │   ├── about/          # About 設定
│   │   ├── login/          # ログイン
│   │   └── layout.tsx      # 管理画面レイアウト
│   ├── api/                # API ルート
│   │   └── admin/          # 管理 API
│   ├── diary/              # 公開日記ページ
│   ├── weekly-diary/       # 公開週間日記ページ
│   ├── resources/          # 公開リソースページ
│   ├── about/              # About ページ
│   └── page.tsx            # トップページ
├── components/
│   ├── admin/              # 管理画面コンポーネント
│   ├── diary/              # 日記コンポーネント
│   ├── home/               # ホームページセクション
│   └── ui/                 # 共通 UI コンポーネント
├── lib/
│   ├── supabase/           # Supabase クライアント
│   ├── diary.ts            # 日記データ取得
│   ├── content.ts          # コンテンツデータ取得
│   └── types.ts            # 型定義
└── middleware.ts           # 認証ミドルウェア
```

## 主要機能

### 1. 認証システム

- Supabase Auth によるメール/パスワード認証
- ミドルウェアによる `/admin/*` ルートの保護
- セッション管理と自動リフレッシュ

### 2. 管理パネル

| 機能 | 説明 |
|------|------|
| ダッシュボード | 統計情報（記事数、閲覧数）、最近の投稿 |
| 日記管理 | CRUD、検索、フィルター、リッチエディタ |
| 週間日記管理 | CRUD、リッチエディタ |
| リソース管理 | PDF/外部リンクの管理 |
| サイト設定 | ヒーロー、プロジェクト、タイムライン |
| About 設定 | プロフィール、スキル、セクション |

### 3. 公開サイト機能

- **インタラクティブ背景**: マウス追従パーティクルアニメーション
- **コマンドパレット**: `⌘+K` でサイト内検索
- **スクロール進捗**: ページ上部のプログレスバー
- **テーマ切り替え**: ダーク/ライト/システム設定
- **目次**: 日記詳細ページのスティッキー目次
- **読了時間**: 日本語/英語対応の推定時間表示
- **スキルレーダー**: About ページの SVG チャート
- **活動ヒートマップ**: GitHub Contributions 風の可視化

### 4. API ルート

```
GET    /api/admin/diary          # 日記一覧
POST   /api/admin/diary          # 日記作成
GET    /api/admin/diary/[id]     # 日記詳細
PUT    /api/admin/diary/[id]     # 日記更新
DELETE /api/admin/diary/[id]     # 日記削除

GET    /api/admin/weekly-diary          # 週間日記一覧
POST   /api/admin/weekly-diary          # 週間日記作成
GET    /api/admin/weekly-diary/[id]     # 週間日記詳細
PUT    /api/admin/weekly-diary/[id]     # 週間日記更新
DELETE /api/admin/weekly-diary/[id]     # 週間日記削除

GET    /api/admin/resources      # リソース一覧
POST   /api/admin/resources      # リソース作成
GET    /api/admin/resources/[id] # リソース詳細
PUT    /api/admin/resources/[id] # リソース更新
DELETE /api/admin/resources/[id] # リソース削除

GET    /api/admin/site           # サイト設定取得
PUT    /api/admin/site           # サイト設定更新

GET    /api/admin/about          # About 設定取得
PUT    /api/admin/about          # About 設定更新

POST   /api/revalidate           # ISR 再生成
POST   /api/diary/view           # 閲覧数カウント
```

## データベーススキーマ

### diary テーブル

| カラム | 型 | 説明 |
|--------|------|------|
| id | UUID | 主キー |
| title | TEXT | タイトル |
| slug | TEXT | URL スラッグ（ユニーク） |
| body | TEXT | 本文（HTML/Markdown） |
| summary | TEXT | 要約 |
| folder | TEXT | フォルダ分類 |
| tags | TEXT[] | タグ配列 |
| status | TEXT | draft / published |
| hero_image_url | TEXT | ヒーロー画像 URL |
| view_count | INTEGER | 閲覧数 |
| published_at | TIMESTAMPTZ | 公開日時 |
| created_at | TIMESTAMPTZ | 作成日時 |
| updated_at | TIMESTAMPTZ | 更新日時 |

### weekly_diary テーブル

| カラム | 型 | 説明 |
|--------|------|------|
| id | UUID | 主キー |
| title | TEXT | タイトル |
| slug | TEXT | URL スラッグ（ユニーク） |
| body | TEXT | 本文（HTML/Markdown） |
| summary | TEXT | 要約 |
| folder | TEXT | フォルダ分類 |
| tags | TEXT[] | タグ配列 |
| status | TEXT | draft / published |
| hero_image_url | TEXT | ヒーロー画像 URL |
| view_count | INTEGER | 閲覧数 |
| published_at | TIMESTAMPTZ | 公開日時 |
| created_at | TIMESTAMPTZ | 作成日時 |
| updated_at | TIMESTAMPTZ | 更新日時 |

### site テーブル（シングルトン）

| カラム | 型 | 説明 |
|--------|------|------|
| key | TEXT | 主キー（'default'） |
| hero_title | TEXT | ヒーロータイトル |
| hero_lead | TEXT | ヒーローリード文 |
| focuses | JSONB | 研究フォーカス配列 |
| projects | JSONB | プロジェクト配列 |
| timeline | JSONB | タイムライン配列 |
| contact_links | JSONB | コンタクトリンク配列 |

### about テーブル（シングルトン）

| カラム | 型 | 説明 |
|--------|------|------|
| key | TEXT | 主キー（'default'） |
| intro | TEXT | イントロ文 |
| mission | TEXT | ミッション文 |
| sections | JSONB | セクション配列 |
| skills | TEXT[] | スキル配列 |
| quote | TEXT | 引用文 |

### resources テーブル

| カラム | 型 | 説明 |
|--------|------|------|
| id | UUID | 主キー |
| title | TEXT | タイトル |
| description | TEXT | 説明 |
| category | TEXT | カテゴリ |
| file_url | TEXT | ファイル URL |
| external_url | TEXT | 外部 URL |

## セキュリティ

- ✅ Row Level Security (RLS) が全テーブルで有効
- ✅ 公開記事のみ匿名アクセス可能
- ✅ 管理操作は認証必須
- ✅ service_role キーはサーバーサイドのみ
- ✅ CSP ヘッダーで XSS 対策
- ✅ 入力バリデーション

## 環境変数

```bash
# 必須
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# オプション
REVALIDATE_SECRET=xxx  # Webhook 用
```

## 開発コマンド

```bash
# 開発サーバー起動
pnpm dev

# ビルド
pnpm build

# 本番サーバー起動
pnpm start

# Lint
pnpm lint
```
