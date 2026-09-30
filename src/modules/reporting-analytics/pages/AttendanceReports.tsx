import { useState, useEffect, useMemo } from 'react';
import { getStudents } from '../../student-management/services/studentService';
import { getAttendanceRecords } from '../../academic-learning/services/academicService';
import { Search, Download, FileText, CheckSquare } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const AttendanceReports = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceDocs, setAttendanceDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');

  const batches = Array.from(new Set(students.map(s => s.batch))).filter(Boolean);
  
  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const studentData = await getStudents();
        setStudents(studentData.active);
        const docs = await getAttendanceRecords();
        setAttendanceDocs(docs);
      } catch (error) {
        console.error("Error fetching attendance:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  const reportData = useMemo(() => {
    let filteredAttendance = attendanceDocs;

    if (batchFilter) {
      filteredAttendance = filteredAttendance.filter(doc => doc.batch === batchFilter);
    }

    if (monthFilter) {
      filteredAttendance = filteredAttendance.filter(doc => {
        if (!doc.date) return false;
        const dateObj = new Date(doc.date);
        const monthStr = (dateObj.getMonth() + 1).toString().padStart(2, '0');
        return monthStr === monthFilter;
      });
    }

    const aggregated: Record<string, { present: number, absent: number }> = {};

    filteredAttendance.forEach(doc => {
      const records = doc.records || {};
      Object.entries(records).forEach(([studentId, status]) => {
        if (!aggregated[studentId]) {
          aggregated[studentId] = { present: 0, absent: 0 };
        }
        if (status === 'present') aggregated[studentId].present += 1;
        if (status === 'absent') aggregated[studentId].absent += 1;
      });
    });

    const data = students
      .filter(s => {
        const matchesSearch = s.fullName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesBatch = batchFilter ? s.batch === batchFilter : true;
        return matchesSearch && matchesBatch;
      })
      .map(s => {
        const stats = aggregated[s.id!] || { present: 0, absent: 0 };
        const total = stats.present + stats.absent;
        const percentage = total > 0 ? Math.round((stats.present / total) * 100) : 0;
        
        return {
          id: s.id,
          name: s.fullName,
          admissionNo: s.admissionNumber,
          batch: s.batch,
          present: stats.present,
          absent: stats.absent,
          total,
          percentage
        };
      })
      .filter(s => s.total > 0); // Only show students who have attendance records matching the filters

    return data;
  }, [students, attendanceDocs, batchFilter, monthFilter, searchTerm]);

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Attendance Report', 14, 15);
    
    const tableData = reportData.map((row, index) => [
      index + 1,
      row.name,
      row.batch,
      row.present.toString(),
      row.absent.toString(),
      `${row.percentage}%`
    ]);

    autoTable(doc, {
      startY: 20,
      head: [['#', 'Student Name', 'Batch', 'Total Present', 'Total Absent', 'Attendance %']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [16, 185, 129] }
    });

    doc.save('attendance_report.pdf');
  };

  const exportToExcel = () => {
    const exportData = reportData.map((row, index) => ({
      'S.No': index + 1,
      'Student Name': row.name,
      'Batch': row.batch,
      'Total Present': row.present,
      'Total Absent': row.absent,
      'Attendance %': row.percentage
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
    XLSX.writeFile(workbook, 'attendance_report.xlsx');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight font-heading">Attendance Reports</h1>
          <p className="mt-2 text-slate-400 font-medium text-sm">Analyze student attendance records.</p>
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

      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <select
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="">All Batches</option>
            {batches.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="">All Months</option>
            {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800">
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Student Name</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Batch</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Total Present</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Total Absent</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {reportData.length > 0 ? (
                  reportData.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 text-sm font-medium text-white">{row.name}</td>
                      <td className="p-4 text-sm text-slate-400">{row.batch}</td>
                      <td className="p-4 text-sm text-emerald-400 font-medium">{row.present}</td>
                      <td className="p-4 text-sm text-rose-400 font-medium">{row.absent}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          row.percentage >= 75 ? 'bg-emerald-900/40 text-emerald-400' :
                          row.percentage >= 50 ? 'bg-amber-900/40 text-amber-400' :
                          'bg-rose-900/40 text-rose-400'
                        }`}>
                          {row.percentage}%
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      No attendance records found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
