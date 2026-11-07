import { useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Spinner, StatusBadge, EmptyState, formatDate } from '../components/ui';

export default function ScheduleDefense() {
  const { user } = useAuth();
  const toast = useToast();
  const [groups, setGroups] = useState(null);
  const [instructors, setInstructors] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [form, setForm] = useState({ group_id: '', date: '', time: '', place: '', room: '', examiner_one_id: '', examiner_two_id: '', chair_id: '' });

  useEffect(() => {
    Promise.all([
      client.get('/project-groups'),
      client.get('/instructors'),
      client.get('/schedules', { params: { type: 'IndustrialProjectGroup' } }),
    ]).then(([{ data: g }, { data: i }, { data: s }]) => {
      setGroups(g.groups.data || []);
      setInstructors(i.instructors || []);
      setSchedules(s.schedules.data || s.schedules || []);
    }).catch(() => setGroups([]));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await client.post('/schedules', {
        work_type: 'IndustrialProjectGroup', work_id: Number(form.group_id),
        date: form.date, time: form.time, place: form.place, room: form.room,
        examiner_one_id: Number(form.examiner_one_id), examiner_two_id: Number(form.examiner_two_id),
        chair_id: form.chair_id ? Number(form.chair_id) : undefined,
      });
      toast.success('Defense scheduled successfully!');
      const { data } = await client.get('/schedules', { params: { type: 'IndustrialProjectGroup' } });
      setSchedules(data.schedules.data || data.schedules || []);
      setForm({ group_id: '', date: '', time: '', place: '', room: '', examiner_one_id: '', examiner_two_id: '', chair_id: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule defense.');
    }
  }

  if (!groups) return <Spinner label="Loading…" />;

  return (
    <div>
      <div className="page-head">
        <h2>Schedule Project Defense</h2>
        <p>Set the date, time, place and assign two examiners (BR-07).</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <div className="card card-pad">
          <h3 className="mb">New Schedule</h3>
          {groups.filter((g) => g.advisor_id).length === 0 ? (
            <EmptyState icon="📅" title="No groups ready" subtitle="Groups need an assigned advisor before scheduling." />
          ) : (
            <form onSubmit={handleSubmit} className="form-grid">
              <div className="field">
                <label>Project Group</label>
                <select className="select" value={form.group_id} onChange={(e) => setForm({ ...form, group_id: e.target.value })} required>
                  <option value="">— Select group —</option>
                  {groups.filter((g) => g.advisor_id).map((g) => <option key={g.id} value={g.id}>{g.name} — {g.approved_title || 'No title'}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="field"><label>Date</label><input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></div>
                <div className="field"><label>Time</label><input type="time" className="input" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required /></div>
              </div>
              <div className="form-row">
                <div className="field"><label>Place</label><input className="input" value={form.place} onChange={(e) => setForm({ ...form, place: e.target.value })} placeholder="Building / Hall" required /></div>
                <div className="field"><label>Room No.</label><input className="input" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} placeholder="Optional" /></div>
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
              <button className="btn btn-primary" type="submit">📅 Schedule Defense</button>
            </form>
          )}
        </div>

        <div className="card">
          <div className="card-head"><h3>Scheduled Defenses</h3></div>
          <div className="card-body">
            {schedules.length === 0 ? <EmptyState icon="🗓️" title="No defenses scheduled" /> : (
              <div className="form-grid">
                {schedules.map((s) => (
                  <div key={s.id} style={{ padding: 12, border: '1px solid var(--slate-200)', borderRadius: 10 }}>
                    <div className="flex-between">
                      <strong className="text-sm">{s.work?.name || `#${s.work_id}`}</strong>
                      <StatusBadge status={s.status} />
                    </div>
                    <p className="text-sm muted" style={{ marginTop: 6 }}>📅 {formatDate(s.date)} at {s.time}</p>
                    <p className="text-sm muted">📍 {s.place}{s.room ? ` — Room ${s.room}` : ''}</p>
                    <p className="text-sm muted">Examiners: {s.examiner_one?.first_name} {s.examiner_one?.last_name}, {s.examiner_two?.first_name} {s.examiner_two?.last_name}</p>
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
