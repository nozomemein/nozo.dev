import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { ogImageTheme } from "@/lib/og/colors";
import { config } from "@/lib/seo/site";

export const ogImageSize = { width: 1200, height: 630 };
export const ogImageContentType = "image/png";

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

type CreateOgImageResponseOptions = {
	title: string;
	/** Omit for site name; pass `null` to hide the footer row. */
	footer?: string | null;
};

export async function createOgImageResponse({
	title,
	footer,
}: CreateOgImageResponseOptions) {
	const fontData = await getFontData();
	const footerText = footer === undefined ? config.site.name : footer;
	const fonts = [
		{
			name: "Noto Sans JP",
			data: fontData,
			style: "normal" as const,
			weight: 700 as const,
		},
	];

	if (!footerText) {
		return new ImageResponse(
			<div
				style={{
					display: "flex",
					alignItems: "center",
					width: "100%",
					height: "100%",
					backgroundColor: ogImageTheme.background,
					padding: "80px",
				}}
			>
				<div
					style={{
						fontSize: 64,
						fontWeight: 700,
						color: ogImageTheme.foreground,
						fontFamily: "Noto Sans JP",
						lineHeight: 1.3,
					}}
				>
					{title}
				</div>
			</div>,
			{ ...ogImageSize, fonts },
		);
	}

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
				{title}
			</div>
			<div
				style={{
					fontSize: 28,
					fontWeight: 500,
					color: ogImageTheme.mutedForeground,
					fontFamily: "Noto Sans JP",
				}}
			>
				{footerText}
			</div>
		</div>,
		{ ...ogImageSize, fonts },
	);
}
