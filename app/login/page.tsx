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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) { 
        setError(data.error || 'Login failed'); 
        return; 
      }

      // REDIRECTION LOGIC
      // Based on the role returned from your API (which fetches from Firestore users collection)
      if (data.role === 'admin') {
        router.push('/admin');
      } else if (data.role === 'servicecentre' || data.role === 'service_centre') {
        router.push('/servicecentre');
      } else {
        setError('Unauthorized role. Please contact support.');
      }

      router.refresh();
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // 🎨 STYLING (BACK TO DARK MODE)
  const S = {
    page: {
      minHeight: '100vh',
      background: '#0A0A0F', // Background asal kau
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      fontFamily: 'Outfit, sans-serif'
    },
    card: {
      background: '#141420', // Warna kad asal
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 24,
      width: '100%',
      maxWidth: 950,
      height: 600,
      display: 'flex',
      overflow: 'hidden',
      boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
    },
    left: {
      flex: 1.1,
      backgroundImage: 'linear-gradient(to bottom, rgba(20,20,32,0.4), rgba(20,20,32,0.8)), url(https://media.wired.com/photos/68a8b69eebb68c4f3de1c5ae/3:2/w_2560%2Cc_limit/GettyImages-2230080278.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      padding: 40,
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'space-between'
    },
    right: {
      flex: 1,
      padding: '60px 45px',
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'center'
    },
    input: {
      width: '100%',
      background: '#1C1C2E',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 12,
      padding: '14px 16px',
      fontSize: 14,
      color: '#F1F2F6',
      outline: 'none',
      marginBottom: 20,
      fontFamily: 'Outfit'
    },
    label: {
      fontSize: 11,
      fontWeight: 700,
      color: '#44445A',
      letterSpacing: '1px',
      display: 'block',
      marginBottom: 8
    }
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        
        {/* LEFT SECTION - IMAGE */}
        <div style={S.left}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, background: '#00D68F', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⚡</div>
            <span style={{ fontSize: 24, fontWeight: 800, color: '#F1F2F6' }}>EVLife</span>
          </div>
          
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: '#F1F2F6', lineHeight: 1.2, marginBottom: 16 }}>
              The future of <br /> EV Management.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, maxWidth: 300, lineHeight: 1.6 }}>
              Revolutionizing the way you maintain and monitor electric vehicles.
            </p>
          </div>
        </div>

        {/* RIGHT SECTION - LOGIN FORM */}
        <div style={S.right}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#F1F2F6', marginBottom: 8 }}>Welcome</h1>
          <p style={{ fontSize: 14, color: '#44445A', marginBottom: 35 }}>Login to your dashboard</p>

          <form onSubmit={handleLogin}>
            <label style={S.label}>EMAIL ADDRESS</label>
            <input 
              type="email" 
              placeholder="admin@evlife.my" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              style={S.input} 
              required 
            />

            <label style={S.label}>PASSWORD</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              style={S.input} 
              required 
            />

            {error && <p style={{ color: '#FF4757', fontSize: 12, marginBottom: 15, marginTop: -10 }}>{error}</p>}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: '#00D68F',
                border: 'none',
                borderRadius: 12,
                padding: 16,
                fontSize: 15,
                fontWeight: 700,
                color: '#000',
                cursor: 'pointer',
                transition: '0.2s',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Authenticating...' : 'SIGN IN'}
            </button>
          </form>

          {/* DEMO BOX */}
          <div style={{ marginTop: 35, padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 12, fontSize: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ color: '#00D68F', fontWeight: 700, marginBottom: 5 }}>Demo Access</div>
            <div style={{ color: '#8E8FA8' }}>Admin: admin@evlife.my / Admin@123</div>
            <div style={{ color: '#8E8FA8' }}>Centre: centre@evlife.my / Centre@123</div>
          </div>
        </div>

      </div>
    </div>
  );
}