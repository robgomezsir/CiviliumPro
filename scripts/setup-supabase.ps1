$ErrorActionPreference = "Stop"

$envFile = Join-Path $PSScriptRoot "..\apps\web\.env.local"
$content = Get-Content $envFile -Raw

if ($content -match "\[SUA-SENHA\]") {
    Write-Host "ERRO: Substitua [SUA-SENHA] em apps/web/.env.local pela senha do banco."
    Write-Host "Dashboard: https://supabase.com/dashboard/project/xfoizpniywllpgyycska/settings/database"
    exit 1
}

Push-Location (Join-Path $PSScriptRoot "..")
pnpm db:push
Pop-Location

Write-Host "Schema sincronizado com sucesso."
