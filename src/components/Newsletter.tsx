"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Mail, CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { DEFAULT_NEWSLETTER, type NewsletterConfig } from "@/lib/homepage-content"

interface NewsletterProps {
  content?: NewsletterConfig
}

function renderDescription(description: string, highlight?: string) {
  const phrase = highlight?.trim()
  if (!phrase || !description.includes("{{highlight}}")) return description
  const parts = description.split("{{highlight}}")
  return parts.map((part, index) => (
    <React.Fragment key={index}>
      {part}
      {index < parts.length - 1 && <span className="text-gold font-medium">{phrase}</span>}
    </React.Fragment>
  ))
}

function renderDisclaimer(disclaimer: string) {
  if (!disclaimer.includes("Privacy Policy")) return disclaimer
  const [before, after] = disclaimer.split("Privacy Policy")
  return (
    <>
      {before}
      <Link href="/privacy" className="underline hover:text-gold">
        Privacy Policy
      </Link>
      {after}
    </>
  )
}

export default function Newsletter({ content = DEFAULT_NEWSLETTER }: NewsletterProps) {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        setStatus("success")
        setMessage(content.successMessage)
        setEmail("")
      } else {
        const data = await res.json().catch(() => null)
        // The API may call an existing address a success; a real failure is
        // surfaced as an error.
        if (data?.alreadySubscribed) {
          setStatus("success")
          setMessage("You're already part of the Safari Circle.")
          setEmail("")
        } else {
          setStatus("error")
          setMessage(data?.error || "Something went wrong. Please try again.")
        }
      }
    } catch {
      setStatus("error")
      setMessage("Something went wrong. Please try again.")
    }
  }

  return (
    <section className="px-4 md:px-12 py-6 md:py-28 bg-[#050505] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03]" />

      <div className="container-custom relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-gold text-[10px] md:text-sm tracking-[0.5em] uppercase mb-1 md:mb-4">
            {content.eyebrow}
          </p>
          <h2 className="text-2xl md:text-5xl lg:text-6xl font-heading text-white mb-3 md:mb-6">
            {content.title}
          </h2>
          <p className="text-white/70 text-base md:text-xl leading-relaxed mb-6 md:mb-10 max-w-2xl mx-auto">
            {renderDescription(content.description, content.highlight)}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 md:gap-4 max-w-md mx-auto">
            <div className="relative flex-1">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === "loading" || status === "success"}
                className={cn(
                  "bg-white/5 border-white/20 text-white placeholder-white/40 hover:border-white/40 focus:border-gold focus:ring-gold/20",
                  "pl-12 pr-4 py-5 md:py-4 rounded-none text-base md:text-sm"
                )}
                required
                autoComplete="email"
                aria-label="Email address"
              />
            </div>
            <Button
              type="submit"
              disabled={status === "loading" || status === "success"}
              className="bg-gold text-black hover:bg-gold-light transition-all duration-300 px-8 py-5 md:py-4 text-sm tracking-[0.2em] uppercase rounded-none whitespace-nowrap"
            >
              {status === "loading" ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Subscribing...
                </span>
              ) : status === "success" ? (
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Subscribed!
                </span>
              ) : (
                content.buttonLabel
              )}
            </Button>
          </form>

          {message && (
            <p
              className={cn(
                "mt-4 text-sm transition-opacity",
                status === "success" ? "text-gold" : "text-red-400"
              )}
              role="alert"
            >
              {status === "success" && <CheckCircle className="inline w-4 h-4 mr-1" />}
              {status === "error" && <AlertCircle className="inline w-4 h-4 mr-1" />}
              {message}
            </p>
          )}

          <p className="text-white/40 text-[10px] md:text-xs mt-6 md:mt-8 max-w-sm mx-auto">
            {renderDisclaimer(content.disclaimer)}
          </p>
        </div>
      </div>
    </section>
  )
}
