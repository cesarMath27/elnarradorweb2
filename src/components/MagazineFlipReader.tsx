"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   MagazineFlipReader
   Renders a PDF as a two-page magazine spread with a 3-D page-flip animation.

   Architecture:
   1. pdfjs-dist is imported dynamically (client-only, large bundle).
   2. Pages are rendered to <canvas> → JPEG data-URL and cached in state.
   3. Adjacent pages are pre-rendered while the user reads.
   4. The flip is a pure-CSS rotateY card: front = current page,
      back = incoming page (pre-rotated 180° so it reads correctly).
───────────────────────────────────────────────────────────────────────────── */

type PageCache = Record<number, string>; // pageNum (1-indexed) → data URL

type FlipState = {
  direction: "next" | "prev";
  phase: "animating" | "idle";
};

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Map spread index → [leftPageNum | null, rightPageNum | null]
 *  Spread 0 is the cover (right only), spreads 1+ are two-page. */
function spreadToPages(
  s: number,
  total: number
): [number | null, number | null] {
  if (s === 0) return [null, 1];
  const l = s * 2;
  const r = s * 2 + 1;
  return [l <= total ? l : null, r <= total ? r : null];
}

function totalSpreadsCount(numPages: number) {
  if (numPages === 0) return 0;
  return Math.ceil((numPages - 1) / 2) + 1;
}

// ─── component ───────────────────────────────────────────────────────────────

type Props = { pdfUrl: string; title: string };

