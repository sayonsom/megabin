const TELEMETRY_STORAGE_KEY = 'megabin_dashboard_state_v1';
const TELEMETRY_EVENT = 'megabin:dashboard-state';

const COMPLIANCE_TEMPLATE = {
  fips1403: {
    label: 'FIPS 140-3',
    status: 'idle',
    summary: 'Awaiting enclave boot.',
  },
  soc2: {
    label: 'SOC 2',
    status: 'idle',
    summary: 'Control evidence not yet collected.',
  },
  hipaa: {
    label: 'HIPAA',
    status: 'idle',
    summary: 'PHI handling policy not yet validated.',
  },
  itar: {
    label: 'ITAR',
    status: 'idle',
    summary: 'Export-control guardrails not yet checked.',
  },
};

const PIPELINE_TEMPLATE = {
  kms: {
    label: 'Enterprise KMS',
    status: 'idle',
    summary: 'Waiting for session bootstrap.',
  },
  boundary: {
    label: 'Zero-Knowledge Boundary',
    status: 'idle',
    summary: 'No active enclave boundary.',
  },
  dlp: {
    label: 'DLP Broker',
    status: 'idle',
    summary: 'Sensitive content screening is offline.',
  },
  gateway: {
    label: 'LLM Gateway',
    status: 'idle',
    summary: 'No prompts are currently in transit.',
  },
};

const BASE_TELEMETRY_STATE = {
  session: {
    id: null,
    status: 'idle',
    stageLabel: 'Awaiting protected file',
    fileName: 'No active asset',
    fileSizeBytes: 0,
    fileType: 'Unknown',
    classification: 'No active policy envelope',
    startedAt: null,
    lastActivityAt: null,
  },
  compliance: COMPLIANCE_TEMPLATE,
  pipeline: PIPELINE_TEMPLATE,
  metrics: {
    filesProcessed: 0,
    keysInjected: 0,
    piiObjectsScrubbed: 0,
    promptsScreened: 0,
    alertsRaised: 0,
  },
  logs: [],
  lastAlert: null,
  alertPulseAt: null,
  updatedAt: null,
};

function hasWindow() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function mergeSection(template, current = {}) {
  return Object.fromEntries(
    Object.entries(template).map(([key, baseValue]) => [
      key,
      {
        ...baseValue,
        ...(current[key] || {}),
      },
    ]),
  );
}

function hydrateState(rawState = {}) {
  return {
    ...deepClone(BASE_TELEMETRY_STATE),
    ...rawState,
    session: {
      ...deepClone(BASE_TELEMETRY_STATE.session),
      ...(rawState.session || {}),
    },
    compliance: mergeSection(COMPLIANCE_TEMPLATE, rawState.compliance),
    pipeline: mergeSection(PIPELINE_TEMPLATE, rawState.pipeline),
    metrics: {
      ...deepClone(BASE_TELEMETRY_STATE.metrics),
      ...(rawState.metrics || {}),
    },
    logs: Array.isArray(rawState.logs) ? rawState.logs : [],
  };
}

export function getTelemetryState() {
  if (!hasWindow()) {
    return deepClone(BASE_TELEMETRY_STATE);
  }

  try {
    const rawState = window.localStorage.getItem(TELEMETRY_STORAGE_KEY);
    if (!rawState) {
      return deepClone(BASE_TELEMETRY_STATE);
    }

    return hydrateState(JSON.parse(rawState));
  } catch {
    return deepClone(BASE_TELEMETRY_STATE);
  }
}

function publishTelemetryState(nextState) {
  if (!hasWindow()) {
    return nextState;
  }

  const hydratedState = hydrateState(nextState);
  window.localStorage.setItem(TELEMETRY_STORAGE_KEY, JSON.stringify(hydratedState));
  window.dispatchEvent(
    new CustomEvent(TELEMETRY_EVENT, {
      detail: hydratedState,
    }),
  );
  return hydratedState;
}

export function updateTelemetryState(mutator) {
  const currentState = getTelemetryState();
  const nextState = hydrateState(mutator(deepClone(currentState)) || currentState);
  nextState.updatedAt = new Date().toISOString();
  return publishTelemetryState(nextState);
}

