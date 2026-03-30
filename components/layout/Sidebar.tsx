'use client';
import { useRouter, usePathname } from 'next/navigation';

interface NavItem { icon: string; label: string; href: string; badge?: number; adminOnly?: boolean; }

interface SidebarProps {
  role: 'admin' | 'servicecentre';
  userName: string;
  centreName?: string;
  pendingCount?: number;
}

export default function Sidebar({ role, userName, centreName, pendingCount }: SidebarProps) {

  const router = useRouter();
  const path = usePathname();

  const adminNav: NavItem[] = [
    { icon: '📊', label: 'Overview', href: '/admin' },
    { icon: '📅', label: 'Bookings', href: '/admin/bookings', badge: pendingCount },
    { icon: '👥', label: 'Users', href: '/admin/users' },
    { icon: '🏢', label: 'Service Centres', href: '/admin/centres' },
    { icon: '⚡', label: 'Charging Stations', href: '/admin/stations' },
    { icon: '🔔', label: 'Notifications', href: '/admin/notifications' },
  ];

  const centreNav: NavItem[] = [
    { icon: '📊', label: 'Dashboard', href: '/servicecentre' },
    { icon: '📋', label: 'All Bookings', href: '/servicecentre/bookings' },
    { icon: '⏳', label: 'Pending', href: '/servicecentre/pending', badge: pendingCount },
    { icon: '📅', label: 'Schedule', href: '/servicecentre/schedule' },
    { icon: '🏢', label: 'Centre Profile', href: '/servicecentre/profile' },
  ];

  const nav = role === 'admin' ? adminNav : centreNav;

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const S: Record<string, React.CSSProperties> = {

    sidebar: {
      width: 230,
      background: '#ffffff',
      borderRight: '1px solid #eaeaea',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      zIndex: 100,
      fontFamily: 'Inter, sans-serif'
    },

    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '24px 20px',
      borderBottom: '1px solid #f0f0f0'
    },

    bolt: {
      width: 34,
      height: 34,
      background: '#00b894',
      borderRadius: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 16,
      color: '#fff'
    },

    badge: {
      margin: '16px',
      background: '#f8f9fb',
      border: '1px solid #eee',
      borderRadius: 10,
      padding: '10px 12px'
    },

    nav: {
      flex: 1,
      padding: '10px'
    },

    footer: {
      padding: 16,
      borderTop: '1px solid #eee'
    },

    signout: {
      width: '100%',
      background: '#fff0f0',
      border: '1px solid #ffcdd2',
      borderRadius: 10,
      padding: 10,
      fontSize: 13,
      fontWeight: 600,
      color: '#d63031',
      cursor: 'pointer'
    }

  };

  return (
    <aside style={S.sidebar}>

      <div style={S.logo}>
        <div style={S.bolt}>⚡</div>
        <span style={{ fontSize: 18, fontWeight: 700, color: '#111' }}>
          EVLife
        </span>
      </div>

      <div style={S.badge}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#00b894' }}>
          {userName}
        </div>

        <div style={{ fontSize: 11, color: '#777' }}>
          {role === 'admin'
            ? 'System Administrator'
            : centreName || 'Service Centre'}
        </div>
      </div>

      <nav style={S.nav}>

        {nav.map(item => {

          const active = path === item.href;

          return (
            <div
              key={item.href}
              onClick={() => router.push(item.href)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 12px',
                borderRadius: 10,
                cursor: 'pointer',
                marginBottom: 4,
                fontSize: 14,
                color: active ? '#00b894' : '#555',
                background: active ? '#e8f8f2' : 'transparent',
                border: active ? '1px solid #b9f1dd' : '1px solid transparent',
                transition: 'all 0.15s ease'
              }}
            >

              <span style={{ fontSize: 17, width: 22, textAlign: 'center' }}>
                {item.icon}
              </span>

              <span style={{ flex: 1 }}>
                {item.label}
              </span>

              {item.badge != null && item.badge > 0 && (
                <span
                  style={{
                    background: '#ff4757',
                    color: '#fff',
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '3px 7px',
                    borderRadius: 10
                  }}
                >
                  {item.badge}
                </span>
              )}

            </div>
          );
        })}

      </nav>

      <div style={S.footer}>
        <button style={S.signout} onClick={logout}>
          Sign Out
        </button>
      </div>

    </aside>
  );
}