import QRCode from "qrcode";
import JsBarcode from "jsbarcode";

import frontImg from "@/assets/card-front.png";
import backImg from "@/assets/card-back.png";

export const FRONT_SRC = frontImg;
export const BACK_SRC = backImg;

export const CARD_W = 843;
export const CARD_H = 1264;

export type BuilderData = {
  fullName: string;
  builderClass: string;
  stack: string;
  builderId: string;
  websiteUrl: string;
  photo: string | null;
  photoZoom?: number;
  photoOffsetX?: number;
  photoOffsetY?: number;
};

/**
 * Photo opening bounding box derived from pixel-level analysis of card-front.png.
 *
 * The actual transparent hole is an arch-topped shape:
 *  - Top arch: y=448→521, narrowing from 338px to 257px with a dome curve
 *  - Straight body: y=521→739, full width x=254→591 (338px)
 *  - Bottom corners: y=740→763, gentle rounding (~20px radius)
 *
 * For cover-crop calculations we use the full bounding box.
 * For visual masking we rely on the template's own alpha channel.
 */
export const photoFrame = {
  x: 254,
  y: 448,
  width: 338,
  height: 316,
};

/** Toggle for visual frame geometry inspection during development */
export const DEBUG_PHOTO_FRAME = false;

/** Locked template coordinates, in front-artwork pixel space (843×1264). */
const BOX = {
  photo: photoFrame,
  name: { x: 144, y: 768, w: 560, h: 60 },
  class: { x: 130, y: 867, w: 213, h: 32 },
  stack: { x: 474, y: 867, w: 299, h: 32 },
  id: { x: 275, y: 914, w: 289, h: 46 },
  barcode: { x: 604, y: 915, w: 148, h: 42 },
  qr: { x: 57, y: 1065, w: 104, h: 104 },
};

/**
 * Extra pixels to extend the photo draw region beyond the bounding box in all
 * directions.  This ensures photo coverage even if the arch curve extends
 * slightly past the measured bounding box at sub-pixel level.
 */
const BLEED = 10;

const INK = "#241309";
const PLATE_TEXT = "#F2E6CE";

/* ── image cache ─────────────────────────────────────────────────────── */

const imageCache = new Map<string, Promise<HTMLImageElement>>();
let lastDataUrlKey: string | null = null;

export function loadImage(src: string): Promise<HTMLImageElement> {
  const isDataUrl = src.startsWith("data:");
  if (isDataUrl && lastDataUrlKey && lastDataUrlKey !== src) {
    imageCache.delete(lastDataUrlKey);
  }
  if (isDataUrl) lastDataUrlKey = src;

  const cached = imageCache.get(src);
  if (cached) return cached;

  const p = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
  imageCache.set(src, p);
  return p;
}

/* ── text helpers ────────────────────────────────────────────────────── */

function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  startSize: number,
  weight = 700,
  spacing = "0px",
) {
  let size = startSize;
  for (;;) {
    ctx.font = `${weight} ${size}px Oswald, "Arial Narrow", sans-serif`;
    ctx.letterSpacing = spacing;
    if (ctx.measureText(text).width <= maxWidth || size <= 10) break;
    size -= 1;
  }
  return size;
}

function drawCentered(
  ctx: CanvasRenderingContext2D,
  text: string,
  box: { x: number; y: number; w: number; h: number },
  startSize: number,
  color: string,
  spacingPx = 0,
  padding = 0,
) {
  if (!text) return;
  fitText(ctx, text, box.w - padding * 2, startSize, 700, `${spacingPx}px`);
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, box.x + box.w / 2 + spacingPx / 2, box.y + box.h / 2);
  ctx.letterSpacing = "0px";
}

function drawLeft(
  ctx: CanvasRenderingContext2D,
  text: string,
  box: { x: number; y: number; w: number; h: number },
  startSize: number,
  color: string,
) {
  if (!text) return;
  fitText(ctx, text, box.w, startSize, 600, "0.5px");
  ctx.fillStyle = color;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(text, box.x, box.y + box.h / 2 + 1);
  ctx.letterSpacing = "0px";
}

/* ── cover-crop calculation ──────────────────────────────────────────── */

export type SmartPhotoPlacement = {
  sx: number;
  sy: number;
  cropWidth: number;
  cropHeight: number;
  frameX: number;
  frameY: number;
  frameWidth: number;
  frameHeight: number;
};

/**
 * Calculates cover-crop placement so the user's photo fills the photo
 * bounding box completely, preserving aspect ratio, with smart face-biased
 * positioning and support for zoom / pan controls.
 */
