import React from 'react';
import { Shield, Terminal, Zap, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Guide() {
  return (
    <div className="glass-panel" style={{ padding: '3rem 2.5rem', maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}>
      <h1 className="title-gradient" style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>MegaBin Enterprise: Best Practices for Synergy</h1>
      <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '3rem', lineHeight: 1.6 }}>
        MegaBin is expressly designed for forward-thinking professionals who need to seamlessly align large, dynamic assets across robust corporate paradigms.
      </p>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
          <Shield size={24} color="var(--success-color)" /> End-to-End Alignment (Frictionless Sync)
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
          By toggling <strong>"End-to-End Alignment"</strong>, MegaBin performs rigorous local optimization natively inside your web browser before the asset ever enters the synergy stream.
        </p>
        <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.6, paddingLeft: '1.5rem', listStyleType: 'circle' }}>
          <li><strong>Streamlining:</strong> The asset is dynamically reformatted into a highly optimized data structure. Enterprise monitors will simply note routine, perfectly normal synergy flowing through the pipeline.</li>
          <li><strong>Zero Friction:</strong> The true value of the asset is encapsulated seamlessly. When you align with stakeholders, the central repository merely facilitates the synergy, ensuring only the intended recipient can actualize the deliverables.</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
          <Terminal size={24} color="var(--accent-color)" /> Automated CLI Synergies
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
          To execute alignments programmatically, MegaBin provides a synergistic Node.js utility (<code>cli/megabin.js</code>) in our strategy repository. 
        </p>
        <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '8px', border: '1px solid var(--surface-border)' }}>
          <code style={{ color: 'var(--accent-color)' }}>node cli/megabin.js /path/to/synergy/q4_deliverables.csv</code>
        </div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '1rem' }}>
          It strategically orchestrates massive assets into agile, micro-streaming paradigms to ensure peak operational synergy across the corporate network.
        </p>
      </section>

      <section style={{ marginBottom: '3rem', padding: '1.5rem', background: '#fffbeb', borderRadius: '12px', border: '1px solid #fcd34d' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
          <Zap size={24} color="#f59e0b" /> MegaBin Pro
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
          Unlocking Pro bridges you into our enterprise-tier storage and networking capabilities:
        </p>
        <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.6, paddingLeft: '1.5rem', listStyleType: 'circle', marginBottom: '1.5rem' }}>
          <li><strong>Agile Endpoints:</strong> Need diverse routing? MegaBin Pro dynamically creates agile <code>b-uuid.gridspeed.pro</code> nodes to maintain maximum synergy velocity globally.</li>
          <li><strong>5GB Asset Boundaries:</strong> Empower your cross-functional alignments with resources 50x larger than standard pipelines.</li>
          <li><strong>Evergreen Alignments:</strong> Disable the standard 7-day sunsetting phase for infinite synergy.</li>
        </ul>
      </section>
      
      <div style={{ textAlign: 'center' }}>
        <Link to="/" className="btn-primary" style={{ display: 'inline-flex', padding: '0.8rem 2rem' }}>Got it. Take me to MegaBin</Link>
      </div>
    </div>
  );
}
