param(
  [string]$SourceType = 'pdf',
  [string]$Title = ''
)

$ErrorActionPreference = 'Stop'

function Clean-Text {
  param([AllowNull()][string]$Value)

  if ([string]::IsNullOrWhiteSpace($Value)) {
    return $null
  }

  return (($Value -replace "[`u0000-`u001F]", ' ') -replace '\s+', ' ').Trim()
}

function Emit-Json {
  param([hashtable]$Payload)
  $Payload | ConvertTo-Json -Depth 8 -Compress
}

try {
  $clipboardText = Get-Clipboard -Raw
  if ([string]::IsNullOrWhiteSpace($clipboardText)) {
    throw 'Clipboard is empty. Open the authorized PDF in the approved viewer, press Ctrl+A then Ctrl+C, and retry.'
  }

  $lines = @()
  foreach ($line in ($clipboardText -split "`r?`n")) {
    $cleaned = Clean-Text $line
    if ($null -ne $cleaned) {
      $lines += $cleaned
    }
  }

  $resolvedTitle = $Title
  if ([string]::IsNullOrWhiteSpace($resolvedTitle)) {
    $resolvedTitle = "Clipboard import ($SourceType)"
  }

  Emit-Json @{
    ok = $true
    document = @{
      kind = 'clipboard'
      sourceType = $SourceType
      title = $resolvedTitle
      text = ($lines -join "`n")
      lines = ($lines | Select-Object -First 200)
    }
  }
} catch {
  Emit-Json @{
    ok = $false
    error = $_.Exception.Message
    hint = 'The MVP PDF path is user-assisted. Keep the PDF inside the Samsung-approved viewer, copy the text you are authorized to read, and let Megabin Edge ingest only that clipboard content.'
  }
  exit 1
}
