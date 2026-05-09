'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

const steps = [
  { label: 'Received', status: 'pending', nextLabel: 'Confirm Booking', nextStatus: 'confirmed' },
  { label: 'Confirmed', status: 'confirmed', nextLabel: 'Mark Vehicle Arrived', nextStatus: 'in_service' },
  { label: 'Vehicle Arrived', status: 'in_service', nextLabel: 'Start Service', nextStatus: 'repairing' },
  { label: 'Under Service', status: 'repairing', nextLabel: 'Mark Completed', nextStatus: 'completed' },
  { label: 'Completed', status: 'completed', nextLabel: null, nextStatus: null },
];

export default function BookingDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchBooking = async () => {
    try {
      const res = await fetch(`/api/bookings/${id}`);
      const result = await res.json();
      setBooking(result.data || result);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchBooking();
  }, [id]);

  // Combined function to handle status updates AND notifications
  const handleNextStep = async (nextStatus: string) => {
    setUpdating(true);
    try {
      // 1. Update the Booking Status in Firestore
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        // 2. TRIGGER NOTIFICATION: Only if moving to "completed"
        if (nextStatus === 'completed' && booking?.userId) {
          await fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              targetUserId: booking.userId, // Fixed variable name from bookingData to booking
              title: "🚗 Service Completed!",
              message: `Your ${booking.vehicleMake || 'vehicle'} is ready for pickup.`,
              type: 'success'
            }),
          });
        }

        await fetchBooking(); // Refresh the UI data
      }
    } catch (err) {
      console.error("Update error:", err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div style={{ padding: 40, color: '#8E8FA8', fontFamily: 'Outfit' }}>Loading EVLife Tracking...</div>;
  if (!booking) return <div style={{ padding: 40, color: '#FF4757', fontFamily: 'Outfit' }}>Booking not found (404)</div>;

  const currentStepIndex = steps.findIndex(s => s.status === booking.status);
  const currentStepData = steps[currentStepIndex];

  return (
    <div style={{ padding: 30, fontFamily: 'Outfit', color: '#F1F2F6', minHeight: '100vh', backgroundColor: '#0B0B15' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <button onClick={() => router.back()} style={{ color: '#8E8FA8', marginBottom: 12, cursor: 'pointer', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 5 }}>
            ← Back to List
          </button>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Track & Manage</h1>
          <p style={{ color: '#44445A', fontSize: 13 }}>Booking ID: {id}</p>
        </div>

        {/* Dynamic Action Button */}
        {currentStepData?.nextStatus && (
          <button 
            onClick={() => handleNextStep(currentStepData.nextStatus!)}
            disabled={updating}
            style={{
              backgroundColor: '#00D68F',
              color: '#0B0B15',
              padding: '12px 24px',
              borderRadius: 12,
              fontWeight: 700,
              border: 'none',
              cursor: updating ? 'not-allowed' : 'pointer',
              opacity: updating ? 0.7 : 1,
              fontFamily: 'Outfit',
              boxShadow: '0 4px 14px rgba(0, 214, 143, 0.3)'
            }}
          >
            {updating ? 'Updating...' : currentStepData.nextLabel}
          </button>
        )}
      </div>

      {/* Progress Tracker */}
      <div style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
        background: '#141420', padding: '50px 30px', borderRadius: 20,
        border: '1px solid rgba(255,255,255,0.05)', marginBottom: 30 
      }}>
        {steps.map((step, index) => (
          <div key={index} style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {index !== 0 && (
              <div style={{
                position: 'absolute', left: '-50%', top: '18px', width: '100%', height: '3px',
                background: index <= currentStepIndex ? '#00D68F' : '#2D2D3F', zIndex: 1
              }} />
            )}
            <div style={{
              width: 36, height: 36, borderRadius: 18,
              background: index <= currentStepIndex ? '#00D68F' : '#1C1C2E',
              border: `3px solid ${index <= currentStepIndex ? '#00D68F40' : '#2D2D3F'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, marginBottom: 12
            }}>
              {index <= currentStepIndex && <div style={{ width: 8, height: 8, borderRadius: 4, background: '#fff' }} />}
            </div>
            <span style={{ 
              fontSize: 10, fontWeight: 700, color: index <= currentStepIndex ? '#00D68F' : '#44445A',
              textTransform: 'uppercase', textAlign: 'center'
            }}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Info Card */}
      <div style={{ background: '#141420', borderRadius: 20, padding: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: '#00D68F' }}>Session Summary</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
          <DetailItem label="Customer" value={booking.userName} subValue={booking.userEmail} />
          <DetailItem label="Vehicle" value={`${booking.vehicleMake} ${booking.vehicleModel}`} />
          <DetailItem label="Service Type" value={booking.serviceTypeName} />
          <DetailItem label="Scheduled" value={`${booking.date} at ${booking.time}`} />
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value, subValue }: any) {
  return (
    <div>
      <p style={{ color: '#44445A', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 15, fontWeight: 600 }}>{value}</p>
      {subValue && <p style={{ fontSize: 12, color: '#8E8FA8' }}>{subValue}</p>}
    </div>
  );
}