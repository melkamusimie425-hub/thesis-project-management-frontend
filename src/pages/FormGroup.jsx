import { useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Spinner, EmptyState } from '../components/ui';

export default function FormGroup() {
  const { user } = useAuth();
  const toast = useToast();
  const [students, setStudents] = useState(null);
  const [selected, setSelected] = useState([user.id]);
  const [leader, setLeader] = useState(user.id);
  const [loading, setLoading] = useState(false);
  const [existing, setExisting] = useState(null);

  useEffect(() => {
    client.get('/students?program=Undergraduate').then(({ data }) => {
      setStudents(data.students);
    }).catch(() => setStudents([]));
    client.get('/project-groups').then(({ data }) => {
      const mine = data.groups.data?.find((g) => g.members?.some((m) => m.id === user.id));
      setExisting(mine || null);
    }).catch(() => {});
  }, [user.id]);

  function toggle(id) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 5) { toast.error('A group can have at most 5 members (BR-01).'); return prev; }
      return [...prev, id];
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (selected.length < 1) { toast.error('Select at least one member.'); return; }
    setLoading(true);
    try {
      const members = selected.map((id) => ({ student_id: id, is_leader: id === leader, agreed: true }));
      await client.post('/project-groups', { name: `Group of ${user.first_name}`, members });
      toast.success('Project group formed successfully!');
      const { data } = await client.get('/project-groups');
      setExisting(data.groups.data?.find((g) => g.members?.some((m) => m.id === user.id)) || null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to form group.');
    } finally {
      setLoading(false);
    }
  }

  if (!students) return <Spinner label="Loading students…" />;

  if (existing) {
    return (
      <div>
        <div className="page-head"><h2>My Project Group</h2><p>You are already part of a project group (BR-02).</p></div>
        <div className="card card-pad">
          <h3 style={{ marginBottom: 12 }}>{existing.name}</h3>
          {existing.approved_title && <p className="muted mb">Approved Title: <strong>{existing.approved_title}</strong></p>}
          <p className="muted mb">Status: <strong>{existing.status}</strong></p>
          <p className="fw-600 mb">Members</p>
          <ul style={{ paddingLeft: 18 }}>
            {existing.members?.map((m) => <li key={m.id} className="text-sm">{m.full_name} — {m.id_number}</li>)}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-head"><h2>Form Project Group</h2><p>Select your teammates — a group has at most 5 members (BR-01).</p></div>
      <div className="card card-pad">
        {students.length === 0 ? <EmptyState icon="👥" title="No students found" /> : (
          <form onSubmit={handleSubmit}>
            <div className="table-wrap mb">
              <table className="data">
                <thead><tr><th>Select</th><th>Name</th><th>ID Number</th><th>Email</th><th>Leader</th></tr></thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id}>
                      <td><input type="checkbox" checked={selected.includes(s.id)} onChange={() => toggle(s.id)} disabled={s.id === user.id} /></td>
                      <td>{s.first_name} {s.last_name}{s.id === user.id ? ' (You)' : ''}</td>
                      <td>{s.id_number}</td>
                      <td className="text-sm muted">{s.email}</td>
                      <td><input type="radio" name="leader" checked={leader === s.id} onChange={() => setLeader(s.id)} disabled={!selected.includes(s.id)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm muted mb">{selected.length} member(s) selected.</p>
            <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Creating…' : '👥 Form Group'}</button>
          </form>
        )}
      </div>
    </div>
  );
}
