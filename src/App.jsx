import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import Announcements from './pages/Announcements';
import SendAnnouncement from './pages/SendAnnouncement';
import FormGroup from './pages/FormGroup';
import MyGroup from './pages/MyGroup';
import SubmitProjectTitle from './pages/SubmitProjectTitle';
import ProjectGroups from './pages/ProjectGroups';
import ReviewTitles from './pages/ReviewTitles';
import AssignProjectAdvisor from './pages/AssignProjectAdvisor';
import ScheduleDefense from './pages/ScheduleDefense';
import RecordAssessment from './pages/RecordAssessment';
import DefenseSchedule from './pages/DefenseSchedule';
import SubmitProposal from './pages/SubmitProposal';
import MyThesis from './pages/MyThesis';
import Proposals from './pages/Proposals';
import Theses from './pages/Theses';
import AssignThesisAdvisor from './pages/AssignThesisAdvisor';
import ScheduleProposalReview from './pages/ScheduleProposalReview';
import RecordProposalResult from './pages/RecordProposalResult';
import UploadDocument from './pages/UploadDocument';
import Documents from './pages/Documents';
import Reports from './pages/Reports';
import ManageUsers from './pages/ManageUsers';
import StudentWorks from './pages/StudentWorks';
import Profile from './pages/Profile';

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* ── Public pages ── */}
      <Route path="/"        element={<Home />} />
      <Route path="/about"   element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login"   element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Announcements */}
        <Route path="/announcements" element={<Announcements />} />
        <Route
          path="/send-announcement"
          element={
            <ProtectedRoute roles={['UGPC', 'GPC', 'SGC', 'IPC', 'Administrator', 'DepartmentHead']}>
              <SendAnnouncement />
            </ProtectedRoute>
          }
        />

        {/* Industrial Project */}
        <Route path="/form-group" element={<ProtectedRoute roles={['Student', 'Administrator']}><FormGroup /></ProtectedRoute>} />
        <Route path="/my-group" element={<ProtectedRoute roles={['Student']}><MyGroup /></ProtectedRoute>} />
        <Route path="/submit-project-title" element={<ProtectedRoute roles={['Student', 'Administrator']}><SubmitProjectTitle /></ProtectedRoute>} />
        <Route path="/project-groups" element={<ProtectedRoute roles={['UGPC', 'IPC', 'Advisor', 'Examiner', 'Administrator', 'DepartmentHead']}><ProjectGroups /></ProtectedRoute>} />
        <Route path="/review-titles" element={<ProtectedRoute roles={['IPC', 'UGPC', 'Administrator']}><ReviewTitles /></ProtectedRoute>} />
        <Route path="/assign-project-advisor" element={<ProtectedRoute roles={['UGPC', 'Administrator']}><AssignProjectAdvisor /></ProtectedRoute>} />
        <Route path="/schedule-defense" element={<ProtectedRoute roles={['UGPC', 'Administrator']}><ScheduleDefense /></ProtectedRoute>} />
        <Route path="/record-assessment" element={<ProtectedRoute roles={['Advisor', 'Examiner', 'UGPC', 'GPC', 'Administrator']}><RecordAssessment /></ProtectedRoute>} />
        <Route path="/defense-schedule" element={<ProtectedRoute roles={['Student', 'GradStudent', 'Advisor', 'Examiner', 'UGPC', 'GPC', 'Administrator']}><DefenseSchedule /></ProtectedRoute>} />

        {/* Thesis */}
        <Route path="/submit-proposal" element={<ProtectedRoute roles={['GradStudent', 'Administrator']}><SubmitProposal /></ProtectedRoute>} />
        <Route path="/my-thesis" element={<ProtectedRoute roles={['GradStudent']}><MyThesis /></ProtectedRoute>} />
        <Route path="/proposals" element={<ProtectedRoute roles={['SGC', 'GPC', 'Advisor', 'Administrator', 'DepartmentHead']}><Proposals /></ProtectedRoute>} />
        <Route path="/theses" element={<ProtectedRoute roles={['GPC', 'SGC', 'Advisor', 'Examiner', 'Administrator', 'DepartmentHead']}><Theses /></ProtectedRoute>} />
        <Route path="/assign-thesis-advisor" element={<ProtectedRoute roles={['SGC', 'Administrator']}><AssignThesisAdvisor /></ProtectedRoute>} />
        <Route path="/schedule-proposal-review" element={<ProtectedRoute roles={['GPC', 'Administrator']}><ScheduleProposalReview /></ProtectedRoute>} />
        <Route path="/record-proposal-result" element={<ProtectedRoute roles={['GPC', 'SGC', 'Administrator']}><RecordProposalResult /></ProtectedRoute>} />

        {/* Documents */}
        <Route path="/upload-document" element={<ProtectedRoute roles={['Student', 'GradStudent', 'Advisor', 'Examiner']}><UploadDocument /></ProtectedRoute>} />
        <Route path="/documents" element={<ProtectedRoute roles={['Student', 'GradStudent', 'Advisor', 'Examiner', 'UGPC', 'GPC', 'Administrator']}><Documents /></ProtectedRoute>} />

        {/* Reports & Admin */}
        <Route path="/reports" element={<ProtectedRoute roles={['DepartmentHead', 'Administrator', 'UGPC', 'GPC']}><Reports /></ProtectedRoute>} />
        <Route path="/manage-users" element={<ProtectedRoute roles={['Administrator']}><ManageUsers /></ProtectedRoute>} />
        <Route path="/student-works" element={<StudentWorks />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/'} replace />} />
    </Routes>
  );
}
