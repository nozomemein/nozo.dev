# AGENTS.md

Instructions for AI coding agents working on this repository.

## Language

- Write **issues**, **PR titles/descriptions**, **PR review comments**, **commit messages**, and **source code comments** in English.
- Blog posts and static pages under `content/` remain in Japanese unless explicitly asked otherwise.
- Do not translate existing Japanese site content when making unrelated code changes.
- User-facing UI copy on the site is mixed (English and Japanese); match the language of surrounding content when editing.

| Context | Language |
| --- | --- |
| GitHub issues | English |
| Issue / PR comments | English |
| PR titles and descriptions | English |
| Commit messages | English |
| Source code comments | English |
| Published site content (`content/blog/`, `content/pages/`) | Japanese |
| User-facing UI copy on the site | Match surrounding content |

## Project overview

Personal portfolio and blog at [nozo.dev](https://nozo.dev).

- **Void Pages + Vite+**, **React 19**, **TypeScript** (strict)
- **Tailwind CSS v4**, **MDX**, **Biome**, **Bun**
- Static generation (`output: "static"`) deployed as **Cloudflare static assets** (deployment settings in `void.config.ts`; verified build output in `out/`)

```
content/blog/*.mdx → virtual:blog-posts → pages/blog/[slug].tsx → Vite+ / Void SSG → static assets + verification → out/ → Cloudflare
```

## Repository layout

| Path | Purpose |
| --- | --- |
| `pages/` | Void Pages, server loaders, head metadata, and common layout |
| `styles/globals.css` | Tailwind theme and self-hosted Inter |
| `vite.config.ts`, `void.config.ts` | Build, SSG, and Cloudflare settings |
| `patches/void@0.27.0.patch` | Preserve repeated head metadata in Void and manage all SSR tags during navigation |
| `components/` | UI components (shadcn/ui + typography) |
| `content/blog/` | MDX blog posts with frontmatter |
| `content/pages/` | Static MDX pages (e.g. privacy) |
| `lib/site/config.ts` | Site config constants |
| `lib/site/routes.ts` | OG image path helpers |
| `lib/content/blog/schema.ts` | Shared frontmatter validation |
| `lib/content/blog/files.ts` | Read blog frontmatter from MDX files without importing MDX |
| `lib/content/blog/mdx.ts` | Build-time blog discovery and published summaries |
| `lib/content/blog/manifest.ts`, `plugin.ts` | Published-only MDX registry and development refresh |
| `lib/metadata/page.ts`, `head.ts` | Framework-neutral OGP helpers and Void head descriptors |
| `lib/metadata/blog-posting.ts` | BlogPosting JSON-LD builder |
| `lib/metadata/json-ld.ts` | Safe JSON-LD serialization |
| `lib/metadata/sitemap.ts` | Sitemap entry builder |
| `lib/metadata/feed.ts` | RSS 2.0 feed builder |
| `lib/link-card/extract-hrefs.ts` | Extract `<LinkCard href="...">` URLs from MDX source |
| `lib/link-preview/types.ts` | Link preview cache types |
| `lib/link-preview/cache.ts` | Filesystem cache access for build scripts |
| `lib/link-preview/previews.ts` | Browser-safe LinkCard cache import |
| `lib/link-preview/fetch-policy.ts` | Link preview cache TTL and image URL helpers |
| `lib/og-image/theme.ts` | Dark theme colors for generated OG images |
| `lib/og-image/response.tsx` | Satori / resvg PNG builder for OG images |
| `assets/fonts/` | Fonts used by generated OG images |
| `scripts/fetch-link-previews.ts` | Build-time OGP fetch for `<LinkCard>` URLs |
| `content/generated/link-previews.json` | Cached external link previews |
| `scripts/build-static.ts` | Check prerendered routes, generate OG / RSS / sitemap / Cloudflare rules, and copy output to `out/` |
| `.github/workflows/ci.yml` | CI (Biome check + typecheck + test + build + zizmor) |

## Dev environment

- Node.js: **24.21.0** (`.node-version`); required by Void and Vite+.
- Package manager: **Bun 1.3.14** (`bun install`, lockfile: `bun.lock`)
- **No npm-style lockfiles:** this repo uses `bun.lock` only. Do not create or commit `package-lock.json`, `yarn.lock`, or `pnpm-lock.yaml`. Do not run `npm`, `yarn`, or `pnpm` — use `bun` / `bunx` instead.
- Install git hooks once: `bunx lefthook install` (see `lefthook.yml`)
- Pre-commit runs: `bun run check`, `betterleaks`, `zizmor`

## Commands

| Command | When to use |
| --- | --- |
| `bun run dev` | Local dev server |
| `bun run check` | Lint + format (same as CI) |
| `bun run check:write` | Auto-fix Biome issues |
| `bun run typecheck` | Generate Void types and check TypeScript |
| `bun test` | Run unit tests (same as CI) |
| `bun run build` | Production static export |
| `bun run start` | Serve the verified `out/` as Cloudflare static assets locally |
| `bun run clean` | Remove generated build and local runtime state |

Before finishing a task, run `bun run check`, `bun run typecheck`, `bun test`, and `bun run build`.

## Visual verification

After any change that affects appearance (layout, styling, components, typography, theme colors, generated images, etc.), **always verify in a local browser** before finishing the task.

1. Start the dev server: `bun run dev`
2. Open the affected page(s) at `http://localhost:3000`
3. Check both light and dark mode when the change may affect theme styling

For **OG images**, preview the generated image directly after changing `lib/og-image/response.tsx`, `lib/og-image/theme.ts`, `scripts/build-static.ts`, or blog post titles. Run `bun run build` and then `bun run start` (stop the dev server first) to preview the generated files:

- Home: `http://localhost:3000/opengraph-image`
- Blog index: `http://localhost:3000/blog/opengraph-image`
- Blog post: `http://localhost:3000/blog/<slug>/opengraph-image` (e.g. `/blog/hello/opengraph-image`)
- Privacy: `http://localhost:3000/privacy/opengraph-image`

Reload after edits to confirm title text, colors, and layout look correct.

Void documentation for the installed version is available under `node_modules/void/docs/`. Keep filesystem access and MDX discovery in build scripts; browser components use the published-only virtual registry. Do not deploy `dist/ssr` for this static site.

## Code conventions

- **Formatter/linter:** Biome only (no ESLint/Prettier)
- **Indentation:** tabs
- **Imports:** use `@/` path alias (`tsconfig.json`)
- **Components:** functional React; shadcn/ui in `components/ui/` (config: `components.json`)
- **Styling:** Tailwind utility classes; theme via `next-themes`
- **Scope:** minimal diffs; match surrounding patterns; avoid drive-by refactors
- **Comments:** English, only for non-obvious logic

## Blog content

Required frontmatter fields: `title`, `description`, `date` (ISO date string).

Optional: `tags`, `status` (`draft` | `published`).

Article OG images are generated at build time by `scripts/build-static.ts` from each post's `title`. Do not add `ogImage` frontmatter or commit static files under `public/og/`.

- Draft posts are excluded from production builds unless `includeDrafts: true`
- File naming: `content/blog/<slug>.mdx`; files starting with `_` are ignored
- New posts: Japanese body text; frontmatter `title`/`description` typically Japanese

### Link cards

Use a self-closing `<LinkCard />` in MDX for rich external link previews. The build script extracts `href` from these tags only (regular markdown links are unchanged).

Supported JSX forms:

- `href` is required; use double or single quotes
- optional `className`
- prop order does not matter
- multiline tags are supported

Examples:

```mdx
<LinkCard href="https://example.com/page" />
<LinkCard className="my-4" href="https://example.com/page" />
<LinkCard href='https://example.com/page' className="my-4" />
```

## Git and PR workflow

- **Commit style:** Conventional Commits in English (e.g. `feat:`, `fix:`, `chore:`)
- **Do not commit** unless explicitly asked
- **Do not push** unless explicitly asked
- **CI must pass:** `bun run check` + `bun run typecheck` + `bun test` + `bun run build`
- **Link related issues in PRs:** include `Closes #<issue>` (or `Refs #<issue>` when not fully resolving) in the PR description body so GitHub links the PR to the issue
- **Security:** never commit secrets; pre-commit runs `betterleaks`
- **Dependencies:** Dependabot with 7-day cooldown for GitHub Actions
- Pin GitHub Actions to full SHAs when editing workflows

## Guardrails

- Do not overwrite unrelated user edits
- Add or update tests in `*.test.ts` when changing validation logic or build-time scripts
- Do not add markdown/docs files unless requested
- Keep changes focused on the task at hand
