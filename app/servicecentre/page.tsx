'use client';
import { useEffect, useState } from 'react';
import StatCard from '@/components/ui/StatCard';
import DataTable from '@/components/ui/DataTable';
import StatusPill from '@/components/ui/StatusPill';

const SLOTS = ['09:00 AM', '10:30 AM', '12:00 PM', '01:30 PM', '03:00 PM', '04:30 PM'];

export default function ServiceCentreDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = () => {
    fetch('/api/dashboard/stats')
      .then(r => r.json())
      .then(d => { 
        setStats(d); 
        setLoading(false); 
      });
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Standardized local YYYY-MM-DD string to compare with Firebase's bookingDate format
  const today = new Date().toLocaleDateString('sv-SE'); 

  const approve = async (id: string) => {
    await fetch('/api/bookings/' + id, { 
      method: 'PATCH', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ status: 'confirmed' }) 
    });
    fetchDashboardData();
  };

  // Updated to match Firestore schema keys
  const cols = [
    { key: 'userName', label: 'Customer', render: (v: string) => <span style={{ color: '#F1F2F6', fontWeight: 700 }}>{v}</span> },
    { key: 'serviceTypeName', label: 'Service' },
    { key: 'bookingDate', label: 'Date', render: (v: string, r: any) => v + ' ' + r.bookingTime },
    { key: 'amount', label: 'Amount', render: (v: number) => <b style={{ color: '#F1F2F6' }}>{v ? 'RM ' + v : 'FREE'}</b> },
    { key: 'status', label: 'Status', render: (v: string) => <StatusPill status={v} /> },
    { key: 'id', label: 'Action', render: (_: any, r: any) => r.status === 'pending'
      ? <button onClick={() => approve(r.id)} style={{ background: 'rgba(0,214,143,.12)', border: '1px solid rgba(0,214,143,.2)', color: '#00D68F', padding: '4px 10px', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit' }}>✓ Confirm</button>
      : <span style={{ color: '#44445A', fontSize: 11 }}>—</span> },
  ];

  if (loading || !stats) return <div style={{ textAlign: 'center', padding: 60, color: '#44445A' }}>Loading...</div>;

  // Filter uses your precise Firebase property 'bookingDate'
  const todayBookings = (stats?.recentBookings || []).filter((b: any) => 
    b.bookingDate === today && b.status !== 'cancelled'
  );

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 22 }}>
        <StatCard label="Today's Bookings" value={todayBookings.length} color="#00D68F" />
        <StatCard label="Pending" value={stats.pendingBookings} sub={stats.pendingBookings > 0 ? 'Needs action' : 'All clear ✓'} color="#FFA502" />
        <StatCard label="Completed" value={stats.completedBookings} sub="This month" color="#54A0FF" />
        <StatCard label="Revenue (RM)" value={'RM ' + stats.totalRevenue.toLocaleString()} />
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 22 }}>
        {/* Today's Schedule Linked to Firebase Properties */}
        <div style={{ background: '#141420', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16 }}>Today&apos;s Schedule ({today})</div>
          {SLOTS.map(slot => {
            // Uses your precise Firebase property 'bookingTime'
            const bkg = todayBookings.find((b: any) => b.bookingTime === slot);
            return (
              <div key={slot} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: '#1C1C2E', borderRadius: 10, marginBottom: 6, borderLeft: bkg ? '3px solid ' + (bkg.status === 'pending' ? '#FFA502' : '#00D68F') : '3px solid transparent', opacity: bkg ? 1 : 0.35 }}>
                <span style={{ fontSize: 11, color: '#44445A', minWidth: 60, fontWeight: 700 }}>{slot}</span>
                {bkg ? <>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#F1F2F6' }}>{bkg.userName}</div>
                    <div style={{ fontSize: 11, color: '#44445A' }}>{bkg.serviceTypeName}</div>
                  </div>
                  <StatusPill status={bkg.status} />
                </> : <span style={{ fontSize: 12, color: '#44445A' }}>Available</span>}
              </div>
            );
          })}
        </div>

        <div style={{ background: '#141420', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16 }}>Booking Summary</div>
          {[
            { label: 'Pending', val: stats.pendingBookings, color: '#FFA502' },
            { label: 'Confirmed', val: stats.confirmedBookings, color: '#54A0FF' },
            { label: 'Completed', val: stats.completedBookings, color: '#00D68F' },
            { label: 'Cancelled', val: stats.cancelledBookings, color: '#FF4757' },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: 4, background: color }} />
                <span style={{ fontSize: 13, color: '#8E8FA8' }}>{label}</span>
              </div>
              <span style={{ fontSize: 16, fontWeight: 700, color }}>{val}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#141420', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', fontWeight: 700, fontSize: 13 }}>Recent Bookings</div>
        <DataTable columns={cols} data={stats.recentBookings || []} emptyMessage="No bookings yet" />
      </div>
    </div>
  );
}