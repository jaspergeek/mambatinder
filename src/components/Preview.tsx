import type { RefObject } from "react";
import { logoSpiralPath } from "../lib/snake";
import { RulerIcon } from "./icons";

interface Props {
  canvasRef: RefObject<HTMLCanvasElement>;
  dims: { w: number; h: number } | null;
  scale: number | null;
  ready: boolean;
}

export default function Preview({ canvasRef, dims, scale, ready }: Props) {
  return (
    <section className="relative flex h-full min-h-0 flex-col overflow-hidden">
      {/* фоновые слои */}
      <div className="dotgrid pointer-events-none absolute inset-0 opacity-70" />
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-brand/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-brand-soft/20 blur-3xl" />
      <svg
        viewBox="0 0 24 24"
        className="anim-floaty pointer-events-none absolute -right-16 top-1/2 h-[420px] w-[420px] -translate-y-1/2 text-brand opacity-[0.08]"
        fill="none"
        aria-hidden
      >
        <path d={logoSpiralPath()} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>

      {/* тулбар */}
      <div className="relative z-10 flex items-center gap-3 px-6 pb-3 pt-5 lg:px-10">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand" />
        </span>
        <h2 className="font-display text-[11px] font-medium uppercase tracking-[0.2em] text-plum-500">
          Предпросмотр · холст живой
        </h2>
        <div className="ml-auto flex items-center gap-2">
          {dims && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-white/70 px-3 py-1.5 text-[12px] font-bold text-plum-600 shadow-sm backdrop-blur-sm">
              <RulerIcon className="h-3.5 w-3.5 text-brand" />
              <span className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-brand">
                JPG
              </span>
              <span className="tabular-nums">
                {dims.w} × {dims.h} px
              </span>
              {scale && (
                <span className="rounded bg-brand/12 px-1.5 font-display text-[10px] font-medium text-brand">
                  ×{scale.toFixed(1)}
                </span>
              )}
            </span>
          )}
        </div>
      </div>

      {/* полотно */}
      <div className="nice-scroll relative z-10 min-h-0 flex-1 overflow-auto px-6 pb-10 lg:px-10">
        <div className="flex min-h-full items-start justify-center lg:items-center">
          <div
            className={`anim-rise relative max-w-full transition-opacity duration-300 ${
              ready ? "opacity-100" : "opacity-40"
            }`}
            style={{ animationDelay: "180ms" }}
          >
            <div className="absolute -inset-3 rounded-[4px] bg-plum-900/10 blur-md" aria-hidden />
            <canvas
              ref={canvasRef}
              className="relative block h-auto max-w-full rounded-[2px] shadow-[0_24px_70px_-18px_rgba(46,32,48,0.45)] ring-1 ring-plum-900/10"
            />
            <div className="mt-4 flex items-center justify-center gap-2 text-[11.5px] font-semibold text-plum-500">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <path d="M12 5v14M5 12h14" />
              </svg>
              Холст подстраивается под текст автоматически
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
