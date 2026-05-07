# コメント機能の設定

記事詳細ページのコメントには Giscus を使っています。数学メモ、メモ、日記の詳細ページに表示されます。

## 既定の設定

通常は追加の環境変数なしで動作します。

- repository: `koutya0akari/website`
- category: `General`
- mapping: `pathname`

GitHub Discussions の `General` category に、ページごとの discussion が作成されます。

## カテゴリを変更する場合

別の repository ID や discussion category ID を使う場合だけ、環境変数で上書きします。

```env
NEXT_PUBLIC_GISCUS_REPO_ID=R_...
NEXT_PUBLIC_GISCUS_CATEGORY_ID=DIC_...
```

category 名を変える場合は、`src/components/diary/comments.tsx` の `GISCUS_CATEGORY` も同じ名前に変更してください。

## コメントできないときの確認

- GitHub Discussions が repository で有効になっている。
- Giscus GitHub App が repository にインストールされている。
- ブラウザの console に `giscus.app` の CSP エラーが出ていない。
- GitHub にログインしている。
