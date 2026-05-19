import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import Sidebar from '@/components/layout/Sidebar';

export default async function ServiceCentreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user) redirect('/login');
  if (user.role !== 'service_centre') redirect('/admin');

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#0B0B14',
        fontFamily: 'Outfit, sans-serif',
      }}
    >
      {/* SIDEBAR */}
      <Sidebar
        role="service_centre"
        userName={user.email.split('@')[0]}
        centreName={user.centreName}
      />

      {/* MAIN CONTENT WRAPPER */}
      <main className="sc-main-layout">
        
        {/* TOPBAR */}
        <header
          style={{
            background: '#0B0B14',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            padding: '18px 28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 50,
            backdropFilter: 'blur(10px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 8,
                height: 8,
                background: '#00D68F',
                borderRadius: '50%',
                boxShadow: '0 0 8px #00D68F',
              }}
            />
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#00D68F',
              }}
            >
              LIVE
            </span>
          </div>

          <span style={{ fontSize: 12, color: '#8E8FA8' }}>
            {user.centreName || 'SERVICE CENTRE'}
          </span>
        </header>

        {/* CONTENT AREA */}
        <div className="sc-content-area">
          {children}
        </div>
      </main>

      {/* SUNTIKAN STYLESHEET DINAMIK UNTUK RESPONSIF */}
      <style dangerouslySetInnerHTML={{__html: `
        .sc-main-layout {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background: '#0B0B14';
          /* Default Desktop: beri ruang 250px di kiri supaya tidak bertindih dengan sidebar */
          margin-left: 250px; 
          transition: margin-left 0.3s ease;
        }

        .sc-content-area {
          flex: 1;
          padding: 28px;
          background: #0B0B14;
          color: #fff;
        }

        /* CONFIGURATION UNTUK MOBILE & TABLET (Maksimum skrin 768px) */
        @media (max-width: 768px) {
          .sc-main-layout {
            /* Hapuskan gap 250px di sebelah kiri sepenuhnya! */
            margin-left: 0px !important; 
          }
          
          .sc-content-area {
            /* Kecilkan padding di mobile supaya content (table/card) rapat & penuh skrin */
            padding: 16px 12px !important; 
          }
        }
      `}} />
    </div>
  );
}