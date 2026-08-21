import { loadEmojis, segmentLine, type Segment } from "./emoji";

export interface CardOptions {
  text: string;
  snakeImg: HTMLImageElement;
  /** ширина змеи в долях от ширины холста (0.1 – 0.6) */
  snakePct: number;
  /** зернистость 0..1 */
  noise: number;
  /** желаемый кегль подписей @mambatinder, px (уменьшится, если мало места) */
  labelSize?: number;
  /** ограничение большей стороны итогового изображения, px (для экспорта) */
  maxResPx?: number;
  /** проверка актуальности рендера после асинхронной загрузки эмодзи */
  isStale?: () => boolean;
}

export interface CardResult {
  w: number;
  h: number;
  scale: number;
  /** размеры макета в логических px (до масштабирования) */
  logicalW: number;
  logicalH: number;
}

/* ---------- константы шаблона (логические px) ---------- */
const F = 84; // кегль текста
const LINE_H = Math.round(F * 1.26);
const PAD_X = Math.round(F * 1.15);
const PAD_TOP = Math.round(F * 0.92);
const SNAKE_GAP = Math.round(F * 0.8);
const MIN_W = 580;

const LABEL_TEXT = "@mambatinder";
const LABEL_MAX = 25; // дефолтный кегль подписей
const LABEL_MIN = 10;
const SIDE_PAD = 44; // поле у края холста
const SIDE_GAP = 16; // отступ подписи от змеи — подписи сидят близко

const PURPLE = "#855f82";
const GRAY = "#97909a";
const ICON_GRAY = "#a49ca9";

const cardFont = (px: number, weight = 800) =>
  `${weight} ${px}px Montserrat, "Segoe UI", sans-serif`;

/* ---------- зерно ---------- */
let noiseTile: HTMLCanvasElement | null = null;
function getNoiseTile(): HTMLCanvasElement {
  if (noiseTile) return noiseTile;
  const size = 200;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = (Math.random() * 255) | 0;
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  noiseTile = c;
  return c;
}

/* ---------- иконки подписей ---------- */
/* Официальный логотип Telegram (viewBox 240×240), серая версия */
const TG_SHADE_LIGHT = new Path2D(
  "M98 175c-3.888 0-3.227-1.468-4.568-5.17L82 132.207 170 80",
);
const TG_SHADE_MID = new Path2D(
  "M98 175c3 0 4.325-1.372 6-3l16-15.558-19.958-12.035",
);
const TG_PLANE = new Path2D(
  "m100.04 144.41 48.36 35.729c5.519 3.045 9.501 1.468 10.876-5.123l19.685-92.763c2.015-8.08-3.08-11.746-8.36-9.349l-115.59 44.571c-7.89 3.165-7.843 7.567-1.438 9.528l29.663 9.259 68.673-43.325c3.242-1.966 6.218-.91 3.776 1.258",
);

function drawTelegramIcon(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.save();
  const g = ctx.createLinearGradient(x + s * 0.32, y, x + s * 0.68, y + s);
  g.addColorStop(0, "#b7aebc");
  g.addColorStop(1, "#8a8190");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x + s / 2, y + s / 2, s / 2, 0, Math.PI * 2);
  ctx.fill();
  const k = s / 240;
  ctx.translate(x + s / 2 - 120 * k, y + s / 2 - 120 * k);
  ctx.scale(k, k);
  ctx.fillStyle = "#d9d3dc";
  ctx.fill(TG_SHADE_LIGHT);
  ctx.fillStyle = "#c2bac7";
  ctx.fill(TG_SHADE_MID);
  ctx.fillStyle = "#ffffff";
  ctx.fill(TG_PLANE);
  ctx.restore();
}

