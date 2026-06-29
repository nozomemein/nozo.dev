import type { MDXComponents } from "mdx/types";
import type { ComponentPropsWithoutRef } from "react";
import { LinkCard } from "@/components/link-card";
import { MdxPre } from "@/components/mdx-pre";
import { cn } from "@/lib/utils";

export function DemotedMdxH1(props: ComponentPropsWithoutRef<"h1">) {
	return (
		<h2 {...props} className="mt-8 text-3xl font-semibold tracking-tight" />
	);
}

function isExternalUrl(href: string | undefined): boolean {
	if (!href) return false;
	return href.startsWith("http://") || href.startsWith("https://");
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
	return {
		LinkCard,
		a: ({ className, href, ...props }) => {
			const isExternal = isExternalUrl(href);
			return (
				<a
					href={href}
					className={cn(
						"text-blue-600 underline underline-offset-4 hover:text-blue-700 dark:text-sky-300 dark:hover:text-sky-200",
						className,
					)}
					{...(isExternal && {
						target: "_blank",
						rel: "noopener noreferrer",
					})}
					{...props}
				/>
			);
		},
		h1: ({ className, ...props }) => (
			<h1
				className={cn("text-3xl font-semibold tracking-tight", className)}
				{...props}
			/>
		),
		h2: ({ className, ...props }) => (
			<h2
				className={cn("mt-8 text-2xl font-semibold tracking-tight", className)}
				{...props}
			/>
		),
		pre: MdxPre,
		code: ({ className, ...props }) => {
			const isBlock =
				className?.includes("language-") || "data-language" in props;

			if (isBlock) {
				return <code className={className} {...props} />;
			}

			return (
				<code
					className={cn(
						"rounded bg-muted px-1.5 py-0.5 text-sm font-mono text-foreground",
						className,
					)}
					{...props}
				/>
			);
		},
		...components,
	};
}
