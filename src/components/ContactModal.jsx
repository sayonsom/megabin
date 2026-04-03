import React from 'react';
import { X } from 'lucide-react';
import ContactForm from './ContactForm';

export default function ContactModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(11, 25, 44, 0.6)', // deep navy transparent
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem',
      boxSizing: 'border-box'
    }}>
      <div 
        className="fade-in-up m-panel" 
        style={{ 
          maxWidth: '500px', 
          width: '100%', 
          position: 'relative', 
          maxHeight: '90vh', 
          overflowY: 'auto' 
        }}
      >
        <button 
          onClick={onClose}
          style={{ 
            position: 'absolute', 
            top: '1rem', 
            right: '1rem', 
            background: 'transparent', 
            border: 'none', 
            cursor: 'pointer',
            color: '#64748B'
          }}
        >
          <X size={24} />
        </button>

        <div style={{ marginBottom: '2rem', marginTop: '0.5rem' }}>
          <h2 className="m-h2" style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Schedule Review</h2>
          <p className="m-lede" style={{ fontSize: '1rem', marginBottom: 0 }}>
            Connect with our architecture team to map out a secure AI pilot.
          </p>
        </div>

        <ContactForm onSuccessCallback={onClose} />
      </div>
    </div>
  );
}
