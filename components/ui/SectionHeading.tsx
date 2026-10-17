import type { ReactNode } from "react";

interface SectionHeadingProps {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  tone?: "light" | "dark";
  align?: "left" | "center";
  id?: string;
}

export function SectionHeading({ eyebrow, title, lead, tone = "light", align = "left", id }: SectionHeadingProps) {
  const dark = tone === "dark";
  return (
    <div className={`max-w-3xl space-y-5 ${align === "center" ? "mx-auto text-center flex flex-col items-center" : ""}`}>
      <p className={`eyebrow ${dark ? "text-alu" : "text-ink-2"}`}>{eyebrow}</p>
      <h2 id={id} className={`text-h2 ${dark ? "text-white" : ""}`}>
        {title}
      </h2>
      {lead && <p className={`text-lead max-w-2xl ${dark ? "text-white/75" : "text-ink-2"}`}>{lead}</p>}
    </div>
  );
}
