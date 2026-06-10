"use client";

import { useEffect, useRef } from "react";

// Barra dorada fija arriba que indica el avance de lectura del artículo.
// Actualiza el ancho directamente en el DOM para no re-renderizar en cada scroll.
export default function ReadingProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const progress = total > 0 ? Math.min(window.scrollY / total, 1) : 0;
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${progress})`;
      }
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[3px] pointer-events-none">
      <div
        ref={barRef}
        className="h-full w-full bg-gold origin-left"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
