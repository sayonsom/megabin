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
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto', padding: '1rem' }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: '900px', margin: 'auto', animation: 'fadeInUp 0.3s ease-out', display: 'flex', flexDirection: 'column', background: '#FFFFFF', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        
        <div style={{ position: 'relative', padding: '40px 40px 24px', textAlign: 'center', borderBottom: '1px solid #D0D0D0' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B6B6B', cursor: 'pointer' }}>
            <X size={20} />
          </button>

          <h2 style={{ fontSize: '24px', margin: '0 0 12px', color: '#1A1A1A', fontWeight: 800 }}>
            Choose Your Synergy
          </h2>
          <p style={{ color: '#6B6B6B', fontSize: '15px', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            Purchase transfer packs. They <strong style={{color: '#1A1A1A'}}>never expire</strong>. Plus, once you buy a pack, you are automatically upgraded to the <strong>Pro Tier</strong>!
          </p>
        </div>

        {error && (
          <div style={{ margin: '24px 40px 0', background: '#fef2f2', color: '#b91c1c', padding: '12px', borderRadius: '8px', fontSize: '14px', textAlign: 'center', border: '1px solid #f87171' }}>
            {error}
          </div>
        )}

        <div style={{ padding: '0 40px 40px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px', flexWrap: 'wrap', margin: '32px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#6B6B6B', fontWeight: 600 }}><Shield size={18} color="#0061D5"/> Better E2E Encryption</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#6B6B6B', fontWeight: 600 }}><Database size={18} color="#0061D5"/> Infinite Data Retention</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#6B6B6B', fontWeight: 600 }}><LayoutGrid size={18} color="#0061D5"/> Pro File Tables</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
              
            {/* 5 Transfers Card */}
            <div style={{ display: 'flex', flexDirection: 'column', padding: '32px', borderRadius: '12px', border: '1px solid #D0D0D0', background: '#FFFFFF', position: 'relative' }}>
              <Package size={32} color="#6B6B6B" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '18px', margin: '0 0 8px', color: '#1A1A1A', fontWeight: 700 }}>Starter</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '24px' }}>
                <span style={{ fontSize: '32px', fontWeight: 800, color: '#1A1A1A' }}>$5</span>
                <span style={{ color: '#6B6B6B', fontSize: '14px' }}>/ one-time</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: '12px', color: '#6B6B6B', fontSize: '14px', flexGrow: 1 }}>
                <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color="#0061D5"/> <strong style={{color: '#1A1A1A'}}>5 Transfers</strong></li>
                <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color="#0061D5"/> Auto Pro Tier Upgraded</li>
                <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color="#9E9E9E"/> Burner Domains</li>
              </ul>
              <button disabled={loading} onClick={() => handlePurchase('pack_5')} className="btn-ghost" style={{ width: '100%', border: '1px solid #0061D5', borderRadius: '100px', fontWeight: 600 }}>Buy Starter</button>
            </div>

            {/* 25 Transfers Card (Popular) */}
            <div style={{ display: 'flex', flexDirection: 'column', padding: '32px', borderRadius: '12px', border: '2px solid #0061D5', background: '#FFFFFF', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)', background: '#0061D5', color: 'white', padding: '2px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Most Popular</div>
              <Package size={32} color="#0061D5" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '18px', margin: '0 0 8px', color: '#1A1A1A', fontWeight: 700 }}>Standard</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '24px' }}>
                <span style={{ fontSize: '32px', fontWeight: 800, color: '#1A1A1A' }}>$15</span>
                <span style={{ color: '#6B6B6B', fontSize: '14px' }}>/ one-time</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: '12px', color: '#6B6B6B', fontSize: '14px', flexGrow: 1 }}>
                <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color="#0061D5"/> <strong style={{color:'#1A1A1A'}}>25 Transfers</strong></li>
                <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color="#0061D5"/> Auto Pro Tier Upgraded</li>
                <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color="#0061D5"/> Burner Domains</li>
                <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color="#0061D5"/> High-Priority Network Lines</li>
              </ul>
              <button disabled={loading} onClick={() => handlePurchase('pack_25')} className="btn-primary" style={{ width: '100%' }}>Buy Standard</button>
            </div>

            {/* 100 Transfers Card */}
            <div style={{ display: 'flex', flexDirection: 'column', padding: '32px', borderRadius: '12px', border: '1px solid #D0D0D0', background: '#FFFFFF', position: 'relative' }}>
              <Package size={32} color="#1A1A1A" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '18px', margin: '0 0 8px', color: '#1A1A1A', fontWeight: 700 }}>Enterprise</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '24px' }}>
                <span style={{ fontSize: '32px', fontWeight: 800, color: '#1A1A1A' }}>$25</span>
                <span style={{ color: '#6B6B6B', fontSize: '14px' }}>/ one-time</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: '12px', color: '#6B6B6B', fontSize: '14px', flexGrow: 1 }}>
                <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color="#0061D5"/> <strong style={{color: '#1A1A1A'}}>100 Transfers</strong></li>
                <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color="#0061D5"/> Auto Pro Tier Upgraded</li>
                <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color="#0061D5"/> Burner Domains</li>
                <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color="#0061D5"/> Pin Storage Indefinitely</li>
              </ul>
              <button disabled={loading} onClick={() => handlePurchase('pack_100')} className="btn-ghost" style={{ width: '100%', border: '1px solid #0061D5', borderRadius: '100px', fontWeight: 600 }}>Buy Enterprise</button>
            </div>

          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '40px', color: '#9E9E9E', fontSize: '12px' }}>
             <CreditCard size={16} />
             <span>Payments secured by <strong>Stripe</strong>. Supports Visa, Mastercard, Amex, Apple Pay & Google Pay.</span>
          </div>

          {loading && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', zIndex: 10, borderRadius: 'inherit' }}>
              <Loader2 className="animate-spin" size={48} color="#0061D5" />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
