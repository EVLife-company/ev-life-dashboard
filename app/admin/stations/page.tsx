'use client';

import { useEffect, useMemo, useState } from 'react';
import DataTable from '@/components/ui/DataTable';
import StatusPill from '@/components/ui/StatusPill';
import Toast from '@/components/ui/Toast';
import {
  collection,
  getDocs
} from 'firebase/firestore';

export default function AdminStations() {
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  const load = async () => {
    setLoading(true);

    try {
      const r = await fetch('/api/stations');

      const result = await r.json();

      setStations(
        Array.isArray(result)
          ? result
          : result.data || []
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggle = async (id: string, status: string) => {
    try {
      await fetch('/api/stations/' + id, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: status === 'online' ? 'offline' : 'online',
        }),
      });

      setToast('Station status updated');
      load();
    } catch (err) {
      console.error(err);
      setToast('Failed to update station');
    }
  };

  const del = async (id: string) => {
    if (!confirm('Delete charging station?')) return;

    try {
      await fetch('/api/stations/' + id, {
        method: 'DELETE',
      });

      setToast('Station deleted');
      load();
    } catch (err) {
      console.error(err);
      setToast('Delete failed');
    }
  };

  // =========================
  // ANALYTICS
  // =========================

  const analytics = useMemo(() => {
    const totalRevenue = stations.reduce(
      (a, b) => a + Number(b.cost || 0),
      0
    );

    const totalEnergy = stations.reduce(
      (a, b) => a + Number(b.energyKwh || 0),
      0
    );

    const onlineStations = stations.filter(
      (s) => s.status === 'online'
    ).length;

    const completedSessions = stations.filter(
      (s) => s.status === 'completed'
    ).length;

    return {
      totalRevenue,
      totalEnergy,
      onlineStations,
      completedSessions,
    };
  }, [stations]);

  // =========================
  // TABLE COLUMNS
  // =========================

  const cols = [
    {
      key: 'stationName',
      label: 'Station',
      render: (v: string, r: any) => (
        <div>
          <div
            style={{
              color: '#F1F2F6',
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            {v}
          </div>

          <div
            style={{
              color: '#8E8FA8',
              fontSize: 11,
              marginTop: 3,
            }}
          >
            {r.stationAddress}
          </div>
        </div>
      ),
    },

    {
      key: 'chargerPowerKw',
      label: 'Power',
      render: (v: number) => (
        <span
          style={{
            background: 'rgba(84,160,255,.12)',
            color: '#54A0FF',
            padding: '4px 10px',
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          {v} kW
        </span>
      ),
    },

    {
      key: 'energyKwh',
      label: 'Energy',
      render: (v: number) => (
        <span style={{ color: '#F1F2F6' }}>
          {Number(v).toFixed(2)} kWh
        </span>
      ),
    },

    {
      key: 'cost',
      label: 'Revenue',
      render: (v: number) => (
        <span
          style={{
            color: '#00D68F',
            fontWeight: 700,
          }}
        >
          RM {Number(v).toFixed(2)}
        </span>
      ),
    },

    {
      key: 'vehicleName',
      label: 'Vehicle',
      render: (v: string) => (
        <span
          style={{
            color: '#F1F2F6',
            fontWeight: 600,
          }}
        >
          {v}
        </span>
      ),
    },

    {
      key: 'paymentMethod',
      label: 'Payment',
      render: (v: string) => (
        <span
          style={{
            color: '#FFA502',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {v}
        </span>
      ),
    },

    {
      key: 'battery',
      label: 'Battery',
      render: (_: any, r: any) => (
        <div
          style={{
            color: '#F1F2F6',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {r.startBatteryPercent}% →{' '}
          {Math.round(r.batteryEnd)}%
        </div>
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
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => toggle(r.id, r.status)}
            style={{
              background: 'rgba(255,165,2,.12)',
              border: '1px solid rgba(255,165,2,.25)',
              color: '#FFA502',
              padding: '5px 10px',
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'Outfit',
            }}
          >
            Toggle
          </button>

          <button
            onClick={() => del(r.id)}
            style={{
              background: 'rgba(255,71,87,.12)',
              border: '1px solid rgba(255,71,87,.25)',
              color: '#FF4757',
              padding: '5px 10px',
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'Outfit',
            }}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const cardStyle: any = {
    background: '#141420',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 18,
    padding: 20,
  };

  return (
    <div>
      {/* HEADER */}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 26,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: '#F1F2F6',
            }}
          >
            EV Charging Stations
          </h1>

          <p
            style={{
              color: '#8E8FA8',
              fontSize: 13,
              marginTop: 6,
            }}
          >
            Monitor charging activity, revenue and energy usage
          </p>
        </div>
      </div>

      {/* ANALYTICS */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div style={cardStyle}>
          <div
            style={{
              color: '#8E8FA8',
              fontSize: 12,
              marginBottom: 8,
            }}
          >
            Total Revenue
          </div>

          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: '#00D68F',
            }}
          >
            RM {analytics.totalRevenue.toFixed(2)}
          </div>
        </div>

        <div style={cardStyle}>
          <div
            style={{
              color: '#8E8FA8',
              fontSize: 12,
              marginBottom: 8,
            }}
          >
            Energy Delivered
          </div>

          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: '#54A0FF',
            }}
          >
            {analytics.totalEnergy.toFixed(2)} kWh
          </div>
        </div>

        <div style={cardStyle}>
          <div
            style={{
              color: '#8E8FA8',
              fontSize: 12,
              marginBottom: 8,
            }}
          >
            Online Stations
          </div>

          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: '#F1F2F6',
            }}
          >
            {analytics.onlineStations}
          </div>
        </div>

        <div style={cardStyle}>
          <div
            style={{
              color: '#8E8FA8',
              fontSize: 12,
              marginBottom: 8,
            }}
          >
            Completed Sessions
          </div>

          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: '#FFA502',
            }}
          >
            {analytics.completedSessions}
          </div>
        </div>
      </div>

      {/* TABLE */}

      <div
        style={{
          background: '#141420',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 18,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '18px 22px',
            borderBottom:
              '1px solid rgba(255,255,255,0.07)',
            fontWeight: 700,
            fontSize: 14,
            color: '#F1F2F6',
          }}
        >
          Charging Sessions
        </div>

        <DataTable
          columns={cols}
          data={stations}
          // loading={loading}
          emptyMessage="No charging sessions found"
        />
      </div>

      {/* TOAST */}

      {toast && (
        <Toast
          message={toast}
          onClose={() => setToast('')}
        />
      )}
    </div>
  );
}