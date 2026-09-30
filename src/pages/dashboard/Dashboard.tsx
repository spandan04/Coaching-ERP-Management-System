import { useEffect, useState } from 'react';
import { getStudentDashboardStats } from '../../modules/student-management/services/studentService';
import { DashboardStats } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, UserCheck, Archive, TrendingUp } from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';

const COLORS = ['#818cf8', '#38bdf8', '#34d399', '#fbbf24', '#f87171', '#a78bfa']; // Adjusted for dark mode

export const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getStudentDashboardStats()
      .then(setStats)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-[70vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
        <p className="text-slate-400 font-medium text-sm animate-pulse">Loading dashboard...</p>
      </div>
    </div>
  );
  if (error) return <div className="text-red-400 text-center py-8">{error}</div>;
  if (!stats) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-white tracking-tight font-heading">Dashboard</h1>
        <p className="mt-2 text-slate-400 font-medium text-sm">Welcome back. Here's what's happening with your students today.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {[
          { label: 'Total Enrolled', value: stats.totalStudents, Icon: Users, iconColor: 'text-indigo-400', bgColor: 'bg-indigo-900/30', borderColor: 'border-indigo-800/50' },
          { label: 'Active Students', value: stats.activeStudents, Icon: UserCheck, iconColor: 'text-emerald-400', bgColor: 'bg-emerald-900/30', borderColor: 'border-emerald-800/50' },
          { label: 'Archived', value: stats.archivedStudents, Icon: Archive, iconColor: 'text-slate-400', bgColor: 'bg-slate-800/50', borderColor: 'border-slate-700/50' },
        ].map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
        {/* Chart 1 */}
        <div className="bg-slate-900 p-8 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.2)] border border-slate-800">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-bold text-lg text-white font-heading">Students by Course</h2>
            <div className="p-2 bg-indigo-900/40 rounded-lg text-indigo-400"><TrendingUp className="w-4 h-4" /></div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.studentsByCourse} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 500}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 500}} allowDecimals={false} dx={-10} />
                <Tooltip 
                  cursor={{fill: '#1e293b'}} 
                  contentStyle={{borderRadius: '16px', border: 'none', background: '#0f172a', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)', padding: '12px 16px', fontWeight: 600}} 
                  itemStyle={{color: '#818cf8'}}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 8, 8]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2 */}
        <div className="bg-slate-900 p-8 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.2)] border border-slate-800">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-bold text-lg text-white font-heading">Students by Batch</h2>
            <div className="p-2 bg-sky-900/40 rounded-lg text-sky-400"><Users className="w-4 h-4" /></div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.studentsByBatch}
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={105}
                  fill="#8884d8"
                  paddingAngle={6}
                  dataKey="count"
                  nameKey="name"
                  label={({ name, percent }) => percent > 0.05 ? `${name} (${(percent * 100).toFixed(0)}%)` : ''}
                  stroke="none"
                >
                  {stats.studentsByBatch.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', background: '#0f172a', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)', padding: '12px 16px', fontWeight: 600}} 
                  itemStyle={{color: '#e2e8f0'}}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
