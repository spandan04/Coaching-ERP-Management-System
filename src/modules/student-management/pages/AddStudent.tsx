import { useNavigate } from 'react-router-dom';
import { addStudent } from '../services/studentService';
import { StudentForm } from '../components/StudentForm';

export const AddStudent = () => {
  const navigate = useNavigate();

  const initialData = {
    admissionNumber: '',
    fullName: '',
    dateOfBirth: '',
    gender: 'Male',
    mobileNumber: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    courseEnrolled: '',
    batch: '',
    admissionDate: new Date().toISOString().split('T')[0],
    previousSchool: '',
    academicQualification: '',
    guardianName: '',
    guardianMobile: '',
    guardianOccupation: '',
    bloodGroup: '',
  };

  const handleSubmit = async (formData: any, photo: File | null) => {
    await addStudent({
      ...formData,
      status: 'active',
      gender: formData.gender as any
    }, photo || undefined);
    navigate('/students');
  };

  return (
    <StudentForm 
      title="Add New Student" 
      subtitle="Enter details for new admission."
      initialData={initialData} 
      onSubmit={handleSubmit} 
      submitLabel="Save Student" 
    />
  );
};

