import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../services/authentication/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../../services/firebase/firebase';
import { IndianRupee, FileText, CheckCircle, Clock } from 'lucide-react';
import clsx from 'clsx';

export const StudentFees = () => {
  const { studentData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [feeData, setFeeData] = useState<any | null>(null);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    const fetchFees = async () => {
      if (!studentData?.id) return;
      try {
        // Fetch Fee Assignment
        const feesQ = query(collection(db, 'studentFees'), where('studentId', '==', studentData.id));
        const feeDocs = await getDocs(feesQ);
        if (!feeDocs.empty) {
           setFeeData({ id: feeDocs.docs[0].id, ...feeDocs.docs[0].data() });
        }

        // Fetch Payments
        const paymentsQ = query(collection(db, 'payments'), where('studentId', '==', studentData.id));
        const paymentsSnap = await getDocs(paymentsQ);
        const paymentsData = paymentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        // Sort descending by date locally since compound index might be missing
        paymentsData.sort((a, b) => {
          const timeA = a.date?.toMillis?.() || new Date(a.date).getTime() || 0;
          const timeB = b.date?.toMillis?.() || new Date(b.date).getTime() || 0;
          return timeB - timeA;
        });
        setPayments(paymentsData);

      } catch (err) {
        console.error("Error fetching fees:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFees();
  }, [studentData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-white tracking-tight">My Fees</h1>
        <p className="text-slate-400">View your fee structure and payment history.</p>
      </div>

      {!feeData ? (
        <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 shadow-sm">
           No fee assignment found for your profile.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
             <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
               <FileText className="w-6 h-6" />
             </div>
             <p className="text-sm text-slate-400 mb-1">Total Fees</p>
             <h2 className="text-2xl font-bold text-white">₹{feeData.totalFees?.toLocaleString()}</h2>
           </div>
           
           <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
             <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-3">
               <CheckCircle className="w-6 h-6" />
             </div>
             <p className="text-sm text-slate-400 mb-1">Amount Paid</p>
             <h2 className="text-2xl font-bold text-white">₹{feeData.amountPaid?.toLocaleString()}</h2>
           </div>

           <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
             <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-3">
               <IndianRupee className="w-6 h-6" />
             </div>
             <p className="text-sm text-slate-400 mb-1">Pending Amount</p>
             <h2 className="text-2xl font-bold text-white">₹{feeData.remainingBalance?.toLocaleString()}</h2>
             <span className={clsx(
                "mt-2 px-2 py-0.5 rounded text-xs font-medium",
                feeData.paymentStatus === 'Paid' ? 'bg-green-500/10 text-green-400' :
                feeData.paymentStatus === 'Pending' ? 'bg-rose-500/10 text-rose-400' :
                'bg-yellow-500/10 text-yellow-400'
             )}>
                {feeData.paymentStatus}
             </span>
           </div>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden mt-8">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Payment History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-800 text-slate-400 text-sm">
                <th className="py-4 px-6 font-medium">Receipt No</th>
                <th className="py-4 px-6 font-medium">Date</th>
                <th className="py-4 px-6 font-medium">Mode</th>
                <th className="py-4 px-6 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 px-6 text-center text-slate-500">
                    No payment history found.
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-800/20 transition-colors group">
                    <td className="py-4 px-6 text-white font-medium">
                      {payment.receiptNumber}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Clock className="w-4 h-4" />
                        {payment.date?.toDate?.().toLocaleDateString() || new Date(payment.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-300">
                      {payment.paymentMode}
                      {payment.transactionId && (
                        <div className="text-xs text-slate-500 mt-1 truncate max-w-[120px]">
                           Txn: {payment.transactionId}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right font-medium text-green-400">
                      ₹{payment.amount?.toLocaleString()}
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
