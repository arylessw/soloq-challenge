"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AVATAR_CROP_SIZE,
  clampCropPosition,
  cropAvatarToBlob,
  getCoverScale,
  loadImage,
  type CropState,
} from "@/lib/avatar-crop";

type Props = {
  imageSrc: string;
  mime: string;
  onConfirm: (blob: Blob) => void | Promise<void>;
  onCancel: () => void;
};

export function AvatarCropModal({
  imageSrc,
  mime,
  onConfirm,
  onCancel,
}: Props) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [baseScale, setBaseScale] = useState(1);
  const [crop, setCrop] = useState<CropState>({ zoom: 1, x: 0, y: 0 });
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; cropX: number; cropY: number } | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;
    loadImage(imageSrc)
      .then((img) => {
        if (cancelled) return;
        setImage(img);
        setBaseScale(getCoverScale(img.naturalWidth, img.naturalHeight, AVATAR_CROP_SIZE));
        setCrop({ zoom: 1, x: 0, y: 0 });
      })
      .catch(() => {
        if (!cancelled) setLoadError("Impossible de charger l’image");
      });
    return () => {
      cancelled = true;
    };
  }, [imageSrc]);

  const updateCrop = useCallback(
    (patch: Partial<CropState>) => {
      if (!image) return;
      setCrop((prev) => {
        const next = { ...prev, ...patch };
        const clamped = clampCropPosition(
          next.x,
          next.y,
          image.naturalWidth,
          image.naturalHeight,
          AVATAR_CROP_SIZE,
          baseScale,
          next.zoom
        );
        return { ...next, ...clamped };
      });
    },
    [image, baseScale]
  );

  function onPointerDown(e: React.PointerEvent) {
    if (!image) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      cropX: crop.x,
      cropY: crop.y,
    };
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragRef.current || !image) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    const clamped = clampCropPosition(
      dragRef.current.cropX + dx,
      dragRef.current.cropY + dy,
      image.naturalWidth,
      image.naturalHeight,
      AVATAR_CROP_SIZE,
      baseScale,
      crop.zoom
    );
    setCrop((prev) => ({ ...prev, ...clamped }));
  }

  function onPointerUp(e: React.PointerEvent) {
    dragRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }

  async function handleConfirm() {
    if (!image) return;
    setBusy(true);
    try {
      const blob = await cropAvatarToBlob(image, crop, baseScale, mime);
      await onConfirm(blob);
    } finally {
      setBusy(false);
    }
  }

  const scale = baseScale * crop.zoom;
  const imgW = image ? image.naturalWidth * scale : 0;
  const imgH = image ? image.naturalHeight * scale : 0;
  const imgLeft = AVATAR_CROP_SIZE / 2 - imgW / 2 + crop.x;
  const imgTop = AVATAR_CROP_SIZE / 2 - imgH / 2 + crop.y;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="avatar-crop-title"
    >
      <div className="card-glow w-full max-w-md p-5 relative z-[1] shadow-2xl">
        <h2
          id="avatar-crop-title"
          className="font-display text-xl text-gold-light mb-1"
        >
          Recadrer la photo
        </h2>
        <p className="text-sm text-muted mb-4">
          Glisse pour repositionner, zoome si besoin. Le cercle correspond à
          l’affichage final.
        </p>

        {loadError ? (
          <p className="text-sm text-red-300 mb-4">{loadError}</p>
        ) : (
          <div
            className="relative mx-auto mb-4 rounded-full border-2 border-gold/40 bg-black/40 touch-none select-none cursor-grab active:cursor-grabbing"
            style={{ width: AVATAR_CROP_SIZE, height: AVATAR_CROP_SIZE }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageSrc}
                alt=""
                draggable={false}
                className="absolute max-w-none pointer-events-none"
                style={{
                  width: imgW,
                  height: imgH,
                  left: imgLeft,
                  top: imgTop,
                }}
              />
            )}
            <div
              className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-white/30"
              aria-hidden
            />
          </div>
        )}

        <label className="label block mb-4">
          Zoom
          <input
            type="range"
            min={1}
            max={3}
            step={0.02}
            value={crop.zoom}
            disabled={!image || busy}
            onChange={(e) => updateCrop({ zoom: Number(e.target.value) })}
            className="mt-2 w-full accent-gold"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!image || busy || !!loadError}
            className="btn-primary flex-1 min-w-[8rem]"
          >
            {busy ? "Enregistrement…" : "Enregistrer"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="leaderboard-tab px-4"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
