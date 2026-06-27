import { describe, expect, test } from "bun:test";
import { buildRssFeed, escapeXml, formatRssPubDate } from "@/lib/metadata/feed";

const origin = "https://nozo.dev";

const feedOptions = {
	origin,
	siteName: "nozo.dev",
	siteDescription: "技術メモと備忘録をまとめるブログ。",
};

describe("escapeXml", () => {
	test("escapes XML special characters", () => {
		expect(escapeXml(`Tom & Jerry's "RSS" <feed>`)).toBe(
			"Tom &amp; Jerry&apos;s &quot;RSS&quot; &lt;feed&gt;",
		);
	});
});

describe("formatRssPubDate", () => {
	test("formats ISO dates as RFC 822 UTC strings", () => {
		expect(formatRssPubDate("2026-02-04")).toBe(
			"Wed, 04 Feb 2026 00:00:00 GMT",
		);
	});
});

describe("buildRssFeed", () => {
	test("includes channel metadata and feed self link", () => {
		const feed = buildRssFeed({ ...feedOptions, posts: [] });

		expect(feed).toContain('<?xml version="1.0" encoding="UTF-8"?>');
		expect(feed).toContain("<title>nozo.dev</title>");
		expect(feed).toContain("<link>https://nozo.dev/blog</link>");
		expect(feed).toContain(
			'<atom:link href="https://nozo.dev/feed.xml" rel="self" type="application/rss+xml"/>',
		);
		expect(feed).toContain("<language>ja</language>");
	});

	test("sorts items with the freshest post first", () => {
		const feed = buildRssFeed({
			...feedOptions,
			posts: [
				{
					slug: "older",
					frontmatter: {
						title: "Older",
						description: "Older post",
						date: "2026-01-01",
						status: "published",
					},
				},
				{
					slug: "newer",
					frontmatter: {
						title: "Newer",
						description: "Newer post",
						date: "2026-02-11",
						status: "published",
					},
				},
			],
		});

		expect(feed.indexOf("/blog/newer")).toBeLessThan(
			feed.indexOf("/blog/older"),
		);
	});

	test("uses updatedAt for pubDate when set", () => {
		const feed = buildRssFeed({
			...feedOptions,
			posts: [
				{
					slug: "updated-post",
					frontmatter: {
						title: "Updated",
						description: "Updated post",
						date: "2026-01-01",
						updatedAt: "2026-06-25",
						status: "published",
					},
				},
			],
		});

		expect(feed).toContain("<pubDate>Thu, 25 Jun 2026 00:00:00 GMT</pubDate>");
	});

	test("escapes special characters in item fields", () => {
		const feed = buildRssFeed({
			...feedOptions,
			posts: [
				{
					slug: "xml-test",
					frontmatter: {
						title: `Tom & Jerry's "RSS"`,
						description: "Description with <tags> & more",
						date: "2026-02-04",
						status: "published",
					},
				},
			],
		});

		expect(feed).toContain(
			"<title>Tom &amp; Jerry&apos;s &quot;RSS&quot;</title>",
		);
		expect(feed).toContain(
			"<description>Description with &lt;tags&gt; &amp; more</description>",
		);
	});
});
