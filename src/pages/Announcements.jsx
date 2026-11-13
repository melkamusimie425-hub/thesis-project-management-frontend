import { useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Spinner, EmptyState, formatDateTime, formatDate } from '../components/ui';

export default function Announcements() {
  const { user } = useAuth();
  const toast = useToast();
  const [notices, setNotices] = useState(null);

  async function load() {
    try {
      const { data } = await client.get('/notices');
      setNotices(data.notices);
    } catch {
      setNotices([]);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id) {
    try {
      await client.delete(`/notices/${id}`);
      toast.success('Announcement deleted.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete announcement.');
    }
  }

  if (!notices) return <Spinner label="Loading announcements…" />;

  const pinned  = notices.filter((n) => n.is_pinned);
  const regular = notices.filter((n) => !n.is_pinned);

  const canDelete = (n) => {
    if (!user) return false;
    return n.sender_id === user.id
      || ['Administrator', 'UGPC', 'GPC', 'SGC', 'IPC'].includes(user.role);
  };

  return (
    <div>
      <div className="page-head">
        <h2>📣 Announcements</h2>
        <p>Notices and messages from your program coordinators.</p>
      </div>

      {notices.length === 0 ? (
        <div className="card card-pad">
          <EmptyState icon="📣" title="No announcements yet" subtitle="Coordinators' notices will appear here." />
        </div>
      ) : (
        <div className="form-grid">
          {pinned.map((n) => <NoticeCard key={n.id} notice={n} canDelete={canDelete(n)} onDelete={handleDelete} />)}
          {regular.map((n) => <NoticeCard key={n.id} notice={n} canDelete={canDelete(n)} onDelete={handleDelete} />)}
        </div>
      )}
    </div>
  );
}

function NoticeCard({ notice: n, canDelete, onDelete }) {
  return (
    <div className="card card-pad" style={{ position: 'relative', overflow: 'hidden' }}>
      {n.is_pinned && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, transparent, #c8a800, transparent)' }} />
      )}
      <div className="flex-between" style={{ marginBottom: 8 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{n.subject}</h3>
        <div className="flex" style={{ gap: 8, flexWrap: 'wrap' }}>
          {n.is_pinned && <span className="badge badge-gold"><span className="dot" />Pinned</span>}
          {n.expires_at && (
            <span className="badge badge-slate" title={`Expires ${formatDate(n.expires_at)}`}>
              <span className="dot" />Exp {formatDate(n.expires_at)}
            </span>
          )}
        </div>
      </div>
      <p style={{ fontSize: 13, color: 'rgba(226,240,232,.6)', lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: 12 }}>
        {n.message}
      </p>
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: 8 }}>
        <div className="flex" style={{ gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 11.5, color: 'rgba(200,168,0,.7)', fontWeight: 600 }}>
            From {n.sender?.first_name} {n.sender?.last_name}
          </span>
          <span className="badge badge-slate">To: {n.recipient_role === 'all' ? 'Everyone' : n.recipient_role}</span>
        </div>
        <div className="flex" style={{ gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'rgba(226,240,232,.35)' }}>{formatDateTime(n.created_at)}</span>
          {canDelete && (
            <button
              className="btn btn-danger btn-sm"
              onClick={() => onDelete(n.id)}
              title="Delete this announcement"
            >
              🗑 Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
