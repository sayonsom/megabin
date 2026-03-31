import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Uploader from './components/Uploader';
import Viewer from './components/Viewer';
import Guide from './components/Guide';
import AuthModal from './components/AuthModal';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './index.css';

function MainApp() {
  const { user, isPro, signOut } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    if (query.get('upgraded') === 'true') {
      alert("🎉 MegaBin Pro Activated! Thank you for subscribing.");
      navigate('/', { replace: true });
    }
  }, [location, navigate]);

  const handleProUpgrade = async () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (isPro) {
      alert("✅ MegaBin Pro is already active!");
      return;
    }
    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, email: user.email })
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to initialize billing secure proxy.");
      }
    } catch (err) {
      console.error(err);
      alert("Billing microservice is temporarily offline.");
    }
  };

  return (
    <div className="container" style={{ position: 'relative', paddingTop: '6rem' }}>
      
      <header style={{ position: 'absolute', top: '1rem', left: '1rem', right: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', textDecoration: 'none' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            <span style={{ fontSize: '1.4rem' }}>⚡</span>
          </div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>MegaBin</h1>
        </Link>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/guide" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textDecoration: 'none', marginRight: '0.5rem', transition: 'color 0.2s' }} className="hover:text-white">Guide</Link>
          
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
               <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{user.email}</span>
               <button onClick={signOut} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Log Out</button>
            </div>
          ) : (
            <button onClick={() => setAuthModalOpen(true)} className="btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}>Log In</button>
          )}

          <button 
            onClick={handleProUpgrade} 
            className="btn-primary"
            style={{ padding: '0.6rem 1.2rem', background: isPro ? 'linear-gradient(to right, #fbbf24, #f59e0b)' : 'linear-gradient(to right, #10b981, #06b6d4)', color: isPro ? '#000' : '#fff', border: 'none', borderRadius: '24px', boxShadow: isPro ? '0 4px 15px rgba(245, 158, 11, 0.4)' : '0 4px 15px rgba(16, 185, 129, 0.3)' }}
          >
            {isPro ? '👑 PRO ACTIVE' : '🚀 Upgrade to Pro'}
          </button>
        </div>
      </header>

      <main className="fade-in-up" style={{ animationDelay: '0.1s' }}>
        <Routes>
          <Route path="/" element={<Uploader isPro={isPro} />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/:shortId" element={<Viewer />} />
        </Routes>
      </main>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <MainApp />
      </Router>
    </AuthProvider>
  );
}
