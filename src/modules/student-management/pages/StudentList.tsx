import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudents, setStudentStatus } from '../services/studentService';
import { Student } from '../../../types/index';
import { Search, Filter, Eye, Edit, Archive as ArchiveIcon } from 'lucide-react';
import { StudentTable } from '../components/StudentTable';

export const StudentList = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getStudents();
      setStudents(data.active);
      setLoading(false);
    };
    fetchData();
  }, []);

  const archiveStudent = async (id: string) => {
    await setStudentStatus(id, 'archived');
    setStudents(students.filter(s => s.id !== id));
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [batchFilter, setBatchFilter] = useState('');

  const courses = Array.from(new Set(students.map(s => s.courseEnrolled))).filter(Boolean);
  const batches = Array.from(new Set(students.map(s => s.batch))).filter(Boolean);

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCourse = courseFilter ? student.courseEnrolled === courseFilter : true;
      const matchesBatch = batchFilter ? student.batch === batchFilter : true;
      return matchesSearch && matchesCourse && matchesBatch;
    });
  }, [students, searchTerm, courseFilter, batchFilter]);

  if (loading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight font-heading">Students Directory</h1>
          <p className="mt-2 text-sm text-slate-400 font-medium">Manage all active students here.</p>
        </div>
        <button
          onClick={() => navigate('/students/new')}
          className="inline-flex items-center justify-center px-5 py-2.5 shadow-lg shadow-indigo-600/20 text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
        >
          Add New Student
        </button>
      </div>

      <div className="bg-slate-900 shadow-[0_4px_24px_rgba(0,0,0,0.2)] rounded-3xl border border-slate-800 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row gap-4 bg-slate-900/50">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-700 rounded-xl bg-slate-950 text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 placeholder-slate-500 transition-all"
              placeholder="Search by name or admission no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-slate-500 hidden sm:block" />
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="block w-full sm:w-40 pl-3 pr-8 py-2.5 text-sm border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl bg-slate-950 text-slate-200 border transition-all"
            >
              <option value="">All Courses</option>
              {courses.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="block w-full sm:w-40 pl-3 pr-8 py-2.5 text-sm border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl bg-slate-950 text-slate-200 border transition-all"
            >
              <option value="">All Batches</option>
              {batches.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>

        <StudentTable 
          students={filteredStudents}
          emptyMessage="No students found matching your criteria."
          renderActions={(student) => (
            <>
              <button onClick={() => navigate(`/students/${student.id}`)} className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors" title="View Details">
                <Eye className="h-4 w-4" />
              </button>
              <button onClick={() => navigate(`/students/${student.id}/edit`)} className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors" title="Edit">
                <Edit className="h-4 w-4" />
              </button>
              <button 
                onClick={() => {
                  if (window.confirm('Are you sure you want to archive this student?')) {
                    archiveStudent(student.id!);
                  }
                }} 
                className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors" title="Archive"
              >
                <ArchiveIcon className="h-4 w-4" />
              </button>
            </>
          )}
        />
      </div>
    </div>
  );
};

