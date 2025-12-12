# akari0koutya.jp → akari0koutya.com 移行手順

`akari0koutya.com` では Next.js + microCMS + Vercel を正式構成とし、旧 `akari0koutya.jp` の静的/PHPサイトを段階的に置き換えます。以下の手順でコンテンツとドメインを移行してください。

## 1. 旧サイトのデータをエクスポート

| 種別 | 取得ファイル | 備考 |
| --- | --- | --- |
| Diary | `docs/data/diary_entries.json` | 1 件ごとに `title`, `body`, `tags`, `folder`, `published_at` を確認 |
| Resources | `docs/data/resources_meta.json` + `docs/resources/files/` | ファイルは Vercel の `public/uploads` か外部ストレージへ移動 |
| Math articles / show.php | `docs/data/math_articles.json` | 使う場合のみ |
| OGP 画像 | `docs/assets/tako-card.png` など | `public/` へコピー |

> Tip: `json2csv docs/data/diary_entries.json --flatten-objects --flatten-arrays` のように整形すると microCMS へ貼り付けやすくなります。

## 2. microCMS でモデルを作成しインポート

1. `site`/`about`/`diary`/`resources` の 4 モデルは `akari-vercel/README.md` の表を参照して作成。
2. Diary は `slug` を旧 URL の `id` から生成（例: `2024-07-01-tsudoi`）。`publishedAt` は旧 JSON の `published_at` を使用。
3. Resources は `fileUrl` にマイグレート後の URL を入力。大きい PDF は microCMS のメディア機能より外部ストレージを推奨。
4. 追加で「Math Articles」など分離したい場合は endpoint を増やし、Next.js でページを増設できます。

## 3. Next.js (akari-vercel) の設定

```bash
cp .env.example .env.local
```

```env
MICROCMS_SERVICE_DOMAIN=your-service
MICROCMS_API_KEY=xxxxxxxx
REVALIDATE_SECRET=xxxxx
```

ローカルで確認:

```bash
npm install
npm run dev
```

microCMS に実データが入るとトップ/Diary/Resources すべてが旧サイト内容で表示されます。`npm run build` で production ビルドをチェックしてください。

## 4. Vercel へデプロイ

```bash
npm run build
npm run start # ローカル最終確認
```

GitHub などに push → Vercel でプロジェクトを作成します。

- Environment Variables に `.env.local` と同じ値を投入
- `Build Command: npm run build`, `Output: .next`
- microCMS からの webhook URL を `https://<vercel-app>.vercel.app/api/revalidate?secret=...` に設定

## 5. ドメインを akari0koutya.com に切り替え

1. Vercel Dashboard → Project → Settings → Domains で `akari0koutya.com` と `www.akari0koutya.com` を追加。
2. DNS プロバイダで以下を設定
   - `A` (root) → `76.76.21.21` (Vercel)
   - `CNAME` (`www`) → `cname.vercel-dns.com`
3. 旧 `akari0koutya.jp` からは 301 リダイレクトで `.com` へ誘導するのがベスト。Vercel 上で `.jp` を追加し、「Redirect to `akari0koutya.com`」を設定。
4. SSL 証明書は Vercel が自動発行。

## 6. SEO / アナリティクス更新

- Search Console / Bing Webmaster: `.com` を新規登録後、「アドレス変更ツール」で `.jp` から `.com` へ通知。
- Analytics のプロパティ URL を `.com` へ更新。
- `sitemap.xml` は Next.js 側で自動生成しないため、旧 PHP の代わりに microCMS 上で `resources` 情報から生成するページを今後追加することを推奨（例: `/api/sitemap`）。
- 主要ページの canonical が `.com` になるよう `src/app/layout.tsx` を更新済み。

## 7. 移行後のチェックリスト

- [ ] `https://akari0koutya.com` / `www` が HTTPS で表示される
- [ ] Diary / Resources の件数・本文が旧サイトと一致
- [ ] OGP 画像（`/tako-card.png` など）が正常表示
- [ ] microCMS から publish → webhook → `/api/revalidate` が成功する（Vercel Logs で確認）
- [ ] `.jp` へのアクセスが `.com` へリダイレクトされる

このガイドに沿って進めれば、旧サイトの全ページを Next.js + microCMS 構成で `akari0koutya.com` に集約できます。追加で自動インポートや Math セクションを再現したい場合は `scripts/` ディレクトリを作成して JSON → microCMS の API インポートスクリプトを追加してください。
