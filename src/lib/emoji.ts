import emojiRegex from "emoji-regex";

export type Segment =
  | { kind: "text"; value: string }
  | { kind: "emoji"; value: string; codepoint: string };

/**
 * Codepoint по правилам Twemoji: FE0F отбрасывается, если в последовательности
 * нет ZWJ (U+200D) — именно так называются файлы в наборе jdecked/twemoji.
 */
export function toCodePoint(raw: string): string {
  const src = raw.includes("\u200D") ? raw : raw.replace(/\uFE0F/g, "");
  return Array.from(src)
    .map((ch) => ch.codePointAt(0)!.toString(16))
    .join("-");
}

const CDN = "https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg";

export function emojiURL(codepoint: string): string {
  return `${CDN}/${codepoint}.svg`;
}

/** Разбивает строку на текстовые и эмодзи-сегменты (порядок сохраняется). */
export function segmentLine(line: string): Segment[] {
  const segs: Segment[] = [];
  const re = emojiRegex();
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line)) !== null) {
    if (m.index > last) {
      segs.push({ kind: "text", value: line.slice(last, m.index) });
    }
    segs.push({ kind: "emoji", value: m[0], codepoint: toCodePoint(m[0]) });
    last = m.index + m[0].length;
  }
  if (last < line.length) {
    segs.push({ kind: "text", value: line.slice(last) });
  }
  return segs;
}

const cache = new Map<string, Promise<HTMLImageElement | null>>();

/** Загружает SVG-эмодзи (кэш + CORS, чтобы картинку можно было экспортировать). */
export function loadEmoji(codepoint: string): Promise<HTMLImageElement | null> {
  let p = cache.get(codepoint);
  if (!p) {
    p = new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = emojiURL(codepoint);
    });
    cache.set(codepoint, p);
  }
  return p;
}

export async function loadEmojis(
  lines: Segment[][],
): Promise<Map<string, HTMLImageElement | null>> {
  const unique = new Map<string, Promise<HTMLImageElement | null>>();
  for (const segs of lines) {
    for (const s of segs) {
      if (s.kind === "emoji" && !unique.has(s.codepoint)) {
        unique.set(s.codepoint, loadEmoji(s.codepoint));
      }
    }
  }
  const entries = Array.from(unique.entries());
  const results = await Promise.all(entries.map(([, p]) => p));
  const map = new Map<string, HTMLImageElement | null>();
  entries.forEach(([cp], i) => map.set(cp, results[i]));
  return map;
}
