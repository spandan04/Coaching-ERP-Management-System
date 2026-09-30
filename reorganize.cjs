const { Project } = require("ts-morph");

const project = new Project({
    tsConfigFilePath: "tsconfig.json",
});

const fileMap = {
  // services/authentication
  "src/context/AuthContext.tsx": "src/services/authentication/AuthContext.tsx",
  "src/pages/auth/ChangePassword.tsx": "src/services/authentication/pages/ChangePassword.tsx",
  "src/pages/auth/Login.tsx": "src/services/authentication/pages/Login.tsx",
  "src/pages/auth/StudentLogin.tsx": "src/services/authentication/pages/StudentLogin.tsx",
  "src/components/student/ProtectedRoute.tsx": "src/services/authentication/components/ProtectedRoute.tsx",
  "src/components/admin/AdminProtectedRoute.tsx": "src/services/authentication/components/AdminProtectedRoute.tsx",

  // services/firebase
  "src/firebase/firebase.ts": "src/services/firebase/firebase.ts",

  // layouts
  "src/components/common/layout/Layout.tsx": "src/layouts/Layout.tsx",
  "src/components/student/StudentLayout.tsx": "src/layouts/StudentLayout.tsx",

  // components/common
  "src/components/common/StatCard.tsx": "src/components/common/StatCard.tsx",

  // modules/student-management
  "src/firebase/studentService.ts": "src/modules/student-management/services/studentService.ts",
  "src/components/students/StudentForm.tsx": "src/modules/student-management/components/StudentForm.tsx",
  "src/components/students/StudentTable.tsx": "src/modules/student-management/components/StudentTable.tsx",
  "src/pages/students/AddStudent.tsx": "src/modules/student-management/pages/AddStudent.tsx",
  "src/pages/students/ArchiveList.tsx": "src/modules/student-management/pages/ArchiveList.tsx",
  "src/pages/students/EditStudent.tsx": "src/modules/student-management/pages/EditStudent.tsx",
  "src/pages/students/StudentDetails.tsx": "src/modules/student-management/pages/StudentDetails.tsx",
  "src/pages/students/StudentList.tsx": "src/modules/student-management/pages/StudentList.tsx",
  
  // modules/academic-learning
  "src/firebase/academicService.ts": "src/modules/academic-learning/services/academicService.ts",
  "src/pages/academics/AttemptTest.tsx": "src/modules/academic-learning/pages/AttemptTest.tsx",
  "src/pages/academics/AttendanceManagement.tsx": "src/modules/academic-learning/pages/AttendanceManagement.tsx",
  "src/pages/academics/LectureManagement.tsx": "src/modules/academic-learning/pages/LectureManagement.tsx",
  "src/pages/academics/PerformanceDashboard.tsx": "src/modules/academic-learning/pages/PerformanceDashboard.tsx",
  "src/pages/academics/TestManagement.tsx": "src/modules/academic-learning/pages/TestManagement.tsx",
  "src/pages/academics/TestResult.tsx": "src/modules/academic-learning/pages/TestResult.tsx",
  "src/pages/academics/TimetableManagement.tsx": "src/modules/academic-learning/pages/TimetableManagement.tsx",

  // modules/video-lesson-administration
  "src/firebase/videoLectureService.ts": "src/modules/video-lesson-administration/services/videoLectureService.ts",
  "src/pages/academics/VideoLectureManagement.tsx": "src/modules/video-lesson-administration/pages/VideoLectureManagement.tsx",

  // modules/communication-notification
  "src/firebase/communicationService.ts": "src/modules/communication-notification/services/communicationService.ts",
  "src/pages/communication/Announcements.tsx": "src/modules/communication-notification/pages/Announcements.tsx",
  "src/pages/communication/Circulars.tsx": "src/modules/communication-notification/pages/Circulars.tsx",
  "src/pages/communication/CommunicationDashboard.tsx": "src/modules/communication-notification/pages/CommunicationDashboard.tsx",
  "src/pages/communication/NoticeBoard.tsx": "src/modules/communication-notification/pages/NoticeBoard.tsx",
  "src/pages/communication/Notifications.tsx": "src/modules/communication-notification/pages/Notifications.tsx",

  // modules/financial-management
  "src/firebase/feeService.ts": "src/modules/financial-management/services/feeService.ts",
  "src/pages/fees/FeeCollection.tsx": "src/modules/financial-management/pages/FeeCollection.tsx",
  "src/pages/fees/FeeDashboard.tsx": "src/modules/financial-management/pages/FeeDashboard.tsx",
  "src/pages/fees/FeeStructureManagement.tsx": "src/modules/financial-management/pages/FeeStructureManagement.tsx",
  "src/pages/fees/InstallmentManagement.tsx": "src/modules/financial-management/pages/InstallmentManagement.tsx",
  "src/pages/fees/PendingFees.tsx": "src/modules/financial-management/pages/PendingFees.tsx",
  "src/pages/fees/StudentFeeAssignment.tsx": "src/modules/financial-management/pages/StudentFeeAssignment.tsx",
  "src/pages/fees/TransactionHistory.tsx": "src/modules/financial-management/pages/TransactionHistory.tsx",

  // modules/reporting-analytics
  "src/firebase/reportService.ts": "src/modules/reporting-analytics/services/reportService.ts",
  "src/pages/reports/AcademicReports.tsx": "src/modules/reporting-analytics/pages/AcademicReports.tsx",
  "src/pages/reports/AttendanceReports.tsx": "src/modules/reporting-analytics/pages/AttendanceReports.tsx",
  "src/pages/reports/FeeReports.tsx": "src/modules/reporting-analytics/pages/FeeReports.tsx",
  "src/pages/reports/ReportsDashboard.tsx": "src/modules/reporting-analytics/pages/ReportsDashboard.tsx",
  "src/pages/reports/StudentReports.tsx": "src/modules/reporting-analytics/pages/StudentReports.tsx",

  // modules/student-portal
  "src/pages/student/StudentAttendance.tsx": "src/modules/student-portal/pages/StudentAttendance.tsx",
  "src/pages/student/StudentDashboard.tsx": "src/modules/student-portal/pages/StudentDashboard.tsx",
  "src/pages/student/StudentFees.tsx": "src/modules/student-portal/pages/StudentFees.tsx",
  "src/pages/student/StudentNotices.tsx": "src/modules/student-portal/pages/StudentNotices.tsx",
  "src/pages/student/StudentProfile.tsx": "src/modules/student-portal/pages/StudentProfile.tsx",
  "src/pages/student/StudentTests.tsx": "src/modules/student-portal/pages/StudentTests.tsx",
  "src/pages/student/StudentTimetable.tsx": "src/modules/student-portal/pages/StudentTimetable.tsx",
  "src/pages/student/StudentVideoLectures.tsx": "src/modules/student-portal/pages/StudentVideoLectures.tsx",
};

let errors = 0;
for (const [oldPath, newPath] of Object.entries(fileMap)) {
    const sourceFile = project.getSourceFile(oldPath);
    if (sourceFile) {
        console.log("Moving " + oldPath + " to " + newPath);
        sourceFile.moveToDirectory(newPath.substring(0, newPath.lastIndexOf('/')));
    } else {
        console.error("Could not find source file: " + oldPath);
        errors++;
    }
}

if (errors === 0) {
    project.saveSync();
    console.log("Successfully saved project.");
} else {
    console.log("There were errors. Not saving.");
}
