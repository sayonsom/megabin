import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, Copy, AlertCircle, Shield, Pin, Globe } from 'lucide-react';
import { uploadFile, uploadFileStealth } from '../utils/upload';
import { generateEncryptionKey, importEncryptionKey, encryptFileToTextBlob } from '../utils/crypto';

export default function Uploader({ isPro }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [useEncryption, setUseEncryption] = useState(false);
  const [pinFile, setPinFile] = useState(false);
  const [useBurner, setUseBurner] = useState(false);
  const [burnerHost, setBurnerHost] = useState('');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [generatedKey, setGeneratedKey] = useState(null);
  const [showStealthOption, setShowStealthOption] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('active');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('active');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('active');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    const MAX_SIZE = isPro ? 5000 * 1024 * 1024 : 100 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError(`File exceeds the ${isPro ? '5GB' : '100MB'} limit.`);
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setError(null);
    setGeneratedKey(null);
    setShowStealthOption(false);

    try {
      let uploadableFile = file;
      let keyStr = null;

      if (useEncryption) {
        keyStr = await generateEncryptionKey();
        const cryptoKey = await importEncryptionKey(keyStr);
        const textBlob = await encryptFileToTextBlob(file, cryptoKey);
        // Build an actual File object from the blob
        uploadableFile = new File([textBlob], file.name + '.enc.txt', { type: 'text/plain' });
        setGeneratedKey(keyStr);
      }

      const originalMeta = {
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size
      };

      const data = await uploadFile(uploadableFile, originalMeta, (perc) => {
        setProgress(perc);
      }, { pinFile });
      
      if (isPro && useBurner) {
        setBurnerHost(`https://b-${Math.random().toString(36).substring(2,6)}.gridspeed.pro`);
      } else {
        setBurnerHost(window.location.origin);
      }
      
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred during upload. Please ensure your Supabase credentials are valid.');
      setShowStealthOption(true);
    } finally {
      setIsUploading(false);
    }
  };

  const copyLink = () => {
    const link = `${burnerHost}/${result.short_id}${generatedKey ? '#' + generatedKey : ''}`;
    navigator.clipboard.writeText(link);
    alert('Link copied to clipboard!');
  };

  const handleStealthUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setProgress(0);
    setError(null);
    setGeneratedKey(null);
    setShowStealthOption(false);

    try {
      let uploadableFile = file;
      let keyStr = null;

      if (useEncryption) {
        keyStr = await generateEncryptionKey();
        const cryptoKey = await importEncryptionKey(keyStr);
        const textBlob = await encryptFileToTextBlob(file, cryptoKey);
        uploadableFile = new File([textBlob], file.name + '.enc.txt', { type: 'text/plain' });
        setGeneratedKey(keyStr);
      }

      const originalMeta = { name: file.name, type: file.type || 'application/octet-stream', size: file.size };
      const data = await uploadFileStealth(uploadableFile, originalMeta, (perc) => setProgress(perc), { pinFile });
      
      if (isPro && useBurner) {
        setBurnerHost(`https://b-${Math.random().toString(36).substring(2,6)}.gridspeed.pro`);
      } else {
        setBurnerHost(window.location.origin);
      }
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Stealth upload also failed. The network might be completely blocking Supabase.');
    } finally {
      setIsUploading(false);
    }
  };

  if (result) {
    return (
      <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
        <CheckCircle size={64} className="title-gradient file-icon-bounce" style={{ margin: '0 auto 1.5rem', color: 'var(--success-color)' }} />
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Optimization Complete!</h2>
        <p style={{ marginBottom: '2rem', fontSize: '1.1rem' }}>
           Deliverable optimized. Ready for cross-functional alignment. {generatedKey && <strong style={{color:'var(--success-color)'}}><br/>Secured with E2E Synergy.</strong>}
        </p>
        
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
          <input 
            type="text" 
            className="input-base" 
            value={`${burnerHost}/${result.short_id}${generatedKey ? '#' + generatedKey : ''}`} 
            readOnly 
          />
          <button className="btn-primary" onClick={copyLink} style={{ flexShrink: 0 }}>
            <Copy size={20} />
            <span>Copy</span>
          </button>
        </div>
        
        {generatedKey && (
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Note: Keep this alignment link secure. The quantum state of this asset requires it for observation.
          </p>
        )}

        <button className="btn-secondary" onClick={() => { setResult(null); setFile(null); setProgress(0); setGeneratedKey(null); }}>
          Optimize Another Resource
        </button>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <div 
        className="dropzone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          style={{ display: 'none' }}
          disabled={isUploading}
        />
        
        <UploadCloud size={64} className={isUploading ? "file-icon-bounce title-gradient" : "title-gradient"} style={{ margin: '0 auto 1.5rem', opacity: 0.8 }} />
        
        {file ? (
          <div>
            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>{file.name}</h3>
            <p style={{ fontSize: '1.1rem' }}>{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
          </div>
        ) : (
          <div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Drop deliverables here for paradigm shifting</h3>
            <p style={{ fontSize: '1.1rem' }}>or click to browse (Max {isPro ? '5GB' : '100MB'})</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ padding: '1rem', background: useEncryption ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: isUploading ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }} onClick={() => !isUploading && setUseEncryption(!useEncryption)}>
          <Shield size={24} color={useEncryption ? "var(--success-color)" : "var(--text-secondary)"} />
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: 0, color: useEncryption ? "var(--success-color)" : "var(--text-primary)" }}>End-to-End Encryption (Firewall Bypass)</h4>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>Streamlines assets locally before syncing to ensure frictionless corporate alignment.</p>
          </div>
          <div>
            <input type="checkbox" checked={useEncryption} readOnly style={{ transform: 'scale(1.2)' }} />
          </div>
        </div>

        {isPro && (
          <>
            <div style={{ padding: '1rem', background: pinFile ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: isUploading ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }} onClick={() => !isUploading && setPinFile(!pinFile)}>
              <Pin size={24} color={pinFile ? "#f59e0b" : "var(--text-secondary)"} />
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, color: pinFile ? "#f59e0b" : "var(--text-primary)" }}>Permanent Pinning</h4>
                <p style={{ margin: 0, fontSize: '0.85rem' }}>Retains the original file securely indefinitely rather than auto-deleting after 7 days.</p>
              </div>
              <div>
                <input type="checkbox" checked={pinFile} readOnly style={{ transform: 'scale(1.2)', accentColor: '#f59e0b' }} />
              </div>
            </div>

            <div style={{ padding: '1rem', background: useBurner ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: isUploading ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }} onClick={() => !isUploading && setUseBurner(!useBurner)}>
              <Globe size={24} color={useBurner ? "#f59e0b" : "var(--text-secondary)"} />
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, color: useBurner ? "#f59e0b" : "var(--text-primary)" }}>Burner Domain Routing</h4>
                <p style={{ margin: 0, fontSize: '0.85rem' }}>Generates a one-off temporary "Ghost" domain URL highly immune to enterprise DNS blocking.</p>
              </div>
              <div>
                <input type="checkbox" checked={useBurner} readOnly style={{ transform: 'scale(1.2)', accentColor: '#f59e0b' }} />
              </div>
            </div>
          </>
        )}
      </div>

      {error && (
        <div style={{ marginTop: '1.5rem', padding: '1rem 1.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--error-color)' }}>
          <AlertCircle size={24} style={{ flexShrink: 0 }} />
          <span style={{ lineHeight: 1.4 }}>{error}</span>
        </div>
      )}

      {error && showStealthOption && (
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', animation: 'fadeIn 0.5s ease-out' }}>
          <button 
            className="btn-primary" 
            onClick={handleStealthUpload} 
            disabled={isUploading}
            style={{ width: '100%', maxWidth: '300px', background: 'linear-gradient(to right, #8b5cf6, #ec4899)', border: 'none', boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)' }}
          >
            ⚡ Retry with more power
          </button>
        </div>
      )}

      {isUploading && (
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
      )}

      <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center' }}>
        <button 
          className="btn-primary" 
          onClick={handleUpload} 
          disabled={!file || isUploading}
          style={{ width: '100%', maxWidth: '300px', padding: '1rem', fontSize: '1.1rem' }}
        >
          {isUploading ? `Optimizing... ${progress}%` : 'Optimize Resource'}
        </button>
      </div>
    </div>
  );
}
