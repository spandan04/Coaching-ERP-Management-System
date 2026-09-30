export interface Student {
  id?: string;
  admissionNumber: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  mobileNumber: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  courseEnrolled: string;
  batch: string;
  admissionDate: string;
  previousSchool?: string;
  academicQualification?: string;
  guardianName: string;
  guardianMobile: string;
  guardianOccupation?: string;
  bloodGroup?: string;
  profilePhotoUrl?: string;
  status: 'active' | 'archived';
  portalAccess?: boolean;
  authUid?: string;
  mustChangePassword?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface StudentDocument {
  id?: string;
  studentId: string;
  type: string;
  url: string;
  uploadedAt: any;
}

export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  archivedStudents: number;
  studentsByCourse: { name: string; count: number }[];
  studentsByBatch: { name: string; count: number }[];
}

export interface FeeStructure {
  id: string;
  courseName: string;
  batch: string;
  totalFees: number;
  registrationFees: number;
  tuitionFees: number;
  studyMaterialFees: number;
  otherCharges: number;
  createdAt?: any;
}

export interface StudentFee {
  id: string;
  studentId: string;
  studentName: string;
  feeStructureId: string;
  courseName: string;
  batch: string;
  totalFees: number;
  amountPaid: number;
  remainingBalance: number;
  paymentStatus: 'Paid' | 'Partially Paid' | 'Pending';
  createdAt?: any;
}

export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  receiptNumber: string;
  amount: number;
  paymentMode: 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque';
  transactionId?: string;
  remarks?: string;
  date: any;
  createdAt?: any;
}

export interface Installment {
  id: string;
  studentId: string;
  installmentNumber: number;
  dueDate: any;
  amount: number;
  status: 'Paid' | 'Pending';
  createdAt?: any;
}

export interface VideoLecture {
  id?: string;
  title: string;
  subject: string;
  course: string;
  batch: string;
  description: string;
  videoUrl: string;
  lectureDate: string;
  status: 'Draft' | 'Published';
  createdAt?: any;
}
