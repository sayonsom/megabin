import React, { useEffect, useRef, useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  ChevronRight,
  FileText,
  Lock,
  Send,
  Shield,
  ShieldAlert,
  Sparkles,
  TerminalSquare,
  UploadCloud,
  User,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  appendTelemetryLog,
  formatFileSize,
  getTelemetryState,
  incrementTelemetryMetric,
  raiseTelemetryAlert,
  resetTelemetryState,
  subscribeToTelemetryState,
  updateComplianceState,
  updatePipelineState,
  updateSessionState,
  updateTelemetryState,
} from '../utils/telemetry';

const BOOT_STEPS = [
  {
    line: 'Reserving a Megabin tenancy for the uploaded file.',
    sessionStage: 'Allocating protected workspace',
    log: {
      severity: 'INFO',
      category: 'SESSION',
      title: 'Protected workspace reserved',
      message: 'Megabin accepted the uploaded asset and started a new policy-bound enclave session.',
    },
  },
  {
    line: 'Validating FIPS 140-3 cryptographic boundary.',
    sessionStage: 'Collecting cryptographic attestation',
    compliance: {
      key: 'fips1403',
      status: 'verified',
      summary: 'Signed AES-256 enclave boundary attested against the FIPS 140-3 policy pack.',
    },
    log: {
      severity: 'SUCCESS',
      category: 'COMPLIANCE',
      title: 'FIPS 140-3 attested',
      message: 'Hardware-backed cryptographic boundary passed attestation.',
      details: {
        module: 'AES-256-GCM',
        boundary: 'sealed',
      },
    },
  },
  {
    line: 'Reconciling SOC 2 controls with the active file workflow.',
    sessionStage: 'Verifying governance controls',
    compliance: {
      key: 'soc2',
      status: 'verified',
      summary: 'Prompt logging, operator traceability, and change evidence are all armed for this session.',
    },
    log: {
      severity: 'SUCCESS',
      category: 'COMPLIANCE',
      title: 'SOC 2 controls active',
      message: 'Audit logging, access evidence, and operator traceability are live for this enclave session.',
    },
  },
  {
    line: 'Applying HIPAA handling constraints to outbound model traffic.',
    sessionStage: 'Hardening data handling policies',
    compliance: {
      key: 'hipaa',
      status: 'verified',
      summary: 'Protected health information screening is enforced before any model-bound prompt leaves the enclave.',
    },
    log: {
      severity: 'SUCCESS',
      category: 'COMPLIANCE',
      title: 'HIPAA screening enabled',
      message: 'PHI-aware DLP scrubbing is enabled for every derived prompt.',
    },
  },
  {
    line: 'Checking ITAR export-control boundaries for derived outputs.',
    sessionStage: 'Confirming export controls',
    compliance: {
      key: 'itar',
      status: 'verified',
      summary: 'Export-controlled content remains restricted to derived outputs inside the approved trust boundary.',
    },
    log: {
      severity: 'SUCCESS',
      category: 'COMPLIANCE',
      title: 'ITAR guardrails loaded',
      message: 'Export-control boundaries are pinned to the enclave and raw payload egress is blocked.',
    },
  },
  {
    line: 'Requesting an ephemeral context key from the enterprise KMS.',
    sessionStage: 'Negotiating KMS material',
    pipeline: {
      key: 'kms',
      status: 'active',
      summary: 'KMS handoff in progress. Issuing a policy-bound decryption key.',
    },
    log: {
      severity: 'INFO',
      category: 'KMS',
      title: 'KMS request opened',
      message: 'Megabin requested an ephemeral decryption context from the enterprise key service.',
      details: {
        scope: 'derived-output-only',
        requester: 'Agent Workspace',
      },
    },
  },
  {
    line: 'Injecting policy-bound key material into sealed enclave memory.',
    sessionStage: 'Sealing the enclave',
    pipeline: {
      key: 'kms',
      status: 'verified',
      summary: 'Ephemeral key injected. Read-only derived-output scope enforced with 3600 second TTL.',
    },
    metric: {
      key: 'keysInjected',
      amount: 1,
    },
    log: {
      severity: 'SUCCESS',
      category: 'KMS',
      title: 'Ephemeral key injected',
      message: 'KMS delivered a short-lived context key into enclave memory without persisting plaintext to disk.',
      details: {
        ttl: '3600s',
        disk_io: 'disabled',
      },
    },
  },
  {
    line: 'Verifying zero-knowledge boundary and no-disk I/O policy.',
    sessionStage: 'Locking the zero-knowledge boundary',
    pipeline: {
      key: 'boundary',
      status: 'verified',
      summary: 'Zero-knowledge rules verified. Raw plaintext is confined to volatile memory.',
    },
    log: {
      severity: 'SUCCESS',
      category: 'BOUNDARY',
      title: 'Zero-knowledge boundary verified',
      message: 'Megabin confirmed no raw plaintext export, no disk persistence, and derived-output-only transit.',
      details: {
        raw_export: 'blocked',
        persistence: 'volatile-memory-only',
      },
    },
  },
  {
    line: 'Arming the DLP broker and LLM gateway for controlled prompts.',
    sessionStage: 'Ready for governed agent queries',
    pipeline: {
      key: 'dlp',
      status: 'verified',
      summary: 'Prompt screening is armed and every outbound request will be scrubbed before gateway transit.',
    },
    secondaryPipeline: {
      key: 'gateway',
      status: 'monitoring',
      summary: 'LLM Gateway is online behind the Megabin policy broker.',
    },
    log: {
      severity: 'INFO',
      category: 'GATEWAY',
      title: 'LLM gateway armed',
      message: 'Megabin finished boot and connected the LLM Gateway behind the policy broker.',
      details: {
        transport: 'browser storage events',
        mode: 'derived-output proxy',
      },
    },
  },
];

