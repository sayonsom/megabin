param(
  [Parameter(Mandatory = $true)]
  [ValidateSet('excel', 'word', 'powerpoint')]
  [string]$Kind,

  [ValidateSet('active', 'file')]
  [string]$Mode = 'active',

  [string]$Path = ''
)

$ErrorActionPreference = 'Stop'

function Clean-Text {
  param([AllowNull()][string]$Value)

  if ([string]::IsNullOrWhiteSpace($Value)) {
    return $null
  }

  return (($Value -replace "[`u0000-`u001F]", ' ') -replace '\s+', ' ').Trim()
}

function Clean-OfficeCell {
  param($CellValue)
  if ($null -eq $CellValue) {
    return ''
  }

  $cleaned = Clean-Text ([string]$CellValue)
  if ($null -eq $cleaned) {
    return ''
  }

  return $cleaned
}

function Emit-Json {
  param([hashtable]$Payload)
  $Payload | ConvertTo-Json -Depth 12 -Compress
}

function Release-ComObject {
  param($ComObject)

  if ($null -ne $ComObject -and [System.Runtime.InteropServices.Marshal]::IsComObject($ComObject)) {
    [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($ComObject)
  }
}

function Get-ActiveObjectSafe {
  param([string]$ProgId)

  try {
    return [System.Runtime.InteropServices.Marshal]::GetActiveObject($ProgId)
  } catch {
    throw "No active $ProgId instance found. Open the protected file manually in Office first, then retry mode=active."
  }
}

function Extract-Excel {
  param($Excel, $Workbook)

  $sheets = @()
  foreach ($worksheet in @($Workbook.Worksheets)) {
    $usedRange = $worksheet.UsedRange
    $rowCount = [int]$usedRange.Rows.Count
    $columnCount = [int]$usedRange.Columns.Count
    $maxRows = [Math]::Min($rowCount, 25)
    $maxColumns = [Math]::Min($columnCount, 12)
    $previewRows = @()

    for ($rowIndex = 1; $rowIndex -le $maxRows; $rowIndex++) {
      $row = @()
      for ($columnIndex = 1; $columnIndex -le $maxColumns; $columnIndex++) {
        $row += (Clean-OfficeCell $usedRange.Item($rowIndex, $columnIndex).Text)
      }

      if (($row -join '').Length -gt 0) {
        $previewRows += ,$row
      }
    }

    $sheets += [ordered]@{
      name = $worksheet.Name
      rowCount = $rowCount
      columnCount = $columnCount
      previewRows = $previewRows
    }

    Release-ComObject $usedRange
    Release-ComObject $worksheet
  }

  return [ordered]@{
    kind = 'excel'
    title = $Workbook.Name
    sheets = $sheets
  }
}

function Extract-Word {
  param($Word, $Document)

  $paragraphs = @()
  foreach ($paragraph in @($Document.Paragraphs)) {
    $text = Clean-Text $paragraph.Range.Text
    if ($null -ne $text) {
      $paragraphs += $text
    }
    Release-ComObject $paragraph
  }

  $tables = @()
  foreach ($table in @($Document.Tables)) {
    $rows = @()
    for ($rowIndex = 1; $rowIndex -le $table.Rows.Count; $rowIndex++) {
      $cells = @()
      for ($columnIndex = 1; $columnIndex -le $table.Columns.Count; $columnIndex++) {
        try {
          $cellText = $table.Cell($rowIndex, $columnIndex).Range.Text
          $cleanedCell = Clean-Text ($cellText -replace [char]7, '' -replace [char]13, ' ')
          if ($null -eq $cleanedCell) {
            $cells += ''
          } else {
            $cells += $cleanedCell
          }
        } catch {
          $cells += ''
        }
      }
      $rows += ,$cells
    }

    $tables += [ordered]@{
      index = $tables.Count + 1
      rows = $rows
    }

    Release-ComObject $table
  }

  return [ordered]@{
    kind = 'word'
    title = $Document.Name
    paragraphs = $paragraphs | Select-Object -First 150
    tables = $tables | Select-Object -First 20
  }
}

function Extract-PowerPoint {
  param($PowerPoint, $Presentation)

  $slides = @()
  foreach ($slide in @($Presentation.Slides)) {
    $textBlocks = @()
    foreach ($shape in @($slide.Shapes)) {
      try {
        if ($shape.HasTextFrame -eq -1 -and $shape.TextFrame.HasText -eq -1) {
          $shapeText = Clean-Text $shape.TextFrame.TextRange.Text
          if ($null -ne $shapeText) {
            $textBlocks += $shapeText
          }
        }
      } catch {
        # Skip shapes without readable text.
      }
      Release-ComObject $shape
    }

    $title = $null
    try {
      $title = Clean-Text $slide.Shapes.Title.TextFrame.TextRange.Text
    } catch {
      $title = $null
    }

    $notes = @()
    try {
      foreach ($notesShape in @($slide.NotesPage.Shapes)) {
        try {
          if ($notesShape.HasTextFrame -eq -1 -and $notesShape.TextFrame.HasText -eq -1) {
            $noteText = Clean-Text $notesShape.TextFrame.TextRange.Text
            if ($null -ne $noteText -and $noteText -ne 'Click to add notes') {
              $notes += $noteText
            }
          }
        } catch {
          # Skip note shapes without readable text.
        }
        Release-ComObject $notesShape
      }
    } catch {
      $notes = @()
    }

    $slides += [ordered]@{
      index = [int]$slide.SlideIndex
      title = $title
      textBlocks = $textBlocks | Select-Object -First 40
      notes = $notes | Select-Object -First 20
    }

    Release-ComObject $slide
  }

  return [ordered]@{
    kind = 'powerpoint'
    title = $Presentation.Name
    slides = $slides
  }
}

$application = $null
$document = $null
$ownsApplication = $false
$ownsDocument = $false

try {
  if ($Kind -eq 'excel') {
    if ($Mode -eq 'active') {
      $application = Get-ActiveObjectSafe 'Excel.Application'
      $document = $application.ActiveWorkbook
      if ($null -eq $document) {
        throw 'No active workbook found in Excel.'
      }
    } else {
      $application = New-Object -ComObject Excel.Application
      $application.Visible = $false
      $application.DisplayAlerts = $false
      $ownsApplication = $true
      $document = $application.Workbooks.Open($Path, 0, $true)
      $ownsDocument = $true
    }

    $payload = Extract-Excel $application $document
  }

  if ($Kind -eq 'word') {
    if ($Mode -eq 'active') {
      $application = Get-ActiveObjectSafe 'Word.Application'
      $document = $application.ActiveDocument
      if ($null -eq $document) {
        throw 'No active document found in Word.'
      }
    } else {
      $application = New-Object -ComObject Word.Application
      $application.Visible = $false
      $ownsApplication = $true
      $document = $application.Documents.Open($Path, $false, $true)
      $ownsDocument = $true
    }

    $payload = Extract-Word $application $document
  }

  if ($Kind -eq 'powerpoint') {
    if ($Mode -eq 'active') {
      $application = Get-ActiveObjectSafe 'PowerPoint.Application'
      $document = $application.ActivePresentation
      if ($null -eq $document) {
        throw 'No active presentation found in PowerPoint.'
      }
    } else {
      $application = New-Object -ComObject PowerPoint.Application
      $ownsApplication = $true
      $document = $application.Presentations.Open($Path, $true, $false, $false)
      $ownsDocument = $true
    }

    $payload = Extract-PowerPoint $application $document
  }

  Emit-Json @{
    ok = $true
    document = $payload
  }
} catch {
  Emit-Json @{
    ok = $false
    error = $_.Exception.Message
    hint = 'Confirm the file is already authorized on this Samsung laptop. For the safest workflow, open the file manually in Excel, Word, or PowerPoint and retry with mode=active.'
  }
  exit 1
} finally {
  if ($ownsDocument -and $null -ne $document) {
    try {
      if ($Kind -eq 'excel') { $document.Close($false) }
      if ($Kind -eq 'word') { $document.Close($false) }
      if ($Kind -eq 'powerpoint') { $document.Close() }
    } catch {
      # Ignore cleanup failures.
    }
  }

  if ($ownsApplication -and $null -ne $application) {
    try {
      $application.Quit()
    } catch {
      # Ignore cleanup failures.
    }
  }

  Release-ComObject $document
  Release-ComObject $application
  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
}
