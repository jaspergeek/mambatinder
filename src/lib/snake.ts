/**
 * Фирменная змея Mambatinder — стилизованная спираль, строится кодом,
 * поэтому идеально резкая в любом размере и с прозрачным фоном.
 */

export function buildSnakeSVG(): string {
  const C = 100;
  const CY = 100;
  const r0 = 13; // радиус внутреннего витка
  const r1 = 52; // радиус внешнего витка
  const turns = 2.05;
  const N = 180;
  const thMax = turns * Math.PI * 2;

  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const th = t * thMax - Math.PI / 2;
    const r = r0 + (r1 - r0) * Math.pow(t, 1.16);
    pts.push([C + r * Math.cos(th), CY + r * Math.sin(th)]);
  }

  const d = pts
    .map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(2) + "," + p[1].toFixed(2))
    .join(" ");

  // направление касательной в конце спирали — туда смотрит голова
  const [ax, ay] = pts[N - 6];
  const [bx, by] = pts[N];
  const ang = (Math.atan2(by - ay, bx - ax) * 180) / Math.PI;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <path d="${d}" fill="none" stroke="#6b4a68" stroke-width="23" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="${d}" fill="none" stroke="#855f82" stroke-width="19" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="${d}" fill="none" stroke="#c3a7bf" stroke-width="17" stroke-linecap="butt" stroke-linejoin="round" stroke-dasharray="2.6 21" opacity="0.5"/>
  <path d="${d}" fill="none" stroke="#a5829f" stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>
  <circle cx="${pts[0][0].toFixed(2)}" cy="${pts[0][1].toFixed(2)}" r="9" fill="#855f82"/>
  <g transform="translate(${bx.toFixed(2)},${by.toFixed(2)}) rotate(${ang.toFixed(2)})">
    <path d="M28 0 L41 0 M41 0 L47 -5 M41 0 L47 5" stroke="#e0567c" stroke-width="3.4" fill="none" stroke-linecap="round"/>
    <ellipse cx="10" cy="0" rx="18.5" ry="13.5" fill="#855f82"/>
    <ellipse cx="8" cy="0" rx="18.5" ry="13.5" fill="none" stroke="#6b4a68" stroke-width="2.6"/>
    <circle cx="15.5" cy="-5" r="4.7" fill="#ffffff"/>
    <circle cx="16.9" cy="-5" r="2.3" fill="#2e2030"/>
    <circle cx="25.5" cy="-1.5" r="1.15" fill="#6b4a68"/>
    <circle cx="25.5" cy="1.5" r="1.15" fill="#6b4a68"/>
  </g>
</svg>`;
}

let cache: string | null = null;

export function defaultSnakeDataURL(): string {
  if (!cache) {
    cache = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(buildSnakeSVG());
  }
  return cache;
}

/** SVG-спираль для логотипа интерфейса (упрощённая). */
export function logoSpiralPath(): string {
  const C = 12;
  const r0 = 2.4;
  const r1 = 9.4;
  const turns = 1.9;
  const N = 90;
  const thMax = turns * Math.PI * 2;
  let d = "";
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const th = t * thMax - Math.PI / 2;
    const r = r0 + (r1 - r0) * Math.pow(t, 1.16);
    d += (i === 0 ? "M" : "L") + (C + r * Math.cos(th)).toFixed(2) + "," + (C + r * Math.sin(th)).toFixed(2);
  }
  return d;
}
