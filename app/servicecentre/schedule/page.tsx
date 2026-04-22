'use client';
import { useEffect, useState } from 'react';
import StatusPill from '@/components/ui/StatusPill';
import Toast from '@/components/ui/Toast';

const SLOTS = ['09:00 AM','10:00 AM','11:00 AM','12:00 PM','01:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM'];

export default function SCSchedule() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [day, setDay] = useState(new Date());
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);

  // FIX 1: Safe fetcher that targets the 'bookings' array
  const loadData = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/bookings');
      const data = await r.json();
      
      // Target data.bookings specifically
      if (data && Array.isArray(data.bookings)) {
        setBookings(data.bookings);
      } else {
        setBookings([]);
      }
    } catch (err) {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // FIX 2: Date handling to match Firestore format (YYYY-MM-DD)
  const dateStr = day.toLocaleDateString('en-CA'); // en-CA gives YYYY-MM-DD format
  
  // FIX 3: Updated field names to match your DB (bookingDate and bookingTime)
  const dayBookings = Array.isArray(bookings) 
    ? bookings.filter(b => b.bookingDate === dateStr) 
    : [];

  const dayLabel = day.toLocaleDateString('en-MY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const changeDay = (d: number) => { 
    const nd = new Date(day); 
    nd.setDate(nd.getDate() + d); 
    setDay(nd); 
  };

  const confirm = async (id: string) => {
    const res = await fetch('/api/bookings/' + id, { 
      method: 'PATCH', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ status: 'confirmed' }) 
    });
    
    if (res.ok) {
      setToast('Confirmed'); 
      loadData(); 
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24, color: '#F1F2F6' }}>Schedule</h1>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <button onClick={() => changeDay(-1)} style={{ background: '#1C1C2E', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '9px 16px', color: '#8E8FA8', fontFamily: 'Outfit', cursor: 'pointer', fontSize: 13 }}>← Prev</button>
        <div style={{ flex: 1, textAlign: 'center', fontSize: 15, fontWeight: 700, color: '#F1F2F6' }}>{dayLabel}</div>
        <button onClick={() => changeDay(1)} style={{ background: '#1C1C2E', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '9px 16px', color: '#8E8FA8', fontFamily: 'Outfit', cursor: 'pointer', fontSize: 13 }}>Next →</button>
      </div>

      <div style={{ background: '#141420', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {loading && bookings.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#44445A', padding: 20 }}>Loading schedule...</div>
        ) : SLOTS.map(slot => {
          // FIX 4: Check against bookingTime
          const bkg = dayBookings.find(b => b.bookingTime === slot);
          
          return (
            <div key={slot} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 14, 
              padding: '12px 14px', 
              background: '#1C1C2E', 
              borderRadius: 10, 
              borderLeft: '3px solid ' + (bkg ? (bkg.status === 'pending' ? '#FFA502' : '#00D68F') : 'transparent'), 
              opacity: bkg ? 1 : 0.35 
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#8E8FA8', minWidth: 68 }}>{slot}</span>
              {bkg ? <>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#F1F2F6' }}>{bkg.userName}</div>
                  <div style={{ fontSize: 11, color: '#8E8FA8' }}>
                    {bkg.serviceTypeName || bkg.service} · {bkg.vehiclePlate}
                  </div>
                </div>
                <StatusPill status={bkg.status} />
                {bkg.status === 'pending' && (
                  <button onClick={() => confirm(bkg.id)} style={{ background: 'rgba(0,214,143,.12)', border: '1px solid rgba(0,214,143,.2)', color: '#00D68F', padding: '4px 10px', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit' }}>✓</button>
                )}
              </> : <span style={{ fontSize: 12, color: '#44445A' }}>Available</span>}
            </div>
          );
        })}
      </div>
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  );
}