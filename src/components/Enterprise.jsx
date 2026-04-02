import React, { useState } from 'react';

export default function Enterprise() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    const formData = new FormData(e.target);
    const body = `Name: ${formData.get('name')}\nCompany: ${formData.get('company')}\nEmail: ${formData.get('email')}\nMessage: ${formData.get('message')}`;
    window.location.href = `mailto:hello@megabin.com?subject=Enterprise Inquiry&body=${encodeURIComponent(body)}`;
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', color: 'var(--text-primary)', padding: '2rem 1rem' }}>
      <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontWeight: 800, textAlign: 'center' }}>MegaBin for Enterprise</h2>
      
      <div style={{ background: 'var(--surface-color)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '2.5rem', marginBottom: '3rem', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
        <h3 style={{ fontSize: '1.5rem', color: '#f87171', marginBottom: '1rem', fontWeight: 600 }}>The Shadow IT Problem</h3>
        <p style={{ lineHeight: '1.6', color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.1rem' }}>
          Your employees are just trying to do their jobs. But when corporate file-sharing tools are clunky, they find workarounds. 
          They bypass your DLP (Data Loss Prevention) scanners using ad-ridden, open-source tools—or worse, they just attach sensitive intellectual property to an unencrypted email that lives in an inbox forever.
        </p>
        
        <h3 style={{ fontSize: '1.5rem', color: '#34d399', marginBottom: '1rem', fontWeight: 600 }}>The Tractable Solution</h3>
        <p style={{ lineHeight: '1.6', color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Stop fighting your employees' good intentions. Give them a tool that is highly tractable, blazing fast, and designed for them. 
          MegaBin provides the frictionless consumer experience they demand, with the cryptographic silence and self-destructing ephemeral storage your compliance officers require. 
        </p>

        <h3 style={{ fontSize: '1.5rem', color: '#60a5fa', marginBottom: '1rem', marginTop: '2.5rem', fontWeight: 600 }}>The AI & Agentic Data Dilemma</h3>
        <p style={{ lineHeight: '1.6', color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          As your enterprise builds and deploys internal AI Agents, those autonomous tools will occasionally need access to highly sensitive, unstructured context or file dumps. How do you securely ferry data from a human employee to a headless agent without creating sprawling, ungoverned data lakes? MegaBin acts as the secure, ephemeral conduit for AI workloads. Let us handle the secure data transit—so your agents get exactly the context they need, when they need it, without leaving persistent, risky footprints behind.
        </p>
      </div>

      <div style={{ background: 'var(--surface-color)', borderRadius: '12px', padding: '2.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h3 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', fontWeight: 700 }}>Let's get this done.</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.05rem' }}>Reach out to integrate MegaBin seamlessly into your corporate environment.</p>
        
        {submitted ? (
          <div style={{ padding: '2rem', background: 'rgba(52, 211, 153, 0.1)', color: '#34d399', borderRadius: '8px', textAlign: 'center', fontWeight: 500 }}>
            Thanks! Check your email client to complete the inquiry. We'll be in touch.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input name="name" type="text" placeholder="Name" required style={{ flex: 1, padding: '1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '1rem' }} />
              <input name="company" type="text" placeholder="Company" required style={{ flex: 1, padding: '1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '1rem' }} />
            </div>
            <input name="email" type="email" placeholder="Work Email" required style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '1rem' }} />
            <textarea name="message" placeholder="How many employees? Any specific compliance needs?" rows="4" style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', resize: 'vertical', fontSize: '1rem' }}></textarea>
            <button type="submit" className="btn-primary" style={{ padding: '1rem', marginTop: '0.5rem', fontWeight: 600, fontSize: '1.1rem' }}>Contact Sales</button>
          </form>
        )}
      </div>
    </div>
  );
}
