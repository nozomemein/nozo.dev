import PrivacyContent from "@/content/pages/privacy.mdx";

export default function Privacy() {
	return (
		<main className="mx-auto w-full max-w-3xl px-6 py-16">
			<article className="space-y-6 text-sm leading-7 text-foreground">
				<PrivacyContent />
			</article>
		</main>
	);
}
