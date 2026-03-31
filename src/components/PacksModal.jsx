import React, { useState } from 'react';
import { X, Loader2, Package, Check, Shield, Database, LayoutGrid, CreditCard } from 'lucide-react';

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
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)', padding: '1rem' }}>
      <div className="glass-panel" style={{ position: 'relative', width: '100%', maxWidth: '900px', padding: '0', margin: 'auto', animation: 'fadeInUp 0.3s ease-out', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--surface-color)', border: '1px solid var(--surface-border)' }}>
        
        <div style={{ position: 'relative', padding: '3rem 2rem 2rem', textAlign: 'center', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05), transparent)' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'var(--background-color)', border: '1px solid var(--surface-border)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s' }} className="hover:bg-gray-800">
            <X size={20} />
          </button>

          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--text-primary)', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Choose Your <span className="title-gradient">Synergy</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            Purchase transfer packs. They <strong style={{color: 'var(--text-primary)'}}>never expire</strong>. Plus, once you buy a pack, you are automatically upgraded to the <strong>Pro Tier</strong>!
          </p>
        </div>

        {error && (
          <div style={{ margin: '0 2rem', background: '#fef2f2', color: 'var(--error-color)', padding: '1rem', borderRadius: '8px', fontSize: '0.95rem', textAlign: 'center', border: '1px solid #f87171' }}>
            {error}
          </div>
        )}

        <div style={{ padding: '0 2rem 2rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}><Shield size={18} color="var(--success-color)"/> Better E2E Encryption</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}><Database size={18} color="var(--accent-color)"/> Infinite Data Retention</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}><LayoutGrid size={18} color="#f59e0b"/> Pro File Tables</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
              
            {/* 5 Transfers Card */}
            <div style={{ display: 'flex', flexDirection: 'column', padding: '2rem', borderRadius: '16px', border: '1px solid var(--surface-border)', background: 'var(--background-color)', transition: 'transform 0.2s', position: 'relative' }}>
              <Package size={32} color="var(--text-secondary)" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem' }}>Starter</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>$5</span>
                <span style={{ color: 'var(--text-secondary)' }}>/ one-time</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.95rem', flexGrow: 1 }}>
                <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Check size={16} color="var(--accent-color)"/> <strong>5 Transfers</strong></li>
                <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Check size={16} color="var(--success-color)"/> Auto Pro Tier Upgraded</li>
                <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Check size={16} color="var(--text-secondary)"/> Burner Domains</li>
              </ul>
              <button disabled={loading} onClick={() => handlePurchase('pack_5')} className="btn-secondary" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', fontSize: '1rem' }}>Buy Starter</button>
            </div>

            {/* 25 Transfers Card (Popular) */}
            <div style={{ display: 'flex', flexDirection: 'column', padding: '2rem', borderRadius: '16px', border: '2px solid var(--accent-color)', background: 'linear-gradient(to bottom, rgba(99, 102, 241, 0.05), transparent)', position: 'relative', transform: 'scale(1.02)' }}>
              <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--accent-color)', color: 'white', padding: '0.25rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Most Popular</div>
              <Package size={32} color="var(--accent-color)" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>Standard</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>$15</span>
                <span style={{ color: 'var(--text-secondary)' }}>/ one-time</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.95rem', flexGrow: 1 }}>
                <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Check size={16} color="var(--accent-color)"/> <strong style={{color:'var(--text-primary)'}}>25 Transfers</strong></li>
                <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Check size={16} color="var(--success-color)"/> Auto Pro Tier Upgraded</li>
                <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Check size={16} color="var(--text-secondary)"/> Burner Domains</li>
                <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Check size={16} color="var(--text-secondary)"/> High-Priority Network Lines</li>
              </ul>
              <button disabled={loading} onClick={() => handlePurchase('pack_25')} className="btn-primary" style={{ width: '100%', padding: '1rem', borderRadius: '8px', fontSize: '1rem', background: 'var(--accent-color)', color: 'white', border: 'none', boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)' }}>Buy Standard</button>
            </div>

            {/* 100 Transfers Card */}
            <div style={{ display: 'flex', flexDirection: 'column', padding: '2rem', borderRadius: '16px', border: '1px solid var(--surface-border)', background: 'var(--background-color)', position: 'relative' }}>
              <Package size={32} color="#f59e0b" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem' }}>Enterprise</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>$25</span>
                <span style={{ color: 'var(--text-secondary)' }}>/ one-time</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.95rem', flexGrow: 1 }}>
                <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Check size={16} color="var(--accent-color)"/> <strong>100 Transfers</strong></li>
                <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Check size={16} color="var(--success-color)"/> Auto Pro Tier Upgraded</li>
                <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Check size={16} color="var(--text-secondary)"/> Burner Domains</li>
                <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Check size={16} color="var(--text-secondary)"/> Pin Storage Indefinitely</li>
              </ul>
              <button disabled={loading} onClick={() => handlePurchase('pack_100')} className="btn-secondary" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', fontSize: '1rem' }}>Buy Enterprise</button>
            </div>

          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '2.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
             <CreditCard size={18} />
             <span>Payments secured by <strong>Stripe</strong>. Supports Visa, Mastercard, Amex, Apple Pay & Google Pay.</span>
          </div>

          {loading && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', zIndex: 10, borderRadius: 'inherit' }}>
              <Loader2 className="animate-spin" size={48} color="var(--accent-color)" />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
