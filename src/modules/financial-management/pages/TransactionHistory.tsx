import { useState, useEffect } from 'react';
import { getPayments } from '../services/feeService';
import { Payment } from '../../../types/index';
import { Search, Download, Filter } from 'lucide-react';
import * as XLSX from 'xlsx';

export const TransactionHistory = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('');
  
  const fetchPayments = async () => {
    setLoading(true);
    try {
      // Note: requires composite index in firestore if we use complex queries. 
      // For simplicity, fetch all and filter in memory for smaller datasets.
      setPayments(await getPayments());
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter(p => {
    const matchesSearch = p.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMode = filterMode === '' || p.paymentMode === filterMode;
    return matchesSearch && matchesMode;
  });

  const handleExportExcel = () => {
    const exportData = filteredPayments.map(p => {
      const d = p.date?.toDate ? p.date.toDate() : new Date(p.date || Date.now());
      return {
        'Receipt No': p.receiptNumber,
        'Date': d.toLocaleDateString(),
        'Student Name': p.studentName,
        'Payment Mode': p.paymentMode,
        'Amount (INR)': p.amount,
        'Transaction ID': p.transactionId || 'N/A',
        'Remarks': p.remarks || 'N/A'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
    XLSX.writeFile(workbook, `Transactions_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Transaction History</h1>
          <p className="text-slate-400 mt-2">View all fee payments and export reports</p>
        </div>
        <button
          onClick={handleExportExcel}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-emerald-900/20"
        >
          <Download className="w-5 h-5" />
          Export to Excel
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student or receipt..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="w-full md:w-64 relative">
            <Filter className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 appearance-none"
            >
              <option value="">All Payment Modes</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950/50 text-slate-400 text-sm border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">Receipt No.</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Student Name</th>
                <th className="px-6 py-4 font-medium">Mode</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Trans. ID / Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading transactions...</td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No transactions found.</td>
                </tr>
              ) : (
                filteredPayments.map((payment) => {
                  const dateObj = payment.date?.toDate ? payment.date.toDate() : new Date(payment.date || Date.now());
                  return (
                    <tr key={payment.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 text-indigo-400 font-medium text-sm">{payment.receiptNumber}</td>
                      <td className="px-6 py-4 text-slate-400 text-sm">{dateObj.toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-white font-medium">{payment.studentName}</td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-xs font-medium">
                          {payment.paymentMode}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-400">₹ {payment.amount}</td>
                      <td className="px-6 py-4 text-slate-500 text-sm">{payment.transactionId || '-'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
