import { frontmatter } from "@/content/pages/privacy.mdx";
import {
	createOgImageResponse,
	ogImageContentType,
	ogImageSize,
} from "@/lib/og/image-response";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const dynamic = "force-static";

export default async function OpenGraphImage() {
	return createOgImageResponse({
		title: frontmatter.title ?? "プライバシーポリシー",
	});
}
