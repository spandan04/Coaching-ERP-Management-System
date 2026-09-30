import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { Timestamp } from 'firebase/firestore';
import { getTests, addTest, updateTest, deleteTest } from '../services/academicService';
import { getStudents } from '../../student-management/services/studentService';
import { Student } from '../../../types/index';
import { Plus, Edit, Trash2, FileText, CheckCircle, Save, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Question {
  id: string; // local id for tracking
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
}

interface Test {
  id?: string;
  title: string;
  questions: Question[];
  createdAt?: Timestamp;
  course?: string;
  batch?: string;
  subject?: string;
  duration?: number;
  availableFrom?: string;
  dueDate?: string;
  status?: 'Draft' | 'Published';
}

export const TestManagement = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [testToAssign, setTestToAssign] = useState<Test | null>(null);
  const [assignForm, setAssignForm] = useState({
    course: '',
    batch: '',
    subject: '',
    duration: 30,
    availableFrom: '',
    dueDate: '',
    status: 'Published' as 'Draft' | 'Published'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [currentTest, setCurrentTest] = useState<Test>({
    title: '',
    questions: []
  });
  
  const fetchTests = async () => {
    setLoading(true);
    try {
      setTests(await getTests());
    } catch (error) {
      console.error("Error fetching tests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
    const fetchStudentData = async () => {
      try {
        const { active } = await getStudents();
        setStudents(active);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };
    fetchStudentData();
  }, []);

  const openNewTest = () => {
    setCurrentTest({
      title: '',
      questions: []
    });
    setShowModal(true);
  };

  const handleEditTest = (test: Test) => {
    setCurrentTest(test);
    setShowModal(true);
  };

  const handleDeleteTest = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this test?')) {
      try {
        await deleteTest(id);
        fetchTests();
      } catch (error: any) {
        console.error("Error deleting test:", error);
        alert("Failed to delete test: " + error.message);
      }
    }
  };

  const openAssignModal = (test: Test) => {
    setTestToAssign(test);
    setAssignForm({
      course: test.course || '',
      batch: test.batch || '',
      subject: test.subject || '',
      duration: test.duration || 30,
      availableFrom: test.availableFrom || '',
      dueDate: test.dueDate || '',
      status: test.status || 'Published'
    });
    setShowAssignModal(true);
  };

  const handleAssignTest = async () => {
    if (!testToAssign?.id) return;
    if (!assignForm.course || !assignForm.batch) {
      alert("Please select a course and batch.");
      return;
    }
    if (!assignForm.availableFrom || !assignForm.dueDate) {
      alert("Please fill all required fields (Available From, Due Date).");
      return;
    }
    if (new Date(assignForm.availableFrom) >= new Date(assignForm.dueDate)) {
      alert("Due date must be after the available date.");
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await updateTest(testToAssign.id, {
        course: assignForm.course,
        batch: assignForm.batch,
        subject: assignForm.subject,
        duration: assignForm.duration,
        availableFrom: assignForm.availableFrom,
        dueDate: assignForm.dueDate,
        status: assignForm.status
      });
      setShowAssignModal(false);
      fetchTests();
    } catch (error: any) {
      console.error("Error assigning test:", error);
      alert("Failed to assign test: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnassignTest = async (testId: string) => {
    if (window.confirm('Are you sure you want to unassign this test? Students will no longer be able to see it.')) {
      try {
        await updateTest(testId, {
          course: '',
          batch: '',
          subject: '',
          duration: null,
          availableFrom: '',
          dueDate: '',
          status: 'Draft'
        });
        fetchTests();
      } catch (error: any) {
        console.error("Error unassigning test:", error);
        alert("Failed to unassign test: " + error.message);
      }
    }
  };

  const addQuestion = () => {
    setCurrentTest(prev => ({
      ...prev,
      questions: [
        ...prev.questions, 
        { id: Date.now().toString(), question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A' }
      ]
    }));
  };

  const removeQuestion = (qId: string) => {
    setCurrentTest(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== qId)
    }));
  };

  const handleQuestionChange = (qId: string, field: keyof Question, value: string) => {
    setCurrentTest(prev => ({
      ...prev,
      questions: prev.questions.map(q => q.id === qId ? { ...q, [field]: value } : q)
    }));
  };

  const saveTest = async () => {
    if (!currentTest.title) {
      alert("Please provide a test title.");
      return;
    }
    if (currentTest.questions.length === 0) {
      alert("Please add at least one question.");
      return;
    }
    
    // Validate questions
    for (const q of currentTest.questions) {
      if (!q.question || !q.optionA || !q.optionB || !q.optionC || !q.optionD) {
        alert("Please fill all fields for all questions.");
        return;
      }
    }

    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (currentTest.id) {
        await updateTest(currentTest.id, {
          title: currentTest.title,
          questions: currentTest.questions
        });
      } else {
        await addTest({
          title: currentTest.title,
          questions: currentTest.questions
        });
      }
      setShowModal(false);
      fetchTests();
    } catch (error: any) {
      console.error("Error saving test:", error);
      alert("Failed to save test: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const uniqueCourses = Array.from(new Set(students.map(s => s.courseEnrolled))).filter(Boolean);
  const uniqueBatches = Array.from(new Set(
    students
      .filter(s => s.courseEnrolled === assignForm.course)
      .map(s => s.batch)
  )).filter(Boolean);

  if (loading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight font-heading">MCQ Test Management</h1>
          <p className="mt-2 text-sm text-slate-400 font-medium">Create and manage online multiple choice tests.</p>
        </div>
        <button
          onClick={openNewTest}
          className="inline-flex items-center justify-center px-5 py-2.5 shadow-lg shadow-indigo-600/20 text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Test
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map(test => (
          <div key={test.id} className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl relative group">
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleEditTest(test)} className="p-2 bg-slate-800 hover:bg-indigo-500 hover:text-white text-slate-300 rounded-full transition-colors">
                <Edit className="h-4 w-4" />
              </button>
              <button onClick={() => handleDeleteTest(test.id!)} className="p-2 bg-slate-800 hover:bg-red-500 hover:text-white text-slate-300 rounded-full transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{test.title}</h3>
            
            <div className="flex items-center justify-between text-sm text-slate-400 mt-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <span>{test.questions.length} Questions</span>
              </div>
              <Link to={`/tests/${test.id}/attempt`} className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                Attempt Test <Play className="w-3 h-3" />
              </Link>
            </div>

            {/* Assignment Status */}
            <div className="mt-4 pt-4 border-t border-slate-800">
              {test.batch && test.status === 'Published' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Assigned to:</span>
                    <span className="text-white font-medium">{test.course} - {test.batch}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Due:</span>
                    <span className="text-white font-medium">{new Date(test.dueDate!).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => openAssignModal(test)} className="flex-1 py-1.5 px-3 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-lg text-xs font-medium transition-colors">Edit Assignment</button>
                    <button onClick={() => handleUnassignTest(test.id!)} className="flex-1 py-1.5 px-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-xs font-medium transition-colors">Unassign</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => openAssignModal(test)} className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors">
                  Assign Test
                </button>
              )}
            </div>
          </div>
        ))}
        {tests.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500">
            No tests created yet. Click "Create New Test" to get started.
          </div>
        )}
      </div>

      {/* Test Builder Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 rounded-3xl w-full max-w-4xl border border-slate-700 shadow-2xl my-8 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50 sticky top-0 z-10 rounded-t-3xl">
              <h2 className="text-xl font-bold text-white">{currentTest.id ? 'Edit Test' : 'Create New Test'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">&times;</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-8">
              <div>
                <label className="block text-sm font-bold text-white mb-2">Test Title</label>
                <input 
                  type="text" 
                  value={currentTest.title} 
                  onChange={e => setCurrentTest({...currentTest, title: e.target.value})} 
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                  placeholder="e.g. Physics Mid-Term Exam" 
                />
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Questions ({currentTest.questions.length})</h3>
                  <button onClick={addQuestion} className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-400 font-medium rounded-xl transition-colors">
                    <Plus className="w-4 h-4" /> Add Question
                  </button>
                </div>

                {currentTest.questions.map((q, index) => (
                  <div key={q.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 relative">
                    <button 
                      onClick={() => removeQuestion(q.id)} 
                      className="absolute top-4 right-4 p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors"
                      title="Remove Question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <div className="flex gap-3">
                      <span className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold shrink-0">
                        {index + 1}
                      </span>
                      <div className="flex-1 space-y-4">
                        <textarea 
                          value={q.question}
                          onChange={(e) => handleQuestionChange(q.id, 'question', e.target.value)}
                          placeholder="Type your question here..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white min-h-[80px] resize-y focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-500 w-4">A.</span>
                            <input type="text" value={q.optionA} onChange={e => handleQuestionChange(q.id, 'optionA', e.target.value)} placeholder="Option A" className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-1 focus:ring-indigo-500" />
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-500 w-4">B.</span>
                            <input type="text" value={q.optionB} onChange={e => handleQuestionChange(q.id, 'optionB', e.target.value)} placeholder="Option B" className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-1 focus:ring-indigo-500" />
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-500 w-4">C.</span>
                            <input type="text" value={q.optionC} onChange={e => handleQuestionChange(q.id, 'optionC', e.target.value)} placeholder="Option C" className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-1 focus:ring-indigo-500" />
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-500 w-4">D.</span>
                            <input type="text" value={q.optionD} onChange={e => handleQuestionChange(q.id, 'optionD', e.target.value)} placeholder="Option D" className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-1 focus:ring-indigo-500" />
                          </div>
                        </div>

                        <div className="pt-2 flex items-center gap-3">
                          <label className="text-sm font-medium text-emerald-400">Correct Answer:</label>
                          <select 
                            value={q.correctAnswer} 
                            onChange={e => handleQuestionChange(q.id, 'correctAnswer', e.target.value)}
                            className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg px-3 py-1.5 text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                          >
                            <option value="A">Option A</option>
                            <option value="B">Option B</option>
                            <option value="C">Option C</option>
                            <option value="D">Option D</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {currentTest.questions.length === 0 && (
                  <div className="text-center py-8 text-slate-500 bg-slate-950 rounded-2xl border border-dashed border-slate-800">
                    No questions added yet.
                  </div>
                )}
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-800 flex justify-end gap-3 bg-slate-800/30 sticky bottom-0 rounded-b-3xl">
              <button onClick={() => setShowModal(false)} className="px-6 py-2.5 rounded-xl font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">Cancel</button>
              <button onClick={saveTest} disabled={isSubmitting} className="px-6 py-2.5 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 disabled:opacity-50">
                <Save className="w-4 h-4" /> {isSubmitting ? 'Saving...' : 'Save Test'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Test Modal */}
      {showAssignModal && testToAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 rounded-3xl w-full max-w-lg border border-slate-700 shadow-2xl my-8 flex flex-col">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50 rounded-t-3xl">
              <h2 className="text-xl font-bold text-white">Assign Test: {testToAssign.title}</h2>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-white">&times;</button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-bold text-white mb-2">Subject</label>
                <input type="text" value={assignForm.subject} onChange={e => setAssignForm({...assignForm, subject: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Mathematics" />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">Duration (Minutes)</label>
                <input type="number" value={assignForm.duration} onChange={e => setAssignForm({...assignForm, duration: parseInt(e.target.value) || 0})} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500" min="1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Course *</label>
                  <select 
                    value={assignForm.course} 
                    onChange={e => setAssignForm({...assignForm, course: e.target.value, batch: ''})} 
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">{uniqueCourses.length === 0 ? "No courses available" : "Select Course \u25BC"}</option>
                    {uniqueCourses.map(course => (
                      <option key={course} value={course}>{course}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Batch *</label>
                  <select 
                    value={assignForm.batch} 
                    onChange={e => setAssignForm({...assignForm, batch: e.target.value})} 
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500"
                    disabled={!assignForm.course}
                  >
                    <option value="">
                      {!assignForm.course ? "Select Batch \u25BC" : (uniqueBatches.length === 0 ? "No batches available for this course" : "Select Batch \u25BC")}
                    </option>
                    {uniqueBatches.map(batch => (
                      <option key={batch} value={batch}>{batch}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Available From *</label>
                  <input type="datetime-local" value={assignForm.availableFrom} onChange={e => setAssignForm({...assignForm, availableFrom: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 [color-scheme:dark]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Due Date *</label>
                  <input type="datetime-local" value={assignForm.dueDate} onChange={e => setAssignForm({...assignForm, dueDate: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 [color-scheme:dark]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">Status</label>
                <select value={assignForm.status} onChange={e => setAssignForm({...assignForm, status: e.target.value as any})} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500">
                  <option value="Draft">Draft (Hidden from students)</option>
                  <option value="Published">Published (Visible to students)</option>
                </select>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-800 flex justify-end gap-3 bg-slate-800/30 rounded-b-3xl">
              <button onClick={() => setShowAssignModal(false)} className="px-6 py-2.5 rounded-xl font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">Cancel</button>
              <button onClick={handleAssignTest} disabled={isSubmitting} className="px-6 py-2.5 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 disabled:opacity-50">
                {isSubmitting ? 'Assigning...' : 'Assign Test'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
