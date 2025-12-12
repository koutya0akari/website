# Supabaseセットアップガイド

このドキュメントでは、管理パネルに必要なSupabaseデータベーススキーマとセットアップについて説明します。

## データベーススキーマ

### Diaryテーブル

Supabaseプロジェクトで以下のテーブルを作成してください：

```sql
-- Create diary table
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

-- Create index for better query performance
CREATE INDEX idx_diary_status ON diary(status);
CREATE INDEX idx_diary_slug ON diary(slug);
CREATE INDEX idx_diary_published_at ON diary(published_at DESC);
CREATE INDEX idx_diary_created_at ON diary(created_at DESC);

-- Enable Row Level Security
ALTER TABLE diary ENABLE ROW LEVEL SECURITY;

-- Policy: Public read for published posts
CREATE POLICY "Public read for published" ON diary
  FOR SELECT USING (status = 'published');

-- Policy: Authenticated users have full access
CREATE POLICY "Authenticated users full access" ON diary
  FOR ALL USING (auth.role() = 'authenticated');
```

### タイムスタンプ自動更新トリガー

```sql
-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_diary_updated_at
  BEFORE UPDATE ON diary
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## 環境変数

`.env.example`を`.env.local`にコピーして、Supabaseの認証情報を入力してください：

```bash
cp .env.example .env.local
```

必要な変数：
- `NEXT_PUBLIC_SUPABASE_URL`: SupabaseプロジェクトのURL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabaseの匿名/公開キー
- `SUPABASE_SERVICE_ROLE_KEY`: Supabaseのサービスロールキー（サーバーサイドのみ）
- `USE_SUPABASE`: microCMSの代わりにSupabaseを使用する場合は`true`に設定

## 認証のセットアップ

1. Supabaseプロジェクトダッシュボードにアクセス
2. Authentication > Providersに移動
3. Emailプロバイダーを有効化
4. Authentication > Usersでユーザーアカウントを作成
5. このアカウントを使用して`/admin/login`にログイン

## microCMSからの移行

アプリケーションは、フィーチャーフラグ（`USE_SUPABASE`）を通じてmicroCMSとSupabaseの両方をサポートします。

- `USE_SUPABASE=false`（デフォルト）の場合: microCMSを使用
- `USE_SUPABASE=true`の場合: Supabaseを使用

これにより段階的な移行が可能です：

1. Supabaseデータベースと認証をセットアップ
2. オプションでmicroCMSからSupabaseに既存データを移行
3. `USE_SUPABASE=true`に切り替えてSupabaseに切り替え
4. デプロイ前に十分にテスト

## セキュリティに関する考慮事項

1. **行レベルセキュリティ（RLS）**: diaryテーブルでポリシー付きで有効化
2. **API認証**: すべての管理APIルートで認証済みユーザーをチェック
3. **入力バリデーション**: スラッグの一意性と必須フィールドをバリデーション
4. **XSS保護**: コンテンツは表示時にサニタイズが必要
5. **CSPヘッダー**: ace-builds Webワーカーを許可するよう更新

## 管理パネルの機能

- **ダッシュボード**: 統計情報を表示（投稿総数、下書き、公開済み、閲覧数）
- **日記管理**: 投稿の作成、読み取り、更新、削除
- **Markdownエディタ**: シンタックスハイライト付きAceエディタ
- **自動保存**: エディタのコンテンツは5秒ごとにlocalStorageに自動保存
- **検索＆フィルター**: タイトル/スラッグで検索、ステータスでフィルター、さまざまなフィールドでソート
- **タグ**: 複数タグのサポート
- **ステータス**: 下書きまたは公開済み
- **ヒーロー画像**: URLベースの画像（将来：アップロードサポート）

## 開発

1. 依存関係をインストール：
```bash
npm install
```

2. ace-buildsをpublicディレクトリにコピー：
```bash
mkdir -p public/ace-builds
cp -r node_modules/ace-builds/src-noconflict public/ace-builds/
```

注意: この手順はビルドプロセスで自動化されていますが、ローカル開発には必要です。

3. 開発サーバーを起動：
```bash
npm run dev
```

4. 管理パネルにアクセス：
```
http://localhost:3000/admin/login
```

## 本番デプロイ

1. ホスティングプラットフォーム（Vercelなど）で環境変数を設定
2. ビルド時にace-buildsがpublicディレクトリにコピーされることを確認
3. 認証とCRUD操作をテスト
4. Supabaseのログと使用状況を監視

## トラブルシューティング

### Aceエディタが読み込まれない
- ace-buildsが`public/ace-builds/src-noconflict/`にあることを確認
- ブラウザコンソールでCSPエラーを確認
- `next.config.ts`のCSPヘッダーに`worker-src 'self' blob:`と`script-src 'unsafe-eval'`が含まれていることを確認

### 認証の問題
- 環境変数のSupabase認証情報を確認
- Supabaseダッシュボードでユーザーアカウントを確認
- ミドルウェアがログインルートをブロックしていないことを確認

### APIエラー
- SupabaseのRLSポリシーを確認
- ユーザーが認証済みであることを確認
- 詳細なエラーメッセージについてブラウザのネットワークタブを確認
