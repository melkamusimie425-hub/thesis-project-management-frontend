import { useEffect, useState } from 'react';
import client from '../api/client';
import { Spinner, StatusBadge, EmptyState, formatDate } from '../components/ui';

export default function Proposals() {
  const [proposals, setProposals] = useState(null);

  useEffect(() => {
    client.get('/proposals').then(({ data }) => setProposals(data.proposals.data || [])).catch(() => setProposals([]));
  }, []);

  if (!proposals) return <Spinner label="Loading proposals…" />;

  return (
    <div>
      <div className="page-head"><h2>Proposals</h2><p>All submitted thesis proposals awaiting or completed review.</p></div>
      <div className="card">
        {proposals.length === 0 ? (
          <div className="card-pad"><EmptyState icon="📑" title="No proposals" subtitle="Proposals submitted by graduate students appear here." /></div>
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead><tr><th>Student</th><th>Title</th><th>Advisor</th><th>Submitted</th><th>Status</th></tr></thead>
              <tbody>
                {proposals.map((p) => (
                  <tr key={p.id}>
                    <td className="fw-600 text-sm">{p.student?.full_name}</td>
                    <td className="text-sm">{p.title}</td>
                    <td className="text-sm muted">{p.advisor?.full_name || 'Not assigned'}</td>
                    <td className="text-sm">{formatDate(p.submitted_at)}</td>
                    <td><StatusBadge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
