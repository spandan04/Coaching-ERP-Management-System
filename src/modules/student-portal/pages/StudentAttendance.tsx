import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../services/authentication/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../../services/firebase/firebase';
import { CheckSquare, XCircle, Clock, Calendar as CalendarIcon } from 'lucide-react';
import clsx from 'clsx';

export const StudentAttendance = () => {
  const { studentData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [stats, setStats] = useState({ present: 0, absent: 0, total: 0 });

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!studentData?.id) return;
      try {
        const q = query(collection(db, 'attendance'), where('batch', '==', studentData.batch));
        const snapshot = await getDocs(q);
        
        const records: any[] = [];
        let presentCount = 0;
        let absentCount = 0;
        let totalCount = 0;

        snapshot.forEach(doc => {
          const data = doc.data();
          const status = data.records?.[studentData.id];
          if (status) {
            totalCount++;
            const lowerStatus = status.toLowerCase();
            if (lowerStatus === 'present') presentCount++;
            else if (lowerStatus === 'absent') absentCount++;
            
            records.push({
              id: doc.id,
              date: data.date,
              subject: data.subject,
              topic: data.topic,
              status: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
            });
          }
        });

        // Sort records by date descending
        records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setAttendanceRecords(records);
        setStats({ present: presentCount, absent: absentCount, total: totalCount });
      } catch (err) {
        console.error("Error fetching attendance:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [studentData]);

  const percentage = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 100;

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
        <h1 className="text-2xl font-bold text-white tracking-tight">My Attendance</h1>
        <p className="text-slate-400">Track your attendance across all lectures.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 flex items-center justify-center mb-3">
             <span className="text-2xl font-bold text-white">{percentage}%</span>
          </div>
          <h3 className="text-slate-400 font-medium text-sm">Overall Attendance</h3>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
             <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
               <Clock className="w-5 h-5" />
             </div>
             <div className="text-3xl font-bold text-white">{stats.total}</div>
          </div>
          <h3 className="text-slate-400 font-medium text-sm">Total Lectures</h3>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
             <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
               <CheckSquare className="w-5 h-5" />
             </div>
             <div className="text-3xl font-bold text-white">{stats.present}</div>
          </div>
          <h3 className="text-slate-400 font-medium text-sm">Total Present</h3>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
             <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
               <XCircle className="w-5 h-5" />
             </div>
             <div className="text-3xl font-bold text-white">{stats.absent}</div>
          </div>
          <h3 className="text-slate-400 font-medium text-sm">Total Absent</h3>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">Attendance History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-800 text-slate-400 text-sm">
                <th className="py-4 px-6 font-medium">Date</th>
                <th className="py-4 px-6 font-medium">Subject</th>
                <th className="py-4 px-6 font-medium">Topic</th>
                <th className="py-4 px-6 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {attendanceRecords.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 px-6 text-center text-slate-500">
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                attendanceRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-800/20 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-white">
                        <CalendarIcon className="w-4 h-4 text-slate-500" />
                        {new Date(record.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-white">{record.subject}</td>
                    <td className="py-4 px-6 text-slate-400">{record.topic || '-'}</td>
                    <td className="py-4 px-6">
                      <span className={clsx(
                        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                        record.status === 'Present' ? "bg-green-500/10 text-green-400" :
                        record.status === 'Absent' ? "bg-red-500/10 text-red-400" :
                        "bg-yellow-500/10 text-yellow-400"
                      )}>
                        {record.status}
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
