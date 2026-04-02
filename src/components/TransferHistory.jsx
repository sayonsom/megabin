import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Database, UploadCloud, Download, Loader2, ListOrdered } from 'lucide-react';

export default function TransferHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    const fetchHistory = async () => {
      try {
        const { data, error } = await supabase
          .from('transfer_history')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setHistory(data || []);
      } catch (err) {
        console.error('Error fetching history:', err);
        setError('Failed to load transfer history.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, [user]);

  if (!user) {
    return (
      <div className="glass-panel fade-in-up" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Authentication Required</h2>
        <p>You must log in to view your transfer telemetry.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="glass-panel fade-in-up" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <Loader2 size={48} className="animate-spin title-gradient" style={{ margin: '0 auto' }} />
        <p style={{ marginTop: '1rem' }}>Loading synergy logs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel fade-in-up" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--error-color)' }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ padding: '0.8rem', background: 'var(--accent-glow)', borderRadius: '12px' }}>
          <ListOrdered size={28} className="title-gradient" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.8rem', margin: 0 }}>Transfer History</h2>
          <p style={{ margin: 0, fontSize: '1rem' }}>Your log of resource optimizations and retrievals.</p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', background: '#f8fafc', border: '2px dashed var(--surface-border)' }}>
          <Database size={48} color="var(--surface-border)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.4rem' }}>No telemetry data yet</h3>
          <p>Your transfer history will appear here once you optimize or retrieve assets.</p>
        </div>
      ) : (
        <div className="box-table-container">
          <table className="box-table">
            <thead>
              <tr>
                <th className="box-th">Asset Name</th>
                <th className="box-th">Action</th>
                <th className="box-th">Size</th>
                <th className="box-th">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id} className="box-tr">
                  <td className="box-td" style={{ fontWeight: 600 }}>{item.file_name}</td>
                  <td className="box-td">
                    {item.transfer_type === 'upload' ? (
                      <span className="box-badge box-badge-upload">
                        <UploadCloud size={14} /> Upload
                      </span>
                    ) : (
                      <span className="box-badge box-badge-download">
                        <Download size={14} /> Download
                      </span>
                    )}
                  </td>
                  <td className="box-td">{(item.size_bytes / (1024 * 1024)).toFixed(2)} MB</td>
                  <td className="box-td" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(item.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
