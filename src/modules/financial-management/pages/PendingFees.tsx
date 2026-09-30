import { useState, useEffect } from 'react';
import { getStudentFees } from '../services/feeService';
import { StudentFee } from '../../../types/index';
import { Search, Download, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

export const PendingFees = () => {
  const [assignments, setAssignments] = useState<StudentFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPending = async () => {
    setLoading(true);
    try {
      const list = await getStudentFees();
      
      // Filter only those with remaining balance > 0
      setAssignments(list.filter(a => a.remainingBalance > 0));
    } catch (error) {
      console.error('Error fetching pending fees:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const filteredAssignments = assignments.filter(a => 
    a.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.courseName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPendingAmount = assignments.reduce((acc, curr) => acc + curr.remainingBalance, 0);

  const handleExportExcel = () => {
    const exportData = filteredAssignments.map(a => ({
      'Student Name': a.studentName,
      'Course': a.courseName,
      'Batch': a.batch,
      'Total Fees (INR)': a.totalFees,
      'Paid Amount (INR)': a.amountPaid,
      'Pending Amount (INR)': a.remainingBalance,
      'Status': a.paymentStatus
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pending_Dues");
    XLSX.writeFile(workbook, `Pending_Dues_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Pending Dues</h1>
          <p className="text-slate-400 mt-2">Track and export students with outstanding fee balances</p>
        </div>
        <button
          onClick={handleExportExcel}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-emerald-900/20"
        >
          <Download className="w-5 h-5" />
          Export Report
        </button>
      </div>

      <div className="bg-rose-500/10 border border-rose-500/20 rounded-3xl p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-500/20 rounded-2xl flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <p className="text-slate-400 font-medium">Total Outstanding Amount</p>
            <h2 className="text-2xl font-bold text-white mt-1">₹ {totalPendingAmount.toLocaleString()}</h2>
          </div>
        </div>
        <div className="text-right">
          <p className="text-slate-400 font-medium">Students with Dues</p>
          <h2 className="text-2xl font-bold text-white mt-1">{assignments.length}</h2>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <div className="relative mb-6 max-w-md">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950/50 text-slate-400 text-sm border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">Student Name</th>
                <th className="px-6 py-4 font-medium">Course & Batch</th>
                <th className="px-6 py-4 font-medium">Total Fees</th>
                <th className="px-6 py-4 font-medium">Amount Paid</th>
                <th className="px-6 py-4 font-medium">Pending Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading pending dues...</td>
                </tr>
              ) : filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No pending dues found! Great job.</td>
                </tr>
              ) : (
                filteredAssignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 text-white font-medium">{assignment.studentName}</td>
                    <td className="px-6 py-4 text-slate-300">
                      <div>{assignment.courseName}</div>
                      <div className="text-xs text-slate-500">{assignment.batch}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-300">₹ {assignment.totalFees}</td>
                    <td className="px-6 py-4 font-bold text-emerald-400">₹ {assignment.amountPaid}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-rose-400 text-lg bg-rose-500/10 px-3 py-1 rounded-lg">
                        ₹ {assignment.remainingBalance}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
