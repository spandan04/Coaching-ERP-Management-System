import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudents, setStudentStatus, deleteStudent } from '../services/studentService';
import { Student } from '../../../types/index';
import { Search, Eye, RefreshCw, Trash2 } from 'lucide-react';
import { StudentTable } from '../components/StudentTable';

export const ArchiveList = () => {
  const [archivedStudents, setArchivedStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getStudents();
      setArchivedStudents(data.archived);
      setLoading(false);
    };
    fetchData();
  }, []);

  const restoreStudent = async (id: string) => {
    await setStudentStatus(id, 'active');
    setArchivedStudents(archivedStudents.filter(s => s.id !== id));
  };

  
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = useMemo(() => {
    return archivedStudents.filter(student => {
      return student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [archivedStudents, searchTerm]);

  if (loading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight font-heading">Archived Students</h1>
          <p className="mt-2 text-sm text-slate-400 font-medium">View and restore past students.</p>
        </div>
      </div>

      <div className="bg-slate-900 shadow-[0_4px_24px_rgba(0,0,0,0.2)] rounded-3xl border border-slate-800 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row gap-4 bg-slate-900/50">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-700 rounded-xl bg-slate-950 text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 placeholder-slate-500 transition-all"
              placeholder="Search archive..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="opacity-80 hover:opacity-100 transition-opacity">
          <StudentTable 
            students={filteredStudents}
            emptyMessage="No archived students found."
            renderActions={(student) => (
              <>
                <button onClick={() => navigate(`/students/${student.id}`)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors" title="View Details">
                  <Eye className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => {
                    if (window.confirm('Restore this student to active directory?')) {
                      restoreStudent(student.id!);
                    }
                  }} 
                  className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors" title="Restore"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button 
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to PERMANENTLY delete this student? This cannot be undone.')) {
                      try {
                        await deleteStudent(student.id!);
                        setArchivedStudents(archivedStudents.filter(s => s.id !== student.id));
                      } catch(e) {
                        alert("Failed to delete");
                      }
                    }
                  }} 
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
          />
        </div>
      </div>
    </div>
  );
};

