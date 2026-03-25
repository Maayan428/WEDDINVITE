'use client';

import { useState, useRef } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface Props {
  imageSrc: string;
  onConfirm: (croppedBase64: string) => void;
  onCancel: () => void;
}

function getCroppedImage(image: HTMLImageElement, crop: PixelCrop): string {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  // Output at full natural resolution
  canvas.width = crop.width * scaleX;
  canvas.height = crop.height * scaleY;

  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height,
  );
  return canvas.toDataURL('image/jpeg', 0.95);
}

const ASPECT_OPTIONS: { label: string; value: number | undefined }[] = [
  { label: 'חופשי', value: undefined },
  { label: '1:1', value: 1 },
  { label: '3:4', value: 3 / 4 },
  { label: '4:5', value: 4 / 5 },
];

export default function ImageCropModal({ imageSrc, onConfirm, onCancel }: Props) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const imgRef = useRef<HTMLImageElement>(null);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const initial = centerCrop(
      makeAspectCrop({ unit: '%', width: 90 }, aspect ?? width / height, width, height),
      width,
      height,
    );
    setCrop(initial);
  }

  function handleAspectChange(value: number | undefined) {
    setAspect(value);
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      const next = centerCrop(
        makeAspectCrop({ unit: '%', width: 90 }, value ?? width / height, width, height),
        width,
        height,
      );
      setCrop(next);
    }
  }

  function handleConfirm() {
    if (!completedCrop || !imgRef.current) return;
    onConfirm(getCroppedImage(imgRef.current, completedCrop));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-auto rounded-2xl bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-gray-800">עריכת תמונת ההזמנה</h2>

        {/* Aspect ratio buttons */}
        <div className="mb-4 flex gap-2">
          {ASPECT_OPTIONS.map(({ label, value }) => (
            <button
              key={label}
              type="button"
              onClick={() => handleAspectChange(value)}
              className={`rounded-full border px-3 py-1 text-sm transition-all ${
                aspect === value
                  ? 'border-teal-500 bg-teal-500 text-white'
                  : 'border-gray-200 text-gray-600 hover:border-teal-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Crop area */}
        <div className="mb-4 flex max-h-[400px] items-center justify-center overflow-hidden rounded-xl bg-gray-100">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspect}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={imageSrc}
              alt="תמונה לחיתוך"
              onLoad={onImageLoad}
              style={{ maxHeight: '400px', maxWidth: '100%' }}
            />
          </ReactCrop>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!completedCrop}
            className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #0d9488, #06b6d4)' }}
          >
            אשר חיתוך
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50"
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
}
