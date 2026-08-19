import {
  useRef,
  useState,
  type CSSProperties,
  type DragEvent,
  type ReactNode,
  type RefObject,
} from "react";
import {
  CheckIcon,
  ExpandIcon,
  GrainIcon,
  SaveIcon,
  SnakeIcon,
  TgGlyph,
  TypeIcon,
  UploadIcon,
  VkGlyph,
} from "./icons";

const QUICK_EMOJI = ["🐍", "💜", "❤️", "🔥", "😂", "😘", "✨", "🥂"];

interface Props {
  text: string;
  onText: (v: string) => void;
  textareaRef: RefObject<HTMLTextAreaElement>;
  snakeName: string;
  snakeThumb: string;
  snakeIsDefault: boolean;
  onSnakeFile: (f: File) => void;
  onSnakeDefault: () => void;
  snakePct: number; // 10..60
  onSnakePct: (v: number) => void;
  labelSize: number; // 10..40 px — кегль подписей
  onLabelSize: (v: number) => void;
  noise: number; // 0..100
  onNoise: (v: number) => void;
  maxRes: number; // ограничение большей стороны JPG, px
  onMaxRes: (v: number) => void;
  onSave: () => void;
  saved: boolean;
  /** итоговое разрешение JPG */
  exportDims: { w: number; h: number } | null;
  /** логический размер холста (макет) */
  layoutDims: { w: number; h: number } | null;
}

function SectionTitle({
  icon,
  children,
  badge,
}: {
  icon: ReactNode;
  children: ReactNode;
  badge?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid h-7 w-7 place-items-center rounded-lg bg-plum-700 text-brand-faint">
        {icon}
      </span>
      <h2 className="font-display text-[11px] font-medium uppercase tracking-[0.18em] text-brand-faint">
        {children}
      </h2>
      {badge && <span className="ml-auto">{badge}</span>}
    </div>
  );
}

function Slider({
  value,
  min,
  max,
  onChange,
  format,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex items-center gap-4">
      <input
        type="range"
        className="slider"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ "--fill": `${pct}%` } as CSSProperties}
      />
      <span className="w-14 shrink-0 rounded-md bg-plum-700 px-2 py-1 text-center font-display text-[11px] font-medium text-brand-faint tabular-nums">
        {format(value)}
      </span>
    </div>
  );
}

