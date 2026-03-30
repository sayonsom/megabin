import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Uploader from './components/Uploader';
import Viewer from './components/Viewer';
import './index.css';

export default function App() {
  return (
    <Router>
      <div className="container">
        <header className="header fade-in-up">
          <h1 className="title-gradient" style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>MegaBin</h1>
          <p style={{ fontSize: '1.2rem' }}>Share files and text securely, up to 100MB.</p>
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
