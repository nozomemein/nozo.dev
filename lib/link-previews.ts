import fs from "node:fs";
import path from "node:path";

export type LinkPreview = {
	title?: string;
	description?: string;
	image?: string;
	siteName?: string;
	fetchedAt: string;
};

export type LinkPreviewCache = Record<string, LinkPreview>;

const CACHE_PATH = path.join(
	process.cwd(),
	"content",
	"generated",
	"link-previews.json",
);

let cachedPreviews: LinkPreviewCache | null = null;

export function getLinkPreviewCache(): LinkPreviewCache {
	if (cachedPreviews) {
		return cachedPreviews;
	}

	if (!fs.existsSync(CACHE_PATH)) {
		cachedPreviews = {};
		return cachedPreviews;
	}

	const raw = fs.readFileSync(CACHE_PATH, "utf8");
	cachedPreviews = JSON.parse(raw) as LinkPreviewCache;
	return cachedPreviews;
}

export function getLinkPreview(href: string): LinkPreview | undefined {
	return getLinkPreviewCache()[href];
}
