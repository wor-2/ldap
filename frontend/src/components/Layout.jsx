import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  Users,
  User,
  KeyRound,
  ScrollText,
  LogOut,
} from 'lucide-react';
import useAuthStore from '../store/authStore';

const Layout = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, end: true },
    { name: 'AD Groups', path: '/groups', icon: Users, end: false },
    { name: 'AD Users', path: '/users', icon: User, end: false },
    { name: 'Permissions', path: '/permissions', icon: KeyRound, end: false },
    { name: 'Audit Log', path: '/audit', icon: ScrollText, end: false },
  ];

  const username = user?.username || user?.displayName || 'User';
  const avatarLetter = (username[0] || 'U').toUpperCase();
  const displayName = user?.displayName || user?.username || 'Super User';
  const role = user?.role || 'SUPER_USER';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside className="sidebar">
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <Shield size={22} color="#ffffff" strokeWidth={2.2} />
          </div>
          <div className="sidebar-brand-text">
            <div className="sidebar-brand-name">AD Manager</div>
            <div className="sidebar-brand-sub">Control Panel</div>
          </div>
        </div>

        {/* Navigation */}
        <div className="sidebar-nav">
          <div className="sidebar-section-label">Main Menu</div>
          <nav>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={(n) => `nav-link ${n.isActive ? 'active' : ''}`}
                >
                  <div className="nav-link-icon">
                    <Icon size={18} strokeWidth={1.8} />
                  </div>
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">{avatarLetter}</div>
            <div className="user-info">
              <div className="user-name" title={displayName}>
                {displayName}
              </div>
              <div className="user-role">{role}</div>
            </div>
          </div>
          <button type="button" className="logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <div className="fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
