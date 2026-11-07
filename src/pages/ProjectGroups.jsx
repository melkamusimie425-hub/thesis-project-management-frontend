import { useEffect, useState } from 'react';
import client from '../api/client';
import { Spinner, StatusBadge, EmptyState } from '../components/ui';
import Modal from '../components/Modal';

export default function ProjectGroups() {
  const [groups, setGroups] = useState(null);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('');

  useEffect(() => { load(); }, []);
  function load() {
    client.get('/project-groups').then(({ data }) => setGroups(data.groups.data)).catch(() => setGroups([]));
  }

  if (!groups) return <Spinner label="Loading project groups…" />;

  const filtered = filter ? groups.filter((g) => g.status === filter) : groups;

  return (
    <div>
      <div className="page-head">
        <h2>Project Groups</h2>
        <p>All industrial project groups in the active academic year.</p>
      </div>
      <div className="flex gap mb">
        <select className="select" style={{ maxWidth: 220 }} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="title_submitted">Title Submitted</option>
          <option value="title_approved">Title Approved</option>
          <option value="advising">Advising</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <div className="card">
        {filtered.length === 0 ? (
          <div className="card-pad"><EmptyState icon="🗂️" title="No project groups" subtitle="Groups will appear here once students form them." /></div>
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead><tr><th>Group</th><th>Approved Title</th><th>Advisor</th><th>Members</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {filtered.map((g) => (
                  <tr key={g.id}>
                    <td className="fw-600">{g.name}</td>
                    <td className="text-sm">{g.approved_title || <span className="muted">—</span>}</td>
                    <td className="text-sm">{g.advisor?.full_name || <span className="muted">Not assigned</span>}</td>
                    <td className="text-sm muted">{g.members?.length || 0} member(s)</td>
                    <td><StatusBadge status={g.status} /></td>
                    <td><button className="btn btn-ghost btn-sm" onClick={() => setSelected(g)}>View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={!!selected} title="Group Details" onClose={() => setSelected(null)} wide>
        {selected && (
          <div className="form-grid">
            <div className="flex-between">
              <h3>{selected.name}</h3>
              <StatusBadge status={selected.status} />
            </div>
            <div className="field"><label>Approved Title</label><div className="text-sm">{selected.approved_title || 'Not approved yet'}</div></div>
            <div className="field"><label>Advisor</label><div className="text-sm">{selected.advisor?.full_name || 'Not assigned'}</div></div>
            <div className="field"><label>Academic Year</label><div className="text-sm">{selected.academic_year?.year} — {selected.academic_year?.semester}</div></div>
            <div>
              <p className="fw-600 mb">Members</p>
              <div className="table-wrap">
                <table className="data">
                  <thead><tr><th>Name</th><th>ID</th><th>Email</th></tr></thead>
                  <tbody>
                    {selected.members?.map((m) => (
                      <tr key={m.id}><td>{m.first_name} {m.last_name}</td><td>{m.id_number}</td><td className="text-sm muted">{m.email}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
