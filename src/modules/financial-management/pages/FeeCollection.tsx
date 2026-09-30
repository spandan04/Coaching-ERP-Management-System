import { useState, useEffect, type FormEvent } from 'react';
import { serverTimestamp } from 'firebase/firestore';
import { getStudentFees, addPayment, updateStudentFee } from '../services/feeService';
import { StudentFee, Payment } from '../../../types/index';
import { CreditCard, Search, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toWords } from 'number-to-words';

export const FeeCollection = () => {
  const [assignments, setAssignments] = useState<StudentFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Payment Form State
  const [selectedAssignment, setSelectedAssignment] = useState<StudentFee | null>(null);
  const [amountPaid, setAmountPaid] = useState<number | ''>('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [transactionId, setTransactionId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const list = await getStudentFees();
      // Only show assignments with pending balances
      setAssignments(list.filter((a: any) => a.remainingBalance > 0));
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const generateReceipt = (payment: Payment, assignment: StudentFee, currentBalance: number) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(79, 70, 229); // Indigo 600
    doc.text('Coaching Classes Workspace', 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(100);
    doc.text('FEE RECEIPT', 105, 30, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(`Receipt No: ${payment.receiptNumber}`, 15, 45);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 45);

    // Student Details
    doc.setFontSize(12);
    doc.text('Student Details:', 15, 60);
    doc.setFontSize(10);
    doc.text(`Name: ${payment.studentName}`, 15, 70);
    doc.text(`Course: ${assignment.courseName} (${assignment.batch})`, 15, 78);
    
    // Payment Details Table
    autoTable(doc, {
      startY: 90,
      head: [['Description', 'Amount (INR)']],
      body: [
        [`Fee Payment - ${payment.paymentMode}`, `Rs. ${payment.amount}`],
        ...(payment.transactionId ? [[`Transaction ID: ${payment.transactionId}`, '-']] : []),
      ],
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] },
    });

    const finalY = (doc as any).lastAutoTable.finalY || 120;
    
    // Amount in words
    const amountInWords = toWords(payment.amount).toUpperCase() + ' ONLY';
    doc.setFontSize(10);
    doc.text(`Amount in Words: ${amountInWords}`, 15, finalY + 15);
    
    // Summary
    doc.text(`Total Course Fee: Rs. ${assignment.totalFees}`, 140, finalY + 15);
    doc.text(`Remaining Balance: Rs. ${currentBalance}`, 140, finalY + 23);
    
    // Footer
    doc.text('Authorized Signature', 150, finalY + 50);
    doc.line(140, finalY + 45, 190, finalY + 45); // Signature line
    
    doc.save(`Receipt_${payment.receiptNumber}.pdf`);
  };

  const handlePaymentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment || !amountPaid) return;
    const amount = Number(amountPaid);
    
    if (amount > selectedAssignment.remainingBalance) {
      alert("Amount cannot exceed remaining balance!");
      return;
    }

    setIsProcessing(true);
    try {
      const receiptNumber = `REC-${Date.now()}`;
      
      const newPayment: any = {
        studentId: selectedAssignment.studentId,
        studentName: selectedAssignment.studentName,
        receiptNumber,
        amount,
        paymentMode,
        transactionId,
        remarks,
        date: serverTimestamp(),
        createdAt: serverTimestamp(),
      };

      // Save payment record
      await addPayment(newPayment);

      // Update Student Fee Assignment
      const newPaid = selectedAssignment.amountPaid + amount;
      const newBalance = selectedAssignment.totalFees - newPaid;
      
      await updateStudentFee(selectedAssignment.id!, {
        amountPaid: newPaid,
        remainingBalance: newBalance,
        paymentStatus: newBalance <= 0 ? 'Paid' : 'Partial'
      });

      // Generate Receipt PDF
      generateReceipt(newPayment as Payment, selectedAssignment, newBalance);

      // Reset Form
      setSelectedAssignment(null);
      setAmountPaid('');
      setTransactionId('');
      setRemarks('');
      setPaymentMode('Cash');
      fetchAssignments();

      alert('Payment collected successfully and receipt generated!');
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Error processing payment.');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredAssignments = assignments.filter(a => 
    a.studentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Fee Collection</h1>
        <p className="text-slate-400 mt-2">Collect fees, update balances, and generate receipts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Search & Select Student */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col h-[600px]">
          <h2 className="text-xl font-bold text-white mb-4">Select Student</h2>
          <div className="relative mb-4">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {loading ? (
              <p className="text-slate-500 text-center py-4">Loading...</p>
            ) : filteredAssignments.length === 0 ? (
              <p className="text-slate-500 text-center py-4">No pending dues found.</p>
            ) : (
              filteredAssignments.map((assignment) => (
                <div 
                  key={assignment.id}
                  onClick={() => setSelectedAssignment(assignment)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedAssignment?.id === assignment.id 
                    ? 'bg-indigo-900/40 border-indigo-500 shadow-sm shadow-indigo-900/20' 
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="font-medium text-white">{assignment.studentName}</div>
                  <div className="text-xs text-slate-400 mt-1">{assignment.courseName}</div>
                  <div className="text-rose-400 font-bold mt-2 text-sm">Due: ₹ {assignment.remainingBalance}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Payment Form */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Process Payment</h2>
          
          {!selectedAssignment ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500">
              <CreditCard className="w-12 h-12 mb-4 opacity-50" />
              <p>Select a student from the list to process payment</p>
            </div>
          ) : (
            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              {/* Student Summary Info */}
              <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">Student</div>
                  <div className="text-white font-medium mt-1">{selectedAssignment.studentName}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">Course</div>
                  <div className="text-white font-medium mt-1">{selectedAssignment.courseName}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">Total Fees</div>
                  <div className="text-white font-medium mt-1">₹ {selectedAssignment.totalFees}</div>
                </div>
                <div>
                  <div className="text-xs text-rose-500 uppercase tracking-wider font-bold">Balance Due</div>
                  <div className="text-rose-400 font-bold mt-1">₹ {selectedAssignment.remainingBalance}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Amount to Pay (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={selectedAssignment.remainingBalance}
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-emerald-400 font-bold focus:outline-none focus:border-indigo-500"
                    placeholder="Enter amount..."
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Payment Mode *</label>
                  <select
                    required
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                {paymentMode !== 'Cash' && (
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-slate-300">Transaction ID / Cheque No.</label>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                      placeholder="e.g. UTR number..."
                    />
                  </div>
                )}

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-300">Remarks (Optional)</label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 resize-none"
                    placeholder="Any additional notes..."
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl flex items-center gap-2 font-bold transition-colors"
                >
                  <FileText className="w-5 h-5" />
                  {isProcessing ? 'Processing...' : 'Collect Fee & Print Receipt'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
