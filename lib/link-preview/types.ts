export type LinkPreview = {
	title?: string;
	description?: string;
	image?: string;
	siteName?: string;
	fetchedAt?: string;
	failedAt?: string;
};

export type LinkPreviewCache = Record<string, LinkPreview>;
