import React, { useState } from 'react';
import { Shield, Lock, Server, CheckCircle, Zap, FileKey, Activity, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import ContactModal from './ContactModal';

export default function LandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="marketing-page fade-in-up">
      {/* 1. Hero Section */}
      <section className="marketing-section" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
        <div className="marketing-container m-grid-2">
          <div>
            <h1 className="m-h1">The secure bridge between enterprise DRM and AI agents.</h1>
            <p className="m-lede">
              Execute AI models on DRM-protected files safely. Megabin uses a Trusted Execution Environment (TEE) to process sensitive files and return only derived outputs—like summaries and answers—while preserving the original secure boundary.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setIsModalOpen(true)} className="m-btn m-btn-primary">Request technical briefing</button>
              <button onClick={() => setIsModalOpen(true)} className="m-btn m-btn-secondary">Explore pilot deployment</button>
            </div>
          </div>
          <div className="m-placeholder-image m-hero-image">
            [ Placeholder: System Architecture / TEE Visualization ]
          </div>
        </div>
      </section>

      {/* 2. The Use Case */}
      <section className="marketing-section-alt">
        <div className="marketing-container m-grid-2" style={{ alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--marketing-blue)' }}>
              <Zap size={20} />
              <span style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>The Scenario</span>
            </div>
            <h2 className="m-h2" style={{ marginBottom: '1.5rem' }}>AI agents need encrypted file access.</h2>
            <p className="m-lede" style={{ marginBottom: '1.5rem', color: 'var(--marketing-text-secondary)' }}>
              Modern AI agents require access to deep corporate knowledge to be effective, but they cannot natively read DRM-encrypted files. Decrypting these files to expose plaintext data violates enterprise data loss prevention (DLP) policies.
            </p>
            <p className="m-lede" style={{ color: 'var(--marketing-navy)', fontWeight: 600 }}>
              Megabin is the enabling technology that fast-tracks this. We provide a secure, compliant environment where agents can interface with encrypted data immediately.
            </p>
          </div>
          <div className="m-placeholder-image m-infra-image" style={{ height: '350px' }}>
            [ Placeholder: Agent to Encrypted File Bridge Visual ]
          </div>
        </div>
      </section>

      {/* 3. How Megabin Works */}
      <section className="marketing-section">
        <div className="marketing-container m-grid-2">
          <div className="m-placeholder-image m-diagram-image">
            [ Placeholder: Clean Architecture Diagram (TEE + DRM + LLM) ]
          </div>
          <div>
            <h2 className="m-h2">Secure execution.<br/>Auditable outputs.</h2>
            <p className="m-lede">
              Make intelligence work natively within your existing security stack.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ background: '#F0F6FF', padding: '0.75rem', borderRadius: '8px' }}>
                  <Lock color="var(--marketing-blue)" size={24} />
                </div>
                <div>
                  <h3 className="m-h3" style={{ fontSize: '1.25rem' }}>TEE-Backed Execution</h3>
                  <p style={{ color: 'var(--marketing-text-secondary)', lineHeight: 1.5 }}>
                    Files are decrypted exclusively inside a hardware-secured enclave. Plaintext never exists outside this boundary.
                  </p>
                </div>
              </li>
              <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ background: '#F0F6FF', padding: '0.75rem', borderRadius: '8px' }}>
                  <Server color="var(--marketing-blue)" size={24} />
                </div>
                <div>
                  <h3 className="m-h3" style={{ fontSize: '1.25rem' }}>Derivative-Output Model</h3>
                  <p style={{ color: 'var(--marketing-text-secondary)', lineHeight: 1.5 }}>
                    Agents interact securely to extract answers, embeddings, and summaries without ever having access to the raw data files.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. The Megabin Standard */}
      <section className="marketing-section-alt">
        <div className="marketing-container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 className="m-h2">Enterprise AI, secured by default.</h2>
            <p className="m-lede" style={{ margin: '0 auto' }}>
              Deploy intelligence across your organization with absolute confidence.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            <div className="m-panel" style={{ borderTop: '4px solid var(--marketing-blue)' }}>
              <CheckCircle size={32} color="var(--marketing-blue)" style={{ marginBottom: '1.5rem' }} />
              <h3 className="m-h3">Native DRM Compliance</h3>
              <p style={{ marginTop: '1rem', color: 'var(--marketing-text-secondary)', lineHeight: 1.6 }}>
                Megabin natively respects and enforces your existing Access Control Lists (ACLs) and DRM policies across all agent queries.
              </p>
            </div>
            <div className="m-panel" style={{ borderTop: '4px solid var(--marketing-blue)' }}>
              <CheckCircle size={32} color="var(--marketing-blue)" style={{ marginBottom: '1.5rem' }} />
              <h3 className="m-h3">Cryptographic Attestation</h3>
              <p style={{ marginTop: '1rem', color: 'var(--marketing-text-secondary)', lineHeight: 1.6 }}>
                Receive continuous, verifiable cryptographic proof of secure processing and isolated execution for every single file.
              </p>
            </div>
            <div className="m-panel" style={{ borderTop: '4px solid var(--marketing-blue)' }}>
              <CheckCircle size={32} color="var(--marketing-blue)" style={{ marginBottom: '1.5rem' }} />
              <h3 className="m-h3">Zero-Knowledge Design</h3>
              <p style={{ marginTop: '1rem', color: 'var(--marketing-text-secondary)', lineHeight: 1.6 }}>
                Your plaintext payloads are never ingested, trained upon, or stored by third-party models. Data remains strictly yours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CISO Compliance & SLA Section */}
      <section className="marketing-section" style={{ borderBottom: '1px solid var(--marketing-border)' }}>
        <div className="marketing-container">
          <h2 className="m-h2" style={{ marginBottom: '1rem', textAlign: 'center' }}>Enterprise-Grade Compliance</h2>
          <p className="m-lede" style={{ margin: '0 auto 4rem auto', textAlign: 'center' }}>
            Auditable, trusted execution bridging legacy frameworks to next-gen AI parameters.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', textAlign: 'center' }}>
            <div className="m-panel" style={{ padding: '2rem 1rem' }}>
              <Lock size={32} color="var(--marketing-blue)" style={{ margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--marketing-navy)' }}>FIPS 140-3 Validated</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--marketing-text-secondary)' }}>Hardware-level enclave cryptography</p>
            </div>
            <div className="m-panel" style={{ padding: '2rem 1rem' }}>
              <Shield size={32} color="var(--marketing-blue)" style={{ margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--marketing-navy)' }}>Zero-Trust Network</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--marketing-text-secondary)' }}>TLS 1.3 / AES-256 standard encryption</p>
            </div>
            <div className="m-panel" style={{ padding: '2rem 1rem' }}>
              <Award size={32} color="var(--marketing-blue)" style={{ margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--marketing-navy)' }}>SOC 2 Type II</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--marketing-text-secondary)' }}>HIPAA, ITAR, and GDPR/CCPA ready</p>
            </div>
            <div className="m-panel" style={{ padding: '2rem 1rem' }}>
              <Activity size={32} color="var(--marketing-blue)" style={{ margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--marketing-navy)' }}>99.999% SLA</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--marketing-text-secondary)' }}>Guaranteed high-availability execution</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Pre-Emptive Industry Implementations */}
      <section className="marketing-section-alt">
        <div className="marketing-container">
          <h2 className="m-h2" style={{ marginBottom: '4rem', textAlign: 'center' }}>Architecting the AI bridge.</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
            <div className="m-panel">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <FileKey size={24} color="var(--marketing-blue)" />
                <h3 className="m-h3" style={{ margin: 0, fontSize: '1.25rem' }}>Use Case: Samsung NASCA+ DRM</h3>
              </div>
              <p style={{ color: 'var(--marketing-text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                <strong>The Execution Problem:</strong> Enterprises relying on rigid zero-trust frameworks like NASCA+ completely block intelligent agents from accessing protected, business-critical hardware schematics natively.
              </p>
              <p style={{ color: 'var(--marketing-text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
                <strong>The Megabin Approach:</strong> Megabin injects directly into the NASCA+ environment to enable multi-agent access safely. It reads and summarizes highly restricted schematics internally, preserving the underlying policy server while reducing agent-compliance friction from months to zero.
              </p>
            </div>

            <div className="m-panel">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <Zap size={24} color="var(--marketing-blue)" />
                <h3 className="m-h3" style={{ margin: 0, fontSize: '1.25rem' }}>Use Case: Google Gemini for Materials Science</h3>
              </div>
              <p style={{ color: 'var(--marketing-text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                <strong>The Execution Problem:</strong> Innovative chemistry organizations want to leverage foundational models like Google Gemini to accelerate capability, but cannot blindly transit proprietary next-generation patents across public cloud endpoints.
              </p>
              <p style={{ color: 'var(--marketing-text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
                <strong>The Megabin Approach:</strong> Serving as an intermediary proxy, Megabin holds the proprietary encrypted files strictly within its TEE. This structure allows Gemini to extract formulation insights without the underlying plaintext ever traversing Google's APIs or model logs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Who This Is For */}
      <section className="marketing-section">
        <div className="marketing-container">
          <h2 className="m-h2" style={{ marginBottom: '3rem', textAlign: 'center' }}>Built for high-stakes environments.</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            <div className="m-panel">
              <h3 className="m-h3" style={{ fontSize: '1.25rem' }}>Security Leaders</h3>
              <p style={{ marginTop: '1rem', color: 'var(--marketing-text-secondary)' }}>
                Enable AI adoption rapidly and safely while maintaining strict Data Loss Prevention (DLP) parameters globally.
              </p>
            </div>
            <div className="m-panel">
              <h3 className="m-h3" style={{ fontSize: '1.25rem' }}>Regulated Industries</h3>
              <p style={{ marginTop: '1rem', color: 'var(--marketing-text-secondary)' }}>
                Effortlessly maintain compliance across finance, healthcare, and federal sectors operating under zero-trust paradigms.
              </p>
            </div>
            <div className="m-panel">
              <h3 className="m-h3" style={{ fontSize: '1.25rem' }}>AI Platform Teams</h3>
              <p style={{ marginTop: '1rem', color: 'var(--marketing-text-secondary)' }}>
                Deploy a highly scalable, secure execution layer that seamlessly connects internal agents to robust corporate knowledge.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Trust & CTA */}
      <section className="marketing-section-dark">
        <div className="marketing-container" style={{ textAlign: 'center', maxWidth: '800px' }}>
          <Shield size={48} color="#FFFFFF" style={{ marginBottom: '2rem', opacity: 0.8 }} />
          <h2 className="m-h2" style={{ color: '#FFFFFF', marginBottom: '1.5rem' }}>AI that respects your security model.</h2>
          <p className="m-lede" style={{ color: '#94A3B8', margin: '0 auto 3rem auto' }}>
            Compatible with your existing classification frameworks. Fast-track your secure AI deployment today.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button onClick={() => setIsModalOpen(true)} className="m-btn m-btn-dark">Schedule architecture review</button>
          </div>
        </div>
      </section>

      <ContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
