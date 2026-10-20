import { readFile } from "node:fs/promises";
import path from "node:path";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import { theme } from "@/lib/og-image/theme";
import { config } from "@/lib/site/config";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function renderImage(
	element: Parameters<typeof satori>[0],
	options: Parameters<typeof satori>[1],
) {
	const svg = await satori(element, options);
	const png = new Resvg(svg).render().asPng();
	return new Response(new Uint8Array(png), {
		headers: { "Content-Type": contentType },
	});
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

type CreateOgImageOptions = {
	title: string;
	/** Omit for site name; pass `null` to hide the footer row. */
	footer?: string | null;
};

export async function createOgImage({ title, footer }: CreateOgImageOptions) {
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
		return renderImage(
			<div
				style={{
					display: "flex",
					alignItems: "center",
					width: size.width,
					height: size.height,
					backgroundColor: theme.background,
					padding: "80px",
					boxSizing: "border-box",
				}}
			>
				<div
					style={{
						fontSize: 64,
						fontWeight: 700,
						color: theme.foreground,
						fontFamily: "Noto Sans JP",
						lineHeight: 1.3,
					}}
				>
					{title}
				</div>
			</div>,
			{ ...size, fonts },
		);
	}

	return renderImage(
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between",
				width: size.width,
				height: size.height,
				backgroundColor: theme.background,
				padding: "80px",
				boxSizing: "border-box",
			}}
		>
			<div
				style={{
					display: "flex",
					flex: 1,
					alignItems: "center",
					fontSize: 64,
					fontWeight: 700,
					color: theme.foreground,
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
					color: theme.mutedForeground,
					fontFamily: "Noto Sans JP",
				}}
			>
				{footerText}
			</div>
		</div>,
		{ ...size, fonts },
	);
}
