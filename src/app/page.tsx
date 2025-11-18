import Link from "next/link";

import { DiaryCard } from "@/components/diary/diary-card";
import { ResourceGrid } from "@/components/resources/resource-grid";
import { SmartLink } from "@/components/smart-link";
import { getDiaryEntries, getResourceItems, getSiteContent } from "@/lib/microcms";
import { formatDate } from "@/lib/utils";

const seminarThemes = [
  {
    title: "スキーム論",
    summary:
      "Liu『Algebraic Geometry and Arithmetic Curves』を自主ゼミで輪読し、基礎的なスキーム論を定着させながら、Huybrechts『Fourier-Mukai Transforms in Algebraic Geometry』で応用を個人学習。導来代数幾何に到達することを目標に据えています。",
  },
  {
    title: "可換環論",
    summary: "スキーム論を理解する基盤として、松村『復刊 可換環論』をゼミで読み、可換環の構造と応用を整理。スキームの局所的な振る舞いを具体例から捉えています。",
  },
  {
    title: "（無限）圏論 / ホモトピー型理論",
    summary:
      "導来代数幾何を見据え、Haugseng『Yet Another Introduction to Infinity Categories』を進めつつ、Rijke『An Introduction to Homotopy Type Theory』で synthetic 手法を学習。将来は Riehl-Shulman『A type theory for synthetic ∞-categories』にも挑戦予定。",
    references: [
      { label: "Rijke 2022", url: "https://arxiv.org/abs/2212.11082" },
      { label: "Riehl & Shulman 2017", url: "https://arxiv.org/abs/1705.07442" },
    ],
  },
  {
    title: "Topos 理論",
    summary:
      "Mac Lane–Moerdijk『Sheaves in Geometry and Logic』を中心に Grothendieck topos の基礎を学び、将来的には Johnstone『Sketches of an Elephant』で空間としての topos を掘り下げたいと考えています。",
  },
  {
    title: "表現論",
    summary:
      "D-加群や傾理論に興味を持ち、Assem–Simson–Skowroński『Elements of the Representation Theory of Associative Algebras』を個人で読み進めて代数的構造の理解を深めています。",
  },
  {
    title: "TeX / 組版",
    summary:
      "数学文書の表現力を高めるため、Knuth『The TeXbook』のプリミティブをゼミ形式で学習。Knuth の思想を体現する組版を自力で行えることを目標にしています。",
  },
];

const learningThemes = [
  {
    title: "導来代数幾何",
    summary: "現代的な「正しい」代数幾何を目指し、導来圏・∞-カテゴリ的な視点から幾何を捉え直すことに注力しています。",
  },
  {
    title: "幾何学的ラングランズ対応",
    summary: "表現論と数論を結ぶ橋として、幾何学的ラングランズ対応の背景と具体的な例を追いかけています。",
  },
  {
    title: "凝縮数学",
    summary: "Clausen–Scholze の研究から学ぶべく、トポス的な視点を使った凝縮数学の基礎を整えています。",
  },
  {
    title: "TeX",
    summary: "Knuth の思想に触れながら、数学文書を美しく確実に表現するための組版技術を磨いています。",
  },
];

const activityTimeline = [
  {
    year: "2025",
    items: [
      "第8回すうがく徒のつどい 参加・運営",
      "第7回すうがく徒のつどい 参加・運営",
      "spm29th 参加・運営",
      "spmAdv7th 参加",
    ],
  },
  {
    year: "2024",
    items: [
      "第6回すうがく徒のつどい 参加・運営",
      "第5回すうがく徒のつどい 参加・運営",
      "spm28th 参加",
    ],
  },
  {
    year: "2022",
    items: ["第42回数理の翼夏季セミナー 参加"],
  },
];

const personalIntro = {
  description:
    "徳島大学 理工学部 理工学科 数理科学コース B2。代数幾何を軸に、圏論など抽象的な視点で代数と幾何を結び直すことを目標にしています。「すうがく徒のつどい」や「数物セミナー」の運営にも携わり、数学の魅力を共有する場づくりにも注力中です。",
  details: [
    { label: "推し", value: "結月ゆかりさん❤️" },
    { label: "最近の興味", value: "フロントエンド開発" },
    {
      label: "読書メモ",
      value: "松村『可換環論』, Liu, SGL, 代数的サイクルとエタールコホモロジー, ASS, TeXbook など",
    },
  ],
};

export const revalidate = 300;

