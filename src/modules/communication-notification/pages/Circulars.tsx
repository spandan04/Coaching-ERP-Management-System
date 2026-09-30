import { useState, useEffect, useRef } from 'react';
import { getCirculars, addCircular, deleteCircular } from '../services/communicationService';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../services/firebase/firebase';
import { Plus, Trash2, FileText, X, Upload, Download, File } from 'lucide-react';

interface Circular {
  id: string;
  title: string;
  description: string;
  date: string;
  fileUrl: string | null;
  fileName: string | null;
}

export const Circulars = () => {
  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', date: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCirculars();
  }, []);

  const fetchCirculars = async () => {
    try {
      const data = await getCirculars();
      setCirculars(data);
    } catch (error) {
      console.error("Error fetching circulars:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
      } else {
        alert("Please upload a valid PDF file.");
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let fileUrl = null;
      let fileName = null;

      if (selectedFile) {
        const fileRef = ref(storage, `communication/circulars/${Date.now()}_${selectedFile.name}`);
        await uploadBytes(fileRef, selectedFile);
        fileUrl = await getDownloadURL(fileRef);
        fileName = selectedFile.name;
      }

      await addCircular({
        ...formData,
        fileUrl,
        fileName
      });

      setIsModalOpen(false);
      resetForm();
      fetchCirculars();
    } catch (error) {
      console.error("Error saving circular:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this circular?")) {
      try {
        await deleteCircular(id);
        fetchCirculars();
      } catch (error) {
        console.error("Error deleting circular:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', date: new Date().toISOString().split('T')[0] });
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Circular Management</h1>
          <p className="text-slate-400 mt-1">Upload and manage important documents</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Upload Circular
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {circulars.map((item) => (
            <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative group flex flex-col sm:flex-row gap-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <FileText className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
                  <button onClick={() => handleDelete(item.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:text-red-300 bg-red-400/10 rounded-lg transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-slate-400 text-sm mb-4">{item.description}</p>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <span className="text-slate-500 text-sm font-medium">{new Date(item.date).toLocaleDateString()}</span>
                  
                  {item.fileUrl && (
                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-400/10 hover:bg-emerald-400/20 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
          {circulars.length === 0 && (
            <div className="col-span-full text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800/50">
              <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No circulars uploaded yet</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h2 className="text-xl font-semibold text-white">Upload Circular</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Circular Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="e.g., Annual Syllabus Update"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Summary of the circular..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Upload PDF (Optional)</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-700 border-dashed rounded-xl cursor-pointer hover:bg-slate-800/50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {selectedFile ? (
                        <>
                          <File className="w-8 h-8 text-indigo-400 mb-2" />
                          <p className="text-sm text-slate-300 truncate max-w-[200px]">{selectedFile.name}</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-slate-500 mb-2" />
                          <p className="text-sm text-slate-400"><span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop</p>
                          <p className="text-xs text-slate-500 mt-1">PDF files only (MAX. 10MB)</p>
                        </>
                      )}
                    </div>
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept="application/pdf"
                      className="hidden" 
                      onChange={handleFileChange}
                    />
                  </label>
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
                  {isSubmitting ? 'Uploading...' : 'Publish Circular'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
