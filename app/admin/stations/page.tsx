'use client';
import { useEffect, useState } from 'react';
import DataTable from '@/components/ui/DataTable';
import StatusPill from '@/components/ui/StatusPill';
import Modal from '@/components/ui/Modal';
import Toast from '@/components/ui/Toast';

const blank = { name: '', location: '', type: 'DC', power: '', lat: '', lng: '' };

export default function AdminStations() {
  const [stations, setStations] = useState<any[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState(blank);

  const load = async () => { const r = await fetch('/api/stations'); setStations(await r.json()); };
  useEffect(() => { load(); }, []);

  const toggle = async (id: string, status: string) => {
    await fetch('/api/stations/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: status === 'online' ? 'offline' : 'online' }) });
    setToast('Station updated'); load();
  };

  const del = async (id: string) => {
    if (!confirm('Delete station?')) return;
    await fetch('/api/stations/' + id, { method: 'DELETE' });
    setToast('Deleted'); load();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/stations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, lat: parseFloat(form.lat)||0, lng: parseFloat(form.lng)||0 }) });
    setToast('Station added'); setAddOpen(false); setForm(blank); load();
  };

  const inp = { width: '100%', background: '#fff', border: '1px solid #ddd', borderRadius: 10, padding: '10px 14px', fontSize: 14, color: '#111', fontFamily: 'Inter, sans-serif', outline: 'none', marginBottom: 12 };
  const Btn = ({ onClick, color, children }: any) => <button onClick={onClick} style={{ background: color + '15', border: '1px solid ' + color + '40', color, padding: '5px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', marginRight: 4 }}>{children}</button>;

  const cols = [
    { key: 'name', label: 'Station Name', render: (v: string) => <span style={{ fontWeight: 600, color: '#111' }}>{v}</span> },
    { key: 'location', label: 'Location' },
    { key: 'type', label: 'Type', render: (v: string) => <span style={{ background: v==='DC'?'rgba(84,160,255,.12)':'rgba(0,214,143,.12)', color: v==='DC'?'#54A0FF':'#00D68F', padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700 }}>{v}</span> },
    { key: 'power', label: 'Power' },
    { key: 'sessions', label: 'Sessions' },
    { key: 'status', label: 'Status', render: (v: string) => <StatusPill status={v || 'online'} /> },
    { key: 'id', label: 'Actions', render: (_: any, r: any) => <div><Btn onClick={() => toggle(r.id, r.status)} color="#f39c12">Toggle</Btn><Btn onClick={() => del(r.id)} color="#e74c3c">🗑</Btn></div> },
  ];

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Charging Stations</h1>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button onClick={() => { setForm(blank); setAddOpen(true); }} style={{ background: '#00b894', border: 'none', borderRadius: 10, padding: '10px 18px', fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer' }}>+ Add Station</button>
      </div>
      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #eee', fontWeight: 600, fontSize: 14 }}>Charging Stations</div>
        <DataTable columns={cols} data={stations} emptyMessage="No stations yet" />
      </div>
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Charging Station">
        <form onSubmit={submit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <input style={inp} placeholder="Station name" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required />
            <input style={inp} placeholder="Location/Area" value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <select style={inp} value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))}><option>DC</option><option>AC</option></select>
            <input style={inp} placeholder="Power e.g. 50 kW" value={form.power} onChange={e => setForm(f => ({...f, power: e.target.value}))} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <input style={inp} placeholder="Latitude e.g. 3.1390" value={form.lat} onChange={e => setForm(f => ({...f, lat: e.target.value}))} />
            <input style={inp} placeholder="Longitude e.g. 101.6869" value={form.lng} onChange={e => setForm(f => ({...f, lng: e.target.value}))} />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setAddOpen(false)} style={{ background: '#fff', border: '1px solid #ddd', borderRadius: 10, padding: '10px 20px', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ background: '#00b894', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 600, color: '#fff', cursor: 'pointer' }}>Add Station</button>
          </div>
        </form>
      </Modal>
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  );
}