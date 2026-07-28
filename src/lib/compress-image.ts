export interface CompressOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  maxSize?: number
  format?: 'image/webp' | 'image/jpeg'
}

const DEFAULTS: Required<CompressOptions> = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.8,
  maxSize: 300 * 1024,
  format: 'image/webp',
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')) }
    img.src = url
  })
}

export async function compressImage(file: File, opts?: CompressOptions): Promise<Blob> {
  const options = { ...DEFAULTS, ...opts }

  const img = await loadImage(file)

  let { width, height } = img
  if (width > options.maxWidth) {
    height = Math.round(height * (options.maxWidth / width))
    width = options.maxWidth
  }
  if (height > options.maxHeight) {
    width = Math.round(width * (options.maxHeight / height))
    height = options.maxHeight
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, width, height)

  let quality = options.quality
  const getBlob = (q: number): Promise<Blob> =>
    new Promise((resolve) => canvas.toBlob((b) => resolve(b!), options.format, q)!)
  let blob = await getBlob(quality)

  while (blob.size > options.maxSize && quality > 0.1) {
    quality = Math.round((quality - 0.1) * 10) / 10
    blob = await getBlob(quality)
  }

  return blob
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}