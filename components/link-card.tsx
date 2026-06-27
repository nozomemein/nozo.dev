import { getCachedLinkPreview } from "@/lib/link-preview/cache";
import { cn } from "@/lib/utils";

type LinkCardProps = {
	href: string;
	className?: string;
};

function getHostname(href: string): string {
	try {
		return new URL(href).hostname.replace(/^www\./, "");
	} catch {
		return href;
	}
}

export function LinkCard({ href, className }: LinkCardProps) {
	const preview = getCachedLinkPreview(href);
	const hostname = getHostname(href);
	const hasRichPreview = Boolean(
		preview?.title || preview?.description || preview?.image,
	);

	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className={cn(
				"not-prose my-6 flex overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 no-underline transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800",
				hasRichPreview ? "flex-col sm:flex-row" : "flex-col gap-2 p-4",
				className,
			)}
		>
			{preview?.image ? (
				<div className="relative aspect-[1.91/1] w-full shrink-0 overflow-hidden bg-neutral-200 sm:aspect-auto sm:h-auto sm:w-48 dark:bg-neutral-800">
					{/* biome-ignore lint/performance/noImgElement: external OGP images use remote URLs at build time */}
					<img
						src={preview.image}
						alt=""
						loading="lazy"
						decoding="async"
						referrerPolicy="no-referrer"
						className="h-full w-full object-cover"
					/>
				</div>
			) : null}

			<div
				className={cn(
					"flex min-w-0 flex-col gap-1",
					hasRichPreview ? "p-4" : undefined,
				)}
			>
				{preview?.siteName ? (
					<p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
						{preview.siteName}
					</p>
				) : (
					<p className="truncate text-xs font-medium text-neutral-500 dark:text-neutral-400">
						{hostname}
					</p>
				)}

				{preview?.title ? (
					<p className="line-clamp-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
						{preview.title}
					</p>
				) : (
					<p className="line-clamp-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
						{hostname}
					</p>
				)}

				{preview?.description ? (
					<p className="line-clamp-2 text-xs text-neutral-600 dark:text-neutral-400">
						{preview.description}
					</p>
				) : (
					<p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
						{href}
					</p>
				)}
			</div>
		</a>
	);
}
