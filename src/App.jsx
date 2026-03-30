import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Uploader from './components/Uploader';
import Viewer from './components/Viewer';
import './index.css';

export default function App() {
  return (
    <Router>
      <div className="container" style={{ position: 'relative', paddingTop: '6rem' }}>
        
        {/* Global Strategy Header: Branding + Monetization Hook */}
        <header style={{ position: 'absolute', top: '1rem', left: '1rem', right: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
              <span style={{ fontSize: '1.4rem' }}>⚡</span>
            </div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>MegaBin</h1>
          </div>
          
          <button 
            onClick={() => alert("🎉 MegaBin Pro Waitlist\n\nTired of getting domains flagged by Corporate DLP?\n\nPro Features:\n- 🛡️ Dedicated, rotating 'Burner Domains' to endlessly evade blacklists\n- 🚀 Up to 5GB chunked file loads\n- ⏰ Permanent Storage Pinning\n\nShoot an email to founders@gridspeed.pro to request immediate early access!")} 
            className="btn-primary"
            style={{ padding: '0.6rem 1.2rem', background: 'linear-gradient(to right, #10b981, #06b6d4)', border: 'none', borderRadius: '24px', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }}
          >
            🚀 Unlock Pro
          </button>
        </header>

        <main className="fade-in-up" style={{ animationDelay: '0.1s' }}>
          <Routes>
            <Route path="/" element={<Uploader />} />
            <Route path="/:shortId" element={<Viewer />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
