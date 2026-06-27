import fs from "node:fs";
import path from "node:path";
import { parseLinkPreviewCache } from "@/lib/link-preview/parse";
import type { LinkPreview, LinkPreviewCache } from "@/lib/link-preview/types";

export const linkPreviewCachePath = path.join(
	process.cwd(),
	"content",
	"generated",
	"link-previews.json",
);

let cachedPreviews: LinkPreviewCache | null = null;

export function readLinkPreviewCacheFile(
	filePath = linkPreviewCachePath,
): LinkPreviewCache {
	if (!fs.existsSync(filePath)) {
		return {};
	}

	try {
		return parseLinkPreviewCache(JSON.parse(fs.readFileSync(filePath, "utf8")));
	} catch {
		return {};
	}
}

export function loadLinkPreviewCache(): LinkPreviewCache {
	if (cachedPreviews) {
		return cachedPreviews;
	}

	cachedPreviews = readLinkPreviewCacheFile();
	return cachedPreviews;
}

export function getCachedLinkPreview(href: string): LinkPreview | undefined {
	return loadLinkPreviewCache()[href];
}
