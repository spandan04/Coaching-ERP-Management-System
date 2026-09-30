import { useState, type ChangeEvent, type FormEvent, type InputHTMLAttributes } from 'react';
import { useNavigate } from 'react-router-dom';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  colSpan?: 2 | 3 | 6;
  isSelect?: boolean;
  options?: { value: string; label: string }[];
  required?: boolean;
  className?: string;
}

const InputField = ({ label, colSpan = 3, isSelect, options, required, className = '', ...props }: InputFieldProps) => {
  const baseClasses = "shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-700 bg-slate-950 text-white rounded-xl py-2.5 px-3 border transition-colors";
  
  return (
    <div className={`sm:col-span-${colSpan}`}>
      <label className="block text-sm font-semibold text-slate-300">
        {label} {required && '*'}
      </label>
      <div className="mt-1.5">
        {isSelect ? (
          <select required={required} className={`${baseClasses} ${className}`} {...(props as any)}>
            {options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        ) : (
          <input required={required} className={`${baseClasses} ${className}`} {...props as any} />
        )}
      </div>
    </div>
  );
};

export const StudentForm = ({ 
  initialData, 
  onSubmit, 
  title, 
  subtitle, 
  submitLabel = 'Save Student' 
}: any) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState(initialData);
  const [photo, setPhoto] = useState<File | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onSubmit(formData, photo);
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setLoading(false);
    }
  };

  const personalFields = [
    { label: 'Admission Number', name: 'admissionNumber', required: true, type: 'text', colSpan: 3 },
    { label: 'Full Name', name: 'fullName', required: true, type: 'text', colSpan: 3 },
    { label: 'Date of Birth', name: 'dateOfBirth', required: true, type: 'date', colSpan: 2, className: '[color-scheme:dark]' },
    { label: 'Gender', name: 'gender', required: true, isSelect: true, options: [{value: 'Male', label: 'Male'}, {value: 'Female', label: 'Female'}, {value: 'Other', label: 'Other'}], colSpan: 2 },
    { label: 'Blood Group', name: 'bloodGroup', type: 'text', colSpan: 2 },
    { label: 'Email Address', name: 'email', required: true, type: 'email', colSpan: 3 },
    { label: 'Mobile Number', name: 'mobileNumber', required: true, type: 'tel', colSpan: 3 },
  ];

  const COURSES = ['FYJC', 'SYJC', 'JEE', 'NEET', 'MHT-CET', 'Class 10', 'Class 9', 'Class 8'];
  const BATCHES = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'Class 11-A', 'Class 11-B', 'Class 12-A', 'Class 12-B'];

  const academicFields = [
    { 
      label: 'Course Enrolled', 
      name: 'courseEnrolled', 
      required: true, 
      isSelect: true, 
      options: [{value: '', label: 'Select Course'}, ...COURSES.map(c => ({value: c, label: c}))], 
      colSpan: 3 
    },
    { 
      label: 'Batch', 
      name: 'batch', 
      required: true, 
      isSelect: true, 
      options: [{value: '', label: 'Select Batch'}, ...BATCHES.map(b => ({value: b, label: b}))], 
      colSpan: 3 
    },
    { label: 'Admission Date', name: 'admissionDate', required: true, type: 'date', colSpan: 2, className: '[color-scheme:dark]' },
    { label: 'Previous School/College', name: 'previousSchool', type: 'text', colSpan: 2 },
    { label: 'Academic Qualification', name: 'academicQualification', type: 'text', colSpan: 2 },
  ];

  const contactFields = [
    { label: 'Address', name: 'address', required: true, type: 'text', colSpan: 6 },
    { label: 'City', name: 'city', required: true, type: 'text', colSpan: 2 },
    { label: 'State', name: 'state', required: true, type: 'text', colSpan: 2 },
    { label: 'Pincode', name: 'pincode', required: true, type: 'text', colSpan: 2 },
    { label: 'Guardian Name', name: 'guardianName', required: true, type: 'text', colSpan: 2 },
    { label: 'Guardian Mobile', name: 'guardianMobile', required: true, type: 'text', colSpan: 2 },
    { label: 'Guardian Occupation', name: 'guardianOccupation', type: 'text', colSpan: 2 },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white font-heading tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-slate-400 font-medium">{subtitle}</p>
        </div>
      </div>

      <div className="bg-slate-900 shadow-[0_4px_24px_rgba(0,0,0,0.2)] px-4 py-8 rounded-3xl sm:p-10 border border-slate-800">
        <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-slate-800/50">
          
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white font-heading">Personal Information</h3>
            {error && <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-xl text-sm">{error}</div>}
            <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-6">
              {personalFields.map((field: any) => (
                <InputField key={field.name} {...field} value={formData[field.name]} onChange={handleChange} />
              ))}
              <div className="sm:col-span-6">
                <label className="block text-sm font-semibold text-slate-300">Profile Photo</label>
                <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} className="mt-1.5 block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-900/50 file:text-indigo-300 hover:file:bg-indigo-900 transition-colors shadow-sm border border-slate-700 rounded-xl py-2.5 px-3 bg-slate-950" />
              </div>
            </div>
          </div>

          <div className="pt-8 space-y-6">
            <h3 className="text-xl font-semibold text-white font-heading">Academic & Course Information</h3>
            <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-6">
              {academicFields.map((field: any) => (
                <InputField key={field.name} {...field} value={formData[field.name]} onChange={handleChange} />
              ))}
            </div>
          </div>

          <div className="pt-8 space-y-6">
            <h3 className="text-xl font-semibold text-white font-heading">Contact & Guardian Information</h3>
            <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-6">
              {contactFields.map((field: any) => (
                <InputField key={field.name} {...field} value={formData[field.name]} onChange={handleChange} />
              ))}
            </div>
          </div>

          <div className="pt-8 flex justify-end space-x-4">
            <button type="button" onClick={() => navigate(-1)} className="bg-slate-800 py-2.5 px-5 border border-slate-700 rounded-xl shadow-sm text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="inline-flex justify-center py-2.5 px-5 border border-transparent shadow-[0_4px_12px_rgba(79,70,229,0.3)] text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-colors">
              {loading ? 'Saving...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
