/* Small reusable UI primitives — dark glassmorphism theme */

export function Spinner({ label }) {
  return (
    <div className="loading-screen">
      <div>
        <div className="spinner" />
        {label && (
          <p className="muted text-sm" style={{ marginTop: 12, textAlign: 'center' }}>
            {label}
          </p>
        )}
      </div>
    </div>
  );
}

export function EmptyState({ icon = '📭', title = 'Nothing here yet', subtitle }) {
  return (
    <div className="empty">
      <div className="ic">{icon}</div>
      <h4>{title}</h4>
      {subtitle && <p className="text-sm muted" style={{ marginTop: 4 }}>{subtitle}</p>}
    </div>
  );
}

/* Status → badge colour map */
const STATUS_MAP = {
  pending: 'amber',  title_submitted: 'amber',  title_approved: 'green',
  submitted: 'blue', advising: 'teal',           scheduled: 'blue',
  defended: 'green', completed: 'green',          passed: 'green',
  failed: 'rose',    writing: 'slate',
  approved: 'green', rejected: 'rose',
  accepted: 'green', major_revision: 'amber',
};

export function StatusBadge({ status }) {
  const key   = (status || '').toLowerCase().replace(/\s+/g, '_');
  const color = STATUS_MAP[key] || 'slate';
  const label = (status || '—').replace(/_/g, ' ');
  return (
    <span className={`badge badge-${color}`}>
      <span className="dot" />
      <span style={{ textTransform: 'capitalize' }}>{label}</span>
    </span>
  );
}

export function RoleBadge({ role }) {
  const MAP = {
    Administrator:'Admin', DepartmentHead:'Dept. Head',
    UGPC:'UG Coord.', GPC:'G Coord.', IPC:'IP Comm.',
    SGC:'Grad Comm.', Student:'Student', GradStudent:'Grad Std.',
    Advisor:'Advisor', Examiner:'Examiner', Guest:'Guest',
  };
  return <span className="badge badge-gold">{MAP[role] || role}</span>;
}

export function formatDate(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch { return value; }
}

export function formatDateTime(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return value; }
}
