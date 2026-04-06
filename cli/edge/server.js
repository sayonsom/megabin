#!/usr/bin/env node
import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');
const EDGE_DATA_DIR = path.join(ROOT_DIR, '.megabin-edge');
const EDGE_PORT = Number(process.env.MEGABIN_EDGE_PORT || 8787);
const WINDOWS_ONLY_MESSAGE =
  'Megabin Edge extractors are Windows-only because they rely on the Samsung-authorized local Office and clipboard environment.';

const sessions = new Map();

function ensureEdgeDataDir() {
  fs.mkdirSync(EDGE_DATA_DIR, { recursive: true });
}

function jsonResponse(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
  });
  response.end(JSON.stringify(payload, null, 2));
}

function textResponse(response, statusCode, message) {
  response.writeHead(statusCode, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
  });
  response.end(message);
}

function parseRequestBody(request) {
  return new Promise((resolve, reject) => {
    let rawBody = '';
    request.on('data', (chunk) => {
      rawBody += chunk;
      if (rawBody.length > 2 * 1024 * 1024) {
        reject(new Error('Request body too large.'));
      }
    });
    request.on('end', () => {
      if (!rawBody) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(rawBody));
      } catch {
        reject(new Error('Invalid JSON body.'));
      }
    });
    request.on('error', reject);
  });
}

function detectOfficeKind(filePath) {
  const extension = path.extname(filePath || '').toLowerCase();
  if (['.xls', '.xlsx', '.xlsm', '.csv'].includes(extension)) {
    return 'excel';
  }
  if (['.doc', '.docx', '.docm', '.rtf'].includes(extension)) {
    return 'word';
  }
  if (['.ppt', '.pptx', '.pptm'].includes(extension)) {
    return 'powerpoint';
  }
  return null;
}

function chunkLines(text, maxChunks = 80) {
  return String(text || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, maxChunks);
}

function buildDocumentChunks(document) {
  if (!document) {
    return [];
  }

  if (document.kind === 'excel') {
    return (document.sheets || []).flatMap((sheet) => {
      const rows = (sheet.previewRows || []).map((row) => `${sheet.name}: ${row.join(' | ')}`);
      return [`Sheet ${sheet.name}`, ...rows];
    });
  }

  if (document.kind === 'word') {
    const paragraphs = (document.paragraphs || []).map((paragraph) => `Paragraph: ${paragraph}`);
    const tables = (document.tables || []).flatMap((table) =>
      (table.rows || []).map((row) => `Table ${table.index}: ${row.join(' | ')}`),
    );
    return [...paragraphs, ...tables];
  }

  if (document.kind === 'powerpoint') {
    return (document.slides || []).flatMap((slide) => {
      const blocks = (slide.textBlocks || []).map((block) => `Slide ${slide.index}: ${block}`);
      const notes = (slide.notes || []).map((note) => `Slide ${slide.index} note: ${note}`);
      return [`Slide ${slide.index}: ${slide.title || 'Untitled slide'}`, ...blocks, ...notes];
    });
  }

  if (document.kind === 'clipboard') {
    return chunkLines(document.text);
  }

  return chunkLines(JSON.stringify(document, null, 2));
}

function buildSessionSummary(document) {
  if (!document) {
    return 'No extracted document.';
  }

  if (document.kind === 'excel') {
    return `Workbook with ${(document.sheets || []).length} sheet(s).`;
  }

  if (document.kind === 'word') {
    return `Word document with ${(document.paragraphs || []).length} paragraph(s) and ${(document.tables || []).length} table(s).`;
  }

  if (document.kind === 'powerpoint') {
    return `Presentation with ${(document.slides || []).length} slide(s).`;
  }

  if (document.kind === 'clipboard') {
    return `${document.sourceType || 'Clipboard'} import with ${(document.lines || []).length} captured line(s).`;
  }

  return 'Extracted document ready for query.';
}

function scoreChunk(chunk, tokens) {
  const loweredChunk = chunk.toLowerCase();
  return tokens.reduce((score, token) => (loweredChunk.includes(token) ? score + 1 : score), 0);
}

function buildHeuristicAnswer(session, question) {
  const tokens = question
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .filter((token) => token.length > 2);

  const scoredChunks = session.chunks
    .map((chunk) => ({
      chunk,
      score: scoreChunk(chunk, tokens),
    }))
    .sort((left, right) => right.score - left.score);

  const selectedChunks = scoredChunks.filter((item) => item.score > 0).slice(0, 6);
  if (selectedChunks.length === 0) {
    return {
      backend: 'local-heuristic',
      answer:
        'Megabin Edge extracted the document successfully, but the local heuristic query engine did not find a strong match. Review the preview snippets or enable an approved LLM backend later.',
      citations: session.chunks.slice(0, 6),
    };
  }

  return {
    backend: 'local-heuristic',
    answer: `Top matching snippets for "${question}":\n\n${selectedChunks
      .map((item, index) => `${index + 1}. ${item.chunk}`)
      .join('\n')}`,
    citations: selectedChunks.map((item) => item.chunk),
  };
}

