import { TypographyH1, TypographyP } from "@/components/typography";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	alternates: { canonical: "/" },
};

export default function Home() {
	return (
		<main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-start gap-12 px-6 py-24">
			<TypographyH1>nozomemein</TypographyH1>
			<div>
				<TypographyP>
					Hello, I&apos;m nozomemein, a passionate software engineer.
				</TypographyP>
				<TypographyP>
					I enjoy building solutions and continuously learning to improve my
					craft.
				</TypographyP>
			</div>
			<div className="flex flex-row item-start gap-4">
				<Link
					href="https://x.com/nozomemein"
					target="_blank"
					className="text-primay underline-offset-4 hover:underline text-sm font-medium inline-flex items-center"
				>
					Twitter/X
				</Link>
				<Link
					href="https://github.com/nozomemein"
					target="_blank"
					className="text-primay underline-offset-4 hover:underline text-sm font-medium inline-flex items-center"
				>
					GitHub
				</Link>
			</div>
		</main>
	);
}
