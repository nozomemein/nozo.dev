import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const SITE_NAME = "nozo.dev";
const SITE_DESCRIPTION = "技術メモと備忘録をまとめるブログ。";
const IS_CF_PAGES_PROD = process.env.CF_PAGES_ENVIRONMENT === "production";

export const metadata: Metadata = {
	title: {
		default: SITE_NAME,
		template: `%s | ${SITE_NAME}`,
	},
	description: SITE_DESCRIPTION,
	robots: {
		index: IS_CF_PAGES_PROD,
		follow: IS_CF_PAGES_PROD
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ja">
			<body className={inter.className}>
				<div className="flex min-h-screen flex-col">
					<header className="border-b">
						<div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
							<Link href="/" className="text-sm font-semibold">
								nozo.dev
							</Link>
							<nav className="flex items-center gap-2">
								<Button variant="ghost" size="sm" asChild>
									<Link href="/">Home</Link>
								</Button>
								<Button variant="ghost" size="sm" asChild>
									<Link href="/blog">Blog</Link>
								</Button>
							</nav>
						</div>
					</header>
					<div className="flex-1">{children}</div>
				</div>
			</body>
		</html>
	);
}
