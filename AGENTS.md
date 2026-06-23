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
| `lib/constants.ts` | Site metadata |
| `.github/workflows/ci.yml` | CI (Biome check + build + zizmor) |

## Dev environment

- Package manager: **Bun** (`bun install`, lockfile: `bun.lock`)
- Install git hooks once: `bunx lefthook install` (see `lefthook.yml`)
- Pre-commit runs: `bun run check`, `betterleaks`, `zizmor`

## Commands

| Command | When to use |
| --- | --- |
| `bun run dev` | Local dev server |
| `bun run check` | Lint + format (same as CI) |
| `bun run check:write` | Auto-fix Biome issues |
| `bun run build` | Production static export |
| `bun run clean` | Remove `.next` and `out` |

Before finishing a task, run `bun run check` and `bun run build`.

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

Optional: `tags`, `ogImage`, `status` (`draft` | `published`).

- Draft posts are excluded from production builds unless `includeDrafts: true`
- File naming: `content/blog/<slug>.mdx`; files starting with `_` are ignored
- New posts: Japanese body text; frontmatter `title`/`description` typically Japanese

## Git and PR workflow

- **Commit style:** Conventional Commits in English (e.g. `feat:`, `fix:`, `chore:`)
- **Do not commit** unless explicitly asked
- **Do not push** unless explicitly asked
- **CI must pass:** `bun run check` + `bun run build`
- **Security:** never commit secrets; pre-commit runs `betterleaks`
- **Dependencies:** Dependabot with 7-day cooldown for GitHub Actions
- Pin GitHub Actions to full SHAs when editing workflows

## Guardrails

- Do not overwrite unrelated user edits
- Do not add tests unless requested or clearly valuable (no test suite exists today)
- Do not add markdown/docs files unless requested
- Keep changes focused on the task at hand
