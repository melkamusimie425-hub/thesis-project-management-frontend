import { useEffect, useState } from 'react';
import client from '../api/client';
import { Spinner, EmptyState } from '../components/ui';

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export default function StudentWorks() {
  const [docs, setDocs] = useState(null);

  useEffect(() => {
    client.get('/documents', { params: { repository: true } }).then(({ data }) => setDocs(data.documents.data || [])).catch(() => setDocs([]));
  }, []);

  return (
    <div>
      <div className="page-head">
        <h2>Student Works Repository</h2>
        <p>A public archive of completed theses and projects (SUC-20).</p>
      </div>
      {!docs ? <Spinner label="Loading repository…" /> : docs.length === 0 ? (
        <div className="card card-pad"><EmptyState icon="🎓" title="No published works yet" subtitle="Completed works will be published here for literature review." /></div>
      ) : (
        <div className="stat-grid">
          {docs.map((d) => (
            <div className="card card-pad" key={d.id}>
              <div className="flex gap" style={{ alignItems: 'flex-start' }}>
                <div className="stat-ic ic-indigo" style={{ width: 40, height: 40, fontSize: 18, marginBottom: 0 }}>📄</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 className="text-sm fw-600" style={{ wordBreak: 'break-word' }}>{d.original_name}</h3>
                  <p className="text-sm muted" style={{ marginTop: 4 }}>{d.work_type}</p>
                  <p className="text-sm muted">{d.uploader?.first_name} {d.uploader?.last_name}</p>
                </div>
              </div>
              {d.description && <p className="text-sm muted" style={{ marginTop: 10 }}>{d.description}</p>}
              <a className="btn btn-ghost btn-sm" style={{ marginTop: 12, display: 'inline-flex' }} href={`${API}/documents/${d.id}/download`} target="_blank" rel="noreferrer">
                ⬇️ Download
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
