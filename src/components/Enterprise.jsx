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
      
      {/* Box Wordmark at top-left conceptually, but centered for the layout container */}
      <div style={{ width: '100%', maxWidth: '380px', marginBottom: '16px', display: 'flex', justifyContent: 'flex-start' }}>
        <Box size={32} color="#0061D5" />
      </div>

      <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '40px', width: '100%', maxWidth: '380px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', boxSizing: 'border-box' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#1A1A1A', margin: '0 0 16px 0', letterSpacing: 'normal' }}>Enterprise Sales Form</h1>
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#1A1A1A', margin: '0 0 16px 0', letterSpacing: 'normal' }}>Contact our team</h2>
        
        {submitted ? (
          <div style={{ fontSize: '14px', color: '#1A1A1A', fontWeight: 400, lineHeight: '1.5' }}>
            <p>Verification requested.</p>
            <p>Please check your email client to confidently complete the inquiry transmission.</p>
            <button className="btn-ghost" onClick={() => setSubmitted(false)} style={{ padding: '0', marginTop: '16px' }}>Back to form</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <p style={{ fontSize: '14px', fontWeight: 400, color: '#1A1A1A', margin: '0 0 8px 0', lineHeight: '1.4' }}>
              We'll need a few details to provision your enterprise environment correctly.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A' }}>Full Name</label>
              <input name="name" type="text" className="input-base" required />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A' }}>Company</label>
              <input name="company" type="text" className="input-base" required />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A' }}>Work Email</label>
              <input name="email" type="email" className="input-base" placeholder="name@company.com" required />
            </div>

            <div style={{ marginTop: '16px' }}>
              <button type="submit" className="btn-primary" style={{ width: '100%', marginBottom: '16px' }}>Submit</button>
            </div>

          </form>
        )}

      </div>

      <div style={{ width: '100%', maxWidth: '380px', marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
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
