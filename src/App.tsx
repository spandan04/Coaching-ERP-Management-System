import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './layouts/Layout';
import { Dashboard } from './pages/dashboard/Dashboard';
import { StudentList } from './modules/student-management/pages/StudentList';
import { AddStudent } from './modules/student-management/pages/AddStudent';
import { StudentDetails } from './modules/student-management/pages/StudentDetails';
import { EditStudent } from './modules/student-management/pages/EditStudent';
import { ArchiveList } from './modules/student-management/pages/ArchiveList';
import { LectureManagement } from './modules/academic-learning/pages/LectureManagement';
import { VideoLectureManagement } from './modules/video-lesson-administration/pages/VideoLectureManagement';
import { TimetableManagement } from './modules/academic-learning/pages/TimetableManagement';
import { AttendanceManagement } from './modules/academic-learning/pages/AttendanceManagement';
import { TestManagement } from './modules/academic-learning/pages/TestManagement';
import { AttemptTest } from './modules/academic-learning/pages/AttemptTest';
import { TestResult } from './modules/academic-learning/pages/TestResult';
import { PerformanceDashboard } from './modules/academic-learning/pages/PerformanceDashboard';
import { FeeDashboard } from './modules/financial-management/pages/FeeDashboard';
import { FeeStructureManagement } from './modules/financial-management/pages/FeeStructureManagement';
import { StudentFeeAssignment } from './modules/financial-management/pages/StudentFeeAssignment';
import { FeeCollection } from './modules/financial-management/pages/FeeCollection';
import { InstallmentManagement } from './modules/financial-management/pages/InstallmentManagement';
import { TransactionHistory } from './modules/financial-management/pages/TransactionHistory';
import { PendingFees } from './modules/financial-management/pages/PendingFees';
import { ReportsDashboard } from './modules/reporting-analytics/pages/ReportsDashboard';
import { StudentReports } from './modules/reporting-analytics/pages/StudentReports';
import { AttendanceReports } from './modules/reporting-analytics/pages/AttendanceReports';
import { FeeReports } from './modules/reporting-analytics/pages/FeeReports';
import { AcademicReports } from './modules/reporting-analytics/pages/AcademicReports';
import { CommunicationDashboard } from './modules/communication-notification/pages/CommunicationDashboard';
import { Announcements } from './modules/communication-notification/pages/Announcements';
import { NoticeBoard } from './modules/communication-notification/pages/NoticeBoard';
import { Notifications } from './modules/communication-notification/pages/Notifications';
import { Circulars } from './modules/communication-notification/pages/Circulars';

// Auth & Student Portal Imports
import { AuthProvider } from './services/authentication/AuthContext';
import { Login as AdminLogin } from './services/authentication/pages/Login';
import { StudentLogin } from './services/authentication/pages/StudentLogin';
import { ChangePassword } from './services/authentication/pages/ChangePassword';
import { ProtectedRoute } from './services/authentication/components/ProtectedRoute';
import { AdminProtectedRoute } from './services/authentication/components/AdminProtectedRoute';
import { StudentLayout } from './layouts/StudentLayout';
import { StudentDashboard } from './modules/student-portal/pages/StudentDashboard';
import { StudentProfile } from './modules/student-portal/pages/StudentProfile';
import { StudentAttendance } from './modules/student-portal/pages/StudentAttendance';
import { StudentTimetable } from './modules/student-portal/pages/StudentTimetable';
import { StudentTests } from './modules/student-portal/pages/StudentTests';
import { StudentFees } from './modules/student-portal/pages/StudentFees';
import { StudentNotices } from './modules/student-portal/pages/StudentNotices';
import { StudentVideoLectures } from './modules/student-portal/pages/StudentVideoLectures';
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Redirect old login to admin login */}
          <Route path="/login" element={<Navigate to="/admin/login" replace />} />
          
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/student/login" element={<StudentLogin />} />
          
          {/* Student Portal Routes */}
          <Route path="/student" element={<ProtectedRoute />}>
            <Route path="change-password" element={<ChangePassword />} />
            <Route element={<StudentLayout />}>
              <Route index element={<StudentDashboard />} />
              <Route path="profile" element={<StudentProfile />} />
              <Route path="attendance" element={<StudentAttendance />} />
              <Route path="timetable" element={<StudentTimetable />} />
              <Route path="tests" element={<StudentTests />} />
              <Route path="tests/:id/attempt" element={<AttemptTest />} />
              <Route path="tests/:id/result" element={<TestResult />} />
              <Route path="fees" element={<StudentFees />} />
              <Route path="notices" element={<StudentNotices />} />
              <Route path="video-lectures" element={<StudentVideoLectures />} />
            </Route>
          </Route>

          <Route path="/" element={<AdminProtectedRoute />}>
            <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="students" element={<StudentList />} />
            <Route path="students/new" element={<AddStudent />} />
            <Route path="students/:id" element={<StudentDetails />} />
            <Route path="students/:id/edit" element={<EditStudent />} />
            <Route path="archive" element={<ArchiveList />} />
            <Route path="lectures" element={<LectureManagement />} />
            <Route path="video-lectures" element={<VideoLectureManagement />} />
            <Route path="timetable" element={<TimetableManagement />} />
            <Route path="attendance" element={<AttendanceManagement />} />
            <Route path="tests" element={<TestManagement />} />
            <Route path="tests/:id/attempt" element={<AttemptTest />} />
            <Route path="tests/:id/result" element={<TestResult />} />
            <Route path="performance" element={<PerformanceDashboard />} />
            <Route path="fees">
              <Route index element={<FeeDashboard />} />
              <Route path="structures" element={<FeeStructureManagement />} />
              <Route path="assignment" element={<StudentFeeAssignment />} />
              <Route path="collection" element={<FeeCollection />} />
              <Route path="installments" element={<InstallmentManagement />} />
              <Route path="transactions" element={<TransactionHistory />} />
              <Route path="pending" element={<PendingFees />} />
            </Route>
            <Route path="reports">
              <Route index element={<ReportsDashboard />} />
              <Route path="students" element={<StudentReports />} />
              <Route path="attendance" element={<AttendanceReports />} />
              <Route path="fees" element={<FeeReports />} />
              <Route path="academic" element={<AcademicReports />} />
            </Route>
            <Route path="communication">
              <Route index element={<CommunicationDashboard />} />
              <Route path="announcements" element={<Announcements />} />
              <Route path="notices" element={<NoticeBoard />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="circulars" element={<Circulars />} />
            </Route>
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
