import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import Sidebar from '@/components/layout/Sidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if (user.role !== 'admin') redirect('/servicecentre');

  // Kita tetapkan satu nilai lebar supaya senang nak selaraskan
  const SIDEBAR_WIDTH = 250; 

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      background: '#0B0B14', // Warna background utama yang gelap
      fontFamily: 'Outfit, sans-serif' 
    }}>
      {/* SIDEBAR - Pastikan lebar di sini sama dengan marginLeft main */}
      <Sidebar 
        role="admin" 
        userName={user.email.split('@')[0]} 
      />

      {/* MAIN CONTENT */}
      <main style={{ 
        marginLeft: SIDEBAR_WIDTH, // Mesti sama dengan lebar Sidebar
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        background: '#0B0B14' // Gelap supaya serasi dengan header
      }}>
        
        {/* TOPBAR / HEADER */}
        <header style={{ 
          background: '#0B0B14', // Sama dengan background main
          borderBottom: '1px solid rgba(255,255,255,0.05)', 
          padding: '18px 28px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          position: 'sticky', 
          top: 0, 
          zIndex: 50,
          backdropFilter: 'blur(10px)' // Tambahan nampak lebih moden
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ 
              width: 8, 
              height: 8, 
              background: '#00D68F', 
              borderRadius: '50%',
              boxShadow: '0 0 8px #00D68F' // Efek glow pada titik Live
            }}></div>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#00D68F', letterSpacing: '0.5px' }}>
              LIVE
            </span>
          </div>
          <span style={{ fontSize: 12, color: '#44445A', fontWeight: 500 }}>
            SYSTEM ADMINISTRATOR
          </span>
        </header>

        {/* PAGE CONTENT */}
        <div style={{ 
          flex: 1, 
          padding: '32px', 
          background: '#0B0B14', // Pastikan bahagian children pun gelap
          color: '#FFFFFF' 
        }}>
          {children}
        </div>
      </main>
    </div>
  );
}