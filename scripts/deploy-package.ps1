<# deploy-package.ps1
Builds the app with PRODUCTION env values and packages a cPanel upload zip.

Why this exists:
  - The cPanel host cannot run `npm run build` (Turbopack thread crash) -> we build locally.
  - `.env.local` contains dev URLs (localhost). If present during `next build`,
    Next.js loads it BEFORE `.env.production`, so http://localhost:3000 would be
    baked into client bundles -> admin API calls break on the live site.
  - This script hides `.env.local`, builds, verifies no dev URL leaked, then zips
    the deployable output (source + .next production output, minus cache/dev).

Server side (cPanel), AFTER uploading deploy-app.zip:
  cd /home/safariperfumes/repositories/safari-website
  npm install --ignore-scripts
  npx prisma generate              # REQUIRED: installs the LINUX query engine
  npx tsx --env-file=.env prisma/apply-migration.ts   # creates priceupdatelog
  # Restart the Node.js app from cPanel UI. Do NOT run `npm run build` there.

Usage:
  powershell -ExecutionPolicy Bypass -File scripts\deploy-package.ps1
  powershell -ExecutionPolicy Bypass -File scripts\deploy-package.ps1 -SkipBuild
#>

param([switch]$SkipBuild)

$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')

$root      = Get-Location
$envLocal  = Join-Path $root '.env.local'
$envBak    = Join-Path $root '.env.local.deploybak'
$outZip    = Join-Path $root 'deploy-app.zip'
$stage     = Join-Path $root 'deploy-app'

# 1. Hide .env.local so the production build never bakes dev URLs.
$hadEnvLocal = Test-Path $envLocal
if ($hadEnvLocal) {
  if (Test-Path $envBak) { Remove-Item $envBak -Force }
  Move-Item $envLocal $envBak
}

# The cPanel DATABASE_URL in .env/.env.production is only reachable FROM cPanel,
# so a local production build cannot run generateStaticParams / page-data collection
# against it. Point DATABASE_URL at the local MySQL (read from .env.local before we
# moved it) so the build can collect page data; NEXT_PUBLIC_* values still come from
# the production .env, and the uploaded .next server code reads the real DATABASE_URL
# from the cPanel environment at runtime.
$localDbUrl = if ($hadEnvLocal -and (Select-String -Path $envBak -Pattern '^DATABASE_URL=' -Quiet)) {
  (Select-String -Path $envBak -Pattern '^DATABASE_URL=' | Select-Object -First 1).Line
}
$envProdLocal = Join-Path $root '.env.production.local'
if (-not $SkipBuild -and $localDbUrl) {
  Set-Content -Path $envProdLocal -Value $localDbUrl -NoNewline
  Write-Host '>> Temporary .env.production.local -> DATABASE_URL points to LOCAL MySQL (build-time only)' -ForegroundColor DarkYellow
}

try {
  if (-not $SkipBuild) {
    Write-Host '>> npm run build (production env)' -ForegroundColor Cyan
    npm run build
    if ($LASTEXITCODE -ne 0) { throw 'npm run build failed' }
  }

  # 2. Sanity: no dev URL baked into client bundles.
  #    Note: some Next.js framework chunks contain a harmless `startsWith("http://localhost")`
  #    referrer check - that is framework code, not a baked env var. Only `localhost:3000`
  #    (the actual dev URL from .env.local) is a real failure.
  $bad = Get-ChildItem "$root\.next\static" -Recurse -Filter '*.js' -ErrorAction SilentlyContinue |
         Select-String -Pattern 'localhost:3000' -List
  if ($bad) {
    throw "NEXT_PUBLIC dev URL baked into client bundles. Check .env.local was hidden during build."
  }
  Write-Host '>> Baked env check: OK (no localhost:3000 in client bundles)' -ForegroundColor Green

  # 3. Stage the deploy bundle.
  if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
  New-Item -ItemType Directory -Path $stage | Out-Null

  foreach ($f in @('server.js','next.config.js','package.json','package-lock.json','tsconfig.json','next-env.d.ts','postcss.config.mjs','tailwind.config.js')) {
    if (Test-Path (Join-Path $root $f)) { Copy-Item (Join-Path $root $f) (Join-Path $stage $f) }
  }
  foreach ($d in @('public','src','prisma')) {
    if (Test-Path (Join-Path $root $d)) { Copy-Item (Join-Path $root $d) (Join-Path $stage $d) -Recurse }
  }

  # .next production output only (server / static / types + root manifests). Exclude cache & dev.
  $nextStage = Join-Path $stage '.next'
  $nextSrc   = Join-Path $root  '.next'
  foreach ($d in @('server','static','types')) {
    if (Test-Path (Join-Path $nextSrc $d)) { Copy-Item (Join-Path $nextSrc $d) (Join-Path $nextStage $d) -Recurse }
  }
  Get-ChildItem $nextSrc -File | Copy-Item -Destination $nextStage

  # 4. Zip it.
  if (Test-Path $outZip) { Remove-Item $outZip -Force }
  Compress-Archive -Path (Join-Path $stage '*') -DestinationPath $outZip -CompressionLevel Optimal
  $sizeMb = [math]::Round((Get-Item $outZip).Length / 1MB, 1)
  Write-Host ">> Bundle ready: $outZip ($sizeMb MB)" -ForegroundColor Green
  Write-Host '   Upload via cPanel File Manager, then run the server-side steps below.'
} finally {
  if (Test-Path $envProdLocal) { Remove-Item $envProdLocal -Force }
  if ($hadEnvLocal -and (Test-Path $envBak) -and -not (Test-Path $envLocal)) {
    Move-Item $envBak $envLocal
  }
}