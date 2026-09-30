import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../services/authentication/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../services/firebase/firebase';
import { Calendar as CalendarIcon, Clock, User, BookOpen } from 'lucide-react';

interface TimetableRecord {
  id: string;
  batch: string;
  subject: string;
  faculty: string;
  day: string;
  startTime: string;
  endTime: string;
  room?: string;
}

export const StudentTimetable = () => {
  const { studentData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timetable, setTimetable] = useState<TimetableRecord[]>([]);

  useEffect(() => {
    const fetchTimetable = async () => {
      if (!studentData?.id) return;
      try {
        const q = query(collection(db, 'timetable'), where('batch', '==', studentData.batch));
        const snapshot = await getDocs(q);
        const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TimetableRecord));

        // Sort days logically
        const daysOrder: Record<string, number> = { 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6, 'Sunday': 7 };
        records.sort((a, b) => {
          if (daysOrder[a.day] !== daysOrder[b.day]) {
            return (daysOrder[a.day] || 99) - (daysOrder[b.day] || 99);
          }
          return a.startTime.localeCompare(b.startTime);
        });

        setTimetable(records);
      } catch (err) {
        console.error("Error fetching timetable:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, [studentData]);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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
        <h1 className="text-2xl font-bold text-white tracking-tight">My Timetable</h1>
        <p className="text-slate-400">Weekly schedule for batch: <span className="text-white font-medium">{studentData?.batch}</span></p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {daysOfWeek.map(day => {
          const dayRecords = timetable.filter(t => t.day === day);
          if (dayRecords.length === 0) return null;

          return (
            <div key={day} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-indigo-400" />
                {day}
              </h2>
              <div className="space-y-4">
                {dayRecords.map(record => (
                  <div key={record.id} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-indigo-400 font-semibold">
                        <BookOpen className="w-4 h-4" />
                        {record.subject}
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 text-xs font-medium text-slate-300 border border-slate-800">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {record.startTime} - {record.endTime}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <User className="w-4 h-4" />
                      Faculty: <span className="text-slate-200">{record.faculty}</span>
                    </div>
                    {record.room && (
                      <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                        <span className="font-medium">Room:</span> <span className="text-slate-200">{record.room}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {timetable.length === 0 && (
          <div className="col-span-full p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400">
            No timetable found for your batch.
          </div>
        )}
      </div>
    </div>
  );
};
