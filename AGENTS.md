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

See [Development](docs/development.md) for the architecture, repository layout, setup, build pipeline, and deployment commands.

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
- **Imports:** use `@/` path alias (`tsconfig.json`); the blog modules loaded by `vite.config.ts` use relative imports because Vite loads its config before resolving application aliases
- **Components:** functional React; shadcn/ui in `components/ui/` (config: `components.json`)
- **Styling:** Tailwind utility classes; theme via `next-themes`
- **Scope:** minimal diffs; match surrounding patterns; avoid drive-by refactors
- **Comments:** English, only for non-obvious logic

## Blog content

Required frontmatter fields: `title`, `description`, `date` (ISO date string).

Optional: `tags`, `status` (`draft` | `published`).

Article OG images are generated at build time by `scripts/build-static.ts` from each post's `title`. Do not add `ogImage` frontmatter or commit static files under `public/og/`.

- Draft posts are always excluded from the public MDX registry and static routes; `includeDrafts: true` only includes them in metadata discovery results
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
