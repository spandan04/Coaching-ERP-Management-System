import { useEffect, useState, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStudent, getStudentDocuments, uploadStudentDocument, enableStudentPortalAccess } from '../services/studentService';
import { Student } from '../../../types/index';
import { FileText, Upload, ArrowLeft } from 'lucide-react';

export const StudentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState('Aadhaar Card');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [enablingPortal, setEnablingPortal] = useState(false);
  const [tempPassword, setTempPassword] = useState('');

  useEffect(() => {
    if (id) {
      getStudent(id).then(setStudent);
      getStudentDocuments(id).then(setDocuments);
      setLoading(false);
    }
  }, [id]);

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (!student) return <div className="text-center py-10">Student not found.</div>;

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!docFile || !id) return;
    setUploading(true);
    try {
      await uploadStudentDocument(id, docType, docFile);
      const docs = await getStudentDocuments(id);
      setDocuments(docs);
      setDocFile(null);
    } catch (err) {
      alert("Error uploading document.");
    } finally {
      setUploading(false);
    }
  };

  const handleEnablePortal = async () => {
    if (!student || !id) return;
    setEnablingPortal(true);
    try {
      // Generate a temporary password e.g. Kshitij@019 based on admission number last 3 digits
      const admNoStr = student.admissionNumber || '';
      const lastThree = admNoStr.length >= 3 ? admNoStr.slice(-3) : '123';
      const temporaryPassword = `Kshitij@${lastThree}`;
      
      await enableStudentPortalAccess(id, student.admissionNumber, temporaryPassword);
      
      // Update local state
      setStudent(prev => prev ? { ...prev, portalAccess: true, mustChangePassword: true } : prev);
      setTempPassword(temporaryPassword);
    } catch (err) {
      alert("Error enabling portal access. Check console.");
    } finally {
      setEnablingPortal(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!student) return;
    const creds = `Student Portal Credentials\nStudent ID: ${student.admissionNumber}\nTemporary Password: ${tempPassword}`;
    navigator.clipboard.writeText(creds);
    alert('Credentials copied to clipboard!');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate(-1)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-3xl font-bold text-white font-heading tracking-tight">Student Profile</h1>
      </div>

      <div className="bg-slate-900 shadow-[0_4px_24px_rgba(0,0,0,0.2)] overflow-hidden rounded-3xl border border-slate-800">
        <div className="px-6 py-8 sm:px-10 flex flex-col sm:flex-row items-center gap-8 bg-slate-900/50">
          <div className="h-28 w-28 rounded-full overflow-hidden bg-slate-800 flex-shrink-0 border-4 border-slate-800 shadow-xl">
            {student.profilePhotoUrl ? (
              <img src={student.profilePhotoUrl} alt={student.fullName} className="h-full w-full object-cover grayscale" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-indigo-400 text-4xl font-bold font-heading">
                {student.fullName.charAt(0)}
              </div>
            )}
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-2xl leading-7 font-bold text-white font-heading">{student.fullName}</h3>
            <p className="mt-2 max-w-2xl text-sm font-medium text-slate-400">Admission No: <span className="text-slate-300">{student.admissionNumber}</span></p>
            <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {student.courseEnrolled}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                Batch {student.batch}
              </span>
              {student.status === 'archived' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                  Archived
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800/50 px-6 py-8 sm:px-10">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-semibold text-slate-400">Email Address</dt>
              <dd className="mt-1.5 text-sm font-medium text-white">{student.email}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-semibold text-slate-400">Mobile Number</dt>
              <dd className="mt-1.5 text-sm font-medium text-white">{student.mobileNumber}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-semibold text-slate-400">Date of Birth</dt>
              <dd className="mt-1.5 text-sm font-medium text-white">{student.dateOfBirth}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-semibold text-slate-400">Gender</dt>
              <dd className="mt-1.5 text-sm font-medium text-white">{student.gender}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-semibold text-slate-400">Address</dt>
              <dd className="mt-1.5 text-sm font-medium text-white">{student.address}, {student.city}, {student.state} - {student.pincode}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-semibold text-slate-400">Guardian Name</dt>
              <dd className="mt-1.5 text-sm font-medium text-white">{student.guardianName}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-semibold text-slate-400">Guardian Contact</dt>
              <dd className="mt-1.5 text-sm font-medium text-white">{student.guardianMobile}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-slate-900 shadow-[0_4px_24px_rgba(0,0,0,0.2)] rounded-3xl border border-slate-800">
        <div className="px-6 py-6 sm:px-10 border-b border-slate-800/50 flex justify-between items-center">
          <div>
            <h3 className="text-xl leading-6 font-semibold text-white font-heading">Student Portal Access</h3>
            <p className="mt-1 text-sm text-slate-400">Manage student's ability to log into the student portal.</p>
          </div>
          <div className="flex items-center">
            <span className={`mr-3 text-sm font-medium ${student.portalAccess ? 'text-emerald-400' : 'text-slate-400'}`}>
              {student.portalAccess ? 'Enabled' : 'Disabled'}
            </span>
            {!student.portalAccess && (
              <button
                onClick={handleEnablePortal}
                disabled={enablingPortal}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {enablingPortal ? 'Enabling...' : 'Enable Access'}
              </button>
            )}
          </div>
        </div>
        
        {tempPassword && (
          <div className="px-6 py-6 sm:px-10 bg-indigo-900/20 border-b border-indigo-500/20">
            <div className="bg-slate-950 border border-indigo-500/30 rounded-xl p-6">
              <h4 className="text-indigo-400 font-semibold mb-4">Student Portal Credentials</h4>
              <div className="space-y-3 mb-6">
                <div>
                  <span className="text-sm text-slate-400 block mb-1">Student ID:</span>
                  <span className="font-mono text-white bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 inline-block">{student.admissionNumber}</span>
                </div>
                <div>
                  <span className="text-sm text-slate-400 block mb-1">Temporary Password:</span>
                  <span className="font-mono text-white bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 inline-block">{tempPassword}</span>
                </div>
                <div>
                  <span className="text-sm text-slate-400 block mb-1">Portal Access:</span>
                  <span className="text-emerald-400 font-medium">Enabled</span>
                </div>
              </div>
              <button 
                onClick={handleCopyCredentials}
                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors border border-slate-700"
              >
                Copy Credentials
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-slate-900 shadow-[0_4px_24px_rgba(0,0,0,0.2)] rounded-3xl border border-slate-800">
        <div className="px-6 py-6 sm:px-10 border-b border-slate-800/50">
          <h3 className="text-xl leading-6 font-semibold text-white font-heading">Documents</h3>
        </div>
        <div className="px-6 py-6 sm:p-10">
          <form onSubmit={handleUpload} className="flex flex-col sm:flex-row gap-4 items-end mb-8 bg-slate-950 p-6 rounded-2xl border border-slate-800">
            <div className="flex-1 w-full">
              <label className="block text-sm font-semibold text-slate-300">Document Type</label>
              <select value={docType} onChange={(e) => setDocType(e.target.value)} className="mt-1.5 block w-full pl-3 pr-10 py-2.5 text-sm border-slate-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-xl bg-slate-900 text-white border transition-colors">
                <option value="Aadhaar Card">Aadhaar Card</option>
                <option value="Leaving Certificate">Leaving Certificate</option>
                <option value="Marksheet">Marksheet</option>
                <option value="Passport Size Photo">Passport Size Photo</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex-1 w-full">
              <label className="block text-sm font-semibold text-slate-300">File</label>
              <input type="file" required onChange={(e) => setDocFile(e.target.files?.[0] || null)} className="mt-1.5 block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-900/50 file:text-indigo-300 hover:file:bg-indigo-900 border border-slate-700 rounded-xl bg-slate-900 py-1 transition-colors" />
            </div>
            <button type="submit" disabled={!docFile || uploading} className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-semibold rounded-xl shadow-[0_4px_12px_rgba(79,70,229,0.3)] text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 h-[46px] transition-colors w-full sm:w-auto justify-center">
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </form>

          <ul className="divide-y divide-slate-800 border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/50">
            {documents.length === 0 ? (
              <li className="px-6 py-10 text-center text-sm font-medium text-slate-400">No documents uploaded yet.</li>
            ) : (
              documents.map((doc) => (
                <li key={doc.id} className="pl-4 pr-6 py-4 flex items-center justify-between text-sm hover:bg-slate-900 transition-colors">
                  <div className="w-0 flex-1 flex items-center">
                    <FileText className="flex-shrink-0 h-5 w-5 text-indigo-400" />
                    <span className="ml-3 flex-1 w-0 truncate font-medium text-slate-300">{doc.type}</span>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/10 px-3 py-1.5 rounded-lg">
                      Download / View
                    </a>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};
