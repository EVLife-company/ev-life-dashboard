'use client';
import Swal from 'sweetalert2';
import { useEffect, useState, useCallback } from 'react';
import DataTable from '@/components/ui/DataTable';
import StatusPill from '@/components/ui/StatusPill';
import Modal from '@/components/ui/Modal';
import Toast from '@/components/ui/Toast';

const SERVICES = ['Battery Health Check', 'Full Inspection', 'Tyre Service', 'Software Update'];
const SLOTS = ['09:00 AM', '11:00 AM', '01:00 PM', '03:00 PM', '05:00 PM'];

const PRICES: Record<string, number> = {
  'Battery Health Check': 50,
  'Full Inspection': 120,
  'Tyre Service': 80,
  'Software Update': 0
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [centreFilter, setCentreFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [centres, setCentres] = useState<any[]>([]);

  const [form, setForm] = useState({
    userName: '',
    userEmail: '',
    service: SERVICES[0],
    centre: '',
    date: '',
    time: SLOTS[0],
    amount: '50'
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/bookings');
      const result = await r.json();
      const actualBookings = result.data || result.bookings || (Array.isArray(result) ? result : []);
      setBookings(actualBookings);
    } catch (err) {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    fetch('/api/centres')
      .then(r => r.json())
      .then(res => {
        const actualCentres =
          res.data ||
          res.centres ||
          (Array.isArray(res) ? res : []);

        setCentres(actualCentres);
      });
  }, []);

  // --- FILTER LOGIC ---
  const filtered = bookings.filter(b => {
    const matchesSearch = !search || 
      b.userName?.toLowerCase().includes(search.toLowerCase()) || 
      b.userEmail?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || b.status === statusFilter;
    const matchesCentre = !centreFilter || b.centre === centreFilter;
    const matchesService = !serviceFilter || b.service === serviceFilter;
    return matchesSearch && matchesStatus && matchesCentre && matchesService;
  });

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast(msg);
    setToastType(type);
  };

  const updateStatus = async (id: string, status: string) => {
    const r = await fetch('/api/bookings/' + id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (r.ok) { showToast('Booking ' + status); load(); } else showToast('Failed', 'error');
  };

  const deleteB = async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This booking will be deleted!',
      icon: 'warning',
      background: '#1C1C2E',
      color: '#fff',
      showCancelButton: true,
      confirmButtonColor: '#FF4757',
      cancelButtonColor: '#8E8FA8',
      confirmButtonText: 'Yes',
    });
    if (!result.isConfirmed) return;
    const r = await fetch('/api/bookings/' + id, { method: 'DELETE' });
    if (r.ok) {
      Swal.fire({ title: 'Deleted!', icon: 'success', background: '#1C1C2E', color: '#fff' });
      load();
    }
  };

  const submitAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      userName: form.userName,
      userEmail: form.userEmail,
      serviceTypeName: form.service,
      serviceCentreName: form.centre,
      bookingDate: form.date,
      bookingTime: form.time,
      amount: Number(form.amount)
    };

    const r = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await r.json();

    if (r.ok) {
      showToast('Booking added');
      setAddOpen(false);
      load();
    } else {
      console.log(data);
      showToast(data?.message || 'Failed', 'error');
    }
  };

  // --- STYLES ---
  const inp = {
    background: '#1C1C2E',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 14,
    color: '#fff',
    outline: 'none'
  };

  const Btn = ({ onClick, color, children }: any) => (
    <button
      onClick={onClick}
      style={{
        background: color + '15',
        border: '1px solid ' + color + '40',
        color,
        padding: '5px 10px',
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 600,
        cursor: 'pointer',
        marginRight: 4,
        marginBottom: 4
      }}
    >
      {children}
    </button>
  );

  const cols = [
    {
      key: 'userName',
      label: 'Customer',
      render: (v: string, r: any) => (
        <div>
          <div style={{ color: '#fff', fontWeight: 600 }}>{v}</div>
          <div style={{ fontSize: 12, color: '#888' }}>{r.userEmail}</div>
        </div>
      )
    },
    { key: 'service', label: 'Service' },
    { key: 'centre', label: 'Centre' },
    { key: 'date', label: 'Date', render: (v: string, r: any) => v + ' ' + r.time },
    { key: 'amount', label: 'Amount', render: (v: any) => <b style={{ color: '#fff' }}>{v ? 'RM ' + v : 'FREE'}</b> },
    { key: 'status', label: 'Status', render: (v: string) => <StatusPill status={v} /> },
    {
      key: 'id',
      label: 'Actions',
      render: (_: any, r: any) => (
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {r.status === 'pending' && <>
            <Btn onClick={() => updateStatus(r.id, 'confirmed')} color="#00b894">✓ Approve</Btn>
            <Btn onClick={() => updateStatus(r.id, 'cancelled')} color="#FF4757">✗ Reject</Btn>
          </>}
          {r.status === 'confirmed' && <Btn onClick={() => updateStatus(r.id, 'completed')} color="#54A0FF">Done</Btn>}
          <Btn onClick={() => deleteB(r.id)} color="#FF4757">🗑</Btn>
        </div>
      )
    }
  ];

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Bookings</h1>

      {/* Filters Area */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search name or email..."
          style={{ ...inp, flex: 1, minWidth: 200 }}
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ ...inp, width: 'auto' }}>
          <option value="">All Status</option>
          {['pending', 'confirmed', 'completed', 'cancelled'].map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
        </select>
        <select value={centreFilter} onChange={e => setCentreFilter(e.target.value)} style={{ ...inp, width: 'auto' }}>
          <option value="">All Centres</option>
          {centres.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
        <select value={serviceFilter} onChange={e => setServiceFilter(e.target.value)} style={{ ...inp, width: 'auto' }}>
          <option value="">All Services</option>
          {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <button
          onClick={() => setAddOpen(true)}
          style={{ background: '#00b894', border: 'none', borderRadius: 10, padding: '10px 18px', fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer' }}
        >
          + Add
        </button>
      </div>

      {/* Table Container */}
      <div style={{ background: '#1C1C2E', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
        </div>
        <DataTable columns={cols} data={filtered} />
      </div>

      {/* Add Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Booking">
        <form onSubmit={submitAdd} style={{ color: '#fff' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 5 }}>Customer Name</label>
              <input style={{ ...inp, width: '100%' }} value={form.userName} onChange={e => setForm(f => ({ ...f, userName: e.target.value }))} required />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 5 }}>Email</label>
              <input style={{ ...inp, width: '100%' }} type="email" value={form.userEmail} onChange={e => setForm(f => ({ ...f, userEmail: e.target.value }))} />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 5 }}>Service</label>
            <select style={{ ...inp, width: '100%' }} value={form.service} onChange={e => setForm(f => ({ ...f, service: e.target.value, amount: String(PRICES[e.target.value] || 0) }))}>
              {SERVICES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 5 }}>Centre</label>
            <select style={{ ...inp, width: '100%' }} value={form.centre} onChange={e => setForm(f => ({ ...f, centre: e.target.value }))} required>
              <option value="">Select centre</option>
              {centres.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 5 }}>Date</label>
              <input style={{ ...inp, width: '100%' }} type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 5 }}>Time</label>
              <select style={{ ...inp, width: '100%' }} value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}>
                {SLOTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 5 }}>Amount (RM)</label>
            <input style={{ ...inp, width: '100%' }} type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setAddOpen(false)} style={{ background: 'transparent', border: '1px solid #444', color: '#ccc', borderRadius: 10, padding: '10px 20px', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ background: '#00b894', border: 'none', borderRadius: 10, padding: '10px 22px', fontWeight: 600, color: '#fff', cursor: 'pointer' }}>Create Booking</button>
          </div>
        </form>
      </Modal>

      {toast && <Toast message={toast} type={toastType} onClose={() => setToast('')} />}
    </div>
  );
}