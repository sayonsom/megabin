const EDGE_BASE_URL = 'http://127.0.0.1:8787';

async function requestEdge(path, options = {}) {
  const response = await fetch(`${EDGE_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  let payload = {};
  try {
    payload = await response.json();
  } catch {
    payload = {};
  }

  if (!response.ok || payload.ok === false) {
    throw new Error(payload.error || `Megabin Edge request failed: ${response.status}`);
  }

  return payload;
}

export async function getEdgeHealth() {
  return requestEdge('/health', {
    method: 'GET',
    headers: {},
  });
}

export async function captureActiveOfficeDocument(kind) {
  return requestEdge('/extract/office', {
    method: 'POST',
    body: JSON.stringify({
      kind,
      mode: 'active',
    }),
  });
}

export async function captureClipboardPdf(title = 'Protected PDF import') {
  return requestEdge('/extract/clipboard', {
    method: 'POST',
    body: JSON.stringify({
      sourceType: 'pdf',
      title,
    }),
  });
}

export async function queryEdgeSession(sessionId, question) {
  return requestEdge('/query', {
    method: 'POST',
    body: JSON.stringify({
      sessionId,
      question,
    }),
  });
}

export async function deleteEdgeSession(sessionId) {
  return requestEdge(`/sessions/${sessionId}`, {
    method: 'DELETE',
    headers: {},
  });
}

export { EDGE_BASE_URL };
