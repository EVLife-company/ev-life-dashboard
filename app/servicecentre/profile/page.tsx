'use client';

import { useEffect, useState } from 'react';
import Toast from '@/components/ui/Toast';

export default function SCProfile() {
  const [centre, setCentre] = useState<any>(null);
  const [form, setForm] = useState({
    name: '',
    location: '',
    contact: '',
    hours: '',
  });
  const [stats, setStats] = useState<any>(null);
  const [toast, setToast] = useState('');

  // ✅ LOAD CURRENT USER CENTRE ONLY
  useEffect(() => {
    fetch('/api/centres/me')
      .then(r => r.json())
      .then((data) => {
        const c = Array.isArray(data) ? data[0] : data;

        if (c) {
          setCentre(c);
          setForm({
            name: c.name || '',
            location: c.location || '',
            contact: c.contact || '',
            hours: c.hours || '',
          });
        }
      });

    fetch('/api/dashboard/stats')
      .then(r => r.json())
      .then(setStats);
  }, []);

  // ✅ AUTO SAVE (debounced)
  useEffect(() => {
    if (!centre?.id) return;

    const timer = setTimeout(async () => {
      try {
        const cleanForm = Object.fromEntries(
          Object.entries(form).filter(([_, v]) => v !== undefined)
        );

        await fetch('/api/centres/' + centre.id, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cleanForm),
        });

        setToast('Auto-saved');
      } catch (err) {
        setToast('Auto-save failed');
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [form, centre]);

  // ✅ MANUAL SAVE
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!centre?.id) return;

    try {
      await fetch('/api/centres/' + centre.id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      setToast('Profile saved');
      setCentre((c: any) => ({ ...c, ...form }));
    } catch (err) {
      setToast('Save failed');
    }
  };

  const inp: React.CSSProperties = {
    width: '100%',
    background: '#1C1C2E',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 13,
    color: '#F1F2F6',
    fontFamily: 'Outfit',
    outline: 'none',
    marginBottom: 12,
  };

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>
        Centre Profile
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        
        {/* LEFT FORM */}
        <div style={{
          background: '#141420',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 16,
        }}>
          <div style={{
            padding: '15px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            fontWeight: 700,
            fontSize: 13,
          }}>
            Centre Details
          </div>

          <form onSubmit={save} style={{ padding: 20 }}>
            {[
              ['Centre Name', 'name'],
              ['Location', 'location'],
              ['Contact Number', 'contact'],
              ['Operating Hours', 'hours'],
            ].map(([label, key]) => (
              <div key={key as string}>
                <label style={{
                  fontSize: 11,
                  color: '#44445A',
                  fontWeight: 700,
                  display: 'block',
                  marginBottom: 5,
                }}>
                  {label}
                </label>

                <input
                  style={inp}
                  value={(form as any)[key]}
                  onChange={e =>
                    setForm(f => ({
                      ...f,
                      [key]: e.target.value,
                    }))
                  }
                />
              </div>
            ))}

            <button
              type="submit"
              style={{
                background: '#00D68F',
                border: 'none',
                borderRadius: 10,
                padding: '11px 24px',
                fontWeight: 700,
                color: '#000',
                cursor: 'pointer',
              }}
            >
              Save Changes
            </button>
          </form>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          <div style={{
            background: '#141420',
            borderRadius: 16,
            padding: 20,
          }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 16 }}>
              Statistics
            </div>

            {stats &&
              [
                { label: 'Total Bookings', val: stats.totalBookings },
                { label: 'Completed', val: stats.completedBookings },
                { label: 'Revenue', val: 'RM ' + stats.totalRevenue?.toLocaleString() },
                { label: 'Rating', val: centre?.rating ? '⭐ ' + centre.rating : 'N/A' },
              ].map(({ label, val }) => (
                <div key={label} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                }}>
                  <span style={{ color: '#8E8FA8' }}>{label}</span>
                  <span style={{ fontWeight: 700 }}>{val}</span>
                </div>
              ))}
          </div>

          <div style={{
            background: '#141420',
            borderRadius: 16,
            padding: 20,
          }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>
              Services Offered
            </div>

            {[
              'Battery Health Check — RM 50',
              'Full Inspection — RM 120',
              'Tyre Service — RM 80',
              'Software Update — FREE',
            ].map(s => (
              <div key={s} style={{
                padding: '8px 0',
                fontSize: 13,
                color: '#8E8FA8',
              }}>
                {s}
              </div>
            ))}
          </div>

        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  );
}