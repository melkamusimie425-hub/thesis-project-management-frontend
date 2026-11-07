import { useEffect, useState } from 'react';
import client from '../api/client';
import { Spinner, StatusBadge, EmptyState } from '../components/ui';

export default function Theses() {
  const [theses, setTheses] = useState(null);

  useEffect(() => {
    client.get('/theses').then(({ data }) => setTheses(data.theses.data || [])).catch(() => setTheses([]));
  }, []);

  if (!theses) return <Spinner label="Loading theses…" />;

  return (
    <div>
      <div className="page-head"><h2>Theses</h2><p>All thesis works across graduate programs.</p></div>
      <div className="card">
        {theses.length === 0 ? (
          <div className="card-pad"><EmptyState icon="📄" title="No theses" subtitle="Thesis works appear here once students register them." /></div>
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead><tr><th>Student</th><th>Title</th><th>Advisor</th><th>Academic Year</th><th>Status</th></tr></thead>
              <tbody>
                {theses.map((t) => (
                  <tr key={t.id}>
                    <td className="fw-600 text-sm">{t.student?.full_name}</td>
                    <td className="text-sm">{t.title}</td>
                    <td className="text-sm muted">{t.advisor?.full_name || 'Not assigned'}</td>
                    <td className="text-sm">{t.academic_year?.year}</td>
                    <td><StatusBadge status={t.status} /></td>
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
