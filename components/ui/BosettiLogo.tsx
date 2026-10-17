import React from "react";

interface BosettiLogoProps {
  className?: string;
  variant?: "light-bg" | "dark-bg";
}

export function BosettiLogo({ className = "h-12 w-auto", variant = "light-bg" }: BosettiLogoProps) {
  const textColor = variant === "dark-bg" ? "#F6F4F1" : "#1F1F1F";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 600 220"
      fill="none"
      className={className}
      role="img"
      aria-label="Bosetti Serramenti - Produzione Serramenti in Alluminio a Montichiari"
    >
      {/* Key Bow (Left vertical rounded oval in #A8282A) */}
      <rect
        x="26"
        y="26"
        width="84"
        height="168"
        rx="42"
        stroke="#A8282A"
        strokeWidth="18"
      />
      {/* Key Shaft (Horizontal bar between BOSETTI and SERRAMENTI) */}
      <path
        d="M110 108H574"
        stroke="#A8282A"
        strokeWidth="15"
        strokeLinecap="round"
      />
      {/* Key Bit / Teeth (Right side notched block) */}
      <path
        d="M502 108H560V165C560 167 558.5 168 556.5 168H548V154H541V168H532V154H525V168H516V154H509V168H505.5C503.5 168 502 167 502 165V108Z"
        fill="#A8282A"
      />
      {/* BOSETTI Text */}
      <text
        x="134"
        y="90"
        fill={textColor}
        fontFamily="var(--font-archivo), Arial, sans-serif"
        fontWeight="800"
        fontSize="88"
        letterSpacing="1.5"
      >
        BOSETTI
      </text>
      {/* SERRAMENTI Text */}
      <text
        x="138"
        y="161"
        fill={textColor}
        fontFamily="var(--font-archivo), Arial, sans-serif"
        fontWeight="700"
        fontSize="43"
        letterSpacing="2.8"
      >
        SERRAMENTI
      </text>
    </svg>
  );
}
