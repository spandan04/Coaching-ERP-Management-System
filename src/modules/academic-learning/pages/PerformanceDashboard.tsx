import { useState, useEffect } from 'react';
import { getLectures, getTests, getAllResults, getAttendanceRecords } from '../services/academicService';
import { getStudents } from '../../student-management/services/studentService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, BookOpen, Target, Award, Calendar } from 'lucide-react';

export const PerformanceDashboard = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    totalLectures: 0,
    totalTests: 0,
    averageScore: 0,
    averageAttendance: 0,
  });

  const [batchData, setBatchData] = useState<any[]>([]);
  const [testScores, setTestScores] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const studentData = await getStudents();
        setStudents(studentData.active);
        
        // Fetch Lectures
        const lectures = await getLectures();
        const totalLectures = lectures.length;

        // Fetch Tests
        const tests = await getTests();
        const totalTests = tests.length;

        // Fetch Results
        const results = await getAllResults();
        let totalScorePercentage = 0;
        const testScoresData: any[] = [];
        
        results.forEach((data: any) => {
          const percentage = (data.score / data.totalQuestions) * 100;
          totalScorePercentage += percentage;
          
          testScoresData.push({
            name: data.testTitle.substring(0, 15) + '...',
            score: Math.round(percentage)
          });
        });
        
        const avgScore = results.length > 0 ? totalScorePercentage / results.length : 0;

        // Fetch Attendance
        const attendance = await getAttendanceRecords();
        let totalPresent = 0;
        let totalRecords = 0;
        
        attendance.forEach((data: any) => {
          const records = data.records;
          Object.values(records).forEach((val) => {
            totalRecords++;
            if (val === 'present') totalPresent++;
          });
        });

        const avgAttendance = totalRecords > 0 ? (totalPresent / totalRecords) * 100 : 0;

        setStats({
          totalLectures,
          totalTests,
          averageScore: Math.round(avgScore),
          averageAttendance: Math.round(avgAttendance)
        });

        // Setup Batch Distribution Data
        const batches = studentData.active.reduce((acc: any, student) => {
          if (student.batch) {
            acc[student.batch] = (acc[student.batch] || 0) + 1;
          }
          return acc;
        }, {});

        const batchChartData = Object.keys(batches).map(key => ({
          name: key,
          students: batches[key]
        }));
        
        setBatchData(batchChartData);
        setTestScores(testScoresData.slice(0, 5)); // Last 5 tests

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight font-heading">Performance Dashboard</h1>
        <p className="mt-2 text-sm text-slate-400 font-medium">Overview of academic metrics and engagement.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Students', value: students.filter(s => s.status === 'active').length, Icon: Users, color: 'indigo', BgIcon: Users },
          { label: 'Total Lectures', value: stats.totalLectures, Icon: BookOpen, color: 'emerald', BgIcon: BookOpen },
          { label: 'Avg. Attendance', value: `${stats.averageAttendance}%`, Icon: TrendingUp, color: 'amber', BgIcon: Calendar },
          { label: 'Avg. Test Score', value: `${stats.averageScore}%`, Icon: Target, color: 'rose', BgIcon: Award },
        ].map(({ label, value, Icon, color, BgIcon }) => (
          <div key={label} className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <BgIcon className="w-16 h-16" style={{ color: `var(--color-${color}-400)` }} />
            </div>
            <div className={`w-12 h-12 bg-${color}-500/10 rounded-2xl flex items-center justify-center text-${color}-400 mb-4`}>
              <Icon className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-400 mb-1">{label}</p>
            <div className="text-3xl font-bold text-white flex items-baseline gap-2">{value}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Batch Distribution Chart */}
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-6">Students per Batch</h3>
          {batchData.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={batchData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} />
                  <YAxis stroke="#64748b" axisLine={false} tickLine={false} />
                  <RechartsTooltip 
                    cursor={{fill: '#1e293b'}} 
                    contentStyle={{backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff'}} 
                  />
                  <Bar dataKey="students" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-slate-500">No batch data available</div>
          )}
        </div>

        {/* Recent Test Scores Chart */}
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-6">Recent Test Averages</h3>
          {testScores.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={testScores} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} />
                  <YAxis stroke="#64748b" axisLine={false} tickLine={false} domain={[0, 100]} />
                  <RechartsTooltip 
                    contentStyle={{backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff'}} 
                  />
                  <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-slate-500">No test results available</div>
          )}
        </div>
      </div>
    </div>
  );
};
