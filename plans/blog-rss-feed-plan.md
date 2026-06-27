# feat: ブログ RSS フィードを追加

作成日: 2026-06-27
モード: 実装プラン
対象: `app/feed.xml/`, `lib/metadata/feed.ts`, `app/layout.tsx`, `public/robots.txt`, `AGENTS.md`

Closes #30

## 0. サマリ

静的エクスポート構成のまま、ビルド時に `/feed.xml`（RSS 2.0）を生成し、公開済みブログ記事を購読できるようにする。

採用方針は以下。

1. `app/feed.xml/route.ts` の Route Handler で XML を返し、`next build` 時に `out/feed.xml` として出力する
2. 記事データは sitemap と同様に `listBlogSlugs()` + `loadBlogFrontmatter()` から取得する（MDX import は不要）
3. XML 生成ロジックは `lib/metadata/feed.ts` に切り出し、単体テストで検証する

要するに、sitemap と同じビルド時静的生成パターンで RSS を足すのが最小コストで issue の受け入れ条件を満たせる。

---

## 1. 背景

### 1-1. 現状

- ブログ記事は `content/blog/*.mdx` + `lib/content/blog/mdx.ts` で管理されている
- `app/sitemap.ts` がビルド時に `sitemap.xml` を生成している（`output: "export"`）
- RSS / Atom フィードは未実装
- `public/robots.txt` には Sitemap のみ記載

### 1-2. ギャップ / 問題

購読者向けのフィードがないため、RSS リーダーやフィード連携サービスから新着記事を追えない。

### 1-3. なぜ今やるのか

Priority: medium。サイト基盤（静的 export、sitemap、frontmatter スキーマ）が揃っており、追加コストが低い段階で入れるのが自然。

---

## 2. 目的

1. `/feed.xml` を配信し、公開済みブログ記事を RSS 2.0 で購読できるようにする
2. draft 記事を除外し、最新記事が先頭に並ぶフィードを保証する
3. 既存の sitemap / frontmatter パターンと整合する実装にする

## 3. 非目的

1. Atom フィード（`/atom.xml`）の同時提供 — 初期スコープ外。需要があれば後続で追加
2. 記事本文（HTML / Markdown）の `<content:encoded>` 出力 — issue の受け入れ条件は title / description / date / slug のみ
3. カテゴリ別・タグ別フィード
4. ランタイム更新（ISR、Webhook、API 経由の動的生成）
5. フィード購読 UI（ヘッダーへの RSS アイコン等）— `<link rel="alternate">` の head 告知のみ行う

---

## 4. 設計方針

### 4-1. 静的エクスポートとの相性（要確認の解決）

issue の「要確認」について:

| 方式 | 静的 export | 採否 |
| --- | --- | --- |
| `app/feed.xml/route.ts`（GET Route Handler） | ビルド時に静的ファイル化される（`out/feed.xml`） | **採用** |
| postbuild スクリプトで `out/feed.xml` を書く | 可能だが Route Handler と重複 | 却下 |
| `public/feed.xml` を手動コミット | 記事追加のたびに手更新が必要 | 却下 |

根拠: Next.js 公式ドキュメント上、Route Handler は `output: "export"` でも GET のみ静的レスポンスとしてビルド時に出力される。本リポジトリは `trailingSlash` 未設定のため、`feed.xml` の URL 解決問題（Next.js #62900）の影響も受けにくい。

### 4-2. データ取得

issue では `getAllPosts()` とあるが、本リポジトリの相当 API は以下。

| API | draft 除外 | 日付降順 | MDX import | 用途 |
| --- | --- | --- | --- | --- |
| `listBlogPosts()` | ○（既定） | ○ | あり（重い） | ブログ一覧ページ |
| `listBlogSlugs()` + `loadBlogFrontmatter()` | ○（既定） | 自前 sort | なし | sitemap |

