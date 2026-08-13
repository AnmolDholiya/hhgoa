import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import {
  Download,
  Share2,
  Upload,
  Terminal,
  X,
  Check,
  Copy,
  ExternalLink,
  Layers,
  Image as ImageIcon,
} from "lucide-react";

import { CardCanvas } from "@/components/CardCanvas";
import {
  fileName,
  renderFront,
  renderBack,
  renderCombined,
  type BuilderData,
} from "@/lib/card-render";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas toBlob failed"));
    }, "image/png");
  });
}

function triggerDownload(url: string, name: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

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
    photo: null,
  });
  const [side, setSide] = useState<"front" | "back">("front");
  const [busy, setBusy] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [downloadDropdown, setDownloadDropdown] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<{
    front?: string;
    back?: string;
    combined?: string;
  }>({});
  const [activeModalTab, setActiveModalTab] = useState<"combined" | "front" | "back">("combined");

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

  const downloadFront = async () => {
    const canvas = document.createElement("canvas");
    await renderFront(canvas, data, 3);
    const blob = await canvasToBlob(canvas);
    const url = URL.createObjectURL(blob);
    triggerDownload(url, fileName(data.fullName, "FRONT"));
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  const downloadBack = async () => {
    const canvas = document.createElement("canvas");
    await renderBack(canvas, 3);
    const blob = await canvasToBlob(canvas);
    const url = URL.createObjectURL(blob);
    triggerDownload(url, fileName(data.fullName, "BACK"));
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  const downloadCombined = async () => {
    const canvas = document.createElement("canvas");
    await renderCombined(canvas, data, 2);
    const blob = await canvasToBlob(canvas);
    const url = URL.createObjectURL(blob);
    triggerDownload(url, fileName(data.fullName, "PASS"));
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  const downloadAll = async () => {
    setBusy(true);
    try {
      await downloadFront();
      await new Promise((r) => setTimeout(r, 400));
      await downloadBack();
      await new Promise((r) => setTimeout(r, 400));
      await downloadCombined();
    } finally {
      setBusy(false);
      setDownloadDropdown(false);
    }
  };

  const share = async () => {
    setBusy(true);
    try {
      // 1. Render Front Card
      const frontCanvas = document.createElement("canvas");
      await renderFront(frontCanvas, data, 3);
      const frontBlob = await canvasToBlob(frontCanvas);
      const frontUrl = URL.createObjectURL(frontBlob);
      const frontFile = new File([frontBlob], fileName(data.fullName, "FRONT"), {
        type: "image/png",
      });

      // 2. Render Back Card
      const backCanvas = document.createElement("canvas");
      await renderBack(backCanvas, 3);
      const backBlob = await canvasToBlob(backCanvas);
      const backUrl = URL.createObjectURL(backBlob);
      const backFile = new File([backBlob], fileName(data.fullName, "BACK"), {
        type: "image/png",
      });

      // 3. Render Combined Pass
      const combinedCanvas = document.createElement("canvas");
      await renderCombined(combinedCanvas, data, 2);
      const combinedBlob = await canvasToBlob(combinedCanvas);
      const combinedUrl = URL.createObjectURL(combinedBlob);
      const combinedFile = new File([combinedBlob], fileName(data.fullName, "PASS"), {
        type: "image/png",
      });

      setPreviewUrls({
        front: frontUrl,
        back: backUrl,
        combined: combinedUrl,
      });

      // 4. Try Web Share API (native share sheet supporting files)
      if (typeof navigator !== "undefined" && navigator.canShare) {
        const shareData = {
          title: "HH GOA 2026 Builder ID",
          text: `${shareText}\n${data.websiteUrl}`,
          files: [frontFile, backFile],
        };

        if (navigator.canShare(shareData)) {
          try {
            await navigator.share(shareData);
            setBusy(false);
            return;
          } catch (e) {
            if ((e as Error).name === "AbortError") {
              setBusy(false);
              return;
            }
          }
        }
      }

      // 5. Fallback for Web browsers: Copy combined image to clipboard if supported
      let copied = false;
      if (typeof navigator !== "undefined" && navigator.clipboard && window.ClipboardItem) {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": combinedBlob }),
          ]);
          copied = true;
        } catch (err) {
          console.warn("Clipboard copy image failed:", err);
        }
      }
      setCopiedImage(copied);

      // Download front and back card images
      triggerDownload(frontUrl, fileName(data.fullName, "FRONT"));
      setTimeout(() => {
        triggerDownload(backUrl, fileName(data.fullName, "BACK"));
      }, 400);

      // Open X tweet intent page
      const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        shareText,
      )}&url=${encodeURIComponent(data.websiteUrl || "https://hhgoa-inky.vercel.app/")}`;
      window.open(tweetUrl, "_blank", "noopener,noreferrer");

      // Open share dialog modal for user options
      setShareModalOpen(true);
    } catch (err) {
      console.error("Share failed:", err);
    } finally {
      setBusy(false);
    }
  };

  const copyImageToClipboard = async () => {
    if (!previewUrls.combined) return;
    try {
      const res = await fetch(previewUrls.combined);
      const blob = await res.blob();
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 3000);
      }
    } catch (err) {
      console.error("Failed to copy image:", err);
    }
  };

  const openXIntent = () => {
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText,
    )}&url=${encodeURIComponent(data.websiteUrl || "https://hhgoa-inky.vercel.app/")}`;
    window.open(tweetUrl, "_blank", "noopener,noreferrer");
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
                    onClick={() =>
                      setData((d) => ({
                        ...d,
                        photo: "/sample-builder.png",
                        photoZoom: 1,
                        photoOffsetX: 0,
                        photoOffsetY: 0,
                      }))
                    }
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/30 px-3 py-2 font-mono text-xs tracking-widest text-parchment transition-colors hover:bg-secondary"
                  >
                    SAMPLE
                  </button>
                  {data.photo ? (
                    <button
                      type="button"
                      onClick={() =>
                        setData((d) => ({
                          ...d,
                          photo: null,
                          photoZoom: 1,
                          photoOffsetX: 0,
                          photoOffsetY: 0,
                        }))
                      }
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

            <div className="mt-7 relative flex flex-wrap gap-3">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDownloadDropdown((v) => !v)}
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 font-mono text-xs font-semibold tracking-widest text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  <Download className="size-4" aria-hidden />
                  {busy ? "RENDERING…" : "DOWNLOAD PASS ▾"}
                </button>

                {downloadDropdown ? (
                  <div className="absolute left-0 top-full z-20 mt-1 w-56 rounded-md border border-border bg-background p-1.5 shadow-xl font-mono text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setDownloadDropdown(false);
                        downloadFront();
                      }}
                      className="w-full text-left px-3 py-2 rounded hover:bg-secondary text-parchment flex items-center justify-between"
                    >
                      <span>Front Side Only</span>
                      <ImageIcon className="size-3.5 text-primary" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDownloadDropdown(false);
                        downloadBack();
                      }}
                      className="w-full text-left px-3 py-2 rounded hover:bg-secondary text-parchment flex items-center justify-between"
                    >
                      <span>Back Side Only</span>
                      <ImageIcon className="size-3.5 text-primary" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDownloadDropdown(false);
                        downloadCombined();
                      }}
                      className="w-full text-left px-3 py-2 rounded hover:bg-secondary text-parchment flex items-center justify-between"
                    >
                      <span>Combined Pass</span>
                      <Layers className="size-3.5 text-primary" />
                    </button>
                    <div className="my-1 border-t border-border/60" />
                    <button
                      type="button"
                      onClick={downloadAll}
                      className="w-full text-left px-3 py-2 rounded hover:bg-primary/20 text-primary font-bold flex items-center justify-between"
                    >
                      <span>Download All 3 PNGs</span>
                      <Download className="size-3.5" />
                    </button>
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                onClick={share}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 font-mono text-xs font-semibold tracking-widest text-parchment transition-colors hover:bg-secondary disabled:opacity-60"
              >
                <Share2 className="size-4 text-primary" aria-hidden />
                {busy ? "PREPARING SHARE…" : "SHARE ON X (FRONT & BACK)"}
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

      {/* SHARE MODAL DIALOG */}
      <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
        <DialogContent className="max-w-2xl border-[var(--gold-line)] bg-[#120a05] text-parchment font-mono">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold uppercase tracking-wider text-parchment flex items-center gap-2">
              <Share2 className="size-5 text-primary" />
              Share Builder ID Pass on X
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Front & Back side card images generated! Attach or paste them in your X post.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 space-y-4">
            {/* ALERT NOTIFICATION */}
            <div className="rounded-md border border-primary/40 bg-primary/10 p-3 text-xs text-parchment/90 flex items-start gap-2.5">
              <Check className="size-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-primary">Front & Back Card PNGs Ready!</p>
                <p className="mt-0.5 text-muted-foreground">
                  {copiedImage
                    ? "Combined pass image has been copied to your clipboard (Ctrl+V) and downloaded automatically."
                    : "Front and Back side card images have been downloaded automatically to your browser."}
                </p>
              </div>
            </div>

            {/* PREVIEW TABS */}
            <div className="flex gap-2 border-b border-border pb-2">
              <button
                type="button"
                onClick={() => setActiveModalTab("combined")}
                className={`px-3 py-1.5 text-xs rounded transition-colors ${
                  activeModalTab === "combined"
                    ? "bg-primary text-primary-foreground font-bold"
                    : "bg-secondary/40 text-muted-foreground hover:text-parchment"
                }`}
              >
                Combined Pass
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab("front")}
                className={`px-3 py-1.5 text-xs rounded transition-colors ${
                  activeModalTab === "front"
                    ? "bg-primary text-primary-foreground font-bold"
                    : "bg-secondary/40 text-muted-foreground hover:text-parchment"
                }`}
              >
                Front Side
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab("back")}
                className={`px-3 py-1.5 text-xs rounded transition-colors ${
                  activeModalTab === "back"
                    ? "bg-primary text-primary-foreground font-bold"
                    : "bg-secondary/40 text-muted-foreground hover:text-parchment"
                }`}
              >
                Back Side
              </button>
            </div>

            {/* PREVIEW CONTAINER */}
            <div className="rounded-lg border border-border bg-black/40 p-3 flex justify-center items-center min-h-[220px]">
              {activeModalTab === "combined" && previewUrls.combined ? (
                <img
                  src={previewUrls.combined}
                  alt="Combined Pass"
                  className="max-h-[280px] w-auto object-contain rounded shadow"
                />
              ) : null}
              {activeModalTab === "front" && previewUrls.front ? (
                <img
                  src={previewUrls.front}
                  alt="Front Side Card"
                  className="max-h-[280px] w-auto object-contain rounded shadow"
                />
              ) : null}
              {activeModalTab === "back" && previewUrls.back ? (
                <img
                  src={previewUrls.back}
                  alt="Back Side Card"
                  className="max-h-[280px] w-auto object-contain rounded shadow"
                />
              ) : null}
            </div>

            {/* QUICK ACTIONS */}
            <div className="grid gap-2 sm:grid-cols-2 pt-2">
              <button
                type="button"
                onClick={openXIntent}
                className="flex items-center justify-center gap-2 rounded bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                <ExternalLink className="size-4" />
                OPEN POST ON X
              </button>

              <button
                type="button"
                onClick={copyImageToClipboard}
                className="flex items-center justify-center gap-2 rounded border border-border bg-secondary/40 px-4 py-2.5 text-xs font-semibold text-parchment hover:bg-secondary transition-colors"
              >
                {copiedImage ? (
                  <>
                    <Check className="size-4 text-primary" /> COPIED TO CLIPBOARD
                  </>
                ) : (
                  <>
                    <Copy className="size-4" /> COPY PASS IMAGE
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1 border-t border-border/50 text-[11px] justify-between text-muted-foreground">
              <span>Downloads:</span>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={downloadFront}
                  className="hover:text-primary underline"
                >
                  Front PNG
                </button>
                <button
                  type="button"
                  onClick={downloadBack}
                  className="hover:text-primary underline"
                >
                  Back PNG
                </button>
                <button
                  type="button"
                  onClick={downloadCombined}
                  className="hover:text-primary underline font-bold"
                >
                  Combined Pass PNG
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <footer className="border-t border-[var(--gold-line)] py-6 text-center font-mono text-[11px] tracking-[0.25em] text-muted-foreground">
        THINK → BUILD → SHIP → REPEAT
      </footer>
    </main>
  );
}
