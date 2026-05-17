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
    fetch('/api/dashboard/stats')
      .then(r => r.json())
      .then(d => {
        setStats(d);
        setLoading(false);
      });
  }, []);

  const cols = [
    { 
      key: 'userName', 
      label: 'Customer', 
      render: (v: string, r: any) => (
        <div>
          <div style={{ color: '#fff', fontWeight: 700 }}>{v}</div>
          <div style={{ fontSize: 11, color: '#888' }}>{r.userEmail}</div>
        </div>
      ) 
    },
    {
      key: 'service',
      label: 'Service',
      render: (_: any, r: any) => (
        <span style={{ color: '#ccc' }}>{r.service || r.serviceTypeName || '—'}</span>
      )
    },
    {
      key: 'centre',
      label: 'Centre',
      render: (_: any, r: any) => (
        <span style={{ color: '#ccc' }}>{r.centre || r.serviceCentreName || '—'}</span>
      )
    },
    { 
      key: 'amount', 
      label: 'Amount', 
      render: (v: number) => <span style={{ fontWeight: 700, color: '#fff' }}>{v ? `RM ${v}` : 'FREE'}</span> 
    },
    { key: 'status', label: 'Status', render: (v: string) => <StatusPill status={v} /> },
  ];

  if (loading)
    return (
      <div style={{ textAlign: 'center', padding: 60, color: '#888', fontFamily: 'Inter, sans-serif' }}>
        Loading Overview...
      </div>
    );

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, color: '#ffffff' }}>
        System Overview
      </h1>

      {/* TOP STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Users" value={stats.totalUsers} sub="registered" color="#00b894" />
        <StatCard label="Total Bookings" value={stats.totalBookings} sub={`${stats.confirmedBookings} confirmed`} color="#0984e3" />
        <StatCard label="Pending" value={stats.pendingBookings} sub={stats.pendingBookings > 0 ? 'Needs attention' : 'All clear'} color="#fdcb6e" />
        <StatCard label="Revenue (RM)" value={`RM ${stats.totalRevenue.toLocaleString()}`} sub={`${stats.completedBookings} completed`} color="#00d68f" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        
        {/* BOOKING STATUS CHART */}
        <div style={{ background: '#1C1C2E', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#fff' }}>
            Booking Status
          </div>

          {[
            { label: 'Pending', val: stats.pendingBookings, color: '#fdcb6e' },
            { label: 'Confirmed', val: stats.confirmedBookings, color: '#0984e3' },
            { label: 'Completed', val: stats.completedBookings, color: '#00b894' },
            { label: 'Cancelled', val: stats.cancelledBookings, color: '#d63031' },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 15 }}>
              <div style={{ width: 80, fontSize: 13, color: '#888' }}>{label}</div>
              <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${stats.totalBookings ? Math.round((val / stats.totalBookings) * 100) : 0}%`,
                    height: '100%',
                    background: color,
                    boxShadow: `0 0 10px ${color}40`
                  }}
                />
              </div>
              <div style={{ width: 30, fontSize: 13, fontWeight: 600, color: color, textAlign: 'right' }}>
                {val}
              </div>
            </div>
          ))}
        </div>

        {/* INFRASTRUCTURE LIST */}
        <div style={{ background: '#1C1C2E', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#fff' }}>
            Infrastructure
          </div>

          {[
            { icon: '🏢', label: 'Service Centres', val: stats.totalCentres },
            { icon: '⚡', label: 'Charging Stations', val: stats.totalStations },
            { icon: '👥', label: 'App Users', val: stats.totalUsers },
          ].map(({ icon, label, val }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              <span style={{ flex: 1, fontSize: 14, color: '#ccc' }}>{label}</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* RECENT BOOKINGS TABLE */}
      <div style={{ background: '#1C1C2E', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>
            Recent Bookings
          </span>

          <button
            onClick={() => router.push('/admin/bookings')}
            style={{ fontSize: 13, color: '#00b894', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            View all →
          </button>
        </div>

        <DataTable
          columns={cols}
          data={stats.recentBookings || []}
          emptyMessage="No bookings yet"
        />
      </div>
    </div>
  );
}