import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Uploader from './components/Uploader';
import Viewer from './components/Viewer';
import './index.css';

export default function App() {
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('megabin_pro_pass') === 'SAMSUNG-PRO') {
      setIsPro(true);
    }
  }, []);

  const handleProUnlock = () => {
    if (isPro) {
      alert("✅ MegaBin Pro is already active!");
      return;
    }
    const pass = window.prompt("Enter Pro Passcode (Hint: SAMSUNG-PRO):");
    if (pass === 'SAMSUNG-PRO') {
      localStorage.setItem('megabin_pro_pass', 'SAMSUNG-PRO');
      setIsPro(true);
      alert("🎉 MegaBin Pro Unlocked!\nEnjoy Burner Domains, 5GB Chunking, and Persistent Storage.");
    } else if (pass) {
      alert("❌ Invalid Passcode. Please contact founders@gridspeed.pro for access.");
    }
  };

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
            onClick={handleProUnlock} 
            className="btn-primary"
            style={{ padding: '0.6rem 1.2rem', background: isPro ? 'linear-gradient(to right, #fbbf24, #f59e0b)' : 'linear-gradient(to right, #10b981, #06b6d4)', color: isPro ? '#000' : '#fff', border: 'none', borderRadius: '24px', boxShadow: isPro ? '0 4px 15px rgba(245, 158, 11, 0.4)' : '0 4px 15px rgba(16, 185, 129, 0.3)' }}
          >
            {isPro ? '👑 PRO ACTIVE' : '🚀 Unlock Pro'}
          </button>
        </header>

        <main className="fade-in-up" style={{ animationDelay: '0.1s' }}>
          <Routes>
            <Route path="/" element={<Uploader isPro={isPro} />} />
            <Route path="/:shortId" element={<Viewer />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
