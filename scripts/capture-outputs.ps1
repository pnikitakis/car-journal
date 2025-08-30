$ErrorActionPreference = 'Stop'
function Run-Step($name, $cmd) {
  Write-Host "Running $name..." -ForegroundColor Cyan
  "### $name`n" | Out-File -FilePath pr-description.md -Append -Encoding utf8
  try {
    $output = & powershell -NoLogo -NoProfile -Command $cmd 2>&1
    $output | Out-File -FilePath pr-description.md -Append -Encoding utf8
    "`n" | Out-File -FilePath pr-description.md -Append -Encoding utf8
  } catch {
    "ERROR: $_`n" | Out-File -FilePath pr-description.md -Append -Encoding utf8
    throw
  }
}

"# Scaffold: Checks and Build Outputs`n" | Out-File -FilePath pr-description.md -Encoding utf8
Run-Step "pnpm typecheck" "pnpm typecheck"
Run-Step "pnpm lint" "pnpm lint"
Run-Step "pnpm test" "pnpm test"
Run-Step "pnpm -w build" "pnpm -w build"

Write-Host "Outputs captured in pr-description.md" -ForegroundColor Green

