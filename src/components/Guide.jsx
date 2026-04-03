import React from 'react';
import { Shield, Terminal, Zap, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Guide() {
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #D0D0D0', borderRadius: '12px', padding: '48px 40px', maxWidth: '800px', margin: '0 auto', textAlign: 'left', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '24px', fontWeight: 800, color: '#1A1A1A' }}>MegaBin Enterprise: Best Practices for Synergy</h1>
      <p style={{ fontSize: '15px', color: '#6B6B6B', marginBottom: '48px', lineHeight: 1.6 }}>
        MegaBin is expressly designed for forward-thinking professionals who need to seamlessly align large, dynamic assets across robust corporate paradigms.
      </p>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '24px', color: '#1A1A1A', marginBottom: '16px', fontWeight: 700 }}>
          <Shield size={24} color="#0061D5" /> End-to-End Alignment (Frictionless Sync)
        </h2>
        <p style={{ color: '#6B6B6B', lineHeight: 1.6, marginBottom: '16px', fontSize: '15px' }}>
          By toggling <strong style={{color:'#1A1A1A'}}>End-to-End Alignment</strong>, MegaBin performs rigorous local optimization natively inside your web browser before the asset ever enters the synergy stream.
        </p>
        <ul style={{ color: '#6B6B6B', lineHeight: 1.6, paddingLeft: '24px', listStyleType: 'circle', fontSize: '15px' }}>
          <li><strong style={{color:'#1A1A1A'}}>Streamlining:</strong> The asset is dynamically reformatted into a highly optimized data structure. Enterprise monitors will simply note routine, perfectly normal synergy flowing through the pipeline.</li>
          <li><strong style={{color:'#1A1A1A'}}>Zero Friction:</strong> The true value of the asset is encapsulated seamlessly. When you align with stakeholders, the central repository merely facilitates the synergy, ensuring only the intended recipient can actualize the deliverables.</li>
        </ul>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '24px', color: '#1A1A1A', marginBottom: '16px', fontWeight: 700 }}>
          <Terminal size={24} color="#0061D5" /> Automated CLI Synergies
        </h2>
        <p style={{ color: '#6B6B6B', lineHeight: 1.6, marginBottom: '16px', fontSize: '15px' }}>
          To execute alignments programmatically, MegaBin provides a synergistic Node.js utility (<code>cli/megabin.js</code>) in our strategy repository. 
        </p>
        <div style={{ background: '#F4F4F4', padding: '16px', borderRadius: '8px', border: '1px solid #D0D0D0' }}>
          <code style={{ color: '#0061D5', fontSize: '14px' }}>node cli/megabin.js /path/to/synergy/q4_deliverables.csv</code>
        </div>
        <p style={{ color: '#6B6B6B', lineHeight: 1.6, marginTop: '16px', fontSize: '15px' }}>
          It strategically orchestrates massive assets into agile, micro-streaming paradigms to ensure peak operational synergy across the corporate network.
        </p>
      </section>

      <section style={{ marginBottom: '48px', padding: '32px', background: 'rgba(0, 97, 213, 0.05)', borderRadius: '12px', border: '1px solid rgba(0, 97, 213, 0.2)' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '24px', color: '#1A1A1A', marginBottom: '16px', fontWeight: 700 }}>
          <Zap size={24} color="#0061D5" /> MegaBin Pro
        </h2>
        <p style={{ color: '#6B6B6B', lineHeight: 1.6, marginBottom: '16px', fontSize: '15px' }}>
          Unlocking Pro bridges you into our enterprise-tier storage and networking capabilities:
        </p>
        <ul style={{ color: '#6B6B6B', lineHeight: 1.6, paddingLeft: '24px', listStyleType: 'circle', marginBottom: '24px', fontSize: '15px' }}>
          <li><strong style={{color:'#1A1A1A'}}>Agile Endpoints:</strong> Need diverse routing? MegaBin Pro dynamically creates agile <code>b-uuid.gridspeed.pro</code> nodes to maintain maximum synergy velocity globally.</li>
          <li><strong style={{color:'#1A1A1A'}}>5GB Asset Boundaries:</strong> Empower your cross-functional alignments with resources 50x larger than standard pipelines.</li>
          <li><strong style={{color:'#1A1A1A'}}>Evergreen Alignments:</strong> Disable the standard 7-day sunsetting phase for infinite synergy.</li>
        </ul>
      </section>
      
      <div style={{ textAlign: 'center' }}>
        <Link to="/" className="btn-primary" style={{ display: 'inline-flex', padding: '12px 32px' }}>Got it. Take me to MegaBin</Link>
      </div>
    </div>
  );
}
