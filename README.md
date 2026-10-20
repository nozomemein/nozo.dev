# nozo.dev

Personal portfolio and Japanese MDX blog at [nozo.dev](https://nozo.dev/).

Built with Void Pages, React 19, Vite+, Tailwind CSS v4, and Bun. All pages are prerendered; production serves static assets without a request-time application worker.

## Development

Use Node.js 24.21.0 (`.node-version`) and Bun 1.3.14.

```sh
bun install --frozen-lockfile
bunx lefthook install
bun run dev
```

The development server runs at `http://localhost:3000`. Void / React adapter 0.27.0 and Vite+ 1.1.0 are pinned together; these versions satisfy the seven-day dependency cooldown. Keep the Vite core alias and overrides aligned when upgrading Vite+. Bun applies the checked-in Void head patch to preserve repeated Open Graph article tags and clean them up during navigation; retain its regression test when upgrading Void.

## Validation and preview

```sh
bun run check
bun run typecheck
bun test
bun run build
bun run start
```

Stop the development server before starting the static preview on port 3000. OG image URLs are available in the static preview after building. `bun run analyze` emits Vite sourcemaps for bundle inspection.

The build updates cached LinkCard previews and compiles published MDX through Void. `scripts/build-static.ts` checks that every public route has prerendered HTML and navigation data without loader errors, rejects extra routes, generates RSS / sitemap / OG PNGs, and copies `dist/client/` to `out/`. Draft and `_`-prefixed posts are excluded from public MDX imports as well as generated routes. The MDX registry is passed directly to Vite without an intermediate file. Generated artifacts are ignored by Git.

## Deployment

Cloudflare settings are maintained in `void.config.ts`; Void materializes `.void-wrangler.jsonc` locally. The existing service name `nozodev`, environment variables, HTML URL handling, and `out/` asset directory are preserved. The explicit Wrangler upload path remains available:

```sh
bun run build
bunx wrangler deploy --config .void-wrangler.jsonc --env production
```

Development and validation scripts do not run a production upload. The connected Cloudflare Workers Builds integration runs separately when a branch is pushed. In the Worker's **Settings > Build**, use these commands for the migrated branch:

| Setting | Command |
| --- | --- |
| Build command | `bun run build` |
| Deploy command (production branch) | `bunx wrangler deploy --config .void-wrangler.jsonc --env production` |
| Preview / non-production branch command | `bunx wrangler versions upload --config .void-wrangler.jsonc --env production` |

The preview command uploads a version of the existing service without promoting it to production. Set the build command before retrying PR builds; coordinate the generated-config upload commands with this migration because the current `main` branch still uses `wrangler.jsonc`. Workers Builds commands are dashboard settings, not repository configuration. See [Workers Builds configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/).

Confirm the intended Cloudflare account and existing service before a production upload. Void Platform, databases, and authentication are not used.
