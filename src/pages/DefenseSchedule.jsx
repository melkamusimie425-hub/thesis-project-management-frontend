import { useEffect, useState } from 'react';
import client from '../api/client';
import { Spinner, StatusBadge, EmptyState, formatDate } from '../components/ui';

export default function DefenseSchedule() {
  const [schedules, setSchedules] = useState(null);
  const [filter,    setFilter]    = useState('');

  useEffect(() => {
    client.get('/schedules')
      .then(({ data }) => setSchedules(data.schedules.data || data.schedules || []))
      .catch(() => setSchedules([]));
  }, []);

  if (!schedules) return <Spinner label="Loading schedules…" />;

  const filtered = filter ? schedules.filter((s) => s.work_type === filter) : schedules;

  const TYPE_LABELS = {
    IndustrialProjectGroup: 'Industrial Project',
    Proposal:               'Proposal Review',
    Thesis:                 'Thesis Defense',
  };

  return (
    <div>
      <div className="page-head">
        <h2>🗓️ Defense Schedule</h2>
        <p>Upcoming and past project, proposal and thesis defenses.</p>
      </div>

      <div className="flex gap mb">
        {[['', 'All Types'], ['IndustrialProjectGroup', '🗂️ Project'], ['Proposal', '📑 Proposal'], ['Thesis', '📄 Thesis']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            style={{ padding:'7px 16px', borderRadius:9, border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:12.5, fontWeight:700, transition:'all .15s', background: filter === val ? 'linear-gradient(135deg,#1a5c2a,#2d7a40)' : 'rgba(255,255,255,.06)', color: filter === val ? '#fff' : 'rgba(226,240,232,.55)' }}
          >{label}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card card-pad"><EmptyState icon="🗓️" title="No defenses scheduled" subtitle="Schedules appear here once coordinators set them." /></div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {filtered.map((s) => (
            <div key={s.id} className="card card-pad" style={{ position:'relative', overflow:'hidden' }}>
              {/* Left accent bar */}
              <div style={{ position:'absolute', left:0, top:0, bottom:0, width:4, background:'linear-gradient(180deg,#c8a800,#1a5c2a)', borderRadius:'0 0 0 0' }} />
              <div style={{ paddingLeft:16 }}>
                <div className="flex-between" style={{ marginBottom:10 }}>
                  <div>
                    <span style={{ fontWeight:800, color:'#fff', fontSize:14 }}>
                      {TYPE_LABELS[s.work_type] || s.work_type}
                    </span>
                    <span style={{ marginLeft:10 }}>
                      <StatusBadge status={s.status} />
                    </span>
                  </div>
                  <div style={{ fontSize:13, color:'rgba(200,168,0,.8)', fontWeight:700 }}>
                    📅 {formatDate(s.date)} at {s.time}
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
                  <InfoItem label="📍 Place" value={`${s.place}${s.room ? ` — Room ${s.room}` : ''}`} />
                  <InfoItem label="👤 Examiner 1" value={s.examiner_one ? `${s.examiner_one.first_name} ${s.examiner_one.last_name}` : '—'} />
                  <InfoItem label="👤 Examiner 2" value={s.examiner_two ? `${s.examiner_two.first_name} ${s.examiner_two.last_name}` : '—'} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <div style={{ fontSize:10.5, fontWeight:700, textTransform:'uppercase', letterSpacing:'.07em', color:'rgba(226,240,232,.35)', marginBottom:3 }}>{label}</div>
      <div style={{ fontSize:13, color:'rgba(226,240,232,.8)', fontWeight:600 }}>{value}</div>
    </div>
  );
}
