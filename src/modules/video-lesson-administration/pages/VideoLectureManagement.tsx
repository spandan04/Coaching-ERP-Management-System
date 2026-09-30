import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { Plus, Edit, Trash2, Video, BookOpen, Clock, Tag } from 'lucide-react';
import { VideoLecture } from '../../../types/index';
import { 
  getVideoLectures, 
  addVideoLecture, 
  updateVideoLecture, 
  deleteVideoLecture,
  getCoursesAndBatches
} from '../services/videoLectureService';

export const VideoLectureManagement = () => {
  const emptyForm: VideoLecture = { 
    title: '', 
    subject: '', 
    course: '', 
    batch: '', 
    description: '', 
    videoUrl: '', 
    lectureDate: new Date().toISOString().split('T')[0], 
    status: 'Draft' 
  };
  
  const [lectures, setLectures] = useState<VideoLecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<VideoLecture>(emptyForm);
  
  // Data for Dropdowns
  const [courses, setCourses] = useState<string[]>([]);
  const [batchesByCourse, setBatchesByCourse] = useState<Record<string, string[]>>({});
  const [availableBatches, setAvailableBatches] = useState<string[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const fetchedLectures = await getVideoLectures();
      setLectures(fetchedLectures);
    } catch (error) {
      console.error("Error fetching video lectures:", error);
    }
    
    try {
      const { courses: fetchedCourses, batchesByCourse: fetchedBatches } = await getCoursesAndBatches();
      setCourses(fetchedCourses);
      setBatchesByCourse(fetchedBatches);
    } catch (error) {
      console.error("Error fetching courses and batches:", error);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update available batches when course changes
  useEffect(() => {
    if (formData.course && batchesByCourse[formData.course]) {
      setAvailableBatches(batchesByCourse[formData.course]);
    } else {
      setAvailableBatches([]);
    }
  }, [formData.course, batchesByCourse]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // If course changes, reset batch
      if (name === 'course') {
        updated.batch = '';
      }
      return updated;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateVideoLecture(editingId, formData);
      } else {
        await addVideoLecture(formData);
      }
      setShowModal(false);
      setEditingId(null);
      setFormData(emptyForm);
      fetchData();
    } catch (error: any) {
      console.error("Error saving video lecture:", error);
      alert("Failed to save lecture: " + error.message);
    }
  };

  const handleEdit = (lecture: VideoLecture) => {
    setFormData(lecture);
    setEditingId(lecture.id!);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this lecture?')) {
      try {
        await deleteVideoLecture(id);
        fetchData();
      } catch (error) {
        console.error("Error deleting video lecture:", error);
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
          <h1 className="text-3xl font-bold text-white tracking-tight font-heading">Video Lectures</h1>
          <p className="mt-2 text-sm text-slate-400 font-medium">Manage and publish video lectures for students.</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center px-5 py-2.5 shadow-lg shadow-indigo-600/20 text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Video Lecture
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/50 text-xs uppercase font-semibold text-slate-400">
              <tr>
                <th className="px-6 py-4">Lecture</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Batch</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {lectures.map((lecture) => (
                <tr key={lecture.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-white flex items-center gap-2">
                      <Video className="w-4 h-4 text-indigo-400" />
                      {lecture.title}
                    </div>
                    {lecture.lectureDate && <div className="text-xs text-slate-500 mt-1">{lecture.lectureDate}</div>}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-300">{lecture.subject}</td>
                  <td className="px-6 py-4 text-slate-300">{lecture.course}</td>
                  <td className="px-6 py-4 text-slate-300">{lecture.batch}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      lecture.status === 'Published' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {lecture.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(lecture)} className="p-1.5 bg-slate-800 hover:bg-indigo-500 hover:text-white text-slate-300 rounded-lg transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(lecture.id!)} className="p-1.5 bg-slate-800 hover:bg-red-500 hover:text-white text-slate-300 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {lectures.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No video lectures found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-3xl w-full max-w-2xl border border-slate-700 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-indigo-400" />
                {editingId ? 'Edit Video Lecture' : 'Create Video Lecture'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-400 mb-1">Lecture Title *</label>
                  <input required type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Enter lecture title" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Subject *</label>
                  <input required type="text" name="subject" value={formData.subject} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. Mathematics" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Lecture Date</label>
                  <input type="date" name="lectureDate" value={formData.lectureDate} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 [color-scheme:dark]" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Course *</label>
                  <select required name="course" value={formData.course} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="">Select Course</option>
                    {courses.map(course => <option key={course} value={course}>{course}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Batch *</label>
                  <select required name="batch" value={formData.batch} onChange={handleInputChange} disabled={!formData.course} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50">
                    <option value="">Select Batch</option>
                    {availableBatches.map(batch => <option key={batch} value={batch}>{batch}</option>)}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-400 mb-1">Video URL *</label>
                  <input required type="url" name="videoUrl" value={formData.videoUrl} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500" placeholder="https://example.com/video.mp4" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 resize-none" placeholder="Enter short description"></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800/50">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all">Save Lecture</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
