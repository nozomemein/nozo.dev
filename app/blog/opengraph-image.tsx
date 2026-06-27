import { contentType, createOgImage, size } from "@/lib/og-image/response";

export { contentType, size };
export const dynamic = "force-static";

export default async function OpenGraphImage() {
	return createOgImage({
		title: "Blog",
	});
}
