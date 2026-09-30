import { useState, useEffect, type FormEvent } from 'react';
import { getFeeStructures, getStudentFees, addStudentFee, deleteStudentFee } from '../services/feeService';
import { getStudents } from '../../student-management/services/studentService';
import { FeeStructure, StudentFee } from '../../../types/index';
import { Plus, Search, UserCheck } from 'lucide-react';

export const StudentFeeAssignment = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [studentFees, setStudentFees] = useState<StudentFee[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Assignment Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [selectedStructureId, setSelectedStructureId] = useState('');
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Fetch Students
      const studentsList = await getStudents();
      setStudents(studentsList.active);

      // Fetch Fee Structures
      setFeeStructures(await getFeeStructures());

      // Fetch existing assignments
      setStudentFees(await getStudentFees());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleAssignFee = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedStructureId) return;

    const structure = feeStructures.find(s => s.id === selectedStructureId);
    if (!structure) return;

    try {
      // Check if student already has assigned fee for this course
      // Simple logic: we just add a new assignment for now.

      const newAssignment = {
        studentId: selectedStudent.id,
        studentName: selectedStudent.fullName || 'Unknown Student',
        feeStructureId: structure.id,
        courseName: structure.courseName,
        batch: structure.batch,
        totalFees: structure.totalFees,
        amountPaid: 0,
        remainingBalance: structure.totalFees,
        paymentStatus: 'Pending',
      };
      await addStudentFee(newAssignment);
      setIsModalOpen(false);
      setSelectedStudent(null);
      setSelectedStructureId('');
      fetchInitialData(); // Refresh list
    } catch (error) {
      console.error('Error assigning fee:', error);
    }
  };

  const filteredAssignments = studentFees.filter(assignment => 
    assignment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    assignment.courseName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Student Fee Assignment</h1>
          <p className="text-slate-400 mt-2">Assign fee structures to students and view their balance</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Assign Fee
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950/50 text-slate-400 text-sm border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">Student Name</th>
                <th className="px-6 py-4 font-medium">Course & Batch</th>
                <th className="px-6 py-4 font-medium">Total Fees</th>
                <th className="px-6 py-4 font-medium">Paid</th>
                <th className="px-6 py-4 font-medium">Balance</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">Loading assignments...</td>
                </tr>
              ) : filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">No fee assignments found.</td>
                </tr>
              ) : (
                filteredAssignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 text-white font-medium">{assignment.studentName}</td>
                    <td className="px-6 py-4 text-slate-300">
                      <div>{assignment.courseName}</div>
                      <div className="text-sm text-slate-500">{assignment.batch}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-300">₹ {assignment.totalFees}</td>
                    <td className="px-6 py-4 font-bold text-emerald-400">₹ {assignment.amountPaid}</td>
                    <td className="px-6 py-4 font-bold text-rose-400">₹ {assignment.remainingBalance}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        assignment.paymentStatus === 'Paid' ? 'bg-emerald-500/20 text-emerald-400' :
                        assignment.paymentStatus === 'Partially Paid' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-rose-500/20 text-rose-400'
                      }`}>
                        {assignment.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={async () => {
                          if (window.confirm('Delete this assignment?')) {
                            await deleteStudentFee(assignment.id!);
                            fetchInitialData();
                          }
                        }}
                        className="text-rose-400 hover:text-rose-300 transition-colors bg-rose-500/10 p-2 rounded-lg hover:bg-rose-500/20"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold text-white mb-6">Assign Fee Structure</h2>
            
            <form onSubmit={handleAssignFee} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Select Student *</label>
                <select
                  required
                  value={selectedStudent?.id || ''}
                  onChange={(e) => {
                    const student = students.find(s => s.id === e.target.value);
                    setSelectedStudent(student);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Choose a student --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.fullName} (ID: {s.admissionNumber || s.id})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Select Fee Structure *</label>
                <select
                  required
                  value={selectedStructureId}
                  onChange={(e) => setSelectedStructureId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Choose fee structure --</option>
                  {feeStructures.map(f => (
                    <option key={f.id} value={f.id}>{f.courseName} - {f.batch} (₹{f.totalFees})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl flex items-center gap-2 transition-colors"
                >
                  <UserCheck className="w-5 h-5" />
                  Assign Fee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
