# Akari Math Lab – 数学科学生のポートフォリオ (Rails)

Akari の学習・研究活動を紹介するポートフォリオを Ruby on Rails で構築したプロジェクトです。静的 HTML だった `docs/` の構成を分析し、Rails のビューと YAML コンテンツに置き換えて動的にレンダリングできるようにしました。

## 主な特徴

- `config/portfolio/*.yml` に定義したデータを読み込み、ヒーローセクションからタイムラインまでを動的に構成
- `app/views/pages/home.html.erb` / `about.html.erb` で繰り返し要素をループ処理し、カード・タイムラインを簡単に追加可能
- Google Fonts (Inter, Signika Negative) と MathJax をレイアウトに組み込み、数学系コンテンツ向けの見た目を整備
- `app/assets/stylesheets/application.css` にレスポンシブ対応のカスタムデザインを集約
- Stimulus を用いたハイライトの自動ローテーションやスクロール時のフェードイン、スムーズスクロールで動的な体験を提供

## セットアップ

1. Ruby 3.2.3 以上を用意し、Bundler をインストールします。
2. 依存関係をインストールします。

   ```bash
   bundle install
   ```

3. サーバーを起動し、`http://localhost:3000` にアクセスします。

   ```bash
   bin/rails server
   ```

SQLite を利用する機能は現時点でありませんが、Rails がデータベース接続を求める場合は `bin/rails db:prepare` を実行してください。

## コンテンツの更新方法

- ホームページ: `config/portfolio/home.yml`
  - `hero` … タグライン、自己紹介、アクションボタン、ピル型ハイライト
  - `focus` … 学習領域のカード群とカテゴリーリスト
  - `projects` … プロジェクト概要（現在はヘッダーのみ）
  - `timeline` … 活動ログ（年度・詳細）
  - `resources` … 自己紹介と外部リンク集
- About ページ: `config/portfolio/about.yml`
  - `hero` … プロフィール概要と 2 カラムの詳細
  - `skills` … カード形式で表示するスキルセット

※ HTML をそのまま反映したい項目は `_html` で終わるフィールドに格納しています（例: `description_html`）。docs/ と同じ文面・リンク構造を保つため、文章の書き換えが不要な場合は文字列をそのまま維持してください。

YAML を編集後はサーバーを再起動するか、Spring を使用している場合は `bin/spring stop` を実行すると確実に反映されます。

## GitHub Pages 用の静的エクスポート

Rails で整形した HTML をそのまま GitHub Pages に配置したい場合は、以下のタスクで `docs/` を再生成できます。

```bash
bin/rake static:export
```

生成されるファイル:

```
docs/
├── index.html
└── about/index.html
```

必要に応じて GitHub Pages の設定で Branch: `main`, Folder: `/docs` を選択してください。

## ライセンス

このリポジトリは MIT ライセンスで公開しています。
