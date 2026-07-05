import { useEffect, useState, useRef } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { BarChart3, Bell, Files, Gauge, LockKeyhole, LogOut, Moon, Network, Settings, ShieldCheck, Sun, UserRound, Users } from 'lucide-react';
import { logout } from '../../store/slices/authSlice.js';
import { fetchNotifications,markAllAsRead } from '../../store/slices/notificationSlice.js';
import { toggleTheme } from '../../store/slices/themeSlice.js';
import { activityLabel, t } from '../../lib/labels.js';

const links = [
  ['dashboard', '/dashboard', Gauge], ['files', '/files', Files], ['shared', '/shared', Network], ['workspace', '/workspace', Users], ['analytics', '/analytics', BarChart3], ['settings', '/settings', Settings], ['admin', '/admin', ShieldCheck]
];

export function AppLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const mode = useSelector((s) => s.theme.mode);
  const locale = useSelector((s) => s.theme.locale);
  const notifications = useSelector((s) => s.notifications.items);
  const unread = notifications.filter((n) => !n.readAt).length;
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccount, setShowAccount] = useState(false);

  const notificationRef = useRef(null);
  const accountRef = useRef(null);

  useEffect(() => { 
  dispatch(fetchNotifications()); 
  const interval = setInterval(() => {
    dispatch(fetchNotifications());
  }, 30000); 

  return () => clearInterval(interval);
}, [dispatch]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setShowAccount(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function signOut() { 
    await dispatch(logout()); 
    navigate('/login'); 
  }

  return <div className="app-shell">
    <aside className="sidebar glass-panel">
      <div className="brand"><span className="brand-mark"><LockKeyhole size={20} /></span><span>VaultShare</span></div>
      <nav>{links.map(([label, to, Icon]) => <NavLink key={to} to={to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Icon size={18} /><span>{t(locale, label)}</span></NavLink>)}</nav>
      <div className="sidebar-card"><p>Storage</p><strong>{Math.round(((user?.storageUsed || 0) / (user?.storageLimit || 1)) * 100)}%</strong><span>Used</span></div>
    </aside>
    <main className="main-panel">
      <header className="topbar glass-panel">
        <div><p className="eyebrow">{t(locale, 'secureWorkspace')}</p><h1>{user?.name || 'VaultShare'}</h1></div>
        <div className="top-actions">
          <div className="menu-wrap" ref={notificationRef}>
            <button 
              className="icon-button" 
              aria-label="Notifications" 
              onClick={() => {
              setShowNotifications((v) => !v);
                if (!showNotifications) {
                dispatch(markAllAsRead()); // Marks them as read when opening
                }
              }}
            >
            <Bell size={19} />
            {unread > 0 && <span className="badge">{unread}</span>}
            </button>
            {showNotifications && <div className="dropdown glass-panel">
              <h3>{t(locale, 'notifications')}</h3>
              {notifications.length ? notifications.slice(0, 6).map((n) => <p key={n._id || n.id}><strong>{n.title || activityLabel(n.type)}</strong><span>{n.body || activityLabel(n.type)}</span></p>) : <p className="muted-line">{t(locale, 'noNotifications')}</p>}
            </div>}
          </div>

          <button className="icon-button" onClick={() => dispatch(toggleTheme())} aria-label="Toggle theme">{mode === 'dark' ? <Sun size={19} /> : <Moon size={19} />}</button>
          
          <div className="menu-wrap" ref={accountRef}>
            <button className="avatar-button" onClick={() => setShowAccount((v) => !v)}>
              <span className="avatar">{user?.name?.[0] || 'V'}</span>
            </button>
            {showAccount && <div className="dropdown account-menu glass-panel">
              <h3>{user?.name || t(locale, 'account')}</h3>
              <p className="muted-line">{user?.email}</p>
              <button onClick={() => navigate('/settings')}><UserRound size={16} /> {t(locale, 'profileSettings')}</button>
              <button onClick={signOut}><LogOut size={16} /> {t(locale, 'logout')}</button>
            </div>}
          </div>

        </div>
      </header>
      <section className="content"><Outlet /></section>
    </main>
  </div>;
}