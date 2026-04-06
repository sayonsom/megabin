import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  EyeOff,
  FileStack,
  KeyRound,
  Lock,
  RefreshCw,
  Shield,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  clearTelemetryState,
  formatFileSize,
  getTelemetryState,
  subscribeToTelemetryState,
} from '../utils/telemetry';

function formatTimestamp(timestamp) {
  if (!timestamp) {
    return 'Awaiting activity';
  }

  return new Date(timestamp).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function DashboardStatus({ status }) {
  return (
    <span className={`ciso-pill ciso-pill-${status || 'idle'}`}>
      {status === 'verified' && 'Verified'}
      {status === 'active' && 'Active'}
      {status === 'monitoring' && 'Monitoring'}
      {status === 'pending' && 'Pending'}
      {status === 'idle' && 'Idle'}
      {!status && 'Idle'}
    </span>
  );
}

function MetricCard({ icon: Icon, label, value, tone = 'blue', caption }) {
  return (
    <div className={`ciso-metric-card ciso-metric-card-${tone}`}>
      <div className="ciso-metric-icon">
        {React.createElement(Icon, { size: 18 })}
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{caption}</small>
      </div>
    </div>
  );
}

export default function CisoDashboard() {
  const [telemetry, setTelemetry] = useState(getTelemetryState);

  useEffect(() => subscribeToTelemetryState(setTelemetry), []);

  const complianceEntries = Object.values(telemetry.compliance);
  const pipelineEntries = Object.values(telemetry.pipeline);
  const recentLogs = [...telemetry.logs].reverse();
  const hasLiveSession = Boolean(telemetry.session.id);

  return (
    <div className="ciso-shell">
      <header className="ciso-header">
        <div>
          <span className="ciso-eyebrow">Megabin CISO Dashboard</span>
          <h1>Live oversight for governed agent access.</h1>
          <p>
            Use this view on a second monitor during the pitch. The Agent Workspace streams attestation events, KMS activity,
            zero-knowledge boundary status, and DLP alerts here using browser storage events.
          </p>
        </div>

        <div className="ciso-header-actions">
          <div className="ciso-live-pill">
            <Activity size={16} />
            Live sync via storage events
          </div>
          <Link to="/demo" target="_blank" rel="noreferrer" className="ciso-link-button">
            Open Agent Workspace
            <ArrowUpRight size={15} />
          </Link>
          <button type="button" className="ciso-clear-button" onClick={clearTelemetryState}>
            Reset demo
          </button>
        </div>
      </header>

      <section
        key={telemetry.lastAlert?.id || 'ciso-alert-idle'}
        className={`ciso-alert-banner ${telemetry.lastAlert ? 'is-visible is-flashing' : ''}`}
      >
        <div className="ciso-alert-icon">
          <AlertTriangle size={18} />
        </div>
        <div>
          <span className="ciso-alert-label">Alert</span>
          <strong>
            {telemetry.lastAlert
              ? `${telemetry.lastAlert.scrubbedCount} PII objects scrubbed before LLM Gateway transit`
              : 'No active DLP alerts'}
          </strong>
          <p>{telemetry.lastAlert ? telemetry.lastAlert.message : 'Ask the agent a question in the workspace to trigger the live DLP demo.'}</p>
        </div>
      </section>

      <div className="ciso-grid">
        <main className="ciso-main">
          <section className="ciso-metrics-grid">
            <MetricCard
              icon={FileStack}
              label="Protected files"
              value={telemetry.metrics.filesProcessed}
              caption="Current demo sessions admitted into Megabin"
            />
            <MetricCard
              icon={KeyRound}
              label="Keys injected"
              value={telemetry.metrics.keysInjected}
              caption="Ephemeral KMS context keys issued"
              tone="amber"
            />
            <MetricCard
              icon={ShieldAlert}
              label="PII scrubbed"
              value={telemetry.metrics.piiObjectsScrubbed}
              caption="Sensitive objects removed before gateway transit"
              tone="red"
            />
            <MetricCard
              icon={Sparkles}
              label="Prompts screened"
              value={telemetry.metrics.promptsScreened}
              caption="User prompts governed by the policy broker"
              tone="slate"
            />
          </section>

          <div className="ciso-panel-grid">
            <section className="ciso-panel">
              <div className="ciso-panel-head">
                <div>
                  <span className="ciso-section-kicker">Compliance posture</span>
                  <h2>Attested controls</h2>
                </div>
                <BadgeCheck size={18} />
              </div>

              <div className="ciso-compliance-grid">
                {complianceEntries.map((item) => (
                  <div key={item.label} className="ciso-compliance-card">
                    <div className="ciso-compliance-card-head">
                      <strong>{item.label}</strong>
                      <DashboardStatus status={item.status} />
                    </div>
                    <p>{item.summary}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="ciso-panel">
              <div className="ciso-panel-head">
                <div>
                  <span className="ciso-section-kicker">Runtime pipeline</span>
                  <h2>What Megabin is enforcing</h2>
                </div>
                <RefreshCw size={18} />
              </div>

              <div className="ciso-pipeline-stack">
                {pipelineEntries.map((item) => (
                  <div key={item.label} className="ciso-pipeline-item">
                    <div className="ciso-pipeline-item-head">
                      <div className="ciso-pipeline-item-title">
                        <span>{item.label}</span>
                        <DashboardStatus status={item.status} />
                      </div>
                    </div>
                    <p>{item.summary}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="ciso-panel ciso-log-panel">
            <div className="ciso-panel-head">
              <div>
                <span className="ciso-section-kicker">Audit stream</span>
                <h2>Real-time operator log</h2>
              </div>
              <Activity size={18} />
            </div>

            {recentLogs.length === 0 ? (
              <div className="ciso-empty-state">
                <Shield size={22} />
                <div>
                  <strong>Waiting for Agent Workspace telemetry</strong>
                  <p>Open the workspace, upload a file, and the audit stream will populate live.</p>
                </div>
              </div>
            ) : (
              <div className="ciso-log-list">
                {recentLogs.map((log) => (
                  <div key={log.id} className={`ciso-log-row ciso-log-row-${log.severity?.toLowerCase() || 'info'}`}>
                    <div className="ciso-log-meta">
                      <span>{formatTimestamp(log.timestamp)}</span>
                      <DashboardStatus
                        status={
                          log.severity === 'SUCCESS'
                            ? 'verified'
                            : log.severity === 'WARN'
                              ? 'pending'
                              : log.severity === 'ALERT'
                                ? 'active'
                                : 'monitoring'
                        }
                      />
                    </div>
                    <div className="ciso-log-body">
                      <div className="ciso-log-heading">
                        <strong>{log.title}</strong>
                        <span>{log.category}</span>
                      </div>
                      <p>{log.message}</p>
                      {Object.keys(log.details || {}).length > 0 && (
                        <div className="ciso-log-details">
                          {Object.entries(log.details).map(([key, value]) => (
                            <span key={key}>
                              <strong>{key}</strong>
                              {String(value)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>

        <aside className="ciso-sidebar">
          <section className="ciso-panel">
            <div className="ciso-panel-head">
              <div>
                <span className="ciso-section-kicker">Active session</span>
                <h2>{hasLiveSession ? telemetry.session.fileName : 'No active file'}</h2>
              </div>
              <Lock size={18} />
            </div>

            <div className="ciso-session-stack">
              <div>
                <span>Status</span>
                <strong>{telemetry.session.stageLabel}</strong>
              </div>
              <div>
                <span>Source</span>
                <strong>{telemetry.session.sourceLabel}</strong>
              </div>
              <div>
                <span>File size</span>
                <strong>{formatFileSize(telemetry.session.fileSizeBytes)}</strong>
              </div>
              <div>
                <span>Classification</span>
                <strong>{telemetry.session.classification}</strong>
              </div>
              <div>
                <span>Ingress adapter</span>
                <strong>{telemetry.session.edgeAdapter || 'browser-upload'}</strong>
              </div>
              <div>
                <span>Edge session</span>
                <strong>{telemetry.session.edgeSessionId || 'Not attached'}</strong>
              </div>
              <div>
                <span>Started</span>
                <strong>{formatTimestamp(telemetry.session.startedAt)}</strong>
              </div>
              <div>
                <span>Last activity</span>
                <strong>{formatTimestamp(telemetry.session.lastActivityAt)}</strong>
              </div>
            </div>
          </section>

          <section className="ciso-panel">
            <div className="ciso-panel-head">
              <div>
                <span className="ciso-section-kicker">Operator takeaway</span>
                <h2>Why this lands with CISOs</h2>
              </div>
              <EyeOff size={18} />
            </div>

            <div className="ciso-bullet-stack">
              <div>
                <Shield size={16} />
                <span>The dashboard proves the controls are active instead of asking the buyer to trust a narration.</span>
              </div>
              <div>
                <KeyRound size={16} />
                <span>KMS issuance and zero-knowledge sealing are visible as first-class security events.</span>
              </div>
              <div>
                <ShieldAlert size={16} />
                <span>Each prompt creates a visible DLP moment with the exact sensitive-object scrub count.</span>
              </div>
            </div>
          </section>

          <section className="ciso-panel">
            <div className="ciso-panel-head">
              <div>
                <span className="ciso-section-kicker">Sync health</span>
                <h2>Demo link status</h2>
              </div>
              <Activity size={18} />
            </div>

            <div className="ciso-sync-card">
              <div className="ciso-live-pill">
                <Activity size={14} />
                Storage-event transport active
              </div>
              <p>
                Local ingress path: <strong>{telemetry.session.edgeSessionId ? telemetry.session.sourceLabel : 'Browser upload fallback'}</strong>
              </p>
              <p>
                Last dashboard update: <strong>{formatTimestamp(telemetry.updatedAt)}</strong>
              </p>
              <p>
                This dashboard is intentionally decoupled from the workspace window so the audience can watch governance happen in
                real time.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
