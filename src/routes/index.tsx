import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState, useEffect } from "react";
import {
  Download,
  Share2,
  Upload,
  Terminal,
  X,
  Check,
  Copy,
  ExternalLink,
  Sliders,
  Camera,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Plus,
  AlertTriangle,
  ChevronDown,
  Layers,
  Image as ImageIcon,
  Shield,
  Edit3,
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
          "Generate your official Hacker House Goa 2026 builder ID card. Add your photo, tell us what you build, and get your pass ready to share.",
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

const BUILDER_CLASSES = [
  "FULL STACK BUILDER",
  "AI BUILDER",
  "FRONTEND BUILDER",
  "BACKEND BUILDER",
  "PRODUCT BUILDER",
  "DESIGNER",
  "FOUNDER",
  "HACKER",
  "CREATIVE BUILDER",
  "OTHER",
];

const POPULAR_STACK_SUGGESTIONS = [
  "TypeScript",
  "AI / LLMs",
  "Python",
  "Solana",
  "Next.js",
  "Tailwind CSS",
  "Rust",
  "PostgreSQL",
  "Web3",
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

export function Index() {
  const [view, setView] = useState<"overview" | "builder">("overview");
  const [data, setData] = useState<BuilderData>({
    fullName: "KRISH BHINGRADAIYA",
    builderClass: "FULL STACK BUILDER",
    stack: "React • Node.js • AI • Supabase",
    builderId: "#HH-GOA-2026-0042",
    websiteUrl: "https://hhgoa.com/",
    photo: null,
    photoZoom: 1.0,
    photoOffsetX: 0,
    photoOffsetY: 0,
  });

  const [side, setSide] = useState<"front" | "back">("front");
  const [busy, setBusy] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [downloadDropdown, setDownloadDropdown] = useState(false);
  const [showCustomStackInput, setShowCustomStackInput] = useState(false);
  const [customStackValue, setCustomStackValue] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const [previewUrls, setPreviewUrls] = useState<{
    front?: string;
    back?: string;
    combined?: string;
  }>({});
  const [activeModalTab, setActiveModalTab] = useState<"combined" | "front" | "back">("combined");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const builderSectionRef = useRef<HTMLDivElement>(null);

  // Helper to parse stack items into array
  const stackItems = useMemo(() => {
    if (!data.stack) return [];
    return data.stack
      .split("•")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [data.stack]);

  const set = <K extends keyof BuilderData>(key: K, value: BuilderData[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  const shareText = useMemo(
    () =>
      `⚡ Just minted my official Hacker House Goa 2026 Builder ID!\n\n🚀 ${data.builderClass}\n🛠️ Stack: ${data.stack}\n\nFramed for Goa. See you at HH Goa 2026! 🌴🔥\n\n#FrameInGoa #HHGoa2026`,
    [data.builderClass, data.stack],
  );

  const handlePhotoUpload = (file?: File | null) => {
    if (!file) return;

    // Check for HEIC / HEIF format
    const name = file.name.toLowerCase();
    const isHeic = name.endsWith(".heic") || name.endsWith(".heif");

    if (isHeic) {
      import("heic2any")
        .then(({ default: heic2any }) => {
          heic2any({ blob: file, toType: "image/jpeg", quality: 0.85 })
            .then((result) => {
              const resBlob = Array.isArray(result) ? result[0] : result;
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
              if (resBlob) reader.readAsDataURL(resBlob);
            })
            .catch((err) => {
              console.error("HEIC conversion error:", err);
            });
        })
        .catch(() => {
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
        });
      return;
    }

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

  const toggleStackItem = (item: string) => {
    let current = stackItems;
    if (current.includes(item)) {
      current = current.filter((i) => i !== item);
    } else {
      if (current.length >= 5) return;
      current = [...current, item];
    }
    set("stack", current.join(" • "));
  };

  const removeStackItem = (item: string) => {
    const updated = stackItems.filter((i) => i !== item);
    set("stack", updated.join(" • "));
  };

  const addCustomStackItem = () => {
    if (!customStackValue.trim()) return;
    const val = customStackValue.trim();
    if (stackItems.length < 5 && !stackItems.includes(val)) {
      const updated = [...stackItems, val];
      set("stack", updated.join(" • "));
    }
    setCustomStackValue("");
    setShowCustomStackInput(false);
  };

  const downloadFront = async () => {
    setBusy(true);
    try {
      const canvas = document.createElement("canvas");
      await renderFront(canvas, data, 3);
      const blob = await canvasToBlob(canvas);
      const url = URL.createObjectURL(blob);
      triggerDownload(url, fileName(data.fullName, "FRONT"));
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } finally {
      setBusy(false);
      setDownloadDropdown(false);
    }
  };

  const downloadBack = async () => {
    setBusy(true);
    try {
      const canvas = document.createElement("canvas");
      await renderBack(canvas, 3);
      const blob = await canvasToBlob(canvas);
      const url = URL.createObjectURL(blob);
      triggerDownload(url, fileName(data.fullName, "BACK"));
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } finally {
      setBusy(false);
      setDownloadDropdown(false);
    }
  };

  const downloadCombined = async () => {
    setBusy(true);
    try {
      const canvas = document.createElement("canvas");
      await renderCombined(canvas, data, 2);
      const blob = await canvasToBlob(canvas);
      const url = URL.createObjectURL(blob);
      triggerDownload(url, fileName(data.fullName, "PASS"));
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } finally {
      setBusy(false);
      setDownloadDropdown(false);
    }
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
      const frontCanvas = document.createElement("canvas");
      await renderFront(frontCanvas, data, 3);
      const frontBlob = await canvasToBlob(frontCanvas);
      const frontUrl = URL.createObjectURL(frontBlob);

      const backCanvas = document.createElement("canvas");
      await renderBack(backCanvas, 3);
      const backBlob = await canvasToBlob(backCanvas);
      const backUrl = URL.createObjectURL(backBlob);

      const combinedCanvas = document.createElement("canvas");
      await renderCombined(combinedCanvas, data, 2);
      const combinedBlob = await canvasToBlob(combinedCanvas);
      const combinedUrl = URL.createObjectURL(combinedBlob);

      setPreviewUrls({
        front: frontUrl,
        back: backUrl,
        combined: combinedUrl,
      });

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

      triggerDownload(frontUrl, fileName(data.fullName, "FRONT"));
      setTimeout(() => {
        triggerDownload(backUrl, fileName(data.fullName, "BACK"));
      }, 400);

      // Directly open X intent
      openXIntent();

      setShareModalOpen(true);
    } catch (err) {
      console.error("Share to X failed:", err);
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

  const copyBuilderIdToClipboard = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(data.builderId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 3000);
    }
  };

  const openXIntent = () => {
    const shareUrl = "https://hhgoa-inky.vercel.app/";
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      `${shareText}\n${shareUrl}`,
    )}`;
    window.open(tweetUrl, "_blank", "noopener,noreferrer");
  };

  const scrollToBuilder = () => {
    setView("builder");
    setTimeout(() => {
      builderSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const isValidToGenerate = Boolean(data.photo && data.fullName.trim().length >= 2);

  return (
    <div className="min-h-screen bg-[#08090B] text-[#F4F1EA] flex flex-col font-sans selection:bg-[#FF4500] selection:text-black">
      {/* 4. HEADER */}
      <header className="sticky top-0 z-40 h-[76px] bg-[#08090B]/95 backdrop-blur-md border-b border-[#242832]">
        <div className="mx-auto max-w-[1400px] h-full px-4 sm:px-8 flex items-center justify-between">
          {/* LEFT BRANDING */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-[#242832] bg-[#111318] flex items-center justify-center rounded-[2px]">
              <span className="font-mono text-sm font-bold text-[#FF4500]">{">_"}</span>
            </div>

            <div className="flex flex-col">
              <span className="font-display text-base font-bold tracking-tight text-[#F4F1EA] leading-none">
                HH GOA 2026
              </span>
              <span className="font-mono text-[10px] tracking-widest text-[#9AA3B2] mt-0.5">
                GOA, INDIA
              </span>
            </div>

            <div className="hidden sm:inline-flex hh-badge-orange ml-2">
              #FRAMEINGOA
            </div>
          </div>

          {/* CENTER / RIGHT NAV */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden md:inline-flex hh-badge-gray">
              28 — 31 OCT 2026
            </div>

            <button
              type="button"
              onClick={() => setView("overview")}
              className={`font-mono text-xs tracking-wider uppercase transition-colors ${
                view === "overview"
                  ? "text-[#FF4500] font-bold"
                  : "text-[#9AA3B2] hover:text-[#F4F1EA]"
              }`}
            >
              OVERVIEW
            </button>

            <button
              type="button"
              onClick={scrollToBuilder}
              className="hh-button-primary py-2.5 px-4 sm:px-6 text-xs"
            >
              CREATE ID
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1">
        {/* HOMEPAGE HERO SECTION */}
        {view === "overview" ? (
          <div className="mx-auto max-w-[1400px] px-4 sm:px-8 pt-10 sm:pt-16 pb-16">
            {/* TOP METADATA ROW */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#9AA3B2] mb-6">
              <span className="text-[#FF4500] font-bold">HH GOA 2026</span>
              <span>/</span>
              <span>GOA, INDIA · 28 — 31 OCT 2026</span>
              <span>/</span>
              <span className="hh-badge-orange">#FRAMEINGOA</span>
            </div>

            {/* LARGE EDITORIAL HEADLINE */}
            <h1 className="font-display font-bold text-5xl sm:text-7xl lg:text-8xl tracking-tight leading-[0.95] text-[#F4F1EA] uppercase max-w-4xl">
              BUILD YOUR
              <br />
              IDENTITY.
            </h1>

            {/* HERO SUBHEADLINE */}
            <h2 className="font-display font-medium text-xl sm:text-3xl text-[#9AA3B2] tracking-wide mt-4 uppercase">
              YOUR BUILDER ID, FRAMED FOR GOA.
            </h2>

            {/* HERO DESCRIPTION */}
            <p className="font-sans text-base sm:text-lg text-[#9AA3B2] leading-relaxed max-w-[700px] mt-6">
              Create your HH Goa 2026 Builder ID. Add your photo, tell us what you build,
              and get your personalized event card ready to share.
            </p>

            {/* PRIMARY & SECONDARY CTA */}
            <div className="flex flex-wrap items-center gap-6 mt-10">
              <button
                type="button"
                onClick={scrollToBuilder}
                className="hh-button-primary text-sm py-4 px-8"
              >
                CREATE YOUR BUILDER ID →
              </button>

              <a
                href="https://hhgoa.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs tracking-wider uppercase text-[#9AA3B2] hover:text-[#FF4500] flex items-center gap-1.5 transition-colors"
              >
                WHAT IS HH GOA? <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* HORIZONTAL DIVIDER */}
            <div className="w-full h-px bg-[#242832] my-16" />

            {/* THREE FEATURE BLOCKS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* BLOCK 1 */}
              <div className="hh-card hh-card-corner p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 font-mono text-xs text-[#FF4500] font-bold tracking-wider">
                    <Camera className="w-4 h-4" />
                    <span>01 — ADD YOUR PHOTO</span>
                  </div>
                  <h3 className="font-display font-bold text-xl sm:text-2xl text-[#F4F1EA] mt-4">
                    Upload & Fit
                  </h3>
                  <p className="font-sans text-sm text-[#9AA3B2] mt-2 leading-relaxed">
                    Bring your builder identity to life with your personal photo.
                  </p>
                </div>
              </div>

              {/* BLOCK 2 */}
              <div className="hh-card hh-card-corner p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 font-mono text-xs text-[#FFB800] font-bold tracking-wider">
                    <Sliders className="w-4 h-4" />
                    <span>02 — MAKE IT YOURS</span>
                  </div>
                  <h3 className="font-display font-bold text-xl sm:text-2xl text-[#F4F1EA] mt-4">
                    Personalize Details
                  </h3>
                  <p className="font-sans text-sm text-[#9AA3B2] mt-2 leading-relaxed">
                    Add your name, builder role, and core tech stack.
                  </p>
                </div>
              </div>

              {/* BLOCK 3 */}
              <div className="hh-card hh-card-corner p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 font-mono text-xs text-[#00E599] font-bold tracking-wider">
                    <Share2 className="w-4 h-4" />
                    <span>03 — SHARE IT</span>
                  </div>
                  <h3 className="font-display font-bold text-xl sm:text-2xl text-[#F4F1EA] mt-4">
                    Export & Post
                  </h3>
                  <p className="font-sans text-sm text-[#9AA3B2] mt-2 leading-relaxed">
                    Download your card and feature on the #FrameInGoa radar.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* BUILDER WORKSPACE SECTION */}
        {view === "builder" ? (
          <div
            ref={builderSectionRef}
            className="mx-auto max-w-[1400px] px-4 sm:px-8 py-10 sm:py-14"
          >
            {/* WORKSPACE HEADER */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <button
                    type="button"
                    onClick={() => setView("overview")}
                    className="hh-badge-gray hover:border-[#FF4500] hover:text-[#F4F1EA] transition-colors cursor-pointer"
                  >
                    ← OVERVIEW
                  </button>
                  <span className="hh-badge-orange">#FRAMEINGOA</span>
                </div>
                <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#F4F1EA] uppercase tracking-tight">
                  CREATE YOUR BUILDER ID
                </h2>
                <p className="font-sans text-sm text-[#9AA3B2] mt-1">
                  Tell us who you are and what you build.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end font-mono text-xs text-[#9AA3B2]">
                <span className="font-bold text-[#F4F1EA]">HH GOA 2026</span>
                <span>GOA, INDIA · 28 — 31 OCT 2026</span>
              </div>
            </div>

            {/* TWO COLUMN WORKSPACE GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT COLUMN: FORM PANEL (7 COLS) */}
              <div className="lg:col-span-7 hh-card p-6 sm:p-8 space-y-7">
                {/* FORM HEADER */}
                <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#FF4500] tracking-wider uppercase border-b border-[#242832] pb-4">
                  <Sliders className="w-4 h-4" />
                  <span>BUILDER DETAILS</span>
                </div>

                {/* 1. PHOTO UPLOAD SECTION */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <label className="text-[#F4F1EA] font-semibold tracking-wider">
                      YOUR PHOTO <span className="text-[#FF4500]">*</span>
                    </label>
                    <span className="text-[#667085]">JPG · PNG · HEIC</span>
                  </div>

                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      if (e.dataTransfer.files?.[0]) {
                        handlePhotoUpload(e.dataTransfer.files[0]);
                      }
                    }}
                    className={`border-2 border-dashed rounded-[2px] p-6 text-center transition-all bg-[#0D0E12] ${
                      dragOver
                        ? "border-[#FF4500] bg-[#FF4500]/5"
                        : "border-[#242832] hover:border-[#2A2F3A]"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.heic,.heif"
                      className="hidden"
                      onChange={(e) => handlePhotoUpload(e.target.files?.[0])}
                    />

                    {data.photo ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center gap-4">
                          <img
                            src={data.photo}
                            alt="Uploaded builder photo"
                            className="w-20 h-20 object-cover rounded-[2px] border border-[#2A2F3A]"
                          />
                          <div className="text-left font-mono text-xs space-y-1">
                            <p className="text-[#00E599] font-bold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> PHOTO ATTACHED
                            </p>
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="text-[#FF4500] hover:underline"
                              >
                                CHANGE
                              </button>
                              <span className="text-[#667085]">·</span>
                              <button
                                type="button"
                                onClick={() => set("photo", null)}
                                className="text-[#9AA3B2] hover:text-[#FF3333]"
                              >
                                REMOVE
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* PHOTO ADJUSTMENT CONTROLS */}
                        <div className="border-t border-[#242832] pt-4 mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs text-left">
                          {/* ZOOM */}
                          <div>
                            <div className="flex items-center justify-between text-[#9AA3B2] mb-1.5">
                              <span>ZOOM CONTROL</span>
                              <span>{Math.round((data.photoZoom ?? 1) * 100)}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min={1.0}
                                max={2.0}
                                step={0.05}
                                value={data.photoZoom ?? 1.0}
                                onChange={(e) => set("photoZoom", parseFloat(e.target.value))}
                                className="w-full accent-[#FF4500] bg-[#111318] h-1.5 rounded cursor-pointer"
                              />
                            </div>
                          </div>

                          {/* POSITION D-PAD */}
                          <div>
                            <div className="flex items-center justify-between text-[#9AA3B2] mb-1.5">
                              <span>POSITION SHIFT</span>
                              <button
                                type="button"
                                onClick={() => {
                                  set("photoZoom", 1.0);
                                  set("photoOffsetX", 0);
                                  set("photoOffsetY", 0);
                                }}
                                className="text-[#FF4500] hover:underline text-[10px]"
                              >
                                RESET
                              </button>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  set(
                                    "photoOffsetX",
                                    Math.max(-1, Number(((data.photoOffsetX ?? 0) - 0.1).toFixed(2))),
                                  )
                                }
                                className="px-2 py-1 bg-[#111318] border border-[#242832] text-[#F4F1EA] hover:border-[#FF4500]"
                              >
                                ←
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  set(
                                    "photoOffsetX",
                                    Math.min(1, Number(((data.photoOffsetX ?? 0) + 0.1).toFixed(2))),
                                  )
                                }
                                className="px-2 py-1 bg-[#111318] border border-[#242832] text-[#F4F1EA] hover:border-[#FF4500]"
                              >
                                →
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  set(
                                    "photoOffsetY",
                                    Math.max(-1, Number(((data.photoOffsetY ?? 0) - 0.1).toFixed(2))),
                                  )
                                }
                                className="px-2 py-1 bg-[#111318] border border-[#242832] text-[#F4F1EA] hover:border-[#FF4500]"
                              >
                                ↑
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  set(
                                    "photoOffsetY",
                                    Math.min(1, Number(((data.photoOffsetY ?? 0) + 0.1).toFixed(2))),
                                  )
                                }
                                className="px-2 py-1 bg-[#111318] border border-[#242832] text-[#F4F1EA] hover:border-[#FF4500]"
                              >
                                ↓
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="cursor-pointer space-y-3 py-2"
                      >
                        <div className="w-10 h-10 border border-[#242832] bg-[#111318] mx-auto flex items-center justify-center text-[#FF4500]">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div className="font-mono text-xs">
                          <p className="font-bold text-[#F4F1EA]">ADD YOUR PHOTO</p>
                          <p className="text-[#9AA3B2] mt-1">
                            Drag & drop your photo here or{" "}
                            <span className="text-[#FF4500] underline">choose photo</span>
                          </p>
                        </div>
                        <p className="font-mono text-[10px] text-[#667085]">
                          SUPPORTED FORMATS: JPG, PNG, HEIC (MAX 15MB)
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. NAME INPUT */}
                <div className="space-y-2">
                  <label className="block font-mono text-xs text-[#F4F1EA] font-semibold tracking-wider">
                    YOUR NAME <span className="text-[#FF4500]">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={28}
                    value={data.fullName}
                    onChange={(e) => set("fullName", e.target.value)}
                    placeholder="ENTER YOUR NAME (E.G. KRISH BHINGRADAIYA)"
                    className="hh-input uppercase"
                  />
                </div>

                {/* 3. BUILDER CLASS BUTTONS */}
                <div className="space-y-2">
                  <label className="block font-mono text-xs text-[#F4F1EA] font-semibold tracking-wider">
                    BUILDER CLASS <span className="text-[#FF4500]">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {BUILDER_CLASSES.map((cls) => {
                      const isActive = data.builderClass === cls;
                      return (
                        <button
                          key={cls}
                          type="button"
                          onClick={() => set("builderClass", cls)}
                          className={`font-mono text-xs py-3 px-3 rounded-[2px] text-left transition-all flex items-center justify-between border ${
                            isActive
                              ? "border-[#FF4500] text-[#FF4500] bg-[#FF4500]/5 font-bold"
                              : "border-[#242832] bg-[#0D0E12] text-[#9AA3B2] hover:border-[#2A2F3A] hover:text-[#F4F1EA]"
                          }`}
                        >
                          <span className="truncate">{cls}</span>
                          {isActive ? <Check className="w-3.5 h-3.5 shrink-0 ml-1" /> : null}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. TECHNOLOGY STACK */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <label className="text-[#F4F1EA] font-semibold tracking-wider">
                      TECHNOLOGY STACK <span className="text-[#FF4500]">*</span>
                    </label>
                    <span className="text-[#9AA3B2]">{stackItems.length} / 5 MAX</span>
                  </div>

                  {/* SELECTED CHIPS ROW */}
                  <div className="min-h-[44px] p-2.5 bg-[#0D0E12] border border-[#242832] rounded-[2px] flex flex-wrap items-center gap-2">
                    {stackItems.map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-1.5 bg-[#111318] border border-[#FF4500] text-[#F4F1EA] font-mono text-xs px-2.5 py-1 rounded-[2px]"
                      >
                        <span>{item}</span>
                        <button
                          type="button"
                          onClick={() => removeStackItem(item)}
                          className="text-[#9AA3B2] hover:text-[#FF3333]"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {stackItems.length === 0 ? (
                      <span className="font-mono text-xs text-[#667085] px-1">
                        No tech stack selected. Click suggestions below.
                      </span>
                    ) : null}
                  </div>

                  {/* SUGGESTION BUTTONS */}
                  <div className="space-y-2 pt-1">
                    <span className="block font-mono text-[10px] text-[#667085] tracking-wider uppercase">
                      POPULAR STACK SUGGESTIONS:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {POPULAR_STACK_SUGGESTIONS.map((item) => {
                        const isSelected = stackItems.includes(item);
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => toggleStackItem(item)}
                            disabled={!isSelected && stackItems.length >= 5}
                            className={`font-mono text-xs py-1.5 px-3 border rounded-[2px] transition-all flex items-center gap-1 ${
                              isSelected
                                ? "border-[#FF4500] bg-[#FF4500]/10 text-[#FF4500] font-bold"
                                : "border-[#242832] bg-[#0D0E12] text-[#9AA3B2] hover:border-[#2A2F3A] hover:text-[#F4F1EA] disabled:opacity-40"
                            }`}
                          >
                            <span>+</span>
                            <span>{item}</span>
                          </button>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() => setShowCustomStackInput((v) => !v)}
                        className="font-mono text-xs py-1.5 px-3 border border-[#242832] bg-[#0D0E12] text-[#F4F1EA] hover:border-[#FF4500]"
                      >
                        + Custom
                      </button>
                    </div>

                    {showCustomStackInput ? (
                      <div className="flex gap-2 pt-2">
                        <input
                          type="text"
                          placeholder="Enter custom technology"
                          value={customStackValue}
                          onChange={(e) => setCustomStackValue(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && addCustomStackItem()}
                          className="hh-input text-xs py-2"
                        />
                        <button
                          type="button"
                          onClick={addCustomStackItem}
                          className="hh-button-primary text-xs py-2 px-4 shrink-0"
                        >
                          ADD
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* REQUIREMENTS ALERT */}
                <div className="border border-[#FFB800]/30 bg-[#FFB800]/5 p-4 rounded-[2px] font-mono text-xs space-y-2">
                  <div className="flex items-center gap-2 text-[#FFB800] font-bold">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>REQUIREMENTS TO GENERATE BUILDER ID:</span>
                  </div>
                  <ul className="text-[#9AA3B2] space-y-1 pl-6 list-disc">
                    <li>Upload your builder photo</li>
                    <li>Enter your name (at least 2 characters)</li>
                  </ul>
                </div>


              </div>

              {/* RIGHT COLUMN: LIVE CARD PREVIEW PANEL (5 COLS) */}
              <div className="lg:col-span-5 hh-card p-6 sm:p-8 space-y-6">
                {/* PREVIEW HEADER */}
                <div className="flex items-center justify-between border-b border-[#242832] pb-4">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#F4F1EA] tracking-wider uppercase">
                    <Shield className="w-4 h-4 text-[#FF4500]" />
                    <span>LIVE CARD PREVIEW</span>
                  </div>
                  <span className="hh-badge-orange">#HH-GOA-PREVIEW</span>
                </div>

                {/* SIDE SWITCHER TABS */}
                <div className="flex items-center gap-2 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => setSide("front")}
                    className={`flex-1 py-2 text-center rounded-[2px] border transition-colors ${
                      side === "front"
                        ? "border-[#FF4500] bg-[#FF4500]/10 text-[#FF4500] font-bold"
                        : "border-[#242832] bg-[#0D0E12] text-[#9AA3B2] hover:text-[#F4F1EA]"
                    }`}
                  >
                    FRONT SIDE
                  </button>
                  <button
                    type="button"
                    onClick={() => setSide("back")}
                    className={`flex-1 py-2 text-center rounded-[2px] border transition-colors ${
                      side === "back"
                        ? "border-[#FF4500] bg-[#FF4500]/10 text-[#FF4500] font-bold"
                        : "border-[#242832] bg-[#0D0E12] text-[#9AA3B2] hover:text-[#F4F1EA]"
                    }`}
                  >
                    BACK SIDE
                  </button>
                </div>

                {/* CANVAS CONTAINER */}
                <div className="bg-[#0D0E12] border border-[#242832] rounded-[2px] p-4 flex items-center justify-center min-h-[380px]">
                  <CardCanvas
                    side={side}
                    data={data}
                    className="mx-auto block w-full max-w-[420px] h-auto rounded-[2px] shadow-2xl"
                  />
                </div>

                {/* ACTION BUTTONS */}
                <div className="space-y-3 pt-2 font-mono">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setDownloadDropdown((v) => !v)}
                      disabled={busy}
                      className="hh-button-primary w-full py-3 text-xs"
                    >
                      <Download className="w-4 h-4" />
                      <span>{busy ? "RENDERING..." : "DOWNLOAD BUILDER ID ↓"}</span>
                    </button>

                    {downloadDropdown ? (
                      <div className="absolute left-0 right-0 top-full mt-2 z-30 bg-[#111318] border border-[#242832] p-2 rounded-[2px] shadow-2xl space-y-1 text-xs text-left">
                        <button
                          type="button"
                          onClick={downloadFront}
                          className="w-full px-3 py-2 text-[#F4F1EA] hover:bg-[#1A1D24] flex items-center justify-between"
                        >
                          <span>Front Side Only</span>
                          <ImageIcon className="w-3.5 h-3.5 text-[#FF4500]" />
                        </button>
                        <button
                          type="button"
                          onClick={downloadBack}
                          className="w-full px-3 py-2 text-[#F4F1EA] hover:bg-[#1A1D24] flex items-center justify-between"
                        >
                          <span>Back Side Only</span>
                          <ImageIcon className="w-3.5 h-3.5 text-[#FF4500]" />
                        </button>
                        <button
                          type="button"
                          onClick={downloadCombined}
                          className="w-full px-3 py-2 text-[#F4F1EA] hover:bg-[#1A1D24] flex items-center justify-between"
                        >
                          <span>Combined Pass</span>
                          <Layers className="w-3.5 h-3.5 text-[#FF4500]" />
                        </button>
                        <div className="border-t border-[#242832] my-1" />
                        <button
                          type="button"
                          onClick={downloadAll}
                          className="w-full px-3 py-2 text-[#FF4500] font-bold hover:bg-[#FF4500]/10 flex items-center justify-between"
                        >
                          <span>Download All 3 PNGs</span>
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={share}
                      disabled={busy}
                      className="py-2.5 px-3 border border-[#242832] bg-[#0D0E12] text-[#F4F1EA] hover:border-[#FF4500] hover:text-[#FF4500] text-xs font-semibold tracking-wider uppercase rounded-[2px] transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>SHARE ↗</span>
                    </button>

                    <button
                      type="button"
                      onClick={copyBuilderIdToClipboard}
                      className="py-2.5 px-3 border border-[#242832] bg-[#0D0E12] text-[#F4F1EA] hover:border-[#FF4500] hover:text-[#FF4500] text-xs font-semibold tracking-wider uppercase rounded-[2px] transition-colors flex items-center justify-center gap-1.5"
                    >
                      {copiedId ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#00E599]" />
                          <span>COPIED!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>COPY ID</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>

      {/* SHARE MODAL DIALOG */}
      <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
        <DialogContent className="max-w-2xl border-[#242832] bg-[#0D0E12] text-[#F4F1EA] font-mono">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold uppercase tracking-wider text-[#F4F1EA] flex items-center gap-2">
              <Share2 className="w-5 h-5 text-[#FF4500]" />
              Share Builder ID Pass on X
            </DialogTitle>
            <DialogDescription className="text-xs text-[#9AA3B2] mt-1">
              Front & Back side card images generated! Attach or paste them in your X post.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 space-y-4">
            <div className="rounded-[2px] border border-[#00E599]/40 bg-[#00E599]/10 p-3 text-xs text-[#F4F1EA] flex items-start gap-2.5">
              <Check className="w-4 h-4 text-[#00E599] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#00E599]">Front & Back Card PNGs Ready!</p>
                <p className="mt-0.5 text-[#9AA3B2]">
                  {copiedImage
                    ? "Combined pass image has been copied to your clipboard (Ctrl+V) and downloaded automatically."
                    : "Front and Back side card images have been downloaded automatically to your browser."}
                </p>
              </div>
            </div>

            <div className="flex gap-2 border-b border-[#242832] pb-2">
              <button
                type="button"
                onClick={() => setActiveModalTab("combined")}
                className={`px-3 py-1.5 text-xs rounded-[2px] transition-colors ${
                  activeModalTab === "combined"
                    ? "bg-[#FF4500] text-black font-bold"
                    : "bg-[#111318] text-[#9AA3B2] hover:text-[#F4F1EA]"
                }`}
              >
                Combined Pass
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab("front")}
                className={`px-3 py-1.5 text-xs rounded-[2px] transition-colors ${
                  activeModalTab === "front"
                    ? "bg-[#FF4500] text-black font-bold"
                    : "bg-[#111318] text-[#9AA3B2] hover:text-[#F4F1EA]"
                }`}
              >
                Front Side
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab("back")}
                className={`px-3 py-1.5 text-xs rounded-[2px] transition-colors ${
                  activeModalTab === "back"
                    ? "bg-[#FF4500] text-black font-bold"
                    : "bg-[#111318] text-[#9AA3B2] hover:text-[#F4F1EA]"
                }`}
              >
                Back Side
              </button>
            </div>

            <div className="rounded-[2px] border border-[#242832] bg-black/50 p-3 flex justify-center items-center min-h-[220px]">
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

            <div className="grid gap-2 sm:grid-cols-2 pt-2">
              <button
                type="button"
                onClick={openXIntent}
                className="flex items-center justify-center gap-2 rounded-[2px] bg-[#FF4500] px-4 py-2.5 text-xs font-bold text-black hover:bg-[#FF5714] transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                OPEN POST ON X
              </button>

              <button
                type="button"
                onClick={copyImageToClipboard}
                className="flex items-center justify-center gap-2 rounded-[2px] border border-[#242832] bg-[#111318] px-4 py-2.5 text-xs font-semibold text-[#F4F1EA] hover:border-[#FF4500] transition-colors"
              >
                {copiedImage ? (
                  <>
                    <Check className="w-4 h-4 text-[#00E599]" /> COPIED TO CLIPBOARD
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> COPY PASS IMAGE
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-[#242832] text-[11px] justify-between text-[#9AA3B2]">
              <span>Downloads:</span>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={downloadFront}
                  className="hover:text-[#FF4500] underline"
                >
                  Front PNG
                </button>
                <button
                  type="button"
                  onClick={downloadBack}
                  className="hover:text-[#FF4500] underline"
                >
                  Back PNG
                </button>
                <button
                  type="button"
                  onClick={downloadCombined}
                  className="hover:text-[#FF4500] underline font-bold"
                >
                  Combined Pass PNG
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 25. FOOTER */}
      <footer className="border-t border-[#242832] bg-[#08090B] mt-auto">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-8 py-10">
          <div className="flex flex-wrap items-center justify-between gap-6 pb-8 border-b border-[#242832]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-base text-[#F4F1EA]">
                  HH GOA 2026
                </span>
                <span className="hh-badge-orange">#FRAMEINGOA</span>
              </div>
              <p className="font-mono text-xs text-[#9AA3B2]">
                GOA, INDIA · 28 — 31 OCT 2026
              </p>
            </div>

            <div className="flex items-center gap-4 font-mono text-xs">
              <span className="text-[#FFB800] font-bold">LESS NOISE. MORE SIGNAL.</span>
              <span className="text-[#242832]">|</span>
              <a
                href="https://hhgoa.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#9AA3B2] hover:text-[#F4F1EA] underline flex items-center gap-1"
              >
                Official Website ↗
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 font-mono text-xs text-[#667085]">
            <p>© 2026 HH-Goa. All rights reserved.</p>
            <p className="text-[#9AA3B2]">#FrameInGoa</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
