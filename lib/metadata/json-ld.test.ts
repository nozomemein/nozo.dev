import { describe, expect, test } from "bun:test";
import { jsonLdScript } from "@/lib/metadata/json-ld";

describe("jsonLdScript", () => {
	test("escapes less-than characters to prevent script breakout", () => {
		const serialized = jsonLdScript({
			headline: "</script><script>alert(1)</script>",
		});

		expect(serialized).not.toContain("</script>");
		expect(serialized).toContain("\\u003c/script");
	});
});
