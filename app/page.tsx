import type { Metadata } from "next";
import Link from "next/link";
import { TypographyH1, TypographyP } from "@/components/typography";
import { jsonLdScript } from "@/lib/metadata/json-ld";
import { pageOpenGraph, pageTwitter } from "@/lib/metadata/page";
import { buildWebSiteJsonLd } from "@/lib/metadata/site-json-ld";
import { config } from "@/lib/site/config";
import { ogImagePaths } from "@/lib/site/routes";

const title = config.site.name;
const description = config.site.homeDescription;
const imagePath = ogImagePaths.home;

export const metadata: Metadata = {
	title,
	description,
	alternates: { canonical: "/" },
	openGraph: pageOpenGraph({
		title,
		description,
		path: "/",
		imagePath,
	}),
	twitter: pageTwitter(title, description, imagePath),
};

export default function Home() {
	const jsonLd = buildWebSiteJsonLd();

	return (
		<main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-start gap-12 px-6 py-24">
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is serialized from trusted build-time data
				dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
			/>
			<TypographyH1>nozomemein</TypographyH1>
			<div>
				<TypographyP>
					Hello, I&apos;m Nozomi Hijikata (nozomemein), a passionate software
					engineer.
				</TypographyP>
				<TypographyP>
					I enjoy building solutions and continuously learning to improve my
					craft.
				</TypographyP>
			</div>
			<div className="flex flex-row items-start gap-4">
				<Link
					href="https://x.com/nozomemein"
					target="_blank"
					rel="noopener noreferrer"
					className="text-primary underline-offset-4 hover:underline text-sm font-medium inline-flex items-center"
				>
					Twitter/X
				</Link>
				<Link
					href="https://github.com/nozomemein"
					target="_blank"
					rel="noopener noreferrer"
					className="text-primary underline-offset-4 hover:underline text-sm font-medium inline-flex items-center"
				>
					GitHub
				</Link>
			</div>
		</main>
	);
}
