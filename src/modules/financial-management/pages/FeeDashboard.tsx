import { useState, useEffect } from 'react';
import { IndianRupee, TrendingUp, Users, Calendar, ArrowUpRight, ArrowDownRight, AlertCircle } from 'lucide-react';
import { StatCard } from '../../../components/common/StatCard';
import { NavLink } from 'react-router-dom';
import { getStudentFees, getPayments } from '../services/feeService';
import { StudentFee, Payment } from '../../../types/index';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export const FeeDashboard = () => {
  const [totalCollected, setTotalCollected] = useState(0);
  const [pendingDues, setPendingDues] = useState(0);
  const [todaysCollection, setTodaysCollection] = useState(0);
  const [pendingStudents, setPendingStudents] = useState(0);
  
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [paymentModeData, setPaymentModeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch Assignments for Pending Dues & Students
        const assignments = await getStudentFees();
        
        let pendingAmt = 0;
        let pendingCount = 0;
        assignments.forEach(a => {
          if (a.remainingBalance > 0) {
            pendingAmt += a.remainingBalance;
            pendingCount += 1;
          }
        });
        setPendingDues(pendingAmt);
        setPendingStudents(pendingCount);

        // Fetch Payments for Total & Today's Collection & Charts
        const payments = await getPayments();

        let totalAmt = 0;
        let todayAmt = 0;
        
        const modeMap: Record<string, number> = {};
        const monthMap: Record<string, number> = {};

        const today = new Date();
        today.setHours(0,0,0,0);

        payments.forEach(p => {
          totalAmt += p.amount;
          
          // Check if today
          const pDate = p.date?.toDate ? p.date.toDate() : new Date(p.date || Date.now());
          const pDateMidnight = new Date(pDate);
          pDateMidnight.setHours(0,0,0,0);
          if (pDateMidnight.getTime() === today.getTime()) {
            todayAmt += p.amount;
          }

          // Payment mode chart data
          modeMap[p.paymentMode] = (modeMap[p.paymentMode] || 0) + p.amount;

          // Monthly chart data
          const monthName = pDate.toLocaleString('default', { month: 'short' });
          monthMap[monthName] = (monthMap[monthName] || 0) + p.amount;
        });

        setTotalCollected(totalAmt);
        setTodaysCollection(todayAmt);

        // Format chart data
        const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#f43f5e'];
        const pModeData = Object.keys(modeMap).map((key, i) => ({
          name: key,
          value: modeMap[key],
          color: COLORS[i % COLORS.length]
        }));
        setPaymentModeData(pModeData);

        const mData = Object.keys(monthMap).map(key => ({
          month: key,
          amount: monthMap[key]
        }));
        // Basic sort (could be improved by actual month index)
        setMonthlyData(mData);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Fees Dashboard</h1>
          <p className="text-slate-400 mt-2">Manage fee structures, collections, and pending dues</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Collected', value: `₹ ${totalCollected.toLocaleString()}`, Icon: TrendingUp, color: 'indigo' },
          { label: 'Pending Dues', value: `₹ ${pendingDues.toLocaleString()}`, Icon: AlertCircle, color: 'rose' },
          { label: "Today's Collection", value: `₹ ${todaysCollection.toLocaleString()}`, Icon: IndianRupee, color: 'emerald' },
          { label: 'Pending Students', value: pendingStudents, Icon: Users, color: 'amber' },
        ].map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Monthly Collection</h3>
          <div className="h-[300px]">
            {loading ? (
              <div className="h-full flex items-center justify-center text-slate-500">Loading chart...</div>
            ) : monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="month" stroke="#64748b" axisLine={false} tickLine={false} />
                  <YAxis stroke="#64748b" axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} />
                  <Tooltip 
                    cursor={{ fill: '#1e293b' }}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem', color: '#fff' }}
                  />
                  <Bar dataKey="amount" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">No data available</div>
            )}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Payment Modes Distribution</h3>
          <div className="h-[300px]">
            {loading ? (
              <div className="h-full flex items-center justify-center text-slate-500">Loading chart...</div>
            ) : paymentModeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentModeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {paymentModeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number) => `₹ ${value.toLocaleString()}`}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#cbd5e1' }}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">No data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <h3 className="text-lg font-bold text-white mt-10 mb-4 px-2">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[
          { to: '/fees/structures', label: 'Fee Structures' },
          { to: '/fees/assignment', label: 'Student Assignments' },
          { to: '/fees/collection', label: 'Fee Collection' },
          { to: '/fees/installments', label: 'Installments' },
          { to: '/fees/transactions', label: 'Transaction History' },
          { to: '/fees/pending', label: 'Pending Dues' },
        ].map(({ to, label }) => (
          <NavLink key={to} to={to} className="p-4 bg-slate-800/50 hover:bg-slate-800 rounded-2xl border border-slate-700/50 transition-all flex items-center justify-between group hover:border-indigo-500/30">
            <span className="text-white font-medium group-hover:text-indigo-400 transition-colors">{label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};
