import { NextResponse } from 'next/server'
import { readHomepageShowcase } from '@/lib/homepage-showcase-store'

export const runtime = 'nodejs'

export async function GET() {
  const config = readHomepageShowcase()
  return NextResponse.json(config, {
    headers: { 'Cache-Control': 'no-store' },
  })
}