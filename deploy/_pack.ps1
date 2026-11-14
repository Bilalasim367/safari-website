# Builds the cPanel deploy zip (no node_modules, no .env, no public/uploads)
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$out = Join-Path $PSScriptRoot 'safari-perfumes-deploy-20261114.zip'
if (Test-Path $out) { Remove-Item $out -Force }

$include = @(
  '.next', 'prisma', 'src', 'public',
  'package.json', 'package-lock.json', 'server.js', 'next.config.js',
  'postcss.config.mjs', 'tailwind.config.js', 'tsconfig.json',
  'next-env.d.ts', '.env.example', 'DEPLOY-README.txt', 'after-upload.sh',
  'deploy/.env'
)
$skip = @('public/uploads')
# local path (relative to project root) -> path inside the archive
$rename = @{ 'deploy/.env' = '.env' }

$files = New-Object System.Collections.Generic.List[System.IO.FileInfo]
foreach ($item in $include) {
  $full = Join-Path $root $item
  if (-not (Test-Path -LiteralPath $full)) { throw "Missing: $item" }
  if (Test-Path -LiteralPath $full -PathType Leaf) {
    $files.Add((Get-Item -LiteralPath $full))
  } else {
    Get-ChildItem -LiteralPath $full -Recurse -File -Force | ForEach-Object { $files.Add($_) }
  }
}

$zip = [System.IO.Compression.ZipFile]::Open($out, [System.IO.Compression.ZipArchiveMode]::Create)
$added = 0
try {
  foreach ($f in $files) {
    $rel = $f.FullName.Substring($root.Length + 1).Replace('\', '/')
    if ($rename.ContainsKey($rel)) { $rel = $rename[$rel] }
    $skipped = $false
    foreach ($s in $skip) {
      if ($rel -eq $s -or $rel.StartsWith($s + '/')) { $skipped = $true; break }
    }
    if ($skipped) { continue }
    [void][System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
      $zip, $f.FullName, $rel, [System.IO.Compression.CompressionLevel]::Optimal)
    $added++
  }
} finally {
  $zip.Dispose()
}

$info = Get-Item $out
"entries=$added sizeMB=$([math]::Round($info.Length/1MB,1)) path=$($info.FullName)"
