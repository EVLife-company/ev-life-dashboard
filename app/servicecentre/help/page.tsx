'use client';

import { useState } from 'react';
import Toast from '@/components/ui/Toast';
import Swal from 'sweetalert2';

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

  const sendEmail = async () => {
    // Validate fields
    if (!form.email || !form.centreName || !form.message) {
      Swal.fire({
        title: 'Missing Information',
        text: 'Please fill in all fields before sending your message.',
        icon: 'warning',
        confirmButtonColor: '#00D68F',
        confirmButtonText: 'Got it',
      });
      return;
    }

    setLoading(true);

    try {
      // Simulate network delay
      await new Promise((res) => setTimeout(res, 1200));

      console.log('DUMMY SUPPORT MESSAGE:', form);

      // SweetAlert Success Popup
      await Swal.fire({
        title: 'Message Sent!',
        text: 'Thank you for reaching out. Our support team will get back to you shortly.',
        icon: 'success',
        confirmButtonColor: '#00D68F',
        confirmButtonText: 'Great',
      });

      // Reset Form fields on success
      setForm({
        email: '',
        centreName: '',
        message: '',
      });

    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to send your message. Please try again.',
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div style={{ padding: '0 4px' }}>
      {/* Dynamic CSS for the grid column breakdown */}
      <style dangerouslySetInnerHTML={{__html: `
        .help-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        @media (max-width: 960px) {
          .help-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}} />

      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24, color: '#fff' }}>
        Help Centre
      </h1>

      <div className="help-grid">

        {/* LEFT FAQ */}
        <div style={{
          background: '#141420',
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.07)',
          padding: 20,
          height: 'fit-content'
        }}>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 16, color: '#fff' }}>
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
                    alignItems: 'center',
                    gap: 12,
                    fontWeight: 600,
                    fontSize: 13,
                    color: '#F1F2F6',
                    userSelect: 'none'
                  }}
                >
                  <span>{item.q}</span>
                  <span style={{ color: '#00D68F', fontSize: 10, flexShrink: 0 }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* CONTACT FORM */}
          <div style={{
            background: '#141420',
            borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.07)',
            padding: 20,
          }}>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 16, color: '#fff' }}>
              Contact Support
            </div>

            <input
              placeholder="Email"
              type="email"
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
              style={{ ...inputStyle, resize: 'vertical' }}
            />

            <button
              onClick={sendEmail}
              disabled={loading}
              style={{
                background: loading ? '#333' : '#00D68F',
                border: 'none',
                borderRadius: 10,
                padding: '12px 14px',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                color: loading ? '#8E8FA8' : '#000',
                width: '100%',
                fontSize: 14,
                transition: 'background 0.2s ease'
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
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 10, color: '#fff' }}>
              Call Us
            </div>

            <div style={{ fontSize: 20, fontWeight: 700, color: '#00D68F', letterSpacing: '0.5px' }}>
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

const inputStyle: React.CSSProperties = {
  width: '100%',
  marginBottom: 12,
  padding: '12px',
  borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.12)',
  background: '#1C1C2E',
  color: '#fff',
  fontSize: 14,
  boxSizing: 'border-box', // Essential to keep padding within full-width constraints
};