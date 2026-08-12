import { useEffect, useRef } from "react";

import {
  renderBack,
  renderFront,
  type BuilderData,
} from "@/lib/card-render";

type Props = {
  side: "front" | "back";
  data: BuilderData;
  className?: string;
};

export function CardCanvas({ side, data, className }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    const draw = async () => {
      const canvas = ref.current;
      if (!canvas) return;
      try {
        await document.fonts.ready;
      } catch {
        /* fonts API unavailable */
      }
      if (cancelled) return;
      if (side === "front") await renderFront(canvas, data, 1.5);
      else await renderBack(canvas, 1.5);
    };
    void draw();
    return () => {
      cancelled = true;
    };
  }, [side, data]);

  return (
    <canvas
      ref={ref}
      className={className}
      aria-label={
        side === "front"
          ? `HH Goa 2026 builder ID front for ${data.fullName || "builder"}`
          : "HH Goa 2026 builder ID back"
      }
    />
  );
}
