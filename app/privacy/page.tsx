import type { Metadata } from "next";
import PrivacyContent, { frontmatter } from "@/content/pages/privacy.mdx";
import { pageAlternates } from "@/lib/metadata/page";

export const metadata: Metadata = {
	title: frontmatter.title,
	description: frontmatter.description,
	alternates: pageAlternates("/privacy"),
	robots: { index: true, follow: true },
};

export default function Privacy() {
	return (
		<main className="mx-auto w-full max-w-3xl px-6 py-16">
			<article className="space-y-6 text-sm leading-7 text-foreground">
				<PrivacyContent />
			</article>
		</main>
	);
}
