# デプロイチェックリスト

Supabase管理パネルをデプロイするための手順：

## 前提条件
- [ ] Supabaseアカウント作成済み
- [ ] Node.jsとnpmがインストール済み
- [ ] デプロイプラットフォーム（Vercelなど）へのアクセス

## Supabaseセットアップ
- [ ] 新しいSupabaseプロジェクトを作成
- [ ] `docs/SUPABASE_SETUP.md`からSQLスキーマを実行
- [ ] Authentication > Usersで管理者ユーザーを作成
- [ ] プロジェクトURLとキーをコピー

## ローカルテスト
- [ ] `.env.example`を`.env.local`にコピー
- [ ] Supabaseの認証情報を入力
- [ ] `npm install`を実行
- [ ] ace-buildsをコピー: `mkdir -p public/ace-builds && cp -r node_modules/ace-builds/src-noconflict public/ace-builds/`
- [ ] 開発サーバーを起動: `npm run dev`
- [ ] `http://localhost:3000/admin/login`でログインテスト
- [ ] テスト投稿を作成
- [ ] CRUD操作が動作することを確認

## 本番デプロイ
- [ ] ホスティングプラットフォームで環境変数を設定:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `USE_SUPABASE=false` (初期はmicroCMSを使用し続ける)
- [ ] ace-buildsをpublicディレクトリにコピーするビルドスクリプトを追加
- [ ] ホスティングプラットフォームにデプロイ
- [ ] ビルドが成功することを確認
- [ ] 本番環境でログインをテスト
- [ ] 投稿の作成/編集をテスト

## 移行（オプション）
- [ ] microCMSから既存データをエクスポート（移行する場合）
- [ ] Supabaseにデータをインポート
- [ ] すべての投稿が正しく移行されたことを確認
- [ ] 環境変数で`USE_SUPABASE=true`に設定
- [ ] 公開されたブログ投稿が正しく表示されることをテスト
- [ ] 問題がないか監視
- [ ] microCMSの認証情報をバックアップとして保持（素早くロールバックするため）

## デプロイ後
- [ ] 認証フローをテスト
- [ ] CRUD操作をテスト
- [ ] RLSポリシーが機能していることを確認
- [ ] CSPヘッダーがace-buildsをブロックしていないか確認
- [ ] Supabaseログを監視
- [ ] アプリケーションエラーを監視
- [ ] チームドキュメントを更新

## ロールバックプラン
問題が発生した場合：
1. 環境変数で`USE_SUPABASE=false`に設定
2. アプリケーションを再起動
3. システムがmicroCMSに戻る
4. 問題を調査して修正
5. `USE_SUPABASE=true`で再試行

## サポート
- ドキュメント: `docs/SUPABASE_SETUP.md`
- 実装詳細: `docs/IMPLEMENTATION_SUMMARY.md`
- トラブルシューティング: docs/SUPABASE_SETUP.mdを参照