export function resetTelemetryState(sessionPayload) {
  const nextState = hydrateState({
    ...deepClone(BASE_TELEMETRY_STATE),
    session: {
      id: crypto.randomUUID(),
      status: 'booting',
      stageLabel: 'Preparing protected enclave',
      fileName: sessionPayload.fileName,
      fileSizeBytes: sessionPayload.fileSizeBytes,
      fileType: sessionPayload.fileType,
      classification: sessionPayload.classification,
      startedAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
    },
    metrics: {
      ...deepClone(BASE_TELEMETRY_STATE.metrics),
      filesProcessed: 1,
    },
  });

  nextState.updatedAt = new Date().toISOString();
  return publishTelemetryState(nextState);
}

export function subscribeToTelemetryState(callback) {
  if (!hasWindow()) {
    return () => {};
  }

  const handleStorage = (event) => {
    if (event.key !== TELEMETRY_STORAGE_KEY || !event.newValue) {
      return;
    }

    try {
      callback(hydrateState(JSON.parse(event.newValue)));
    } catch {
      callback(getTelemetryState());
    }
  };

  const handleCustomEvent = (event) => {
    callback(hydrateState(event.detail));
  };

  window.addEventListener('storage', handleStorage);
  window.addEventListener(TELEMETRY_EVENT, handleCustomEvent);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(TELEMETRY_EVENT, handleCustomEvent);
  };
}

export function updateSessionState(sessionPatch) {
  return updateTelemetryState((state) => ({
    ...state,
    session: {
      ...state.session,
      ...sessionPatch,
      lastActivityAt: new Date().toISOString(),
    },
  }));
}

export function updateComplianceState(key, patch) {
  return updateTelemetryState((state) => ({
    ...state,
    compliance: {
      ...state.compliance,
      [key]: {
        ...state.compliance[key],
        ...patch,
      },
    },
  }));
}

export function updatePipelineState(key, patch) {
  return updateTelemetryState((state) => ({
    ...state,
    pipeline: {
      ...state.pipeline,
      [key]: {
        ...state.pipeline[key],
        ...patch,
      },
    },
  }));
}

export function incrementTelemetryMetric(metricKey, amount = 1) {
  return updateTelemetryState((state) => ({
    ...state,
    metrics: {
      ...state.metrics,
      [metricKey]: (state.metrics[metricKey] || 0) + amount,
    },
  }));
}

export function appendTelemetryLog({
  severity = 'INFO',
  category = 'SYSTEM',
  title,
  message,
  details = {},
}) {
  const entry = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    severity,
    category,
    title,
    message,
    details,
  };

  return updateTelemetryState((state) => ({
    ...state,
    logs: [...state.logs, entry].slice(-80),
    session: {
      ...state.session,
      lastActivityAt: entry.timestamp,
    },
  }));
}

export function raiseTelemetryAlert({
  title,
  message,
  scrubbedCount,
  piiTypes,
  details = {},
}) {
  const raisedAt = new Date().toISOString();
  const alert = {
    id: crypto.randomUUID(),
    title,
    message,
    scrubbedCount,
    piiTypes,
    raisedAt,
    details,
  };

  return updateTelemetryState((state) => ({
    ...state,
    metrics: {
      ...state.metrics,
      piiObjectsScrubbed: state.metrics.piiObjectsScrubbed + scrubbedCount,
      alertsRaised: state.metrics.alertsRaised + 1,
    },
    lastAlert: alert,
    alertPulseAt: raisedAt,
    session: {
      ...state.session,
      lastActivityAt: raisedAt,
    },
  }));
}

export function clearTelemetryState() {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.removeItem(TELEMETRY_STORAGE_KEY);
  window.dispatchEvent(
    new CustomEvent(TELEMETRY_EVENT, {
      detail: deepClone(BASE_TELEMETRY_STATE),
    }),
  );
}

export function formatFileSize(fileSizeBytes) {
  if (!fileSizeBytes) {
    return '0 KB';
  }

  if (fileSizeBytes >= 1024 * 1024) {
    return `${(fileSizeBytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  return `${(fileSizeBytes / 1024).toFixed(2)} KB`;
}

export function getTelemetryStorageKey() {
  return TELEMETRY_STORAGE_KEY;
}
