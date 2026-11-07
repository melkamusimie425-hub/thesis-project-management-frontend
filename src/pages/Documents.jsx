import { useEffect, useState } from 'react';
import client from '../api/client';
import { useToast } from '../components/Toast';
import { Spinner, EmptyState, formatDate } from '../components/ui';

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export default function Documents() {
  const toast = useToast();
  const [docs, setDocs] = useState(null);

  useEffect(() => {
    client.get('/documents').then(({ data }) => setDocs(data.documents.data || [])).catch(() => setDocs([]));
  }, []);

  function download(id) {
    const token = localStorage.getItem('otpms_token');
    window.open(`${API}/documents/${id}/download`, '_blank');
  }

  async function remove(id) {
    if (!confirm('Delete this document? This cannot be undone.')) return;
    try {
      await client.delete(`/documents/${id}`);
      toast.success('Document deleted.');
      setDocs((d) => d.filter((x) => x.id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete.');
    }
  }

  if (!docs) return <Spinner label="Loading documents…" />;

  return (
    <div>
      <div className="page-head"><h2>Documents</h2><p>Project and thesis files submitted to the system.</p></div>
      <div className="card">
        {docs.length === 0 ? (
          <div className="card-pad"><EmptyState icon="📁" title="No documents yet" subtitle="Uploaded files appear here." /></div>
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead><tr><th>File Name</th><th>Work</th><th>Category</th><th>Uploaded By</th><th>Date</th><th>Published</th><th>Action</th></tr></thead>
              <tbody>
                {docs.map((d) => (
                  <tr key={d.id}>
                    <td className="fw-600 text-sm">📄 {d.original_name}</td>
                    <td className="text-sm muted">{d.work_type}</td>
                    <td><span className="badge badge-slate">{d.category}</span></td>
                    <td className="text-sm">{d.uploader?.first_name} {d.uploader?.last_name}</td>
                    <td className="text-sm">{formatDate(d.created_at)}</td>
                    <td>{d.is_published ? <span className="badge badge-emerald">Yes</span> : <span className="badge badge-slate">No</span>}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => download(d.id)}>⬇️</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => remove(d.id)} style={{ marginLeft: 4 }}>🗑️</button>
                    </td>
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
