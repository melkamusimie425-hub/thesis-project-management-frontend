import { useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Spinner, StatusBadge, EmptyState } from '../components/ui';
import Modal from '../components/Modal';

export default function ReviewTitles() {
  const toast = useToast();
  const { user } = useAuth();
  const [titles, setTitles] = useState(null);
  const [editing, setEditing] = useState(null);
  const [comment, setComment] = useState('');
  const [deleting, setDeleting] = useState(null); // title being confirmed for delete

  const isAdmin = user?.role === 'Administrator';

  useEffect(() => { load(); }, []);
  function load() {
    client.get('/project-titles').then(({ data }) => setTitles(data.titles)).catch(() => setTitles([]));
  }

  async function decide(status) {
    try {
      await client.put(`/project-titles/${editing.id}`, { status, reviewer_comment: comment });
      toast.success(`Title ${status} successfully.`);
      setEditing(null);
      setComment('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    }
  }

  async function confirmDelete() {
    try {
      await client.delete(`/project-titles/${deleting.id}`);
      toast.success('Title deleted.');
      setDeleting(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.');
    }
  }

  if (!titles) return <Spinner label="Loading titles…" />;

  return (
    <div>
      <div className="page-head">
        <h2>Review &amp; Approve Titles</h2>
        <p>Approve or reject the project titles submitted by student groups (EUC-01).</p>
      </div>
      <div className="card">
        {titles.length === 0 ? (
          <div className="card-pad"><EmptyState icon="📝" title="No titles submitted" subtitle="Titles will appear here once students submit them." /></div>
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead><tr><th>#</th><th>Title</th><th>Group</th><th>Members</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {titles.map((t) => (
                  <tr key={t.id}>
                    <td>{t.title_order}</td>
                    <td className="fw-600">{t.title}</td>
                    <td className="text-sm">{t.group?.name || '—'}</td>
                    <td className="text-sm muted">{t.group?.members?.map((m) => m.first_name).join(', ') || '—'}</td>
                    <td><StatusBadge status={t.status} /></td>
                    <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {t.status === 'pending' && (
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditing(t)}>Review</button>
                      )}
                      {t.status !== 'pending' && !isAdmin && (
                        <span className="text-sm muted">Reviewed</span>
                      )}
                      {isAdmin && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setDeleting(t)}
                          title="Delete this title"
                        >
                          🗑 Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review modal */}
      <Modal open={!!editing} title="Review Title" onClose={() => { setEditing(null); setComment(''); }}
        footer={<>
          <button className="btn btn-ghost" onClick={() => decide('rejected')}>✕ Reject</button>
          <button className="btn btn-primary" onClick={() => decide('approved')}>✓ Approve</button>
        </>}>
        {editing && (
          <div className="form-grid">
            <div className="alert alert-info"><span>📝</span><div>Reviewing title option {editing.title_order} for group <strong>{editing.group?.name}</strong>.</div></div>
            <div className="field"><label>Title</label><div className="text-sm">{editing.title}</div></div>
            <div className="field"><label>Members</label><div className="text-sm muted">{editing.group?.members?.map((m) => `${m.first_name} ${m.last_name}`).join(', ')}</div></div>
            <div className="field"><label>Reviewer Comment</label><textarea className="textarea" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Optional comment for the students…" /></div>
          </div>
        )}
      </Modal>

      {/* Delete confirmation modal */}
      <Modal open={!!deleting} title="Delete Title" onClose={() => setDeleting(null)}
        footer={<>
          <button className="btn btn-ghost" onClick={() => setDeleting(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={confirmDelete}>🗑 Yes, Delete</button>
        </>}>
        {deleting && (
          <div className="form-grid">
            <div className="alert alert-error">
              <span>⚠️</span>
              <div>
                You are about to permanently delete this title.
                {deleting.status === 'approved' && (
                  <strong> This is an approved title — deleting it will reset the group status to "title submitted".</strong>
                )}
              </div>
            </div>
            <div className="field">
              <label>Title</label>
              <div className="fw-600" style={{ fontSize: 14, color: '#fff', padding: '8px 0' }}>{deleting.title}</div>
            </div>
            <div className="field">
              <label>Group</label>
              <div className="text-sm muted">{deleting.group?.name || '—'}</div>
            </div>
            <div className="field">
              <label>Status</label>
              <StatusBadge status={deleting.status} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