function drawVkIcon(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.save();
  const r = s * 0.27;
  ctx.fillStyle = ICON_GRAY;
  ctx.beginPath();
  ctx.roundRect(x, y, s, s, r);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = `800 ${Math.round(s * 0.46)}px Montserrat, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("VK", x + s / 2, y + s / 2 + s * 0.035);
  ctx.restore();
}

/* ---------- ширина строки с эмодзи ---------- */
function lineWidth(
  segs: Segment[],
  ctx: CanvasRenderingContext2D,
  emojiBox: number,
): number {
  let w = 0;
  for (const s of segs) {
    w += s.kind === "text" ? ctx.measureText(s.value).width : emojiBox;
  }
  return w;
}

/* ---------- главная отрисовка ---------- */
export async function renderCard(
  canvas: HTMLCanvasElement,
  opts: CardOptions,
): Promise<CardResult> {
  const ctx = canvas.getContext("2d")!;
  const lines = opts.text.split("\n");
  const segLines = lines.map((l) => segmentLine(l));
  const emojiMap = await loadEmojis(segLines);
  // пока грузились эмодзи, параметры могли измениться — не рисуем устаревшее
  if (opts.isStale?.()) return { w: 0, h: 0, scale: 0, logicalW: 0, logicalH: 0 };

  const emojiBox = F * 1.3; // Twemoji имеет внутреннее поле, компенсируем
  ctx.font = cardFont(F);
  try {
    (ctx as unknown as { letterSpacing: string }).letterSpacing = "0.5px";
  } catch {
    /* не критично */
  }

  const widths = segLines.map((segs) => lineWidth(segs, ctx, emojiBox));
  const textW = widths.reduce((a, b) => Math.max(a, b), 0);

  // единица ширины подписи на 1 px кегля: иконка + зазор + текст
  ctx.font = cardFont(20, 700);
  const labelUnit = 1 + 0.36 + ctx.measureText(LABEL_TEXT).width / 20;

  /* --- ширина холста: текст, мин. размер и место для подписей --- */
  let cw = Math.max(textW + PAD_X * 2, MIN_W);
  const pct = Math.min(0.6, Math.max(0.1, opts.snakePct));
  for (let i = 0; i < 6; i++) {
    const sw = cw * pct;
    const needed = sw + 2 * (SIDE_PAD + SIDE_GAP + LABEL_MIN * labelUnit);
    if (needed > cw) cw = needed;
    else break;
  }
  cw = Math.round(cw);

  const sw = Math.round(cw * pct);
  const sh = Math.round(sw * (opts.snakeImg.naturalHeight / opts.snakeImg.naturalWidth || 1));

  /* --- высота: текст + отступ + змея, нижний край змеи = край холста --- */
  const textH = lines.length * LINE_H;
  const snakeTop = PAD_TOP + textH + SNAKE_GAP;
  const ch = Math.round(snakeTop + sh);

  /* --- масштаб --- */
  const maxDim = Math.max(cw, ch);
  let scale: number;
  if (opts.maxResPx) {
    // экспорт: итоговое разрешение ограничено ползунком пользователя
    scale = Math.min(3, Math.max(0.2, opts.maxResPx / maxDim));
  } else {
    // предпросмотр: ретиновая чёткость в пределах возможностей браузера
    scale = Math.max(
      1,
      Math.min(3, 15000 / maxDim, Math.sqrt(230_000_000 / (cw * ch))),
    );
  }

  canvas.width = Math.round(cw * scale);
  canvas.height = Math.round(ch * scale);
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  /* фон */
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, cw, ch);

  /* зерно — рисуем в физических пикселях, чтобы крупинка была 1px */
  if (opts.noise > 0) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const pattern = ctx.createPattern(getNoiseTile(), "repeat");
    if (pattern) {
      ctx.globalAlpha = Math.min(1, opts.noise) * 0.55;
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.restore();
  }

  /* текст, всегда по центру */
  ctx.fillStyle = PURPLE;
  ctx.font = cardFont(F);
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  segLines.forEach((segs, li) => {
    const y = PAD_TOP + li * LINE_H + LINE_H / 2;
    let x = (cw - widths[li]) / 2;
    for (const s of segs) {
      if (s.kind === "text") {
        ctx.fillText(s.value, x, y);
        x += ctx.measureText(s.value).width;
      } else {
        const img = emojiMap.get(s.codepoint);
        if (img) {
          ctx.drawImage(img, x, y - emojiBox / 2, emojiBox, emojiBox);
        } else {
          // фолбэк — системные эмодзи, если CDN недоступен
          ctx.save();
          ctx.font = `${Math.round(F * 1.05)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
          ctx.fillText(s.value, x, y);
          ctx.restore();
        }
        x += emojiBox;
      }
    }
  });

  /* змея — по центру, нижняя граница совпадает с границей шаблона */
  const sx = (cw - sw) / 2;
  ctx.drawImage(opts.snakeImg, sx, snakeTop, sw, sh);

  /* подписи по бокам от змеи, адаптивно центрируются по её вертикали */
  const avail = (cw - sw) / 2 - SIDE_PAD - SIDE_GAP;
  let ls = Math.min(opts.labelSize ?? LABEL_MAX, avail / labelUnit);
  ls = Math.max(LABEL_MIN, Math.round(ls));
  const totalW = ls * labelUnit;
  const icon = ls;
  const textGap = ls * 0.36;
  ctx.font = cardFont(ls, 700);
  ctx.fillStyle = GRAY;
  ctx.textBaseline = "middle";

  const lcY = snakeTop + sh / 2;
  // слева: [TG] @mambatinder — правый край у змеи
  const leftEnd = sx - SIDE_GAP;
  const leftStart = leftEnd - totalW;
  drawTelegramIcon(ctx, leftStart, lcY - icon / 2, icon);
  ctx.textAlign = "left";
  ctx.fillText(LABEL_TEXT, leftStart + icon + textGap, lcY + ls * 0.04);

  // справа: [VK] @mambatinder — левый край у змеи
  const rightStart = sx + sw + SIDE_GAP;
  drawVkIcon(ctx, rightStart, lcY - icon / 2, icon);
  ctx.fillText(LABEL_TEXT, rightStart + icon + textGap, lcY + ls * 0.04);

  return { w: canvas.width, h: canvas.height, scale, logicalW: cw, logicalH: ch };
}
