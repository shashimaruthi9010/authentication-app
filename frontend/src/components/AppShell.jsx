import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { logoutUser } from '../services/api';
import { clearUserProfile } from '../utils/profile';
import Logo from './ui/Logo';
import Icon from './ui/Icon';

const NAV = [
  { group: 'Track', items: [
    { to: '/dashboard', icon: 'home', label: 'Dashboard' },
    { to: '/food-diary', icon: 'bowl', label: 'Food Diary' },
    { to: '/symptoms', icon: 'activity', label: 'Symptoms' },
    { to: '/lab-results', icon: 'flask', label: 'Lab Results' },
  ]},
  { group: 'Plan', items: [
    { to: '/assessment', icon: 'clipboard', label: 'Assessment' },
    { to: '/meal-plan', icon: 'leaf', label: 'Meal Plan' },
    { to: '/progress', icon: 'chart', label: 'Progress' },
  ]},
];

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/food-diary': 'Food Diary',
  '/symptoms': 'Symptoms',
  '/lab-results': 'Lab Results',
  '/assessment': 'Assessment',
  '/meal-plan': 'Meal Plan',
  '/progress': 'Progress',
};

function getInitials(firstName = '', lastName = '') {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'N';
}

function todayLabel() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function SidebarNav({ onNavigate }) {
  return (
    <>
      {NAV.map((group) => (
        <div key={group.group}>
          <div className="sidebar__group-label">{group.group}</div>
          {group.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) => `nav-item${isActive ? ' nav-item--active' : ''}`}
            >
              <Icon name={item.icon} />
              {item.label}
            </NavLink>
          ))}
        </div>
      ))}
    </>
  );
}

function UserCard({ user }) {
  return (
    <div className="user-card">
      <div className="user-card__avatar" id="user-avatar">
        {getInitials(user?.first_name, user?.last_name)}
      </div>
      <div className="user-card__meta">
        <div className="user-card__name" id="user-full-name">
          {user ? `${user.first_name} ${user.last_name}` : '—'}
        </div>
        <div className="user-card__email" id="user-email">
          {user?.email}
        </div>
      </div>
    </div>
  );
}

export default function AppShell({ children, topbarId }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    try {
      setUser(JSON.parse(localStorage.getItem('user') || 'null'));
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutUser();
    } catch {
      // token may be expired — proceed with local logout
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      clearUserProfile();
      navigate('/login', { replace: true });
    }
  };

  const title = PAGE_TITLES[location.pathname] || 'NutriSense';

  const sidebarContent = (
    <>
      <div className="sidebar__brand">
        <Logo size="sm" wordmark />
      </div>
      <nav className="sidebar__nav">
        <SidebarNav />
      </nav>
      <div className="sidebar__user">
        <UserCard user={user} />
        <button
          id="logout-btn"
          className="nav-item nav-item--danger"
          style={{ marginTop: 8 }}
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? <span className="btn-spinner" /> : <Icon name="logout" />}
          {loggingOut ? 'Logging out…' : 'Log out'}
        </button>
      </div>
    </>
  );

  return (
    <div className="shell">
      {/* Desktop sidebar */}
      <aside className="sidebar hide-sm">{sidebarContent}</aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer__head">
              <Logo size="sm" wordmark />
              <button className="icon-btn" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
                <Icon name="close" />
              </button>
            </div>
            <div className="drawer__body">
              <SidebarNav onNavigate={() => setDrawerOpen(false)} />
            </div>
            <div className="drawer__foot">
              <UserCard user={user} />
              <button
                id="logout-btn"
                className="nav-item nav-item--danger"
                style={{ marginTop: 8 }}
                onClick={handleLogout}
                disabled={loggingOut}
              >
                {loggingOut ? <span className="btn-spinner" /> : <Icon name="logout" />}
                {loggingOut ? 'Logging out…' : 'Log out'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="shell__main">
        <header className="topbar" id={topbarId}>
          <div className="topbar__left">
            <button className="icon-btn hide-desktop" onClick={() => setDrawerOpen(true)} aria-label="Open menu" id="menu-btn">
              <Icon name="menu" />
            </button>
            <div>
              <div className="topbar__title">{title}</div>
              <div className="topbar__date hide-sm">{todayLabel()}</div>
            </div>
          </div>
          <div className="topbar__actions">
            <button className="icon-btn" onClick={handleLogout} disabled={loggingOut} aria-label="Log out">
              <Icon name="logout" />
            </button>
          </div>
        </header>

        <main className="shell__content">{children}</main>
      </div>
    </div>
  );
}
