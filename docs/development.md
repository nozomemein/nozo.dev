# Development

## Architecture

The site uses Void Pages, React 19, TypeScript, Tailwind CSS v4, and MDX, with Vite+ for builds and Bun for package management and tests.
Biome handles linting and formatting.
Void prerenders the pages and navigation data; Cloudflare serves the generated static files.

```text
content/blog/*.mdx → published-only MDX registry → Void Pages → dist/client/
                                                               ↓
                                   route checks + RSS / sitemap / OG images
                                                               ↓
                                                             out/
                                                               ↓
                                                     Cloudflare static assets
```

The MDX registry is passed directly to Vite through `virtual:blog-posts`.
It excludes draft and `_`-prefixed posts from both browser imports and generated routes, and refreshes when posts are added, edited, or deleted during development.
Static MDX pages, such as the privacy policy, are imported by their corresponding page components.

| Path | Purpose |
| --- | --- |
| `pages/` | Pages, server loaders, head metadata, and shared layout |
| `components/`, `mdx-components.tsx` | UI components, MDX typography, code blocks, and LinkCard |
| `styles/globals.css` | Tailwind theme and self-hosted Inter font |
| `content/blog/`, `content/pages/` | Japanese MDX content |
| `lib/content/blog/` | File discovery, frontmatter validation, and published MDX registry |
| `lib/site/`, `lib/metadata/` | Site settings, URL helpers, OGP, JSON-LD, RSS, and sitemap builders |
| `lib/link-card/`, `lib/link-preview/` | LinkCard URL extraction, preview cache, and browser-safe cache access |
| `lib/og-image/`, `assets/fonts/` | Satori / resvg image rendering, theme, and bundled Japanese font |
| `scripts/fetch-link-previews.ts` | Fetch external OGP into `content/generated/link-previews.json` |
| `scripts/build-static.ts` | Verify prerendered routes, generate static assets, and copy output to `out/` |
| `vite.config.ts`, `void.config.ts` | MDX compilation, build, static generation, and Cloudflare settings |
| `.github/workflows/ci.yml`, `lefthook.yml` | CI and local commit checks |

`bun run build` refreshes LinkCard previews, runs Void / Vite+, and then runs `scripts/build-static.ts`.
The last step generates assets, checks for missing or extra HTML and navigation routes, loader errors, mismatched navigation payloads, and empty page bodies, then copies the output to `out/`.
Every page's `og:image` URL must resolve through `_redirects` or directly to a PNG with the expected signature and 1200×630 dimensions.
Metadata and content helpers also have unit tests.
Generated files under `.void/`, `dist/`, `out/`, and `.wrangler/` are ignored by Git.

OG images are generated at build time: Satori renders the page or article title to SVG, then resvg converts it to a 1200×630 PNG using the bundled Noto Sans JP font.
Generated Cloudflare `_redirects` rules preserve extensionless URLs such as `/blog/hello/opengraph-image` by rewriting them to the PNG files.
The build also writes `feed.xml`, `sitemap.xml`, and an RSS response-type override in `_headers`.
PNG and sitemap response types come from their file extensions.

`lib/metadata/head.ts` builds Void head descriptors directly.
It emits one `article:tag`, using the first frontmatter tag, to follow Void's deduplication by `property`.
The article's JSON-LD `keywords` retain every tag.

## Local development

Use Node.js 24.21.0 (`.node-version`) and Bun 1.3.14 (`package.json`).
Install `betterleaks` and `zizmor` for the pre-commit hooks, then run:

```sh
bun install --frozen-lockfile
bunx lefthook install
bun run dev
```

The development server runs at `http://localhost:3000`.
Use Bun / Bunx and keep `bun.lock` as the only package-manager lockfile.

Void / React adapter 0.27.0 and Vite+ 1.1.0 are pinned together under the seven-day dependency cooldown in `bunfig.toml`.
Keep the Vite core alias and overrides aligned when upgrading Vite+.
Documentation for the installed Void version is available in `node_modules/void/docs/`.

## Validation and preview

Run the same checks as CI:

```sh
bun run check
bun run typecheck
bun test
bun run build
```

The pre-commit hook also runs `betterleaks` and `zizmor`; CI audits the workflows with zizmor.
Use `bun run check:write` to apply Biome fixes.

After building, stop the development server and run `bun run start` to serve `out/` locally through Wrangler on port 3000.
Check changed pages in light and dark mode and at narrow and desktop widths.
OG images can be opened directly in this static preview:

- `/opengraph-image`
- `/blog/opengraph-image`
- `/blog/<slug>/opengraph-image`
- `/privacy/opengraph-image`

`bun run analyze` builds with Vite sourcemaps for bundle inspection.
`bun run clean` removes generated build output and local runtime state, including `.wrangler/`.

## Deployment

Cloudflare settings live in `void.config.ts`; Void generates `.void-wrangler.jsonc` locally.
The `production` environment targets the existing `nozodev` service and serves `out/` with custom 404 and automatic trailing-slash handling.
Upload the static output with:

```sh
bun run build
bunx wrangler deploy --config .void-wrangler.jsonc --env production
```

The connected Workers Builds integration runs separately when a branch is pushed.
Configure these commands in the Worker's **Settings > Build**:

| Setting | Command |
| --- | --- |
| Build command | `bun run build` |
| Deploy command (production branch) | `bunx wrangler deploy --config .void-wrangler.jsonc --env production` |
| Version command (non-production branches) | `bunx wrangler versions upload --config .void-wrangler.jsonc --env production` |

The Version command uploads a version of the same service without promoting it to production.
Workers Builds commands are dashboard settings; editing repository configuration does not change them.
See [Workers Builds configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/).