export default function Controls(p: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const insertEmoji = (e: string) => {
    const ta = p.textareaRef.current;
    if (!ta) {
      p.onText(p.text + e);
      return;
    }
    const start = ta.selectionStart ?? p.text.length;
    const end = ta.selectionEnd ?? p.text.length;
    const next = p.text.slice(0, start) + e + p.text.slice(end);
    p.onText(next);
    requestAnimationFrame(() => {
      ta.focus();
      const pos = start + e.length;
      ta.setSelectionRange(pos, pos);
    });
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith("image/")) p.onSnakeFile(f);
  };

  return (
    <div className="flex h-full flex-col gap-7 overflow-y-auto nice-scroll px-7 py-8">
      {/* ---- текст ---- */}
      <section className="anim-rise" style={{ animationDelay: "60ms" }}>
        <SectionTitle
          icon={<TypeIcon className="h-4 w-4" />}
          badge={
            <span className="font-display text-[10px] text-plum-500 tabular-nums">
              {p.text.length} симв.
            </span>
          }
        >
          Текст карточки
        </SectionTitle>
        <textarea
          ref={p.textareaRef}
          value={p.text}
          onChange={(e) => p.onText(e.target.value)}
          rows={4}
          spellCheck={false}
          placeholder={"Введите текст…\nEnter — новая строка"}
          className="mt-4 w-full resize-y rounded-xl border border-plum-600 bg-plum-800/80 px-4 py-3.5 font-card text-[15px] font-bold leading-snug text-paper outline-none transition placeholder:font-body placeholder:font-medium placeholder:text-plum-500 focus:border-brand focus:ring-4 focus:ring-brand/20"
        />
        <p className="mt-2.5 text-[12.5px] leading-relaxed text-plum-500">
          <kbd className="rounded border border-plum-600 bg-plum-800 px-1.5 py-0.5 font-display text-[10px] text-brand-faint">
            Enter
          </kbd>{" "}
          — перенос строки, холст растёт вверх. Длинное предложение растянет
          холст вширь. Эмодзи отрисовываются в стиле Telegram.
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {QUICK_EMOJI.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => insertEmoji(e)}
              className="grid h-9 w-9 place-items-center rounded-lg border border-plum-600 bg-plum-800 text-lg transition hover:-translate-y-0.5 hover:border-brand hover:bg-plum-700 active:translate-y-0 active:scale-95"
              title={`Вставить ${e}`}
            >
              {e}
            </button>
          ))}
        </div>
      </section>

      {/* ---- змея ---- */}
      <section className="anim-rise" style={{ animationDelay: "140ms" }}>
        <SectionTitle icon={<SnakeIcon className="h-4 w-4" />}>Змея</SectionTitle>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          className={`mt-4 flex items-center gap-4 rounded-xl border-2 border-dashed p-3.5 transition ${
            drag
              ? "border-brand bg-brand/15"
              : "border-plum-600 bg-plum-800/60"
          }`}
        >
          <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-white p-1 shadow-inner">
            <img src={p.snakeThumb} alt="Змея" className="h-full w-full object-contain" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-bold text-paper">{p.snakeName}</p>
            <p className="mt-0.5 text-[11.5px] text-plum-500">
              PNG / JPG / SVG · перетащите файл сюда
            </p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-[12px] font-bold text-white shadow-sm shadow-brand/40 transition hover:-translate-y-0.5 hover:bg-brand-deep active:translate-y-0"
              >
                <UploadIcon className="h-3.5 w-3.5" />
                Загрузить
              </button>
              {!p.snakeIsDefault && (
                <button
                  type="button"
                  onClick={p.onSnakeDefault}
                  className="rounded-lg border border-plum-600 px-3 py-1.5 text-[12px] font-semibold text-brand-faint transition hover:border-brand hover:text-paper"
                >
                  Фирменная
                </button>
              )}
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) p.onSnakeFile(f);
              e.target.value = "";
            }}
          />
        </div>

        <div className="mt-5">
          <div className="mb-1.5 flex items-baseline justify-between">
            <label className="text-[13px] font-semibold text-paper/90">
              Размер змеи
            </label>
            <span className="text-[11px] text-plum-500">доля ширины холста</span>
          </div>
          <Slider
            value={p.snakePct}
            min={12}
            max={60}
            onChange={p.onSnakePct}
            format={(v) => `${v}%`}
          />
        </div>
      </section>

      {/* ---- подписи ---- */}
      <section className="anim-rise" style={{ animationDelay: "180ms" }}>
        <SectionTitle
          icon={<TypeIcon className="h-4 w-4" />}
          badge={
            <span className="inline-flex items-center gap-1 font-display text-[10px] text-plum-500">
              <TgGlyph className="h-3.5 w-3.5 text-brand-soft" />
              <VkGlyph className="h-3.5 w-3.5 text-brand-soft" />
            </span>
          }
        >
          Подписи @mambatinder
        </SectionTitle>
        <div className="mt-4">
          <div className="mb-1.5 flex items-baseline justify-between">
            <label className="text-[13px] font-semibold text-paper/90">
              Размер шрифта подписей
            </label>
            <span className="text-[11px] text-plum-500">серые, у змеи</span>
          </div>
          <Slider
            value={p.labelSize}
            min={10}
            max={40}
            onChange={p.onLabelSize}
            format={(v) => `${v}px`}
          />
          <p className="mt-1.5 text-[11.5px] text-plum-500">
            Иконка Telegram слева, VK справа. Если места у змеи мало — шрифт
            ужмётся сам.
          </p>
        </div>
      </section>

      {/* ---- зерно ---- */}
      <section className="anim-rise" style={{ animationDelay: "220ms" }}>
        <SectionTitle icon={<GrainIcon className="h-4 w-4" />}>Зернистость</SectionTitle>
        <div className="mt-4">
          <Slider
            value={p.noise}
            min={0}
            max={100}
            onChange={p.onNoise}
            format={(v) => `${v}%`}
          />
          <p className="mt-1.5 text-[11.5px] text-plum-500">
            Плёночный шум поверх белого фона шаблона.
          </p>
        </div>
      </section>

      {/* ---- итоговое разрешение ---- */}
      <section className="anim-rise" style={{ animationDelay: "260ms" }}>
        <SectionTitle
          icon={<ExpandIcon className="h-4 w-4" />}
          badge={
            <span className="font-display text-[10px] uppercase tracking-[0.1em] text-plum-500">
              макс. сторона
            </span>
          }
        >
          Разрешение JPG
        </SectionTitle>
        <div className="mt-4">
          <Slider
            value={p.maxRes}
            min={720}
            max={6000}
            onChange={p.onMaxRes}
            format={(v) => `${v}px`}
          />
          {p.exportDims && (
            <p className="mt-2.5 flex items-center gap-2.5 rounded-lg border border-brand/25 bg-brand/10 px-3 py-2 text-[12px] font-bold text-brand-faint">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
              </span>
              Итоговое изображение: {p.exportDims.w} × {p.exportDims.h} px
            </p>
          )}
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-plum-500">
            Чем длиннее текст — тем крупнее макет. Ползунок ограничивает
            большую сторону файла, чтобы не получались полотна по 10 000 px.
            Предпросмотр при этом всегда чёткий.
          </p>
        </div>
      </section>

      <div className="mt-auto" />

      {/* ---- сохранение ---- */}
      <section className="anim-rise" style={{ animationDelay: "300ms" }}>
        <button
          type="button"
          onClick={p.onSave}
          className={`group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl px-5 py-4 font-display text-[13px] font-bold uppercase tracking-[0.14em] transition active:scale-[0.98] ${
            p.saved
              ? "bg-[#4d7c5f] text-white"
              : "bg-brand text-white shadow-lg shadow-brand/40 hover:-translate-y-0.5 hover:bg-brand-deep hover:shadow-xl hover:shadow-brand/50"
          }`}
        >
          {p.saved ? (
            <>
              <CheckIcon className="h-5 w-5" />
              Сохранено
            </>
          ) : (
            <>
              <SaveIcon className="h-5 w-5 transition-transform group-hover:translate-y-0.5" />
              Сохранить JPG
            </>
          )}
        </button>
        <div className="mt-3 flex items-center justify-between text-[11.5px] text-plum-500">
          <span>Качество 92% · белый фон</span>
          <span className="tabular-nums" title="Логический размер макета">
            макет {p.layoutDims ? `${p.layoutDims.w} × ${p.layoutDims.h}` : "…"}
          </span>
        </div>
        <div className="mt-4 flex items-center justify-center gap-3 border-t border-plum-700 pt-4 text-[11px] font-semibold text-plum-500">
          <span className="inline-flex items-center gap-1.5">
            <TgGlyph className="h-4 w-4 text-brand-soft" /> @mambatinder
          </span>
          <span className="text-plum-600">·</span>
          <span className="inline-flex items-center gap-1.5">
            <VkGlyph className="h-4 w-4 text-brand-soft" /> @mambatinder
          </span>
        </div>
      </section>
    </div>
  );
}