const PRESET_RESPONSES = [
  {
    keywords: ['summary', 'summarize', 'overview'],
    response:
      'Megabin’s derived analysis shows the document is centered on a restricted operating plan with engineering dependencies, budget exposure, and staged rollout milestones. The protected summary indicates the main issue is coordination across security policy, infrastructure readiness, and downstream vendor timing.',
  },
  {
    keywords: ['risk', 'risks'],
    response:
      'Three material risks stand out from the protected document:\n\n1. Policy drift between DRM systems and agent tooling.\n2. Vendor and infrastructure timing affecting rollout confidence.\n3. Cost assumptions that depend on unconfirmed contract efficiencies.',
  },
  {
    keywords: ['who', 'owner', 'author'],
    response:
      'The protected metadata points to an internal operating owner and a constrained review group, but Megabin is suppressing the underlying identifying fields. I can share the role, approval flow, and classification path without exposing the raw personal identifiers.',
  },
  {
    keywords: ['financial', 'budget', 'forecast'],
    response:
      'The governed extract indicates the file contains financial planning content tied to spend controls, efficiency targets, and approval dependencies. The budget posture is directionally positive, but at least one forecast assumption relies on a contract or savings event that is not yet fully locked.',
  },
];

const DEFAULT_RESPONSE =
  'Megabin can answer questions about the protected file by returning derived output only. Ask for a summary, risk review, owner responsibilities, or the compliance-sensitive implications of the document.';

const complianceBadges = ['FIPS 140-3', 'SOC 2', 'HIPAA', 'ITAR'];

function classifyFile(file) {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (['xls', 'xlsx', 'csv'].includes(extension)) {
    return 'Financial workbook / controlled tabular data';
  }

  if (['doc', 'docx', 'ppt', 'pptx', 'pdf'].includes(extension)) {
    return 'Sensitive operating document / executive briefing';
  }

  if (['dwg', 'step', 'cad'].includes(extension)) {
    return 'Export-controlled design package';
  }

  return 'Protected corporate file / DRM-managed payload';
}

