'use client'

import { useEffect, useState } from 'react'

interface ComingSoonCountdownProps {
  launchDate: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function getTimeLeft(target: number): TimeLeft | null {
  const diff = target - Date.now()
  if (Number.isNaN(diff)) return null
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor(diff / 3600000) % 24,
    minutes: Math.floor(diff / 60000) % 60,
    seconds: Math.floor(diff / 1000) % 60,
  }
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

export default function ComingSoonCountdown({ launchDate }: ComingSoonCountdownProps) {
  const target = new Date(launchDate).getTime()
  const isValid = !Number.isNaN(target)
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)

  useEffect(() => {
    if (!isValid) return
    const update = () => setTimeLeft(getTimeLeft(target))
    const timer = setTimeout(update, 0)
    const id = setInterval(update, 1000)
    return () => {
      clearTimeout(timer)
      clearInterval(id)
    }
  }, [isValid, target])

  const units = [
    { label: 'Days', value: timeLeft ? pad(timeLeft.days) : '—' },
    { label: 'Hours', value: timeLeft ? pad(timeLeft.hours) : '—' },
    { label: 'Minutes', value: timeLeft ? pad(timeLeft.minutes) : '—' },
    { label: 'Seconds', value: timeLeft ? pad(timeLeft.seconds) : '—' },
  ]

  const formatted = timeLeft
    ? new Date(launchDate).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Karachi',
      })
    : ''

  return (
    <div>
      <div className="grid grid-cols-4 gap-3 md:gap-5 max-w-xl mx-auto">
        {units.map((unit) => (
          <div
            key={unit.label}
            className="bg-white/[0.03] border border-gold/20 rounded-2xl px-1 py-5 md:py-8"
          >
            <p className="font-heading text-3xl md:text-5xl text-gold tabular-nums leading-none">
              {unit.value}
            </p>
            <p className="mt-2 md:mt-3 uppercase tracking-[0.2em] text-[10px] md:text-xs text-white/50">
              {unit.label}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-7 md:mt-9 text-sm md:text-base text-white/60">
        {isValid === false ? (
          'Stay tuned — exact launch date is coming soon.'
        ) : (
          <>
            Our doors open on{' '}
            <span className="text-gold whitespace-nowrap">{formatted || 'launch day'}</span>
          </>
        )}
      </p>
    </div>
  )
}