export default function MagazineFlipReader({ pdfUrl, title }: Props) {
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState(0);
  const [spread, setSpread] = useState(0);
  const [cache, setCache] = useState<PageCache>({});
  const [loadingPdf, setLoadingPdf] = useState(true);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [flip, setFlip] = useState<FlipState | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const renderingRef = useRef<Set<number>>(new Set());

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Load PDF.js and the document
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        // Use unpkg CDN for the worker (avoids Next.js bundling issues)
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

        const doc = await pdfjsLib.getDocument({
          url: pdfUrl,
          cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
          cMapPacked: true,
        }).promise;

        if (cancelled) { doc.destroy(); return; }
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setLoadingPdf(false);
      } catch (e: any) {
        if (!cancelled) {
          setPdfError(e?.message ?? "No se pudo cargar el PDF.");
          setLoadingPdf(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [pdfUrl]);

  // Render a page to a JPEG data URL
  const renderPage = useCallback(
    async (pageNum: number): Promise<string> => {
      const page = await pdfDoc.getPage(pageNum);
      const scale = isMobile ? 1.2 : 1.8;
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d")!;
      await page.render({ canvasContext: ctx, viewport }).promise;
      return canvas.toDataURL("image/jpeg", 0.88);
    },
    [pdfDoc, isMobile]
  );

  // Pre-render current spread ± 1 spread
  useEffect(() => {
    if (!pdfDoc || numPages === 0) return;
    const total = totalSpreadsCount(numPages);
    const spreadsToLoad = [-1, 0, 1]
      .map((d) => spread + d)
      .filter((s) => s >= 0 && s < total);

    const pagesToLoad = new Set<number>();
    spreadsToLoad.forEach((s) => {
      const [l, r] = spreadToPages(s, numPages);
      if (l) pagesToLoad.add(l);
      if (r) pagesToLoad.add(r);
    });

    pagesToLoad.forEach(async (p) => {
      if (cache[p] || renderingRef.current.has(p)) return;
      renderingRef.current.add(p);
      try {
        const url = await renderPage(p);
        setCache((prev) => ({ ...prev, [p]: url }));
      } catch (e) {
        console.warn(`Error rendering page ${p}`, e);
      } finally {
        renderingRef.current.delete(p);
      }
    });
  }, [pdfDoc, spread, numPages, renderPage]);

  const total = totalSpreadsCount(numPages);
  const canNext = spread < total - 1;
  const canPrev = spread > 0;

  function goNext() {
    if (!canNext || flip) return;
    setFlip({ direction: "next", phase: "animating" });
    setTimeout(() => {
      setSpread((s) => s + 1);
      setFlip(null);
    }, 680);
  }

  function goPrev() {
    if (!canPrev || flip) return;
    setFlip({ direction: "prev", phase: "animating" });
    setTimeout(() => {
      setSpread((s) => s - 1);
      setFlip(null);
    }, 680);
  }

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " ") goNext();
      if (e.key === "ArrowLeft") goPrev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [spread, total, flip]);

  // Pages for current spread
  const [leftPage, rightPage] = spreadToPages(spread, numPages);
  const leftUrl = leftPage ? cache[leftPage] : null;
  const rightUrl = rightPage ? cache[rightPage] : null;

  // Pages for the spread we're animating TOWARD (shown on back face)
  const targetSpread = flip?.direction === "next" ? spread + 1 : spread - 1;
  const [tLeft, tRight] = targetSpread >= 0 && targetSpread < total
    ? spreadToPages(targetSpread, numPages)
    : [null, null];
  const tLeftUrl = tLeft ? cache[tLeft] : null;
  const tRightUrl = tRight ? cache[tRight] : null;

  const isFlippingNext = flip?.direction === "next" && flip.phase === "animating";
  const isFlippingPrev = flip?.direction === "prev" && flip.phase === "animating";

  // ── page number display ───────────────────────────────────────────────────
  let pageLabel = "";
  if (numPages > 0) {
    if (spread === 0) {
      pageLabel = "Portada";
    } else {
      const [l, r] = spreadToPages(spread, numPages);
      if (l && r) pageLabel = `Páginas ${l}–${r} de ${numPages}`;
      else if (l) pageLabel = `Página ${l} de ${numPages}`;
      else if (r) pageLabel = `Página ${r} de ${numPages}`;
    }
  }

  // ── loading / error states ────────────────────────────────────────────────
  if (loadingPdf) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-neutral-900 rounded-xl">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-neutral-400 text-sm">Cargando revista...</p>
      </div>
    );
  }

  if (pdfError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-neutral-900 rounded-xl gap-3">
        <span className="text-4xl">⚠️</span>
        <p className="text-neutral-300 font-medium">No se pudo cargar el PDF</p>
        <p className="text-neutral-500 text-sm">{pdfError}</p>
      </div>
    );
  }

  // ── sizing ────────────────────────────────────────────────────────────────
  const PAGE_H = isMobile ? 480 : 620;
  const PAGE_W = isMobile ? 340 : 440;
  const SPINE_W = isMobile ? 0 : 8;
  const bookW = isMobile ? PAGE_W : PAGE_W * 2 + SPINE_W;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      className="flex flex-col items-center select-none"
      style={{ background: "#111", borderRadius: "16px", padding: "32px 16px 24px" }}
    >
      {/* Title bar */}
      <p className="text-neutral-400 text-xs uppercase tracking-widest mb-6 font-medium">
        {title}
      </p>

      {/* Book container */}
      <div style={{ perspective: "2200px", perspectiveOrigin: "50% 40%" }}>
        <div
          style={{
            position: "relative",
            width: `${bookW}px`,
            height: `${PAGE_H}px`,
            transformStyle: "preserve-3d",
            transform: "rotateX(3deg) rotateY(0deg)",
            filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.8))",
          }}
        >
          {/* ── LEFT PAGE ─────────────────────────────────────────────── */}
          {!isMobile && (
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: `${PAGE_W}px`,
                height: `${PAGE_H}px`,
                background: "#fff",
                overflow: "hidden",
                borderRadius: "4px 0 0 4px",
                zIndex: 1,
              }}
            >
              {leftUrl ? (
                <img
                  src={isFlippingPrev ? (tLeftUrl ?? leftUrl) : leftUrl}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "fill", display: "block" }}
                />
              ) : (
                <PageSkeleton />
              )}
              {/* Left page shadow (inner right edge) */}
              <div
                style={{
                  position: "absolute",
                  right: 0, top: 0, width: "30px", height: "100%",
                  background: "linear-gradient(to left, rgba(0,0,0,0.12), transparent)",
                  pointerEvents: "none",
                }}
              />
            </div>
          )}

          {/* ── SPINE ─────────────────────────────────────────────────── */}
          {!isMobile && (
            <div
              style={{
                position: "absolute",
                left: `${PAGE_W}px`,
                top: 0,
                width: `${SPINE_W}px`,
                height: `${PAGE_H}px`,
                background: "linear-gradient(to right, rgba(0,0,0,0.25) 0%, rgba(255,255,255,0.08) 50%, rgba(0,0,0,0.25) 100%)",
                zIndex: 10,
              }}
            />
          )}

          {/* ── RIGHT PAGE ────────────────────────────────────────────── */}
          <div
            style={{
              position: "absolute",
              left: isMobile ? 0 : `${PAGE_W + SPINE_W}px`,
              top: 0,
              width: `${PAGE_W}px`,
              height: `${PAGE_H}px`,
              background: "#fff",
              overflow: "hidden",
              borderRadius: isMobile ? "4px" : "0 4px 4px 0",
              zIndex: 1,
            }}
          >
            {rightUrl ? (
              <img
                src={isFlippingNext ? (tRightUrl ?? rightUrl) : rightUrl}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "fill", display: "block" }}
              />
            ) : (
              <PageSkeleton />
            )}
            {/* Right page shadow (inner left edge) */}
            {!isMobile && (
              <div
                style={{
                  position: "absolute",
                  left: 0, top: 0, width: "30px", height: "100%",
                  background: "linear-gradient(to right, rgba(0,0,0,0.12), transparent)",
                  pointerEvents: "none",
                }}
              />
            )}
          </div>

          {/* ── FLIPPING PAGE (right→left for next, left→right for prev) ── */}
          {flip && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: isFlippingNext
                  ? isMobile ? 0 : `${PAGE_W + SPINE_W}px`
                  : 0,
                width: `${PAGE_W}px`,
                height: `${PAGE_H}px`,
                transformStyle: "preserve-3d",
                transformOrigin: isFlippingNext ? "left center" : "right center",
                transform: isFlippingNext
                  ? "rotateY(-180deg)"
                  : "rotateY(180deg)",
                transition: "transform 0.68s cubic-bezier(0.645, 0.045, 0.355, 1.000)",
                zIndex: 20,
              }}
            >
              {/* Front face — page we're leaving */}
              <div
                style={{
                  position: "absolute", inset: 0,
                  background: "#fff",
                  backfaceVisibility: "hidden",
                  overflow: "hidden",
                  borderRadius: isFlippingNext
                    ? isMobile ? "4px" : "0 4px 4px 0"
                    : "4px 0 0 4px",
                  boxShadow: isFlippingNext
                    ? "-8px 0 20px rgba(0,0,0,0.35)"
                    : "8px 0 20px rgba(0,0,0,0.35)",
                }}
              >
                {(isFlippingNext ? rightUrl : leftUrl) ? (
                  <img
                    src={(isFlippingNext ? rightUrl : leftUrl)!}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "fill", display: "block" }}
                  />
                ) : (
                  <PageSkeleton />
                )}
              </div>

              {/* Back face — page we're revealing (pre-rotated so it reads correctly) */}
              <div
                style={{
                  position: "absolute", inset: 0,
                  background: "#fff",
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  overflow: "hidden",
                  borderRadius: isFlippingNext
                    ? "4px 0 0 4px"
                    : isMobile ? "4px" : "0 4px 4px 0",
                  boxShadow: isFlippingNext
                    ? "8px 0 20px rgba(0,0,0,0.25)"
                    : "-8px 0 20px rgba(0,0,0,0.25)",
                }}
              >
                {(isFlippingNext ? tLeftUrl : tRightUrl) ? (
                  <img
                    src={(isFlippingNext ? tLeftUrl : tRightUrl)!}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "fill", display: "block" }}
                  />
                ) : (
                  <PageSkeleton />
                )}
              </div>
            </div>
          )}

          {/* ── CLICK ZONES ───────────────────────────────────────────── */}
          {canPrev && (
            <div
              onClick={goPrev}
              style={{
                position: "absolute", left: 0, top: 0,
                width: "25%", height: "100%",
                cursor: "w-resize", zIndex: 30,
              }}
            />
          )}
          {canNext && (
            <div
              onClick={goNext}
              style={{
                position: "absolute", right: 0, top: 0,
                width: "25%", height: "100%",
                cursor: "e-resize", zIndex: 30,
              }}
            />
          )}
        </div>
      </div>

      {/* ── CONTROLS ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-6 mt-7">
        <button
          onClick={goPrev}
          disabled={!canPrev || !!flip}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: canPrev && !flip ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)",
            color: "#e5e5e5",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          ← Anterior
        </button>

        <div className="text-center min-w-[140px]">
          <p className="text-neutral-300 text-sm font-medium">{pageLabel}</p>
          {/* Spread dots */}
          {total <= 20 && (
            <div className="flex justify-center gap-1 mt-2 flex-wrap">
              {Array.from({ length: total }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => !flip && setSpread(i)}
                  style={{
                    width: i === spread ? "20px" : "6px",
                    height: "6px",
                    borderRadius: "3px",
                    background: i === spread ? "#f59e0b" : "rgba(255,255,255,0.25)",
                    transition: "all 0.3s",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                />
              ))}
            </div>
          )}
          {total > 20 && (
            <p className="text-neutral-500 text-xs mt-1">
              Hoja {spread + 1} de {total}
            </p>
          )}
        </div>

        <button
          onClick={goNext}
          disabled={!canNext || !!flip}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: canNext && !flip ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)",
            color: "#e5e5e5",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          Siguiente →
        </button>
      </div>

      <p className="text-neutral-600 text-xs mt-3">
        Usa ← → del teclado · Clic en los bordes para pasar la hoja
      </p>
    </div>
  );
}

/* ── skeleton placeholder ──────────────────────────────────────────────── */
function PageSkeleton() {
  return (
    <div
      style={{
        width: "100%", height: "100%",
        background: "linear-gradient(110deg, #f0f0f0 30%, #e0e0e0 50%, #f0f0f0 70%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.4s infinite linear",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
      <div style={{ textAlign: "center", color: "#aaa" }}>
        <div style={{ fontSize: "2rem", marginBottom: "8px" }}>📄</div>
        <p style={{ fontSize: "12px" }}>Cargando...</p>
      </div>
    </div>
  );
}
