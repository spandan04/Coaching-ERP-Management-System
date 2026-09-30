import React, { useState, useEffect, useMemo } from 'react';
import { getStudents } from '../../student-management/services/studentService';
import { getTests, getAllResults, getAttendanceRecords } from '../../academic-learning/services/academicService';
import { Search, Download, FileText, Award, BookOpen, Target, TrendingUp, AlertCircle, ChevronDown, CheckSquare, Users } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['#818cf8', '#38bdf8', '#34d399', '#fbbf24', '#f87171', '#a78bfa'];

// Helper Component for Stats
const StatCard = ({ title, value, icon, color, subtext }: any) => {
  const colors: any = {
    indigo: 'bg-indigo-900/40 text-indigo-400',
    sky: 'bg-sky-900/40 text-sky-400',
    emerald: 'bg-emerald-900/40 text-emerald-400',
    amber: 'bg-amber-900/40 text-amber-400',
    green: 'bg-green-900/40 text-green-400',
    rose: 'bg-rose-900/40 text-rose-400',
  };
  return (
    <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex flex-col justify-center">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${colors[color]}`}>{icon}</div>
        <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      {subtext && <p className={`text-xs mt-1 font-medium ${colors[color].split(' ')[1]}`}>{subtext}</p>}
    </div>
  );
};

