import { describe, expect, test } from "bun:test";
import { serializeJsonLd } from "@/lib/seo/serialize-json-ld";

describe("serializeJsonLd", () => {
	test("escapes less-than characters to prevent script breakout", () => {
		const serialized = serializeJsonLd({
			headline: "</script><script>alert(1)</script>",
		});

		expect(serialized).not.toContain("</script>");
		expect(serialized).toContain("\\u003c/script");
	});
});
