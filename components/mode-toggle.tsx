"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const themeOptions = [
	{ value: "light", label: "Light" },
	{ value: "dark", label: "Dark" },
	{ value: "system", label: "System" },
] as const;

export function ModeToggle() {
	const { setTheme } = useTheme();
	const [open, setOpen] = useState(false);
	const menuId = useId();
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) {
			return;
		}

		function handlePointerDown(event: MouseEvent) {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setOpen(false);
			}
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				setOpen(false);
			}
		}

		document.addEventListener("mousedown", handlePointerDown);
		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("mousedown", handlePointerDown);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [open]);

	return (
		<div ref={containerRef} className="relative">
			<Button
				variant="ghost"
				size="icon"
				className="h-8 w-8"
				aria-expanded={open}
				aria-haspopup="menu"
				aria-controls={menuId}
				onClick={() => setOpen((current) => !current)}
			>
				<Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
				<Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
				<span className="sr-only">Toggle theme</span>
			</Button>
			{open ? (
				<div
					id={menuId}
					role="menu"
					className="absolute right-0 top-full z-50 mt-1 min-w-32 rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
				>
					{themeOptions.map((option) => (
						<button
							key={option.value}
							type="button"
							role="menuitem"
							className={cn(
								"flex w-full cursor-pointer rounded-sm px-2 py-1.5 text-left text-sm outline-hidden hover:bg-accent hover:text-accent-foreground",
							)}
							onClick={() => {
								setTheme(option.value);
								setOpen(false);
							}}
						>
							{option.label}
						</button>
					))}
				</div>
			) : null}
		</div>
	);
}
