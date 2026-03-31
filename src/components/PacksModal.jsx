import React, { useState } from 'react';
import { X, Loader2, Package } from 'lucide-react';

export default function PacksModal({ isOpen, onClose, user }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handlePurchase = async (packType) => {
    if (!user) return;
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, email: user.email, packType })
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
         setError("Failed to initialize billing proxy.");
      }
    } catch (err) {
      console.error(err);
      setError("Payment gateway unreachable.");
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
      <div className="glass-panel" style={{ position: 'relative', width: '100%', maxWidth: '600px', padding: '2.5rem', margin: '1rem', animation: 'fadeInUp 0.3s ease-out' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <X size={24} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Expand Synergy
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Purchase transfer packs. They never expire.
          </p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', color: 'var(--error-color)', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center', border: '1px solid #f87171' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            
          <button 
            disabled={loading}
            onClick={() => handlePurchase('pack_5')}
            className="btn-secondary" 
            style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--surface-border)' }}>
            <Package size={32} color="var(--accent-color)" style={{ marginBottom: '0.5rem' }} />
            <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>5 Transfers</span>
            <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>$5.00</span>
          </button>

          <button 
            disabled={loading}
            onClick={() => handlePurchase('pack_20')}
            className="btn-secondary" 
            style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--accent-color)', background: 'rgba(99, 102, 241, 0.05)' }}>
            <Package size={32} color="#f59e0b" style={{ marginBottom: '0.5rem' }} />
            <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>20 Transfers</span>
            <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>$15.00</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-color)', marginTop: '0.2rem' }}>Most Popular</span>
          </button>

          <button 
            disabled={loading}
            onClick={() => handlePurchase('pack_100')}
            className="btn-secondary" 
            style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--surface-border)' }}>
            <Package size={32} color="var(--text-primary)" style={{ marginBottom: '0.5rem' }} />
            <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>100 Transfers</span>
            <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>$50.00</span>
          </button>

        </div>

        {loading && (
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <Loader2 className="animate-spin" size={24} color="var(--accent-color)" />
          </div>
        )}
      </div>
    </div>
  );
}
