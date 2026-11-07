import { useEffect, useState } from 'react';
import client from '../api/client';
import { useToast } from '../components/Toast';
import { Spinner, StatusBadge, EmptyState, formatDate } from '../components/ui';

export default function ScheduleProposalReview() {
  const toast = useToast();
  const [proposals, setProposals] = useState(null);
  const [instructors, setInstructors] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [form, setForm] = useState({ proposal_id: '', date: '', time: '', place: '', room: '', examiner_one_id: '', examiner_two_id: '' });

  useEffect(() => {
    Promise.all([
      client.get('/proposals'),
      client.get('/instructors'),
      client.get('/schedules', { params: { type: 'Proposal' } }),
    ]).then(([{ data: p }, { data: i }, { data: s }]) => {
      setProposals(p.proposals.data || []);
      setInstructors(i.instructors || []);
      setSchedules(s.schedules.data || s.schedules || []);
    }).catch(() => setProposals([]));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await client.post('/schedules', {
        work_type: 'Proposal', work_id: Number(form.proposal_id),
        date: form.date, time: form.time, place: form.place, room: form.room,
        examiner_one_id: Number(form.examiner_one_id), examiner_two_id: Number(form.examiner_two_id),
      });
      toast.success('Proposal review scheduled!');
      const { data } = await client.get('/schedules', { params: { type: 'Proposal' } });
      setSchedules(data.schedules.data || data.schedules || []);
      setForm({ proposal_id: '', date: '', time: '', place: '', room: '', examiner_one_id: '', examiner_two_id: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule review.');
    }
  }

  if (!proposals) return <Spinner label="Loading proposals…" />;

  return (
    <div>
      <div className="page-head">
        <h2>Schedule Proposal Review</h2>
        <p>Schedule the proposal defense with two examiners (BR-10 / EUC-16).</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <div className="card card-pad">
          <h3 className="mb">New Review Schedule</h3>
          {proposals.length === 0 ? <EmptyState icon="📑" title="No proposals to schedule" /> : (
            <form onSubmit={handleSubmit} className="form-grid">
              <div className="field">
                <label>Proposal</label>
                <select className="select" value={form.proposal_id} onChange={(e) => setForm({ ...form, proposal_id: e.target.value })} required>
                  <option value="">— Select proposal —</option>
                  {proposals.map((p) => <option key={p.id} value={p.id}>{p.student?.full_name} — {p.title}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="field"><label>Date</label><input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></div>
                <div className="field"><label>Time</label><input type="time" className="input" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required /></div>
              </div>
              <div className="form-row">
                <div className="field"><label>Place</label><input className="input" value={form.place} onChange={(e) => setForm({ ...form, place: e.target.value })} required /></div>
                <div className="field"><label>Room</label><input className="input" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} /></div>
              </div>
              <div className="field">
                <label>Examiner One</label>
                <select className="select" value={form.examiner_one_id} onChange={(e) => setForm({ ...form, examiner_one_id: e.target.value })} required>
                  <option value="">— Select —</option>
                  {instructors.map((i) => <option key={i.id} value={i.id}>{i.salutation} {i.first_name} {i.last_name}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Examiner Two</label>
                <select className="select" value={form.examiner_two_id} onChange={(e) => setForm({ ...form, examiner_two_id: e.target.value })} required>
                  <option value="">— Select —</option>
                  {instructors.map((i) => <option key={i.id} value={i.id}>{i.salutation} {i.first_name} {i.last_name}</option>)}
                </select>
              </div>
              <button className="btn btn-primary" type="submit">📅 Schedule Review</button>
            </form>
          )}
        </div>
        <div className="card">
          <div className="card-head"><h3>Scheduled Reviews</h3></div>
          <div className="card-body">
            {schedules.length === 0 ? <EmptyState icon="🗓️" title="No reviews scheduled" /> : (
              <div className="form-grid">
                {schedules.map((s) => (
                  <div key={s.id} style={{ padding: 12, border: '1px solid var(--slate-200)', borderRadius: 10 }}>
                    <div className="flex-between"><strong className="text-sm">{s.work?.title || `#${s.work_id}`}</strong><StatusBadge status={s.status} /></div>
                    <p className="text-sm muted" style={{ marginTop: 6 }}>📅 {formatDate(s.date)} at {s.time}</p>
                    <p className="text-sm muted">📍 {s.place}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
