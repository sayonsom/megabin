import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Download, FileText, AlertTriangle, Loader2, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { importEncryptionKey, decryptTextBlobToFile } from '../utils/crypto';

export default function Viewer() {
  const { shortId } = useParams();
  const location = useLocation();
  const hashKey = location.hash ? location.hash.slice(1) : null;
  
  const [fileMeta, setFileMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [textContent, setTextContent] = useState(null);
  const [decryptedBlobUrl, setDecryptedBlobUrl] = useState(null);

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

        // Fetch the file contents directly if it's text OR if it's encrypted (since we must decrypt to render/download)
        const isText = data.mime_type?.startsWith('text/');
        const shouldFetchInline = (isText && data.size_bytes < 1024 * 1024) || hashKey;

        if (shouldFetchInline) {
          const { data: publicUrlData } = supabase.storage.from('megabin-uploads').getPublicUrl(data.storage_path);
          
          if (hashKey) {
             const key = await importEncryptionKey(hashKey);
             const resp = await fetch(publicUrlData.publicUrl);
             if (!resp.ok) throw new Error("Failed to fetch public URL backing");
             const textDataUrl = await resp.text();
             
             const decryptedBlob = await decryptTextBlobToFile(textDataUrl, key, data.mime_type);
             setDecryptedBlobUrl(URL.createObjectURL(decryptedBlob));

             if (isText && data.size_bytes < 1024 * 1024) {
                const text = await decryptedBlob.text();
                setTextContent(text);
             }
          } else if (isText) {
             const resp = await fetch(publicUrlData.publicUrl);
             const text = await resp.text();
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
    
    return () => {
       if (decryptedBlobUrl) URL.revokeObjectURL(decryptedBlobUrl);
    };
  }, [shortId, hashKey]);

  const handleDownload = async () => {
    if (!fileMeta) return;
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user) {
         try {
           await supabase.from('transfer_history').insert([{
             user_id: sessionData.session.user.id,
             file_name: fileMeta.original_name,
             transfer_type: 'download',
             size_bytes: fileMeta.size_bytes
           }]);
         } catch(err) {
           console.error('Failed to log download:', err);
         }
      }

      if (decryptedBlobUrl) {
         const a = document.createElement('a');
         a.href = decryptedBlobUrl;
         a.download = fileMeta.original_name;
         document.body.appendChild(a);
         a.click();
         document.body.removeChild(a);
         return;
      }

      // Standard public download
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
        <p style={{ marginTop: '1.5rem', fontSize: '1.2rem' }}>Locating asset...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <AlertTriangle size={64} style={{ margin: '0 auto 1.5rem', color: 'var(--error-color)' }} />
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Oops!</h2>
        <p style={{ marginBottom: '2.5rem', fontSize: '1.1rem' }}>{error === 'File not found' ? 'This asset has completed its lifecycle or does not exist.' : 'An error occurred fetching the asset or the database is not configured.'}</p>
        <Link to="/" className="btn-primary">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="glass-panel fade-in-up" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '2rem' }}>
        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1.2rem', borderRadius: '16px', position: 'relative' }}>
          <FileText size={40} className="title-gradient" />
          {hashKey && <ShieldCheck size={20} color="var(--success-color)" style={{ position: 'absolute', bottom: '-4px', right: '-4px', background: 'var(--bg-color)', borderRadius: '50%' }} />}
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <h2 style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0, fontSize: '1.8rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {fileMeta.original_name}
          </h2>
          <p style={{ margin: 0, fontSize: '1rem', color: hashKey ? 'var(--success-color)' : 'var(--text-secondary)' }}>
            {(fileMeta.size_bytes / 1024).toFixed(2)} KB • Expires {new Date(fileMeta.expires_at).toLocaleDateString()} {hashKey && '• E2E Encrypted'}
          </p>
        </div>
        <button className="btn-primary" onClick={handleDownload} style={{ padding: '0.8rem 1.5rem' }}>
          <Download size={22} />
          <span>Retrieve Asset</span>
        </button>
      </div>

      {textContent !== null ? (
        <div style={{ background: '#f1f5f9', padding: '1.5rem', borderRadius: '12px', overflowX: 'auto', border: '1px solid var(--surface-border)' }}>
          <pre style={{ margin: 0, color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '0.95rem', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
            {textContent}
          </pre>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#f8fafc', borderRadius: '12px', border: '2px dashed var(--surface-border)' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>
            This asset is either a binary or too large to preview inline. {hashKey && 'It has been successfully localized.'}
          </p>
          <button className="btn-secondary" onClick={handleDownload}>
            Retrieve Asset to Review
          </button>
        </div>
      )}

      {/* VIRAL HOOK: The Encrypted Reply CTA */}
      <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--surface-border)', textAlign: 'center' }}>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1.2rem' }}>
          Did this alignment streamline your sprint? Send a synergistic update instantly.
        </p>
        <Link to="/" className="btn-secondary" style={{ display: 'inline-flex', padding: '0.8rem 1.5rem' }}>
          <ShieldCheck size={20} style={{ color: 'var(--success-color)' }} />
          <span>Send a Synergistic Response</span>
        </Link>
      </div>
    </div>
  );
}
