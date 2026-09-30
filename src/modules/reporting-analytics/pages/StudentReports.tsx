import { useState, useMemo, useEffect } from 'react';
import { getStudents, getStudentDashboardStats } from '../../student-management/services/studentService';
import { Search, Download, FileText, Users, UserCheck, Archive } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const StudentReports = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [batchFilter, setBatchFilter] = useState('');

  useEffect(() => {
    const fetchInit = async () => {
      const stds = await getStudents();
      setStudents([...stds.active, ...stds.archived]);
      const st = await getStudentDashboardStats();
      setStats(st);
    };
    fetchInit();
  }, []);

  const courses = Array.from(new Set(students.map((s: any) => s.courseEnrolled))).filter(Boolean);
  const batches = Array.from(new Set(students.map((s: any) => s.batch))).filter(Boolean);

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCourse = courseFilter ? student.courseEnrolled === courseFilter : true;
      const matchesBatch = batchFilter ? student.batch === batchFilter : true;
      
      return matchesSearch && matchesCourse && matchesBatch;
    });
  }, [students, searchTerm, courseFilter, batchFilter]);

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Student Report', 14, 15);
    
    const tableData = filteredStudents.map((s, index) => [
      index + 1,
      s.admissionNumber,
      s.fullName,
      s.courseEnrolled,
      s.batch,
      s.mobileNumber,
      s.status
    ]);

    autoTable(doc, {
      startY: 20,
      head: [['#', 'Admission No', 'Name', 'Course', 'Batch', 'Mobile', 'Status']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [99, 102, 241] }
    });

    doc.save('student_report.pdf');
  };

  const exportToExcel = () => {
    const exportData = filteredStudents.map((s, index) => ({
      'S.No': index + 1,
      'Admission No': s.admissionNumber,
      'Student Name': s.fullName,
      'Course': s.courseEnrolled,
      'Batch': s.batch,
      'Mobile Number': s.mobileNumber,
      'Status': s.status
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    XLSX.writeFile(workbook, 'student_report.xlsx');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight font-heading">Student Reports</h1>
          <p className="mt-2 text-slate-400 font-medium text-sm">View, filter, and export student data.</p>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex items-center gap-4">
          <div className="p-4 bg-indigo-900/40 rounded-2xl text-indigo-400"><Users className="w-8 h-8" /></div>
          <div>
            <p className="text-slate-400 text-sm font-medium">Total Students</p>
            <p className="text-3xl font-bold text-white">{stats?.totalStudents || 0}</p>
          </div>
        </div>
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex items-center gap-4">
          <div className="p-4 bg-emerald-900/40 rounded-2xl text-emerald-400"><UserCheck className="w-8 h-8" /></div>
          <div>
            <p className="text-slate-400 text-sm font-medium">Active Students</p>
            <p className="text-3xl font-bold text-white">{stats?.activeStudents || 0}</p>
          </div>
        </div>
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex items-center gap-4">
          <div className="p-4 bg-slate-800/80 rounded-2xl text-slate-400"><Archive className="w-8 h-8" /></div>
          <div>
            <p className="text-slate-400 text-sm font-medium">Archived Students</p>
            <p className="text-3xl font-bold text-white">{stats?.archivedStudents || 0}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or admission no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="">All Courses</option>
            {courses.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="">All Batches</option>
            {batches.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800">
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Admission No</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Name</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Course</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Batch</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 text-sm font-medium text-white">{student.admissionNumber}</td>
                    <td className="p-4 text-sm text-slate-300">{student.fullName}</td>
                    <td className="p-4 text-sm text-slate-400">{student.courseEnrolled}</td>
                    <td className="p-4 text-sm text-slate-400">{student.batch}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        student.status === 'active' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No students found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
