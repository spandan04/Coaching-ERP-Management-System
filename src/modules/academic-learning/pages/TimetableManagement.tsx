import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { Timestamp } from 'firebase/firestore';
import { getTimetable, addTimetableEntry, updateTimetableEntry, deleteTimetableEntry } from '../services/academicService';
import { Plus, Edit, Trash2, Calendar as CalendarIcon, Clock, Users, BookOpen } from 'lucide-react';

interface TimetableEntry {
  id?: string;
  day: string;
  course: string;
  subject: string;
  faculty: string;
  batch: string;
  timeSlot: string;
  createdAt?: Timestamp;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const TIME_SLOTS = [
  '08:00 AM - 09:00 AM',
  '09:00 AM - 10:00 AM',
  '10:00 AM - 11:30 AM',
  '11:00 AM - 12:00 PM',
  '11:30 AM - 01:00 PM',
  '12:00 PM - 01:00 PM',
  '01:00 PM - 02:00 PM',
  '01:00 PM - 02:30 PM',
  '02:00 PM - 03:00 PM',
  '02:30 PM - 04:00 PM',
  '03:00 PM - 04:00 PM',
  '04:00 PM - 05:00 PM',
  '04:00 PM - 05:30 PM',
  '05:00 PM - 06:00 PM',
  '05:30 PM - 07:00 PM',
  '06:00 PM - 07:00 PM',
  '07:00 PM - 08:00 PM',
  '07:00 PM - 08:30 PM',
];

const parseTime = (timeStr: string) => {
  if (!timeStr) return 0;
  const startStr = timeStr.split('-')[0].trim(); // e.g. "10:00 AM"
  const parts = startStr.split(' ');
  if (parts.length !== 2) return 0;
  const [time, modifier] = parts;
  let [hours, minutes] = time.split(':').map(Number);
  if (hours === 12 && modifier.toUpperCase() === 'AM') hours = 0;
  if (hours !== 12 && modifier.toUpperCase() === 'PM') hours += 12;
  return hours * 60 + (minutes || 0);
};

const SUBJECTS = ['Science', 'Accounts', 'Economics', 'Marathi', 'Maths', 'Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science', 'English'];
const COURSES = ['FYJC', 'SYJC', 'JEE', 'NEET', 'MHT-CET', 'Class 10', 'Class 9', 'Class 8'];
const BATCHES = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'Class 11-A', 'Class 11-B', 'Class 12-A', 'Class 12-B'];
const FACULTIES = ['Narayan Sir', 'Mahesh Sir', 'Shailesh Sir', 'Santosh Sir', 'Bagwe Sir', 'Chandrakant Sir'];

export const TimetableManagement = () => {
  const emptyForm: TimetableEntry = { day: 'Monday', course: '', subject: '', faculty: '', batch: '', timeSlot: '' };
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TimetableEntry>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const data = await getTimetable();
      data.sort((a: any, b: any) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day));
      setEntries(data);
    } catch (error) {
      console.error("Error fetching timetable:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
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
        await updateTimetableEntry(editingId, formData);
      } else {
        await addTimetableEntry(formData);
      }
      setShowModal(false);
      setEditingId(null);
      setFormData(emptyForm);
      fetchEntries();
    } catch (error: any) {
      console.error("Error saving entry:", error);
      alert("Failed to save entry: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (entry: TimetableEntry) => {
    setFormData(entry);
    setEditingId(entry.id!);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this timetable entry?')) {
      try {
        await deleteTimetableEntry(id);
        fetchEntries();
      } catch (error) {
        console.error("Error deleting entry:", error);
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
          <h1 className="text-3xl font-bold text-white tracking-tight font-heading">Timetable Management</h1>
          <p className="mt-2 text-sm text-slate-400 font-medium">Manage weekly recurring schedules.</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center px-5 py-2.5 shadow-lg shadow-indigo-600/20 text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Entry
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {DAYS.map(day => {
          const dayEntries = entries.filter(e => e.day === day);
          if (dayEntries.length === 0) return null;

          const sortedDayEntries = [...dayEntries].sort((a, b) => parseTime(a.timeSlot) - parseTime(b.timeSlot));

          return (
            <div key={day} className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col h-full">
              <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-slate-800 flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-indigo-400" />
                {day}
              </h2>
              <div className="space-y-4 flex-1">
                {sortedDayEntries.map(entry => (
                  <div key={entry.id} className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 relative group">
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(entry)} className="p-1.5 bg-slate-700 hover:bg-indigo-500 hover:text-white text-slate-300 rounded-lg transition-colors">
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDelete(entry.id!)} className="p-1.5 bg-slate-700 hover:bg-red-500 hover:text-white text-slate-300 rounded-lg transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="text-sm font-bold text-indigo-400 mb-1 pr-12">{entry.subject}</div>
                    <div className="space-y-1 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-500" />
                        <span>{entry.timeSlot}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-slate-500" />
                        <span>Faculty: <strong className="text-slate-300">{entry.faculty}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5 text-slate-500" />
                        <span>Course & Batch: <strong className="text-slate-300">{entry.course} ({entry.batch})</strong></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {entries.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500">
            No timetable entries yet. Click "Add Entry" to get started.
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-3xl w-full max-w-md border border-slate-700 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
              <h2 className="text-lg font-bold text-white">{editingId ? 'Edit Entry' : 'Add Timetable Entry'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Day</label>
                <select name="day" value={formData.day} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500">
                  {DAYS.map(day => <option key={day} value={day}>{day}</option>)}
                </select>
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
                <label className="block text-sm font-medium text-slate-400 mb-1">Time Slot</label>
                <select required name="timeSlot" value={formData.timeSlot} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="" disabled>Select Time Slot</option>
                  {TIME_SLOTS.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50 flex items-center">
                  {isSubmitting ? 'Saving...' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