export function calculateSmartPhotoPlacement(
  imageWidth: number,
  imageHeight: number,
  frameX: number,
  frameY: number,
  frameWidth: number,
  frameHeight: number,
  zoom = 1.0,
  offsetX = 0,
  offsetY = 0,
): SmartPhotoPlacement {
  const imageAspect = imageWidth / imageHeight;
  const frameAspect = frameWidth / frameHeight;

  const coverScale = Math.max(
    frameWidth / imageWidth,
    frameHeight / imageHeight,
  );
  const safeZoom = Math.max(1.0, zoom);

  const cropWidth = frameWidth / (coverScale * safeZoom);
  const cropHeight = frameHeight / (coverScale * safeZoom);

  let defaultSx = (imageWidth - cropWidth) / 2;
  let defaultSy = (imageHeight - cropHeight) / 2;

  // For portrait photos, bias towards the top 35% to keep the face visible
  if (imageAspect < frameAspect) {
    defaultSy = (imageHeight - cropHeight) * 0.35;
  }

  const maxPanX = Math.max(0, imageWidth - cropWidth);
  const maxPanY = Math.max(0, imageHeight - cropHeight);
  const panRangeX = maxPanX > 0 ? maxPanX / 2 : cropWidth * 0.25;
  const panRangeY = maxPanY > 0 ? maxPanY / 2 : cropHeight * 0.25;

  let sx = defaultSx - offsetX * panRangeX;
  let sy = defaultSy - offsetY * panRangeY;

  sx = Math.max(0, Math.min(Math.max(0, imageWidth - cropWidth), sx));
  sy = Math.max(0, Math.min(Math.max(0, imageHeight - cropHeight), sy));

  return {
    sx,
    sy,
    cropWidth,
    cropHeight,
    frameX,
    frameY,
    frameWidth,
    frameHeight,
  };
}

/* ── barcode / QR helpers ────────────────────────────────────────────── */

async function qrDataUrl(text: string) {
  return QRCode.toDataURL(text || "https://hhgoa.com", {
    margin: 0,
    errorCorrectionLevel: "M",
    width: 512,
    color: { dark: "#160b04ff", light: "#f7f0e0ff" },
  });
}

function barcodeCanvas(value: string) {
  const c = document.createElement("canvas");
  try {
    JsBarcode(c, value || "HH-GOA-2026", {
      format: "CODE128",
      displayValue: false,
      margin: 0,
      width: 2,
      height: 80,
      background: "#00000000",
      lineColor: "#150a03",
    });
  } catch {
    return null;
  }
  return c;
}

/* ── main render ─────────────────────────────────────────────────────── */

/**
 * Renders the front card at the given `scale`.
 *
 * Compositing strategy — 3-step sandwich:
 * ───────────────────────────────────────
 *   STEP 1  Fill the entire canvas with a solid fallback color.
 *           → Prevents any transparent/checkerboard areas.
 *
 *   STEP 2  Draw the user photo (or placeholder) into the photo bounding box.
 *           The photo covers the full bounding rect plus BLEED so it extends
 *           beyond the arch-shaped hole in all directions.
 *
 *   STEP 3  Draw the master card template ON TOP (source-over).
 *           Because the template is fully opaque everywhere except the
 *           arch-shaped photo hole, the template's own opaque pixels
 *           perfectly mask the photo — no clipping path needed.
 *           The photo only shows through the exact transparent hole.
 *
 *   STEP 4  Draw dynamic text, barcode, QR on top.
 *
 * The template's alpha channel IS the pixel-perfect mask.
 * No roundRect, no SVG clipPath, no CSS clip-path.
 * Preview and downloaded PNG use the exact same render function.
 */
