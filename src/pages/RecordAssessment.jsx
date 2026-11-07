import { useEffect, useState } from 'react';
import client from '../api/client';
import { useToast } from '../components/Toast';
import { Spinner, EmptyState } from '../components/ui';

export default function RecordAssessment() {
  const toast = useToast();
  const [groups, setGroups] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ work_id: '', student_id: '', work_type: 'IndustrialProjectGroup', scores: {}, comment: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      client.get('/project-groups'),
      client.get('/assessment-criteria', { params: { applies_to: 'ip_two' } }),
      client.get('/students?program=Undergraduate'),
    ]).then(([{ data: g }, { data: c }, { data: s }]) => {
      setGroups(g.groups.data || []);
      setCriteria(c.criteria || []);
      setStudents(s.students || []);
    }).catch(() => {})
    .finally(() => setLoading(false));
  }, []);

  function setScore(criteriaId, value) {
    setForm((prev) => ({ ...prev, scores: { ...prev.scores, [criteriaId]: value } }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const scoreArr = Object.entries(form.scores).map(([criteria_id, score]) => ({ criteria_id: Number(criteria_id), score: Number(score) }));
    if (scoreArr.length === 0) { toast.error('Enter at least one score.'); return; }
    if (!form.student_id) { toast.error('Select a student.'); return; }
    setSaving(true);
    try {
      await client.post('/assessment-results', {
        student_id: Number(form.student_id), work_type: form.work_type,
        scores: scoreArr, comment: form.comment || undefined,
      });
      toast.success('Assessment results recorded successfully!');
      setForm({ work_id: '', student_id: '', work_type: 'IndustrialProjectGroup', scores: {}, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record assessment.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Spinner label="Loading assessment data…" />;

  const groupStudents = students.filter((s) => {
    const g = groups.find((x) => x.id === Number(form.work_id));
    return g?.members?.some((m) => m.id === s.id);
  });

  return (
    <div>
      <div className="page-head">
        <h2>Record Assessment</h2>
        <p>Enter evaluation scores for a student's project defense (SUC-06).</p>
      </div>
      <div className="card card-pad">
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-row">
            <div className="field">
              <label>Project Group</label>
              <select className="select" value={form.work_id} onChange={(e) => setForm({ ...form, work_id: e.target.value, student_id: '' })} required>
                <option value="">— Select group —</option>
                {groups.map((g) => <option key={g.id} value={g.id}>{g.name} — {g.approved_title || 'No title'}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Student</label>
              <select className="select" value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })} required disabled={!form.work_id}>
                <option value="">— Select student —</option>
                {(groupStudents.length ? groupStudents : students).map((s) => <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.id_number})</option>)}
              </select>
            </div>
          </div>

          <div>
            <p className="fw-600 mb">Assessment Criteria</p>
            {criteria.length === 0 ? <EmptyState icon="📋" title="No criteria configured" /> : (
              <div className="table-wrap">
                <table className="data">
                  <thead><tr><th>Criteria</th><th>Category</th><th>Weight</th><th>Score (0-100)</th></tr></thead>
                  <tbody>
                    {criteria.map((c) => (
                      <tr key={c.id}>
                        <td className="fw-600 text-sm">{c.name}</td>
                        <td className="text-sm muted">{c.category}</td>
                        <td className="text-sm">{c.weight}%</td>
                        <td><input type="number" min="0" max="100" className="input" style={{ maxWidth: 110 }} value={form.scores[c.id] || ''} onChange={(e) => setScore(c.id, e.target.value)} placeholder="0" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="field">
            <label>Comment (optional)</label>
            <textarea className="textarea" value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} placeholder="General comment about the defense…" />
          </div>
          <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : '📋 Record Results'}</button>
        </form>
      </div>
    </div>
  );
}
