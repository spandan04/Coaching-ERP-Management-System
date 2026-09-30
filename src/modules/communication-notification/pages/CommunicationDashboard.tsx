import { useEffect, useState } from 'react';
import { getAnnouncements, getNotices, getNotifications, getCirculars } from '../services/communicationService';
import { Bell, Megaphone, FileText, ClipboardList, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CommunicationDashboard = () => {
  const [counts, setCounts] = useState({
    announcements: 0,
    notices: 0,
    notifications: 0,
    circulars: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [announcements, notices, notifications, circulars] = await Promise.all([
          getAnnouncements(),
          getNotices(),
          getNotifications(),
          getCirculars()
        ]);

        setCounts({
          announcements: announcements.length,
          notices: notices.length,
          notifications: notifications.length,
          circulars: circulars.length,
        });
      } catch (error) {
        console.error("Error fetching dashboard counts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  const cards = [
    {
      title: 'Announcements',
      count: counts.announcements,
      icon: Megaphone,
      color: 'from-blue-500 to-blue-600',
      path: '/communication/announcements',
      description: 'Manage class and general announcements'
    },
    {
      title: 'Notice Board',
      count: counts.notices,
      icon: ClipboardList,
      color: 'from-purple-500 to-purple-600',
      path: '/communication/notices',
      description: 'Manage official notices and updates'
    },
    {
      title: 'Notifications',
      count: counts.notifications,
      icon: Bell,
      color: 'from-indigo-500 to-indigo-600',
      path: '/communication/notifications',
      description: 'Send direct notifications to students'
    },
    {
      title: 'Circulars',
      count: counts.circulars,
      icon: FileText,
      color: 'from-emerald-500 to-emerald-600',
      path: '/communication/circulars',
      description: 'Upload and manage PDF circulars'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Communication & Notice Management</h1>
        <p className="text-slate-400 mt-1">Overview of all communication modules</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="text-slate-400 text-sm font-medium">{card.title}</p>
                  <h3 className="text-3xl font-bold text-white mt-2">{card.count}</h3>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-lg`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              
              <div className="mt-4 relative z-10">
                <p className="text-sm text-slate-500">{card.description}</p>
                <Link 
                  to={card.path}
                  className="mt-4 inline-flex items-center text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Manage {card.title}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
              
              {/* Background gradient effect on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300`} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
