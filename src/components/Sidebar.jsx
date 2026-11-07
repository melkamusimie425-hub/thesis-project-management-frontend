import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { navForRole } from './navigation';

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const groups   = navForRole(user?.role || 'Guest');
  const hasPhoto = !!user?.avatar_url;

  return (
    <>
      {open && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${open ? 'open' : ''}`}>

        {/* Brand */}
        <div className="sidebar-brand">
          <div className="logo">
            <img src="/wsu-logo.png" alt="WSU"
              onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<span>WSU</span>'; }} />
          </div>
          <div className="brand-text">
            <h1>OTPMS</h1>
            <span>Wolaita Sodo University</span>
          </div>
        </div>

        {/* User mini profile */}
        <NavLink to="/profile" onClick={onClose} className="sidebar-user">
          <div className="su-avatar">
            {hasPhoto
              ? <img src={user.avatar_url} alt={user?.first_name}
                  onError={(e) => { e.target.style.display = 'none'; }} />
              : (user?.initials || 'U')}
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="su-name">{user?.first_name} {user?.last_name}</div>
            <div className="su-role">{user?.role}</div>
          </div>
        </NavLink>

        {/* Nav links */}
        <nav className="nav">
          {groups.map((group) => (
            <div key={group.section}>
              <div className="nav-section">{group.section}</div>
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <span className="ic">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          © {new Date().getFullYear()} School of Information Science
        </div>
      </aside>
    </>
  );
}
