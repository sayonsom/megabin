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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      <header style={{ background: '#FFFFFF', borderBottom: '1px solid #D0D0D0', display: 'flex', justifyContent: 'center', zIndex: 10, position: 'sticky', top: 0 }}>
        <div style={{ width: '100%', maxWidth: '800px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', boxSizing: 'border-box' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <Box size={24} color="#0061D5" />
            <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#1A1A1A' }}>MegaBin</h1>
          </Link>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/enterprise" style={{ color: '#6B6B6B', fontSize: '0.9rem', textDecoration: 'none', fontWeight: 600 }}>For Enterprises</Link>
            <Link to="/guide" style={{ color: '#6B6B6B', fontSize: '0.9rem', textDecoration: 'none', fontWeight: 600 }}>Guide</Link>
            {user && (
              <Link to="/history" style={{ color: '#6B6B6B', fontSize: '0.9rem', textDecoration: 'none', fontWeight: 600 }}>History</Link>
            )}
            
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                 <span style={{ fontSize: '0.85rem', color: '#6B6B6B' }}>{user.email}</span>
                 <button onClick={signOut} className="btn-ghost" style={{ padding: 0 }}>Log Out</button>
              </div>
            ) : (
              <button onClick={() => setAuthModalOpen(true)} className="btn-ghost" style={{ padding: 0, fontWeight: 600 }}>Log In</button>
            )}

            {user && (
              <div style={{ padding: '0.3rem 0.6rem', border: '1px solid #D0D0D0', borderRadius: '4px', fontSize: '0.85rem', color: isPro ? '#0061D5' : '#6B6B6B' }}>
                Transfers: <strong style={{color: '#1A1A1A'}}>{transfersRemaining}</strong>
              </div>
            )}

            <button onClick={handleProUpgrade} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '13px', borderRadius: '100px' }}>
              Expand Synergy
            </button>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, padding: '2rem 1rem', width: '100%', maxWidth: '800px', margin: '0 auto', boxSizing: 'border-box' }} className="fade-in-up">
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
