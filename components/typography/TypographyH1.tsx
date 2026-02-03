import type { ReactNode } from "react";

type Props = {
	children: ReactNode;
};

export const TypographyH1 = ({ children }: Props) => {
	return (
		<h1 className="scroll-m-20 text-2xl font-semibold tracking-tight">
			{children}
		</h1>
	);
};
