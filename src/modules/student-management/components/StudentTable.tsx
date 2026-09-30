import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface StudentTableProps {
  students: any[];
  emptyMessage: string;
  renderActions: (student: any) => ReactNode;
}

export const StudentTable = ({ students, emptyMessage, renderActions }: StudentTableProps) => {
  return (
    <div className="overflow-x-auto flex-1">
      <table className="w-full text-left">
        <thead className="bg-slate-800/50 text-[10px] text-slate-400 uppercase tracking-wider">
          <tr>
            <th className="px-6 py-4 font-semibold">Student</th>
            <th className="px-6 py-4 font-semibold">Admission No</th>
            <th className="px-6 py-4 font-semibold">Course / Batch</th>
            <th className="px-6 py-4 font-semibold">Contact</th>
            <th className="px-6 py-4 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="text-sm divide-y divide-slate-800/50">
          {students.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            students.map((student) => (
              <tr key={student.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      {student.profilePhotoUrl ? (
                        <img className="h-10 w-10 rounded-full object-cover border border-slate-700" src={student.profilePhotoUrl} alt="" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                          <span className="text-indigo-400 font-bold text-xs">{student.fullName.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-semibold text-white">{student.fullName}</div>
                      <div className="text-[11px] font-medium text-slate-500 mt-0.5">{student.gender}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-300">{student.admissionNumber}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Joined: {student.admissionDate}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-300">{student.courseEnrolled}</div>
                  <div className="text-xs text-slate-500 mt-0.5 font-medium">{student.batch}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400 font-medium">
                  <div>{student.mobileNumber}</div>
                  <div className="mt-0.5">{student.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    {renderActions(student)}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
