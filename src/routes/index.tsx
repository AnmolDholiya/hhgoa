import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Download, Share2, Upload, Terminal, X } from "lucide-react";

import { CardCanvas } from "@/components/CardCanvas";
import { fileName, renderFront, type BuilderData } from "@/lib/card-render";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HH GOA 2026 Builder ID Generator | #FrameInGoa" },
      {
        name: "description",
        content:
          "Generate your official Hacker House Goa 2026 builder ID card. Add your photo, class, stack and builder ID, then download a high-res PNG.",
      },
      { property: "og:title", content: "HH GOA 2026 Builder ID Generator" },
      {
        property: "og:description",
        content:
          "Mint your Hacker House Goa 2026 builder ID card — photo, stack, QR and barcode, ready to share with #FrameInGoa.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const CLASSES = [
  "FULL STACK BUILDER",
  "FRONTEND BUILDER",
  "BACKEND BUILDER",
  "AI BUILDER",
  "DESIGN ENGINEER",
  "GROWTH BUILDER",
];

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="hh-label flex items-center justify-between">
        <span>{label}</span>
        {hint ? <span className="text-primary/60">{hint}</span> : null}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function Index() {
  const [data, setData] = useState<BuilderData>({
    fullName: "Your Name",
    builderClass: "FULL STACK BUILDER",
    stack: "REACT • NODE.JS • AI",
    builderId: "#HH-GOA-2026-0001",
    websiteUrl: "https://hhgoa-inky.vercel.app/",
    photo: "/sample-builder.png",
  });
  const [side, setSide] = useState<"front" | "back">("front");
  const [busy, setBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const set = <K extends keyof BuilderData>(key: K, value: BuilderData[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  const shareText = useMemo(
    () =>
      `I just minted my HH GOA 2026 Builder ID — ${data.builderClass} building with ${data.stack}. #FrameInGoa`,
    [data.builderClass, data.stack],
  );

  const onPhoto = (file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setData((d) => ({
        ...d,
        photo: String(reader.result),
        photoZoom: 1.0,
        photoOffsetX: 0,
        photoOffsetY: 0,
      }));
    };
    reader.readAsDataURL(file);
  };

  const download = async () => {
    setBusy(true);
    try {
      const canvas = document.createElement("canvas");
      await renderFront(canvas, data, 3);
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName(data.fullName);
      a.click();
    } finally {
      setBusy(false);
    }
  };

  const share = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText,
    )}&url=${encodeURIComponent(data.websiteUrl || "https://hhgoa-inky.vercel.app/")}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="min-h-screen">
      <header className="border-b border-[var(--gold-line)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div className="flex items-center gap-3">
            <Terminal className="size-5 text-primary" aria-hidden />
            <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">
              HACKER HOUSE GOA
            </span>
          </div>
          <span className="font-mono text-xs tracking-[0.25em] text-primary">
            28–31 OCT 2026
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10">
        <p className="hh-label text-terminal">/// builder_id --generate</p>
        <h1 className="mt-3 text-4xl leading-[1.05] font-bold uppercase text-parchment sm:text-6xl">
          Builder ID <span className="text-primary">Generator</span>
        </h1>
        <p className="mt-4 max-w-xl font-mono text-sm leading-relaxed text-muted-foreground">
          Fill in your details, drop a photo, and export your official HH GOA
          2026 pass. Think → build → ship → repeat.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          {/* FORM */}
          <section className="hh-panel p-6">
            <h2 className="text-lg font-semibold uppercase tracking-wide text-parchment">
              Builder Data
            </h2>
            <div className="hh-rule mt-4 mb-6" />
            <div className="grid gap-5">
              <Field label="Photo" hint="jpg / png">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInput.current?.click()}
                    className="inline-flex items-center gap-2 rounded-md border border-primary/50 bg-primary/10 px-3 py-2 font-mono text-xs tracking-widest text-primary transition-colors hover:bg-primary/20"
                  >
                    <Upload className="size-4" aria-hidden />
                    UPLOAD
                  </button>
                  <button
                    type="button"
                    onClick={() => set("photo", "/sample-builder.png")}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/30 px-3 py-2 font-mono text-xs tracking-widest text-parchment transition-colors hover:bg-secondary"
                  >
                    SAMPLE
                  </button>
                  {data.photo ? (
                    <button
                      type="button"
                      onClick={() => set("photo", null)}
                      className="inline-flex items-center gap-1 font-mono text-xs tracking-widest text-muted-foreground hover:text-destructive"
                    >
                      <X className="size-3.5" aria-hidden /> REMOVE
                    </button>
                  ) : (
                    <span className="font-mono text-xs text-muted-foreground">
                      no file selected
                    </span>
                  )}
                  <input
                    ref={fileInput}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onPhoto(e.target.files?.[0])}
                  />
                </div>

                {data.photo ? (
                  <div className="mt-3 rounded-md border border-border/60 bg-secondary/20 p-3 font-mono text-xs">
                    <div className="flex items-center justify-between text-muted-foreground mb-2">
                      <span className="text-[10px] tracking-wider uppercase font-semibold text-parchment/80">
                        Adjust Photo
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setData((d) => ({
                            ...d,
                            photoZoom: 1.0,
                            photoOffsetX: 0,
                            photoOffsetY: 0,
                          }))
                        }
                        className="text-[10px] text-primary hover:underline uppercase"
                      >
                        Reset
                      </button>
                    </div>

                    {/* Zoom Control */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] text-muted-foreground w-14">ZOOM</span>
                      <button
                        type="button"
                        onClick={() =>
                          set(
                            "photoZoom",
                            Math.max(1.0, Number(((data.photoZoom ?? 1.0) - 0.05).toFixed(2))),
                          )
                        }
                        className="size-6 rounded border border-border bg-secondary flex items-center justify-center text-parchment hover:bg-secondary/80 text-xs font-bold select-none"
                        title="Zoom Out"
                      >
                        −
                      </button>
                      <input
                        type="range"
                        min={1.0}
                        max={2.0}
                        step={0.02}
                        value={data.photoZoom ?? 1.0}
                        onChange={(e) => set("photoZoom", parseFloat(e.target.value))}
                        className="h-1.5 flex-1 accent-primary cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          set(
                            "photoZoom",
                            Math.min(2.0, Number(((data.photoZoom ?? 1.0) + 0.05).toFixed(2))),
                          )
                        }
                        className="size-6 rounded border border-border bg-secondary flex items-center justify-center text-parchment hover:bg-secondary/80 text-xs font-bold select-none"
                        title="Zoom In"
                      >
                        +
                      </button>
                    </div>

                    {/* D-Pad Position Controls */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground w-14">POSITION</span>
                      <div className="grid grid-cols-3 gap-1 w-28">
                        <div />
                        <button
                          type="button"
                          onClick={() =>
                            set(
                              "photoOffsetY",
                              Math.max(-1, Number(((data.photoOffsetY ?? 0) - 0.1).toFixed(2))),
                            )
                          }
                          className="h-6 rounded border border-border bg-secondary flex items-center justify-center text-parchment hover:bg-secondary/80 text-[10px]"
                          title="Move Up"
                        >
                          ↑
                        </button>
                        <div />
                        <button
                          type="button"
                          onClick={() =>
                            set(
                              "photoOffsetX",
                              Math.max(-1, Number(((data.photoOffsetX ?? 0) - 0.1).toFixed(2))),
                            )
                          }
                          className="h-6 rounded border border-border bg-secondary flex items-center justify-center text-parchment hover:bg-secondary/80 text-[10px]"
                          title="Move Left"
                        >
                          ←
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            set("photoOffsetX", 0);
                            set("photoOffsetY", 0);
                          }}
                          className="h-6 rounded border border-border bg-secondary flex items-center justify-center text-primary text-[8px] font-bold"
                          title="Center Position"
                        >
                          CENTER
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            set(
                              "photoOffsetX",
                              Math.min(1, Number(((data.photoOffsetX ?? 0) + 0.1).toFixed(2))),
                            )
                          }
                          className="h-6 rounded border border-border bg-secondary flex items-center justify-center text-parchment hover:bg-secondary/80 text-[10px]"
                          title="Move Right"
                        >
                          →
                        </button>
                        <div />
                        <button
                          type="button"
                          onClick={() =>
                            set(
                              "photoOffsetY",
                              Math.min(1, Number(((data.photoOffsetY ?? 0) + 0.1).toFixed(2))),
                            )
                          }
                          className="h-6 rounded border border-border bg-secondary flex items-center justify-center text-parchment hover:bg-secondary/80 text-[10px]"
                          title="Move Down"
                        >
                          ↓
                        </button>
                        <div />
                      </div>
                    </div>
                  </div>
                ) : null}
              </Field>

              <Field label="Full Name">
                <input
                  className="hh-field focus:hh-field-focus"
                  value={data.fullName}
                  maxLength={28}
                  onChange={(e) => set("fullName", e.target.value)}
                />
              </Field>

              <Field label="Builder Class">
                <input
                  className="hh-field focus:hh-field-focus"
                  list="builder-classes"
                  value={data.builderClass}
                  maxLength={26}
                  onChange={(e) => set("builderClass", e.target.value)}
                />
                <datalist id="builder-classes">
                  {CLASSES.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </Field>

              <Field label="Stack" hint="separate with •">
                <input
                  className="hh-field focus:hh-field-focus"
                  value={data.stack}
                  maxLength={40}
                  onChange={(e) => set("stack", e.target.value)}
                />
              </Field>

              <Field label="Builder ID">
                <input
                  className="hh-field focus:hh-field-focus"
                  value={data.builderId}
                  maxLength={22}
                  onChange={(e) => set("builderId", e.target.value)}
                />
              </Field>

              <Field label="Website URL" hint="fixed QR link">
                <input
                  className="hh-field cursor-not-allowed opacity-80 select-none bg-secondary/20"
                  value="https://hhgoa-inky.vercel.app/"
                  readOnly
                  disabled
                />
              </Field>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={download}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 font-mono text-xs font-semibold tracking-widest text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                <Download className="size-4" aria-hidden />
                {busy ? "RENDERING…" : "DOWNLOAD PNG"}
              </button>
              <button
                type="button"
                onClick={share}
                className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 font-mono text-xs font-semibold tracking-widest text-parchment transition-colors hover:bg-secondary"
              >
                <Share2 className="size-4" aria-hidden />
                SHARE #FRAMEINGOA
              </button>
            </div>
          </section>

          {/* PREVIEW */}
          <section>
            <div className="flex gap-2">
              {(["front", "back"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSide(s)}
                  className={`rounded-md px-4 py-2 font-mono text-xs tracking-[0.2em] uppercase transition-colors ${
                    side === s
                      ? "bg-primary text-primary-foreground"
                      : "border border-border text-muted-foreground hover:text-parchment"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="hh-panel mt-4 p-4">
              <CardCanvas
                side={side}
                data={data}
                className="mx-auto block h-auto w-full max-w-[420px] rounded-md shadow-2xl"
              />
            </div>
            <p className="mt-3 text-center font-mono text-[11px] tracking-widest text-muted-foreground">
              {side === "front"
                ? "FRONT · DYNAMIC LAYERS"
                : "BACK · STATIC ARTWORK"}
            </p>
          </section>
        </div>
      </div>

      <footer className="border-t border-[var(--gold-line)] py-6 text-center font-mono text-[11px] tracking-[0.25em] text-muted-foreground">
        THINK → BUILD → SHIP → REPEAT
      </footer>
    </main>
  );
}
