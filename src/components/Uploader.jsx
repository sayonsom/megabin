import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, Copy, AlertCircle } from 'lucide-react';
import { uploadFile } from '../utils/upload';

export default function Uploader() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
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
    
    // Check max size (100MB)
    const MAX_SIZE = 100 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError('File exceeds the 100MB limits.');
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      const data = await uploadFile(file, (perc) => {
        setProgress(perc);
      });
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred during upload. Please ensure your Supabase credentials are valid.');
    } finally {
      setIsUploading(false);
    }
  };

  const copyLink = () => {
    const link = `${window.location.origin}/${result.short_id}`;
    navigator.clipboard.writeText(link);
    alert('Link copied to clipboard!');
  };

  if (result) {
    return (
      <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
        <CheckCircle size={64} className="title-gradient file-icon-bounce" style={{ margin: '0 auto 1.5rem', color: 'var(--success-color)' }} />
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Upload Complete!</h2>
        <p style={{ marginBottom: '2rem', fontSize: '1.1rem' }}>Your file is ready to share.</p>
        
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
          <input 
            type="text" 
            className="input-base" 
            value={`${window.location.origin}/${result.short_id}`} 
            readOnly 
          />
          <button className="btn-primary" onClick={copyLink} style={{ flexShrink: 0 }}>
            <Copy size={20} />
            <span>Copy</span>
          </button>
        </div>
        
        <button className="btn-secondary" onClick={() => { setResult(null); setFile(null); setProgress(0); }}>
          Upload Another File
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
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Drag & drop a file here</h3>
            <p style={{ fontSize: '1.1rem' }}>or click to browse (Max 100MB)</p>
          </div>
        )}
      </div>

      {error && (
        <div style={{ marginTop: '1.5rem', padding: '1rem 1.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--error-color)' }}>
          <AlertCircle size={24} style={{ flexShrink: 0 }} />
          <span style={{ lineHeight: 1.4 }}>{error}</span>
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
          {isUploading ? `Uploading... ${progress}%` : 'Upload File'}
        </button>
      </div>
    </div>
  );
}
