'use client'

import { Check } from '@/lib/lucide-icons'

export default function AdminToast({ message }: { message: string | null }) {
  if (!message) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="animate-toast-in fixed top-20 right-4 z-[60] flex items-center gap-3 rounded-xl bg-[#111110] px-4 py-3 text-sm font-medium text-white shadow-[0_12px_32px_rgba(0,0,0,0.35)] ring-1 ring-white/10 sm:right-6"
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#B6965D]/20 text-[#B6965D]">
        <Check className="h-3.5 w-3.5" />
      </span>
      {message}
    </div>
  )
}