export const AcademicReports = () => {
  const [reportType, setReportType] = useState('overview'); 
  
  const [students, setStudents] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('Term 1');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  useEffect(() => {
    const fetchAcademicData = async () => {
      setLoading(true);
      try {
        const studentData = await getStudents();
        setStudents(studentData.active);
        const testsList = await getTests();
        setTests(testsList);
        const resultsList = await getAllResults();
        setResults(resultsList);
        const attendanceList = await getAttendanceRecords();
        setAttendance(attendanceList);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAcademicData();
  }, []);

  const courses = Array.from(new Set(students.map(s => s.courseEnrolled))).filter(Boolean);
  const batches = Array.from(new Set(students.map(s => s.batch))).filter(Boolean);
  const subjects = Array.from(new Set(tests.map(t => t.subject))).filter(Boolean);
  
  const months = useMemo(() => {
    const mSet = new Set<string>();
    tests.forEach(t => {
      if (t.date) {
        const d = new Date(t.date);
        mSet.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
      }
    });
    return Array.from(mSet).sort().reverse();
  }, [tests]);

  const reportTypes = [
    { id: 'overview', name: 'Academic Overview' },
    { id: 'monthly', name: 'Monthly Academic Report' },
    { id: 'student', name: 'Student-Wise Academic Report' },
    { id: 'subject', name: 'Subject-Wise Performance' },
    { id: 'batch', name: 'Batch Performance' },
    { id: 'reportCard', name: 'Student Report Card' },
    { id: 'needsImprovement', name: 'Needs Improvement Students' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight font-heading">Academic Reports & Analytics</h1>
          <p className="mt-2 text-slate-400 font-medium text-sm">Comprehensive academic performance and analytics.</p>
        </div>
      </div>

      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-medium text-slate-400 mb-1">Select Report Type</label>
            <div className="relative">
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-sky-500 outline-none appearance-none"
              >
                {reportTypes.map(rt => (
                  <option key={rt.id} value={rt.id}>{rt.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>
          
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            {['overview', 'monthly', 'subject', 'batch'].includes(reportType) && (
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Course</label>
                <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none">
                  <option value="">All Courses</option>
                  {courses.map(c => <option key={c as string} value={c as string}>{c as string}</option>)}
                </select>
              </div>
            )}
            
            {['overview', 'monthly', 'subject', 'batch', 'needsImprovement'].includes(reportType) && (
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Batch</label>
                <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)} className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none">
                  <option value="">All Batches</option>
                  {batches.map(b => <option key={b as string} value={b as string}>{b as string}</option>)}
                </select>
              </div>
            )}
            
            {['overview', 'monthly', 'subject'].includes(reportType) && (
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Month</label>
                <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none">
                  <option value="">All Time</option>
                  {months.map(m => <option key={m as string} value={m as string}>{m as string}</option>)}
                </select>
              </div>
            )}
            
            {['subject'].includes(reportType) && (
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Subject</label>
                <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none">
                  <option value="">All Subjects</option>
                  {subjects.map(s => <option key={s as string} value={s as string}>{s as string}</option>)}
                </select>
              </div>
            )}
            
            {['student', 'reportCard'].includes(reportType) && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-400 mb-1">Search Student</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Enter student name or ID..."
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>
            )}

            {['reportCard'].includes(reportType) && (
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Term</label>
                <select value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)} className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none">
                  <option value="Term 1">Term 1</option>
                  <option value="Term 2">Term 2</option>
                  <option value="Final">Final</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-500"></div>
            <p className="text-slate-400 font-medium text-sm animate-pulse">Analyzing academic data...</p>
          </div>
        </div>
      ) : (
        <ReportRenderer 
          reportType={reportType} 
          filters={{selectedCourse, selectedBatch, selectedMonth, selectedSubject, selectedStudent, selectedTerm, selectedYear}} 
          data={{students, tests, results, attendance}} 
        />
      )}
    </div>
  );
};

// --- RENDERER COMPONENT ---
const ReportRenderer = ({ reportType, filters, data }: any) => {
  switch (reportType) {
    case 'overview': return <AcademicOverview filters={filters} data={data} />;
    case 'monthly': return <MonthlyReport filters={filters} data={data} />;
    case 'student': return <StudentReport filters={filters} data={data} />;
    case 'subject': return <SubjectReport filters={filters} data={data} />;
    case 'batch': return <BatchReport filters={filters} data={data} />;
    case 'reportCard': return <ReportCard filters={filters} data={data} />;
    case 'needsImprovement': return <NeedsImprovement filters={filters} data={data} />;
    default: return null;
  }
};

// --- REPORT 1: ACADEMIC OVERVIEW ---
const AcademicOverview = ({ filters, data }: any) => {
  const { students, tests, results, attendance } = data;
  const { selectedCourse, selectedBatch, selectedMonth } = filters;

  const stats = useMemo(() => {
    const filteredStudents = students.filter((s: any) => 
      (!selectedCourse || s.courseEnrolled === selectedCourse) &&
      (!selectedBatch || s.batch === selectedBatch)
    );
    const studentIds = new Set(filteredStudents.map((s: any) => s.id));

    const filteredTests = tests.filter((t: any) => {
      if (!selectedCourse && !selectedBatch && !selectedMonth) return true;
      let match = true;
      if (selectedMonth && t.date) match = t.date.startsWith(selectedMonth);
      if (selectedCourse && t.course) match = match && t.course === selectedCourse;
      if (selectedBatch && t.batch) match = match && t.batch === selectedBatch;
      return match;
    });
    const testIds = new Set(filteredTests.map((t: any) => t.id));

    const filteredResults = results.filter((r: any) => studentIds.has(r.studentId) && testIds.has(r.testId));

    let totalScore = 0, totalMax = 0, highest = 0, lowest = 100;
    
    filteredResults.forEach((r: any) => {
      totalScore += r.score || 0;
      totalMax += r.totalQuestions || 0;
      const perc = r.totalQuestions > 0 ? (r.score / r.totalQuestions) * 100 : 0;
      if (perc > highest) highest = perc;
      if (perc < lowest) lowest = perc;
    });
    
    const avgScore = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;
    if (lowest === 100 && filteredResults.length === 0) lowest = 0;

    const subjectStats: any = {};
    filteredResults.forEach((r: any) => {
      const test = tests.find((t: any) => t.id === r.testId);
      if (test) {
        if (!subjectStats[test.subject]) subjectStats[test.subject] = { score: 0, max: 0 };
        subjectStats[test.subject].score += r.score || 0;
        subjectStats[test.subject].max += r.totalQuestions || 0;
      }
    });

    const subjectData = Object.keys(subjectStats).map(sub => ({
      name: sub,
      avg: Math.round((subjectStats[sub].score / subjectStats[sub].max) * 100)
    }));

    let excellent = 0, good = 0, average = 0, poor = 0;
    filteredResults.forEach((r: any) => {
      const perc = r.totalQuestions > 0 ? (r.score / r.totalQuestions) * 100 : 0;
      if (perc >= 80) excellent++;
      else if (perc >= 60) good++;
      else if (perc >= 40) average++;
      else poor++;
    });
    const distData = [
      { name: 'Excellent (>80%)', value: excellent },
      { name: 'Good (60-79%)', value: good },
      { name: 'Average (40-59%)', value: average },
      { name: 'Poor (<40%)', value: poor }
    ];

    let presentCount = 0, totalLecs = 0;
    attendance.forEach((a: any) => {
      if (a.records) {
        Object.entries(a.records).forEach(([sId, status]) => {
          if (studentIds.has(sId)) {
            totalLecs++;
            if (status === 'present') presentCount++;
          }
        });
      }
    });
    const avgAtt = totalLecs > 0 ? Math.round((presentCount / totalLecs) * 100) : 0;

    return {
      totalStudents: filteredStudents.length,
      testsConducted: filteredTests.length,
      avgScore, highest: Math.round(highest), lowest: Math.round(lowest),
      avgAtt, subjectData, distData
    };
  }, [students, tests, results, attendance, selectedCourse, selectedBatch, selectedMonth]);

  if (stats.totalStudents === 0) {
    return <div className="text-center p-12 text-slate-400 bg-slate-900 rounded-3xl">No data available for the selected period.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={stats.totalStudents} icon={<Users className="w-6 h-6 text-indigo-400"/>} color="indigo" />
        <StatCard title="Tests Conducted" value={stats.testsConducted} icon={<FileText className="w-6 h-6 text-sky-400"/>} color="sky" />
        <StatCard title="Avg Test Score" value={`${stats.avgScore}%`} icon={<Award className="w-6 h-6 text-amber-400"/>} color="amber" />
        <StatCard title="Avg Attendance" value={`${stats.avgAtt}%`} icon={<CheckSquare className="w-6 h-6 text-emerald-400"/>} color="emerald" />
        <StatCard title="Highest Score" value={`${stats.highest}%`} icon={<TrendingUp className="w-6 h-6 text-green-400"/>} color="green" />
        <StatCard title="Lowest Score" value={`${stats.lowest}%`} icon={<TrendingUp className="w-6 h-6 text-rose-400 transform rotate-180"/>} color="rose" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
          <h2 className="font-bold text-white mb-4">Subject-Wise Performance</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.subjectData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{borderRadius: '12px', border: 'none', background: '#0f172a', color: '#fff'}} />
                <Bar dataKey="avg" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
          <h2 className="font-bold text-white mb-4">Performance Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.distData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" nameKey="name" stroke="none">
                  {stats.distData.map((e: any, i: number) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', background: '#0f172a', color: '#fff'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- REPORT 2: MONTHLY ACADEMIC REPORT ---
const MonthlyReport = ({ filters, data }: any) => {
  const { students, tests, results, attendance } = data;
  const { selectedCourse, selectedBatch, selectedMonth } = filters;

  const monthlyData = useMemo(() => {
    if (!selectedMonth) return null;
    const filteredTests = tests.filter((t: any) => t.date && t.date.startsWith(selectedMonth) && (!selectedCourse || t.course === selectedCourse) && (!selectedBatch || t.batch === selectedBatch));
    if (filteredTests.length === 0) return { empty: true };

    const tIds = new Set(filteredTests.map((t: any) => t.id));
    const filteredResults = results.filter((r: any) => tIds.has(r.testId));
    
    const subMap: any = {};
    filteredTests.forEach((t: any) => {
      if (!subMap[t.subject]) subMap[t.subject] = { tests: 0, score: 0, max: 0, highest: 0, lowest: 100 };
      subMap[t.subject].tests++;
    });

    filteredResults.forEach((r: any) => {
      const t = tests.find((x: any) => x.id === r.testId);
      if (t) {
        const perc = (r.score / r.totalQuestions) * 100;
        subMap[t.subject].score += r.score;
        subMap[t.subject].max += r.totalQuestions;
        if (perc > subMap[t.subject].highest) subMap[t.subject].highest = perc;
        if (perc < subMap[t.subject].lowest) subMap[t.subject].lowest = perc;
      }
    });

    const rows = Object.keys(subMap).map(sub => {
      const s = subMap[sub];
      const avg = s.max > 0 ? (s.score / s.max) * 100 : 0;
      return {
        subject: sub,
        tests: s.tests,
        average: Math.round(avg),
        highest: s.max > 0 ? Math.round(s.highest) : 0,
        lowest: s.max > 0 ? (s.lowest === 100 ? 0 : Math.round(s.lowest)) : 0
      };
    });

    let totalScore = 0, totalMax = 0, h = 0, l = 100;
    filteredResults.forEach((r: any) => {
        totalScore += r.score;
        totalMax += r.totalQuestions;
        const p = (r.score/r.totalQuestions)*100;
        if (p > h) h = p;
        if (p < l) l = p;
    });

    const summary = {
        tests: filteredTests.length,
        avg: totalMax > 0 ? Math.round((totalScore/totalMax)*100) : 0,
        high: h,
        low: l === 100 ? 0 : l
    };

    return { rows, summary, empty: false, testsCount: filteredTests.length };
  }, [selectedMonth, selectedCourse, selectedBatch, tests, results]);

  const exportToExcel = () => {
    if (!monthlyData || monthlyData.empty) return;
    const ws = XLSX.utils.json_to_sheet(monthlyData.rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Monthly Report');
    XLSX.writeFile(wb, `Monthly_Report_${selectedMonth}.xlsx`);
  };

  const exportToPDF = () => {
    if (!monthlyData || monthlyData.empty) return;
    const doc = new jsPDF();
    doc.text(`Monthly Academic Report - ${selectedMonth}`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Total Tests: ${monthlyData.summary.tests} | Overall Avg: ${monthlyData.summary.avg}%`, 14, 22);
    autoTable(doc, {
      startY: 28,
      head: [['Subject', 'Tests', 'Average %', 'Highest %', 'Lowest %']],
      body: monthlyData.rows.map((r: any) => [r.subject, r.tests, r.average, r.highest, r.lowest]),
      theme: 'grid', styles: { fontSize: 9 }, headStyles: { fillColor: [14, 165, 233] }
    });
    doc.save(`Monthly_Report_${selectedMonth}.pdf`);
  };

  if (!selectedMonth) return <div className="text-center p-12 text-slate-400 bg-slate-900 rounded-3xl">Please select a month to view the report.</div>;
  if (monthlyData?.empty) return <div className="text-center p-12 text-slate-400 bg-slate-900 rounded-3xl">No data available for the selected period.</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-900 p-6 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white">Overall Monthly Performance</h2>
          <div className="flex gap-6 mt-2 text-sm">
            <p className="text-slate-400">Total Tests: <span className="text-white font-bold">{monthlyData?.summary.tests}</span></p>
            <p className="text-slate-400">Average Score: <span className="text-amber-400 font-bold">{monthlyData?.summary.avg}%</span></p>
            <p className="text-slate-400">Highest: <span className="text-emerald-400 font-bold">{Math.round(monthlyData?.summary.high || 0)}%</span></p>
            <p className="text-slate-400">Lowest: <span className="text-rose-400 font-bold">{Math.round(monthlyData?.summary.low || 0)}%</span></p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={exportToExcel} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors">
            <Download className="w-4 h-4" /> Excel
          </button>
          <button onClick={exportToPDF} className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-medium transition-colors">
            <FileText className="w-4 h-4" /> PDF
          </button>
        </div>
      </div>
      
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950 border-b border-slate-800">
              <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Subject</th>
              <th className="p-4 text-xs font-semibold text-slate-400 uppercase text-center">Tests Conducted</th>
              <th className="p-4 text-xs font-semibold text-slate-400 uppercase text-center">Average %</th>
              <th className="p-4 text-xs font-semibold text-slate-400 uppercase text-center">Highest %</th>
              <th className="p-4 text-xs font-semibold text-slate-400 uppercase text-center">Lowest %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {monthlyData?.rows.map((row: any, i: number) => (
              <tr key={i} className="hover:bg-slate-800/50">
                <td className="p-4 text-sm font-medium text-white">{row.subject}</td>
                <td className="p-4 text-sm text-slate-300 text-center">{row.tests}</td>
                <td className="p-4 text-sm text-sky-400 font-bold text-center">{row.average}%</td>
                <td className="p-4 text-sm text-emerald-400 text-center">{row.highest}%</td>
                <td className="p-4 text-sm text-rose-400 text-center">{row.lowest}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- REPORT 3: STUDENT-WISE ACADEMIC REPORT ---
const StudentReport = ({ filters, data }: any) => {
  const { students, tests, results, attendance } = data;
  const { selectedStudent } = filters;

  const displayStudent = useMemo(() => {
    if (!selectedStudent || selectedStudent.length < 3) return null;
    const term = selectedStudent.toLowerCase();
    const st = students.find((s: any) => s.fullName.toLowerCase().includes(term) || (s.admissionNumber && s.admissionNumber.toLowerCase().includes(term)));
    return st;
  }, [students, selectedStudent]);

  const studentData = useMemo(() => {
    if (!displayStudent) return null;
    const sId = displayStudent.id;
    const myResults = results.filter((r: any) => r.studentId === sId);
    
    myResults.sort((a: any, b: any) => {
      const ta = tests.find((t: any) => t.id === a.testId);
      const tb = tests.find((t: any) => t.id === b.testId);
      if (!ta || !tb) return 0;
      return new Date(ta.date).getTime() - new Date(tb.date).getTime();
    });

    let totalScore = 0, totalMax = 0, highest = 0, lowest = 100;
    const trendData: any[] = [];
    const testList: any[] = [];
    
    myResults.forEach((r: any, idx: number) => {
      const t = tests.find((x: any) => x.id === r.testId);
      if (t) {
        totalScore += r.score;
        totalMax += r.totalQuestions;
        const p = (r.score / r.totalQuestions) * 100;
        if (p > highest) highest = p;
        if (p < lowest) lowest = p;
        trendData.push({ name: `T${idx+1}`, score: Math.round(p), subject: t.subject });
        testList.push({ test: t.title, subject: t.subject, date: t.date, score: r.score, max: r.totalQuestions, perc: Math.round(p) });
      }
    });

    const avgPerc = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;
    if (myResults.length === 0) lowest = 0;

    let present = 0, totalLecs = 0;
    attendance.forEach((a: any) => {
      if (a.records && a.records[sId]) {
        totalLecs++;
        if (a.records[sId] === 'present') present++;
      }
    });
    const attPerc = totalLecs > 0 ? Math.round((present / totalLecs) * 100) : 0;

    let perfStatus = avgPerc >= 80 ? 'Excellent' : avgPerc >= 60 ? 'Good' : 'Needs Improvement';
    let attStatus = attPerc >= 75 ? 'Good' : 'Low Attendance';
    
    const remarks = [];
    if (avgPerc >= 80) remarks.push("The student has demonstrated excellent academic performance.");
    else if (avgPerc >= 60) remarks.push("The student has demonstrated good academic performance.");
    else remarks.push("The student needs improvement in academic performance.");
    if (attPerc < 75) remarks.push("Attendance is below the recommended level.");

    return { totalScore, totalMax, highest, lowest, avgPerc, trendData, testList, present, totalLecs, attPerc, perfStatus, attStatus, remarks };
  }, [displayStudent, results, tests, attendance]);

  const exportToPDF = () => {
    if (!displayStudent || !studentData) return;
    const doc = new jsPDF();
    doc.text(`Student Academic Report - ${displayStudent.fullName}`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Course: ${displayStudent.courseEnrolled} | Batch: ${displayStudent.batch}`, 14, 22);
    doc.text(`Average: ${studentData.avgPerc}% | Attendance: ${studentData.attPerc}%`, 14, 28);
    
    autoTable(doc, {
      startY: 35,
      head: [['Test', 'Subject', 'Date', 'Score', 'Percentage']],
      body: studentData.testList.map((r: any) => [r.test, r.subject, r.date, `${r.score}/${r.max}`, `${r.perc}%`]),
      theme: 'grid', styles: { fontSize: 9 }, headStyles: { fillColor: [14, 165, 233] }
    });
    doc.save(`Student_Report_${displayStudent.fullName}.pdf`);
  };

  if (!selectedStudent || selectedStudent.length < 3) return <div className="text-center p-12 text-slate-400 bg-slate-900 rounded-3xl">Please type at least 3 characters to search for a student.</div>;
  if (!displayStudent) return <div className="text-center p-12 text-slate-400 bg-slate-900 rounded-3xl">No student found matching "{selectedStudent}".</div>;
  if (!studentData) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-900 p-6 rounded-3xl border border-slate-800">
        <div className="flex items-center gap-4">
          {displayStudent.profilePhotoUrl ? (
            <img src={displayStudent.profilePhotoUrl} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-slate-700" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-xl font-bold text-slate-400">
              {displayStudent.fullName.charAt(0)}
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold text-white">{displayStudent.fullName}</h2>
            <p className="text-slate-400">{displayStudent.admissionNumber} • {displayStudent.courseEnrolled} • {displayStudent.batch}</p>
          </div>
        </div>
        <button onClick={exportToPDF} className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-medium transition-colors">
          <FileText className="w-4 h-4" /> PDF
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Overall Average" value={`${studentData.avgPerc}%`} icon={<Award className="w-6 h-6 text-amber-400"/>} color="amber" subtext={studentData.perfStatus} />
        <StatCard title="Attendance" value={`${studentData.attPerc}%`} icon={<CheckSquare className="w-6 h-6 text-sky-400"/>} color="sky" subtext={studentData.attStatus} />
        <StatCard title="Highest Score" value={`${Math.round(studentData.highest)}%`} icon={<TrendingUp className="w-6 h-6 text-emerald-400"/>} color="emerald" />
        <StatCard title="Lowest Score" value={`${Math.round(studentData.lowest)}%`} icon={<TrendingUp className="w-6 h-6 text-rose-400 transform rotate-180"/>} color="rose" />
      </div>

      {studentData.remarks.length > 0 && (
        <div className="bg-sky-900/20 border border-sky-800 p-4 rounded-xl">
          <h3 className="text-sky-400 font-bold mb-2">Remarks</h3>
          <ul className="list-disc pl-5 text-sky-200 text-sm space-y-1">
            {studentData.remarks.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
          <h2 className="font-bold text-white mb-4">Performance Trend</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={studentData.trendData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', background: '#0f172a', color: '#fff'}} />
                <Line type="monotone" dataKey="score" stroke="#38bdf8" strokeWidth={3} dot={{fill: '#38bdf8', strokeWidth: 2, r: 4}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800">
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Test</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase text-center">Score</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase text-center">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {studentData.testList.map((row: any, i: number) => (
                <tr key={i} className="hover:bg-slate-800/50">
                  <td className="p-4 text-sm text-white">
                    <p className="font-medium">{row.test}</p>
                    <p className="text-xs text-slate-400">{row.subject} • {row.date}</p>
                  </td>
                  <td className="p-4 text-sm text-slate-300 text-center">{row.score}/{row.max}</td>
                  <td className="p-4">
                    <span className={`block text-center px-2 py-1 rounded-md text-xs font-bold ${row.perc >= 75 ? 'bg-emerald-900/40 text-emerald-400' : row.perc >= 50 ? 'bg-amber-900/40 text-amber-400' : 'bg-rose-900/40 text-rose-400'}`}>
                      {row.perc}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- REPORT 4: SUBJECT-WISE PERFORMANCE REPORT ---
const SubjectReport = ({ filters, data }: any) => {
  const { students, tests, results } = data;
  const { selectedSubject, selectedCourse, selectedBatch, selectedMonth } = filters;

  const subjectData = useMemo(() => {
    if (!selectedSubject) return null;
    
    const filteredTests = tests.filter((t: any) => 
      t.subject === selectedSubject && 
      (!selectedMonth || (t.date && t.date.startsWith(selectedMonth))) && 
      (!selectedCourse || t.course === selectedCourse) && 
      (!selectedBatch || t.batch === selectedBatch)
    );

    if (filteredTests.length === 0) return { empty: true };

    const tIds = new Set(filteredTests.map((t: any) => t.id));
    const filteredResults = results.filter((r: any) => tIds.has(r.testId));

    let totalScore = 0, totalMax = 0, highest = 0, lowest = 100, passCount = 0;
    const studentSet = new Set();
    
    let excellent = 0, good = 0, average = 0, poor = 0;

    filteredResults.forEach((r: any) => {
        studentSet.add(r.studentId);
        totalScore += r.score;
        totalMax += r.totalQuestions;
        const p = r.totalQuestions > 0 ? (r.score / r.totalQuestions) * 100 : 0;
        if (p > highest) highest = p;
        if (p < lowest) lowest = p;
        if (p >= 40) passCount++;

        if (p >= 90) excellent++;
        else if (p >= 75) good++;
        else if (p >= 60) average++;
        else poor++;
    });

    const avg = totalMax > 0 ? Math.round((totalScore/totalMax)*100) : 0;
    const passPerc = filteredResults.length > 0 ? Math.round((passCount/filteredResults.length)*100) : 0;
    
    const distData = [
      { name: '90-100%', value: excellent },
      { name: '75-89%', value: good },
      { name: '60-74%', value: average },
      { name: 'Below 60%', value: poor }
    ];

    return { 
        tests: filteredTests.length, 
        students: studentSet.size, 
        avg, highest: Math.round(highest), lowest: Math.round(lowest), passPerc, 
        distData, empty: false 
    };
  }, [selectedSubject, selectedMonth, selectedCourse, selectedBatch, tests, results]);

  if (!selectedSubject) return <div className="text-center p-12 text-slate-400 bg-slate-900 rounded-3xl">Please select a subject to view the report.</div>;
  if (subjectData?.empty) return <div className="text-center p-12 text-slate-400 bg-slate-900 rounded-3xl">No data available for the selected period.</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Tests" value={subjectData?.tests} icon={<FileText className="w-6 h-6 text-indigo-400"/>} color="indigo" />
        <StatCard title="Students" value={subjectData?.students} icon={<Users className="w-6 h-6 text-sky-400"/>} color="sky" />
        <StatCard title="Avg Score" value={`${subjectData?.avg}%`} icon={<Award className="w-6 h-6 text-amber-400"/>} color="amber" />
        <StatCard title="Highest" value={`${subjectData?.highest}%`} icon={<TrendingUp className="w-6 h-6 text-emerald-400"/>} color="emerald" />
        <StatCard title="Lowest" value={`${subjectData?.lowest}%`} icon={<TrendingUp className="w-6 h-6 text-rose-400 transform rotate-180"/>} color="rose" />
        <StatCard title="Pass Rate" value={`${subjectData?.passPerc}%`} icon={<CheckSquare className="w-6 h-6 text-green-400"/>} color="green" />
      </div>

      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
        <h2 className="font-bold text-white mb-4">Performance Distribution ({selectedSubject})</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={subjectData?.distData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" nameKey="name" stroke="none">
                {subjectData?.distData.map((e: any, i: number) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{borderRadius: '12px', border: 'none', background: '#0f172a', color: '#fff'}} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// --- REPORT 5: BATCH PERFORMANCE REPORT ---
const BatchReport = ({ filters, data }: any) => {
  const { students, tests, results, attendance } = data;
  const { selectedBatch, selectedCourse } = filters;

  const batchData = useMemo(() => {
    if (!selectedBatch) return null;
    
    const filteredStudents = students.filter((s: any) => s.batch === selectedBatch && (!selectedCourse || s.courseEnrolled === selectedCourse));
    if (filteredStudents.length === 0) return { empty: true };
    const sIds = new Set(filteredStudents.map((s: any) => s.id));

    const filteredTests = tests.filter((t: any) => t.batch === selectedBatch && (!selectedCourse || t.course === selectedCourse));
    const tIds = new Set(filteredTests.map((t: any) => t.id));

    const filteredResults = results.filter((r: any) => sIds.has(r.studentId) && tIds.has(r.testId));

    const studentScores: any = {};
    filteredStudents.forEach((s: any) => studentScores[s.id] = { name: s.fullName, score: 0, max: 0 });

    let totalScore = 0, totalMax = 0, passCount = 0;
    filteredResults.forEach((r: any) => {
        totalScore += r.score;
        totalMax += r.totalQuestions;
        studentScores[r.studentId].score += r.score;
        studentScores[r.studentId].max += r.totalQuestions;
        if (r.totalQuestions > 0 && (r.score/r.totalQuestions)*100 >= 40) passCount++;
    });

    const avg = totalMax > 0 ? Math.round((totalScore/totalMax)*100) : 0;
    const passPerc = filteredResults.length > 0 ? Math.round((passCount/filteredResults.length)*100) : 0;

    let present = 0, totalLecs = 0;
    attendance.forEach((a: any) => {
      if (a.records) {
        Object.entries(a.records).forEach(([sId, status]) => {
          if (sIds.has(sId)) {
            totalLecs++;
            if (status === 'present') present++;
          }
        });
      }
    });
    const attPerc = totalLecs > 0 ? Math.round((present / totalLecs) * 100) : 0;

    const rankList = Object.keys(studentScores)
        .map(id => {
            const ss = studentScores[id];
            return { name: ss.name, perc: ss.max > 0 ? Math.round((ss.score/ss.max)*100) : 0 };
        })
        .filter(s => s.perc > 0)
        .sort((a, b) => b.perc - a.perc);

    const top5 = rankList.slice(0, 5);
    const highestP = rankList.length > 0 ? rankList[0].name : '-';
    const lowestP = rankList.length > 0 ? rankList[rankList.length - 1].name : '-';

    return { 
        students: filteredStudents.length, 
        avg, attPerc, passPerc, highestP, lowestP, top5, empty: false 
    };
  }, [selectedBatch, selectedCourse, students, tests, results, attendance]);

  const exportToPDF = () => {
    if (!batchData || batchData.empty) return;
    const doc = new jsPDF();
    doc.text(`Batch Performance Report - ${selectedBatch}`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Students: ${batchData.students} | Average Score: ${batchData.avg}% | Attendance: ${batchData.attPerc}%`, 14, 22);
    
    autoTable(doc, {
      startY: 28,
      head: [['Rank', 'Student', 'Average Score']],
      body: batchData.top5.map((r: any, i: number) => [i + 1, r.name, `${r.perc}%`]),
      theme: 'grid', styles: { fontSize: 9 }, headStyles: { fillColor: [14, 165, 233] }
    });
    doc.save(`Batch_Report_${selectedBatch}.pdf`);
  };

  if (!selectedBatch) return <div className="text-center p-12 text-slate-400 bg-slate-900 rounded-3xl">Please select a batch to view the report.</div>;
  if (batchData?.empty) return <div className="text-center p-12 text-slate-400 bg-slate-900 rounded-3xl">No data available for the selected period.</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-3 mb-4">
        <button onClick={exportToPDF} className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-medium transition-colors">
          <FileText className="w-4 h-4" /> PDF
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard title="Total Students" value={batchData?.students} icon={<Users className="w-6 h-6 text-indigo-400"/>} color="indigo" />
        <StatCard title="Batch Average" value={`${batchData?.avg}%`} icon={<Award className="w-6 h-6 text-amber-400"/>} color="amber" />
        <StatCard title="Attendance" value={`${batchData?.attPerc}%`} icon={<CheckSquare className="w-6 h-6 text-sky-400"/>} color="sky" />
        <StatCard title="Highest Performer" value={batchData?.highestP} icon={<TrendingUp className="w-6 h-6 text-emerald-400"/>} color="emerald" />
        <StatCard title="Lowest Performer" value={batchData?.lowestP} icon={<TrendingUp className="w-6 h-6 text-rose-400 transform rotate-180"/>} color="rose" />
        <StatCard title="Pass %" value={`${batchData?.passPerc}%`} icon={<CheckSquare className="w-6 h-6 text-green-400"/>} color="green" />
      </div>

      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
        <h2 className="font-bold text-white mb-4 flex items-center gap-2"><Award className="text-amber-400 w-5 h-5"/> Top 5 Students</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800">
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Rank</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Student Name</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase text-center">Average Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {batchData?.top5.map((row: any, i: number) => (
                <tr key={i} className="hover:bg-slate-800/50">
                  <td className="p-4 text-sm font-bold text-amber-400">#{i + 1}</td>
                  <td className="p-4 text-sm font-medium text-white">{row.name}</td>
                  <td className="p-4 text-sm text-sky-400 font-bold text-center">{row.perc}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- REPORT 6: STUDENT REPORT CARD ---
const ReportCard = ({ filters, data }: any) => {
  const { students, tests, results, attendance } = data;
  const { selectedStudent, selectedTerm, selectedYear } = filters;

  const getGrade = (perc: number) => {
    if (perc >= 90) return 'A+';
    if (perc >= 80) return 'A';
    if (perc >= 70) return 'B+';
    if (perc >= 60) return 'B';
    if (perc >= 50) return 'C';
    return 'Needs Improvement';
  };

  const displayStudent = useMemo(() => {
    if (!selectedStudent || selectedStudent.length < 3) return null;
    const term = selectedStudent.toLowerCase();
    const st = students.find((s: any) => s.fullName.toLowerCase().includes(term) || (s.admissionNumber && s.admissionNumber.toLowerCase().includes(term)));
    return st;
  }, [students, selectedStudent]);

  const reportCardData = useMemo(() => {
    if (!displayStudent) return null;
    const sId = displayStudent.id;
    const myResults = results.filter((r: any) => r.studentId === sId);
    
    const subMap: any = {};
    myResults.forEach((r: any) => {
      const t = tests.find((x: any) => x.id === r.testId);
      if (t) {
        if (!subMap[t.subject]) subMap[t.subject] = { tests: 0, score: 0, max: 0 };
        subMap[t.subject].tests++;
        subMap[t.subject].score += r.score;
        subMap[t.subject].max += r.totalQuestions;
      }
    });

    let totalScore = 0, totalMax = 0;
    const rows = Object.keys(subMap).map(sub => {
      const s = subMap[sub];
      totalScore += s.score;
      totalMax += s.max;
      const perc = s.max > 0 ? (s.score / s.max) * 100 : 0;
      return {
        subject: sub,
        tests: s.tests,
        average: Math.round(perc),
        grade: getGrade(perc)
      };
    });

    const overallPerc = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;
    const overallGrade = getGrade(overallPerc);

    let present = 0, totalLecs = 0;
    attendance.forEach((a: any) => {
      if (a.records && a.records[sId]) {
        totalLecs++;
        if (a.records[sId] === 'present') present++;
      }
    });
    const attPerc = totalLecs > 0 ? Math.round((present / totalLecs) * 100) : 0;

    return { rows, overallPerc, overallGrade, attPerc };
  }, [displayStudent, results, tests, attendance]);

  const exportToPDF = () => {
    if (!displayStudent || !reportCardData) return;
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("COACHING INSTITUTE", 105, 20, { align: "center" });
    
    doc.setFontSize(14);
    doc.text("STUDENT REPORT CARD", 105, 30, { align: "center" });
    
    // Student Info
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Student Name: ${displayStudent.fullName}`, 14, 45);
    doc.text(`Admission Number: ${displayStudent.admissionNumber}`, 14, 52);
    doc.text(`Course: ${displayStudent.courseEnrolled}`, 14, 59);
    doc.text(`Batch: ${displayStudent.batch}`, 14, 66);
    
    doc.text(`Academic Year: ${selectedYear}`, 120, 45);
    doc.text(`Term: ${selectedTerm}`, 120, 52);
    doc.text(`Attendance: ${reportCardData.attPerc}%`, 120, 59);

    // Table
    autoTable(doc, {
      startY: 75,
      head: [['Subject', 'Tests', 'Average %', 'Grade']],
      body: reportCardData.rows.map((r: any) => [r.subject, r.tests, r.average, r.grade]),
      theme: 'grid', styles: { fontSize: 10, cellPadding: 3 }, headStyles: { fillColor: [30, 41, 59] }
    });
    
    const finalY = (doc as any).lastAutoTable?.finalY || 95;
    doc.setFont("helvetica", "bold");
    doc.text(`Overall Percentage: ${reportCardData.overallPerc}%`, 14, finalY);
    doc.text(`Overall Grade: ${reportCardData.overallGrade}`, 120, finalY);

    const remarks = reportCardData.overallPerc >= 80 ? 'Excellent performance! Keep it up.' : reportCardData.overallPerc >= 60 ? 'Good performance. Work hard for better grades.' : 'Needs significant improvement.';
    doc.text(`Final Remarks: ${remarks}`, 14, finalY + 10);

    doc.save(`Report_Card_${displayStudent.fullName}.pdf`);
  };

  if (!selectedStudent || selectedStudent.length < 3) return <div className="text-center p-12 text-slate-400 bg-slate-900 rounded-3xl">Please type at least 3 characters to search for a student.</div>;
  if (!displayStudent) return <div className="text-center p-12 text-slate-400 bg-slate-900 rounded-3xl">No student found matching "{selectedStudent}".</div>;
  if (!reportCardData) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-end gap-3 mb-4">
        <button onClick={exportToPDF} className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-colors">
          <FileText className="w-5 h-5" /> Generate Formal PDF
        </button>
      </div>

      <div className="bg-white p-8 rounded-xl text-slate-900 shadow-xl print-container">
        <div className="text-center mb-8 border-b-2 border-slate-200 pb-6">
          <h1 className="text-3xl font-bold text-slate-900 uppercase tracking-widest">Coaching Institute</h1>
          <h2 className="text-xl font-medium text-slate-600 mt-2">STUDENT REPORT CARD</h2>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
          <div>
            <p><span className="font-bold w-32 inline-block">Student Name:</span> {displayStudent.fullName}</p>
            <p><span className="font-bold w-32 inline-block">Admission No:</span> {displayStudent.admissionNumber}</p>
            <p><span className="font-bold w-32 inline-block">Course:</span> {displayStudent.courseEnrolled}</p>
            <p><span className="font-bold w-32 inline-block">Batch:</span> {displayStudent.batch}</p>
          </div>
          <div>
            <p><span className="font-bold w-32 inline-block">Academic Year:</span> {selectedYear}</p>
            <p><span className="font-bold w-32 inline-block">Term:</span> {selectedTerm}</p>
            <p><span className="font-bold w-32 inline-block">Attendance:</span> {reportCardData.attPerc}%</p>
          </div>
        </div>

        <table className="w-full text-left border-collapse mb-8 border border-slate-300">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-300">
              <th className="p-3 text-sm font-bold border-r border-slate-300">Subject</th>
              <th className="p-3 text-sm font-bold border-r border-slate-300 text-center">Tests</th>
              <th className="p-3 text-sm font-bold border-r border-slate-300 text-center">Average</th>
              <th className="p-3 text-sm font-bold text-center">Grade</th>
            </tr>
          </thead>
          <tbody>
            {reportCardData.rows.map((row: any, i: number) => (
              <tr key={i} className="border-b border-slate-300">
                <td className="p-3 text-sm border-r border-slate-300">{row.subject}</td>
                <td className="p-3 text-sm border-r border-slate-300 text-center">{row.tests}</td>
                <td className="p-3 text-sm border-r border-slate-300 text-center">{row.average}%</td>
                <td className="p-3 text-sm text-center font-bold">{row.grade}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <p className="text-lg"><span className="font-bold">Overall Percentage:</span> {reportCardData.overallPerc}%</p>
            <p className="text-lg"><span className="font-bold">Overall Grade:</span> <span className="text-indigo-600 font-bold">{reportCardData.overallGrade}</span></p>
          </div>
          <div className="pt-4 border-t border-slate-200">
            <p><span className="font-bold">Final Remarks:</span> {reportCardData.overallPerc >= 80 ? 'Excellent performance! Keep it up.' : reportCardData.overallPerc >= 60 ? 'Good performance. Work hard for better grades.' : 'Needs significant improvement.'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- REPORT 7: NEEDS IMPROVEMENT STUDENTS ---
const NeedsImprovement = ({ filters, data }: any) => {
  const { students, tests, results, attendance } = data;
  const { selectedBatch } = filters;

  const needyStudents = useMemo(() => {
    const list: any[] = [];
    
    students.forEach((s: any) => {
      if (selectedBatch && s.batch !== selectedBatch) return;

      const myResults = results.filter((r: any) => r.studentId === s.id);
      let totalScore = 0, totalMax = 0;
      myResults.forEach((r: any) => {
        totalScore += r.score;
        totalMax += r.totalQuestions;
      });
      const avg = totalMax > 0 ? Math.round((totalScore/totalMax)*100) : 100; // if no tests, assume 100 so they don't get flagged for score

      let present = 0, totalLecs = 0;
      attendance.forEach((a: any) => {
        if (a.records && a.records[s.id]) {
          totalLecs++;
          if (a.records[s.id] === 'present') present++;
        }
      });
      const att = totalLecs > 0 ? Math.round((present/totalLecs)*100) : 100;

      if (avg < 40 || att < 75) {
        let reason = '';
        if (avg < 40 && att < 75) reason = 'Low Score & Attendance';
        else if (avg < 40) reason = 'Low Score (<40%)';
        else reason = 'Low Attendance (<75%)';

        list.push({
          name: s.fullName,
          batch: s.batch,
          avg,
          att,
          reason
        });
      }
    });

    return list;
  }, [students, tests, results, attendance, selectedBatch]);

  if (needyStudents.length === 0) return <div className="text-center p-12 text-slate-400 bg-slate-900 rounded-3xl">No students found needing immediate attention. Great!</div>;

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-rose-500" />
            <h2 className="font-bold text-white text-lg">Students Needing Attention</h2>
        </div>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-950 border-b border-slate-800">
            <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Student Name</th>
            <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Batch</th>
            <th className="p-4 text-xs font-semibold text-slate-400 uppercase text-center">Avg Score</th>
            <th className="p-4 text-xs font-semibold text-slate-400 uppercase text-center">Attendance</th>
            <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Reason</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
          {needyStudents.map((row: any, i: number) => (
            <tr key={i} className="hover:bg-slate-800/50">
              <td className="p-4 text-sm font-medium text-white">{row.name}</td>
              <td className="p-4 text-sm text-slate-400">{row.batch}</td>
              <td className="p-4 text-sm text-center font-bold text-rose-400">{row.avg === 100 ? 'N/A' : `${row.avg}%`}</td>
              <td className="p-4 text-sm text-center font-bold text-amber-400">{row.att === 100 ? 'N/A' : `${row.att}%`}</td>
              <td className="p-4 text-sm">
                <span className="bg-rose-900/40 text-rose-400 px-3 py-1 rounded-full text-xs font-bold">{row.reason}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
