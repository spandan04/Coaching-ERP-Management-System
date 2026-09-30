import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  User, 
  Calendar, 
  CheckSquare, 
  FileText, 
  IndianRupee, 
  Bell, 
  Menu, 
  Sparkles,
  LogOut,
  Video
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../services/authentication/AuthContext';

export const StudentLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { studentData, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/student', icon: LayoutDashboard },
    { name: 'My Profile', path: '/student/profile', icon: User },
    { name: 'Attendance', path: '/student/attendance', icon: CheckSquare },
    { name: 'Timetable', path: '/student/timetable', icon: Calendar },
    { name: 'Tests & Results', path: '/student/tests', icon: FileText },
    { name: 'My Fees', path: '/student/fees', icon: IndianRupee },
    { name: 'Notices', path: '/student/notices', icon: Bell },
    { name: 'Video Lectures', path: '/student/video-lectures', icon: Video },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const sidebarContent = (
    <>
      <div className="h-24 flex items-center px-8">
        <div className="flex items-center gap-4 w-full">
          <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-white font-bold text-xl leading-none tracking-tight">Coaching</h1>
            <p className="text-slate-400 text-[11px] uppercase font-bold tracking-[0.2em] mt-1.5">Student Portal</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6 flex flex-col gap-2 overflow-y-auto">
        <div className="mb-4 text-xs text-slate-500 font-semibold uppercase tracking-wider px-4">Menu</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/student'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[15px] font-medium transition-all duration-300 ease-out group',
                  isActive
                    ? 'bg-indigo-900/40 text-indigo-300 shadow-sm shadow-indigo-900/20'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={clsx(
                    'h-5 w-5 transition-all duration-300', 
                    isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-indigo-400 group-hover:scale-110'
                  )} />
                  {item.name}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-5 m-5 rounded-3xl bg-slate-800/50 border border-slate-700/50 shadow-sm">
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-10 h-10 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-indigo-400 font-bold overflow-hidden shadow-sm">
            {studentData?.profilePhotoUrl ? (
               <img src={studentData.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
               <span className="text-sm">{studentData?.fullName?.charAt(0) || 'S'}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-white font-bold truncate">{studentData?.fullName}</div>
            <div className="text-xs text-slate-400 font-medium mt-0.5 truncate">{studentData?.batch}</div>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-950 font-sans flex overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-[280px] bg-slate-900 border-r border-slate-800/80 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md transition-opacity" onClick={() => setSidebarOpen(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-[280px] w-full bg-slate-900 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 flex items-center justify-between px-6 border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md md:hidden z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors focus:outline-none"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="text-lg font-bold text-white">Student Portal</span>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-900/50 border border-indigo-800 flex items-center justify-center text-indigo-400 font-bold text-sm overflow-hidden">
              {studentData?.profilePhotoUrl ? (
                 <img src={studentData.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                 studentData?.fullName?.charAt(0) || 'S'
              )}
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-red-400 hover:text-red-300 hover:bg-slate-800 rounded-xl transition-colors focus:outline-none"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-6 md:p-8 lg:p-10">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};
