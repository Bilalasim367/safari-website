"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import Script from "next/script"
import { metaTrack } from "@/lib/meta-client"

interface MetaPixelProps {
  pixelId: string | null
  enabled: boolean
}

/**
 * Meta Pixel base code. The admin dashboard is excluded so staff activity is
 * never counted as a customer conversion. Route changes fire an extra
 * PageView because the App Router does not reload the page.
 */
export default function MetaPixel({ pixelId, enabled }: MetaPixelProps) {
  const pathname = usePathname() || ""
  const previousPath = useRef<string | null>(null)

  useEffect(() => {
    if (!enabled || pathname.startsWith("/admin")) return
    if (previousPath.current !== null && previousPath.current !== pathname) {
      metaTrack("PageView")
    }
    previousPath.current = pathname
  }, [pathname, enabled])

  if (!enabled || !pixelId || !/^\d{6,20}$/.test(pixelId)) return null
  if (pathname.startsWith("/admin")) return null

  const snippet = `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}');
fbq('track', 'PageView');`

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: snippet }}
      />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  )
}
