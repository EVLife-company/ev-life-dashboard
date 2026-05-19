'use client';
import { useEffect, useState } from 'react';
import StatusPill from '@/components/ui/StatusPill';
import Toast from '@/components/ui/Toast';

export default function SCPending() {
  const [pending, setPending] = useState<any[]>([]);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/bookings?status=pending');
      const data = await r.json();

      if (data && Array.isArray(data.bookings)) {
        setPending(data.bookings);
      } else if (Array.isArray(data)) {
        setPending(data);
      } else {
        setPending([]);
      }
    } catch (err) {
      console.error("Failed to load bookings:", err);
      setPending([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const act = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/bookings/' + id, { 
        method: 'PATCH', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ status }) 
      });
      
      if (res.ok) {
        setToast('Booking ' + status); 
        load(); 
      }
    } catch (err) {
      setToast('Failed to update status');
    }
  };

  return (
    <div style={{ padding: '0 4px', width: '100%', boxSizing: 'border-box' }}>
      {/* Dynamic CSS styles for card layout adjustments */}
      <style dangerouslySetInnerHTML={{__html: `
        .booking-row-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
          gap: 16px;
        }
        .action-button-group {
          display: flex;
          gap: 8px;
        }
        @media (max-width: 640px) {
          .booking-row-header {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          .action-button-group {
            width: 100%;
            flex-direction: column;
            gap: 10px;
            margin-top: 4px;
          }
          .action-button-group button {
            width: 100%;
            text-align: center;
            padding: 12px 16px !important;
          }
        }
      `}} />

      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24, color: '#F1F2F6' }}>
        Pending Review
      </h1>
      
      <div style={{ background: '#141420', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', fontWeight: 700, fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#F1F2F6' }}>Pending Bookings</span>
          <span style={{ color: pending.length > 0 ? '#FFA502' : '#00D68F', fontSize: 12, fontWeight: 400, flexShrink: 0 }}>
            {loading ? 'Updating...' : (pending.length > 0 ? pending.length + ' requiring action' : 'All clear ✓')}
          </span>
        </div>

        <div style={{ padding: '12px 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {loading && pending.length === 0 ? (
             <div style={{ textAlign: 'center', padding: 48, color: '#44445A' }}>Loading...</div>
          ) : pending.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 48, color: '#00D68F', fontWeight: 700 }}>✅ No pending bookings</div>
          ) : (
            pending.map(b => (
              <div key={b.id || b.bookingRef} style={{ background: '#1C1C2E', border: '1px solid rgba(255,165,2,0.1)', borderRadius: 14, padding: 16, boxSizing: 'border-box' }}>
                
                {/* Header Information Wrap */}
                <div className="booking-row-header">
                  <div style={{ wordBreak: 'break-word', flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#F1F2F6', marginBottom: 4 }}>{b.userName}</div>
                    <div style={{ fontSize: 13, color: '#8E8FA8', lineHeight: 1.4 }}>
                      {b.serviceTypeName || b.service} · {b.bookingDate || b.date} · {b.bookingTime || b.time}
                    </div>
                    <div style={{ fontSize: 11, color: '#44445A', marginTop: 5, lineHeight: 1.4 }}>
                      {b.userEmail} <br style={{ display: 'var(--mobile-br, none)' }} /> {b.vehicleMake} {b.vehicleModel} ({b.vehiclePlate})
                    </div>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    <StatusPill status="pending" />
                  </div>
                </div>
                
                {/* Responsive Button Group */}
                <div className="action-button-group">
                  <button 
                    onClick={() => act(b.id, 'confirmed')} 
                    style={{ background: 'rgba(0,214,143,.12)', border: '1px solid rgba(0,214,143,.2)', color: '#00D68F', padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit', transition: 'all 0.2s' }}
                  >
                    ✓ Confirm Booking
                  </button>
                  <button 
                    onClick={() => act(b.id, 'cancelled')} 
                    style={{ background: 'rgba(255,71,87,.12)', border: '1px solid rgba(255,71,87,.2)', color: '#FF4757', padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit', transition: 'all 0.2s' }}
                  >
                    ✗ Decline
                  </button>
                </div>

              </div>
            ))
          )}
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  );
}