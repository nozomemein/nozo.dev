import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
	title: "404",
	robots: { index: false },
};

export default function NotFound() {
	return (
		<main className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center gap-6 px-6 py-16 text-center">
			<h1 className="text-3xl font-semibold tracking-tight">Page Not Found</h1>
			<p className="text-sm text-neutral-600 dark:text-muted-foreground">
				The page you are looking for does not exist or has been moved.
			</p>
			<div className="flex gap-4">
				<Button asChild>
					<Link href="/">Home</Link>
				</Button>
				<Button variant="outline" asChild>
					<Link href="/blog">Blog</Link>
				</Button>
			</div>
		</main>
	);
}
