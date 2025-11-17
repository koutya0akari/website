import type {
  AboutContent,
  DiaryEntry,
  ResourceItem,
  SiteContent,
} from "@/lib/types";

export const sampleSite: SiteContent = {
  heroTitle: "Akari Math Lab",
  heroLead:
    "代数幾何と圏論を軸に、データサイエンスや教育との接点を探るポートフォリオ。日々の学習記録や資料をオープンにし、次の研究と協働へつなげます。",
  heroPrimaryCtaLabel: "最新の日記を見る",
  heroPrimaryCtaUrl: "/diary",
  heroSecondaryCtaLabel: "発表資料",
  heroSecondaryCtaUrl: "/resources",
  profile: {
    name: "Akari",
    role: "数学科 4 年 / Akari Math Lab",
    summary:
      "研究テーマは代数幾何と圏論。特に安定ホモトピー論とデータ可視化の交差点を追いかけています。趣味は手描きノートと書道。",
    location: "Tokyo, Japan",
  },
  focuses: [
    {
      id: "geometry",
      title: "代数幾何の直感を届ける",
      description:
        "定理だけでなく「なぜその視点が嬉しいのか」を数式とスケッチの両方で整理します。可視化と用語ブリッジを常にセットで考えます。",
    },
    {
      id: "category",
      title: "圏論と教育設計",
      description:
        "抽象構造を学習デザインに応用。学部生にも届く言葉に噛み砕きながらも、厳密さは保つ翻訳を意識しています。",
    },
    {
      id: "community",
      title: "コミュニティで磨く",
      description:
        "Tsudoi / Math Camp での発表やノート共有を継続し、発想や資料を相互にレビュー。microCMS で管理してすぐ更新できる状態を維持。",
    },
  ],
  projects: [
    {
      id: "tsudoi",
      title: "Tsudoi Study Series",
      summary:
        "研究会向けに 30 分で読み切れるアウトラインを microCMS で管理し、Vercel に即時デプロイ。PR 連動の学習会も開催。",
      highlights: ["Next.js + microCMS", "MathJax 表現", "スライド公開"],
      link: "/resources",
      status: "継続中",
    },
    {
      id: "diary",
      title: "Math Diary",
      summary:
        "フォルダとタグで整理した学習日記。microCMS の下書きレビューから Vercel へ再検証を自動実行します。",
      highlights: ["検索・タグフィルタ", "CMS Webhook"],
      link: "/diary",
      status: "v2 公開",
    },
    {
      id: "link-preview",
      title: "リンクプレビュー API",
      summary:
        "ゼミ用に資料リンクをワンラインで貼れるよう JSON API を自作。Next.js の Edge API Routes で高速レスポンスを実現しました。",
      highlights: ["Edge Functions", "TypeScript", "OGP 生成"],
      link: "/resources",
      status: "beta",
    },
  ],
  timeline: [
    {
      id: "2025-spring",
      title: "Tsudoi #8 で図式的な幾何入門を発表",
      date: "2025-03-12",
      description: "microCMS 上の下書きを共同編集し、Vercel でデプロイ前レビュー。",
      linkLabel: "資料を見る",
      linkUrl: "/resources",
    },
    {
      id: "2024-winter",
      title: "大学祭で Math Visualization 展示",
      date: "2024-11-02",
      description: "Next.js + THREE.js で非線形写像をビジュアライズ。",
    },
    {
      id: "2024-summer",
      title: "Diary v2 を microCMS へ移行",
      date: "2024-07-18",
      description: "PHP 版から Jamstack へ。Vercel にて ISR を採用。",
    },
  ],
  contactLinks: [
    { id: "mail", label: "メールで連絡", url: "mailto:hello@akari.example" },
    { id: "x", label: "X @akari0koutya", url: "https://x.com/akari0koutya" },
    { id: "github", label: "GitHub", url: "https://github.com/akari-math" },
  ],
};

export const sampleDiaries: DiaryEntry[] = [
  {
    id: "sample-1",
    title: "層とコホモロジーの勉強記録",
    slug: "sheaf-cohomology-notes",
    summary: "Derived functor のイメージを図とともに整理。随伴を示す際のテクニックもメモ。",
    body: "<p>Derived functor の作り方を abelian 圏を前提にメモ。Injective resolution をとる際の注意点をまとめました。</p>",
    folder: "Geometry",
    tags: ["Derived", "Sheaf"],
    publishedAt: "2025-03-01",
    updatedAt: "2025-03-05",
  },
  {
    id: "sample-2",
    title: "圏論の #Tsudoi フィードバック",
    slug: "tsudoi-feedback",
    summary: "図式の説明に対していただいたコメントを反映。共通語彙を作る工夫を追記。",
    body: "<p>図式の扱いについて質問が多かったので、図式計算の練習問題をまとめています。</p>",
    folder: "Community",
    tags: ["Category", "Tsudoi"],
    publishedAt: "2025-02-20",
  },
  {
    id: "sample-3",
    title: "数学ノートを microCMS で管理する理由",
    slug: "why-microcms",
    summary: "ドラフト共有のスピードが上がり、Markdown を即時反映できるようになりました。",
    body: "<p>microCMS の API と Vercel Revalidate を組み合わせた構成を紹介しています。</p>",
    folder: "DevLog",
    tags: ["Jamstack"],
    publishedAt: "2025-01-14",
  },
];

export const sampleResources: ResourceItem[] = [
  {
    id: "res-1",
    title: "Tsudoi #8 資料",
    description: "斉藤圏の導入を 12 ページにまとめたスライド。",
    category: "Slide",
    fileUrl: "https://example.com/resources/tsudoi8.pdf",
  },
  {
    id: "res-2",
    title: "Math Diary Template",
    description: "microCMS で日記を書くための雛形。",
    category: "Template",
    fileUrl: "https://example.com/resources/diary-template.pdf",
  },
];

export const sampleAbout: AboutContent = {
  intro:
    "「抽象的なものを抽象のまま届ける」ことを目指して、ノート・発表・教材作りを続けています。microCMS で編集、Vercel でデプロイするワークフローが標準です。",
  mission:
    "数学の専門性とアウトリーチを往復しながら記録を公開し、コミュニティと知見を循環させること。",
  sections: [
    {
      heading: "リサーチスタイル",
      body: "カテゴリカルな視点と幾何の可視化を行き来しながら、学部レベルでも追える導入資料を継続して作っています。",
    },
    {
      heading: "最近の活動",
      body: "Tsudoi を中心に勉強会を企画し、週 1 の日記・月 1 のロングフォーム記事を更新。",
    },
  ],
  skills: ["Mathematica", "Python", "LaTeX", "Notion", "Next.js", "microCMS"],
  quote: "Math as a shared craft, not a solitary act.",
};
