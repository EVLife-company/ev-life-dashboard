'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  setError('');
  setLoading(true);

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Login failed');
      return;
    }

    if (data.role === 'admin') {
      router.push('/admin');
    } else if (data.role === 'service_centre') {
      router.push('/servicecentre');
    } else {
      setError('Unauthorized role');
    }
  } catch (err) {
    console.error(err);
    setError('Network error');
  } finally {
    setLoading(false);
  }
};

  const S = {
    page: {
      minHeight: '100vh',
      background: '#0A0A0F',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'Outfit, sans-serif',
    },

    card: {
      background: '#141420',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '24px',
      width: '100%',
      maxWidth: '950px',
      display: 'flex',
      flexWrap: 'wrap' as const,
      overflow: 'hidden',
      boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
    },

    left: {
      flex: '1 1 400px',
      minHeight: '300px',
      backgroundImage:
        'linear-gradient(to bottom, rgba(20,20,32,0.4), rgba(20,20,32,0.8)), url(https://media.wired.com/photos/68a8b69eebb68c4f3de1c5ae/3:2/w_2560%2Cc_limit/GettyImages-2230080278.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      padding: '40px',
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'space-between',
    },

    right: {
      flex: '1 1 400px',
      padding: '40px',
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'center',
    },

    input: {
      width: '100%',
      background: '#1C1C2E',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '12px',
      padding: '14px 16px',
      fontSize: '14px',
      color: '#F1F2F6',
      outline: 'none',
      marginBottom: '20px',
      fontFamily: 'Outfit',
      boxSizing: 'border-box' as const,
    },

    label: {
      fontSize: '11px',
      fontWeight: 700,
      color: '#44445A',
      letterSpacing: '1px',
      display: 'block',
      marginBottom: '8px',
    },

    button: {
      width: '100%',
      background: '#00D68F',
      border: 'none',
      borderRadius: '12px',
      padding: '16px',
      fontSize: '15px',
      fontWeight: 700,
      color: '#000',
      cursor: 'pointer',
    },
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        
        {/* LEFT */}
        <div style={S.left}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                background: '#00D68F',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ⚡
            </div>

            <span
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: '#F1F2F6',
              }}
            >
              EVLife
            </span>
          </div>

          <div>
            <h2
              style={{
                fontSize: 'clamp(28px, 5vw, 40px)',
                fontWeight: 800,
                color: '#F1F2F6',
                lineHeight: 1.2,
                marginBottom: 16,
              }}
            >
              The future of <br /> EV Management.
            </h2>

            <p
              style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: 14,
                lineHeight: 1.6,
                maxWidth: 320,
              }}
            >
              Revolutionizing the way you maintain and monitor electric
              vehicles.
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div style={S.right}>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: '#F1F2F6',
              marginBottom: 8,
            }}
          >
            Welcome
          </h1>

          <p
            style={{
              fontSize: 14,
              color: '#777',
              marginBottom: 35,
            }}
          >
            Login to your dashboard
          </p>

          <form onSubmit={handleLogin}>
            <label style={S.label}>EMAIL ADDRESS</label>

            <input
              type="email"
              placeholder="admin@evlife.my"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={S.input}
            />

            <label style={S.label}>PASSWORD</label>

            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={S.input}
            />

            {error && (
              <p
                style={{
                  color: '#FF4757',
                  fontSize: 12,
                  marginBottom: 15,
                }}
              >
                {error}
              </p>
            )}

            <button type="submit" style={S.button}>
              {loading ? 'Authenticating...' : 'SIGN IN'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}