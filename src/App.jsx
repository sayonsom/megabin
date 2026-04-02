import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Box } from 'lucide-react';
import * as Sentry from '@sentry/react';
import Uploader from './components/Uploader';
import Viewer from './components/Viewer';
import Guide from './components/Guide';
import Enterprise from './components/Enterprise';
import AuthModal from './components/AuthModal';
import PacksModal from './components/PacksModal';
import TransferHistory from './components/TransferHistory';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './index.css';

function MainApp() {
  const { user, isPro, transfersRemaining, signOut } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [packsModalOpen, setPacksModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    if (query.get('upgraded') === 'true') {
      const added = query.get('packSize') || '5';
      alert(`MegaBin Pro Activated! Added ${added} transfers to your account.`);
      navigate('/', { replace: true });
    }
  }, [location, navigate]);

  const handleProUpgrade = async () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    setPacksModalOpen(true);
  };

  return (
    <div className="container" style={{ position: 'relative', paddingTop: '6rem' }}>
      
      <header style={{ position: 'absolute', top: '1rem', left: '1rem', right: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', textDecoration: 'none' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--accent-color)' }}>
            <Box size={24} color="var(--accent-color)" />
          </div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>MegaBin</h1>
        </Link>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/enterprise" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textDecoration: 'none', marginRight: '0.5rem', transition: 'color 0.2s' }} className="hover:text-white">For Enterprises</Link>
          <Link to="/guide" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textDecoration: 'none', marginRight: '0.5rem', transition: 'color 0.2s' }} className="hover:text-white">Guide</Link>
          {user && (
            <Link to="/history" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textDecoration: 'none', marginRight: '0.5rem', transition: 'color 0.2s' }} className="hover:text-white">History</Link>
          )}
          
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
               <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{user.email}</span>
               <button onClick={signOut} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Log Out</button>
            </div>
          ) : (
            <button onClick={() => setAuthModalOpen(true)} className="btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}>Log In</button>
          )}

          {user && (
            <div style={{ padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', fontSize: '0.9rem', color: isPro ? '#f59e0b' : 'var(--text-secondary)' }}>
              Transfers: <strong>{transfersRemaining}</strong>
            </div>
          )}

          <button 
            onClick={handleProUpgrade} 
            className="btn-primary"
            style={{ padding: '0.6rem 1.2rem', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '8px', boxShadow: 'none' }}
          >
            Expand Synergy
          </button>
        </div>
      </header>

      <main className="fade-in-up" style={{ animationDelay: '0.1s' }}>
        <Routes>
          <Route path="/" element={<Uploader isPro={isPro} />} />
          <Route path="/enterprise" element={<Enterprise />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/history" element={<TransferHistory />} />
          <Route path="/:shortId" element={<Viewer />} />
        </Routes>
      </main>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <PacksModal isOpen={packsModalOpen} onClose={() => setPacksModalOpen(false)} user={user} />
    </div>
  );
}

export default function App() {
  return (
    <Sentry.ErrorBoundary fallback={<div style={{ padding: '2rem', textAlign: 'center', color: 'white' }}><h2>Something went wrong.</h2><p>Please refresh the page or try again later.</p></div>}>
      <AuthProvider>
        <Router>
          <MainApp />
        </Router>
      </AuthProvider>
    </Sentry.ErrorBoundary>
  );
}
