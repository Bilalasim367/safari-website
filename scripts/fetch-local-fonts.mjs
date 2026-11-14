/**
 * Downloads the Google Fonts we use into `src/fonts/` so the app can load them
 * with `next/font/local` (no network access during `next build`).
 *
 * Why: Google Fonts now sometimes answers with extension-less
 * `https://fonts.gstatic.com/l/font?kit=...` URLs. Next's Google font loader
 * (next@16.2.4) assumes the URL ends in .woff2/.woff/... and crashes the build
 * with "TypeError: Cannot read properties of null (reading '1')".
 *
 * Run: node scripts/fetch-local-fonts.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

const OUT_DIR = path.join(process.cwd(), 'src', 'fonts')
const SUBSETS = new Set(['latin', 'latin-ext'])

const FAMILIES = [
  { google: 'Playfair Display', slug: 'playfair-display', axis: '400..900', variable: true },
  { google: 'Montserrat', slug: 'montserrat', axis: '100..900', variable: true },
  { google: 'Plus Jakarta Sans', slug: 'plus-jakarta-sans', axis: '200..800', variable: true },
  { google: 'Poppins', slug: 'poppins', axis: '500;600;700', variable: false },
]

function cssUrl(family, axis) {
  return `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:wght@${axis}&display=swap`
}

async function getText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`)
  return res.text()
}

async function getBuffer(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`)
  return Buffer.from(await res.arrayBuffer())
}

function parseFaces(css) {
  const parts = css.split(/\/\*\s*([a-z0-9-]+)\s*\*\//i)
  const faces = []
  for (let i = 1; i < parts.length; i += 2) {
    const subset = parts[i]
    const block = parts[i + 1] || ''
    const weight = /font-weight:\s*([^;]+);/.exec(block)?.[1]?.trim()
    const style = /font-style:\s*([^;]+);/.exec(block)?.[1]?.trim() ?? 'normal'
    const url = /src:\s*url\(([^)]+)\)/.exec(block)?.[1]
    if (url && weight && SUBSETS.has(subset)) faces.push({ subset, weight, style, url })
  }
  return faces
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const summary = []

  for (const family of FAMILIES) {
    const url = cssUrl(family.google, family.axis)
    const css = await getText(url)
    const faces = parseFaces(css)
    if (!faces.length) throw new Error(`No usable @font-face blocks for ${family.google}`)

    for (const face of faces) {
      const name = family.variable
        ? `${family.slug}-${face.subset}.woff2`
        : `${family.slug}-${face.subset}-${face.weight}.woff2`
      const buffer = await getBuffer(face.url)
      const magic = buffer.subarray(0, 4).toString('latin1')
      if (magic !== 'wOF2') {
        throw new Error(`Not a woff2 file (${magic}) for ${family.google} ${face.subset}: ${face.url}`)
      }
      await writeFile(path.join(OUT_DIR, name), buffer)
      summary.push({
        family: family.google,
        file: name,
        weight: face.weight,
        style: face.style,
        kb: Math.round(buffer.length / 1024),
      })
    }
  }

  console.table(summary)
  console.log(`Saved ${summary.length} files to ${path.relative(process.cwd(), OUT_DIR)}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
