# デプロイチェックリスト

Akari Math Lab を本番環境にデプロイするための手順です。

## デプロイ戦略

このプロジェクトは **特定ブランチへのマージ時のみ** デプロイされます：

| ブランチ | デプロイ | 環境 |
|----------|----------|------|
| `main` | ✅ 自動 | 本番 |
| `production` | ✅ 自動 | 本番 |
| その他 | ❌ スキップ | - |
| Pull Request | 🔄 プレビュー | プレビュー |

### 開発フロー

```
1. feature ブランチで開発
2. Pull Request を作成 → プレビューデプロイ（オプション）
3. レビュー後、main にマージ → 本番デプロイ
```

## 前提条件

- [ ] Supabase アカウント作成済み
- [ ] Node.js 18+ インストール済み
- [ ] pnpm インストール済み（推奨）
- [ ] Vercel アカウント（または他のホスティング）

## 1. Supabase セットアップ

- [ ] Supabase プロジェクトを作成
- [ ] `docs/SUPABASE_SETUP.md` の SQL スキーマを実行
- [ ] Authentication → Users で管理者ユーザーを作成
- [ ] プロジェクト URL と API キーをコピー

## 2. ローカル環境での確認

```bash
# 環境変数ファイルを作成
cp .env.example .env.local

# 依存関係をインストール
pnpm install

# Ace Editor のファイルをコピー
mkdir -p public/ace-builds
cp -r node_modules/ace-builds/src-noconflict public/ace-builds/

# 開発サーバーを起動
pnpm dev
```

- [ ] http://localhost:3000 でサイトが表示される
- [ ] http://localhost:3000/login でログインできる
- [ ] 日記の作成・編集・削除が動作する

## 3. 本番デプロイ（Vercel）

### 方法 A: Vercel Git 連携（推奨）

`vercel.json` の設定により、`main` / `production` ブランチのみデプロイされます。

1. Vercel Dashboard でプロジェクトを作成
2. GitHub リポジトリを連携
3. 環境変数を設定
4. `main` ブランチにマージすると自動デプロイ

### 方法 B: GitHub Actions 経由

より細かい制御が必要な場合は、GitHub Actions を使用できます。

**必要な Secrets（GitHub リポジトリ Settings → Secrets）:**
- `VERCEL_TOKEN` - Vercel のアクセストークン（Vercel Settings → Tokens）
- `VERCEL_ORG_ID` - Vercel の組織 ID（Vercel Project Settings → General）
- `VERCEL_PROJECT_ID` - Vercel のプロジェクト ID（同上）

### 環境変数の設定

Vercel Dashboard → Project → Settings → Environment Variables:

- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase プロジェクト URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - anon public キー
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - service_role キー
- [ ] `REVALIDATE_SECRET` - Webhook 用のシークレット

### デプロイ

- [ ] GitHub リポジトリを Vercel に接続
- [ ] デプロイが成功することを確認
- [ ] カスタムドメインを設定（オプション）

## 4. デプロイ後の確認

- [ ] トップページが正常に表示される
- [ ] `/diary` で記事一覧が表示される
- [ ] `/login` でログインできる
- [ ] 管理画面で記事を作成/編集できる
- [ ] 公開した記事がサイトに反映される

## 5. オプション設定

### Webhook（コンテンツ更新時の自動再生成）

```
POST https://your-domain.com/api/revalidate?secret=REVALIDATE_SECRET
Content-Type: application/json

{
  "paths": ["/", "/diary", "/resources"]
}
```

### Google Analytics / Search Console

- [ ] GA タグを追加（必要に応じて）
- [ ] Search Console にサイトを登録
- [ ] sitemap.xml を送信

## トラブルシューティング

### ビルドエラー

```bash
# ローカルでビルドをテスト
pnpm build
```

### 認証エラー

- 環境変数が正しく設定されているか確認
- Supabase でユーザーが「Confirmed」か確認

### 500 エラー

- Vercel のログを確認
- Supabase の RLS ポリシーを確認

## サポート

- セットアップ詳細: `docs/SUPABASE_SETUP.md`
- 実装詳細: `docs/IMPLEMENTATION_SUMMARY.md`
