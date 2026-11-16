import { useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Spinner, EmptyState, StatusBadge } from '../components/ui';

const WORK_TYPES = [
  { value: 'IndustrialProjectGroup', label: 'Industrial Project' },
  { value: 'Proposal',               label: 'Thesis Proposal'   },
  { value: 'Thesis',                 label: 'Thesis Defense'     },
];

function letterBadgeClass(letter) {
  if (!letter) return 'badge-slate';
  if (['A+','A','A-'].includes(letter)) return 'badge-green';
  if (['B+','B','B-'].includes(letter)) return 'badge-blue';
  if (['C+','C'].includes(letter))      return 'badge-gold';
  if (letter === 'D')                   return 'badge-purple';
  return 'badge-rose';
}

export default function FinalGrades() {
  const { user }  = useAuth();
  const toast     = useToast();
  const [grades,   setGrades]   = useState(null);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({
    student_id: '', work_type: 'IndustrialProjectGroup', work_id: '',
  });
  const [compiling, setCompiling] = useState(false);
  const [search,    setSearch]    = useState('');

  const canCompile = ['UGPC', 'GPC', 'Administrator'].includes(user?.role);

  useEffect(() => {
    loadGrades();
    client.get('/students').then(({ data }) => setStudents(data.students || [])).catch(() => {});
  }, []);

  function loadGrades() {
    client.get('/final-grades').then(({ data }) => setGrades(data.grades?.data || data.grades || [])).catch(() => setGrades([]));
  }

  async function compile(e) {
    e.preventDefault();
    if (!form.student_id) { toast.error('Select a student.'); return; }
    setCompiling(true);
    try {
      const payload = {
        student_id: Number(form.student_id),
        work_type:  form.work_type,
        work_id:    form.work_id ? Number(form.work_id) : undefined,
      };
      const { data } = await client.post('/final-grades/compile', payload);
      toast.success(data.message || 'Grade compiled!');
      loadGrades();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to compile grade.');
    } finally {
      setCompiling(false);
    }
  }

  const filtered = (grades || []).filter((g) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      g.student?.full_name?.toLowerCase().includes(q) ||
      g.student?.id_number?.toLowerCase().includes(q) ||
      g.work_type?.toLowerCase().includes(q) ||
      g.letter_grade?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="page-head">
        <h2>Final Grades</h2>
        <p>Compile and view final grades from assessment results (BR-06 / BR-15).</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 18, marginBottom: 22 }}>
        {/* Compile form */}
        {canCompile && (
          <div className="card card-pad">
            <h3 style={{ fontWeight: 800, color: '#fff', fontSize: 14, marginBottom: 16 }}>Compile Grade</h3>
            <form onSubmit={compile} className="form-grid">
              <div className="field">
                <label>Work Type</label>
                <select className="select" value={form.work_type} onChange={(e) => setForm({ ...form, work_type: e.target.value })}>
                  {WORK_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Student</label>
                <select className="select" value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })} required>
                  <option value="">— Select student —</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.id_number})</option>
                  ))}
                </select>
              </div>
              <div className="alert alert-info">
                <span>ℹ️</span>
                <div>Grade is compiled by averaging the advisor score and two examiner scores from recorded assessment results.</div>
              </div>
              <button className="btn btn-primary" type="submit" disabled={compiling}>
                {compiling ? 'Compiling…' : '📊 Compile Final Grade'}
              </button>
            </form>
          </div>
        )}

        {/* Quick stats */}
        <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h3 style={{ fontWeight: 800, color: '#fff', fontSize: 14, marginBottom: 4 }}>Grade Summary</h3>
          {!grades ? <Spinner /> : (
            <>
              <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                <StatTile label="Total Graded" value={grades.length} color="ic-blue" />
                <StatTile label="Passed" value={grades.filter((g) => g.remark === 'Pass').length} color="ic-green" />
                <StatTile label="Failed" value={grades.filter((g) => g.remark === 'Fail').length} color="ic-rose" />
              </div>
              <div className="flex gap" style={{ flexWrap: 'wrap', marginTop: 4 }}>
                {['A+','A','A-','B+','B','B-','C+','C','D','F'].map((l) => {
                  const count = grades.filter((g) => g.letter_grade === l).length;
                  if (!count) return null;
                  return (
                    <span key={l} className={`badge ${letterBadgeClass(l)}`}>
                      <span className="dot" />{l}: {count}
                    </span>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Grades table */}
      <div className="card">
        <div className="card-head">
          <h3>All Final Grades</h3>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              className="input"
              style={{ width: 220, padding: '7px 12px', fontSize: 13 }}
              placeholder="🔍 Search by name, ID or grade…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn btn-ghost btn-sm" onClick={() => exportCsv(filtered)}>⬇️ CSV</button>
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {!grades ? <Spinner label="Loading grades…" /> :
           filtered.length === 0 ? <div className="card-pad"><EmptyState icon="🎓" title="No grades yet" subtitle="Compile a grade to see it here." /></div> : (
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>ID Number</th>
                    <th>Work Type</th>
                    <th>Advisor</th>
                    <th>Examiner 1</th>
                    <th>Examiner 2</th>
                    <th>Final Score</th>
                    <th>Grade</th>
                    <th>Remark</th>
                    <th>Year</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((g, i) => (
                    <tr key={g.id ?? i}>
                      <td className="fw-600">{g.student?.full_name || '—'}</td>
                      <td className="text-sm" style={{ fontFamily: 'monospace' }}>{g.student?.id_number || '—'}</td>
                      <td className="text-sm"><span className="badge badge-slate">{WORK_TYPES.find((t) => t.value === g.work_type)?.label || g.work_type}</span></td>
                      <td className="text-sm">{g.advisor_score ?? '—'}</td>
                      <td className="text-sm">{g.examiner_one_score ?? '—'}</td>
                      <td className="text-sm">{g.examiner_two_score ?? '—'}</td>
                      <td style={{ fontWeight: 800, color: '#fff', fontSize: 15 }}>{g.final_score ?? '—'}</td>
                      <td><span className={`badge ${letterBadgeClass(g.letter_grade)}`}><span className="dot" />{g.letter_grade || '—'}</span></td>
                      <td><span className={`badge ${g.remark === 'Pass' ? 'badge-green' : g.remark === 'Fail' ? 'badge-rose' : 'badge-slate'}`}><span className="dot" />{g.remark || '—'}</span></td>
                      <td className="text-sm muted">{g.academic_year?.year || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatTile({ label, value, color }) {
  return (
    <div className="stat">
      <div className={`stat-ic ${color}`} />
      <div className="stat-val">{value}</div>
      <div className="stat-lbl">{label}</div>
    </div>
  );
}

function exportCsv(rows) {
  if (!rows.length) return;
  const headers = ['Student','ID Number','Work Type','Advisor Score','Examiner 1','Examiner 2','Final Score','Letter Grade','Remark','Academic Year'];
  const lines = rows.map((g) => [
    g.student?.full_name, g.student?.id_number, g.work_type,
    g.advisor_score, g.examiner_one_score, g.examiner_two_score,
    g.final_score, g.letter_grade, g.remark, g.academic_year?.year,
  ].map((v) => `"${String(v ?? '').replace(/"/g,'""')}"`).join(','));
  const blob = new Blob([[headers.join(','), ...lines].join('\n')], { type: 'text/csv' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'final_grades.csv'; a.click();
}
