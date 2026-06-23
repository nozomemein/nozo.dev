import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");
const OUTPUT_PATH = path.join(
	process.cwd(),
	"content",
	"generated",
	"link-previews.json",
);
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 5000;
const CONCURRENCY = 4;
const LINK_CARD_RE = /<LinkCard\s+href="([^"]+)"\s*\/>/g;

type LinkPreview = {
	title?: string;
	description?: string;
	image?: string;
	siteName?: string;
	fetchedAt: string;
};

type LinkPreviewCache = Record<string, LinkPreview>;

function getFrontmatterStatusFromFile(filePath: string): string | undefined {
	const raw = fs.readFileSync(filePath, "utf8");
	const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	if (!match) {
		return undefined;
	}

	for (const line of match[1].split("\n")) {
		const statusMatch = line.match(/^status:\s*"?([^"\n]+)"?\s*$/);
		if (statusMatch) {
			return statusMatch[1];
		}
	}

	return undefined;
}

function extractLinkCardUrls(): string[] {
	if (!fs.existsSync(BLOG_DIR)) {
		return [];
	}

	const urls = new Set<string>();

	for (const entry of fs.readdirSync(BLOG_DIR, { withFileTypes: true })) {
		if (!entry.isFile() || !entry.name.endsWith(".mdx")) {
			continue;
		}
		if (entry.name.startsWith("_")) {
			continue;
		}

		const filePath = path.join(BLOG_DIR, entry.name);
		if (getFrontmatterStatusFromFile(filePath) === "draft") {
			continue;
		}

		const content = fs.readFileSync(filePath, "utf8");
		for (const match of content.matchAll(LINK_CARD_RE)) {
			urls.add(match[1]);
		}
	}

	return [...urls];
}

function isFetchableUrl(url: string): boolean {
	try {
		const parsed = new URL(url);
		return parsed.protocol === "http:" || parsed.protocol === "https:";
	} catch {
		return false;
	}
}

function readExistingCache(): LinkPreviewCache {
	if (!fs.existsSync(OUTPUT_PATH)) {
		return {};
	}

	try {
		return JSON.parse(fs.readFileSync(OUTPUT_PATH, "utf8")) as LinkPreviewCache;
	} catch {
		return {};
	}
}

function firstMetaValue(
	$: cheerio.CheerioAPI,
	selectors: Array<{ attr: "content" | "text"; selector: string }>,
): string | undefined {
	for (const { selector, attr } of selectors) {
		const element = $(selector).first();
		if (element.length === 0) {
			continue;
		}

		const value =
			attr === "text" ? element.text().trim() : element.attr("content")?.trim();

		if (value) {
			return value;
		}
	}

	return undefined;
}

async function fetchWithTimeout(
	url: string,
	timeoutMs: number,
): Promise<Response> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), timeoutMs);

	try {
		return await fetch(url, {
			signal: controller.signal,
			headers: {
				"User-Agent": "nozo.dev-link-preview/1.0",
				Accept: "text/html,application/xhtml+xml",
			},
			redirect: "follow",
		});
	} finally {
		clearTimeout(timeout);
	}
}

async function fetchPreview(url: string): Promise<Partial<LinkPreview>> {
	const response = await fetchWithTimeout(url, FETCH_TIMEOUT_MS);
	if (!response.ok) {
		throw new Error(`HTTP ${response.status} for ${url}`);
	}

	const html = await response.text();
	const $ = cheerio.load(html);

	const title = firstMetaValue($, [
		{ selector: 'meta[property="og:title"]', attr: "content" },
		{ selector: 'meta[name="twitter:title"]', attr: "content" },
		{ selector: "title", attr: "text" },
	]);

	const description = firstMetaValue($, [
		{ selector: 'meta[property="og:description"]', attr: "content" },
		{ selector: 'meta[name="description"]', attr: "content" },
		{ selector: 'meta[name="twitter:description"]', attr: "content" },
	]);

	const image = firstMetaValue($, [
		{ selector: 'meta[property="og:image"]', attr: "content" },
		{ selector: 'meta[name="twitter:image"]', attr: "content" },
	]);

	const siteName = firstMetaValue($, [
		{ selector: 'meta[property="og:site_name"]', attr: "content" },
	]);

	return {
		title,
		description,
		image,
		siteName,
	};
}

function isCacheFresh(entry: LinkPreview | undefined): boolean {
	if (!entry?.fetchedAt) {
		return false;
	}

	const fetchedAt = Date.parse(entry.fetchedAt);
	if (Number.isNaN(fetchedAt)) {
		return false;
	}

	return Date.now() - fetchedAt < CACHE_TTL_MS;
}

async function mapWithConcurrency<T, R>(
	items: T[],
	concurrency: number,
	fn: (item: T) => Promise<R>,
): Promise<R[]> {
	const results: R[] = new Array(items.length);
	let index = 0;

	async function worker() {
		while (index < items.length) {
			const current = index;
			index += 1;
			results[current] = await fn(items[current]);
		}
	}

	await Promise.all(
		Array.from({ length: Math.min(concurrency, items.length) }, () => worker()),
	);

	return results;
}

async function main() {
	const urls = extractLinkCardUrls().filter(isFetchableUrl);
	const cache = readExistingCache();
	const urlsToFetch = urls.filter((url) => !isCacheFresh(cache[url]));

	if (urlsToFetch.length === 0) {
		console.log("No link previews to fetch.");
		return;
	}

	console.log(`Fetching ${urlsToFetch.length} link preview(s)...`);

	await mapWithConcurrency(urlsToFetch, CONCURRENCY, async (url) => {
		try {
			const preview = await fetchPreview(url);
			cache[url] = {
				...preview,
				fetchedAt: new Date().toISOString(),
			};
			console.log(`Fetched: ${url}`);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			console.warn(`Failed to fetch ${url}: ${message}`);
			if (!cache[url]) {
				cache[url] = { fetchedAt: new Date().toISOString() };
			}
		}
	});

	fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
	fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(cache, null, "\t")}\n`);
	console.log(`Saved link previews to ${OUTPUT_PATH}`);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