function analyzePromptSensitivity(prompt) {
  const loweredPrompt = prompt.toLowerCase();
  const rules = [
    { pattern: /\b(ssn|social security|passport|employee id|who|owner|author|name)\b/, type: 'identity', weight: 2 },
    { pattern: /\b(account|bank|budget|finance|forecast|invoice|salary|revenue)\b/, type: 'financial', weight: 2 },
    { pattern: /\b(patient|medical|hipaa|health|diagnosis)\b/, type: 'health', weight: 2 },
    { pattern: /\b(itar|export|supplier|schematic|design|program)\b/, type: 'export-controlled', weight: 1 },
  ];

  const piiTypes = [];
  let scrubbedCount = 0;

  rules.forEach((rule) => {
    if (rule.pattern.test(loweredPrompt)) {
      piiTypes.push(rule.type);
      scrubbedCount += rule.weight;
    }
  });

  if (scrubbedCount === 0) {
    scrubbedCount = 1 + (prompt.trim().length % 3);
    piiTypes.push('employee-context');
  }

  return {
    scrubbedCount,
    piiTypes,
  };
}

function resolveAgentResponse(prompt) {
  const loweredPrompt = prompt.toLowerCase();

  for (const preset of PRESET_RESPONSES) {
    if (preset.keywords.some((keyword) => loweredPrompt.includes(keyword))) {
      return preset.response;
    }
  }

  return DEFAULT_RESPONSE;
}

