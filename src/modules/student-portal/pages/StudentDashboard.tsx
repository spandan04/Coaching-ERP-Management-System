import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../services/authentication/AuthContext';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../../services/firebase/firebase';
import { 
  User, 
  Calendar, 
  CheckSquare, 
  FileText, 
  IndianRupee, 
  Bell,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentDashboard = () => {
  const { studentData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    attendancePercentage: 0,
    pendingFees: 0,
    upcomingTests: 0,
  });
  const [recentNotices, setRecentNotices] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!studentData?.id) return;
      
      setLoading(true);
      let attPercentage = 100;
      let pending = 0;
      let upcoming = 0;
      let notices: any[] = [];

      try {
        // 1. Fetch Attendance
        const attendanceQ = query(collection(db, 'attendance'), where('batch', '==', studentData.batch));
        const attDocs = await getDocs(attendanceQ);
        let totalClasses = 0;
        let present = 0;
        attDocs.forEach(doc => {
          const data = doc.data();
          const studentStatus = data.records?.[studentData.id];
          if (studentStatus && typeof studentStatus === 'string') {
             totalClasses++;
             if (studentStatus.toLowerCase() === 'present') present++;
          }
        });
        attPercentage = totalClasses > 0 ? Math.round((present / totalClasses) * 100) : 100;
      } catch (err) {
        console.error("Error fetching attendance:", err);
      }

      try {
        // 2. Fetch Fees
        const feesQ = query(collection(db, 'studentFees'), where('studentId', '==', studentData.id));
        const feeDocs = await getDocs(feesQ);
        feeDocs.forEach(doc => {
          const data = doc.data();
          pending += (data.remainingBalance || 0);
        });
      } catch (err) {
        console.error("Error fetching fees:", err);
      }

      try {
        // 3. Fetch Upcoming Tests
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today

        // Fetch user results to exclude completed tests
        const resultsQ = query(collection(db, 'results'), where('studentId', '==', studentData.id));
        const resultsDocs = await getDocs(resultsQ);
        const completedTestIds = new Set(resultsDocs.docs.map(d => d.data().testId));

        const testsQ = query(collection(db, 'tests'), where('batch', '==', studentData.batch || ''));
        const testDocs = await getDocs(testsQ);
        testDocs.forEach(doc => {
          const data = doc.data();
          if (data.status === 'Published') {
            const dueDate = data.dueDate ? new Date(data.dueDate) : today;
            // Count as upcoming/pending if due date is today or later, and not yet completed
            if (dueDate >= today && !completedTestIds.has(doc.id)) {
              upcoming++;
            }
          }
        });
      } catch (err) {
        console.error("Error fetching tests:", err);
      }

      try {
        // 4. Fetch Recent Notices
        const noticesQ = query(collection(db, 'notices'), orderBy('date', 'desc'), limit(3));
        const noticeDocs = await getDocs(noticesQ);
        notices = noticeDocs.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (err) {
        console.error("Error fetching notices:", err);
      }

      setStats({
        attendancePercentage: attPercentage,
        pendingFees: pending,
        upcomingTests: upcoming,
      });
      setRecentNotices(notices);
      setLoading(false);
    };

    fetchDashboardData();
  }, [studentData]);

  const quickLinks = [
    { name: 'My Profile', icon: User, path: '/student/profile', color: 'bg-blue-500/10 text-blue-500' },
    { name: 'Attendance', icon: CheckSquare, path: '/student/attendance', color: 'bg-green-500/10 text-green-500' },
    { name: 'Timetable', icon: Calendar, path: '/student/timetable', color: 'bg-purple-500/10 text-purple-500' },
    { name: 'Tests & Results', icon: FileText, path: '/student/tests', color: 'bg-orange-500/10 text-orange-500' },
    { name: 'My Fees', icon: IndianRupee, path: '/student/fees', color: 'bg-rose-500/10 text-rose-500' },
    { name: 'Notices', icon: Bell, path: '/student/notices', color: 'bg-sky-500/10 text-sky-500' },
  ];

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
        <h1 className="text-3xl font-bold text-white tracking-tight">Welcome, {studentData?.fullName?.split(' ')[0]}!</h1>
        <p className="text-slate-400">Here's what's happening with your academics today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 font-medium">Attendance</h3>
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.attendancePercentage}%</div>
          <p className="text-sm text-slate-500">Overall present rate</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 font-medium">Pending Fees</h3>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">₹{stats.pendingFees.toLocaleString()}</div>
          <p className="text-sm text-slate-500">Total remaining balance</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 font-medium">Upcoming Tests</h3>
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.upcomingTests}</div>
          <p className="text-sm text-slate-500">Scheduled for this batch</p>
        </div>
      </div>

      <h2 className="text-xl font-bold text-white mt-8 mb-4">Quick Links</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link 
              key={link.path} 
              to={link.path}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 hover:bg-slate-800/50 transition-colors group"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${link.color} group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-slate-300">{link.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Recent Notices</h2>
          <Link to="/student/notices" className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {recentNotices.length > 0 ? (
            <div className="divide-y divide-slate-800/50">
              {recentNotices.map((notice, idx) => (
                <div key={idx} className="p-5 flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">{notice.title}</h3>
                    <p className="text-slate-400 text-sm line-clamp-2 mb-2">{notice.description}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      {typeof notice.date === 'string' ? notice.date : notice.date?.toDate?.().toLocaleDateString() || 'Unknown Date'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">
              No recent notices.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
