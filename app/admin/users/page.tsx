'use client';

import { useEffect, useState } from 'react';
import DataTable from '@/components/ui/DataTable';
import StatusPill from '@/components/ui/StatusPill';
import Modal from '@/components/ui/Modal';
import Toast from '@/components/ui/Toast';

export default function AdminUsers() {

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [toast, setToast] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: ''
  });

  const load = async () => {

    setLoading(true);

    const r = await fetch('/api/users');
    setUsers(await r.json());

    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = users.filter(u =>
    !search ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = async (id: string, status: string) => {

    const next = status === 'active' ? 'suspended' : 'active';

    await fetch('/api/users/' + id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next })
    });

    setToast('User ' + next);
    load();
  };

  const del = async (id: string) => {

    if (!confirm('Delete user?')) return;

    await fetch('/api/users/' + id, { method: 'DELETE' });

    setToast('User deleted');
    load();
  };

  const submit = async (e: React.FormEvent) => {

    e.preventDefault();

    await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    setToast('User added');
    setAddOpen(false);
    setForm({ name: '', email: '' });

    load();
  };

  const fmtDate = (s: string) =>
    s
      ? new Date(s).toLocaleDateString('en-MY', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        })
      : '—';

  const inp = {
    width: '100%',
    background: '#fff',
    border: '1px solid #ddd',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 14,
    color: '#111',
    fontFamily: 'Inter, sans-serif',
    outline: 'none',
    marginBottom: 12
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
        marginRight: 4
      }}
    >
      {children}
    </button>
  );

  const cols = [

    {
      key: 'name',
      label: 'Name',
      render: (v: string) =>
        <span style={{ fontWeight: 600, color: '#111' }}>
          {v}
        </span>
    },

    { key: 'email', label: 'Email' },
    { key: 'vehicles', label: 'Vehicles' },

    {
      key: 'status',
      label: 'Status',
      render: (v: string) => <StatusPill status={v} />
    },

    {
      key: 'createdAt',
      label: 'Joined',
      render: (v: string) => fmtDate(v)
    },

    {
      key: 'id',
      label: 'Actions',
      render: (_: any, r: any) => (

        <div>

          <Btn
            onClick={() => toggle(r.id, r.status)}
            color={r.status === 'active' ? '#f39c12' : '#00b894'}
          >
            {r.status === 'active' ? 'Suspend' : 'Activate'}
          </Btn>

          <Btn
            onClick={() => del(r.id)}
            color="#e74c3c"
          >
            🗑
          </Btn>

        </div>

      )
    }

  ];

  return (

    <div style={{ fontFamily: 'Inter, sans-serif' }}>

      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>
        Users
      </h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3,1fr)',
          gap: 16,
          marginBottom: 22
        }}
      >

        {[
          { l: 'Total Users', v: users.length, c: '#00b894' },
          { l: 'Active', v: users.filter(u => u.status === 'active').length, c: '#3498db' },
          { l: 'Suspended', v: users.filter(u => u.status === 'suspended').length, c: '#e74c3c' }
        ].map(({ l, v, c }) => (

          <div
            key={l}
            style={{
              background: '#fff',
              border: '1px solid #eee',
              borderRadius: 14,
              padding: '18px 20px'
            }}
          >

            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: '#777',
                textTransform: 'uppercase',
                marginBottom: 8
              }}
            >
              {l}
            </div>

            <div
              style={{
                fontSize: 30,
                fontWeight: 700,
                color: c
              }}
            >
              {v}
            </div>

          </div>

        ))}

      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>

        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search users..."
          style={{
            flex: 1,
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: 10,
            padding: '10px 14px',
            fontSize: 14
          }}
        />

        <button
          onClick={() => setAddOpen(true)}
          style={{
            background: '#00b894',
            border: 'none',
            borderRadius: 10,
            padding: '10px 18px',
            fontSize: 14,
            fontWeight: 600,
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          + Add User
        </button>

      </div>

      <div
        style={{
          background: '#fff',
          border: '1px solid #eee',
          borderRadius: 14,
          overflow: 'hidden'
        }}
      >

        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #eee',
            fontWeight: 600,
            fontSize: 14
          }}
        >
          User Directory
          <span
            style={{
              color: '#888',
              fontWeight: 400,
              marginLeft: 8
            }}
          >
            {loading ? 'Loading...' : filtered.length + ' users'}
          </span>
        </div>

        <DataTable
          columns={cols}
          data={filtered}
          emptyMessage="No users found"
        />

      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add User">

        <form onSubmit={submit}>

          <input
            style={inp}
            placeholder="Full name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            required
          />

          <input
            style={inp}
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            required
          />

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>

            <button
              type="button"
              onClick={() => setAddOpen(false)}
              style={{
                background: '#fff',
                border: '1px solid #ddd',
                borderRadius: 10,
                padding: '10px 20px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              style={{
                background: '#00b894',
                border: 'none',
                borderRadius: 10,
                padding: '10px 20px',
                fontWeight: 600,
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              Add User
            </button>

          </div>

        </form>

      </Modal>

      {toast && <Toast message={toast} onClose={() => setToast('')} />}

    </div>
  );
}