async function maybeQueryOpenAI(session, question) {
  if (!process.env.OPENAI_API_KEY || typeof fetch !== 'function') {
    return null;
  }

  const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
  const context = session.chunks.slice(0, 120).join('\n');

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: 'system',
          content:
            'You are Megabin Edge. Answer only from the provided extracted enterprise document context. If the answer is not supported, say so clearly.',
        },
        {
          role: 'user',
          content: `Document context:\n${context}\n\nQuestion:\n${question}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed: ${errorText}`);
  }

  const data = await response.json();
  return {
    backend: `openai:${model}`,
    answer: data.output_text || 'No output_text returned from OpenAI.',
    citations: session.chunks.slice(0, 8),
  };
}

function sessionSnapshotPath(sessionId) {
  return path.join(EDGE_DATA_DIR, `${sessionId}.json`);
}

function storeSession(session) {
  sessions.set(session.id, session);
  fs.writeFileSync(sessionSnapshotPath(session.id), JSON.stringify(session, null, 2));
}

function summarizeSession(session) {
  return {
    id: session.id,
    createdAt: session.createdAt,
    adapter: session.adapter,
    source: session.source,
    summary: session.summary,
    documentKind: session.document.kind,
    title: session.document.title || session.source.filePath || 'Untitled capture',
    chunkCount: session.chunks.length,
    bytesCaptured: Buffer.byteLength(JSON.stringify(session.document), 'utf8'),
  };
}

function createSession({ adapter, source, document }) {
  const session = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    adapter,
    source,
    document,
    chunks: buildDocumentChunks(document),
    summary: buildSessionSummary(document),
  };

  storeSession(session);
  return session;
}

