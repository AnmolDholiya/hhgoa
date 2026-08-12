import QRCode from "qrcode";
import JsBarcode from "jsbarcode";

import frontAsset from "@/assets/card-front.png.asset.json";
import backAsset from "@/assets/card-back.png.asset.json";

export const FRONT_SRC = frontAsset.url;
export const BACK_SRC = backAsset.url;

export const CARD_W = 843;
export const CARD_H = 1264;

export type BuilderData = {
  fullName: string;
  builderClass: string;
  stack: string;
  builderId: string;
  websiteUrl: string;
  photo: string | null;
};

/** Locked template coordinates, in front-artwork pixel space (843x1264). */
const BOX = {
  photo: { x: 257, y: 455, w: 338, h: 312 },
  name: { x: 186, y: 769, w: 481, h: 52 },
  class: { x: 130, y: 867, w: 213, h: 32 },
  stack: { x: 474, y: 867, w: 299, h: 32 },
  id: { x: 286, y: 918, w: 271, h: 38 },
  barcode: { x: 604, y: 915, w: 148, h: 42 },
  qr: { x: 57, y: 1065, w: 104, h: 104 },
};

const INK = "#241309";
const PLATE_TEXT = "#F2E6CE";

const imageCache = new Map<string, Promise<HTMLImageElement>>();

export function loadImage(src: string): Promise<HTMLImageElement> {
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
  spacing = "0px",
) {
  if (!text) return;
  fitText(ctx, text, box.w, startSize, 700, spacing);
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, box.x + box.w / 2, box.y + box.h / 2 + 1);
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


function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  b: { x: number; y: number; w: number; h: number },
) {
  const scale = Math.max(b.w / img.width, b.h / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  ctx.drawImage(img, b.x + (b.w - w) / 2, b.y + (b.h - h) / 2, w, h);
}

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

/** Renders the front card (template + dynamic layers) at `scale`. */
export async function renderFront(
  canvas: HTMLCanvasElement,
  data: BuilderData,
  scale = 1,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width = Math.round(CARD_W * scale);
  canvas.height = Math.round(CARD_H * scale);
  const template = await loadImage(FRONT_SRC);
  const qr = await qrDataUrl(data.websiteUrl);
  const qrImg = await loadImage(qr);

  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.clearRect(0, 0, CARD_W, CARD_H);
  ctx.imageSmoothingQuality = "high";

  // Photo sits under the artwork frame.
  if (data.photo) {
    const photo = await loadImage(data.photo);
    // The template PNG has a transparent window, so it masks the photo.
    drawCover(ctx, photo, BOX.photo);
  } else {
    ctx.save();
    const g = ctx.createLinearGradient(
      BOX.photo.x,
      BOX.photo.y,
      BOX.photo.x + BOX.photo.w,
      BOX.photo.y + BOX.photo.h,
    );
    g.addColorStop(0, "#0b2c4d");
    g.addColorStop(1, "#12405f");
    ctx.fillStyle = g;
    ctx.fillRect(BOX.photo.x, BOX.photo.y, BOX.photo.w, BOX.photo.h);
    ctx.fillStyle = "rgba(242,230,206,0.75)";
    ctx.font = '600 24px Oswald, "Arial Narrow", sans-serif';
    ctx.textAlign = "center";
    ctx.fillText(
      "UPLOAD PHOTO",
      BOX.photo.x + BOX.photo.w / 2,
      BOX.photo.y + BOX.photo.h / 2,
    );
    ctx.restore();
  }

  ctx.drawImage(template, 0, 0, CARD_W, CARD_H);

  drawCentered(ctx, data.fullName.toUpperCase(), BOX.name, 46, PLATE_TEXT, "1px");
  drawLeft(ctx, data.builderClass.toUpperCase(), BOX.class, 27, INK);
  drawLeft(ctx, data.stack.toUpperCase(), BOX.stack, 27, INK);
  drawCentered(ctx, data.builderId.toUpperCase(), BOX.id, 32, PLATE_TEXT, "2px");

  const bc = barcodeCanvas(data.builderId);
  if (bc) {
    ctx.drawImage(bc, BOX.barcode.x, BOX.barcode.y, BOX.barcode.w, BOX.barcode.h);
  }
  ctx.drawImage(qrImg, BOX.qr.x, BOX.qr.y, BOX.qr.w, BOX.qr.h);
}

export async function renderBack(canvas: HTMLCanvasElement, scale = 1) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const img = await loadImage(BACK_SRC);
  const w = Math.round(CARD_W * scale);
  const h = Math.round((img.height / img.width) * CARD_W * scale);
  canvas.width = w;
  canvas.height = h;
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
}

export function fileName(name: string) {
  const slug =
    (name || "BUILDER")
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "BUILDER";
  return `HH-GOA-2026_${slug}.png`;
}
