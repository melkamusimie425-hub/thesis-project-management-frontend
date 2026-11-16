import { useEffect, useState } from 'react';
import client from '../api/client';
import { Spinner, EmptyState } from '../components/ui';

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const TYPE_LABELS = {
  IndustrialProjectGroup: '🗂️ Industrial Project',
  Proposal:               '📑 Thesis Proposal',
  Thesis:                 '📄 Thesis',
};

export default function StudentWorks() {
  const [docs,   setDocs]   = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    client.get('/documents', { params: { repository: true } })
      .then(({ data }) => setDocs(data.documents.data || []))
      .catch(() => setDocs([]));
  }, []);

  const filtered = (docs || []).filter((d) => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      d.original_name?.toLowerCase().includes(q) ||
      d.description?.toLowerCase().includes(q) ||
      d.uploader?.first_name?.toLowerCase().includes(q) ||
      d.uploader?.last_name?.toLowerCase().includes(q);
    const matchType = !filter || d.work_type === filter;
    return matchSearch && matchType;
  });

  return (
    <div>
      <div className="page-head">
        <h2>Student Works Repository</h2>
        <p>A public archive of completed and published theses and projects (SUC-20).</p>
      </div>

      {/* Search + filter toolbar */}
      <div className="flex-between" style={{ marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[['', 'All Types'], ['IndustrialProjectGroup', '🗂️ Project'], ['Thesis', '📄 Thesis'], ['Proposal', '📑 Proposal']].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)} style={{
              padding: '8px 16px', borderRadius: 9, border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, transition: 'all .15s',
              background: filter === val ? 'linear-gradient(135deg,#1a5c2a,#2d7a40)' : 'rgba(255,255,255,.06)',
              color: filter === val ? '#fff' : 'rgba(226,240,232,.55)',
            }}>{label}</button>
          ))}
        </div>
        <input
          className="input"
          style={{ width: 260, padding: '8px 14px', fontSize: 13 }}
          placeholder="🔍 Search by title, author…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {!docs ? <Spinner label="Loading repository…" /> :
       filtered.length === 0 ? (
        <div className="card card-pad">
          <EmptyState icon="🎓" title="No published works found"
            subtitle={search || filter ? 'Try adjusting your search or filter.' : 'Completed works will be published here for literature review.'} />
        </div>
      ) : (
        <>
          <p className="muted text-sm" style={{ marginBottom: 14 }}>{filtered.length} work{filtered.length !== 1 ? 's' : ''} found</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
            {filtered.map((d) => (
              <div className="card card-pad" key={d.id} style={{ display: 'flex', flexDirection: 'column', gap: 10, transition: 'all .2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(200,168,0,.25)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.transform = ''; }}
              >
                {/* Type badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="badge badge-slate" style={{ fontSize: 11 }}>
                    {TYPE_LABELS[d.work_type] || d.work_type}
                  </span>
                  <span className="badge badge-green" style={{ fontSize: 10 }}>
                    <span className="dot" />Published
                  </span>
                </div>

                {/* Title */}
                <h3 style={{ fontSize: 13.5, fontWeight: 800, color: '#fff', lineHeight: 1.4, wordBreak: 'break-word' }}>
                  📄 {d.original_name}
                </h3>

                {/* Author */}
                <p className="text-sm muted" style={{ marginBottom: 0 }}>
                  By {d.uploader?.first_name} {d.uploader?.last_name}
                </p>

                {/* Description */}
                {d.description && (
                  <p className="text-sm muted" style={{ lineHeight: 1.55, flex: 1 }}>
                    {d.description.length > 120 ? d.description.slice(0, 120) + '…' : d.description}
                  </p>
                )}

                {/* Download */}
                <a
                  className="btn btn-ghost btn-sm"
                  style={{ marginTop: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  href={`${API}/documents/${d.id}/download`}
                  target="_blank"
                  rel="noreferrer"
                >
                  ⬇️ Download
                </a>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
