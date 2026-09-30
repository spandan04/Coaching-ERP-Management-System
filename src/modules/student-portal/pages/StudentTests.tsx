import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../services/authentication/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../../services/firebase/firebase';
import { FileText, Calendar, Clock, Trophy, Target, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';

export const StudentTests = () => {
  const { studentData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTestsAndResults = async () => {
      if (!studentData?.id) return;
      try {
        // Fetch Tests for the batch
        const testsQ = query(collection(db, 'tests'), where('batch', '==', studentData.batch));
        const testsSnap = await getDocs(testsQ);
        const testsData = testsSnap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter((t: any) => t.status === 'Published')
          .sort((a: any, b: any) => new Date(b.availableFrom || 0).getTime() - new Date(a.availableFrom || 0).getTime());

        // Fetch Results for the student
        const resultsQ = query(collection(db, 'results'), where('studentId', '==', studentData.id));
        const resultsSnap = await getDocs(resultsQ);
        const resultsData = resultsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        setTests(testsData);
        setResults(resultsData);
      } catch (err) {
        console.error("Error fetching tests/results:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTestsAndResults();
  }, [studentData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Combine tests with results
  const testsWithResults = tests.map(test => {
     const result = results.find(r => r.testId === test.id);
     return { ...test, result };
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-white tracking-tight">Tests & Results</h1>
        <p className="text-slate-400">View upcoming tests and past performance.</p>
      </div>

      <div>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-400" />
          My Tests
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {testsWithResults.length === 0 ? (
             <div className="col-span-full p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 shadow-sm">
                No tests found for your batch.
             </div>
          ) : (
             testsWithResults.map(test => {
                const hasResult = !!test.result;
                const now = new Date();
                const availableFrom = test.availableFrom ? new Date(test.availableFrom) : now;
                const dueDate = test.dueDate ? new Date(test.dueDate) : now;
                const isAvailable = now >= availableFrom && now <= dueDate;
                const isExpired = now > dueDate;
                const isUpcoming = now < availableFrom;

                let statusBadge = "Upcoming";
                let statusClass = "bg-indigo-500/10 text-indigo-400";
                
                if (hasResult) {
                  statusBadge = "Completed";
                  statusClass = "bg-green-500/10 text-green-400";
                } else if (isExpired) {
                  statusBadge = "Expired";
                  statusClass = "bg-red-500/10 text-red-400";
                } else if (isAvailable) {
                  statusBadge = "Available";
                  statusClass = "bg-emerald-500/10 text-emerald-400";
                }

                return (
                  <div key={test.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between group">
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-white text-lg group-hover:text-indigo-400 transition-colors">{test.title}</h3>
                        <span className={clsx("px-2.5 py-1 rounded-full text-xs font-medium", statusClass)}>
                          {statusBadge}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 mb-4">{test.subject || 'General'}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-slate-500" />
                          Available: {test.availableFrom ? new Date(test.availableFrom).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-slate-500" />
                          Due: {test.dueDate ? new Date(test.dueDate).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-slate-500" />
                          {test.duration || 30} mins
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-slate-500" />
                          {test.questions?.length || 0} Questions
                        </div>
                      </div>
                    </div>

                    {hasResult ? (
                      <div className="mt-4 pt-4 border-t border-slate-800/50 flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                          <div>
                             <p className="text-xs text-slate-500 mb-1">Score</p>
                             <div className="flex items-baseline gap-1.5">
                                <span className="text-2xl font-bold text-green-400">{test.result.score}</span>
                                <span className="text-sm text-slate-500">/ {test.result.totalQuestions || test.questions?.length || 0}</span>
                             </div>
                          </div>
                          <div>
                             <p className="text-xs text-slate-500 mb-1">Percentage</p>
                             <div className="flex items-center gap-2">
                                <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                                   <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.round((test.result.score / (test.result.totalQuestions || test.questions?.length || 1)) * 100)}%` }}></div>
                                </div>
                                <span className="text-sm font-medium text-white">{Math.round((test.result.score / (test.result.totalQuestions || test.questions?.length || 1)) * 100)}%</span>
                             </div>
                          </div>
                        </div>
                        <div className="flex justify-end">
                           <button
                             onClick={() => navigate(`/student/tests/${test.result.id}/result`)}
                             className="flex items-center gap-2 text-sm text-indigo-400 font-medium hover:text-indigo-300 transition-colors"
                           >
                             View Result <ArrowRight className="w-4 h-4" />
                           </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 pt-4 border-t border-slate-800/50 flex justify-end">
                        {isAvailable && (
                          <button
                            onClick={() => navigate(`/student/tests/${test.id}/attempt`)}
                            className="flex items-center gap-2 text-sm text-indigo-400 font-medium hover:text-indigo-300 transition-colors"
                          >
                            Start Test <ArrowRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
            })
          )}
        </div>
      </div>
    </div>
  );
};
