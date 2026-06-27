import { afterEach, describe, expect, test } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
	getBlogPostOgImagePath,
	getPostFrontmatterBySlug,
} from "@/lib/blog/frontmatter";

const tempDirs: string[] = [];

function createTempBlogDir() {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), "blog-test-"));
	tempDirs.push(dir);
	return dir;
}

function writeTempPost(blogDir: string, slug: string, frontmatter: string) {
	const filePath = path.join(blogDir, `${slug}.mdx`);
	fs.writeFileSync(
		filePath,
		`---\n${frontmatter}\n---\n\nTemporary test post.\n`,
	);
}

afterEach(() => {
	for (const dir of tempDirs) {
		fs.rmSync(dir, { recursive: true, force: true });
	}
	tempDirs.length = 0;
});

describe("getPostFrontmatterBySlug", () => {
	test("reads frontmatter from a published post file", () => {
		const frontmatter = getPostFrontmatterBySlug("hello");

		expect(frontmatter?.title).toBe("個人ブログ立ち上げ");
		expect(frontmatter?.status).toBe("published");
		expect(frontmatter?.updatedAt).toBeUndefined();
	});

	test("returns null for unknown slugs", () => {
		expect(getPostFrontmatterBySlug("does-not-exist")).toBeNull();
	});

	test("reads optional updatedAt from a post file", () => {
		const blogDir = createTempBlogDir();
		writeTempPost(
			blogDir,
			"updated-post",
			'title: "Updated post"\ndescription: "Test description"\ndate: "2026-01-01"\nupdatedAt: "2026-02-01"\nstatus: "published"',
		);

		const frontmatter = getPostFrontmatterBySlug("updated-post", {
			blogDir,
		});

		expect(frontmatter?.updatedAt).toBe("2026-02-01");
	});

	test("rejects invalid updatedAt in a post file", () => {
		const blogDir = createTempBlogDir();
		writeTempPost(
			blogDir,
			"bad-updated-at",
			'title: "Bad post"\ndescription: "Test description"\ndate: "2026-01-01"\nupdatedAt: "not-a-date"\nstatus: "draft"',
		);

		expect(() =>
			getPostFrontmatterBySlug("bad-updated-at", { blogDir }),
		).toThrow('Invalid frontmatter "updatedAt"');
	});
});

describe("getBlogPostOgImagePath", () => {
	test("returns the opengraph-image route path", () => {
		expect(getBlogPostOgImagePath("hello")).toBe("/blog/hello/opengraph-image");
	});
});
