'use client'

import { useState, useRef, useCallback } from 'react'
import { upload } from '@vercel/blob/client'
import { compressImage, formatFileSize } from '@/lib/compress-image'
import { toast } from 'sonner'

interface UseImageUploadOptions {
  onProgress?: (progress: number) => void
  onError?: (error: string) => void
}

export function useImageUpload(opts?: UseImageUploadOptions) {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const abortRef = useRef<AbortController | null>(null)

  const uploadFile = useCallback(
    async (file: File): Promise<string> => {
      if (!file.type.startsWith('image/')) {
        throw new Error('Only image files are allowed')
      }

      setIsUploading(true)
      setProgress(0)
      opts?.onProgress?.(0)

      const originalSize = file.size
      const compressed = await compressImage(file)
      const compressedSize = compressed.size

      const controller = new AbortController()
      abortRef.current = controller

      const filename = file.name.replace(/\.[^.]+$/, '.webp')

      try {
        const blob = await upload(filename, compressed, {
          access: 'public',
          handleUploadUrl: '/api/upload',
          abortSignal: controller.signal,
          onUploadProgress: (p) => {
            setProgress(p.percentage)
            opts?.onProgress?.(p.percentage)
          },
        })

        const saved = ((originalSize - compressedSize) / originalSize * 100).toFixed(0)
        console.info(
          `Image: ${formatFileSize(originalSize)} → ${formatFileSize(compressedSize)} (${saved}% saved)`
        )

        return blob.url
      } finally {
        setIsUploading(false)
        setProgress(100)
        opts?.onProgress?.(100)
        abortRef.current = null
      }
    },
    [opts],
  )

  const uploadMainImage = useCallback(
    async (file: File): Promise<string> => {
      try {
        return await uploadFile(file)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed'
        toast.error(message)
        opts?.onError?.(message)
        throw err
      }
    },
    [uploadFile, opts],
  )

  const uploadGalleryImage = useCallback(
    async (file: File): Promise<string> => {
      try {
        return await uploadFile(file)
      } catch (err) {
        const message = err instanceof Error ? err.message : `Failed to upload ${file.name}`
        toast.error(message)
        opts?.onError?.(message)
        throw err
      }
    },
    [uploadFile, opts],
  )
  const cancel = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setIsUploading(false)
    setProgress(0)
  }, [])

  return { uploadMainImage, uploadGalleryImage, isUploading, progress, cancel }
}