import { useEffect, useState } from 'react';
import client from '../api/client';
import { Spinner, EmptyState } from '../components/ui';

export default function Reports() {
  const [report,  setReport]  = useState(null);
  const [type,    setType]    = useState('summary');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    client.get('/reports', { params: { type } })
      .then(({ data }) => setReport(data.report))
      .catch(() => setReport(null))
      .finally(() => setLoading(false));
  }, [type]);

  function exportCsv() {
    if (!report?.items?.length) return;
    const headers = Object.keys(report.items[0]);
    const rows    = report.items.map((r) =>
      headers.map((h) => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(',')
    );
    const csv  = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type:'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `${type}_report.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  const TABS = [
    { key:'summary', label:'📊 Summary' },
    { key:'thesis',  label:'📄 Theses' },
    { key:'project', label:'🗂️ Projects' },
  ];

  return (
    <div>
      <div className="page-head">
        <h2>📊 Reports</h2>
        <p>Generate timely reports on theses and projects (EUC-23).</p>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:18 }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setType(t.key)}
            style={{
              padding:'9px 18px', borderRadius:10, border:'none', cursor:'pointer',
              fontFamily:'inherit', fontSize:13, fontWeight:700,
              background: type === t.key
                ? 'linear-gradient(135deg, #1a5c2a, #2d7a40)'
                : 'rgba(255,255,255,.06)',
              color: type === t.key ? '#fff' : 'rgba(226,240,232,.55)',
              boxShadow: type === t.key ? '0 4px 14px rgba(26,92,42,.35)' : 'none',
              transition:'all .15s',
            }}
          >{t.label}</button>
        ))}
      </div>

      {loading ? <Spinner label="Generating report…" /> : !report ? (
        <div className="card card-pad"><EmptyState icon="📊" title="No data available" /></div>
      ) : (
        <div>
          {type === 'summary' ? (
            <div className="card card-pad">
              <h3 style={{ color:'#fff', fontWeight:800, marginBottom:18, fontSize:15 }}>
                Summary — {report.academic_year || 'Active Year'}
              </h3>
              <div className="stat-grid">
                {Object.entries(report.counts || {}).map(([k, v]) => (
                  <div className="stat" key={k}>
                    <div className="stat-val">{v}</div>
                    <div className="stat-lbl" style={{ textTransform:'capitalize' }}>{k.replace(/_/g,' ')}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-head">
                <h3>{type === 'thesis' ? '📄 Thesis' : '🗂️ Project'} Report — {report.count} record(s)</h3>
                {report.items?.length > 0 && (
                  <button className="btn btn-ghost btn-sm" onClick={exportCsv}>⬇️ Export CSV</button>
                )}
              </div>
              <div className="card-body">
                {report.counts && (
                  <div className="flex gap mb" style={{ flexWrap:'wrap' }}>
                    {Object.entries(report.counts).map(([k, v]) => (
                      <span key={k} className="badge badge-slate" style={{ textTransform:'capitalize' }}>{k.replace(/_/g,' ')}: {v}</span>
                    ))}
                  </div>
                )}
                {!report.items?.length ? <EmptyState icon="📊" title="No records" /> : (
                  <div className="table-wrap">
                    <table className="data">
                      <thead>
                        <tr>
                          {type === 'thesis'
                            ? <><th>Title</th><th>Student</th><th>ID</th><th>Status</th><th>Year</th></>
                            : <><th>Title</th><th>Members</th><th>Advisor</th><th>Status</th><th>Year</th></>}
                        </tr>
                      </thead>
                      <tbody>
                        {report.items.map((r, i) => (
                          <tr key={i}>
                            <td style={{ fontWeight:700 }}>{r.title}</td>
                            {type === 'thesis' ? (
                              <><td>{r.student}</td><td style={{ fontFamily:'monospace', fontSize:12 }}>{r.id_number}</td><td>{r.status}</td></>
                            ) : (
                              <><td className="muted text-sm">{Array.isArray(r.members) ? r.members.join(', ') : r.members}</td><td>{r.advisor || '—'}</td><td>{r.status}</td></>
                            )}
                            <td className="muted text-sm">{r.academic_year}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
