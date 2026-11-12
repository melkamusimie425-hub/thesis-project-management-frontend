import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import GlobalCanvas from './GlobalCanvas';
import ThemeControls from './ThemeControls';
import { useTheme } from '../context/ThemeContext';

/** Maps routes to friendly page titles for the top bar. */
const TITLES = {
  '/dashboard':               { title: 'Dashboard',              subtitle: 'System overview and quick stats' },
  '/announcements':           { title: 'Announcements',           subtitle: 'Notices from your coordinators' },
  '/send-announcement':       { title: 'Send Announcement',       subtitle: 'Notify students, advisors or examiners' },
  '/form-group':              { title: 'Form Project Group',      subtitle: 'Create your industrial project team' },
  '/my-group':                { title: 'My Project Group',        subtitle: 'Your industrial project team details' },
  '/submit-project-title':    { title: 'Submit Project Title',    subtitle: 'Propose up to three alternative titles' },
  '/project-groups':          { title: 'Project Groups',          subtitle: 'All industrial project groups' },
  '/review-titles':           { title: 'Review & Approve Titles', subtitle: 'Approve or reject submitted titles' },
  '/assign-project-advisor':  { title: 'Assign Project Advisor',  subtitle: 'Match groups with advisors' },
  '/schedule-defense':        { title: 'Schedule Defense',        subtitle: 'Set time, place and examiners' },
  '/record-assessment':       { title: 'Record Assessment',       subtitle: 'Enter evaluation scores' },
  '/defense-schedule':        { title: 'Defense Schedule',        subtitle: 'Upcoming examinations' },
  '/submit-proposal':         { title: 'Submit Proposal',         subtitle: 'Submit your thesis proposal' },
  '/my-thesis':               { title: 'My Thesis',               subtitle: 'Your thesis work progress' },
  '/proposals':               { title: 'Proposals',               subtitle: 'All submitted thesis proposals' },
  '/theses':                  { title: 'Theses',                  subtitle: 'All thesis works' },
  '/assign-thesis-advisor':   { title: 'Assign Thesis Advisor',   subtitle: 'Match students with advisors' },
  '/schedule-proposal-review':{ title: 'Schedule Proposal Review',subtitle: 'Set proposal defense time and examiners' },
  '/record-proposal-result':  { title: 'Record Proposal Result',  subtitle: 'Record proposal review outcome' },
  '/upload-document':         { title: 'Upload Document',         subtitle: 'Submit your work to the system' },
  '/documents':               { title: 'Documents',               subtitle: 'Submitted project and thesis files' },
  '/reports':                 { title: 'Reports',                 subtitle: 'Timely reports on theses and projects' },
  '/manage-users':            { title: 'Manage Users',            subtitle: 'Create, update and remove user accounts' },
  '/student-works':           { title: 'Student Works',           subtitle: 'Public repository of completed works' },
  '/profile':                 { title: 'My Profile',              subtitle: 'Your account information' },
};

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location  = useLocation();
  const { accentHue, dark } = useTheme();
  const meta = TITLES[location.pathname] || { title: 'OTPMS', subtitle: '' };

  /* Apply theme CSS variables to :root dynamically */
  const cssVars = {
    '--accent-hue': accentHue,
    '--accent':     `hsl(${accentHue},72%,48%)`,
    '--accent-glow':`hsla(${accentHue},72%,48%,.25)`,
    '--accent-lt':  `hsl(${accentHue},72%,62%)`,
    '--accent-dk':  `hsl(${accentHue},65%,36%)`,
    background: dark
      ? `linear-gradient(135deg,#020c06 0%,#041a0b 40%,#071f0e 70%,#020c06 100%)`
      : `linear-gradient(135deg,#e8f4ec 0%,#f0f9f2 50%,#e2f0e8 100%)`,
    color: dark ? '#e2f0e8' : '#0d2e15',
    minHeight: '100vh',
    transition: 'background .5s, color .4s',
  };

  return (
    <div style={{ ...cssVars, position: 'relative', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* ── Animated canvas behind everything ── */}
      <GlobalCanvas />

      {/* ── App shell above canvas ── */}
      <div className="app-shell" style={{ position: 'relative', zIndex: 1 }}>
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
        <div className="main">
          <Topbar
            title={meta.title}
            subtitle={meta.subtitle}
            onMenu={() => setMenuOpen((v) => !v)}
          />
          <main className="content">
            <Outlet />
          </main>
        </div>
      </div>

      {/* ── Floating theme controls (bottom-right) ── */}
      <ThemeControls />

      {/* Sidebar backdrop */}
      {menuOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMenuOpen(false)}
          style={{ zIndex: 35 }}
        />
      )}
    </div>
  );
}
