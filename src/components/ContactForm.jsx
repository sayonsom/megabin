import React, { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';

export default function ContactForm({ onSuccessCallback }) {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    date: '',
    time: 'Morning'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call using a recent API key logic (mocked)
    console.log("Submitting to API with payload:", formData);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      if (onSuccessCallback) {
        // Optional callback to notify parent (like a modal) after a short delay
        setTimeout(onSuccessCallback, 2500);
      }
    }, 1200);
  };

  if (isSuccess) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem 1rem' }} className="fade-in-up">
        <CheckCircle size={48} color="#0061D5" style={{ margin: '0 auto 1.5rem auto' }} />
        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1A1A1A', marginBottom: '1rem' }}>Request Received</h3>
        <p style={{ color: '#6B6B6B', lineHeight: 1.6, fontSize: '1rem' }}>
          Thank you, {formData.name.split(' ')[0] || 'there'}. Our enterprise architecture team will review your requirements for {formData.company || 'your company'} and reach out shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 700, color: '#4A5568' }}>Full Name</label>
        <input 
          type="text" 
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          className="input-base" 
          placeholder="Jane Doe" 
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 700, color: '#4A5568' }}>Company</label>
          <input 
            type="text" 
            name="company"
            required
            value={formData.company}
            onChange={handleChange}
            className="input-base" 
            placeholder="Acme Corp" 
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 700, color: '#4A5568' }}>Work Email</label>
          <input 
            type="email" 
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="input-base" 
            placeholder="jane@acmecorp.com" 
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 700, color: '#4A5568' }}>Preferred Date</label>
          <input 
            type="date" 
            name="date"
            required
            value={formData.date}
            onChange={handleChange}
            className="input-base" 
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 700, color: '#4A5568' }}>Preferred Time</label>
          <select 
            name="time"
            value={formData.time}
            onChange={handleChange}
            className="input-base"
          >
            <option value="Morning">Morning (9AM - 12PM)</option>
            <option value="Afternoon">Afternoon (12PM - 4PM)</option>
            <option value="Evening">Evening (4PM - 6PM)</option>
          </select>
        </div>
      </div>

      <button 
        type="submit" 
        className="m-btn m-btn-primary" 
        disabled={isSubmitting}
        style={{ marginTop: '1rem', width: '100%', padding: '12px' }}
      >
        {isSubmitting ? 'Submitting...' : (
          <>
            <Send size={18} style={{ marginRight: '0.5rem' }} /> Request Architecture Review
          </>
        )}
      </button>

      <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.5rem' }}>
        Your data is protected under our enterprise privacy policy.
      </p>
    </form>
  );
}
