import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, FileText, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Viewer() {
  const { shortId } = useParams();
  const [fileMeta, setFileMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [textContent, setTextContent] = useState(null);

  useEffect(() => {
    async function fetchFile() {
      try {
        const { data, error } = await supabase
          .from('files')
          .select('*')
          .eq('short_id', shortId)
          .single();

        if (error) throw error;
        if (!data) throw new Error('File not found');

        setFileMeta(data);

        // Check if it's text and under 1MB to render inline
        const isText = data.mime_type?.startsWith('text/');
        if (isText && data.size_bytes < 1024 * 1024) {
          const { data: fileData, error: downloadError } = await supabase
            .storage
            .from('megabin-uploads')
            .download(data.storage_path);
            
          if (!downloadError && fileData) {
            const text = await fileData.text();
            setTextContent(text);
          }
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (shortId) {
      fetchFile();
    }
  }, [shortId]);

  const handleDownload = async () => {
    if (!fileMeta) return;
    try {
      // Get config, public URLs usually sufficient unless private
      const { data } = supabase.storage.from('megabin-uploads').getPublicUrl(fileMeta.storage_path);
      
      const a = document.createElement('a');
      a.href = data.publicUrl;
      a.download = fileMeta.original_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      alert('Error downloading file: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '6rem 2rem', textAlign: 'center' }}>
        <Loader2 size={64} className="animate-spin title-gradient" style={{ margin: '0 auto' }} />
        <p style={{ marginTop: '1.5rem', fontSize: '1.2rem' }}>Looking for file...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <AlertTriangle size={64} style={{ margin: '0 auto 1.5rem', color: 'var(--error-color)' }} />
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Oops!</h2>
        <p style={{ marginBottom: '2.5rem', fontSize: '1.1rem' }}>{error === 'File not found' ? 'This file does not exist or has expired.' : 'An error occurred fetching the file or the database is not configured.'}</p>
        <Link to="/" className="btn-primary">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="glass-panel fade-in-up" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '2rem' }}>
        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1.2rem', borderRadius: '16px' }}>
          <FileText size={40} className="title-gradient" />
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <h2 style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0, fontSize: '1.8rem', marginBottom: '0.5rem' }}>
            {fileMeta.original_name}
          </h2>
          <p style={{ margin: 0, fontSize: '1rem' }}>
            {(fileMeta.size_bytes / 1024).toFixed(2)} KB • Expires {new Date(fileMeta.expires_at).toLocaleDateString()}
          </p>
        </div>
        <button className="btn-primary" onClick={handleDownload} style={{ padding: '0.8rem 1.5rem' }}>
          <Download size={22} />
          <span>Download</span>
        </button>
      </div>

      {textContent !== null ? (
        <div style={{ background: 'rgba(0, 0, 0, 0.4)', padding: '1.5rem', borderRadius: '12px', overflowX: 'auto', border: '1px solid rgba(255,255,255,0.05)' }}>
          <pre style={{ margin: 0, color: '#e5e7eb', fontFamily: 'monospace', fontSize: '0.95rem', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
            {textContent}
          </pre>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px dashed var(--surface-border)' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>This file is either a binary or too large to preview inline.</p>
          <button className="btn-secondary" onClick={handleDownload}>
            Download File to View
          </button>
        </div>
      )}
    </div>
  );
}
