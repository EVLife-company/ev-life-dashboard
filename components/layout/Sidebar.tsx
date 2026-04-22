'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Building2, 
  Zap, 
  Bell, 
  LogOut,
  ClipboardList,
  Clock
} from 'lucide-react';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  badge?: number;
}

interface SidebarProps {
  role: 'admin' | 'servicecentre';
  userName: string;
  centreName?: string;
  pendingCount?: number;
}

export default function Sidebar({ role, userName, centreName, pendingCount }: SidebarProps) {
  const router = useRouter();
  const path = usePathname();

  // Mapping Ikon yang lebih profesional
  const adminNav: NavItem[] = [
    { icon: <LayoutDashboard size={18} />, label: 'Overview', href: '/admin' },
    { icon: <Calendar size={18} />, label: 'Bookings', href: '/admin/bookings', badge: pendingCount },
    { icon: <Users size={18} />, label: 'Users', href: '/admin/users' },
    { icon: <Building2 size={18} />, label: 'Service Centres', href: '/admin/centres' },
    { icon: <Zap size={18} />, label: 'Charging Stations', href: '/admin/stations' },
    { icon: <Bell size={18} />, label: 'Notifications', href: '/admin/notifications' },
  ];

  const centreNav: NavItem[] = [
    { icon: <LayoutDashboard size={18} />, label: 'Dashboard', href: '/servicecentre' },
    { icon: <ClipboardList size={18} />, label: 'All Bookings', href: '/servicecentre/bookings' },
    { icon: <Clock size={18} />, label: 'Pending', href: '/servicecentre/pending', badge: pendingCount },
    { icon: <Calendar size={18} />, label: 'Schedule', href: '/servicecentre/schedule' },
    { icon: <Building2 size={18} />, label: 'Centre Profile', href: '/servicecentre/profile' },
  ];

  const nav = role === 'admin' ? adminNav : centreNav;

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Sign out?',
      text: 'You will be logged out of your session',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#10B981', // Hijau menyesuaikan tema EV
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, sign out',
    });

    if (result.isConfirmed) {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
        router.refresh();
      } catch (err) {
        Swal.fire('Error', 'Failed to logout', 'error');
      }
    }
  };

  return (
    <aside style={styles.sidebar}>
      {/* LOGO SECTION */}
      <div style={styles.logoContainer}>
        <div style={styles.logoIcon}>
          <Zap size={20} fill="white" />
        </div>
        <span style={styles.logoText}>EVLife</span>
      </div>

      {/* USER PROFILE BOX */}
      <div style={styles.userBox}>
        {/* <div style={styles.userName}>{userName}</div> */}
        <div style={styles.userRole}>
          {role === 'admin' ? 'System Admin' : centreName || 'Service Centre'}
        </div>
      </div>

      {/* NAVIGATION */}
      <nav style={styles.navStack}>
        {nav.map((item) => {
          const isActive = path === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              style={{
                ...styles.navLink,
                backgroundColor: isActive ? '#ECFDF5' : 'transparent',
                color: isActive ? '#059669' : '#6B7280',
                border: `1px solid ${isActive ? '#A7F3D0' : 'transparent'}`,
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
              <span style={{ flex: 1, fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
              
              {item.badge ? (
                <span style={styles.badge}>{item.badge}</span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div style={styles.footer}>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

// Styles dipisahkan agar lebih bersih
const styles: Record<string, React.CSSProperties> = {
  // Dalam objek S (styles) anda:
  sidebar: {
    width: 260, // Lebar tetap
    background: '#FFFFFF',
    borderRight: '1px solid #E5E7EB',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 100, // Tambah ini supaya tak tenggelam
    fontFamily: 'Outfit, sans-serif',
  },
  logoContainer: {
    padding: '24px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  logoIcon: {
    width: 36,
    height: 36,
    backgroundColor: '#10B981',
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 800,
    color: '#111827',
    letterSpacing: '-0.5px',
  },
  userBox: {
    margin: '0 16px 20px',
    padding: '16px',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    border: '1px solid #F3F4F6',
  },
  userName: {
    fontSize: 14,
    fontWeight: 700,
    color: '#111827',
  },
  userRole: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  navStack: {
    flex: 1,
    padding: '0 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 12px',
    borderRadius: 8,
    textDecoration: 'none',
    fontSize: 14,
    transition: 'all 0.2s ease',
  },
  badge: {
    backgroundColor: '#EF4444',
    color: 'white',
    fontSize: 11,
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: 12,
  },
  footer: {
    padding: 16,
    borderTop: '1px solid #F3F4F6',
  },
  logoutBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '12px',
    backgroundColor: '#FEF2F2',
    color: '#DC2626',
    border: '1px solid #FEE2E2',
    borderRadius: 10,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
  }
};