function formatTime(timestamp) {
  if (!timestamp) {
    return 'No activity yet';
  }

  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function StatusPill({ status }) {
  return (
    <span className={`megabin-status-pill megabin-status-pill-${status || 'idle'}`}>
      {status === 'verified' && 'Verified'}
      {status === 'active' && 'Active'}
      {status === 'monitoring' && 'Monitoring'}
      {status === 'pending' && 'Pending'}
      {status === 'idle' && 'Idle'}
    </span>
  );
}

export default function AgentWorkspace() {
  const [workspaceStep, setWorkspaceStep] = useState('upload');
  const [file, setFile] = useState(null);
  const [bootLogs, setBootLogs] = useState([]);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Open the CISO Dashboard on a second monitor, then drop in a file. Megabin will boot a governed enclave and stream every attestation event live.',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [telemetry, setTelemetry] = useState(getTelemetryState);

  const bootTimerRef = useRef(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    return subscribeToTelemetryState(setTelemetry);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    return () => {
      if (bootTimerRef.current) {
        window.clearInterval(bootTimerRef.current);
      }
    };
  }, []);

  const initializeSession = (selectedFile) => {
    if (bootTimerRef.current) {
      window.clearInterval(bootTimerRef.current);
    }

    const classification = classifyFile(selectedFile);

    setFile(selectedFile);
    setBootLogs([]);
    setWorkspaceStep('booting');
    setInputValue('');
    setIsTyping(false);
    setMessages([
      {
        role: 'assistant',
        content: `Megabin sealed around ${selectedFile.name}. Ask for a summary, risk review, or compliance-sensitive takeaway once boot completes.`,
      },
    ]);

    resetTelemetryState({
      fileName: selectedFile.name,
      fileSizeBytes: selectedFile.size,
      fileType: selectedFile.type || 'Unknown',
      classification,
    });

    updateTelemetryState((state) => ({
      ...state,
      compliance: Object.fromEntries(
        Object.entries(state.compliance).map(([key, value]) => [
          key,
          {
            ...value,
            status: 'pending',
            summary: 'Queued for validation during Megabin boot.',
          },
        ]),
      ),
      pipeline: {
        ...state.pipeline,
        kms: {
          ...state.pipeline.kms,
          status: 'pending',
          summary: 'Queued for enterprise KMS negotiation.',
        },
        boundary: {
          ...state.pipeline.boundary,
          status: 'pending',
          summary: 'Waiting for zero-knowledge enforcement checks.',
        },
        dlp: {
          ...state.pipeline.dlp,
          status: 'pending',
          summary: 'DLP broker will arm before the first prompt is sent.',
        },
        gateway: {
          ...state.pipeline.gateway,
          status: 'pending',
          summary: 'LLM Gateway remains blocked until the enclave is sealed.',
        },
      },
    }));

    appendTelemetryLog({
      severity: 'INFO',
      category: 'SESSION',
      title: 'Protected file admitted',
      message: 'A file entered the Agent Workspace and Megabin began preparing a controlled enclave session.',
      details: {
        file: selectedFile.name,
        size: formatFileSize(selectedFile.size),
      },
    });

    let stepIndex = 0;
    bootTimerRef.current = window.setInterval(() => {
      const step = BOOT_STEPS[stepIndex];

      if (!step) {
        window.clearInterval(bootTimerRef.current);
        bootTimerRef.current = null;
        updateSessionState({
          status: 'active',
          stageLabel: 'Megabin active and ready for governed prompts',
        });
        window.setTimeout(() => {
          setWorkspaceStep('workspace');
        }, 700);
        return;
      }

      setBootLogs((currentLogs) => [...currentLogs, step.line]);

      if (step.sessionStage) {
        updateSessionState({
          stageLabel: step.sessionStage,
        });
      }

      if (step.compliance) {
        updateComplianceState(step.compliance.key, {
          status: step.compliance.status,
          summary: step.compliance.summary,
        });
      }

      if (step.pipeline) {
        updatePipelineState(step.pipeline.key, {
          status: step.pipeline.status,
          summary: step.pipeline.summary,
        });
      }

      if (step.secondaryPipeline) {
        updatePipelineState(step.secondaryPipeline.key, {
          status: step.secondaryPipeline.status,
          summary: step.secondaryPipeline.summary,
        });
      }

      if (step.metric) {
        incrementTelemetryMetric(step.metric.key, step.metric.amount);
      }

      if (step.log) {
        appendTelemetryLog(step.log);
      }

      stepIndex += 1;
    }, 650);
  };

  const handleFileSelection = (selectedFile) => {
    if (!selectedFile) {
      return;
    }

    initializeSession(selectedFile);
  };

  const handleInputChange = (event) => {
    handleFileSelection(event.target.files?.[0]);
    event.target.value = '';
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.currentTarget.classList.add('is-dragging');
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.currentTarget.classList.remove('is-dragging');
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.currentTarget.classList.remove('is-dragging');
    handleFileSelection(event.dataTransfer.files?.[0]);
  };

  const handleSendMessage = (event) => {
    event.preventDefault();
    const prompt = inputValue.trim();
    if (!prompt || isTyping) {
      return;
    }

    const sensitivity = analyzePromptSensitivity(prompt);
    const response = resolveAgentResponse(prompt);

    setMessages((currentMessages) => [...currentMessages, { role: 'user', content: prompt }]);
    setInputValue('');
    setIsTyping(true);

    appendTelemetryLog({
      severity: 'INFO',
      category: 'GATEWAY',
      title: 'Prompt intercepted by policy broker',
      message: 'Megabin received a user prompt and routed it through the DLP broker before model transit.',
      details: {
        prompt_length: prompt.length,
        outbound_path: 'Megabin -> DLP Broker -> LLM Gateway',
      },
    });

    incrementTelemetryMetric('promptsScreened', 1);
    updatePipelineState('gateway', {
      status: 'active',
      summary: 'Prompt admitted to the gateway queue pending DLP scrubbing.',
    });

    window.setTimeout(() => {
      raiseTelemetryAlert({
        title: 'PII scrub alert',
        message: `${sensitivity.scrubbedCount} PII objects scrubbed before the prompt crossed the LLM Gateway.`,
        scrubbedCount: sensitivity.scrubbedCount,
        piiTypes: sensitivity.piiTypes,
        details: {
          gateway: 'Megabin derived-output proxy',
        },
      });

      appendTelemetryLog({
        severity: 'ALERT',
        category: 'DLP',
        title: 'Sensitive fields scrubbed before model transit',
        message: `${sensitivity.scrubbedCount} PII objects were scrubbed before the prompt crossed the LLM Gateway.`,
        details: {
          pii_types: sensitivity.piiTypes.join(', '),
          action: 'scrubbed before transit',
        },
      });

      updatePipelineState('dlp', {
        status: 'active',
        summary: `${sensitivity.scrubbedCount} sensitive objects were scrubbed from the last prompt before gateway transit.`,
      });

      window.setTimeout(() => {
        appendTelemetryLog({
          severity: 'SUCCESS',
          category: 'GATEWAY',
          title: 'Derived answer returned to workspace',
          message: 'The LLM Gateway returned a derived answer to the sealed Agent Workspace.',
          details: {
            response_length: response.length,
            raw_payload: 'never exposed',
          },
        });

        updatePipelineState('gateway', {
          status: 'monitoring',
          summary: 'Gateway idle and awaiting the next governed prompt.',
        });

        setMessages((currentMessages) => [...currentMessages, { role: 'assistant', content: response }]);
        setIsTyping(false);
      }, 900);
    }, 550);
  };

  const endSession = () => {
    appendTelemetryLog({
      severity: 'WARN',
      category: 'SESSION',
      title: 'Workspace closed by operator',
      message: 'The active Megabin workspace was closed and volatile memory was marked for destruction.',
    });
    updateSessionState({
      status: 'destroyed',
      stageLabel: 'Enclave destroyed by operator',
    });
  };

  const verifiedControls = Object.values(telemetry.compliance).filter((item) => item.status === 'verified').length;

  if (workspaceStep === 'upload') {
    return (
      <div className="megabin-shell">
        <div className="megabin-page-head">
          <div>
            <span className="megabin-eyebrow">Megabin Demo Workspace</span>
            <h1 className="megabin-title">Drop a DRM-managed file and boot a governed agent enclave.</h1>
            <p className="megabin-subtitle">
              This workspace keeps the Box-like product feel simple while showing the hard parts: FIPS 140-3 attestation,
              SOC 2 evidence, HIPAA-aware prompt screening, ITAR guardrails, and derived-output-only model traffic.
            </p>
          </div>
          <div className="megabin-header-actions">
            <Link to="/admin" target="_blank" rel="noreferrer" className="megabin-secondary-link">
              Open CISO Dashboard
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>

        <div className="megabin-upload-layout">
          <div className="megabin-panel megabin-panel-hero">
            <div className="megabin-chip-row">
              {complianceBadges.map((badge) => (
                <span key={badge} className="megabin-chip">
                  <Shield size={14} />
                  {badge}
                </span>
              ))}
            </div>

            <div
              className="megabin-dropzone"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" onChange={handleInputChange} style={{ display: 'none' }} />
              <div className="megabin-dropzone-icon">
                <UploadCloud size={26} />
              </div>
              <h2>Deploy a protected file into Megabin</h2>
              <p>Drag and drop or click to load a DRM-protected spreadsheet, PDF, deck, or design file.</p>
              <div className="megabin-dropzone-hint">
                During your pitch, keep this workspace on one screen and the live CISO Dashboard on another.
              </div>
            </div>
          </div>

          <div className="megabin-panel">
            <h3 className="megabin-section-title">What the audience sees immediately</h3>
            <div className="megabin-feature-list">
              <div className="megabin-feature-item">
                <CheckCircle2 size={18} />
                <div>
                  <strong>Explicit compliance boot</strong>
                  <span>FIPS 140-3, SOC 2, HIPAA, and ITAR checks appear in sequence instead of hiding in a demo script.</span>
                </div>
              </div>
              <div className="megabin-feature-item">
                <Lock size={18} />
                <div>
                  <strong>Zero-knowledge execution</strong>
                  <span>KMS injection, no-disk I/O, and derived-output-only transport are visible in both windows.</span>
                </div>
              </div>
              <div className="megabin-feature-item">
                <ShieldAlert size={18} />
                <div>
                  <strong>Live red alerting</strong>
                  <span>Every governed prompt raises a literal red alert in the CISO Dashboard with the exact PII scrub count.</span>
                </div>
              </div>
            </div>

            <div className="megabin-telemetry-strip">
              <div>
                <span>Transport</span>
                <strong>Browser storage events</strong>
              </div>
              <div>
                <span>Dashboard</span>
                <strong>Second-window ready</strong>
              </div>
              <div>
                <span>Agent model</span>
                <strong>Derived-output proxy</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (workspaceStep === 'booting') {
    return (
      <div className="megabin-shell">
        <div className="megabin-workspace-header">
          <div>
            <span className="megabin-eyebrow">Megabin Boot Sequence</span>
            <h1 className="megabin-title megabin-title-small">Preparing a compliant enclave for {file?.name}</h1>
          </div>
          <Link to="/admin" target="_blank" rel="noreferrer" className="megabin-secondary-link">
            Watch CISO Dashboard
            <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="megabin-boot-layout">
          <div className="megabin-panel megabin-terminal-panel">
            <div className="megabin-terminal-head">
              <div className="megabin-terminal-badge">
                <TerminalSquare size={16} />
                Live attestation stream
              </div>
              <span>{bootLogs.length}/{BOOT_STEPS.length} checks complete</span>
            </div>

            <div className="megabin-progress-bar">
              <div style={{ width: `${(bootLogs.length / BOOT_STEPS.length) * 100}%` }} />
            </div>

            <div className="megabin-terminal-log">
              {bootLogs.map((line) => (
                <div key={line} className="megabin-terminal-line">
                  <span>{formatTime(new Date().toISOString())}</span>
                  <strong>{line}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="megabin-panel megabin-boot-sidebar">
            <div>
              <h3 className="megabin-section-title">Compliance posture</h3>
              <div className="megabin-status-grid">
                {Object.entries(telemetry.compliance).map(([key, item]) => (
                  <div key={key} className="megabin-status-card">
                    <div className="megabin-status-card-head">
                      <strong>{item.label}</strong>
                      <StatusPill status={item.status} />
                    </div>
                    <p>{item.summary}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="megabin-section-title">Pipeline</h3>
              <div className="megabin-pipeline-stack">
                {Object.entries(telemetry.pipeline).map(([key, item]) => (
                  <div key={key} className="megabin-pipeline-item">
                    <div className="megabin-pipeline-item-head">
                      <span>{item.label}</span>
                      <StatusPill status={item.status} />
                    </div>
                    <p>{item.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="megabin-shell megabin-shell-workspace">
      <header className="megabin-workspace-topbar">
        <div className="megabin-workspace-brand">
          <div className="megabin-workspace-brand-icon">
            <Shield size={18} />
          </div>
          <div>
            <strong>Megabin Agent Workspace</strong>
            <span>{telemetry.session.stageLabel}</span>
          </div>
        </div>

        <div className="megabin-topbar-actions">
          <Link to="/admin" target="_blank" rel="noreferrer" className="megabin-secondary-link">
            Open live CISO Dashboard
            <ArrowUpRight size={16} />
          </Link>
          <Link to="/" onClick={endSession} className="megabin-destroy-link">
            Destroy enclave
            <ChevronRight size={16} />
          </Link>
        </div>
      </header>

      <div className="megabin-workspace-layout">
        <aside className="megabin-sidebar">
          <div className="megabin-panel">
            <h3 className="megabin-section-title">Protected asset</h3>
            <div className="megabin-file-card">
              <div className="megabin-file-icon">
                <FileText size={20} />
              </div>
              <div>
                <strong>{file?.name || telemetry.session.fileName}</strong>
                <span>{formatFileSize(file?.size || telemetry.session.fileSizeBytes)}</span>
              </div>
            </div>

            <div className="megabin-sidebar-metadata">
              <div>
                <span>Policy envelope</span>
                <strong>{telemetry.session.classification}</strong>
              </div>
              <div>
                <span>Compliance checks</span>
                <strong>{verifiedControls}/4 verified</strong>
              </div>
              <div>
                <span>Last activity</span>
                <strong>{formatTime(telemetry.session.lastActivityAt)}</strong>
              </div>
            </div>
          </div>

          <div className="megabin-panel">
            <h3 className="megabin-section-title">Guardrails in force</h3>
            <div className="megabin-feature-list megabin-feature-list-compact">
              <div className="megabin-feature-item">
                <Lock size={18} />
                <div>
                  <strong>Raw export blocked</strong>
                  <span>Plaintext stays in volatile memory and never lands on disk.</span>
                </div>
              </div>
              <div className="megabin-feature-item">
                <Sparkles size={18} />
                <div>
                  <strong>Derived-output only</strong>
                  <span>Only summaries, answers, and sanctioned transforms leave the enclave.</span>
                </div>
              </div>
              <div className="megabin-feature-item">
                <ShieldAlert size={18} />
                <div>
                  <strong>DLP before transit</strong>
                  <span>Every prompt is scrubbed before it reaches the LLM Gateway.</span>
                </div>
              </div>
            </div>
          </div>

          {telemetry.lastAlert && (
            <div className="megabin-panel megabin-inline-alert">
              <div className="megabin-inline-alert-head">
                <ShieldAlert size={16} />
                Latest alert
              </div>
              <strong>{telemetry.lastAlert.scrubbedCount} PII objects scrubbed</strong>
              <p>{telemetry.lastAlert.message}</p>
            </div>
          )}
        </aside>

        <section className="megabin-chat-stage">
          <div className="megabin-chat-banner">
            <Bot size={18} />
            <span>Megabin is active. Queries pass through the DLP broker before the LLM Gateway sees them.</span>
          </div>

          <div className="megabin-chat-feed">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`megabin-message megabin-message-${message.role}`}>
                {message.role === 'assistant' && (
                  <div className="megabin-avatar megabin-avatar-assistant">
                    <Bot size={18} />
                  </div>
                )}

                <div className="megabin-message-bubble">
                  {message.content.split('\n').map((line, lineIndex) => (
                    <React.Fragment key={`${line}-${lineIndex}`}>
                      {line}
                      {lineIndex < message.content.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>

                {message.role === 'user' && (
                  <div className="megabin-avatar megabin-avatar-user">
                    <User size={18} />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="megabin-message megabin-message-assistant">
                <div className="megabin-avatar megabin-avatar-assistant">
                  <Bot size={18} />
                </div>
                <div className="megabin-message-bubble megabin-message-bubble-typing">
                  <Activity size={16} className="megabin-spin" />
                  Screening prompt through the DLP broker and zero-knowledge proxy...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="megabin-chat-input-shell">
            <form className="megabin-chat-form" onSubmit={handleSendMessage}>
              <input
                className="megabin-chat-input"
                type="text"
                placeholder="Ask the agent about the protected file..."
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                disabled={isTyping}
              />
              <button className="megabin-send-button" type="submit" disabled={!inputValue.trim() || isTyping}>
                <Send size={18} />
              </button>
            </form>
            <p className="megabin-chat-footnote">
              Live policy note: prompts are screened, scrubbed, and audit logged before the LLM Gateway receives any derived content.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
