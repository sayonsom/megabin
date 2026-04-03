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
      <div style={{ background: '#FFFFFF', border: '1px solid #D0D0D0', borderRadius: '12px', padding: '64px 32px', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
        <Loader2 size={64} className="animate-spin" color="#0061D5" style={{ margin: '0 auto' }} />
        <p style={{ marginTop: '24px', fontSize: '15px', color: '#6B6B6B' }}>Locating asset...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: '#FFFFFF', border: '1px solid #D0D0D0', borderRadius: '12px', padding: '64px 32px', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
        <AlertTriangle size={64} style={{ margin: '0 auto 24px', color: '#b91c1c' }} />
        <h2 style={{ fontSize: '24px', marginBottom: '16px', color: '#1A1A1A', fontWeight: 700 }}>Oops!</h2>
        <p style={{ marginBottom: '32px', fontSize: '15px', color: '#6B6B6B' }}>{error === 'File not found' ? 'This asset has completed its lifecycle or does not exist.' : 'An error occurred fetching the asset or the database is not configured.'}</p>
        <Link to="/" className="btn-primary" style={{ padding: '12px 32px' }}>Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="fade-in-up" style={{ background: '#FFFFFF', border: '1px solid #D0D0D0', borderRadius: '12px', padding: '40px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px', borderBottom: '1px solid #D0D0D0', paddingBottom: '32px', flexWrap: 'wrap' }}>
        <div style={{ background: 'rgba(0, 97, 213, 0.1)', padding: '20px', borderRadius: '12px', position: 'relative' }}>
          <FileText size={40} color="#0061D5" />
          {hashKey && <ShieldCheck size={20} color="#0061D5" style={{ position: 'absolute', bottom: '-4px', right: '-4px', background: '#FFFFFF', borderRadius: '50%' }} />}
        </div>
        <div style={{ flex: 1, overflow: 'hidden', minWidth: '200px' }}>
          <h2 style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0, fontSize: '24px', marginBottom: '8px', fontWeight: 700, color: '#1A1A1A', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {fileMeta.original_name}
          </h2>
          <p style={{ margin: 0, fontSize: '14px', color: '#6B6B6B' }}>
            {(fileMeta.size_bytes / 1024).toFixed(2)} KB • Expires {new Date(fileMeta.expires_at).toLocaleDateString()} {hashKey && '• E2E Encrypted'}
          </p>
        </div>
        <button className="btn-primary" onClick={handleDownload} style={{ padding: '12px 24px' }}>
          <Download size={20} style={{ marginRight: '8px' }} />
          <span>Retrieve Asset</span>
        </button>
      </div>

      {textContent !== null ? (
        <div style={{ background: '#F4F4F4', padding: '24px', borderRadius: '8px', overflowX: 'auto', border: '1px solid #D0D0D0' }}>
          <pre style={{ margin: 0, color: '#1A1A1A', fontFamily: 'monospace', fontSize: '14px', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
            {textContent}
          </pre>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '64px 32px', background: '#F4F4F4', borderRadius: '8px', border: '1px dashed #D0D0D0' }}>
          <p style={{ fontSize: '15px', color: '#6B6B6B', marginBottom: '24px' }}>
            This asset is either a binary or too large to preview inline. {hashKey && 'It has been successfully localized.'}
          </p>
          <button className="btn-secondary" onClick={handleDownload} style={{ padding: '12px 24px' }}>
            Retrieve Asset to Review
          </button>
        </div>
      )}

      {/* VIRAL HOOK: The Encrypted Reply CTA */}
      <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid #D0D0D0', textAlign: 'center' }}>
        <p style={{ fontSize: '14px', color: '#6B6B6B', marginBottom: '16px' }}>
          Did this alignment streamline your sprint? Send a synergistic update instantly.
        </p>
        <Link to="/" className="btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', padding: '12px 24px', border: '1px solid #0061D5', color: '#0061D5', borderRadius: '100px', fontWeight: 600 }}>
          <ShieldCheck size={18} style={{ marginRight: '8px' }} />
          <span>Send a Synergistic Response</span>
        </Link>
      </div>
    </div>
  );
}
