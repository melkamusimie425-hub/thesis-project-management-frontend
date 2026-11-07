import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Spinner, StatusBadge, formatDate } from '../components/ui';

/* ── Role greeting labels ── */
const ROLE_GREET = {
  Administrator:'Administrator', DepartmentHead:'Department Head',
  UGPC:'UG Program Coordinator', GPC:'Graduate Program Coordinator',
  SGC:'School Graduate Committee', IPC:'Industrial Project Committee',
  Student:'Undergraduate Student', GradStudent:'Graduate Student',
  Advisor:'Advisor', Examiner:'Examiner',
};

/* ── Quick action configs per role ── */
const QUICK_ACTIONS = {
  Student:      [['👥','/form-group','Form Group'],['📝','/submit-project-title','Submit Title'],['⬆️','/upload-document','Upload Work'],['🗓️','/defense-schedule','My Schedule']],
  GradStudent:  [['📑','/submit-proposal','Submit Proposal'],['📄','/my-thesis','My Thesis'],['⬆️','/upload-document','Upload Work'],['🗓️','/defense-schedule','My Schedule']],
  UGPC:         [['✅','/review-titles','Review Titles'],['🧑‍🏫','/assign-project-advisor','Assign Advisor'],['📅','/schedule-defense','Schedule Defense'],['✉️','/send-announcement','Send Notice']],
  IPC:          [['✅','/review-titles','Review Titles'],['🗂️','/project-groups','Project Groups'],['✉️','/send-announcement','Announcement']],
  GPC:          [['📑','/proposals','Proposals'],['📅','/schedule-proposal-review','Schedule Review'],['📋','/record-proposal-result','Record Result'],['✉️','/send-announcement','Send Notice']],
  SGC:          [['🧑‍🏫','/assign-thesis-advisor','Assign Advisor'],['📑','/proposals','Proposals'],['📄','/theses','Theses'],['✉️','/send-announcement','Send Notice']],
  Advisor:      [['🗂️','/project-groups','My Groups'],['📄','/theses','My Theses'],['📋','/record-assessment','Record Assessment'],['📁','/documents','Documents']],
  Examiner:     [['🗓️','/defense-schedule','My Defenses'],['📋','/record-assessment','Record Assessment'],['📁','/documents','Documents']],
  DepartmentHead:[['📊','/reports','Generate Reports'],['📄','/theses','Theses'],['🗂️','/project-groups','Projects']],
  Administrator:[['⚙️','/manage-users','Manage Users'],['📊','/reports','Reports'],['📄','/theses','Theses'],['🗂️','/project-groups','Groups']],
};

