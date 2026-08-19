import { logoSpiralPath } from "../lib/snake";

type P = { className?: string };

export function LogoMark({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path
        d={logoSpiralPath()}
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="21" cy="12.6" r="2.6" fill="currentColor" />
    </svg>
  );
}

export function UploadIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 16V4m0 0 4 4m-4-4L8 8" />
      <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

export function SaveIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 4v11m0 0 4-4m-4 4-4-4" />
      <path d="M4 17v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1" />
    </svg>
  );
}

export function CheckIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

export function TypeIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 7V5h14v2M12 5v14m-3 0h6" />
    </svg>
  );
}

export function SnakeIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 17c0 2 1.6 3 3.5 3S11 18.8 11 17s-1.5-3-3.5-3S4 15 4 13s1.6-3 3.5-3c3 0 4.5 2 7.5 2 2 0 4-1 4-3.5S17 5 15.5 5" />
      <circle cx="15.5" cy="5" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function GrainIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      {[
        [5, 5], [12, 4], [19, 6], [7, 10], [15, 9], [20, 12], [4, 14], [11, 13],
        [17, 15], [6, 19], [13, 18], [19, 19], [9, 7], [16, 20],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.25 : 0.9} />
      ))}
    </svg>
  );
}

export function RulerIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 14.5 14.5 3 21 9.5 9.5 21 3 14.5Z" />
      <path d="m7 10.5 1.8 1.8M10 7.5l1.8 1.8M13 4.5l1.8 1.8" />
    </svg>
  );
}

export function TgGlyph({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="12" r="11" fill="currentColor" opacity="0.16" />
      <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" fill="currentColor" transform="scale(0.72) translate(4.7 4.7)" />
    </svg>
  );
}

export function VkGlyph({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="1" y="1" width="22" height="22" rx="6" fill="currentColor" opacity="0.16" />
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fontFamily="Montserrat, sans-serif"
        fontWeight="800"
        fontSize="10.5"
        fill="currentColor"
      >
        VK
      </text>
    </svg>
  );
}
