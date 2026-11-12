import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_LABELS = {
  Administrator:'Administrator', DepartmentHead:'Dept. Head',
  UGPC:'UG Coordinator', GPC:'G Coordinator', IPC:'IP Committee',
  SGC:'Grad Committee', Student:'Student', GradStudent:'Grad Student',
  Advisor:'Advisor', Examiner:'Examiner', Guest:'Guest',
};

export default function Topbar({ title, subtitle, onMenu }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const hasPhoto = !!user?.avatar_url;

  return (
    <header className="topbar">
      <div>
        <button className="menu-toggle" onClick={onMenu} aria-label="Menu">☰</button>
        <div className="page-title">{title || 'Dashboard'}</div>
        {subtitle && <div className="page-sub">{subtitle}</div>}
      </div>

      <div className="right">
        {/* Notification dot placeholder */}
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, cursor: 'pointer', transition: 'all .15s',
          position: 'relative',
        }}
          title="Announcements"
          onClick={() => navigate('/announcements')}
        >
          🔔
          <span style={{
            position: 'absolute', top: 6, right: 6,
            width: 7, height: 7, borderRadius: '50%',
            background: '#f43f5e', border: '1.5px solid rgba(2,10,5,.9)',
          }} />
        </div>

        {/* User chip */}
        <div
          className="user-chip"
          onClick={() => navigate('/profile')}
          role="button"
          title="My Profile"
        >
          <div className="avatar">
            {hasPhoto
              ? <img src={user.avatar_url} alt={user?.full_name}
                  onError={(e) => { e.target.style.display = 'none'; }} />
              : (user?.initials || 'U')}
          </div>
          <div>
            <div className="uname">{user?.first_name} {user?.last_name}</div>
            <div className="urole">{ROLE_LABELS[user?.role] || user?.role}</div>
          </div>
        </div>

        {/* Logout */}
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => { logout(); navigate('/login'); }}
          style={{ fontSize: 12 }}
          title="Logout"
        >
          <span style={{ display: 'none' }} className="logout-text">⏻ Logout</span>
          <span>⏻</span>
        </button>
      </div>
    </header>
  );
}
