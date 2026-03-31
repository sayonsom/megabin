import React from 'react';
import { Shield, Terminal, Zap, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Guide() {
  return (
    <div className="glass-panel" style={{ padding: '3rem 2.5rem', maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}>
      <h1 className="title-gradient" style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>MegaBin Guide: How & When to Use</h1>
      <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '3rem', lineHeight: 1.6 }}>
        MegaBin is expressly designed for security engineers, developers, and QA teams who need to safely shuttle large ephemeral payloads seamlessly across robust enterprise IT perimeters (like Zscaler or NASCA+).
      </p>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', color: '#fff', marginBottom: '1rem' }}>
          <Shield size={24} color="#10b981" /> End-to-End Encryption (Firewall Bypass)
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
          By toggling <strong>"End-to-End Encryption"</strong>, MegaBin performs AES-256-GCM encryption natively inside your web browser before the file ever hits the network. 
        </p>
        <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.6, paddingLeft: '1.5rem', listStyleType: 'circle' }}>
          <li><strong>Evasion:</strong> The encrypted binary is dynamically flattened into a purely textual Base64 blob. Endpoint DLP monitors looking for blocked binary file signatures or code keywords will see nothing but randomized text characters.</li>
          <li><strong>Zero Knowledge:</strong> The encryption key is embedded silently in the URL hash (e.g., <code>#key</code>). When you share the link, the server never records the key, making decryption mathematically impossible for anyone except the recipient.</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', color: '#fff', marginBottom: '1rem' }}>
          <Terminal size={24} color="#60a5fa" /> Terminal Integration (Node CLI)
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
          To script transfers natively, MegaBin supports a standalone Node.js script (<code>cli/megabin.js</code>) available in our GitHub repository. 
        </p>
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <code style={{ color: '#a5b4fc' }}>node cli/megabin.js /path/to/device/crash.log</code>
        </div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '1rem' }}>
          It chunks massive payloads into tiny 1MB native streaming packets to successfully bypass aggressive TCP network bandwidth tracking algorithms.
        </p>
      </section>

      <section style={{ marginBottom: '3rem', padding: '1.5rem', background: 'rgba(245, 158, 11, 0.05)', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', color: '#fff', marginBottom: '1rem' }}>
          <Zap size={24} color="#f59e0b" /> MegaBin Pro
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
          Unlocking Pro bridges you into our enterprise-tier storage and networking capabilities:
        </p>
        <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.6, paddingLeft: '1.5rem', listStyleType: 'circle', marginBottom: '1.5rem' }}>
          <li><strong>Burner Domains:</strong> Corporate blacklisted <code>gridspeed.pro</code>? MegaBin Pro dynamically generates disposable <code>b-uuid.gridspeed.pro</code> proxy links to ensure unhindered global access.</li>
          <li><strong>5GB Payload Boundaries:</strong> Scale transfers 50x larger than the standard payload pipeline.</li>
          <li><strong>Permanent Storage Pinning:</strong> Disable the 7-day chron deletion cycle.</li>
        </ul>
      </section>
      
      <div style={{ textAlign: 'center' }}>
        <Link to="/" className="btn-primary" style={{ display: 'inline-flex', padding: '0.8rem 2rem' }}>Got it. Take me to MegaBin</Link>
      </div>
    </div>
  );
}
