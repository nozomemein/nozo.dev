import { TypographyH1, TypographyP } from "@/components/typography";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-start p-24">
      <TypographyH1>nozomemein</TypographyH1>
      <TypographyP>
        Hello, I&apos;m nozomemein, a passionate software engineer.
      </TypographyP>
      <TypographyP>
        I thrive on creating elegant solutions and crafting beautiful code.
      </TypographyP>
    </main>
  );
}
