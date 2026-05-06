# Body Markdown の使い方

数学メモ、メモ、日記の Body では Markdown と一部 HTML を使えます。

## 画像 URL をそのまま表示する

画像を直接表示したい場合は、画像 URL を単独行で貼り付けます。

```markdown
https://example.supabase.co/storage/v1/object/public/media/diary/image.webp
```

この形式では、URL 全体が1つの段落になっている場合だけ画像として表示されます。文章中に混ぜた URL は自動では画像化されません。

## 説明文を指定する

画像の説明を指定したい場合は、通常の Markdown 画像記法を使います。

```markdown
![板書の写真](https://example.supabase.co/storage/v1/object/public/media/diary/blackboard.webp)
```

## 画像化される URL

自動表示の対象は、サイトの Content Security Policy で許可済みの HTTPS 画像 URL だけです。

- Supabase Media の公開 URL
- `images.microcms-assets.io`
- `*.githubusercontent.com`
- `abs.twimg.com`
- `pbs.twimg.com`

拡張子は `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`, `.avif` に対応しています。画像ではない URL は従来通りリンクカードとして表示されます。

## 通常リンク

画像ではない URL を単独行で貼るとリンクカードになります。

```markdown
https://example.com/article
```

文章中のリンクは通常の Markdown リンク記法を使います。

```markdown
[参考記事](https://example.com/article)
```
