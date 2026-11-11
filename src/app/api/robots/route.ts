import { NextResponse } from 'next/server';
import { SITE_URL } from '@/lib/site';

// Legacy duplicate of the real robots route (`src/app/robots.ts`, served at
// `/robots.txt`). Redirect so crawlers and audits only see one robots policy.
export async function GET() {
  return NextResponse.redirect(`${SITE_URL}/robots.txt`, 308);
}
