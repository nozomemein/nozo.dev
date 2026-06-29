"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const themeOptions = [
	{ value: "light", label: "Light" },
	{ value: "dark", label: "Dark" },
	{ value: "system", label: "System" },
] as const;

export function ModeToggle() {
	const { setTheme } = useTheme();

	return (
		<details className="group relative">
			<summary
				className={cn(
					"inline-flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-md",
					"[&::-webkit-details-marker]:hidden",
				)}
			>
				<Button
					variant="ghost"
					size="icon"
					className="pointer-events-none h-8 w-8"
					tabIndex={-1}
					aria-hidden
				>
					<Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
					<Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
					<span className="sr-only">Toggle theme</span>
				</Button>
			</summary>
			<div className="absolute right-0 top-full z-50 mt-1 min-w-32 rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
				{themeOptions.map((option) => (
					<button
						key={option.value}
						type="button"
						className="flex w-full cursor-pointer rounded-sm px-2 py-1.5 text-left text-sm outline-hidden hover:bg-accent hover:text-accent-foreground"
						onClick={() => setTheme(option.value)}
					>
						{option.label}
					</button>
				))}
			</div>
		</details>
	);
}