export default async function HomePage() {
  const [site, diaries, resources] = await Promise.all([getSiteContent(), getDiaryEntries(3), getResourceItems(3)]);

  return (
    <div className="min-h-screen">
      <main className="mx-auto flex max-w-content flex-col gap-10 px-6 py-12">
        <section className="grid gap-8 rounded-[32px] border border-white/15 bg-gradient-to-br from-night via-night-soft to-night-muted p-8 text-white lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.4em] text-white/60">Akari Math Lab</p>
            <h1 className="font-display text-4xl leading-tight text-white sm:text-5xl">{site.heroTitle}</h1>
            <p className="text-lg text-white/80">{site.heroLead}</p>
            <div className="flex flex-wrap gap-4">
              <SmartLink
                href={site.heroPrimaryCtaUrl}
                className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-black transition hover:bg-accent/90"
              >
                {site.heroPrimaryCtaLabel}
              </SmartLink>
              {site.heroSecondaryCtaLabel && site.heroSecondaryCtaUrl && (
                <SmartLink
                  href={site.heroSecondaryCtaUrl}
                  className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:border-white"
                >
                  {site.heroSecondaryCtaLabel}
                </SmartLink>
              )}
            </div>
            <div className="rounded-2xl border border-accent/30 bg-black/20 p-5 text-sm text-white/80">
              <h2 className="text-lg font-semibold text-white">自己紹介</h2>
              <p className="mt-2 text-white/80">{personalIntro.description}</p>
              <dl className="mt-4 space-y-2 text-white">
                {personalIntro.details.map((detail) => (
                  <div key={detail.label} className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
                    <dt className="text-xs uppercase tracking-[0.3em] text-white/60">{detail.label}</dt>
                    <dd className="text-sm text-white">{detail.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <div className="space-y-4 rounded-3xl border border-white/15 bg-black/20 p-6">
            <ul className="space-y-4">
              {site.timeline.slice(0, 4).map((item) => (
                <li key={item.id} className="border-l-2 border-accent pl-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">{formatDate(item.date)}</p>
                  <p className="text-base font-semibold text-white">{item.title}</p>
                  <p className="text-sm text-white/70">{item.description}</p>
                  {item.linkUrl && (
                    <SmartLink href={item.linkUrl} className="text-sm text-accent underline underline-offset-4">
                      {item.linkLabel ?? "詳細"}
                    </SmartLink>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {site.focuses.length > 0 && (
          <section id="focus" className="grid gap-6 rounded-[32px] border border-white/10 bg-white/5 p-8 md:grid-cols-3">
            {site.focuses.map((focus) => (
              <article key={focus.id} className="space-y-3">
                <p className="text-xs uppercase tracking-[0.4em] text-accent">{focus.id}</p>
                <h3 className="text-xl font-semibold">{focus.title}</h3>
                <p className="text-white/70">{focus.description}</p>
              </article>
            ))}
          </section>
        )}

        <section className="space-y-6 rounded-[32px] border border-white/10 bg-night-muted/50 p-8">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Learning Focus</p>
            <h2 className="text-3xl font-semibold text-white">学習テーマ</h2>
            <p className="text-white/70">現在集中しているトピックを、簡単なメモとして整理しました。</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {learningThemes.map((theme) => (
              <article key={theme.title} className="rounded-2xl border border-white/15 bg-black/20 p-6">
                <h3 className="text-xl font-semibold text-white">{theme.title}</h3>
                <p className="mt-2 text-white/75">{theme.summary}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-6 rounded-[32px] border border-white/10 bg-night-soft/70 p-8">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">Seminar Themes</p>
            <h2 className="text-3xl font-semibold text-white">自主ゼミのテーマ</h2>
            <p className="text-white/70">
              研究の軸となる書籍やゼミ活動をまとめました。導来代数幾何と圏論を中心に、関連する環論・組版・表現論を往復しています。
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {seminarThemes.map((theme) => (
              <article key={theme.title} className="space-y-3 rounded-2xl border border-white/20 bg-black/20 p-6">
                <h3 className="text-xl font-semibold text-white">{theme.title}</h3>
                <p className="text-white/70">{theme.summary}</p>
                {theme.references && (
                  <div className="flex flex-wrap gap-3 text-sm">
                    {theme.references.map((ref) => (
                      <SmartLink key={ref.url} href={ref.url} className="text-accent underline underline-offset-4">
                        {ref.label}
                      </SmartLink>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-6 rounded-[32px] border border-white/10 bg-white/5 p-8">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">Activities</p>
            <h2 className="text-3xl font-semibold text-white">近年の活動</h2>
            <p className="text-white/70">自主ゼミの運営や学会参加の記録です。学生コミュニティの現場で得た知見をサイトにも還元しています。</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {activityTimeline.map((activity) => (
              <article key={activity.year} className="rounded-2xl border border-white/15 bg-black/20 p-6">
                <h3 className="text-xl font-semibold text-accent">{activity.year}</h3>
                <ul className="mt-3 space-y-2 text-white/80">
                  {activity.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-accent" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section id="projects" className="space-y-6 rounded-[32px] border border-white/10 bg-night-soft/60 p-8">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">Projects</p>
            <h2 className="text-3xl font-semibold text-white">進行中のプロジェクト</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {site.projects.map((project) => (
              <article key={project.id} className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center justify-between text-sm text-white/60">
                  <span>{project.status}</span>
                </div>
                <h3 className="text-xl font-semibold">{project.title}</h3>
                <p className="text-white/70">{project.summary}</p>
                <ul className="text-sm text-white/60">
                  {project.highlights.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
                {project.link && (
                  <SmartLink href={project.link} className="text-sm text-accent underline underline-offset-4">
                    詳細へ
                  </SmartLink>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-6 rounded-[32px] border border-white/10 bg-white/5 p-8">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">Math Diary</p>
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-3xl font-semibold">最近の学習記録</h2>
              <Link href="/diary" className="text-sm text-accent underline-offset-4 hover:underline">
                全て見る
              </Link>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {diaries.map((entry) => (
              <DiaryCard key={entry.id} entry={entry} compact />
            ))}
          </div>
        </section>

        <section className="grid gap-6 rounded-[32px] border border-white/10 bg-night-soft/50 p-8 md:grid-cols-[1fr_1fr]">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">Resources</p>
            <h2 className="text-3xl font-semibold">公開資料</h2>
            <ResourceGrid resources={resources} />
            <Link href="/resources" className="inline-block text-sm text-accent underline underline-offset-4">
              その他の資料を見る
            </Link>
          </div>
          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-xl font-semibold">Contact</h3>
            <p className="text-white/70">コラボ・取材・登壇依頼などは下記よりお気軽にどうぞ。</p>
            <div className="flex flex-wrap gap-3">
              {site.contactLinks.map((link) => (
                <SmartLink
                  key={link.id}
                  href={link.url}
                  className="rounded-full border border-white/20 px-4 py-2 text-sm text-white hover:border-accent hover:text-accent"
                >
                  {link.label}
                </SmartLink>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
