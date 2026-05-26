export const AVATAR_CROP_SIZE = 280;
export const AVATAR_OUTPUT_SIZE = 512;

export type CropState = {
  zoom: number;
  x: number;
  y: number;
};

export function getCoverScale(
  imageWidth: number,
  imageHeight: number,
  cropSize: number
): number {
  return Math.max(cropSize / imageWidth, cropSize / imageHeight);
}

export function clampCropPosition(
  x: number,
  y: number,
  imageWidth: number,
  imageHeight: number,
  cropSize: number,
  scale: number,
  zoom: number
): { x: number; y: number } {
  const s = scale * zoom;
  const w = imageWidth * s;
  const h = imageHeight * s;
  const maxX = Math.max(0, (w - cropSize) / 2);
  const maxY = Math.max(0, (h - cropSize) / 2);
  return {
    x: Math.min(maxX, Math.max(-maxX, x)),
    y: Math.min(maxY, Math.max(-maxY, y)),
  };
}

export async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image illisible"));
    img.src = src;
  });
}

/** Exporte un carré recadré (affiché en cercle côté UI). */
export async function cropAvatarToBlob(
  image: HTMLImageElement,
  crop: CropState,
  baseScale: number,
  mime: string,
  cropSize = AVATAR_CROP_SIZE,
  outputSize = AVATAR_OUTPUT_SIZE
): Promise<Blob> {
  const scale = baseScale * crop.zoom;
  const drawW = image.naturalWidth * scale;
  const drawH = image.naturalHeight * scale;
  const left = cropSize / 2 - drawW / 2 + crop.x;
  const top = cropSize / 2 - drawH / 2 + crop.y;

  const sx = Math.max(0, (0 - left) / scale);
  const sy = Math.max(0, (0 - top) / scale);
  const sSize = cropSize / scale;
  const sw = Math.min(image.naturalWidth - sx, sSize);
  const sh = Math.min(image.naturalHeight - sy, sSize);

  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponible");

  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, outputSize, outputSize);

  const outMime =
    mime === "image/png" || mime === "image/webp" ? mime : "image/jpeg";
  const quality = outMime === "image/jpeg" ? 0.92 : undefined;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Export échoué"));
      },
      outMime,
      quality
    );
  });
}
