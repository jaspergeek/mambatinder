import { useEffect, useRef, useState } from "react";
import Controls from "./components/Controls";
import Preview from "./components/Preview";
import { LogoMark } from "./components/icons";
import { defaultSnakeDataURL } from "./lib/snake";
import { renderCard } from "./lib/render";

interface SnakeState {
  img: HTMLImageElement;
  src: string;
  name: string;
  isDefault: boolean;
}

const DEFAULT_TEXT = "Свидание\nс характером 🐍💜";

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const savedTimer = useRef<number | undefined>(undefined);

  const [text, setText] = useState(DEFAULT_TEXT);
  const [snake, setSnake] = useState<SnakeState | null>(null);
  const [snakePct, setSnakePct] = useState(30); // % ширины холста
  const [noise, setNoise] = useState(30); // %
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const [scale, setScale] = useState<number | null>(null);
  const [fontsReady, setFontsReady] = useState(false);
  const [saved, setSaved] = useState(false);

  /* фирменная змея по умолчанию */
  useEffect(() => {
    const img = new Image();
    img.onload = () =>
      setSnake({
        img,
        src: img.src,
        name: "Фирменная змея Mambatinder",
        isDefault: true,
      });
    img.src = defaultSnakeDataURL();
  }, []);

  /* ждём Montserrat, иначе канвас посчитает ширину чужим шрифтом */
  useEffect(() => {
    let live = true;
    const specs = [
      "800 84px Montserrat",
      "700 25px Montserrat",
      "800 13px Montserrat",
      "800 10px Montserrat",
    ];
    const fallback = window.setTimeout(() => live && setFontsReady(true), 2600);
    Promise.all(specs.map((s) => document.fonts.load(s)))
      .then(() => document.fonts.ready)
      .then(() => {
        window.clearTimeout(fallback);
        if (live) setFontsReady(true);
      })
      .catch(() => live && setFontsReady(true));
    return () => {
      live = false;
      window.clearTimeout(fallback);
    };
  }, []);

  /* живой рендер холста */
  useEffect(() => {
    if (!snake || !fontsReady) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    let live = true;
    renderCard(canvas, {
      text,
      snakeImg: snake.img,
      snakePct: snakePct / 100,
      noise: noise / 100,
      isStale: () => !live,
    }).then((res) => {
      if (!live || res.w === 0) return;
      setDims({ w: res.w, h: res.h });
      setScale(res.scale);
    });
    return () => {
      live = false;
    };
  }, [text, snake, snakePct, noise, fontsReady]);

  /* сохранение в JPG */
  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || !dims) return;
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `mambatinder-${dims.w}x${dims.h}.jpg`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 5000);
      },
      "image/jpeg",
      0.92,
    );
    setSaved(true);
    window.clearTimeout(savedTimer.current);
    savedTimer.current = window.setTimeout(() => setSaved(false), 1800);
  };

  /* Ctrl/Cmd + S */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });

  const handleSnakeFile = (f: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result);
      const img = new Image();
      img.onload = () =>
        setSnake({ img, src, name: f.name, isDefault: false });
      img.src = src;
    };
    reader.readAsDataURL(f);
  };

  const handleSnakeDefault = () => {
    const img = new Image();
    img.onload = () =>
      setSnake({
        img,
        src: img.src,
        name: "Фирменная змея Mambatinder",
        isDefault: true,
      });
    img.src = defaultSnakeDataURL();
  };

  const ready = Boolean(snake && fontsReady);

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <div className="grain-overlay" aria-hidden />

      {/* ---------- шапка ---------- */}
      <header className="relative z-20 flex h-16 shrink-0 items-center gap-3.5 border-b border-plum-700 bg-plum-900 px-5 lg:px-7">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-white shadow-lg shadow-brand/50 transition-transform duration-300 hover:rotate-[18deg]">
          <LogoMark className="h-5.5 w-5.5" />
        </div>
        <div className="leading-tight">
          <p className="font-display text-[15px] font-bold text-paper">
            mambatinder
            <span className="text-brand-soft"> / карточки</span>
          </p>
          <p className="text-[11px] font-semibold tracking-wide text-plum-500">
            картинка сама подстраивается под текст
          </p>
        </div>
        <div className="ml-auto hidden items-center gap-2 md:flex">
          <span className="rounded-full border border-plum-700 bg-plum-800 px-3.5 py-1.5 text-[11.5px] font-bold text-brand-faint">
            Montserrat ExtraBold
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-plum-700 bg-plum-800 px-3.5 py-1.5 text-[11.5px] font-bold text-brand-faint">
            <span className="h-3 w-3 rounded-full ring-2 ring-plum-600" style={{ background: "#855f82" }} />
            #855F82
          </span>
          <span className="hidden rounded-full border border-plum-700 bg-plum-800 px-3.5 py-1.5 font-display text-[10px] font-medium uppercase tracking-[0.14em] text-plum-500 lg:inline">
            Ctrl+S — сохранить
          </span>
        </div>
      </header>

      {/* ---------- рабочая область ---------- */}
      <main className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[400px_minmax(0,1fr)]">
        <div className="order-1 h-[46vh] shrink-0 lg:order-2 lg:h-auto lg:min-h-0">
          <Preview canvasRef={canvasRef} dims={dims} scale={scale} ready={ready} />
        </div>
        <aside className="order-2 min-h-0 flex-1 border-t border-plum-700 bg-plum-900 text-paper lg:order-1 lg:border-r lg:border-t-0">
          <Controls
            text={text}
            onText={setText}
            textareaRef={textareaRef}
            snakeName={snake?.name ?? "Загрузка…"}
            snakeThumb={snake?.src ?? ""}
            snakeIsDefault={snake?.isDefault ?? true}
            onSnakeFile={handleSnakeFile}
            onSnakeDefault={handleSnakeDefault}
            snakePct={snakePct}
            onSnakePct={setSnakePct}
            noise={noise}
            onNoise={setNoise}
            onSave={handleSave}
            saved={saved}
            dims={dims}
          />
        </aside>
      </main>
    </div>
  );
}
