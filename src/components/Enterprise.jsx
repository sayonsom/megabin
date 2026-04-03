import React, { useState } from 'react';
import { Box } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Enterprise() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    const formData = new FormData(e.target);
    const body = `Full Name: ${formData.get('name')}\nCompany: ${formData.get('company')}\nWork Email: ${formData.get('email')}`;
    window.location.href = `mailto:hello@megabin.com?subject=Enterprise Inquiry&body=${encodeURIComponent(body)}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 8rem)', padding: '1rem', fontFamily: "Lato, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%', maxWidth: '800px' }}>
        
        {/* Sales Copy Card */}
        <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '40px', width: '100%', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
             <Box size={32} color="#0061D5" />
             <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1A1A1A', margin: 0 }}>MegaBin for Enterprise</h1>
          </div>
          
          <h3 style={{ fontSize: '18px', color: '#1A1A1A', marginBottom: '8px', fontWeight: 700 }}>The Shadow IT Problem</h3>
          <p style={{ lineHeight: '1.6', color: '#6B6B6B', fontSize: '15px', marginBottom: '32px' }}>
            Your employees are just trying to do their jobs. But when corporate file-sharing tools are clunky, they find workarounds. 
            They bypass your DLP (Data Loss Prevention) scanners using ad-ridden, open-source tools—or worse, they just attach sensitive intellectual property to an unencrypted email that lives in an inbox forever.
          </p>
          
          <h3 style={{ fontSize: '18px', color: '#1A1A1A', marginBottom: '8px', fontWeight: 700 }}>The Tractable Solution</h3>
          <p style={{ lineHeight: '1.6', color: '#6B6B6B', fontSize: '15px', marginBottom: '32px' }}>
            Stop fighting your employees' good intentions. Give them a tool that is highly tractable, blazing fast, and designed for them. 
            MegaBin provides the frictionless consumer experience they demand, with the cryptographic silence and self-destructing ephemeral storage your compliance officers require. 
          </p>

          <h3 style={{ fontSize: '18px', color: '#1A1A1A', marginBottom: '8px', fontWeight: 700 }}>The AI & Agentic Data Dilemma</h3>
          <p style={{ lineHeight: '1.6', color: '#6B6B6B', fontSize: '15px', margin: 0 }}>
            As your enterprise builds and deploys internal AI Agents, those autonomous tools will occasionally need access to highly sensitive, unstructured context or file dumps. How do you securely ferry data from a human employee to a headless agent without creating sprawling, ungoverned data lakes? MegaBin acts as the secure, ephemeral conduit for AI workloads. Let us handle the secure data transit—so your agents get exactly the context they need, when they need it, without leaving persistent, risky footprints behind.
          </p>
        </div>

        {/* Form Card */}
        <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '40px', width: '100%', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', boxSizing: 'border-box' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px 0' }}>Enterprise Sales Form</h2>
          <p style={{ fontSize: '15px', fontWeight: 400, color: '#6B6B6B', margin: '0 0 24px 0', lineHeight: '1.4' }}>
            We'll need a few details to provision your enterprise environment correctly. Contact our team to begin.
          </p>
          
          {submitted ? (
            <div style={{ fontSize: '15px', color: '#1A1A1A', fontWeight: 400, lineHeight: '1.5' }}>
              <p>Verification requested.</p>
              <p>Please check your email client to confidently complete the inquiry transmission.</p>
              <button className="btn-ghost" onClick={() => setSubmitted(false)} style={{ padding: '0', marginTop: '16px' }}>Back to form</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: '1 1 calc(50% - 8px)' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A' }}>Full Name</label>
                  <input name="name" type="text" className="input-base" required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: '1 1 calc(50% - 8px)' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A' }}>Company</label>
                  <input name="company" type="text" className="input-base" required />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A' }}>Work Email</label>
                <input name="email" type="email" className="input-base" placeholder="name@company.com" required />
              </div>

              <div style={{ marginTop: '16px' }}>
                <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '12px 32px' }}>Submit Inquiry</button>
              </div>
            </form>
          )}
        </div>

      </div>

      <div style={{ width: '100%', maxWidth: '800px', marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
          <Link to="/" className="btn-ghost" style={{ fontSize: '14px', fontWeight: 400 }}>Back to sign in</Link>
      </div>

      {/* Footer Navigation */}
      <div style={{ marginTop: '48px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', fontSize: '12px', color: '#6B6B6B' }}>
        <span>©2026 Box</span>
        <span>|</span>
        <a href="#" style={{ color: '#6B6B6B', textDecoration: 'none' }}>Privacy Policy</a>
        <span>|</span>
        <a href="#" style={{ color: '#6B6B6B', textDecoration: 'none' }}>Terms of Service</a>
        <span>|</span>
        <a href="#" style={{ color: '#6B6B6B', textDecoration: 'none' }}>Help</a>
        <span>|</span>
        <a href="#" style={{ color: '#6B6B6B', textDecoration: 'none' }}>Sign In with Google</a>
      </div>
      
    </div>
  );
}
