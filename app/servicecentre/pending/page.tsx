'use client';
import { useEffect, useState } from 'react';
import StatusPill from '@/components/ui/StatusPill';
import Toast from '@/components/ui/Toast';

export default function SCPending() {
  // 1. Keep state as an array
  const [pending, setPending] = useState<any[]>([]);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/bookings?status=pending');
      const data = await r.json();

      // FIX: Check if data.bookings exists and is an array, 
      // otherwise fallback to an empty array
      if (data && Array.isArray(data.bookings)) {
        setPending(data.bookings);
      } else if (Array.isArray(data)) {
        // Just in case your API returns the array directly
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
        load(); // Refresh the list
      }
    } catch (err) {
      setToast('Failed to update status');
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24, color: '#F1F2F6' }}>Pending Review</h1>
      
      <div style={{ background: '#141420', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', fontWeight: 700, fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#F1F2F6' }}>Pending Bookings</span>
          <span style={{ color: pending.length > 0 ? '#FFA502' : '#00D68F', fontSize: 12, fontWeight: 400 }}>
            {loading ? 'Updating...' : (pending.length > 0 ? pending.length + ' requiring action' : 'All clear ✓')}
          </span>
        </div>

        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {loading && pending.length === 0 ? (
             <div style={{ textAlign: 'center', padding: 48, color: '#44445A' }}>Loading...</div>
          ) : pending.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 48, color: '#00D68F', fontWeight: 700 }}>✅ No pending bookings</div>
          ) : (
            pending.map(b => (
              <div key={b.id || b.bookingRef} style={{ background: '#1C1C2E', border: '1px solid rgba(255,165,2,0.1)', borderRadius: 14, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#F1F2F6', marginBottom: 3 }}>{b.userName}</div>
                    <div style={{ fontSize: 12, color: '#8E8FA8' }}>
                      {b.serviceTypeName || b.service} · {b.bookingDate || b.date} · {b.bookingTime || b.time}
                    </div>
                    <div style={{ fontSize: 11, color: '#44445A', marginTop: 3 }}>
                      {b.userEmail} · {b.vehicleMake} {b.vehicleModel} ({b.vehiclePlate})
                    </div>
                  </div>
                  <StatusPill status="pending" />
                </div>
                
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => act(b.id, 'confirmed')} 
                    style={{ background: 'rgba(0,214,143,.12)', border: '1px solid rgba(0,214,143,.2)', color: '#00D68F', padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit' }}
                  >
                    ✓ Confirm Booking
                  </button>
                  <button 
                    onClick={() => act(b.id, 'cancelled')} 
                    style={{ background: 'rgba(255,71,87,.12)', border: '1px solid rgba(255,71,87,.2)', color: '#FF4757', padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit' }}
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