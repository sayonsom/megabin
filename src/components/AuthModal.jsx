import React, { useState } from 'react';
import { X, Mail, Lock, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AuthModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
             emailRedirectTo: window.location.origin
          }
        });
        if (error) throw error;
        alert("Registration successful! You may now log in.");
        setIsLogin(true);
      }
      if (isLogin) onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: '1rem' }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: '400px', padding: '40px', margin: 'auto', animation: 'fadeInUp 0.3s ease-out', background: '#FFFFFF', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#6B6B6B', cursor: 'pointer' }}>
          <X size={24} />
        </button>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '8px', color: '#1A1A1A', fontWeight: 800 }}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={{ color: '#6B6B6B', fontSize: '15px' }}>
            {isLogin ? 'Log in to securely transfer payloads.' : 'Join MegaBin to evade endpoint monitoring.'}
          </p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px', textAlign: 'center', border: '1px solid #f87171' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#6B6B6B' }} />
            <input 
              type="email" 
              placeholder="Email address" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required 
              className="input-base" 
              style={{ paddingLeft: '44px', width: '100%', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#6B6B6B' }} />
            <input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required 
              className="input-base" 
              style={{ paddingLeft: '44px', width: '100%', boxSizing: 'border-box' }}
            />
          </div>
          
          <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '16px', width: '100%', padding: '12px' }}>
            {loading ? <Loader2 className="animate-spin" color="#FFFFFF" size={20} style={{ margin: '0 auto' }} /> : (isLogin ? 'Log In' : 'Sign Up')}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: '#6B6B6B' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => { setIsLogin(!isLogin); setError(''); }} style={{ background: 'none', border: 'none', color: '#0061D5', cursor: 'pointer', fontWeight: 600, padding: 0 }}>
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </div>
    </div>
  );
}
