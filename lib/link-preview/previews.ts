import cache from "@/content/generated/link-previews.json";
import { parseLinkPreviewCache } from "@/lib/link-preview/parse";

const previews = parseLinkPreviewCache(cache);

export function getCachedLinkPreview(href: string) {
	return previews[href];
}
