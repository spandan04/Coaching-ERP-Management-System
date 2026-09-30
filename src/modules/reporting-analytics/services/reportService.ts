import { getStudentFees, getPayments } from '../../financial-management/services/feeService';
import { getAttendanceRecords, getAllResults } from '../../academic-learning/services/academicService';
import { getStudentDashboardStats, getStudents } from '../../student-management/services/studentService';

export const getReportDashboardStats = async () => {
  const studentStats = await getStudentDashboardStats();
  const studentData = await getStudents();
  const students = studentData.active;

  // Fees & Payments
  const feesList = await getStudentFees();
  let pendingFees = 0;
  feesList.forEach((doc: any) => {
    pendingFees += doc.remainingBalance || 0;
  });

  const paymentsList = await getPayments();
  let totalCollection = 0;
  const monthMap: Record<string, number> = {};

  paymentsList.forEach((data: any) => {
    const amount = data.amount || 0;
    totalCollection += amount;

    const date = data.date?.toDate ? data.date.toDate() : new Date(data.date || Date.now());
    const monthYear = date.toLocaleString('default', { month: 'short', year: '2-digit' });
    monthMap[monthYear] = (monthMap[monthYear] || 0) + amount;
  });

  const monthlyCollection = Object.entries(monthMap).map(([name, amount]) => ({ name, amount }));

  // Attendance
  const attendanceList = await getAttendanceRecords();
  let totalPresent = 0;
  let totalRecords = 0;

  attendanceList.forEach((data: any) => {
    const records = data.records;
    if (records) {
      Object.values(records).forEach((val) => {
        totalRecords++;
        if (val === 'present') totalPresent++;
      });
    }
  });
  const avgAtt = totalRecords > 0 ? (totalPresent / totalRecords) * 100 : 0;
  
  const attendanceData = [
    { name: 'Present', value: totalPresent },
    { name: 'Absent', value: totalRecords - totalPresent }
  ];

  // Results
  const resultsList = await getAllResults();
  let totalScorePerc = 0;
  resultsList.forEach((data: any) => {
    if (data.totalQuestions > 0) {
      totalScorePerc += (data.score / data.totalQuestions) * 100;
    }
  });
  const avgScore = resultsList.length > 0 ? totalScorePerc / resultsList.length : 0;

  return {
    stats: studentStats,
    students,
    reportStats: {
      totalCollection,
      pendingFees,
      averageAttendance: Math.round(avgAtt),
      averageTestScore: Math.round(avgScore)
    },
    monthlyCollection,
    attendanceData
  };
};
