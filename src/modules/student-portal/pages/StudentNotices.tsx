import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../services/authentication/AuthContext';
import { collection, query, getDocs, orderBy, where } from 'firebase/firestore';
import { db } from '../../../services/firebase/firebase';
import { Bell, FileText, Megaphone, Clock, Download, ArrowRight } from 'lucide-react';
import clsx from 'clsx';

export const StudentNotices = () => {
  const { studentData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [communications, setCommunications] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'All' | 'Notices' | 'Announcements' | 'Circulars'>('All');

  useEffect(() => {
    const fetchCommunications = async () => {
      if (!studentData?.id) return;
      try {
        const allItems: any[] = [];
        
        // Target batches check: communications might have `targetBatches` array.
        // We fetch all and filter client-side for simplicity, or check if 'All' is in targetBatches.
        const addItems = (docs: any[], type: string) => {
           docs.forEach(d => {
             const data = d.data();
             // Simple visibility check: if targetBatches exists, check if student's batch is included or 'All'
             let isVisible = true;
             if (data.targetBatches) {
                isVisible = data.targetBatches.includes('All') || data.targetBatches.includes(studentData.batch);
             } else if (data.batch) {
                isVisible = data.batch === 'All' || data.batch === studentData.batch;
             }

             if (isVisible) {
               allItems.push({ id: d.id, type, ...data });
             }
           });
        };

        const noticesSnap = await getDocs(query(collection(db, 'notices'), orderBy('date', 'desc')));
        addItems(noticesSnap.docs, 'Notices');

        const announcementsSnap = await getDocs(query(collection(db, 'announcements'), orderBy('date', 'desc')));
        addItems(announcementsSnap.docs, 'Announcements');

        const circularsSnap = await getDocs(query(collection(db, 'circulars'), orderBy('date', 'desc')));
        addItems(circularsSnap.docs, 'Circulars');

        // Sort combined list by date descending
        allItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setCommunications(allItems);

      } catch (err) {
        console.error("Error fetching communications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunications();
  }, [studentData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const tabs = ['All', 'Notices', 'Announcements', 'Circulars'];
  const filteredComms = activeTab === 'All' ? communications : communications.filter(c => c.type === activeTab);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-white tracking-tight">Notices & Announcements</h1>
        <p className="text-slate-400">Stay updated with the latest information from the coaching center.</p>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={clsx(
              "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors",
              activeTab === tab
                ? "bg-indigo-600 text-white"
                : "bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {filteredComms.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            No {activeTab.toLowerCase()} available at the moment.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/50">
            {filteredComms.map((item) => (
              <div key={item.id} className="p-6 hover:bg-slate-800/30 transition-colors group">
                <div className="flex items-start gap-4">
                  <div className={clsx(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                    item.type === 'Notices' ? "bg-indigo-500/10 text-indigo-400" :
                    item.type === 'Announcements' ? "bg-orange-500/10 text-orange-400" :
                    "bg-rose-500/10 text-rose-400"
                  )}>
                    {item.type === 'Notices' && <Bell className="w-6 h-6" />}
                    {item.type === 'Announcements' && <Megaphone className="w-6 h-6" />}
                    {item.type === 'Circulars' && <FileText className="w-6 h-6" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-1">
                       <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">{item.title}</h3>
                       <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 whitespace-nowrap">
                         {item.type}
                       </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                      <Clock className="w-4 h-4" />
                      {item.date}
                    </div>
                    {item.description && (
                       <p className="text-slate-400 text-sm whitespace-pre-wrap">{item.description}</p>
                    )}
                    
                    {item.fileUrl && (
                      <div className="mt-4">
                        <a 
                          href={item.fileUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-indigo-400 hover:bg-slate-700 hover:text-indigo-300 transition-colors text-sm font-medium"
                        >
                          <Download className="w-4 h-4" />
                          Download Attachment
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