export async function renderFront(
  canvas: HTMLCanvasElement,
  data: BuilderData,
  scale = 1,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = Math.round(CARD_W * scale);
  canvas.height = Math.round(CARD_H * scale);

  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Pre-load all async assets before painting
  const [template, qrImg] = await Promise.all([
    loadImage(FRONT_SRC),
    qrDataUrl(data.websiteUrl).then((url) => loadImage(url)),
  ]);

  // ─── STEP 1: SOLID BACKGROUND ─────────────────────────────────────
  // Fill entire canvas so there are ZERO transparent pixels.
  // This prevents checkerboard in PNG viewers and transparent canvas
  // bleed-through in the browser.  The color matches the card's outer
  // dark wood border so it blends invisibly.
  ctx.fillStyle = "#2c1a0e";
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // ─── STEP 2: USER PHOTO (or placeholder) ──────────────────────────
  // Draw the photo into the bounding box + bleed.  It extends past the
  // arch opening edges, but that's OK — the template overlay in step 3
  // will mask everything outside the actual transparent hole.
  const fx = photoFrame.x - BLEED;
  const fy = photoFrame.y - BLEED;
  const fw = photoFrame.width + BLEED * 2;
  const fh = photoFrame.height + BLEED * 2;

  if (data.photo) {
    try {
      const photo = await loadImage(data.photo);
      const p = calculateSmartPhotoPlacement(
        photo.width,
        photo.height,
        fx,
        fy,
        fw,
        fh,
        data.photoZoom ?? 1.0,
        data.photoOffsetX ?? 0,
        data.photoOffsetY ?? 0,
      );
      ctx.drawImage(
        photo,
        p.sx,
        p.sy,
        p.cropWidth,
        p.cropHeight,
        p.frameX,
        p.frameY,
        p.frameWidth,
        p.frameHeight,
      );
    } catch {
      // Photo failed to load — draw a professional placeholder instead
      drawPlaceholder(ctx, "PHOTO ERROR");
    }
  } else {
    drawPlaceholder(ctx, "UPLOAD PHOTO");
  }

  // ─── STEP 3: MASTER CARD TEMPLATE (on top) ────────────────────────
  // The template is opaque everywhere except the arch-shaped photo
  // hole.  Drawing it on top of the photo means:
  //   • Photo is visible ONLY through the transparent hole
  //   • Template artwork perfectly covers photo bleed outside the hole
  //   • The arch shape, border, scenery all remain pristine
  ctx.drawImage(template, 0, 0, CARD_W, CARD_H);

  // ─── DEBUG OVERLAY ─────────────────────────────────────────────────
  if (DEBUG_PHOTO_FRAME) {
    ctx.save();
    ctx.strokeStyle = "#FF0000";
    ctx.lineWidth = 2;
    ctx.strokeRect(
      photoFrame.x,
      photoFrame.y,
      photoFrame.width,
      photoFrame.height,
    );
    ctx.font = "bold 14px monospace";
    ctx.fillStyle = "#FF0000";
    ctx.fillText(
      `FRAME: ${photoFrame.x},${photoFrame.y} ${photoFrame.width}x${photoFrame.height}`,
      photoFrame.x,
      photoFrame.y - 6,
    );
    ctx.restore();
  }

  // ─── STEP 4: DYNAMIC TEXT, BARCODE & QR ───────────────────────────
  drawCentered(
    ctx,
    data.fullName.toUpperCase(),
    BOX.name,
    46,
    PLATE_TEXT,
    1,
    45,
  );
  drawLeft(ctx, data.builderClass.toUpperCase(), BOX.class, 27, INK);
  drawLeft(ctx, data.stack.toUpperCase(), BOX.stack, 27, INK);
  drawCentered(
    ctx,
    data.builderId.toUpperCase(),
    BOX.id,
    32,
    PLATE_TEXT,
    2,
    22,
  );

  const bc = barcodeCanvas(data.builderId);
  if (bc) {
    ctx.drawImage(bc, BOX.barcode.x, BOX.barcode.y, BOX.barcode.w, BOX.barcode.h);
  }
  ctx.drawImage(qrImg, BOX.qr.x, BOX.qr.y, BOX.qr.w, BOX.qr.h);
}

/** Professional placeholder gradient for the photo area */
function drawPlaceholder(ctx: CanvasRenderingContext2D, label: string) {
  const g = ctx.createLinearGradient(
    photoFrame.x,
    photoFrame.y,
    photoFrame.x + photoFrame.width,
    photoFrame.y + photoFrame.height,
  );
  g.addColorStop(0, "#0b2c4d");
  g.addColorStop(1, "#12405f");
  ctx.fillStyle = g;
  ctx.fillRect(
    photoFrame.x - BLEED,
    photoFrame.y - BLEED,
    photoFrame.width + BLEED * 2,
    photoFrame.height + BLEED * 2,
  );
  ctx.fillStyle = "rgba(242,230,206,0.8)";
  ctx.font = '600 24px Oswald, "Arial Narrow", sans-serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(
    label,
    photoFrame.x + photoFrame.width / 2,
    photoFrame.y + photoFrame.height / 2,
  );
}

/* ── back card ───────────────────────────────────────────────────────── */

export async function renderBack(canvas: HTMLCanvasElement, scale = 1) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const img = await loadImage(BACK_SRC);
  const w = Math.round(CARD_W * scale);
  const h = Math.round((img.height / img.width) * CARD_W * scale);
  canvas.width = w;
  canvas.height = h;
  ctx.clearRect(0, 0, w, h);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, w, h);
}

/* ── file name helper ────────────────────────────────────────────────── */

export function fileName(name: string) {
  const slug =
    (name || "BUILDER")
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "BUILDER";
  return `HH-GOA-2026_${slug}.png`;
}