**sitemap と同じ軽量パターンを採用**する。frontmatter のみで RSS item を構成でき、ビルド時間への影響を抑えられる。

draft 除外は `listBlogSlugs()` 内の `status === "draft"` フィルタに依存（`lib/content/blog/mdx.ts`）。

### 4-3. フィード形式と URL

- パス: `/feed.xml`（issue の第一候補。`/rss.xml` は使わない）
- 形式: RSS 2.0（`application/rss+xml`）
- Atom は後続対応

### 4-4. フィールドマッピング

| RSS 要素 | 値 |
| --- | --- |
| `<channel><title>` | `config.site.name` + `" Blog"` 等 |
| `<channel><link>` | `https://nozo.dev/blog` |
| `<channel><description>` | `config.site.blogDescription` |
| `<channel><language>` | `ja` |
| `<item><title>` | `frontmatter.title` |
| `<item><link>` | `{origin}/blog/{slug}` |
| `<item><description>` | `frontmatter.description` |
| `<item><pubDate>` | `blogPostFreshnessDate(frontmatter)` を RFC 822 形式に変換 |
| `<item><guid>` | 記事 URL（`isPermaLink="true"`） |

並び順: `blogPostFreshnessDate` の降順（sitemap の post 並びと一致）。

### 4-5. 発見性（discoverability）

最低限以下を行う。

1. `app/layout.tsx` の `metadata.alternates.types` に RSS を追加

```ts
alternates: {
  types: {
    "application/rss+xml": [{ url: "/feed.xml", title: "nozo.dev Blog RSS" }],
  },
},
```

2. `public/robots.txt` にコメントまたは Feed 行を追加（任意だが推奨）

```
# Feed: https://nozo.dev/feed.xml
```

標準の `Sitemap:` ディレクティブに倣い、コメントで十分。非標準の `Feed:` 行は初期スコープでは入れない。

---

## 5. 実装案

### 5-1. `lib/metadata/feed.ts`（新規）

責務:

- `FeedBlogPost` 型（sitemap の `SitemapBlogPost` と同等でよい。共通化は今回はしない）
- `buildRssFeed(origin, posts): string` — XML 文字列を返す pure function
- `escapeXml(text: string): string` — `&`, `<`, `>`, `"`, `'` をエスケープ
- `toRfc822(date: string): string` — ISO date → RFC 822（UTC 固定でよい）

並び順・freshness date は `lib/metadata/sitemap.ts` と同じ `blogPostFreshnessDate` を再利用する。

### 5-2. `app/feed.xml/route.ts`（新規）

```ts
import { loadBlogFrontmatter } from "@/lib/content/blog/files";
import { listBlogSlugs } from "@/lib/content/blog/mdx";
import { buildRssFeed } from "@/lib/metadata/feed";
import { config } from "@/lib/site/config";

export const dynamic = "force-static";

export async function GET() {
  const origin = config.site.prodOrigin;
  const posts = listBlogSlugs()
    .map((slug) => {
      const frontmatter = loadBlogFrontmatter(slug);
      if (!frontmatter) throw new Error(`Missing frontmatter for ${slug}`);
      return { slug, frontmatter };
    });

  const xml = buildRssFeed(origin, posts);

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
```

`sitemap.ts` と同様に `export const dynamic = "force-static"` を付与する。

### 5-3. メタデータ・robots 更新

- `app/layout.tsx`: `alternates.types` に RSS を追加
- `public/robots.txt`: feed URL のコメント行を追加
- `AGENTS.md`: レイアウト表に `app/feed.xml/route.ts` と `lib/metadata/feed.ts` を追記

### 5-4. 依存パッケージ

外部 RSS ライブラリ（`feed`, `rss` 等）は**追加しない**。sitemap と同様に pure function + 文字列テンプレートで十分。

---

## 6. コマンド / API 仕様

### 6-1. CLI

変更なし。既存の `bun run build` パイプライン内で自動生成される。

