'use client';
import Swal from 'sweetalert2';
import { useEffect, useState, useCallback } from 'react';
import DataTable from '@/components/ui/DataTable';
import StatusPill from '@/components/ui/StatusPill';
import Modal from '@/components/ui/Modal';
import Toast from '@/components/ui/Toast';

const SERVICES = ['Battery Health Check', 'Full Inspection', 'Tyre Service', 'Software Update'];
const SLOTS = ['09:00 AM', '11:00 AM', '01:00 PM', '03:00 PM', '05:00 PM'];
const PRICES: Record<string,number> = { 'Battery Health Check': 50, 'Full Inspection': 120, 'Tyre Service': 80, 'Software Update': 0 };

export default function AdminBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState<'success'|'error'>('success');
  const [centres, setCentres] = useState<any[]>([]);
  const [form, setForm] = useState({ userName: '', userEmail: '', service: SERVICES[0], centre: '', date: '', time: SLOTS[0], amount: '50' });

  const load = useCallback(async () => {
  setLoading(true);

  try {
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (search) params.set('search', search);

    const r = await fetch('/api/bookings?' + params, {
      credentials: 'include', // ✅ important for auth later
    });

    if (!r.ok) {
      const err = await r.text();
      console.error("API ERROR:", err);
      setBookings([]);
      return;
    }

    const data = await r.json();
    console.log("BOOKINGS:", data);

    setBookings(data);
  } catch (err) {
    console.error("FETCH ERROR:", err);
    setBookings([]);
  }

  setLoading(false);
}, [search, statusFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { fetch('/api/centres').then(r => r.json()).then(setCentres); }, []);

  const showToast = (msg: string, type: 'success'|'error' = 'success') => { setToast(msg); setToastType(type); };

  const updateStatus = async (id: string, status: string) => {
    const r = await fetch('/api/bookings/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    if (r.ok) { showToast('Booking ' + status); load(); } else showToast('Failed', 'error');
  };

  const deleteB = async (id: string) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: 'This booking will be deleted!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#FF4757',
    cancelButtonColor: '#8E8FA8',
    confirmButtonText: 'Yes',
  });

  if (!result.isConfirmed) return;

  const r = await fetch('/api/bookings/' + id, { method: 'DELETE' });

  if (r.ok) {
    await Swal.fire({
      title: 'Deleted!',
      text: 'Booking has been removed.',
      icon: 'success',
    });
    load();
  } else {
    Swal.fire('Error', 'Failed to delete booking', 'error');
  }
};

  const submitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await fetch('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (r.ok) { showToast('Booking added'); setAddOpen(false); load(); } else showToast('Failed', 'error');
  };

  const Btn = ({ onClick, color, children }: any) => (
    <button onClick={onClick} style={{ background: color + '20', border: '1px solid ' + color + '40', color, padding: '4px 9px', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit', marginRight: 4 }}>{children}</button>
  );

  const cols = [
    { key: 'userName', label: 'Customer', render: (v: string, r: any) => <div><div style={{ color: '#F1F2F6', fontWeight: 700 }}>{v}</div><div style={{ fontSize: 11, color: '#44445A' }}>{r.userEmail}</div></div> },
    { key: 'service', label: 'Service' },
    { key: 'centre', label: 'Centre' },
    { key: 'date', label: 'Date', render: (v: string, r: any) => v + ' ' + r.time },
    { key: 'amount', label: 'Amount', render: (v: number) => <b style={{ color: '#F1F2F6' }}>{v ? 'RM ' + v : 'FREE'}</b> },
    { key: 'status', label: 'Status', render: (v: string) => <StatusPill status={v} /> },
    { key: 'id', label: 'Actions', render: (_: any, r: any) => <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      {r.status === 'pending' && <><Btn onClick={() => updateStatus(r.id,'confirmed')} color="#00D68F">✓ Approve</Btn><Btn onClick={() => updateStatus(r.id,'cancelled')} color="#FF4757">✗ Reject</Btn></>}
      {r.status === 'confirmed' && <Btn onClick={() => updateStatus(r.id,'completed')} color="#8E8FA8">Done</Btn>}
      <Btn onClick={() => deleteB(r.id)} color="#FF4757">🗑</Btn>
    </div> },
  ];

  const Field = ({ label, children }: any) => <div style={{ marginBottom: 12 }}><label style={{ fontSize: 11, color: '#44445A', fontWeight: 700, display: 'block', marginBottom: 5 }}>{label}</label>{children}</div>;
  const inp = { width: '100%', background: '#1C1C2E', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#F1F2F6', fontFamily: 'Outfit', outline: 'none' };

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Bookings</h1>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} placeholder="Search..." style={{ ...inp, flex: 1, minWidth: 200 }} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ ...inp, width: 'auto' }}>
          <option value="">All Status</option>
          {['pending','confirmed','completed','cancelled'].map(s => <option key={s}>{s}</option>)}
        </select>
        <button onClick={load} style={{ ...inp, width: 'auto', cursor: 'pointer', color: '#8E8FA8' }}>Search</button>
        <button onClick={() => setAddOpen(true)} style={{ background: '#00D68F', border: 'none', borderRadius: 10, padding: '9px 16px', fontSize: 13, fontWeight: 700, color: '#000', fontFamily: 'Outfit', cursor: 'pointer' }}>+ Add</button>
      </div>
      <div style={{ background: '#141420', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700, fontSize: 13 }}>All Bookings</span>
          <span style={{ color: '#44445A', fontSize: 12 }}>{loading ? 'Loading...' : bookings.length + ' records'}</span>
        </div>
        <DataTable columns={cols} data={bookings} />
      </div>
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Booking">
        <form onSubmit={submitAdd}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Customer Name"><input style={inp} value={form.userName} onChange={e => setForm(f => ({...f, userName: e.target.value}))} required placeholder="Full name" /></Field>
            <Field label="Email"><input style={inp} type="email" value={form.userEmail} onChange={e => setForm(f => ({...f, userEmail: e.target.value}))} placeholder="email@example.com" /></Field>
          </div>
          <Field label="Service"><select style={inp} value={form.service} onChange={e => setForm(f => ({...f, service: e.target.value, amount: String(PRICES[e.target.value]||0)}))}>{SERVICES.map(s=><option key={s}>{s}</option>)}</select></Field>
          <Field label="Centre"><select style={inp} value={form.centre} onChange={e => setForm(f => ({...f, centre: e.target.value}))}><option value="">Select centre</option>{centres.map((c:any)=><option key={c.id} value={c.name}>{c.name}</option>)}</select></Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Date"><input style={inp} type="date" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} required /></Field>
            <Field label="Time"><select style={inp} value={form.time} onChange={e => setForm(f => ({...f, time: e.target.value}))}>{SLOTS.map(s=><option key={s}>{s}</option>)}</select></Field>
          </div>
          <Field label="Amount (RM)"><input style={inp} type="number" value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))} /></Field>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" onClick={() => setAddOpen(false)} style={{ ...inp, width: 'auto', cursor: 'pointer', color: '#8E8FA8' }}>Cancel</button>
            <button type="submit" style={{ background: '#00D68F', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 700, color: '#000', fontFamily: 'Outfit', cursor: 'pointer' }}>Add Booking</button>
          </div>
        </form>
      </Modal>
      {toast && <Toast message={toast} type={toastType} onClose={() => setToast('')} />}
    </div>
  );
}