function runPowerShell(scriptName, args = []) {
  if (process.platform !== 'win32') {
    throw new Error(WINDOWS_ONLY_MESSAGE);
  }

  const scriptPath = path.join(__dirname, 'scripts', scriptName);
  return new Promise((resolve, reject) => {
    const child = spawn(
      'powershell.exe',
      ['-NoLogo', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', scriptPath, ...args],
      {
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', reject);

    child.on('exit', (code) => {
      try {
        const parsed = JSON.parse(stdout.trim());
        if (code === 0 && parsed.ok) {
          resolve(parsed.document);
          return;
        }

        reject(new Error(parsed.error || stderr.trim() || 'PowerShell extractor failed.'));
      } catch {
        reject(new Error(stderr.trim() || stdout.trim() || 'PowerShell extractor failed.'));
      }
    });
  });
}

async function extractOfficeSession(payload) {
  const mode = payload.mode || 'active';
  const filePath = payload.filePath || '';
  const kind = payload.kind || detectOfficeKind(filePath);

  if (!kind) {
    throw new Error('Could not determine Office kind. Pass kind=excel|word|powerpoint or provide a matching file extension.');
  }

  if (mode === 'file' && !filePath) {
    throw new Error('filePath is required when mode=file.');
  }

  const args = ['-Kind', kind, '-Mode', mode];
  if (filePath) {
    args.push('-Path', filePath);
  }

  const document = await runPowerShell('extract-office.ps1', args);
  return createSession({
    adapter: `office:${kind}:${mode}`,
    source: {
      mode,
      kind,
      filePath: filePath || null,
    },
    document,
  });
}

async function extractClipboardSession(payload) {
  const sourceType = payload.sourceType || 'pdf';
  const title = payload.title || '';
  const args = ['-SourceType', sourceType];
  if (title) {
    args.push('-Title', title);
  }

  const document = await runPowerShell('import-clipboard.ps1', args);
  return createSession({
    adapter: `clipboard:${sourceType}`,
    source: {
      mode: 'clipboard',
      sourceType,
      title: title || null,
    },
    document,
  });
}

function printDoctor() {
  const doctor = {
    platform: process.platform,
    edgePort: EDGE_PORT,
    windowsReady: process.platform === 'win32',
    notes: [
      'Excel, Word, and PowerPoint extraction require Microsoft Office desktop apps on the Samsung laptop.',
      'Use mode=active after manually opening a NASCA-authorized file in Office for the safest workflow.',
      'PDF support is clipboard-based for the MVP: open the PDF in the approved viewer, Ctrl+A / Ctrl+C, then POST /extract/clipboard.',
      'OPENAI_API_KEY is optional. Without it, /query uses a local heuristic responder only.',
    ],
  };

  console.log(JSON.stringify(doctor, null, 2));
}

async function handleRequest(request, response) {
  const requestUrl = new URL(request.url, `http://${request.headers.host || 'localhost'}`);

  if (request.method === 'OPTIONS') {
    jsonResponse(response, 204, {});
    return;
  }

  if (request.method === 'GET' && requestUrl.pathname === '/health') {
    jsonResponse(response, 200, {
      ok: true,
      service: 'megabin-edge',
      platform: process.platform,
      windowsReady: process.platform === 'win32',
      activeSessions: sessions.size,
    });
    return;
  }

  if (request.method === 'GET' && requestUrl.pathname === '/adapters') {
    jsonResponse(response, 200, {
      office: {
        excel: ['active', 'file'],
        word: ['active', 'file'],
        powerpoint: ['active', 'file'],
      },
      clipboard: {
        pdf: ['clipboard'],
      },
    });
    return;
  }

  if (request.method === 'GET' && requestUrl.pathname === '/sessions') {
    jsonResponse(response, 200, {
      sessions: [...sessions.values()].map(summarizeSession),
    });
    return;
  }

  if (request.method === 'GET' && requestUrl.pathname.startsWith('/sessions/')) {
    const sessionId = requestUrl.pathname.split('/')[2];
    const session = sessions.get(sessionId);
    if (!session) {
      jsonResponse(response, 404, { ok: false, error: `No session found for ${sessionId}.` });
      return;
    }

    jsonResponse(response, 200, {
      session: {
        ...summarizeSession(session),
        chunkPreview: session.chunks.slice(0, 20),
        document: session.document,
      },
    });
    return;
  }

  if (request.method === 'DELETE' && requestUrl.pathname.startsWith('/sessions/')) {
    const sessionId = requestUrl.pathname.split('/')[2];
    sessions.delete(sessionId);
    fs.rmSync(sessionSnapshotPath(sessionId), { force: true });
    jsonResponse(response, 200, { ok: true, deleted: sessionId });
    return;
  }

  if (request.method === 'POST' && requestUrl.pathname === '/extract/office') {
    const payload = await parseRequestBody(request);
    const session = await extractOfficeSession(payload);
    jsonResponse(response, 200, {
      ok: true,
      session: {
        ...summarizeSession(session),
        chunkPreview: session.chunks.slice(0, 10),
      },
    });
    return;
  }

  if (request.method === 'POST' && requestUrl.pathname === '/extract/clipboard') {
    const payload = await parseRequestBody(request);
    const session = await extractClipboardSession(payload);
    jsonResponse(response, 200, {
      ok: true,
      session: {
        ...summarizeSession(session),
        chunkPreview: session.chunks.slice(0, 10),
      },
    });
    return;
  }

  if (request.method === 'POST' && requestUrl.pathname === '/query') {
    const payload = await parseRequestBody(request);
    const session = sessions.get(payload.sessionId);
    if (!session) {
      jsonResponse(response, 404, { ok: false, error: `No session found for ${payload.sessionId}.` });
      return;
    }

    if (!payload.question || !String(payload.question).trim()) {
      jsonResponse(response, 400, { ok: false, error: 'question is required.' });
      return;
    }

    let answerPayload;
    try {
      answerPayload = (await maybeQueryOpenAI(session, String(payload.question).trim())) || buildHeuristicAnswer(session, String(payload.question).trim());
    } catch (error) {
      answerPayload = {
        backend: 'local-heuristic-fallback',
        warning: error.message,
        ...buildHeuristicAnswer(session, String(payload.question).trim()),
      };
    }

    jsonResponse(response, 200, {
      ok: true,
      session: summarizeSession(session),
      ...answerPayload,
    });
    return;
  }

  if (request.method === 'GET' && requestUrl.pathname === '/') {
    textResponse(
      response,
      200,
      [
        'Megabin Edge',
        '',
        'GET  /health',
        'GET  /adapters',
        'GET  /sessions',
        'GET  /sessions/:id',
        'POST /extract/office',
        'POST /extract/clipboard',
        'POST /query',
        '',
        'Use `npm run edge:doctor` for setup notes.',
      ].join('\n'),
    );
    return;
  }

  jsonResponse(response, 404, {
    ok: false,
    error: `No route for ${request.method} ${requestUrl.pathname}`,
  });
}

async function main() {
  ensureEdgeDataDir();

  if (process.argv.includes('--doctor')) {
    printDoctor();
    return;
  }

  const server = http.createServer((request, response) => {
    handleRequest(request, response).catch((error) => {
      jsonResponse(response, 500, {
        ok: false,
        error: error.message,
      });
    });
  });

  server.listen(EDGE_PORT, '127.0.0.1', () => {
    console.log(`Megabin Edge listening on http://127.0.0.1:${EDGE_PORT}`);
    console.log('Use mode=active after manually opening a Samsung-authorized file in Office for the safest workflow.');
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
