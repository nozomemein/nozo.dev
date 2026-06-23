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

- **Next.js 16** (App Router), **React 19**, **TypeScript** (strict)
- **Tailwind CSS v4**, **MDX**, **Biome**, **Bun**
- Static export (`output: "export"`) deployed to **Cloudflare Pages** via `wrangler.jsonc` (build output in `out/`)

```
content/blog/*.mdx → lib/posts.ts → app/blog/[slug]/page.tsx → next build → out/ → Cloudflare Pages
```

## Repository layout

| Path | Purpose |
| --- | --- |
| `app/` | Next.js App Router pages and layout |
| `components/` | UI components (shadcn/ui + typography) |
| `content/blog/` | MDX blog posts with frontmatter |
| `content/pages/` | Static MDX pages (e.g. privacy) |
| `lib/posts.ts` | Blog post loading, frontmatter validation |
| `lib/link/card-urls.ts` | Extract `<LinkCard href="...">` URLs from MDX source |
| `lib/link/preview-utils.ts` | Link preview cache TTL and image URL helpers |
| `lib/link/previews.ts` | LinkCard OGP preview cache loader |
| `scripts/fetch-link-previews.ts` | Build-time OGP fetch for `<LinkCard>` URLs |
| `content/generated/link-previews.json` | Cached external link previews |
| `lib/constants.ts` | Site metadata |
| `.github/workflows/ci.yml` | CI (Biome check + test + build + zizmor) |

## Dev environment

- Package manager: **Bun** (`bun install`, lockfile: `bun.lock`)
- **No npm-style lockfiles:** this repo uses `bun.lock` only. Do not create or commit `package-lock.json`, `yarn.lock`, or `pnpm-lock.yaml`. Do not run `npm`, `yarn`, or `pnpm` — use `bun` / `bunx` instead.
- Install git hooks once: `bunx lefthook install` (see `lefthook.yml`)
- Pre-commit runs: `bun run check`, `betterleaks`, `zizmor`

## Commands

| Command | When to use |
| --- | --- |
| `bun run dev` | Local dev server |
| `bun run check` | Lint + format (same as CI) |
| `bun run check:write` | Auto-fix Biome issues |
| `bun test` | Run unit tests (same as CI) |
| `bun run build` | Production static export |
| `bun run clean` | Remove `.next` and `out` |

Before finishing a task, run `bun run check`, `bun test`, and `bun run build`.

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

Published posts (anything that is not `status: draft`) also require `ogImage` — a root-relative path (e.g. `/og/hello.png`) with a matching file under `public/`.

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
- **CI must pass:** `bun run check` + `bun test` + `bun run build`
- **Link related issues in PRs:** include `Closes #<issue>` (or `Refs #<issue>` when not fully resolving) in the PR description body so GitHub links the PR to the issue
- **Security:** never commit secrets; pre-commit runs `betterleaks`
- **Dependencies:** Dependabot with 7-day cooldown for GitHub Actions
- Pin GitHub Actions to full SHAs when editing workflows

## Guardrails

- Do not overwrite unrelated user edits
- Add or update tests in `*.test.ts` when changing validation logic or build-time scripts
- Do not add markdown/docs files unless requested
- Keep changes focused on the task at hand
