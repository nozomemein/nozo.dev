import { Link } from "@void/react";
import type { ReactNode } from "react";
import { GoogleAnalytics } from "@/components/google-analytics";
import { ModeToggle } from "@/components/mode-toggle";
import { ThemeProvider } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import "@/styles/globals.css";

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
		>
			<GoogleAnalytics />
			<div className="flex min-h-screen flex-col">
				<header className="border-b">
					<div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
						<Link href="/" className="text-sm font-semibold">
							nozo.dev
						</Link>
						<div className="flex items-center gap-2">
							<nav className="flex items-center gap-2">
								<Button variant="ghost" size="sm" asChild>
									<Link href="/">Home</Link>
								</Button>
								<Button variant="ghost" size="sm" asChild>
									<Link href="/blog">Blog</Link>
								</Button>
							</nav>
							<div className="h-5 w-px bg-border" aria-hidden="true" />
							<ModeToggle />
						</div>
					</div>
				</header>
				<div className="flex-1">{children}</div>
				<footer className="border-t">
					<div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-6 text-xs text-muted-foreground">
						<p>© {new Date().getFullYear()} Nozomi Hijikata</p>
						<Link href="/privacy" className="hover:underline">
							Privacy Policy
						</Link>
					</div>
				</footer>
			</div>
		</ThemeProvider>
	);
}
