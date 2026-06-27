import fs from "node:fs";
import path from "node:path";
import type { LinkPreview, LinkPreviewCache } from "@/lib/link-preview/types";

const CACHE_PATH = path.join(
	process.cwd(),
	"content",
	"generated",
	"link-previews.json",
);

let cachedPreviews: LinkPreviewCache | null = null;

export function loadLinkPreviewCache(): LinkPreviewCache {
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

export function getCachedLinkPreview(href: string): LinkPreview | undefined {
	return loadLinkPreviewCache()[href];
}
