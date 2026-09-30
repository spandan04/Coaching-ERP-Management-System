import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getStudent, updateStudent } from '../services/studentService';
import { StudentForm } from '../components/StudentForm';
import { Student } from '../../../types/index';

export const EditStudent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getStudent(id).then(data => {
        setStudent(data);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) return <div className="text-center py-10 text-slate-400">Loading...</div>;
  if (!student) return <div className="text-center py-10 text-slate-400">Student not found.</div>;

  const handleSubmit = async (formData: any, photo: File | null) => {
    if (!id) return;
    await updateStudent(id, {
      ...formData,
      gender: formData.gender as any
    }, photo || undefined);
    navigate(`/students/${id}`);
  };

  return (
    <StudentForm 
      title="Edit Student" 
      subtitle={`Update details for ${student.fullName}.`}
      initialData={student} 
      onSubmit={handleSubmit} 
      submitLabel="Save Changes" 
    />
  );
};

