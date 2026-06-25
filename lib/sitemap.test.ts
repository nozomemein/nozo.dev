import { afterEach, describe, expect, test } from "bun:test";
import fs from "node:fs";
import path from "node:path";
import sitemap from "@/app/sitemap";
import { config } from "@/lib/constants";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");
const tempFiles: string[] = [];

function writeTempPost(slug: string, frontmatter: string) {
	const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
	fs.writeFileSync(
		filePath,
		`---\n${frontmatter}\n---\n\nTemporary test post.\n`,
	);
	tempFiles.push(filePath);
}

afterEach(() => {
	for (const filePath of tempFiles) {
		if (fs.existsSync(filePath)) {
			fs.unlinkSync(filePath);
		}
	}
	tempFiles.length = 0;
});

describe("sitemap", () => {
	test("includes static routes and published posts", async () => {
		const entries = await sitemap();
		const urls = entries.map((entry) => entry.url);

		expect(urls).toContain(config.site.prodOrigin);
		expect(urls).toContain(`${config.site.prodOrigin}/blog`);
		expect(urls).toContain(`${config.site.prodOrigin}/privacy`);
		expect(urls).toContain(`${config.site.prodOrigin}/blog/hello`);
		expect(urls).toContain(`${config.site.prodOrigin}/blog/2025-review`);
	});

	test("uses date as lastModified when updatedAt is absent", async () => {
		const entries = await sitemap();
		const hello = entries.find(
			(entry) => entry.url === `${config.site.prodOrigin}/blog/hello`,
		);

		expect(hello?.lastModified).toBe("2026-02-04");
	});

	test("prefers updatedAt for post lastModified when set", async () => {
		writeTempPost(
			"z-test-sitemap-updated",
			'title: "Sitemap test"\ndescription: "Test description"\ndate: "2026-01-01"\nupdatedAt: "2026-06-25"\nstatus: "published"',
		);

		const entries = await sitemap();
		const testPost = entries.find(
			(entry) =>
				entry.url === `${config.site.prodOrigin}/blog/z-test-sitemap-updated`,
		);

		expect(testPost?.lastModified).toBe("2026-06-25");
	});

	test("sets blog index lastModified from the latest post", async () => {
		const entries = await sitemap();
		const blogIndex = entries.find(
			(entry) => entry.url === `${config.site.prodOrigin}/blog`,
		);

		expect(blogIndex?.lastModified).toBe("2026-02-11");
	});
});
