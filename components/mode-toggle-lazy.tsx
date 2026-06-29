"use client";

import dynamic from "next/dynamic";

export const ModeToggleLazy = dynamic(
	() => import("@/components/mode-toggle").then((mod) => mod.ModeToggle),
	{
		ssr: false,
		loading: () => <div className="h-8 w-8" aria-hidden />,
	},
);
