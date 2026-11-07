import { useEffect, useState } from 'react';
import client from '../api/client';
import { useToast } from '../components/Toast';
import { Spinner, StatusBadge, EmptyState } from '../components/ui';

export default function AssignProjectAdvisor() {
  const toast = useToast();
  const [groups, setGroups] = useState(null);
  const [instructors, setInstructors] = useState([]);
  const [assigning, setAssigning] = useState(null);
  const [advisor, setAdvisor] = useState('');

  useEffect(() => {
    Promise.all([
      client.get('/project-groups'),
      client.get('/instructors'),
    ]).then(([{ data: g }, { data: i }]) => {
      setGroups(g.groups.data || []);
      setInstructors(i.instructors || []);
    }).catch(() => setGroups([]));
  }, []);

  async function assign(group) {
    if (!advisor) { toast.error('Select an advisor first.'); return; }
    try {
      await client.post(`/project-groups/${group.id}/assign-advisor`, { advisor_id: advisor });
      toast.success(`Advisor assigned to ${group.name}.`);
      setAssigning(null);
      const { data } = await client.get('/project-groups');
      setGroups(data.groups.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign advisor.');
    }
  }

  if (!groups) return <Spinner label="Loading groups…" />;

  const eligible = groups.filter((g) => g.approved_title && !g.advisor_id);

  return (
    <div>
      <div className="page-head">
        <h2>Assign Project Advisor</h2>
        <p>Match approved project groups with available advisors (SUC-03).</p>
      </div>
      <div className="card">
        {groups.length === 0 ? (
          <div className="card-pad"><EmptyState icon="🧑‍🏫" title="No groups to assign" subtitle="Groups with approved titles will appear here." /></div>
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead><tr><th>Group</th><th>Approved Title</th><th>Advisor</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {groups.map((g) => (
                  <tr key={g.id}>
                    <td className="fw-600">{g.name}</td>
                    <td className="text-sm">{g.approved_title || <span className="muted">No approved title</span>}</td>
                    <td className="text-sm">{g.advisor?.full_name || <span className="muted">Not assigned</span>}</td>
                    <td><StatusBadge status={g.status} /></td>
                    <td>
                      {g.approved_title && (
                        <button className="btn btn-ghost btn-sm" onClick={() => { setAssigning(g); setAdvisor(g.advisor_id || ''); }}>
                          {g.advisor_id ? 'Reassign' : 'Assign'}
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

      {assigning && (
        <div className="modal-overlay" onClick={() => setAssigning(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head"><h3>Assign Advisor — {assigning.name}</h3><button className="close" onClick={() => setAssigning(null)}>×</button></div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="alert alert-info"><span>📝</span><div>Title: <strong>{assigning.approved_title}</strong></div></div>
                <div className="field">
                  <label>Select Advisor</label>
                  <select className="select" value={advisor} onChange={(e) => setAdvisor(e.target.value)}>
                    <option value="">— Choose an instructor —</option>
                    {instructors.map((i) => <option key={i.id} value={i.id}>{i.salutation} {i.first_name} {i.last_name} ({i.id_number})</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setAssigning(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => assign(assigning)}>Assign Advisor</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
