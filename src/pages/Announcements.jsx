import { useEffect, useState } from 'react';
import client from '../api/client';
import { Spinner, EmptyState, formatDateTime } from '../components/ui';

export default function Announcements() {
  const [notices, setNotices] = useState(null);

  useEffect(() => {
    client.get('/notices')
      .then(({ data }) => setNotices(data.notices))
      .catch(() => setNotices([]));
  }, []);

  if (!notices) return <Spinner label="Loading announcements…" />;

  const pinned  = notices.filter((n) => n.is_pinned);
  const regular = notices.filter((n) => !n.is_pinned);

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
          {/* Pinned first */}
          {pinned.map((n) => <NoticeCard key={n.id} notice={n} />)}
          {regular.map((n) => <NoticeCard key={n.id} notice={n} />)}
        </div>
      )}
    </div>
  );
}

function NoticeCard({ notice: n }) {
  return (
    <div className="card card-pad" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Gold top bar for pinned */}
      {n.is_pinned && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, transparent, #c8a800, transparent)' }} />
      )}
      <div className="flex-between" style={{ marginBottom: 8 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{n.subject}</h3>
        {n.is_pinned && <span className="badge badge-gold"><span className="dot" />Pinned</span>}
      </div>
      <p style={{ fontSize: 13, color: 'rgba(226,240,232,.6)', lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: 12 }}>
        {n.message}
      </p>
      <div className="flex-between">
        <span style={{ fontSize: 11.5, color: 'rgba(200,168,0,.7)', fontWeight: 600 }}>
          From {n.sender?.first_name} {n.sender?.last_name}
        </span>
        <span style={{ fontSize: 11, color: 'rgba(226,240,232,.35)' }}>{formatDateTime(n.created_at)}</span>
      </div>
      <div style={{ marginTop: 8 }}>
        <span className="badge badge-slate">To: {n.recipient_role === 'all' ? 'Everyone' : n.recipient_role}</span>
      </div>
    </div>
  );
}
