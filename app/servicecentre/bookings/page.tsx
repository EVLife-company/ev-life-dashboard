'use client';
import { useEffect, useState, useCallback } from 'react';
import DataTable from '@/components/ui/DataTable';
import StatusPill from '@/components/ui/StatusPill';
import Toast from '@/components/ui/Toast';

export default function SCBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
  setLoading(true);
  try {
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (search) params.set('search', search);
    
    const r = await fetch('/api/bookings?' + params);
    const result = await r.json();

    // CHECK THIS LINE: 
    // If your apiResponse() helper wraps the data, 'result' might look like { data: { bookings: [...] } }
    // Based on your error, 'result' is the object, so we need result.bookings
    if (result && Array.isArray(result.bookings)) {
      setBookings(result.bookings);
    } else if (result && Array.isArray(result.data?.bookings)) {
      setBookings(result.data.bookings);
    } else {
      console.error("Data received is not in the expected format:", result);
      setBookings([]);
    }
  } catch (error) {
    setBookings([]);
  } finally {
    setLoading(false);
  }
}, [search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const update = async (id: string, status: string) => {
    await fetch('/api/bookings/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    setToast('Booking ' + status); load();
  };

  const Btn = ({ onClick, color, children }: any) => (
    <button onClick={onClick} style={{ background: color + '20', border: '1px solid ' + color + '40', color, padding: '4px 9px', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit', marginRight: 4 }}>{children}</button>
  );

  const cols = [
    { key: 'userName', label: 'Customer', render: (v: string, r: any) => <div><div style={{ color: '#F1F2F6', fontWeight: 700 }}>{v}</div><div style={{ fontSize: 11, color: '#44445A' }}>{r.userEmail}</div></div> },
    { key: 'service', label: 'Service' },
    { key: 'date', label: 'Date & Time', render: (v: string, r: any) => v + ' ' + r.time },
    { key: 'vehicleMake', label: 'Vehicle', render: (v: string, r: any) => v + ' ' + r.vehicleModel },
    { key: 'amount', label: 'Amount', render: (v: number) => <b style={{ color: '#F1F2F6' }}>{v ? 'RM ' + v : 'FREE'}</b> },
    { key: 'status', label: 'Status', render: (v: string) => <StatusPill status={v} /> },
    { key: 'id', label: 'Actions', render: (_: any, r: any) => <div>
      {r.status === 'pending' && <><Btn onClick={() => update(r.id,'confirmed')} color="#00D68F">✓ Confirm</Btn><Btn onClick={() => update(r.id,'cancelled')} color="#FF4757">✗ Reject</Btn></>}
      {r.status === 'confirmed' && <Btn onClick={() => update(r.id,'completed')} color="#8E8FA8">Mark Done</Btn>}
    </div> },
  ];

  const inp = { background: '#1C1C2E', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '9px 14px', fontSize: 13, color: '#F1F2F6', fontFamily: 'Outfit', outline: 'none' };

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>All Bookings</h1>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} placeholder="Search..." style={{ ...inp, flex: 1, minWidth: 200 }} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ ...inp }}>
          <option value="">All Status</option>
          {['pending','confirmed','completed','cancelled'].map(s => <option key={s}>{s}</option>)}
        </select>
        <button onClick={load} style={{ ...inp, cursor: 'pointer', color: '#8E8FA8' }}>Search</button>
      </div>
      <div style={{ background: '#141420', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', fontWeight: 700, fontSize: 13, display: 'flex', justifyContent: 'space-between' }}>
          <span>Bookings</span>
          <span style={{ color: '#44445A', fontWeight: 400, fontSize: 12 }}>{loading ? 'Loading...' : bookings.length + ' records'}</span>
        </div>
        <DataTable columns={cols} data={bookings} />
      </div>
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  );
}
