# Next.js から Void / Vite+ への移行プラン

作成日: 2026-10-20
モード: 実装プラン
対象: `app/`, `components/`, `lib/`, `scripts/`, ビルド・CI・配信設定
ブランチ: `codex/migrate-next-to-void`

## 0. サマリ

移行は可能と判断する。現行サイトは Next.js の静的出力だけで成立しており、リクエスト時のバックエンド処理を必要としない。ただし、Void と既存 MDX の組み合わせは未検証なので、記事 1 本の静的配信を最初の判定点にする。

採用方針は以下。

1. Next.js App Router を Void Pages + `@void/react` に置き換え、Vite+ でビルドする。
2. 全ページを SSG し、既存 URL・日本語記事・外観・SEO・Cloudflare の静的配信を維持する。
3. MDX・LinkCard・OG 画像の移行を検証してから全ページを切り替える。
4. Bun・`bun.lock`・Biome・`bun test`・Lefthook は初回移行で維持する。
5. 単一ブランチ・単一 Draft PR にまとめる。プラン作成後の継続指示を受けて実装し、検証後に Draft PR を作成する。

## 1. 背景

### 現状

- Next.js 16 / React 19 / Tailwind CSS v4 / MDX。`output: "export"` で `out/` を生成する。
- ページは `/`、`/blog`、`/blog/hello`、`/blog/2025-review`、`/privacy`、404。
- Next.js 固有の主な依存はルーティング、Metadata API、MDX コンパイル、`next/og`、`next/font/google`、Google Analytics の組み込みである。
- frontmatter 検証、RSS、JSON-LD、リンクプレビュー取得・解析などは再利用できる。
- `wrangler.jsonc` は `assets.directory: "./out"`、`not_found_handling: "404-page"`、`html_handling: "auto-trailing-slash"` を指定する。リポジトリにはデプロイ用 workflow がない。
- `AGENTS.md` は配信先を Cloudflare Pages と記載するが、現在の設定は Wrangler の静的 assets 形式である。実際の Cloudflare サービスとデプロイ経路は実装開始時に確認する。

計画作成時の現行構成の確認結果は `bun run check` 成功、`bun test` 56 件成功、`bun run build` 成功である。移行先の PoC とブラウザー検証は未実施であり、これらは実装工程で行う。

### 用語と参考記事

