import { readFile } from "node:fs/promises";
import path from "node:path";
import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";
import { config } from "@/lib/constants";
import { ogImageTheme } from "@/lib/og/colors";
import { getPostFrontmatterBySlug } from "@/lib/post-frontmatter";
import { getAllSlugs } from "@/lib/posts";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
	return getAllSlugs({ includeDrafts: false }).map((slug) => ({ slug }));
}

let fontDataPromise: Promise<ArrayBuffer> | null = null;

function getFontData() {
	if (!fontDataPromise) {
		fontDataPromise = readFile(
			path.join(process.cwd(), "assets/fonts/NotoSansJP-Bold.woff"),
		).then((buffer) =>
			buffer.buffer.slice(
				buffer.byteOffset,
				buffer.byteOffset + buffer.byteLength,
			),
		);
	}
	return fontDataPromise;
}

export default async function OpenGraphImage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const frontmatter = getPostFrontmatterBySlug(slug);

	if (!frontmatter || frontmatter.status === "draft") {
		notFound();
	}

	const fontData = await getFontData();

	return new ImageResponse(
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between",
				width: "100%",
				height: "100%",
				backgroundColor: ogImageTheme.background,
				padding: "80px",
			}}
		>
			<div
				style={{
					display: "flex",
					flex: 1,
					alignItems: "center",
					fontSize: 64,
					fontWeight: 700,
					color: ogImageTheme.foreground,
					fontFamily: "Noto Sans JP",
					lineHeight: 1.3,
				}}
			>
				{frontmatter.title}
			</div>
			<div
				style={{
					fontSize: 28,
					fontWeight: 500,
					color: ogImageTheme.mutedForeground,
					fontFamily: "Noto Sans JP",
				}}
			>
				{config.site.name}
			</div>
		</div>,
		{
			...size,
			fonts: [
				{
					name: "Noto Sans JP",
					data: fontData,
					style: "normal",
					weight: 700,
				},
			],
		},
	);
}
