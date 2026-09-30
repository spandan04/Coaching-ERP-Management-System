import { useState, useEffect } from 'react';
import { getLectures, getAttendanceByLecture, saveAttendanceRecord } from '../services/academicService';
import { getStudents } from '../../student-management/services/studentService';
import { CheckCircle, XCircle, Users, Calendar, Save } from 'lucide-react';

interface Lecture {
  id: string;
  title: string;
  subject: string;
  batch: string;
  date: string;
}

interface AttendanceRecord {
  [studentId: string]: 'present' | 'absent';
}

export const AttendanceManagement = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [selectedLecture, setSelectedLecture] = useState<string>('');
  
  const [attendance, setAttendance] = useState<AttendanceRecord>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const batches = Array.from(new Set(students.map(s => s.batch))).filter(Boolean);

  useEffect(() => {
    const fetchInitData = async () => {
      try {
        const [studentData, lectureData] = await Promise.all([
          getStudents(),
          getLectures()
        ]);
        setStudents(studentData.active);
        setLectures(lectureData.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchInitData();
  }, []);

  useEffect(() => {
    const loadAttendance = async () => {
      if (!selectedLecture) {
        setAttendance({});
        return;
      }
      setLoading(true);
      try {
        const data = await getAttendanceByLecture(selectedLecture);
        if (data) {
          setAttendance(data.records || {});
        } else {
          setAttendance({});
        }
      } catch (error) {
        console.error("Error loading attendance:", error);
      } finally {
        setLoading(false);
      }
    };
    loadAttendance();
  }, [selectedLecture]);

  const filteredStudents = students.filter(s => s.batch === selectedBatch && s.status === 'active');
  const availableLectures = lectures.filter(l => l.batch === selectedBatch);

  const handleMark = (studentId: string, status: 'present' | 'absent') => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const markAll = (status: 'present' | 'absent') => {
    const newAttendance = { ...attendance };
    filteredStudents.forEach(s => {
      newAttendance[s.id!] = status;
    });
    setAttendance(newAttendance);
  };

  const handleSave = async () => {
    if (!selectedLecture || filteredStudents.length === 0) return;
    
    setSaving(true);
    try {
      await saveAttendanceRecord(selectedLecture, {
        lectureId: selectedLecture,
        batch: selectedBatch,
        date: new Date().toISOString(),
        records: attendance
      });
      alert('Attendance saved successfully!');
    } catch (error) {
      console.error("Error saving attendance:", error);
      alert('Error saving attendance. Check console.');
    } finally {
      setSaving(false);
    }
  };

  // Calculate stats
  const totalStudents = filteredStudents.length;
  const presentCount = Object.values(attendance).filter(v => v === 'present').length;
  const absentCount = Object.values(attendance).filter(v => v === 'absent').length;
  const percentage = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight font-heading">Attendance Management</h1>
        <p className="mt-2 text-sm text-slate-400 font-medium">Mark and review student attendance.</p>
      </div>

      <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Select Batch</label>
            <select
              value={selectedBatch}
              onChange={(e) => { setSelectedBatch(e.target.value); setSelectedLecture(''); }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">-- Select a Batch --</option>
              {batches.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Select Lecture</label>
            <select
              value={selectedLecture}
              onChange={(e) => setSelectedLecture(e.target.value)}
              disabled={!selectedBatch}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
            >
              <option value="">-- Select a Lecture --</option>
              {availableLectures.map(l => (
                <option key={l.id} value={l.id}>{l.title} ({l.date})</option>
              ))}
            </select>
          </div>
        </div>

        {selectedLecture && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{totalStudents}</div>
                  <div className="text-xs font-medium text-slate-400">Total Students</div>
                </div>
              </div>
              <div className="bg-emerald-500/10 rounded-2xl p-4 border border-emerald-500/20 flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{presentCount}</div>
                  <div className="text-xs font-medium text-emerald-400/80">Present ({percentage}%)</div>
                </div>
              </div>
              <div className="bg-rose-500/10 rounded-2xl p-4 border border-rose-500/20 flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-500/20 rounded-xl flex items-center justify-center text-rose-400">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{absentCount}</div>
                  <div className="text-xs font-medium text-rose-400/80">Absent</div>
                </div>
              </div>
            </div>

            {/* Attendance List */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <h3 className="font-bold text-white">Student List</h3>
                <div className="flex gap-2">
                  <button onClick={() => markAll('present')} className="px-3 py-1.5 text-xs font-medium bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-colors">Mark All Present</button>
                  <button onClick={() => markAll('absent')} className="px-3 py-1.5 text-xs font-medium bg-rose-500/10 text-rose-400 rounded-lg hover:bg-rose-500/20 transition-colors">Mark All Absent</button>
                </div>
              </div>
              
              {loading ? (
                <div className="p-8 text-center text-slate-500">Loading records...</div>
              ) : filteredStudents.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No students found in this batch.</div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {filteredStudents.map(student => (
                    <div key={student.id} className="p-4 flex items-center justify-between hover:bg-slate-900/50 transition-colors">
                      <div className="flex items-center gap-4">
                        {student.profilePhotoUrl ? (
                          <img src={student.profilePhotoUrl} alt={student.fullName} className="w-10 h-10 rounded-full object-cover border border-slate-700" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold border border-slate-700">
                            {student.fullName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-white">{student.fullName}</div>
                          <div className="text-xs text-slate-500">{student.admissionNumber}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleMark(student.id!, 'present')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            attendance[student.id!] === 'present' 
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          <CheckCircle className="w-4 h-4" /> Present
                        </button>
                        <button
                          onClick={() => handleMark(student.id!, 'absent')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            attendance[student.id!] === 'absent' 
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          <XCircle className="w-4 h-4" /> Absent
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