export default function Dashboard() {
  const { user }     = useAuth();
  const navigate     = useNavigate();
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/dashboard')
      .then(({ data }) => setStats(data))
      .catch(() => setStats({ recent_notices: [] }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Loading dashboard…" />;

  const cards  = buildCards(stats, user);
  const actions = QUICK_ACTIONS[user.role] || [];

  return (
    <div>
      {/* ── Welcome header ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          {/* Avatar */}
          <div style={{
            width: 52, height: 52, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
            border: '2px solid rgba(200,168,0,.5)',
            boxShadow: '0 0 20px rgba(200,168,0,.2)',
            background: 'var(--green)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 18, color: '#fff',
          }}>
            {user?.avatar_url
              ? <img src={user.avatar_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}
                  onError={(e) => { e.target.style.display='none'; }} />
              : (user?.initials || 'U')}
          </div>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: -.3 }}>
              Welcome back, {user.first_name} 👋
            </h2>
            <p style={{ color: 'rgba(226,240,232,.5)', fontSize: 13, margin: '2px 0 0' }}>
              Signed in as <span style={{ color: '#c8a800', fontWeight: 700 }}>{ROLE_GREET[user.role] || user.role}</span>
              &nbsp;·&nbsp; {new Date().toLocaleDateString(undefined, { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* ── Stat cards ── */}
      {cards.length > 0 && (
        <div className="stat-grid" style={{ marginBottom: 22 }}>
          {cards.map((c) => (
            <div
              className="stat"
              key={c.label}
              onClick={c.link ? () => navigate(c.link) : undefined}
              style={{ cursor: c.link ? 'pointer' : 'default' }}
            >
              <div className={`stat-ic ${c.color}`}>{c.icon}</div>
              <div className="stat-val">{c.value}</div>
              <div className="stat-lbl">{c.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Two-column section ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Announcements */}
        <div className="card">
          <div className="card-head">
            <h3>📣 Recent Announcements</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/announcements')}>
              View all →
            </button>
          </div>
          <div className="card-body">
            {!stats?.recent_notices?.length ? (
              <p className="muted text-sm">No announcements yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {stats.recent_notices.map((n) => (
                  <div key={n.id} style={{
                    padding: '12px 14px', borderRadius: 12,
                    background: 'rgba(255,255,255,.04)',
                    border: '1px solid rgba(255,255,255,.06)',
                    transition: 'background .15s',
                  }}>
                    <div className="flex-between" style={{ marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, color: '#fff', fontSize: 13 }}>{n.subject}</span>
                      <span style={{ fontSize: 11, color: 'rgba(226,240,232,.4)' }}>{formatDate(n.created_at)}</span>
                    </div>
                    <p style={{ fontSize: 12, color: 'rgba(226,240,232,.55)', margin: 0, lineHeight: 1.5 }}>
                      {n.message.slice(0, 100)}{n.message.length > 100 ? '…' : ''}
                    </p>
                    <div style={{ marginTop: 6, fontSize: 11, color: 'rgba(200,168,0,.7)' }}>
                      From {n.sender?.first_name} {n.sender?.last_name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="card">
          <div className="card-head">
            <h3>⚡ Quick Actions</h3>
          </div>
          <div className="card-body">
            {actions.length === 0
              ? <p className="muted text-sm">No quick actions for your role.</p>
              : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {actions.map(([icon, to, label]) => (
                    <button
                      key={to}
                      onClick={() => navigate(to)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '13px 14px', borderRadius: 12,
                        background: 'rgba(255,255,255,.04)',
                        border: '1px solid rgba(255,255,255,.07)',
                        cursor: 'pointer', fontFamily: 'inherit',
                        transition: 'all .15s', textAlign: 'left',
                        color: 'rgba(226,240,232,.75)', fontSize: 13, fontWeight: 600,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(26,92,42,.25)';
                        e.currentTarget.style.borderColor = 'rgba(200,168,0,.3)';
                        e.currentTarget.style.color = '#fff';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,.04)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,.07)';
                        e.currentTarget.style.color = 'rgba(226,240,232,.75)';
                        e.currentTarget.style.transform = '';
                      }}
                    >
                      <span style={{ fontSize: 20 }}>{icon}</span>
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              )}
          </div>
        </div>
      </div>

      {/* ── Role-specific detail cards ── */}
      <RoleDetailCards stats={stats} user={user} navigate={navigate} />
    </div>
  );
}

/* ── Role-specific stat card builder ── */
function buildCards(stats, user) {
  if (!stats) return [];
  switch (user.role) {
    case 'Administrator':
      return [
        { icon:'👥', color:'ic-blue',   label:'Total Users',     value: stats.users ?? 0,          link:'/manage-users' },
        { icon:'🎓', color:'ic-green',  label:'Students',        value: stats.students ?? 0 },
        { icon:'🧑‍🏫', color:'ic-purple', label:'Instructors',     value: stats.instructors ?? 0 },
        { icon:'🗂️', color:'ic-gold',   label:'Project Groups',  value: stats.project_groups ?? 0, link:'/project-groups' },
        { icon:'📄', color:'ic-teal',   label:'Theses',          value: stats.theses ?? 0,         link:'/theses' },
        { icon:'📑', color:'ic-rose',   label:'Proposals',       value: stats.proposals ?? 0,      link:'/proposals' },
      ];
    case 'DepartmentHead':
      return [
        { icon:'🗂️', color:'ic-green',  label:'Project Groups',     value: stats.project_groups ?? 0 },
        { icon:'📄', color:'ic-blue',   label:'Theses',             value: stats.theses ?? 0 },
        { icon:'📑', color:'ic-gold',   label:'Proposals',          value: stats.proposals ?? 0 },
        { icon:'✅', color:'ic-teal',   label:'Completed Projects', value: stats.completed_projects ?? 0 },
        { icon:'🎓', color:'ic-purple', label:'Completed Theses',   value: stats.completed_theses ?? 0 },
      ];
    case 'UGPC': case 'IPC':
      return [
        { icon:'🗂️', color:'ic-green',  label:'Project Groups',  value: stats.project_groups ?? 0,    link:'/project-groups' },
        { icon:'⏳', color:'ic-gold',   label:'Need Advisor',    value: stats.pending_advisor ?? 0,   link:'/assign-project-advisor' },
        { icon:'📝', color:'ic-blue',   label:'Titles to Review',value: stats.titles_submitted ?? 0,  link:'/review-titles' },
        { icon:'📅', color:'ic-teal',   label:'Scheduled',       value: stats.scheduled ?? 0,         link:'/defense-schedule' },
      ];
    case 'GPC': case 'SGC':
      return [
        { icon:'📑', color:'ic-blue',   label:'Proposals',         value: stats.proposals ?? 0,       link:'/proposals' },
        { icon:'⏳', color:'ic-gold',   label:'Need Advisor',      value: stats.pending_advisor ?? 0, link:'/assign-thesis-advisor' },
        { icon:'📄', color:'ic-teal',   label:'Theses',            value: stats.theses ?? 0,          link:'/theses' },
        { icon:'📅', color:'ic-green',  label:'Scheduled Defenses',value: (stats.scheduled_proposals ?? 0) + (stats.scheduled_theses ?? 0) },
      ];
    case 'Advisor':
      return [
        { icon:'🗂️', color:'ic-green',  label:'Advising Groups',   value: stats.advising_groups ?? 0 },
        { icon:'📑', color:'ic-blue',   label:'Advising Proposals', value: stats.advising_proposals ?? 0 },
        { icon:'📄', color:'ic-gold',   label:'Advising Theses',    value: stats.advising_theses ?? 0 },
        { icon:'📅', color:'ic-teal',   label:'Upcoming Defenses',  value: stats.upcoming_defenses ?? 0 },
      ];
    case 'Examiner':
      return [
        { icon:'📅', color:'ic-blue',   label:'Assigned Defenses',  value: stats.assigned_defenses ?? 0 },
        { icon:'✅', color:'ic-green',  label:'Completed Defenses', value: stats.completed_defenses ?? 0 },
      ];
    case 'Student':
      return [
        { icon:'👥', color:'ic-green', label:'Group',    value: stats.has_group ? 'Formed' : 'Not formed' },
        { icon:'📝', color:'ic-gold',  label:'Title',    value: stats.group_title ? 'Approved' : 'Pending' },
        { icon:'🧑‍🏫', color:'ic-blue', label:'Advisor',  value: stats.advisor || 'Not assigned' },
        { icon:'📅', color:'ic-teal',  label:'Defense',  value: stats.defense_schedule ? formatDate(stats.defense_schedule.date) : 'Not scheduled' },
      ];
    case 'GradStudent':
      return [
        { icon:'📑', color:'ic-blue',   label:'Proposal', value: stats.proposal_status || '—' },
        { icon:'📄', color:'ic-green',  label:'Thesis',   value: stats.thesis_status || '—' },
        { icon:'🧑‍🏫', color:'ic-gold',  label:'Advisor',  value: stats.advisor || 'Not assigned' },
        { icon:'📅', color:'ic-teal',   label:'Defense',  value: stats.defense_schedule ? formatDate(stats.defense_schedule.date) : 'Not scheduled' },
      ];
    default: return [];
  }
}

/* ── Extra detail section for specific roles ── */
function RoleDetailCards({ stats, user, navigate }) {
  if (!stats) return null;

  if (user.role === 'Student') {
    return (
      <div style={{ marginTop: 16 }}>
        <div className="card card-pad">
          <h3 style={{ color: '#fff', fontWeight: 800, marginBottom: 14, fontSize: 14 }}>
            📋 My Project Status
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <InfoCell label="Group Status" value={stats.group_status || 'Pending'} />
            <InfoCell label="Approved Title" value={stats.group_title || 'Not yet approved'} />
            <InfoCell label="Advisor" value={stats.advisor || 'Not assigned'} />
          </div>
        </div>
      </div>
    );
  }

  if (user.role === 'GradStudent') {
    return (
      <div style={{ marginTop: 16 }}>
        <div className="card card-pad">
          <h3 style={{ color: '#fff', fontWeight: 800, marginBottom: 14, fontSize: 14 }}>
            📋 My Thesis Status
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <InfoCell label="Proposal" value={stats.proposal_status || '—'} />
            <InfoCell label="Thesis" value={stats.thesis_status || '—'} />
            <InfoCell label="Advisor" value={stats.advisor || 'Not assigned'} />
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function InfoCell({ label, value }) {
  return (
    <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.06)' }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'rgba(226,240,232,.4)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{value}</div>
    </div>
  );
}
