'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import DataTable from '@/components/ui/DataTable';
import StatusPill from '@/components/ui/StatusPill';
import Toast from '@/components/ui/Toast';

export default function AdminStations() {
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
  setLoading(true);
  try {
    const r = await fetch('/api/stations');
    const result = await r.json();
    
    console.log("ISI DATA DARI API:", result); // Lihat di F12 Console!

    // Cuba kesan di mana array itu berada
    let dataToSet = [];
    if (Array.isArray(result)) {
      dataToSet = result;
    } else if (result.data && Array.isArray(result.data)) {
      dataToSet = result.data;
    } else if (result.stations && Array.isArray(result.stations)) {
      dataToSet = result.stations;
    }

    setStations(dataToSet);
  } catch (err) {
    console.error("FETCH ERROR:", err);
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = async (id: string, status: string) => {
    try {
      const r = await fetch('/api/stations/' + id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Pastikan status dihantar dalam format yang API jangka
          status: status === 'active' ? 'inactive' : 'active', 
        }),
      });

      if (!r.ok) throw new Error('Update failed');

      setToast('Station status updated');
      load();
    } catch (err) {
      setToast('Failed to update station');
    }
  };

  const del = async (id: string) => {
    if (!confirm('Delete charging station?')) return;
    try {
      const r = await fetch('/api/stations/' + id, { method: 'DELETE' });
      if (!r.ok) throw new Error('Delete failed');
      
      setToast('Station deleted');
      load();
    } catch (err) {
      setToast('Delete failed');
    }
  };

  const analytics = useMemo(() => {
  // Jumlahkan field 'cost' dari setiap dokumen
  const totalRevenue = stations.reduce((a, b) => a + (Number(b.cost) || 0), 0);
  const activeStations = stations.filter(s => s.status === 'active' || s.status === 'completed').length;

  return {
    totalRevenue,
    activeStations,
    totalCount: stations.length
  };
}, [stations]);

  const cols = [
  {
    key: 'stationName',
    label: 'Station',
    render: (v: string, r: any) => (
      <div>
        <div style={{ color: '#F1F2F6', fontWeight: 700, fontSize: 13 }}>{v}</div>
        <div style={{ color: '#8E8FA8', fontSize: 11, marginTop: 3 }}>{r.stationAddress}</div>
      </div>
    ),
  },
  {
    key: 'energyKwh', // Ambil dari field energyKwh
    label: 'Energy',
    render: (v: number) => (
      <span style={{ color: '#F1F2F6', fontSize: 12 }}>
        {v?.toFixed(3) || '0.000'} kWh
      </span>
    ),
  },
  {
    key: 'cost', // MAPPING FIELD COST DI SINI
    label: 'Total Cost',
    render: (v: number) => (
      <span style={{ color: '#00D68F', fontWeight: 700 }}>
        RM {(Number(v) || 0).toFixed(2)}
      </span>
    ),
  },
  {
    key: 'battery',
    label: 'Battery (Start → End)',
    render: (_: any, r: any) => (
      <div style={{ color: '#F1F2F6', fontSize: 12 }}>
        {r.startBatteryPercent}% → {r.batteryEnd}% 
        <span style={{ color: '#8E8FA8', fontSize: 10, marginLeft: 5 }}>
          (Target: {r.targetBatteryPercent}%)
        </span>
      </div>
    ),
  },
  {
    key: 'vehicleName',
    label: 'Vehicle',
    render: (v: string) => <span style={{ color: '#FFA502', fontSize: 12 }}>{v || 'N/A'}</span>,
  },
  {
    key: 'status',
    label: 'Status',
    render: (v: string) => <StatusPill status={v} />, // v akan jadi "completed"
  },
  {
    key: 'id',
    label: 'Actions',
    render: (_: any, r: any) => (
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={() => toggle(r.id, r.status)} style={btnStyle('#FFA502')}>Toggle</button>
        <button onClick={() => del(r.id)} style={btnStyle('#FF4757')}>Delete</button>
      </div>
    ),
  },
];

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#F1F2F6', marginBottom: 20 }}>EV Charging Stations</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <Card label="Total Stations" value={analytics.totalCount} color="#F1F2F6" />
        <Card label="Active Now" value={analytics.activeStations} color="#00D68F" />
        <Card label="Avg. Rate" value={`RM ${analytics.totalRevenue.toFixed(2)}`} color="#54A0FF" />
      </div>

      <div style={{ background: '#141420', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, overflow: 'hidden' }}>
        <DataTable 
          columns={cols} 
          data={stations} 
          // loading={loading} // Pastikan loading dihantar ke DataTable
          emptyMessage="No stations found" 
        />
      </div>

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  );
}

const Card = ({ label, value, color }: any) => (
  <div style={{ background: '#141420', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: 20 }}>
    <div style={{ color: '#8E8FA8', fontSize: 12, marginBottom: 8 }}>{label}</div>
    <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
  </div>
);

const btnStyle = (color: string) => ({
  background: `${color}20`,
  border: `1px solid ${color}40`,
  color: color,
  padding: '5px 10px',
  borderRadius: 8,
  fontSize: 11,
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'Outfit',
});