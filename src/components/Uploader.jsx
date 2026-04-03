import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, Copy, AlertCircle, Shield, Pin, Globe } from 'lucide-react';
import { uploadFile, uploadFileStealth } from '../utils/upload';
import { generateEncryptionKey, importEncryptionKey, encryptFileToTextBlob } from '../utils/crypto';
import { supabase } from '../lib/supabase';

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
  const [retryAlgorithm, setRetryAlgorithm] = useState('balanced');
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

      const options = { pinFile, retryAlgorithm };
      let data;
      
      if (retryAlgorithm === 'stealth') {
        data = await uploadFileStealth(uploadableFile, originalMeta, (perc) => setProgress(perc), options);
      } else {
        data = await uploadFile(uploadableFile, originalMeta, (perc) => setProgress(perc), options);
      }
      
      if (isPro && useBurner) {
        setBurnerHost(`https://b-${Math.random().toString(36).substring(2,6)}.gridspeed.pro`);
      } else {
        setBurnerHost(window.location.origin);
      }
      
      setResult(data);
      
      // Deduct transfer credit if a pro feature was used
      const isProUpload = file.size > 100 * 1024 * 1024 || pinFile || useBurner;
      if (isProUpload) {
        await supabase.rpc('decrement_transfer');
      }
      
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
      <div style={{ background: '#FFFFFF', border: '1px solid #D0D0D0', borderRadius: '12px', padding: '64px 32px', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
        <CheckCircle size={64} style={{ margin: '0 auto 24px', color: '#0061D5' }} />
        <h2 style={{ fontSize: '32px', marginBottom: '8px', color: '#1A1A1A', fontWeight: 800 }}>Optimization Complete</h2>
        <p style={{ marginBottom: '32px', fontSize: '15px', color: '#6B6B6B' }}>
           Deliverable optimized. Ready for cross-functional alignment. {generatedKey && <strong style={{color:'#0061D5'}}><br/>Secured with E2E Synergy.</strong>}
        </p>
        
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px' }}>
          <input 
            type="text" 
            className="input-base" 
            value={`${burnerHost}/${result.short_id}${generatedKey ? '#' + generatedKey : ''}`} 
            readOnly 
            style={{ flex: 1 }}
          />
          <button className="btn-primary" onClick={copyLink} style={{ flexShrink: 0, padding: '12px 24px' }}>
            <Copy size={20} style={{ marginRight: '8px' }} />
            <span>Copy</span>
          </button>
        </div>
        
        {generatedKey && (
          <p style={{ fontSize: '13px', color: '#9E9E9E', marginBottom: '32px' }}>
            Note: Keep this alignment link secure. The quantum state of this asset requires it for observation.
          </p>
        )}

        <button className="btn-ghost" style={{ border: '1px solid #0061D5', borderRadius: '100px', fontWeight: 600 }} onClick={() => { setResult(null); setFile(null); setProgress(0); setGeneratedKey(null); }}>
          Optimize Another Resource
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #D0D0D0', borderRadius: '12px', padding: '40px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
      <div 
        className="dropzone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        style={{ border: '2px dashed #D0D0D0', borderRadius: '8px', padding: '64px 32px', textAlign: 'center', background: '#F4F4F4', cursor: 'pointer', transition: 'all 0.2s', marginBottom: '24px' }}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          style={{ display: 'none' }}
          disabled={isUploading}
        />
        
        <UploadCloud size={64} className={isUploading ? "file-icon-bounce" : ""} color="#0061D5" style={{ margin: '0 auto 24px' }} />
        
        {file ? (
          <div>
            <h3 style={{ color: '#1A1A1A', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>{file.name}</h3>
            <p style={{ fontSize: '15px', color: '#6B6B6B' }}>{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
          </div>
        ) : (
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1A1A1A', marginBottom: '8px' }}>Drop deliverables here for paradigm shifting</h3>
            <p style={{ fontSize: '15px', color: '#6B6B6B' }}>or click to browse (Max {isPro ? '5GB' : '100MB'})</p>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        <div style={{ padding: '16px', background: useEncryption ? 'rgba(0, 97, 213, 0.05)' : '#F4F4F4', border: `1px solid ${useEncryption ? '#0061D5' : '#D0D0D0'}`, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', cursor: isUploading ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }} onClick={() => !isUploading && setUseEncryption(!useEncryption)}>
          <Shield size={24} color={useEncryption ? "#0061D5" : "#6B6B6B"} />
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: 0, color: '#1A1A1A', fontSize: '15px', fontWeight: 700 }}>End-to-End Encryption</h4>
            <p style={{ margin: 0, fontSize: '14px', color: '#6B6B6B' }}>Streamlines assets locally before syncing to ensure frictionless corporate alignment.</p>
          </div>
          <div>
            <input type="checkbox" checked={useEncryption} readOnly style={{ transform: 'scale(1.2)', accentColor: '#0061D5' }} />
          </div>
        </div>

        {isPro && (
          <>
            <div style={{ padding: '16px', background: pinFile ? 'rgba(0, 97, 213, 0.05)' : '#F4F4F4', border: `1px solid ${pinFile ? '#0061D5' : '#D0D0D0'}`, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', cursor: isUploading ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }} onClick={() => !isUploading && setPinFile(!pinFile)}>
              <Pin size={24} color={pinFile ? "#0061D5" : "#6B6B6B"} />
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, color: '#1A1A1A', fontSize: '15px', fontWeight: 700 }}>Permanent Pinning</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#6B6B6B' }}>Retains the original file securely indefinitely rather than auto-deleting after 7 days.</p>
              </div>
              <div>
                <input type="checkbox" checked={pinFile} readOnly style={{ transform: 'scale(1.2)', accentColor: '#0061D5' }} />
              </div>
            </div>

            <div style={{ padding: '16px', background: useBurner ? 'rgba(0, 97, 213, 0.05)' : '#F4F4F4', border: `1px solid ${useBurner ? '#0061D5' : '#D0D0D0'}`, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', cursor: isUploading ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }} onClick={() => !isUploading && setUseBurner(!useBurner)}>
              <Globe size={24} color={useBurner ? "#0061D5" : "#6B6B6B"} />
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, color: '#1A1A1A', fontSize: '15px', fontWeight: 700 }}>Burner Domain Routing</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#6B6B6B' }}>Generates a one-off temporary "Ghost" domain URL highly immune to enterprise DNS blocking.</p>
              </div>
              <div>
                <input type="checkbox" checked={useBurner} readOnly style={{ transform: 'scale(1.2)', accentColor: '#0061D5' }} />
              </div>
            </div>
          </>
        )}
      </div>

      {error && (
        <div style={{ padding: '16px 24px', background: '#fef2f2', border: '1px solid #f87171', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', color: '#b91c1c', marginBottom: '24px' }}>
          <AlertCircle size={24} style={{ flexShrink: 0 }} />
          <span style={{ lineHeight: 1.4, fontSize: '14px' }}>{error}</span>
        </div>
      )}

      {error && showStealthOption && (
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
          <button 
            className="btn-primary" 
            onClick={handleStealthUpload} 
            disabled={isUploading}
            style={{ width: '100%', maxWidth: '300px' }}
          >
            Retry with more power
          </button>
        </div>
      )}

      {isUploading && (
        <div className="progress-container" style={{ marginBottom: '24px' }}>
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
      )}
      
      {!isUploading && file && (
        <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          <label style={{ fontSize: '13px', color: '#1A1A1A', fontWeight: 600 }}>Transfer Algorithm (Retry Strategy)</label>
          <select 
            className="input-base" 
            style={{ width: '100%', maxWidth: '300px', cursor: 'pointer' }}
            value={retryAlgorithm}
            onChange={(e) => setRetryAlgorithm(e.target.value)}
          >
            <option value="balanced">Balanced (Default)</option>
            <option value="aggressive">Aggressive (Fast Retries)</option>
            <option value="corporate_firewall">Corporate Firewall Bypass (Small Chunks)</option>
            <option value="stealth">Max Stealth (Encrypted Chunks)</option>
          </select>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button 
          className="btn-primary" 
          onClick={handleUpload} 
          disabled={!file || isUploading}
          style={{ width: '100%', padding: '14px', fontSize: '15px' }}
        >
          {isUploading ? `Optimizing... ${progress}%` : 'Optimize Resource'}
        </button>
      </div>
    </div>
  );
}
