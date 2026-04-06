# Megabin Edge

Megabin Edge is a Windows-first local service for Samsung-managed laptops.

Its job is simple:

- stay inside the already-authorized Samsung endpoint
- use the local Office and clipboard environment that NASCA already permits
- normalize the content into a document session
- keep a queryable, auditable working representation on the laptop

This is **not** a DRM bypass tool.
It only works after Samsung's existing controls have already allowed the user to open or view the file.

## What works today

- Excel: active workbook extraction or file-open extraction
- Word: active document extraction or file-open extraction
- PowerPoint: active presentation extraction or file-open extraction
- PDF: clipboard import workflow

## Why the workflows differ

Excel, Word, and PowerPoint expose a rich object model through local Office automation.
That lets Megabin Edge read the authorized in-memory document state from the Samsung laptop.

PDF does not have a stable, sanctioned object model across viewers, so the MVP uses a user-assisted clipboard path:

1. open the authorized PDF in the approved viewer
2. select the text you are allowed to see
3. copy it to the clipboard
4. let Megabin Edge ingest only that clipboard buffer

## Setup on the Samsung laptop

1. Install Node.js 18 or later.
2. Install Microsoft Office desktop apps if you want Excel, Word, and PowerPoint extraction.
3. Keep the Samsung laptop connected to the network or VPN state that NASCA requires.
4. From this repo, run:

```bash
npm install
npm run edge:doctor
npm run edge:start
```

The service listens on `http://127.0.0.1:8787` by default.

## Exact Excel workflow

Recommended path:

1. Open the NASCA-protected workbook manually in Excel on the Samsung laptop.
2. Confirm that Excel can display the workbook normally for your Samsung user.
3. In a separate terminal, call:

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri http://127.0.0.1:8787/extract/office `
  -ContentType 'application/json' `
  -Body '{"kind":"excel","mode":"active"}'
```

That attaches to the already-open, already-authorized Excel session.

Experimental alternate path:

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri http://127.0.0.1:8787/extract/office `
  -ContentType 'application/json' `
  -Body '{"kind":"excel","mode":"file","filePath":"C:\\Secure\\Budget_Q4.xlsx"}'
```

Use `mode=file` only if your NASCA policy allows Office automation to open the file directly.

## Exact Word workflow

1. Open the NASCA-protected document manually in Word.
2. Confirm the document is visible.
3. Call:

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri http://127.0.0.1:8787/extract/office `
  -ContentType 'application/json' `
  -Body '{"kind":"word","mode":"active"}'
```

## Exact PowerPoint workflow

1. Open the NASCA-protected presentation manually in PowerPoint.
2. Confirm the slides are visible.
3. Call:

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri http://127.0.0.1:8787/extract/office `
  -ContentType 'application/json' `
  -Body '{"kind":"powerpoint","mode":"active"}'
```

## Exact PDF workflow

This is the MVP-safe path.

1. Open the NASCA-protected PDF in the approved Samsung viewer.
2. Select the text you are allowed to view.
3. Copy it with `Ctrl+C`.
4. Call:

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri http://127.0.0.1:8787/extract/clipboard `
  -ContentType 'application/json' `
  -Body '{"sourceType":"pdf","title":"Protected PDF import"}'
```

If the viewer supports `Ctrl+A`, use it first. If not, copy page by page and re-import.

## Querying a captured session

Every extraction call returns a `session.id`.
Use that session id to ask questions:

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri http://127.0.0.1:8787/query `
  -ContentType 'application/json' `
  -Body '{"sessionId":"PUT-SESSION-ID-HERE","question":"Summarize the top risks in this document."}'
```

By default, `/query` uses a local heuristic responder.

If you explicitly choose to connect an external LLM later, set:

```bash
OPENAI_API_KEY=...
OPENAI_MODEL=...
```

Do that only if Samsung approves the outbound data path.

## Inspecting sessions

List sessions:

```powershell
Invoke-RestMethod -Method Get -Uri http://127.0.0.1:8787/sessions
```

Get one session:

```powershell
Invoke-RestMethod -Method Get -Uri http://127.0.0.1:8787/sessions/PUT-SESSION-ID-HERE
```

Delete one session:

```powershell
Invoke-RestMethod -Method Delete -Uri http://127.0.0.1:8787/sessions/PUT-SESSION-ID-HERE
```

Megabin Edge also writes session snapshots to `.megabin-edge/`.

## Demo guidance for Samsung

For the safest and most defensible live demo:

1. Keep the file on the Samsung laptop.
2. Open the protected file manually through the normal NASCA path.
3. Use `mode=active` for Office files.
4. Use clipboard import for PDFs.
5. Treat the local Edge as the data plane and your cloud dashboard as the control plane.

The line to use in the room is:

"Megabin is reading the document only after Samsung has already authorized it on this endpoint."
