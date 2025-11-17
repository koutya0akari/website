# Akari Math Lab (Next.js + microCMS)

Vercel でホスティングし、microCMS をヘッドレス CMS として使うために再構築したポートフォリオです。トップ、Diary、About、Resources の各ページが microCMS の API を通じて同期され、ISR（Incremental Static Regeneration）と手動 Revalidate API で常に最新の内容を配信します。

## Stack

- **Next.js 16 / App Router** – server components + ISR、`app/` ディレクトリ構成。
- **Tailwind CSS** – カスタムダークテーマ＋タイポグラフィプラグイン。
- **microCMS** – 4 つのエンドポイント（`site`, `about`, `diary`, `resources`）でコンテンツを管理。
- **Vercel** – Preview/Production を自動ビルド。microCMS webhook から再検証 API を呼び出し。

## セットアップ

```bash
cd akari-vercel
npm install
cp .env.example .env.local
npm run dev
```

`.env.local` に以下を記入します（microCMS の「設定 > サービス情報」で確認できます）。

```bash
MICROCMS_SERVICE_DOMAIN=your-service-id
MICROCMS_API_KEY=your-api-key
REVALIDATE_SECRET=任意の長い文字列
```

`npm run dev` で [http://localhost:3000](http://localhost:3000) にアクセスすると反映を確認できます。環境変数が未設定の場合は `src/data/sample.ts` のダミーデータでプレビューされます。

## microCMS モデル

下記のフィールド ID で作成すると、コードからそのまま取得できます。

| エンドポイント | 種別 | 推奨フィールド |
| --- | --- | --- |
| `site` | シングル | `heroTitle (テキスト)`, `heroLead (テキストエリア)`, `heroPrimaryCtaLabel (テキスト)`, `heroPrimaryCtaUrl (テキスト)`, `heroSecondaryCtaLabel (テキスト, 任意)`, `heroSecondaryCtaUrl (テキスト, 任意)`, `profile (オブジェクト: name, role, summary, location, avatar)` , `focuses (リスト: id, title, description)`, `projects (リスト: title, summary, highlights[複数テキスト], link, status)`, `timeline (リスト: title, date, description, linkLabel, linkUrl)`, `contactLinks (リスト: label, url)` |
| `about` | シングル | `intro (テキスト)`, `mission (テキスト)`, `quote (テキスト, 任意)`, `sections (リスト: heading, body)`, `skills (複数テキスト)` |
| `diary` | リスト | `title (テキスト)`, `slug (テキスト, unique)`, `summary (テキスト)`, `body (リッチエディタ or Markdown)`, `folder (テキスト)`, `tags (複数選択)`, `heroImage (画像, 任意)` |
| `resources` | リスト | `title (テキスト)`, `description (テキスト)`, `category (テキスト)`, `fileUrl (メディアまたは外部URL)`, `externalUrl (テキスト, 任意)` |

- `slug` は日記のパーマリンクに使用するため、microCMS 側でユニークにしてください。
- リッチエディタに数式を貼る場合は MathJax 形式をそのまま保存できます。Next.js 側では html を `dangerouslySetInnerHTML` で表示しています。

## Revalidate API / Webhook

`src/app/api/revalidate/route.ts` が microCMS からの再生成フックを受け取ります。

1. Vercel で `REVALIDATE_SECRET` を Production/Preview どちらにも設定。
2. microCMS の「Webhook」を作成し、URL を `https://<vercel-domain>/api/revalidate?secret=REVALIDATE_SECRET` に設定。
3. Payload 例:
   ```json
   {
     "paths": ["/", "/diary", "/resources"]
   }
   ```

送信後、Next.js が該当パスを再生成します（未指定の場合は `/`, `/diary`, `/resources` を再検証）。

## デプロイ手順（Vercel）

1. GitHub / GitLab / Bitbucket いずれかに `akari-vercel` ディレクトリをプロジェクトとして登録。
2. Vercel で「Add New... > Project」を選び、リポジトリをインポート。
3. Build & Output 設定はデフォルト（`npm run build`, `./`）。
4. Environment Variables に `MICROCMS_SERVICE_DOMAIN`, `MICROCMS_API_KEY`, `REVALIDATE_SECRET` を登録。
5. デプロイすると `/` と `/diary`, `/resources`, `/about` が ISR で公開されます。

## 構成メモ

- `src/lib/microcms.ts` に API クライアントとフォールバックがまとまっています。CMS が落ちてもサンプルデータで描画が継続します。
- `src/app/diary/page.tsx` ではクライアントコンポーネント (`DiaryFilter`) を使い、検索・タグ・フォルダでフィルタリング可能です。
- `src/app/api/revalidate/route.ts` を使っていつでも Incremental Static Regeneration を手動で呼び出せます。

## ドメイン移行

旧 `akari0koutya.jp` から `akari0koutya.com` への移行手順、DNS/SEO のチェックリストは `docs/migration-guide.md` に整理しました。コンテンツのエクスポート→microCMS への投入→Vercel でのドメイン切替をこのガイドに沿って進めてください。

必要に応じてセクション構成やフィールドを追加しても、microCMS 側のフィールド ID を合わせれば拡張できます。
