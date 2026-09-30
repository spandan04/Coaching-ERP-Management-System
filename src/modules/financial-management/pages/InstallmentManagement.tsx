import { useState, useEffect, type FormEvent } from 'react';
import { getInstallments, getStudentFees, addInstallment, updateInstallment, deleteInstallment } from '../services/feeService';
import { Installment, StudentFee } from '../../../types/index';
import { Plus, Trash2, Calendar, CheckCircle2 } from 'lucide-react';

export const InstallmentManagement = () => {
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [assignments, setAssignments] = useState<StudentFee[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [installmentNumber, setInstallmentNumber] = useState(1);
  const [dueDate, setDueDate] = useState('');
  const [amount, setAmount] = useState<number | ''>('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const instList = await getInstallments();
      const assignList = await getStudentFees();

      // Enhance installments with student info for display
      const enhancedInstallments = instList.map(inst => {
        const assignment = assignList.find(a => a.studentId === inst.studentId);
        return {
          ...inst,
          studentName: assignment ? assignment.studentName : 'Unknown',
          courseName: assignment ? assignment.courseName : 'Unknown',
        };
      });

      setInstallments(enhancedInstallments);
      setAssignments(assignList);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const assignment = assignments.find(a => a.id === selectedAssignmentId);
    if (!assignment || !amount || !dueDate) return;

    try {
      await addInstallment({
        studentId: assignment.studentId,
        installmentNumber,
        dueDate: new Date(dueDate).toISOString(),
        amount: Number(amount),
        status: 'Pending'
      });

      setIsFormOpen(false);
      setSelectedAssignmentId('');
      setAmount('');
      setDueDate('');
      setInstallmentNumber(1);
      fetchData();
    } catch (error) {
      console.error("Error creating installment:", error);
    }
  };

  const handleMarkPaid = async (id: string) => {
    if (window.confirm("Mark this installment as paid? This does NOT automatically create a payment receipt.")) {
      try {
        await updateInstallment(id, { status: 'Paid' });
        fetchData();
      } catch (error) {
        console.error("Error updating installment status:", error);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this installment plan?")) {
      try {
        await deleteInstallment(id);
        fetchData();
      } catch (error) {
        console.error("Error deleting installment:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Installments</h1>
          <p className="text-slate-400 mt-2">Manage fee installment schedules for students</p>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Installment
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">New Installment Plan</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2 lg:col-span-2">
                <label className="text-sm font-medium text-slate-300">Select Student (with Fee Assignment) *</label>
                <select
                  required
                  value={selectedAssignmentId}
                  onChange={(e) => setSelectedAssignmentId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Choose student assignment --</option>
                  {assignments.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.studentName} - {a.courseName} (Bal: ₹{a.remainingBalance})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Installment No. *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={installmentNumber}
                  onChange={(e) => setInstallmentNumber(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-2 lg:col-span-2">
                <label className="text-sm font-medium text-slate-300">Due Date *</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl flex items-center gap-2 transition-colors"
              >
                <Calendar className="w-5 h-5" />
                Schedule Installment
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950/50 text-slate-400 text-sm border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">Student Name</th>
                <th className="px-6 py-4 font-medium">Course</th>
                <th className="px-6 py-4 font-medium">Installment #</th>
                <th className="px-6 py-4 font-medium">Due Date</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">Loading installments...</td>
                </tr>
              ) : installments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">No installments scheduled.</td>
                </tr>
              ) : (
                installments.map((inst: any) => {
                  const dateObj = inst.dueDate?.toDate ? inst.dueDate.toDate() : new Date(inst.dueDate);
                  const isOverdue = inst.status === 'Pending' && dateObj < new Date();

                  return (
                    <tr key={inst.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 text-white font-medium">{inst.studentName}</td>
                      <td className="px-6 py-4 text-slate-300">{inst.courseName}</td>
                      <td className="px-6 py-4 text-slate-400">#{inst.installmentNumber}</td>
                      <td className="px-6 py-4">
                        <span className={`font-medium ${isOverdue ? 'text-rose-400' : 'text-slate-300'}`}>
                          {dateObj.toLocaleDateString()}
                        </span>
                        {isOverdue && <span className="ml-2 text-xs text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full">Overdue</span>}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-300">₹ {inst.amount}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          inst.status === 'Paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {inst.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {inst.status === 'Pending' && (
                          <button 
                            onClick={() => handleMarkPaid(inst.id)}
                            className="p-2 text-emerald-400 hover:text-emerald-300 transition-colors inline-block bg-emerald-500/10 rounded-lg hover:bg-emerald-500/20"
                            title="Mark as Paid"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(inst.id)}
                          className="p-2 text-rose-400 hover:text-rose-300 transition-colors inline-block ml-2 bg-rose-500/10 rounded-lg hover:bg-rose-500/20"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
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
