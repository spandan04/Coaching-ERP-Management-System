import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { Timestamp } from 'firebase/firestore';
import { getLectures, addLecture, updateLecture, deleteLecture } from '../services/academicService';
import { Plus, Edit, Trash2, Calendar as CalendarIcon, Clock, Users, BookOpen } from 'lucide-react';

const SUBJECTS = ['Science', 'Accounts', 'Economics', 'Marathi', 'Maths', 'Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science', 'English'];
const COURSES = ['FYJC', 'SYJC', 'JEE', 'NEET', 'MHT-CET', 'Class 10', 'Class 9', 'Class 8'];
const BATCHES = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'Class 11-A', 'Class 11-B', 'Class 12-A', 'Class 12-B'];
const FACULTIES = ['Narayan Sir', 'Mahesh Sir', 'Shailesh Sir', 'Santosh Sir', 'Chandrakant Sir'];

interface Lecture {
  id?: string;
  title: string;
  course: string;
  subject: string;
  faculty: string;
  batch: string;
  date: string;
  startTime: string;
  endTime: string;
  createdAt?: Timestamp;
}

export const LectureManagement = () => {
  const emptyForm: Lecture = { title: '', course: '', subject: '', faculty: '', batch: '', date: '', startTime: '', endTime: '' };
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Lecture>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLectures = async () => {
    setLoading(true);
    try {
      setLectures(await getLectures());
    } catch (error) {
      console.error("Error fetching lectures:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLectures();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateLecture(editingId, formData);
      } else {
        await addLecture(formData);
      }
      setShowModal(false);
      setEditingId(null);
      setFormData(emptyForm);
      fetchLectures();
    } catch (error: any) {
      console.error("Error saving lecture:", error);
      alert("Failed to save lecture: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (lecture: Lecture) => {
    setFormData(lecture);
    setEditingId(lecture.id!);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this lecture?')) {
      try {
        await deleteLecture(id);
        fetchLectures();
      } catch (error) {
        console.error("Error deleting lecture:", error);
      }
    }
  };

  const openAddModal = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowModal(true);
  };

  if (loading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight font-heading">Lecture Management</h1>
          <p className="mt-2 text-sm text-slate-400 font-medium">Schedule and manage daily classes.</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center px-5 py-2.5 shadow-lg shadow-indigo-600/20 text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Lecture
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lectures.map((lecture) => (
          <div key={lecture.id} className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl relative group">
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleEdit(lecture)} className="p-2 bg-slate-800 hover:bg-indigo-500 hover:text-white text-slate-300 rounded-full transition-colors">
                <Edit className="h-4 w-4" />
              </button>
              <button onClick={() => handleDelete(lecture.id!)} className="p-2 bg-slate-800 hover:bg-red-500 hover:text-white text-slate-300 rounded-full transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">{lecture.title}</h3>
            <p className="text-sm font-medium text-indigo-400 mb-4">{lecture.subject}</p>

            <div className="space-y-2 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-500" />
                <span>Faculty: <strong className="text-slate-200">{lecture.faculty}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-slate-500" />
                <span>Course & Batch: <strong className="text-slate-200">{lecture.course} ({lecture.batch})</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-slate-500" />
                <span>Date: <strong className="text-slate-200">{lecture.date}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-500" />
                <span>Time: <strong className="text-slate-200">{lecture.startTime} - {lecture.endTime}</strong></span>
              </div>
            </div>
          </div>
        ))}
        {lectures.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500">
            No lectures scheduled yet. Click "Add Lecture" to get started.
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-3xl w-full max-w-md border border-slate-700 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
              <h2 className="text-lg font-bold text-white">{editingId ? 'Edit Lecture' : 'Add New Lecture'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Lecture Title</label>
                <input required type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. Introduction to Calculus" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Subject</label>
                  <select required name="subject" value={formData.subject} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="" disabled>Select Subject</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Course</label>
                  <select required name="course" value={formData.course} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="" disabled>Select Course</option>
                    {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Batch</label>
                  <select required name="batch" value={formData.batch} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="" disabled>Select Batch</option>
                    {BATCHES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Faculty Name</label>
                  <select required name="faculty" value={formData.faculty} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="" disabled>Select Faculty</option>
                    {FACULTIES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Date</label>
                <input required type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Start Time</label>
                  <input required type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">End Time</label>
                  <input required type="time" name="endTime" value={formData.endTime} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50 flex items-center">
                  {isSubmitting ? 'Saving...' : 'Save Lecture'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
