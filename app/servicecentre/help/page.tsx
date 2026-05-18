'use client';

import { useState } from 'react';
import Toast from '@/components/ui/Toast';

export default function HelpCentre() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: '',
    centreName: '',
    message: '',
  });

  const faqs = [
    {
      q: 'How do I update my service centre profile?',
      a: 'Go to Centre Profile page and edit your details. All changes will be auto-saved in real-time.',
    },
    {
      q: 'Why are my bookings not showing?',
      a: 'Ensure the booking is assigned to your service centre. Try refreshing the dashboard.',
    },
    {
      q: 'How do I change operating hours?',
      a: 'Update Operating Hours field in Centre Profile page and click Save Changes.',
    },
    {
      q: 'Can I cancel a booking?',
      a: 'Only pending bookings can be cancelled from the booking management page.',
    },
    {
      q: 'How do I view my revenue?',
      a: 'Revenue is shown in dashboard statistics and updates automatically.',
    },
    {
      q: 'What should I do if system is slow?',
      a: 'Clear cache or try another browser. Contact support if issue persists.',
    },
    {
      q: 'How do I contact EVLife support?',
      a: 'Use the contact form or call our hotline.',
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // 🧪 DUMMY SEND (NO EMAIL CLIENT, NO API)
  const sendEmail = async () => {
    if (!form.email || !form.centreName || !form.message) {
      setToast('Please fill all fields');
      return;
    }

    setLoading(true);

    // simulate network delay
    await new Promise((res) => setTimeout(res, 1200));

    console.log('DUMMY SUPPORT MESSAGE:', form);

    setLoading(false);
    setToast('Message sent successfully');

    setForm({
      email: '',
      centreName: '',
      message: '',
    });
  };

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>
        Help Centre
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* LEFT FAQ */}
        <div style={{
          background: '#141420',
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.07)',
          padding: 20,
        }}>
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 16 }}>
            Frequently Asked Questions
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {faqs.map((item, i) => (
              <div key={i} style={{
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                paddingBottom: 10,
              }}>
                <div
                  onClick={() => toggleFAQ(i)}
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: 600,
                    fontSize: 13,
                    color: '#F1F2F6',
                  }}
                >
                  {item.q}
                  <span style={{ color: '#00D68F' }}>
                    {openIndex === i ? '▲' : '▼'}
                  </span>
                </div>

                {openIndex === i && (
                  <div style={{
                    marginTop: 8,
                    fontSize: 12,
                    color: '#8E8FA8',
                    lineHeight: 1.6,
                  }}>
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* CONTACT FORM */}
          <div style={{
            background: '#141420',
            borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.07)',
            padding: 20,
          }}>
            <div style={{ fontWeight: 700, fontSize: 30, marginBottom: 12 }}>
              Contact Support
            </div>

            <input
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={inputStyle}
            />

            <input
              placeholder="Centre Name"
              value={form.centreName}
              onChange={(e) => setForm({ ...form, centreName: e.target.value })}
              style={inputStyle}
            />

            <textarea
              placeholder="Enter your message"
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              style={inputStyle}
            />

            <button
              onClick={sendEmail}
              disabled={loading}
              style={{
                background: loading ? '#555' : '#00D68F',
                border: 'none',
                borderRadius: 10,
                padding: '10px 14px',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                color: '#000',
                width: '100%',
              }}
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </div>

          {/* CALL US */}
          <div style={{
            background: '#141420',
            borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.07)',
            padding: 20,
          }}>
            <div style={{ fontWeight: 700, fontSize: 27, marginBottom: 10 }}>
              Call Us
            </div>

            <div style={{ fontSize: 16, fontWeight: 700, color: '#00D68F' }}>
              03-6767-1234
            </div>

            <div style={{ fontSize: 12, color: '#8E8FA8', marginTop: 8, lineHeight: 1.5 }}>
              EVLife is a smart EV service platform connecting customers and service centres.
              Our support team operates 9AM - 6PM (Mon - Fri).
            </div>
          </div>

        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  );
}

// reusable style
const inputStyle: React.CSSProperties = {
  width: '100%',
  marginBottom: 10,
  padding: 10,
  borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.12)',
  background: '#1C1C2E',
  color: '#fff',
};