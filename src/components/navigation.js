/**
 * Role-aware navigation configuration.
 *
 * Each item maps to a route path plus the roles allowed to see it.
 * Sections group related links in the sidebar.
 */
export const NAV = [
  {
    section: 'Main',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: '🏠', roles: ['*'] },
    ],
  },
  {
    section: 'Announcements',
    items: [
      { to: '/announcements', label: 'Announcements', icon: '📣', roles: ['*'] },
      { to: '/send-announcement', label: 'Send Announcement', icon: '✉️', roles: ['UGPC', 'GPC', 'SGC', 'IPC', 'Administrator', 'DepartmentHead'] },
    ],
  },
  {
    section: 'Industrial Project',
    items: [
      { to: '/form-group', label: 'Form Project Group', icon: '👥', roles: ['Student'] },
      { to: '/my-group', label: 'My Project Group', icon: '🗂️', roles: ['Student'] },
      { to: '/submit-project-title', label: 'Submit Project Title', icon: '📝', roles: ['Student'] },
      { to: '/project-groups', label: 'Project Groups', icon: '🗂️', roles: ['UGPC', 'IPC', 'Advisor', 'Examiner', 'Administrator', 'DepartmentHead'] },
      { to: '/review-titles', label: 'Review & Approve Titles', icon: '✅', roles: ['IPC', 'UGPC', 'Administrator'] },
      { to: '/assign-project-advisor', label: 'Assign Project Advisor', icon: '🧑‍🏫', roles: ['UGPC', 'Administrator'] },
      { to: '/schedule-defense', label: 'Schedule Defense', icon: '📅', roles: ['UGPC', 'Administrator'] },
      { to: '/record-assessment', label: 'Record Assessment', icon: '📋', roles: ['Advisor', 'Examiner', 'UGPC', 'Administrator'] },
      { to: '/defense-schedule', label: 'Defense Schedule', icon: '🗓️', roles: ['Student', 'GradStudent', 'Advisor', 'Examiner', 'UGPC', 'GPC', 'Administrator'] },
    ],
  },
  {
    section: 'Thesis',
    items: [
      { to: '/submit-proposal', label: 'Submit Proposal', icon: '📑', roles: ['GradStudent'] },
      { to: '/my-thesis', label: 'My Thesis', icon: '📄', roles: ['GradStudent'] },
      { to: '/proposals', label: 'Proposals', icon: '📑', roles: ['SGC', 'GPC', 'Advisor', 'Administrator', 'DepartmentHead'] },
      { to: '/theses', label: 'Theses', icon: '📄', roles: ['GPC', 'SGC', 'Advisor', 'Examiner', 'Administrator', 'DepartmentHead'] },
      { to: '/assign-thesis-advisor', label: 'Assign Thesis Advisor', icon: '🧑‍🏫', roles: ['SGC', 'Administrator'] },
      { to: '/schedule-proposal-review', label: 'Schedule Proposal Review', icon: '📅', roles: ['GPC', 'Administrator'] },
      { to: '/record-proposal-result', label: 'Record Proposal Result', icon: '📋', roles: ['GPC', 'SGC', 'Administrator'] },
    ],
  },
  {
    section: 'Documents',
    items: [
      { to: '/upload-document', label: 'Upload Document', icon: '⬆️', roles: ['Student', 'GradStudent', 'Advisor', 'Examiner'] },
      { to: '/documents', label: 'Documents', icon: '📁', roles: ['Student', 'GradStudent', 'Advisor', 'Examiner', 'UGPC', 'GPC', 'Administrator'] },
    ],
  },
  {
    section: 'Reports & Admin',
    items: [
      { to: '/reports', label: 'Reports', icon: '📊', roles: ['DepartmentHead', 'Administrator', 'UGPC', 'GPC'] },
      { to: '/manage-users', label: 'Manage Users', icon: '⚙️', roles: ['Administrator'] },
      { to: '/student-works', label: 'Student Works', icon: '🎓', roles: ['*'] },
      { to: '/profile', label: 'My Profile', icon: '👤', roles: ['*'] },
    ],
  },
];

/** Return the nav tree filtered to the given role. */
export function navForRole(role) {
  return NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.roles.includes('*') || item.roles.includes(role)),
  })).filter((group) => group.items.length > 0);
}
