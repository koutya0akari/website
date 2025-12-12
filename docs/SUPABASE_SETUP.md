# Supabase セットアップガイド

このドキュメントでは、Akari Math Lab で使用する Supabase データベースと認証のセットアップについて説明します。

## 前提条件

- [Supabase](https://supabase.com) アカウント
- Node.js 18 以上
- pnpm（推奨）または npm

## 1. Supabase プロジェクトの作成

1. [Supabase Dashboard](https://supabase.com/dashboard) にアクセス
2. 「New Project」をクリック
3. プロジェクト名、データベースパスワード、リージョンを設定
4. プロジェクトが作成されるまで待機（1〜2分）

## 2. データベーススキーマ

Supabase の SQL Editor で以下のスキーマを実行してください。

### 2.1 Diary テーブル（日記/ブログ記事）

```sql
-- Diary テーブル
CREATE TABLE diary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  body TEXT,
  summary TEXT,
  folder TEXT,
  tags TEXT[],
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  hero_image_url TEXT,
  view_count INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_diary_status ON diary(status);
CREATE INDEX idx_diary_slug ON diary(slug);
CREATE INDEX idx_diary_published_at ON diary(published_at DESC);
CREATE INDEX idx_diary_created_at ON diary(created_at DESC);

-- Row Level Security を有効化
ALTER TABLE diary ENABLE ROW LEVEL SECURITY;

-- ポリシー: 公開記事は誰でも読める
CREATE POLICY "Public read for published" ON diary
  FOR SELECT USING (status = 'published');

-- ポリシー: 認証ユーザーはフルアクセス
CREATE POLICY "Authenticated users full access" ON diary
  FOR ALL USING (auth.role() = 'authenticated');
```

### 2.2 Site テーブル（サイト設定）

```sql
-- Site テーブル（シングルトン）
CREATE TABLE site (
  key TEXT PRIMARY KEY DEFAULT 'default',
  hero_title TEXT NOT NULL DEFAULT '',
  hero_lead TEXT NOT NULL DEFAULT '',
  hero_primary_cta_label TEXT NOT NULL DEFAULT '',
  hero_primary_cta_url TEXT NOT NULL DEFAULT '',
  hero_secondary_cta_label TEXT,
  hero_secondary_cta_url TEXT,
  focuses JSONB NOT NULL DEFAULT '[]'::jsonb,
  projects JSONB NOT NULL DEFAULT '[]'::jsonb,
  timeline JSONB NOT NULL DEFAULT '[]'::jsonb,
  contact_links JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE site ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read site" ON site FOR SELECT USING (true);
CREATE POLICY "Authenticated users full access site" ON site
  FOR ALL USING (auth.role() = 'authenticated');

-- 初期データ挿入
INSERT INTO site (key, hero_title, hero_lead, hero_primary_cta_label, hero_primary_cta_url)
VALUES ('default', 'Mathematics as a daily practice', '代数幾何・圏論を軸に学習しています。数学ノートやメモなどの保管場所。', 'Math Diary を見る', '/diary');
```

### 2.3 About テーブル（プロフィール）

```sql
-- About テーブル（シングルトン）
CREATE TABLE about (
  key TEXT PRIMARY KEY DEFAULT 'default',
  intro TEXT NOT NULL DEFAULT '',
  mission TEXT NOT NULL DEFAULT '',
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  skills TEXT[] NOT NULL DEFAULT ARRAY[]::text[],
  quote TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE about ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read about" ON about FOR SELECT USING (true);
CREATE POLICY "Authenticated users full access about" ON about
  FOR ALL USING (auth.role() = 'authenticated');

-- 初期データ挿入
INSERT INTO about (key, intro, mission, skills)
VALUES ('default', 'Akari Math Lab へようこそ', '数学の美しさを探求し、学びを共有することを目指しています。', ARRAY['代数幾何', '圏論', 'LaTeX', 'プログラミング']);
```

### 2.4 Resources テーブル（公開資料）

```sql
-- Resources テーブル
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  file_url TEXT NOT NULL DEFAULT '',
  external_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read resources" ON resources FOR SELECT USING (true);
CREATE POLICY "Authenticated users full access resources" ON resources
  FOR ALL USING (auth.role() = 'authenticated');
```

### 2.5 自動更新トリガー

```sql
-- updated_at 自動更新関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 各テーブルにトリガーを設定
CREATE TRIGGER update_diary_updated_at
  BEFORE UPDATE ON diary
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_updated_at
  BEFORE UPDATE ON site
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_about_updated_at
  BEFORE UPDATE ON about
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## 3. 環境変数の設定

`.env.local` ファイルを作成し、以下を設定します：

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Revalidate（Webhook 用）
REVALIDATE_SECRET=your-random-secret-string
```

### キーの取得方法

1. Supabase Dashboard → Project Settings → API
2. **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
3. **anon public** キー → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **service_role** キー → `SUPABASE_SERVICE_ROLE_KEY`

> ⚠️ **重要**: `service_role` キーは絶対にブラウザに公開しないでください。`NEXT_PUBLIC_` を付けないでください。

## 4. 認証のセットアップ

### 4.1 管理者ユーザーの作成

1. Supabase Dashboard → Authentication → Users
2. 「Add User」→「Create New User」
3. メールアドレスとパスワードを入力
4. 「Auto Confirm User?」にチェックを入れる
5. 「Create User」をクリック

### 4.2 ログインテスト

```bash
pnpm dev
```

1. http://localhost:3000/login にアクセス
2. 作成したユーザーでログイン
3. ダッシュボードが表示されれば成功

## 5. 管理パネルの機能

| 機能 | パス | 説明 |
|------|------|------|
| ダッシュボード | `/admin/dashboard` | 統計情報、最近の投稿 |
| 日記管理 | `/admin/diary` | 記事の CRUD |
| リソース管理 | `/admin/resources` | 公開資料の管理 |
| サイト設定 | `/admin/site` | ヒーロー、プロジェクト等 |
| About 設定 | `/admin/about` | プロフィール編集 |

## 6. セキュリティ

- ✅ Row Level Security (RLS) が全テーブルで有効
- ✅ 管理 API は認証必須
- ✅ service_role キーはサーバーサイドのみ
- ✅ CSP ヘッダーで XSS 対策

## 7. トラブルシューティング

### 「401 Unauthorized」エラー

- `.env.local` の `NEXT_PUBLIC_SUPABASE_ANON_KEY` が正しいか確認
- Supabase でユーザーが確認済み（Confirmed）か確認
- ブラウザのキャッシュをクリア

### データが取得できない

- RLS ポリシーが正しく設定されているか確認
- `status = 'published'` の記事があるか確認

### エディタが動かない

- `public/ace-builds/` にファイルがあるか確認
- ブラウザの開発者ツールで CSP エラーを確認

## 8. 本番デプロイ

### Vercel の場合

1. Environment Variables に以下を設定：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `REVALIDATE_SECRET`

2. デプロイ後、`/login` で認証をテスト

### その他のプラットフォーム

Node.js 18+ が動作する環境であれば、同様の環境変数を設定してデプロイ可能です。
