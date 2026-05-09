'use client';

import { useEffect, useState } from 'react';
import DataTable from '@/components/ui/DataTable';
import StatusPill from '@/components/ui/StatusPill';
import Modal from '@/components/ui/Modal';
import Toast from '@/components/ui/Toast';

const blank = {
  name: '',
  location: '',
  contact: '',
  hours: '',
  adminEmail: '',
  password: '',
};

// ---------------- FORM ----------------
function FormFields({ form, setForm }: any) {
  const inputStyle = {
    width: '100%',
    background: '#1C1C2E',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 12,
    padding: '14px 18px',
    fontSize: 15,
    color: '#F1F2F6',
    fontFamily: 'Outfit',
    outline: 'none',
    marginBottom: 16,
  };

  return (
    <>
      <input
        style={inputStyle}
        placeholder="Centre name"
        value={form.name}
        onChange={(e) => setForm((f: any) => ({ ...f, name: e.target.value }))}
        required
      />

      <input
        style={inputStyle}
        placeholder="Location"
        value={form.location}
        onChange={(e) => setForm((f: any) => ({ ...f, location: e.target.value }))}
        required
      />

      <input
        style={inputStyle}
        placeholder="Contact"
        value={form.contact}
        onChange={(e) => setForm((f: any) => ({ ...f, contact: e.target.value }))}
      />

      <input
        style={inputStyle}
        placeholder="Hours"
        value={form.hours}
        onChange={(e) => setForm((f: any) => ({ ...f, hours: e.target.value }))}
      />

      <input
        style={inputStyle}
        type="email"
        placeholder="Admin email"
        value={form.adminEmail}
        onChange={(e) =>
          setForm((f: any) => ({ ...f, adminEmail: e.target.value }))
        }
        required
      />

      <input
        style={inputStyle}
        type="password"
        placeholder="Temporary password"
        value={form.password}
        onChange={(e) =>
          setForm((f: any) => ({ ...f, password: e.target.value }))
        }
        required
      />
    </>
  );
}

// ---------------- PAGE ----------------
export default function AdminCentres() {
  const [centres, setCentres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const [toast, setToast] = useState('');
  const [form, setForm] = useState(blank);

  // ✅ SEARCH STATE
  const [search, setSearch] = useState('');

  // ---------------- LOAD ----------------
  const load = async () => {
    setLoading(true);

    const res = await fetch('/api/centres');
    const json = await res.json();

    const list = Array.isArray(json)
      ? json
      : json?.data || [];

    setCentres(list);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // ---------------- DELETE ----------------
  const del = async (id: string) => {
    if (!confirm('Delete this centre?')) return;

    await fetch(`/api/centres/${id}`, { method: 'DELETE' });

    setToast('Centre deleted');
    load();
  };

  // ---------------- ADD ----------------
  const submitAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('/api/centres', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const json = await res.json();

    if (!res.ok) {
      setToast(json.error || 'Failed');
      return;
    }

    setToast('Centre + account created');
    setAddOpen(false);
    setForm(blank);
    load();
  };

  // ---------------- EDIT ----------------
  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    await fetch(`/api/centres/${editItem.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    setToast('Centre updated');
    setEditItem(null);
    load();
  };

  // ---------------- FILTER (SEARCH) ----------------
  const filteredCentres = centres.filter((c) => {
    const q = search.toLowerCase();

    return (
      c.name?.toLowerCase().includes(q) ||
      c.location?.toLowerCase().includes(q) ||
      c.contact?.toLowerCase().includes(q)
    );
  });

  // ---------------- BUTTON ----------------
  const Btn = ({ onClick, color, children }: any) => (
    <button
      onClick={onClick}
      style={{
        background: color + '20',
        border: `1px solid ${color}40`,
        color,
        padding: '4px 9px',
        borderRadius: 7,
        fontSize: 11,
        fontWeight: 700,
        cursor: 'pointer',
        marginRight: 4,
      }}
    >
      {children}
    </button>
  );

  // ---------------- TABLE ----------------
  const columns = [
    { key: 'name', label: 'Centre Name' },
    { key: 'location', label: 'Location' },
    { key: 'contact', label: 'Contact' },
    { key: 'hours', label: 'Hours' },
    {
      key: 'status',
      label: 'Status',
      render: (v: string) => <StatusPill status={v || 'active'} />,
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_: any, row: any) => (
        <div>
          <Btn
            color="#54A0FF"
            onClick={() => {
              setEditItem(row);
              setForm({ ...row, password: '' });
            }}
          >
            Edit
          </Btn>

          <Btn color="#FF4757" onClick={() => del(row.id)}>
            🗑
          </Btn>
        </div>
      ),
    },
  ];

  // ---------------- UI ----------------
  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>
        Service Centres
      </h1>

      {/* TOP BAR */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <input
          placeholder="Search centres..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            background: '#1C1C2E',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 10,
            padding: '10px 14px',
            color: '#fff',
          }}
        />

        <button
          onClick={() => {
            setForm(blank);
            setAddOpen(true);
          }}
          style={{
            background: '#00D68F',
            border: 'none',
            borderRadius: 10,
            padding: '10px 16px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          + Add Centre
        </button>
      </div>

      {/* TABLE */}
      <DataTable columns={columns} data={filteredCentres} />

      {/* ADD */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Centre">
        <form onSubmit={submitAdd}>
          <FormFields form={form} setForm={setForm} />

          <button type="submit" style={{ width: '100%' }}>
            Save
          </button>
        </form>
      </Modal>

      {/* EDIT */}
      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Edit Centre">
        <form onSubmit={submitEdit}>
          <FormFields form={form} setForm={setForm} />
          <button type="submit">Save</button>
        </form>
      </Modal>

      {/* TOAST */}
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  );
}