'use client';

import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import Toast from '@/components/ui/Toast';

export default function AdminNotifications() {

  const [notifs, setNotifs] = useState<any[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [toast, setToast] = useState('');

  const [form, setForm] = useState({
    title: '',
    message: '',
    type: 'info'
  });

  const load = async () => {
    const r = await fetch('/api/notifications');
    setNotifs(await r.json());
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id: string) => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, read: true })
    });
    load();
  };

  const del = async (id: string) => {
    await fetch('/api/notifications', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });

    setToast('Notification deleted');
    load();
  };

  const submit = async (e: React.FormEvent) => {

    e.preventDefault();

    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    setToast('Notification sent');
    setAddOpen(false);

    setForm({
      title: '',
      message: '',
      type: 'info'
    });

    load();
  };

  const typeColor = (t: string) =>
    t === 'error' ? '#e74c3c' :
    t === 'warning' ? '#f39c12' :
    '#3498db';

  const typeIcon = (t: string) =>
    t === 'error' ? '🚨' :
    t === 'warning' ? '⚠️' :
    'ℹ️';

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

  return (

    <div style={{ fontFamily: 'Inter, sans-serif' }}>

      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>
        Notifications
      </h1>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>

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
          + Send Notification
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
          System Notifications
        </div>

        <div
          style={{
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10
          }}
        >

          {notifs.length === 0 ? (

            <div
              style={{
                textAlign: 'center',
                padding: 40,
                color: '#777'
              }}
            >
              No notifications
            </div>

          ) : notifs.map(n => (

            <div
              key={n.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: 14,
                background: '#fafafa',
                border: '1px solid #eee',
                borderRadius: 10,
                opacity: n.read ? 0.55 : 1
              }}
            >

              <span style={{ fontSize: 22 }}>
                {typeIcon(n.type)}
              </span>

              <div style={{ flex: 1 }}>

                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#111',
                    marginBottom: 3
                  }}
                >
                  {n.title}
                </div>

                <div
                  style={{
                    fontSize: 13,
                    color: '#666'
                  }}
                >
                  {n.message}
                </div>

              </div>

              <div style={{ display: 'flex', gap: 6 }}>

                {!n.read && (

                  <button
                    onClick={() => markRead(n.id)}
                    style={{
                      background: '#eef6ff',
                      border: '1px solid #d6eaff',
                      color: '#3498db',
                      padding: '5px 10px',
                      borderRadius: 7,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Mark Read
                  </button>

                )}

                <button
                  onClick={() => del(n.id)}
                  style={{
                    background: '#ffecec',
                    border: '1px solid #ffd6d6',
                    color: '#e74c3c',
                    padding: '5px 10px',
                    borderRadius: 7,
                    fontSize: 12,
                    cursor: 'pointer'
                  }}
                >
                  🗑
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Send Notification">

        <form onSubmit={submit}>

          <input
            style={inp}
            placeholder="Notification title"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            required
          />

          <textarea
            style={{ ...inp, minHeight: 90, resize: 'vertical' }}
            placeholder="Message..."
            value={form.message}
            onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
            required
          />

          <select
            style={inp}
            value={form.type}
            onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
          >
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Critical</option>
          </select>

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
              Send
            </button>

          </div>

        </form>

      </Modal>

      {toast && <Toast message={toast} onClose={() => setToast('')} />}

    </div>
  );
}