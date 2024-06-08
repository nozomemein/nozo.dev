import { ReactNode } from "react";
type Props = {
  children: ReactNode;
};
export const TypographyP = ({ children }: Props) => {
  return <p className="leading-7 [&:not(:first-child)]:mt-6">{children}</p>;
};
