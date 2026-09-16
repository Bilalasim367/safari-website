'use client'

import React, { useCallback, useState } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2 } from '@/lib/lucide-icons'

interface PixelCrop {
  width: number
  height: number
  x: number
  y: number
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = src
  })
}

async function cropImageToSquareBlob(
  imageSrc: string,
  pixelCrop: PixelCrop,
  outputSize = 800
): Promise<Blob> {
  const image = await loadImage(imageSrc)
  const canvas = document.createElement('canvas')
  canvas.width = outputSize
  canvas.height = outputSize
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not supported in this browser')
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputSize,
    outputSize
  )
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Failed to generate cropped image'))
    }, 'image/jpeg')
  })
}

interface CropperBodyProps {
  imageSrc: string
  onClose: () => void
  onConfirm: (blob: Blob) => Promise<void>
}

function CropperBody({ imageSrc, onClose, onConfirm }: CropperBodyProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedArea, setCroppedArea] = useState<PixelCrop | null>(null)
  const [saving, setSaving] = useState(false)

  const onCropComplete = useCallback((_area: Area, croppedAreaPixels: Area) => {
    setCroppedArea({
      width: croppedAreaPixels.width,
      height: croppedAreaPixels.height,
      x: croppedAreaPixels.x,
      y: croppedAreaPixels.y,
    })
  }, [])

  const handleSave = async () => {
    if (!croppedArea || saving) return
    setSaving(true)
    try {
      const blob = await cropImageToSquareBlob(imageSrc, croppedArea)
      await onConfirm(blob)
    } catch {
      setSaving(false)
    }
  }

  const zoomPercent = Math.round(zoom * 100)

  return (
    <div className="flex flex-col gap-4">
      <div
        className="relative h-[min(64vw,320px)] w-full max-w-[340px] self-center overflow-hidden rounded-lg bg-black"
        role="img"
        aria-label="Image cropping area"
      >
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          minZoom={0.5}
          maxZoom={3}
          cropShape="rect"
          showGrid
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      </div>

      <div className="w-full max-w-[340px] self-center space-y-2">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>50%</span>
          <span className="font-medium text-[#B6965D]">Zoom: {zoomPercent}%</span>
          <span>300%</span>
        </div>
        <input
          type="range"
          min={0.5}
          max={3}
          step={0.01}
          value={zoom}
          aria-label="Zoom slider"
          onChange={(e) => setZoom(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-800 accent-[#B6965D]"
        />
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="ghost"
          className="min-h-[44px] flex-1"
          disabled={saving}
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          disabled={!croppedArea || saving}
          className="min-h-[44px] flex-1 bg-[#B6965D] text-black hover:bg-[#c9a873]"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            'Crop & Save'
          )}
        </Button>
      </div>
    </div>
  )
}

interface ShowcaseCropperProps {
  open: boolean
  imageSrc: string | null
  onClose: () => void
  onConfirm: (blob: Blob) => Promise<void>
}

export default function ShowcaseCropper({
  open,
  imageSrc,
  onClose,
  onConfirm,
}: ShowcaseCropperProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Crop Showcase Image</DialogTitle>
          <DialogDescription>
            Square format is locked. Drag to position the bottle, and use the slider to zoom.
          </DialogDescription>
        </DialogHeader>

        {open && imageSrc ? (
          <CropperBody imageSrc={imageSrc} onClose={onClose} onConfirm={onConfirm} />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}