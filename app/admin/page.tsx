'use client';
import { useEffect, useState } from 'react';
import StatCard from '@/components/ui/StatCard';
import DataTable from '@/components/ui/DataTable';
import StatusPill from '@/components/ui/StatusPill';
import { useRouter } from 'next/navigation';

export default function AdminOverview() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/stats').then(r => r.json()).then(d => { setStats(d); setLoading(false); });
  }, []);

  const fmtDate = (s: string) => s ? new Date(s).toLocaleDateString('en-MY', { day: 'numeric', month: 'short' }) : '—';

  const cols = [
    { key: 'userName', label: 'Customer', render: (v: string, r: any) => <div><div style={{ color: '#F1F2F6', fontWeight: 700 }}>{v}</div><div style={{ fontSize: 11, color: '#44445A' }}>{r.userEmail}</div></div> },
    {
      key: 'service',
      label: 'Service',
      render: (_: any, r: any) => (
        <span>{r.service || r.serviceTypeName || '—'}</span>
      )
    },
    {
      key: 'centre',
      label: 'Centre',
      render: (_: any, r: any) => (
        <span>{r.centre || r.serviceCentreName || '—'}</span>
      )
    },
    { key: 'amount', label: 'Amount', render: (v: number) => <span style={{ fontWeight: 700, color: '#F1F2F6' }}>{v ? `RM ${v}` : 'FREE'}</span> },
    { key: 'status', label: 'Status', render: (v: string) => <StatusPill status={v} /> },
    // { key: 'id', label: 'Action', render: (_: any, r: any) => r.status === 'pending' ? (
    //   <button onClick={async () => { await fetch(`/api/bookings/${r.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'confirmed' }) }); fetch('/api/dashboard/stats').then(x => x.json()).then(setStats); }} style={{ background: 'rgba(0,214,143,.12)', border: '1px solid rgba(0,214,143,.2)', color: '#00D68F', padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit' }}>Approve</button>
    // ) : <span style={{ color: '#44445A', fontSize: 11 }}>—</span> },
  ];

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#44445A' }}>Loading...</div>;

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24, letterSpacing: -0.5 }}>System Overview</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 22 }}>
        <StatCard label="Total Users" value={stats.totalUsers} sub="registered" color="#00D68F" />
        <StatCard label="Total Bookings" value={stats.totalBookings} sub={`${stats.confirmedBookings} confirmed`} color="#54A0FF" />
        <StatCard label="Pending" value={stats.pendingBookings} sub={stats.pendingBookings > 0 ? 'Needs attention' : 'All clear ✓'} color="#FFA502" />
        <StatCard label="Revenue (RM)" value={`RM ${stats.totalRevenue.toLocaleString()}`} sub={`${stats.completedBookings} completed`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 22 }}>
        <div style={{ background: '#141420', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16 }}>Booking Status</div>
          {[
            { label: 'Pending', val: stats.pendingBookings, color: '#FFA502' },
            { label: 'Confirmed', val: stats.confirmedBookings, color: '#54A0FF' },
            { label: 'Completed', val: stats.completedBookings, color: '#00D68F' },
            { label: 'Cancelled', val: stats.cancelledBookings, color: '#FF4757' },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 80, fontSize: 12, color: '#8E8FA8' }}>{label}</div>
              <div style={{ flex: 1, height: 5, background: '#1C1C2E', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${stats.totalBookings ? Math.round(val / stats.totalBookings * 100) : 0}%`, height: '100%', background: color, borderRadius: 3 }} />
              </div>
              <div style={{ width: 24, fontSize: 12, fontWeight: 700, color, textAlign: 'right' }}>{val}</div>
            </div>
          ))}
        </div>
        <div style={{ background: '#141420', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16 }}>Infrastructure</div>
          {[
            { icon: '🏢', label: 'Service Centres', val: stats.totalCentres, color: '#00D68F' },
            { icon: '⚡', label: 'Charging Stations', val: stats.totalStations, color: '#54A0FF' },
            { icon: '👥', label: 'App Users', val: stats.totalUsers, color: '#FFA502' },
          ].map(({ icon, label, val, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              <span style={{ flex: 1, fontSize: 13, color: '#8E8FA8' }}>{label}</span>
              <span style={{ fontSize: 20, fontWeight: 700, color }}>{val}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#141420', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <span style={{ fontSize: 13, fontWeight: 700 }}>Recent Bookings</span>
          <button onClick={() => router.push('/admin/bookings')} style={{ fontSize: 11, color: '#00D68F', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Outfit' }}>View all →</button>
        </div>
        <DataTable columns={cols} data={stats.recentBookings || []} emptyMessage="No bookings yet" />
      </div>
    </div>
  );
}
