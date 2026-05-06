# 定理・命題ブロックの使い方

数学メモ、メモ、日記の Body では、Markdown に HTML ブロックを混ぜて定理や命題の枠を表示できます。

## 定理

```html
<div class="math-callout math-callout--theorem">
  <p class="math-callout__title">定理 1.1</p>
  <p>任意の素数 $p$ について、...</p>
</div>
```

## 命題

```html
<div class="math-callout math-callout--proposition">
  <p class="math-callout__title">命題</p>
  <p>条件 A のもとで B が成り立つ。</p>
</div>
```

## 数式を含める

本文と同じように inline math と display math を使えます。

```html
<div class="math-callout math-callout--theorem">
  <p class="math-callout__title">定理 2.3</p>
  <p>$a,b \in \mathbb{R}$ とする。このとき次が成り立つ。</p>
  <p>
    $$
    (a+b)^2 \leq 2a^2 + 2b^2
    $$
  </p>
</div>
```

## リストを含める

HTML ブロックの中では Markdown 記法が展開されない場合があります。段落やリストは HTML タグで書いてください。

```html
<div class="math-callout math-callout--proposition">
  <p class="math-callout__title">命題 3.1</p>
  <p>次は同値である。</p>
  <ol>
    <li>$f$ は連続である。</li>
    <li>任意の開集合 $U$ に対して $f^{-1}(U)$ は開集合である。</li>
  </ol>
</div>
```

## 運用メモ

- 番号は自動では付きません。`定理 1.1` や `命題 2.4` のようにタイトルへ手動で書いてください。
- 専用の `::: theorem` 記法はありません。上記の HTML スニペットを Body に貼り付けて使います。
- 文章の種別だけ変える場合は、`math-callout--theorem` または `math-callout--proposition` を使い分けます。
