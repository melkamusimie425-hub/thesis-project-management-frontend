import { useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Spinner, EmptyState } from '../components/ui';

export default function UploadDocument() {
  const { user } = useAuth();
  const toast = useToast();
  const [groups, setGroups] = useState([]);
  const [theses, setTheses] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [form, setForm] = useState({ work_type: '', work_id: '', category: 'draft', description: '', is_published: false });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const reqs = [];
    if (user.role === 'Student' || ['UGPC', 'IPC', 'Administrator', 'Advisor', 'Examiner'].includes(user.role)) reqs.push(client.get('/project-groups'));
    if (user.role === 'GradStudent' || ['GPC', 'SGC', 'Administrator', 'Advisor'].includes(user.role)) {
      reqs.push(client.get('/theses'));
      reqs.push(client.get('/proposals'));
    }
    if (reqs.length === 0) reqs.push(client.get('/project-groups'));
    Promise.all(reqs).then((results) => {
      results.forEach((r) => {
        if (r.data.groups) setGroups(r.data.groups.data || []);
        if (r.data.theses) setTheses(r.data.theses.data || []);
        if (r.data.proposals) setProposals(r.data.proposals.data || []);
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user.role]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) { toast.error('Choose a file to upload.'); return; }
    if (!form.work_id) { toast.error('Select a work to attach the document to.'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('work_type', form.work_type);
      fd.append('work_id', form.work_id);
      fd.append('category', form.category);
      fd.append('description', form.description);
      fd.append('is_published', form.is_published ? 1 : 0);
      await client.post('/documents', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Document uploaded successfully!');
      setFile(null); setForm({ work_type: '', work_id: '', category: 'draft', description: '', is_published: false });
      if (document.getElementById('file-input')) document.getElementById('file-input').value = '';
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Spinner label="Loading…" />;

  return (
    <div>
      <div className="page-head">
        <h2>Upload Document</h2>
        <p>Submit your project, proposal or thesis work to the system (SUC-10).</p>
      </div>
      <div className="card card-pad" style={{ maxWidth: 640 }}>
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="field">
            <label>Work Type</label>
            <select className="select" value={form.work_type} onChange={(e) => setForm({ ...form, work_type: e.target.value, work_id: '' })} required>
              <option value="">— Select —</option>
              {groups.length > 0 && <option value="IndustrialProjectGroup">Industrial Project</option>}
              {proposals.length > 0 && <option value="Proposal">Proposal</option>}
              {theses.length > 0 && <option value="Thesis">Thesis</option>}
            </select>
          </div>
          <div className="field">
            <label>Select Work</label>
            <select className="select" value={form.work_id} onChange={(e) => setForm({ ...form, work_id: e.target.value })} required disabled={!form.work_type}>
              <option value="">— Select —</option>
              {form.work_type === 'IndustrialProjectGroup' && groups.map((g) => <option key={g.id} value={g.id}>{g.name} — {g.approved_title || 'No title'}</option>)}
              {form.work_type === 'Proposal' && proposals.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              {form.work_type === 'Thesis' && theses.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </div>
          <div className="form-row">
            <div className="field">
              <label>Category</label>
              <select className="select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="draft">Draft</option>
                <option value="final">Final</option>
                <option value="evaluation">Evaluation</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="field">
              <label>File</label>
              <input id="file-input" className="input" type="file" onChange={(e) => setFile(e.target.files[0])} required />
            </div>
          </div>
          <div className="field">
            <label>Description (optional)</label>
            <input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What is this document?" />
          </div>
          <label className="flex gap" style={{ alignItems: 'center' }}>
            <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} />
            <span className="text-sm">Publish to public repository (visible to guests)</span>
          </label>
          <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Uploading…' : '⬆️ Upload Document'}</button>
        </form>
      </div>
    </div>
  );
}
