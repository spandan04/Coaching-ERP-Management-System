import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, IndianRupee, AlertCircle, CheckSquare, FileText, TrendingUp, BarChart2 } from 'lucide-react';
import { getReportDashboardStats } from '../services/reportService';
import { NavLink } from 'react-router-dom';

const COLORS = ['#818cf8', '#38bdf8', '#34d399', '#fbbf24', '#f87171', '#a78bfa'];

export const ReportsDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [reportStats, setReportStats] = useState({
    totalCollection: 0,
    pendingFees: 0,
    averageAttendance: 0,
    averageTestScore: 0,
  });

  const [monthlyCollection, setMonthlyCollection] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      try {
        const data = await getReportDashboardStats();
        setStats(data.stats);
        setStudents(data.students);
        setReportStats(data.reportStats);
        setMonthlyCollection(data.monthlyCollection);
        setAttendanceData(data.attendanceData);

      } catch (error) {
        console.error("Error fetching report data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-[70vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
        <p className="text-slate-400 font-medium text-sm animate-pulse">Loading reports...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-white tracking-tight font-heading">Reports & Analytics</h1>
        <p className="mt-2 text-slate-400 font-medium text-sm">Comprehensive overview of academy performance.</p>
      </div>

      {/* Quick Nav Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <NavLink to="/reports/students" className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3 hover:bg-slate-800 transition-colors">
          <div className="p-2 bg-indigo-900/40 rounded-lg text-indigo-400"><Users className="w-5 h-5" /></div>
          <span className="text-white font-medium">Student Reports</span>
        </NavLink>
        <NavLink to="/reports/attendance" className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3 hover:bg-slate-800 transition-colors">
          <div className="p-2 bg-emerald-900/40 rounded-lg text-emerald-400"><CheckSquare className="w-5 h-5" /></div>
          <span className="text-white font-medium">Attendance Reports</span>
        </NavLink>
        <NavLink to="/reports/fees" className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3 hover:bg-slate-800 transition-colors">
          <div className="p-2 bg-amber-900/40 rounded-lg text-amber-400"><IndianRupee className="w-5 h-5" /></div>
          <span className="text-white font-medium">Fee Reports</span>
        </NavLink>
        <NavLink to="/reports/academic" className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3 hover:bg-slate-800 transition-colors">
          <div className="p-2 bg-sky-900/40 rounded-lg text-sky-400"><FileText className="w-5 h-5" /></div>
          <span className="text-white font-medium">Academic Reports</span>
        </NavLink>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <h3 className="text-slate-400 text-sm font-medium">Total Students</h3>
          </div>
          <p className="text-3xl font-bold text-white">{stats?.totalStudents || 0}</p>
        </div>
        
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h3 className="text-slate-400 text-sm font-medium">Total Collection</h3>
          </div>
          <p className="text-3xl font-bold text-white">₹{reportStats.totalCollection.toLocaleString()}</p>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <h3 className="text-slate-400 text-sm font-medium">Pending Fees</h3>
          </div>
          <p className="text-3xl font-bold text-white">₹{reportStats.pendingFees.toLocaleString()}</p>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <CheckSquare className="w-5 h-5 text-sky-400" />
            <h3 className="text-slate-400 text-sm font-medium">Avg Attendance</h3>
          </div>
          <p className="text-3xl font-bold text-white">{reportStats.averageAttendance}%</p>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <BarChart2 className="w-5 h-5 text-amber-400" />
            <h3 className="text-slate-400 text-sm font-medium">Avg Test Score</h3>
          </div>
          <p className="text-3xl font-bold text-white">{reportStats.averageTestScore}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Student Distribution Chart */}
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 lg:col-span-1">
          <h2 className="font-bold text-lg text-white mb-6">Student Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.studentsByCourse || []}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="name"
                  stroke="none"
                >
                  {(stats?.studentsByCourse || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', background: '#0f172a', color: '#fff'}}
                  itemStyle={{color: '#818cf8'}}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Collection Chart */}
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 lg:col-span-1">
          <h2 className="font-bold text-lg text-white mb-6">Monthly Collection</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyCollection} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dx={-10} />
                <Tooltip 
                  cursor={{fill: '#1e293b'}} 
                  contentStyle={{borderRadius: '12px', border: 'none', background: '#0f172a', color: '#fff'}}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Amount']}
                />
                <Bar dataKey="amount" fill="#10b981" radius={[6, 6, 6, 6]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Percentage Chart */}
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 lg:col-span-1">
          <h2 className="font-bold text-lg text-white mb-6">Attendance Overview</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attendanceData}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                  stroke="none"
                >
                  {attendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#34d399' : '#f87171'} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', background: '#0f172a', color: '#fff'}}
                  formatter={(value: number) => [value, 'Days']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
