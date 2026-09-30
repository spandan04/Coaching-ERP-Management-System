import React from 'react';
import { useAuth } from '../../../services/authentication/AuthContext';
import { User, Phone, Mail, MapPin, Calendar, BookOpen, GraduationCap, Users } from 'lucide-react';

export const StudentProfile = () => {
  const { studentData } = useAuth();

  if (!studentData) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-white tracking-tight">My Profile</h1>
        <p className="text-slate-400">View your personal and academic information.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-full bg-slate-800 border-4 border-slate-700 flex items-center justify-center text-indigo-400 font-bold overflow-hidden mb-4 shadow-lg">
              {studentData.profilePhotoUrl ? (
                <img src={studentData.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-slate-500" />
              )}
            </div>
            <h2 className="text-xl font-bold text-white">{studentData.fullName}</h2>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-medium mt-2">
              <GraduationCap className="w-3.5 h-3.5" />
              {studentData.courseEnrolled}
            </div>
            <p className="text-sm text-slate-400 mt-2">{studentData.batch}</p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-400" />
              Personal Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500">Date of Birth</p>
                <p className="text-white font-medium">{studentData.dateOfBirth}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Gender</p>
                <p className="text-white font-medium">{studentData.gender}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Blood Group</p>
                <p className="text-white font-medium">{studentData.bloodGroup || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Admission No</p>
                <p className="text-white font-medium">{studentData.admissionNumber}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-indigo-400" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500">Mobile Number</p>
                <p className="text-white font-medium">{studentData.mobileNumber}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Email Address</p>
                <p className="text-white font-medium">{studentData.email}</p>
              </div>
              <div className="md:col-span-2 flex gap-2 items-start mt-2">
                <MapPin className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">Address</p>
                  <p className="text-white font-medium">{studentData.address}, {studentData.city}, {studentData.state} - {studentData.pincode}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              Guardian Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500">Guardian Name</p>
                <p className="text-white font-medium">{studentData.guardianName}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Guardian Contact</p>
                <p className="text-white font-medium">{studentData.guardianMobile}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-slate-500">Occupation</p>
                <p className="text-white font-medium">{studentData.guardianOccupation || 'N/A'}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
