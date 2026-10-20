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

The build updates cached LinkCard previews, compiles published MDX through Void, generates RSS / sitemap / OG PNGs, and verifies HTML, navigation data, metadata, assets, and image dimensions. Only verified `dist/client/` output is copied to `out/`. Draft and `_`-prefixed posts are excluded from public MDX imports as well as generated routes. Generated artifacts are ignored by Git.

## Deployment

Cloudflare settings are maintained in `void.config.ts`; Void materializes `.void-wrangler.jsonc` locally. The existing service name `nozodev`, environment variables, HTML URL handling, and `out/` asset directory are preserved. The explicit Wrangler upload path remains available:

```sh
bun run build
bunx wrangler deploy --config .void-wrangler.jsonc --env production
```

Development, validation, and pull requests do not deploy the site. Confirm the intended Cloudflare account and existing service before a production upload. Void Platform, databases, and authentication are not used.
