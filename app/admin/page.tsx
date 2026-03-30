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
          <div style={{ color: '#111', fontWeight: 600 }}>{v}</div>
          <div style={{ fontSize: 12, color: '#777' }}>{r.userEmail}</div>
        </div>
      ),
    },
    { key: 'service', label: 'Service' },
    { key: 'centre', label: 'Centre' },
    {
      key: 'amount',
      label: 'Amount',
      render: (v: number) => (
        <span style={{ fontWeight: 600, color: '#111' }}>
          {v ? `RM ${v}` : 'FREE'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (v: string) => <StatusPill status={v} />,
    },
    {
      key: 'id',
      label: 'Action',
      render: (_: any, r: any) =>
        r.status === 'pending' ? (
          <button
            onClick={async () => {
              await fetch(`/api/bookings/${r.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'confirmed' }),
              });
              fetch('/api/dashboard/stats')
                .then(x => x.json())
                .then(setStats);
            }}
            style={{
              background: '#e8f8f2',
              border: '1px solid #00b894',
              color: '#00b894',
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Approve
          </button>
        ) : (
          <span style={{ color: '#aaa', fontSize: 12 }}>—</span>
        ),
    },
  ];

  if (loading)
    return (
      <div style={{ textAlign: 'center', padding: 60, color: '#777' }}>
        Loading...
      </div>
    );

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <h1
        style={{
          fontSize: 24,
          fontWeight: 700,
          marginBottom: 24,
          color: '#ffffff',
        }}
      >
        System Overview
      </h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4,1fr)',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <StatCard label="Total Users" value={stats.totalUsers} sub="registered" color="#00b894" />
        <StatCard label="Total Bookings" value={stats.totalBookings} sub={`${stats.confirmedBookings} confirmed`} color="#0984e3" />
        <StatCard label="Pending" value={stats.pendingBookings} sub={stats.pendingBookings > 0 ? 'Needs attention' : 'All clear'} color="#fdcb6e" />
        <StatCard label="Revenue (RM)" value={`RM ${stats.totalRevenue.toLocaleString()}`} sub={`${stats.completedBookings} completed`} />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            background: '#fff',
            border: '1px solid #eee',
            borderRadius: 14,
            padding: 20,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
            Booking Status
          </div>

          {[
            { label: 'Pending', val: stats.pendingBookings, color: '#fdcb6e' },
            { label: 'Confirmed', val: stats.confirmedBookings, color: '#0984e3' },
            { label: 'Completed', val: stats.completedBookings, color: '#00b894' },
            { label: 'Cancelled', val: stats.cancelledBookings, color: '#d63031' },
          ].map(({ label, val, color }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 12,
              }}
            >
              <div style={{ width: 80, fontSize: 13, color: '#666' }}>
                {label}
              </div>

              <div
                style={{
                  flex: 1,
                  height: 6,
                  background: '#eee',
                  borderRadius: 3,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${
                      stats.totalBookings
                        ? Math.round((val / stats.totalBookings) * 100)
                        : 0
                    }%`,
                    height: '100%',
                    background: color,
                  }}
                />
              </div>

              <div
                style={{
                  width: 24,
                  fontSize: 13,
                  fontWeight: 600,
                  color,
                  textAlign: 'right',
                }}
              >
                {val}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            background: '#fff',
            border: '1px solid #eee',
            borderRadius: 14,
            padding: 20,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
            Infrastructure
          </div>

          {[
            { icon: '🏢', label: 'Service Centres', val: stats.totalCentres },
            { icon: '⚡', label: 'Charging Stations', val: stats.totalStations },
            { icon: '👥', label: 'App Users', val: stats.totalUsers },
          ].map(({ icon, label, val }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 0',
                borderBottom: '1px solid #f0f0f0',
              }}
            >
              <span style={{ fontSize: 20 }}>{icon}</span>
              <span style={{ flex: 1, fontSize: 14, color: '#555' }}>
                {label}
              </span>
              <span style={{ fontSize: 20, fontWeight: 700 }}>{val}</span>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          background: '#fff',
          border: '1px solid #eee',
          borderRadius: 14,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid #eee',
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600 }}>
            Recent Bookings
          </span>

          <button
            onClick={() => router.push('/admin/bookings')}
            style={{
              fontSize: 13,
              color: '#00b894',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
            }}
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