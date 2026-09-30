import { useState, useEffect } from 'react';
import { getNotices, addNotice, updateNotice, deleteNotice } from '../services/communicationService';
import { Plus, Edit2, Trash2, ClipboardList, X, AlertCircle } from 'lucide-react';

interface Notice {
  id: string;
  title: string;
  description: string;
  date: string;
  expiryDate: string;
}

export const NoticeBoard = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', date: '', expiryDate: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const data = await getNotices();
      setNotices(data);
    } catch (error) {
      console.error("Error fetching notices:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateNotice(editingId, formData);
      } else {
        await addNotice(formData);
      }
      setIsModalOpen(false);
      resetForm();
      fetchNotices();
    } catch (error) {
      console.error("Error saving notice:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this notice?")) {
      try {
        await deleteNotice(id);
        fetchNotices();
      } catch (error) {
        console.error("Error deleting notice:", error);
      }
    }
  };

  const handleEdit = (notice: Notice) => {
    setFormData({
      title: notice.title,
      description: notice.description,
      date: notice.date,
      expiryDate: notice.expiryDate
    });
    setEditingId(notice.id);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', date: '', expiryDate: '' });
    setEditingId(null);
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Notice Board</h1>
          <p className="text-slate-400 mt-1">Manage official notices and circulars</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Notice
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {notices.map((item) => (
            <div key={item.id} className={`border rounded-2xl p-6 relative group ${isExpired(item.expiryDate) ? 'bg-slate-900/50 border-slate-800/50' : 'bg-slate-900 border-slate-700'}`}>
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isExpired(item.expiryDate) ? 'bg-slate-800 text-slate-500' : 'bg-purple-500/10 text-purple-400'}`}>
                    <ClipboardList className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className={`text-lg font-semibold ${isExpired(item.expiryDate) ? 'text-slate-400' : 'text-white'}`}>{item.title}</h3>
                      {isExpired(item.expiryDate) && (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full">
                          <AlertCircle className="w-3 h-3" />
                          Expired
                        </span>
                      )}
                    </div>
                    <p className={`text-sm mb-4 ${isExpired(item.expiryDate) ? 'text-slate-500' : 'text-slate-300'}`}>{item.description}</p>
                    <div className="flex gap-6 text-xs font-medium">
                      <div className="flex flex-col">
                        <span className="text-slate-500">Published</span>
                        <span className="text-slate-400">{new Date(item.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-slate-500">Valid Until</span>
                        <span className="text-slate-400">{new Date(item.expiryDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(item)} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 text-red-400 hover:text-red-300 bg-red-400/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {notices.length === 0 && (
            <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-800/50">
              <ClipboardList className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-lg">No notices published yet</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h2 className="text-xl font-semibold text-white">{editingId ? 'Edit Notice' : 'Add Notice'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Notice Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="e.g., Holiday Notice"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Notice Description</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Detailed information..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Publish Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors disabled:opacity-50 flex items-center"
                >
                  {isSubmitting ? 'Saving...' : editingId ? 'Update' : 'Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
