import { useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Spinner, StatusBadge, EmptyState } from '../components/ui';

export default function SubmitProjectTitle() {
  const { user } = useAuth();
  const toast = useToast();
  const [group, setGroup] = useState(null);
  const [titles, setTitles] = useState(['', '', '']);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    client.get('/project-groups')
      .then(({ data }) => {
        setGroup(data.groups.data?.find((g) => g.members?.some((m) => m.id === user.id)) || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user.id]);

  function setTitle(i, value) {
    setTitles((prev) => prev.map((t, idx) => (idx === i ? value : t)));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const filled = titles.filter((t) => t.trim());
    if (filled.length === 0) { toast.error('Enter at least one title.'); return; }
    if (filled.length > 3) { toast.error('You can submit at most 3 alternative titles (BR-03).'); return; }
    if (new Set(filled).size !== filled.length) { toast.error('Titles must be distinct.'); return; }
    setSaving(true);
    try {
      await client.post('/project-titles', { group_id: group.id, titles: filled });
      toast.success('Project titles submitted successfully!');
      const { data } = await client.get('/project-titles', { params: { group_id: group.id } });
      setGroup({ ...group, titles: data.titles, status: 'title_submitted' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit titles.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Spinner label="Loading…" />;

  if (!group) {
    return (
      <div>
        <div className="page-head"><h2>Submit Project Title</h2></div>
        <div className="card card-pad"><EmptyState icon="👥" title="No project group found" subtitle="Form a project group first before submitting titles." /></div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-head">
        <h2>Submit Project Title</h2>
        <p>Group: <strong>{group.name}</strong> · Submit up to 3 alternative titles (BR-03).</p>
      </div>

      {group.titles?.length > 0 && (
        <div className="card card-pad mb">
          <h3 className="mb">Submitted Titles</h3>
          <div className="table-wrap">
            <table className="data">
              <thead><tr><th>#</th><th>Title</th><th>Status</th></tr></thead>
              <tbody>
                {group.titles.map((t) => (
                  <tr key={t.id}>
                    <td>{t.title_order}</td>
                    <td>{t.title}</td>
                    <td><StatusBadge status={t.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card card-pad">
        <h3 className="mb">Propose Titles</h3>
        <form onSubmit={handleSubmit} className="form-grid">
          {[0, 1, 2].map((i) => (
            <div className="field" key={i}>
              <label>Alternative Title {i + 1}{i === 0 && ' (required)'}</label>
              <input className="input" value={titles[i]} onChange={(e) => setTitle(i, e.target.value)} placeholder={`Enter title option ${i + 1}`} />
            </div>
          ))}
          <div>
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Submitting…' : '📝 Submit Titles'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
