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
      <div className="fade-in-up" style={{ padding: '64px 32px', textAlign: 'center', background: '#FFFFFF', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', border: '1px solid #D0D0D0' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '16px', color: '#1A1A1A', fontWeight: 700 }}>Authentication Required</h2>
        <p style={{ color: '#6B6B6B', fontSize: '15px' }}>You must log in to view your transfer telemetry.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="fade-in-up" style={{ padding: '64px 32px', textAlign: 'center', background: '#FFFFFF', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', border: '1px solid #D0D0D0' }}>
        <Loader2 size={48} className="animate-spin" color="#0061D5" style={{ margin: '0 auto' }} />
        <p style={{ marginTop: '16px', color: '#6B6B6B', fontSize: '15px' }}>Loading synergy logs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fade-in-up" style={{ padding: '48px 32px', textAlign: 'center', background: '#FFFFFF', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', border: '1px solid #D0D0D0' }}>
        <p style={{ color: '#b91c1c' }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ padding: '16px', background: 'rgba(0, 97, 213, 0.1)', borderRadius: '12px' }}>
          <ListOrdered size={28} color="#0061D5" />
        </div>
        <div>
          <h2 style={{ fontSize: '24px', margin: 0, color: '#1A1A1A', fontWeight: 700 }}>Transfer History</h2>
          <p style={{ margin: 0, fontSize: '15px', color: '#6B6B6B' }}>Your log of resource optimizations and retrievals.</p>
        </div>
      </div>

      {history.length === 0 ? (
        <div style={{ padding: '64px 32px', textAlign: 'center', background: '#FFFFFF', border: '1px dashed #D0D0D0', borderRadius: '12px' }}>
          <Database size={48} color="#D0D0D0" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', color: '#1A1A1A', fontWeight: 700, margin: '0 0 8px' }}>No telemetry data yet</h3>
          <p style={{ color: '#6B6B6B', fontSize: '15px' }}>Your transfer history will appear here once you optimize or retrieve assets.</p>
        </div>
      ) : (
        <div style={{ background: '#FFFFFF', border: '1px solid #D0D0D0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead style={{ background: '#F4F4F4', borderBottom: '1px solid #D0D0D0' }}>
              <tr>
                <th style={{ padding: '16px 24px', fontWeight: 700, color: '#1A1A1A' }}>Asset Name</th>
                <th style={{ padding: '16px 24px', fontWeight: 700, color: '#1A1A1A' }}>Action</th>
                <th style={{ padding: '16px 24px', fontWeight: 700, color: '#1A1A1A' }}>Size</th>
                <th style={{ padding: '16px 24px', fontWeight: 700, color: '#1A1A1A' }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #D0D0D0' }}>
                  <td style={{ padding: '16px 24px', fontWeight: 600, color: '#1A1A1A' }}>{item.file_name}</td>
                  <td style={{ padding: '16px 24px' }}>
                    {item.transfer_type === 'upload' ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(0, 97, 213, 0.1)', color: '#0061D5', padding: '4px 8px', borderRadius: '100px', fontSize: '12px', fontWeight: 700 }}>
                        <UploadCloud size={14} /> Upload
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(107, 107, 107, 0.1)', color: '#6B6B6B', padding: '4px 8px', borderRadius: '100px', fontSize: '12px', fontWeight: 700 }}>
                        <Download size={14} /> Download
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '16px 24px', color: '#6B6B6B' }}>{(item.size_bytes / (1024 * 1024)).toFixed(2)} MB</td>
                  <td style={{ padding: '16px 24px', color: '#6B6B6B' }}>
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
