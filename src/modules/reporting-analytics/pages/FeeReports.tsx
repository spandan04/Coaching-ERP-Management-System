import { useState, useEffect, useMemo } from 'react';
import { getStudentFees, getPayments } from '../../financial-management/services/feeService';
import { Search, Download, FileText, IndianRupee, TrendingUp, AlertCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const FeeReports = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [studentFees, setStudentFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const feesList = await getStudentFees();
        setStudentFees(feesList);

        const paymentsList = await getPayments();
        setPayments(paymentsList);
      } catch (error) {
        console.error("Error fetching fee data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = useMemo(() => {
    let totalCollected = 0;
    let pendingFees = 0;
    let totalFees = 0;

    studentFees.forEach(fee => {
      totalFees += fee.totalFees || 0;
      pendingFees += fee.remainingBalance || 0;
    });

    payments.forEach(p => {
      totalCollected += p.amount || 0;
    });

    return { totalCollected, pendingFees, totalFees };
  }, [studentFees, payments]);

  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const matchesSearch = payment.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            payment.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesDate = true;
      if (dateFilter) {
        const pDate = payment.date?.toDate ? payment.date.toDate() : new Date(payment.date || Date.now());
        const filterDateStr = new Date(dateFilter).toISOString().split('T')[0];
        const pDateStr = pDate.toISOString().split('T')[0];
        matchesDate = filterDateStr === pDateStr;
      }

      return matchesSearch && matchesDate;
    }).sort((a, b) => {
      const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date || 0);
      const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date || 0);
      return dateB.getTime() - dateA.getTime();
    });
  }, [payments, searchTerm, dateFilter]);

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Fee Collection Report', 14, 15);
    
    const tableData = filteredPayments.map((p, index) => {
      const date = p.date?.toDate ? p.date.toDate() : new Date(p.date || Date.now());
      return [
        index + 1,
        date.toLocaleDateString(),
        p.receiptNumber || 'N/A',
        p.studentName,
        p.paymentMode,
        `Rs. ${p.amount}`
      ];
    });

    (doc as any).autoTable({
      startY: 20,
      head: [['#', 'Date', 'Receipt No', 'Student Name', 'Mode', 'Amount']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [217, 119, 6] } // amber-600
    });

    doc.save('fee_report.pdf');
  };

  const exportToExcel = () => {
    const exportData = filteredPayments.map((p, index) => {
      const date = p.date?.toDate ? p.date.toDate() : new Date(p.date || Date.now());
      return {
        'S.No': index + 1,
        'Date': date.toLocaleDateString(),
        'Receipt No': p.receiptNumber || 'N/A',
        'Student Name': p.studentName,
        'Payment Mode': p.paymentMode,
        'Amount': p.amount
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Fee Collections');
    XLSX.writeFile(workbook, 'fee_report.xlsx');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight font-heading">Fee Reports</h1>
          <p className="mt-2 text-slate-400 font-medium text-sm">Track collections, dues, and payment history.</p>
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
          <div className="p-4 bg-emerald-900/40 rounded-2xl text-emerald-400"><TrendingUp className="w-8 h-8" /></div>
          <div>
            <p className="text-slate-400 text-sm font-medium">Total Fees Collected</p>
            <p className="text-3xl font-bold text-white">₹{stats.totalCollected.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex items-center gap-4">
          <div className="p-4 bg-rose-900/40 rounded-2xl text-rose-400"><AlertCircle className="w-8 h-8" /></div>
          <div>
            <p className="text-slate-400 text-sm font-medium">Pending Fees</p>
            <p className="text-3xl font-bold text-white">₹{stats.pendingFees.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex items-center gap-4">
          <div className="p-4 bg-indigo-900/40 rounded-2xl text-indigo-400"><IndianRupee className="w-8 h-8" /></div>
          <div>
            <p className="text-slate-400 text-sm font-medium">Expected Total Fees</p>
            <p className="text-3xl font-bold text-white">₹{stats.totalFees.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name or receipt no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>
          <div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
      ) : (
        <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800">
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Date</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Receipt No</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Student Name</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Mode</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => {
                    const date = payment.date?.toDate ? payment.date.toDate() : new Date(payment.date || Date.now());
                    return (
                      <tr key={payment.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="p-4 text-sm text-slate-400">{date.toLocaleDateString()}</td>
                        <td className="p-4 text-sm text-slate-400">{payment.receiptNumber || 'N/A'}</td>
                        <td className="p-4 text-sm font-medium text-white">{payment.studentName}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                            {payment.paymentMode}
                          </span>
                        </td>
                        <td className="p-4 text-sm font-bold text-emerald-400">
                          ₹{payment.amount.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      No payments found matching your filters.
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
