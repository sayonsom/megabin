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
import LandingPage from './components/LandingPage';
import ContactPage from './components/ContactPage';
import AgentWorkspace from './components/AgentWorkspace';
import CisoDashboard from './components/CisoDashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './index.css';

function MainApp() {
  const { user, isPro, transfersRemaining, signOut } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [packsModalOpen, setPacksModalOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
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

  const isMarketing = ['/', '/enterprise', '/guide', '/contact'].includes(location.pathname);
  const isFullscreenTool = ['/demo', '/admin'].includes(location.pathname);
  const containerMaxWidth = isMarketing ? '1200px' : '100%';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {!isFullscreenTool && (
      <header style={{ background: '#FFFFFF', borderBottom: '1px solid #D0D0D0', display: 'flex', justifyContent: 'center', zIndex: 10, position: 'sticky', top: 0 }}>
        <div style={{ width: '100%', maxWidth: containerMaxWidth, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', boxSizing: 'border-box' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <Box size={24} color="#0061D5" />
            <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#1A1A1A' }}>MegaBin</h1>
          </Link>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div 
              style={{ position: 'relative' }} 
              onMouseEnter={() => setToolsDropdownOpen(true)}
              onMouseLeave={() => setToolsDropdownOpen(false)}
            >
              <span style={{ color: '#6B6B6B', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>Tools</span>
              {toolsDropdownOpen && (
                <div style={{ position: 'absolute', top: '100%', left: '-0.5rem', paddingTop: '0.5rem' }}>
                  <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.25rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', minWidth: '160px', zIndex: 50 }}>
                    <Link to="/move" style={{ display: 'block', padding: '0.5rem 1rem', color: '#1A1A1A', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, borderRadius: '4px', transition: 'background 0.2s' }} onMouseOver={(e) => e.target.style.background = '#F0F6FF'} onMouseOut={(e) => e.target.style.background = 'transparent'}>Quick Move</Link>
                    <Link to="/demo" style={{ display: 'block', padding: '0.5rem 1rem', color: '#1A1A1A', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, borderRadius: '4px', transition: 'background 0.2s' }} onMouseOver={(e) => e.target.style.background = '#F0F6FF'} onMouseOut={(e) => e.target.style.background = 'transparent'}>AI Agent Demo</Link>
                    <Link to="/admin" target="_blank" rel="noreferrer" style={{ display: 'block', padding: '0.5rem 1rem', color: '#0061D5', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 700, borderRadius: '4px', transition: 'background 0.2s' }} onMouseOver={(e) => e.target.style.background = '#F0F6FF'} onMouseOut={(e) => e.target.style.background = 'transparent'}>CISO Dashboard</Link>
                  </div>
                </div>
              )}
            </div>
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
      )}

      <main style={{ flex: 1, padding: isFullscreenTool ? '0' : isMarketing ? '0' : '2rem', width: '100%', maxWidth: '100%', margin: '0 auto', boxSizing: 'border-box' }} className="fade-in-up">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/move" element={<Uploader isPro={isPro} />} />
          <Route path="/enterprise" element={<Enterprise />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/demo" element={<AgentWorkspace />} />
          <Route path="/admin" element={<CisoDashboard />} />
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
