'use client';
import { useEffect, useState, useCallback } from 'react';
import DataTable from '@/components/ui/DataTable';
import StatusPill from '@/components/ui/StatusPill';
import Toast from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';

export default function SCBookings() {
  const router = useRouter();

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams();

      if (statusFilter) params.set('status', statusFilter);
      if (search) params.set('search', search);

      const r = await fetch('/api/bookings?' + params);
      const result = await r.json();

      if (result && Array.isArray(result.bookings)) {
        setBookings(result.bookings);
      } else if (result && Array.isArray(result.data?.bookings)) {
        setBookings(result.data.bookings);
      } else {
        setBookings([]);
      }
    } catch (error) {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const update = async (id: string, status: string) => {
    await fetch('/api/bookings/' + id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    setToast('Booking ' + status);
    load();
  };

  const Btn = ({ onClick, color, children }: any) => (
    <button
      onClick={onClick}
      style={{
        background: color + '20',
        border: '1px solid ' + color + '40',
        color,
        padding: '6px 10px',
        borderRadius: 7,
        fontSize: 11,
        fontWeight: 700,
        cursor: 'pointer',
        fontFamily: 'Outfit',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  );

  // ── REPAIRED COLS KEYS ───────────────────────────────────
  const cols = [
    {
      key: 'userName',
      label: 'Customer',
      render: (v: string, r: any) => (
        <div>
          <div style={{ color: '#F1F2F6', fontWeight: 700 }}>
            {v}
          </div>
          <div
            style={{
              fontSize: 11,
              color: '#44445A',
              wordBreak: 'break-word',
            }}
          >
            {r.userEmail}
          </div>
        </div>
      ),
    },
    {
      // 1. DIBAIKI: Ditukar daripada 'service' kepada 'serviceTypeName'
      key: 'serviceTypeName',
      label: 'Service',
    },
    {
      // 2. DIBAIKI: Ditukar daripada 'date' kepada 'bookingDate'
      key: 'bookingDate',
      label: 'Date & Time',
      render: (v: string, r: any) => (
        <span style={{ whiteSpace: 'nowrap' }}>
          {v} {r.bookingTime} {/* Ditukar daripada r.time kepada r.bookingTime */}
        </span>
      ),
    },
    // {
    //   key: 'vehicleMake',
    //   label: 'Vehicle',
    //   render: (v: string, r: any) => (
    //     <span>
    //       {v || '—'} {r.vehicleModel || '—'}
    //     </span>
    //   ),
    // },
    {
      key: 'amount',
      label: 'Amount',
      render: (v: number) => (
        <b style={{ color: '#F1F2F6', whiteSpace: 'nowrap' }}>
          {v ? 'RM ' + v : 'FREE'}
        </b>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (v: string) => <StatusPill status={v} />,
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_: any, r: any) => (
        <div
          style={{
            display: 'flex',
            gap: 4,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          {r.status === 'pending' && (
            <>
              <Btn
                onClick={() => update(r.id, 'confirmed')}
                color="#00D68F"
              >
                ✓ Confirm
              </Btn>
              <Btn
                onClick={() => update(r.id, 'cancelled')}
                color="#FF4757"
              >
                ✗ Reject
              </Btn>
            </>
          )}

          {r.status === 'confirmed' && (
            <Btn
              onClick={() => update(r.id, 'completed')}
              color="#8E8FA8"
            >
              Mark Done
            </Btn>
          )}

          <Btn
            onClick={() =>
              router.push(`/servicecentre/bookings/${r.id}`)
            }
            color="#3498db"
          >
            👁 Track
          </Btn>
        </div>
      ),
    },
  ];

  const inp = {
    background: '#1C1C2E',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 13,
    color: '#F1F2F6',
    fontFamily: 'Outfit',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as const,
  };

  return (
    <div style={{ width: '100%' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>
        All Bookings
      </h1>

      {/* FILTERS */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          marginBottom: 16,
          flexWrap: 'wrap',
          alignItems: 'stretch',
        }}
      >
        <div style={{ flex: '1 1 250px' }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
            placeholder="Search..."
            style={inp}
          />
        </div>

        <div style={{ flex: '1 1 180px' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={inp}
          >
            <option value="">All Status</option>
            {['pending', 'confirmed', 'completed', 'cancelled'].map(
              (s) => (
                <option key={s}>{s}</option>
              )
            )}
          </select>
        </div>

        <div style={{ flex: '1 1 120px' }}>
          <button
            onClick={load}
            style={{
              ...inp,
              cursor: 'pointer',
              color: '#8E8FA8',
              fontWeight: 600,
            }}
          >
            Search
          </button>
        </div>
      </div>

      {/* TABLE CARD */}
      <div
        style={{
          background: '#141420',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 16,
          overflow: 'hidden',
          width: '100%',
        }}
      >
        <div
          style={{
            padding: '15px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            fontWeight: 700,
            fontSize: 13,
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <span>Bookings</span>
          <span style={{ color: '#44445A', fontWeight: 400, fontSize: 12 }}>
            {loading ? 'Loading...' : bookings.length + ' records'}
          </span>
        </div>

        {/* RESPONSIVE TABLE */}
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <DataTable columns={cols} data={bookings} />
        </div>
      </div>

      {toast && (
        <Toast
          message={toast}
          onClose={() => setToast('')}
        />
      )}
    </div>
  );
}