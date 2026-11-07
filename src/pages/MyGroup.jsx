import { useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Spinner, StatusBadge, EmptyState } from '../components/ui';

export default function MyGroup() {
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/project-groups')
      .then(({ data }) => {
        setGroup(data.groups.data?.find((g) => g.members?.some((m) => m.id === user.id)) || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user.id]);

  if (loading) return <Spinner label="Loading your group…" />;

  if (!group) {
    return (
      <div>
        <div className="page-head"><h2>My Project Group</h2></div>
        <div className="card card-pad"><EmptyState icon="👥" title="You are not in a project group yet" subtitle="Form a project group to get started." /></div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-head"><h2>My Project Group</h2><p>Details of your industrial project team.</p></div>
      <div className="card card-pad">
        <div className="flex-between mb">
          <h3 style={{ fontSize: 18 }}>{group.name}</h3>
          <StatusBadge status={group.status} />
        </div>
        <div className="form-row">
          <div className="field"><label>Approved Title</label><div className="text-sm">{group.approved_title || 'Not approved yet'}</div></div>
          <div className="field"><label>Academic Year</label><div className="text-sm">{group.academic_year?.year} — {group.academic_year?.semester}</div></div>
          <div className="field"><label>Advisor</label><div className="text-sm">{group.advisor?.full_name || 'Not assigned'}</div></div>
        </div>
      </div>

      <div className="card card-pad mt">
        <h3 className="mb">Members</h3>
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th>Name</th><th>ID Number</th><th>Email</th><th>Role in Group</th></tr></thead>
            <tbody>
              {group.members?.map((m) => (
                <tr key={m.id}>
                  <td>{m.first_name} {m.last_name}</td>
                  <td>{m.id_number}</td>
                  <td className="text-sm muted">{m.email}</td>
                  <td><span className={`badge ${m.pivot?.is_leader ? 'badge-indigo' : 'badge-slate'}`}>{m.pivot?.is_leader ? 'Leader' : 'Member'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
