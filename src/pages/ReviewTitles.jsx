import { useEffect, useState } from 'react';
import client from '../api/client';
import { useToast } from '../components/Toast';
import { Spinner, StatusBadge, EmptyState } from '../components/ui';
import Modal from '../components/Modal';

export default function ReviewTitles() {
  const toast = useToast();
  const [titles, setTitles] = useState(null);
  const [editing, setEditing] = useState(null);
  const [comment, setComment] = useState('');

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
                    <td>
                      {t.status === 'pending' ? (
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditing(t)}>Review</button>
                      ) : (
                        <span className="text-sm muted">Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
    </div>
  );
}