```bash
bun run build
# => out/feed.xml が生成される

bunx serve@latest out
# => http://localhost:3000/feed.xml で確認
```

### 6-2. その他インターフェース

| エンドポイント | Content-Type | 生成タイミング |
| --- | --- | --- |
| `/feed.xml` | `application/rss+xml; charset=utf-8` | `next build` |

---

## 7. テスト方針

### 7-1. unit

`lib/metadata/feed.test.ts`（新規）:

- XML に channel 要素（title, link, description）が含まれる
- 各 item に title / link / description / pubDate / guid が含まれる
- 記事が日付降順（freshness date 基準）で並ぶ
- XML 特殊文字（`&`, `<` 等）がエスケープされる
- 空の posts でも well-formed な RSS（item 0 件）を返す

draft 除外は `listBlogSlugs` 側の既存テストに委ねる。必要なら feed 統合テストで `_draft` 系 slug が含まれないことを確認。

### 7-2. integration / CLI

- `bun run build` 後に `out/feed.xml` の存在を手動またはスクリプトで確認
- CI の `bun run build` が通ることで間接的に検証

### 7-3. E2E

初期スコープでは不要。静的 XML のためブラウザ E2E の ROI が低い。

---

## 8. docs / README / ADR 更新

| ファイル | 内容 |
| --- | --- |
| `AGENTS.md` | Repository layout 表に feed 関連パスを追加 |
| ADR | 本リポジトリに ADR 運用なし。判断理由は本プラン `10. 判断` に残す |

---

## 9. PR 分割案

**単一 PR で十分。** 変更ファイルが `lib/metadata/feed.ts` + route + layout + robots + tests + AGENTS.md に集中し、並列 PR に分割するメリットがない。

### PR1: feat: add blog RSS feed at /feed.xml

- 依存: なし
- 並列可: なし（単一 PR）
- 含む: feed builder、route handler、metadata alternates、robots コメント、unit tests、AGENTS.md
- レビュー観点: draft 除外、並び順、XML エスケープ、静的 export で `out/feed.xml` が出るか

---

## 10. 判断

Route Handler 方式を第一選択とする。postbuild スクリプトは fallback として issue に書かれているが、Next.js 16 + `output: "export"` では不要。

RSS 2.0 のみを初期スコープとする。Atom は `<link rel="alternate" type="application/atom+xml">` を追加するだけで後から拡張可能。

記事本文の full content 出力は今回やらない。description のみで issue の受け入れ条件を満たし、HackerNoon 等への full import が必要になった段階で `<content:encoded>` を検討する。

優先度は medium のまま妥当。実装規模は 1 PR / 半日程度。

---

## 11. 作業の進め方

### 11-1. git worktree で作業する

```bash
# base repo: ~/dev/portfolio
git worktree add ~/dev/portfolio-wt/feat-blog-rss-feed -b feat/blog-rss-feed
cd ~/dev/portfolio-wt/feat-blog-rss-feed
```

### 11-2. 並列実装の割り当て

単一 PR のため並列作業なし。実装順序:

1. `lib/metadata/feed.ts` + `feed.test.ts`
2. `app/feed.xml/route.ts`
3. `app/layout.tsx` + `public/robots.txt`
4. `AGENTS.md`
5. `bun run check` → `bun test` → `bun run build`
6. `bunx serve@latest out` で `/feed.xml` を目視確認

### 11-3. ゴールは Draft PR

- CI 相当（check / test / build）が green
- PR 本文に `Closes #30`、受け入れ条件チェックリスト、テスト範囲を記載
- `gh pr create --draft` で Draft PR を作成し、ヒューマンレビューに渡す

---

## 付録: 受け入れ条件チェックリスト

- [ ] `/feed.xml` が配信される（`out/feed.xml` が build 成果物に含まれる）
- [ ] draft 記事が含まれない
- [ ] 最新記事が先頭に並ぶ
- [ ] `bun run check` / `bun test` / `bun run build` が通る