VoidZero の製品のうち、Next.js のルーティング・レンダリングを代替する候補が **Void**、開発・ビルドの基盤が **Vite+** である。Vite+ の導入だけでは App Router の置き換えは完了しない。[Void 公式](https://void.cloud/guide/)と[Vite+ 公式](https://viteplus.dev/guide/)を判断の根拠にする。

提示された記事は次のように使い分ける。

- [ashunar0: Void を試す記事](https://ashunar0.dev/posts/try-void/): Void Pages と React を使う構成の参考。
- [DevelopersIO: Vite+ の試用記事](https://dev.classmethod.jp/articles/vite-plus-unified-toolchain-tried/): ツールチェーン統合の参考。記載時点のバージョン・制約を現在の仕様と混同しない。
- [azukiazusa: Void で構築して Cloudflare にデプロイする](https://azukiazusa.dev/blog/void-vite-cloudflare-deploy/): Pages、loader、動的ルート、CLI 配信の参考。今回のサイトには Static Pages の構成を適用し、記事の D1 アプリは持ち込まない。

## 2. 目的

1. `next` / `@next/*` なしで既存サイトを開発・静的ビルドできるようにする。
2. `content/blog/*.mdx` と `content/pages/*.mdx` の執筆形式を維持する。
3. 公開記事の本文と metadata が、JavaScript 実行前の HTML に含まれる状態を維持する。
4. RSS・sitemap・robots・OG 画像と、ライト / ダーク両テーマを維持する。
5. Cloudflare で配信可能な静的成果物と、レビュー可能な Draft PR を用意する。

速度改善は測定対象とするが、移行の成立条件に改善率を置かない。

## 3. 非目的

- サイトのリデザイン、記事本文や slug の変更、新機能の追加。
- D1、認証、API、ISR、常時 SSR、Void Platform の導入。
- 初回 PR での Oxlint / Oxfmt / Vitest への全面移行。現行規約の Biome / Bun と分けて判断する。
- 無関係な依存更新、React Compiler の新規有効化、独自ルーター / 独自 SSG の開発。
- 本番デプロイ・DNS 変更・マージ。

## 4. 設計方針

### 4-1. Void の静的出力を使う

`void.config.ts` の `output: "static"` を採用する。公式の標準出力先は `dist/client/` であり、ブログの動的ルートには公開 slug を返す `getPrerenderPaths()` が必要である。未列挙の動的ルートが暗黙に動的配信になることを防ぐため、生成 HTML の存在も検証する。[公式 SSG](https://void.cloud/guide/ssg)

`inference.appType: "static"` は外部 SSG の既成出力を扱う設定なので、Void Pages の SSG 指定の代用にしない。

構成の出発点は `voidPlugin()` と `voidReact()`、Vite+ の `defineConfig` とする。React 用 Vite プラグインは adapter に含まれるため重複追加しない。採用版の生成例と型定義で設定を確かめる。[Pages Routing](https://void.cloud/guide/pages-routing/overview)、[Quickstart](https://void.cloud/guide/quickstart)

### 4-2. コンテンツ処理をビルドとブラウザーに分ける

`lib/content/blog/mdx.ts` の filesystem 列挙と動的 import は、Vite が解析できる glob / ビルド時 manifest に置き換える。frontmatter の既存検証関数を使い、公開記事だけをページ生成・一覧・RSS・sitemap・OG 生成に渡す。

現在の `LinkCard` は `lib/link-preview/cache.ts` 経由で `node:fs` を使う。ブラウザー用参照は検証済みの JSON import または build 時に渡すデータに分け、取得スクリプトの filesystem 処理を client bundle に混ぜない。draft / `_` 始まりの記事が HTML だけでなく配信 JS や manifest にも含まれないようにする。

### 4-3. 既存 MDX を維持する

`@mdx-js/rollup` を第一候補とし、現在の remark / rehype 設定を移す。Void 標準の Markdown 機能は `.md` を対象としており、既存 `.mdx` の互換性を前提にしない。[MDX の Vite 対応](https://mdxjs.com/packages/rollup/)、[Void Markdown](https://void.cloud/guide/pages-routing/markdown)

MDX 変換と React adapter の処理順、frontmatter export、コンポーネント注入を記事 1 本で検証する。`LinkCard`、`DemotedMdxH1`、`MdxPre`、コードコピー、GFM と二つのハイライトテーマを維持する。

### 4-4. 静的配信時のページ遷移を確かめる

通常の React Pages のリンクを、サーバー応答を必要とする仕組みのまま静的配信へ移さない。`dist/client/` だけを配信して、内部リンク・戻る / 進む・直接アクセスが成立することを PoC で確認する。

静的成果物だけでは client navigation が成立しない場合、通常の `<a>` によるドキュメント遷移を採用する。SPA 的な遷移の維持は今回の必須条件としない。Islands を選ぶ場合は、レイアウトが静的になることと theme provider の境界を先に検証する。[Void Islands](https://void.cloud/guide/pages-routing/islands)

### 4-5. 配信方式とサービスの同一性を維持する

第一候補の成果物は Void 標準の `dist/client/` とし、現在の配信設定が参照する出力先を合わせる。外部のビルド設定が `out/` を固定参照している場合は、当面は build 最終段で `out/` に集約し、切り替えを同時に行う。

追加記事にある `void deploy` への統合も検討対象とする。既存 Cloudflare サービスの種類・名前・環境設定・404・末尾 slash・画像 MIME を照合し、互換に表現できる場合は同じ PR で設定と手順を移す。互換性や配信先が未確認なら、既存 Wrangler 配信を維持して CLI 統合を後続へ分ける。

`void init` / `void deploy` は root の Wrangler 設定を移行する場合があるため、既存リポジトリへ scaffold を直接流し込まない。参考 scaffold は worktree 内の一時ディレクトリで、Static Pages・React・Vite+・配信設定スキップを選んで確認する。[設定](https://void.cloud/reference/config)、[デプロイ](https://void.cloud/guide/deployment)

## 5. 実装案

### Phase 0: 環境と基準の記録

- 現行の check / test / build 結果と、各ページ・OG 画像のスクリーンショットを記録する。
- Cloudflare の実際の配信経路を確認し、Pages / Workers 静的 assets のどちらを維持するかを確定する。
- Void / adapter / Vite+ の整合するバージョンと Node の要求を確認する。調査時のローカル Node は `24.2.0`、CI は Bun のみを明示セットアップしている。
- 2026-10-20 の registry 調査では `void@1.1.12` は Node `>=24.21.0`、`vite-plus@1.3.0` は `^22.18.0 || ^24.11.0 || >=26.0.0` を要求する。これらを採用するなら Node を共通の対応版へ揃え、CI でも明示する。導入時に再確認する。[Void の公開 metadata](https://registry.npmjs.org/void)、[Vite+ の公開 metadata](https://registry.npmjs.org/vite-plus)
- `bunfig.toml` の `minimumReleaseAge = 604800` を維持する。最新の Void / Vite+ は調査時点で公開 7 日未満なので、条件を満たす互換版の有無を確認する。古い同名パッケージを採用しない。互換版がなければ待機を既定とし、例外が必要な場合だけ対象と期限を示して判断を求める。

### Phase 1: 最小構成で移行の成立を確認

1. 一時構成で Void + React + Vite+、`output: "static"`、Tailwind と `@/` alias を設定する。
2. `/` と `/blog/hello` を生成し、MDX・frontmatter・LinkCard・コードブロック・テーマ切り替えを載せる。
3. サーバー専用データの読み込みと client bundle の境界を確認する。
4. 既存 JSX と日本語フォントから OG PNG を 1 枚生成する。
5. 通常の静的サーバーで成果物だけを配信し、本文 HTML、遷移、hydration、画像を確認する。

合格条件を満たせなければ全ページ移行へ進まない。問題を記録し、Void の別のレンダリング方式で解決可能かを確認する。別 framework や本番 SSR への変更は、このプランからの方針変更として扱う。

### Phase 2: ページ・共通 UI・MDX の移植

| 現行 | 移行先の責務 |
| --- | --- |
| `app/layout.tsx` | Void の共通 layout、テーマ、フォント、GA4 |
| `app/page.tsx`, `app/blog/page.tsx`, `app/privacy/page.tsx` | 対応する Void Pages のページ |
| `app/blog/[slug]/page.tsx` | 動的ページ、公開 slug 列挙、記事別 head |
| `app/not-found.tsx` | 配信先が扱える `404.html` と noindex |
| `next/link` | 静的配信で検証したリンク方式 |
| `next/font/google` | Inter の self-hosted font と `@font-face` |
| `@next/third-parties/google` | 同じ計測 ID の GA4 読み込みとページビュー計測 |

既存 Tailwind と Radix UI を再利用する。`next-themes` は名称だけを理由に削除せず、Void の document / hydration と互換なら維持する。テーマ保存、OS 設定追従、初期表示のちらつきを確認する。

### Phase 3: Metadata・RSS・sitemap・OG 画像

- Next の `Metadata` / `MetadataRoute` 型を除き、既存データを Void の head descriptor と XML 出力へ接続する。canonical と画像 URL は `https://nozo.dev` 基準で解決する。[Head Management](https://void.cloud/guide/pages-routing/head)
- title template、description、OGP、Twitter card、RSS discovery、`lang="ja"`、robots を HTML に出力する。
- WebSite / BlogPosting JSON-LD と安全な serialization を維持する。client navigation を使う場合は記事間遷移で古い metadata / JSON-LD が残らないことも確認する。
- `app/sitemap.ts` / `app/feed.xml/route.ts` は build 時のファイル生成へ置き換える。既存 builder を使い、`date` / `updatedAt`・記事順・draft 除外を維持する。
- `next/og` を build 時の PNG 生成へ置き換える。第一候補は Satori + SVG の PNG renderer とし、既存 JSX、1200×630、Noto Sans JP、背景色を再利用する。[Satori](https://github.com/vercel/satori)、[resvg-js](https://github.com/thx/resvg-js)
- `/opengraph-image`、`/blog/opengraph-image`、`/blog/<slug>/opengraph-image`、`/privacy/opengraph-image` は維持対象とする。PNG の実ファイルは生成物配下に置き、拡張子なし URL を画像として返す rewrite と `Content-Type: image/png` を配信先に合わせて検証する。既存 URL を維持できない場合は PNG URL と redirect を明示して再判断する。
- 生成画像は commit しない。frontmatter に `ogImage` を追加しない。

### Phase 4: ビルド・CI・設定の整理

- ビルド順を「リンクプレビュー更新 → コンテンツ準備 → Void 静的ビルド → XML / OG 画像生成・配信設定集約 → 出力検証」に揃える。後段の生成物が Vite の clean に消されないようにする。
- `next` / `@next/*` / `@mdx-js/loader` / Next 専用設定を、置換が完了した時点で除去する。`@mdx-js/react` など移行先でも必要なものは維持する。
- `tsconfig.json` から Next plugin と `.next` 型参照を除き、Void の生成型と Vite client 型を追加する。型生成が必要な段階では `void prepare` を実行する。
- `analyze` は Vite+ が提供する対応方法を確認して移行する。Next bundle analyzer を残したままにしない。
- `.gitignore`、Biome の生成物除外、`clean` / `start`、CI の Node と型検査、Lefthook、`components.json` の CSS パスを整合させる。
- Bun のみで依存を解決し、lockfile は `bun.lock` のみを維持する。新規 GitHub Actions を使う場合は full SHA に pin する。

## 6. コマンド仕様

既存の入口を維持して、CI と日常操作の変更を抑える。以下は実装時の到達形であり、現時点では未変更である。

| コマンド | 到達形 |
| --- | --- |
| `bun run dev` | project-local `vp dev`。既存手順に合わせ port 3000 |
| `bun run check` | Biome check |
| `bun test` | 既存 unit tests |
| `bun run typecheck` | Void 型生成と TypeScript の no-emit 検査 |
| `bun run build` | 全静的成果物の生成と出力検証 |
| `bun run start` | 確定した静的出力ディレクトリのプレビュー |
| `bun run clean` | 採用した生成物ディレクトリの削除 |

`vp check` / `vp test` への変更は初回 PR の要件にしない。Vite+ は project-local で実行し、グローバルの Node 管理や shell 設定を変更しない。[Project-local CLI](https://viteplus.dev/guide/local-cli)、[Bun 対応](https://viteplus.dev/guide/package-management)

## 7. テスト・受け入れ基準

### Unit / 型検査

- 既存 56 tests の意図を維持する。validation / build script の変更には対応する `*.test.ts` を追加・更新する。
- 公開 / draft / `_` 始まりの fixture で、記事一覧と生成対象の一致を検証する。
- head、RSS / sitemap、OG 画像パス、LinkCard の browser-safe データ読み込みを対象にする。
- `bun run check`、`bun test`、型検査、`bun run build` が通る。

### 成果物と配信

- `/`、`/blog`、公開記事全件、`/privacy` の HTML に本文・正しい title・canonical・description が含まれる。
- 公開記事数と生成 HTML 数が一致し、draft 本文が配信対象に含まれない。
- RSS / sitemap は公開 URL と更新日を含み、`public/robots.txt` と既存 favicon / 公開 assets を維持する。
- OG 全件が 1200×630 PNG で、日本語が欠けず、参照 URL が実画像を返す。
- `/blog/hello` の直接アクセス、末尾 slash、存在しない URL の HTTP 404 と noindex が、配信先と同じ処理で成立する。SPA fallback で 200 を返さない。
- 静的成果物だけで内部リンクと戻る / 進むが成立し、存在しない loader endpoint への依存がない。

### ローカルブラウザー

`http://localhost:3000` で全ページを確認する。ライト / ダーク、モバイル / デスクトップ、テーマ再読み込み、コードのハイライト / コピー、LinkCard、Inter、404 を現行スクリーンショットと比較する。全 OG 画像も直接開く。production build の静的プレビューでも確認し、開発サーバーだけで完了としない。

## 8. docs 更新

- `README.md`: 開発・build・静的プレビュー・採用したデプロイ方法を追記する。
- `AGENTS.md`: 技術構成、ディレクトリ、出力先、コマンド、画像プレビュー手順を実装に合わせる。既存の言語・Git・セキュリティ規約を維持する。
- 本プラン: PoC 結果、採用バージョン、遷移方式、配信先、未解決事項を更新する。

独立した docs PR は作らず、変更を入れる PR に同梱する。既存 ADR 運用は見当たらないため、採用判断は本プランに残す。

## 9. PR 分割案

**単一 PR で十分と判断する。** ページ・MDX・metadata・build 設定が共通のレンダリング方式に依存するため、未完成の中間状態を別々に main へ入れない。Phase は PR 内の作業順として扱う。

- ブランチ: `codex/migrate-next-to-void`
- Draft PR タイトル案: `feat: migrate the static site from Next.js to Void and Vite+`
- 依存: Phase 1 の PoC 合格と、依存パッケージのバージョン / Node 条件の解決。
- 並列可否: PoC 後の OG 生成・XML 出力は責務を分けられるが、共通設定への反映と最終検証は直列とする。
- レビュー観点: 静的 HTML、MDX 互換、未公開記事の除外、既存 URL、画像レスポンス、Cloudflare 配信設定、ブラウザーでの外観。
- 本文は英語で目的・最終構成・検証結果・残る制約を記載する。関連 issue が存在する場合のみ実際の番号で `Closes` / `Refs` を付ける。

将来 lint / format / test も Vite+ に統合する場合は、規約変更と全体の format 差分を含む別 PR とする。今回の移行の依存にはしない。

## 10. 判断

支配軸は、**既存の静的ブログの公開品質を保ちながら Next.js 依存を取り除けること**とする。速度とツールの統合度は二次評価に置く。

| 選択肢 | 判断 |
| --- | --- |
| Void + React + Vite+ / SSG | 採用候補。提示記事の方向性に合い、React UI を再利用できる。PoC 合格後に確定する |
| Next.js を残して周辺ツールだけ変更 | Next.js からの移行という目的を満たさない |
| Vite+ の SPA のみ | 初期 HTML と SEO の要件を満たすため別途 SSG が必要になる |
| Astro / React Router など別の SSG framework | 技術的な代案だが、今回は Void を第一候補とする。PoC 不成立時に比較する |
| 全ページをリクエスト時 SSR へ変更 | 現行サイトの要件に不要。移行を成立させるために暗黙で追加しない |

主な不確実性は MDX と adapter の組み合わせ、静的配信での遷移、拡張子なし画像の配信、最新依存の公開日 / Node 条件、実際の Cloudflare デプロイ経路である。これらを Phase 0〜1 と成果物検証で解消する。ドキュメント上の対応と実際に動くことを区別し、build 成功だけで完了としない。

## 11. 作業の進め方

1. 作業は専用 worktree `/Users/nozomeme/.codex/worktrees/migrate-next-to-vite-plus/portfolio` と `codex/migrate-next-to-void` 上で行う。元の main の作業ディレクトリは維持する。
2. プランへの継続指示に基づき、同じ worktree で実装する。
3. 実装時は Phase 0 → Phase 1 → Phase 2〜4 の順に進め、PoC の判定結果を残す。
4. 調査は並列化できる。実装で分担する場合は PoC 後に変更ファイルを分離し、共有設定を複数作業から同時に編集しない。
5. 全チェック、production の静的配信確認、セルフレビュー、README / AGENTS 更新を終えてから、ユーザーが希望した branch → Draft PR の形にする。
6. ユーザーが希望した Draft PR の作成まで進め、そこでヒューマンレビューに渡す。Ready for Review 化・マージ・本番公開はその後の操作とする。


## 12. 実装結果（2026-10-20）

- Void / React adapter は `0.27.0`、Vite+ / Vite core は `1.1.0` を採用した。公開後 7 日を経過した互換版で成立したため、依存クールダウンの例外は不要である。
- Node `24.21.0` を `.node-version` と CI に揃えた。検証用 Node は一時領域に配置し、ユーザーのグローバル環境は変更していない。
- SSG は React Pages の通常モードで成立した。静的 HTML と `/_void/pages/*.json` を生成し、サーバー処理なしでリンク遷移・戻る / 進む・テーマ保持が動作する。
- MDX の公開記事 import を build 時に生成する。frontmatter の変更・記事追加 / 削除は開発サーバーへ反映される。元の日本語記事は変更していない。
- Next.js の共通レイアウトと CSS を移し、self-hosted Inter を配信する。元サイトと同じ表示幅でヘッダー・本文幅・余白・文字組みを比較した。
- `next/og` は Satori + resvg に置き換えた。直接 Satori を使った際の content-box による footer のはみ出しを修正し、全 OG をブラウザーで確認した。
- Cloudflare 設定は `void.config.ts` へ移した。生成される `.void-wrangler.jsonc` は旧 `wrangler.jsonc` の service / env / assets 設定を維持する。配信対象は検証後の `out/` とし、明示的な Wrangler upload を README に記載した。Void Platform や本番サービスへの接続は行っていない。
- Void 0.27.0 は prerender 失敗でも build が成功する場合があるため、公開ルートの HTML / navigation JSON、本文、head、JSON-LD、CSS / font、XML、PNG を検証してから `out/` へ反映する。
- Vite+ と adapter の Vite 型が別コピーから解決される TypeScript 6 の再帰比較を、`tsconfig.json` の `vite` path 統一で解消した。型 assertion や型検査の除外は追加していない。
- 一時的な MDX fixture でコードの両テーマ表示・コピー・LinkCard・H1 の降格を確認した。別の draft / `_` fixture は本文を含めて配信物に現れず、URL は 404 になることを確認した。検証用の記事は削除済みである。
- 自動検証は Biome、TypeScript、73 unit tests、production build、zizmor を対象にする。本番デプロイとマージは実施しない。

- Void の head マージが同じ property のタグを 1 件に減らす不具合には、Bun のバージョン固定 patch を適用した。同一ページの複数タグを保持し、SSR の全タグを SPA 遷移時の管理対象にする。vendor の実際の head 解決・生成に対する回帰テストと、成果物の全タグ検証を追加した。
