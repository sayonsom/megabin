import React from 'react';
import ContactForm from './ContactForm';

export default function ContactPage() {
  return (
    <div className="marketing-page fade-in-up" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
      <section className="marketing-section-alt" style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <div className="marketing-container" style={{ width: '100%', maxWidth: '1000px' }}>
          <div className="m-grid-2" style={{ alignItems: 'flex-start' }}>
            <div style={{ paddingRight: '2rem' }}>
              <h1 className="m-h1" style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>Talk to our Security Architects.</h1>
              <p className="m-lede" style={{ marginBottom: '2rem' }}>
                Whether you need a full technical briefing on our TEE infrastructure or want to explore a pilot deployment for your agents, our team is ready to assist.
              </p>
              
              <div style={{ marginTop: '3rem' }}>
                <h3 className="m-h3" style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>What to expect:</h3>
                <ul style={{ listStyle: 'none', padding: 0, color: 'var(--marketing-text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <li style={{ display: 'flex', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--marketing-blue)' }}>✓</span>
                    <span>Direct access to a senior architectural engineer</span>
                  </li>
                  <li style={{ display: 'flex', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--marketing-blue)' }}>✓</span>
                    <span>Review of your specific DRM/DLP compliance hurdles</span>
                  </li>
                  <li style={{ display: 'flex', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--marketing-blue)' }}>✓</span>
                    <span>A complete zero-trust deployment mapping</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="m-panel" style={{ padding: '3rem 2.5rem' }}>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
