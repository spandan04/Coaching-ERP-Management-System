import { collection, query, addDoc, updateDoc, doc, getDoc, deleteDoc, Timestamp, where, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, storage, fetchDocs, secondaryAuth } from '../../../services/firebase/firebase';
import { Student, StudentDocument, DashboardStats } from '../../../types/index';

export const getStudents = async (): Promise<{ active: Student[], archived: Student[] }> => {
  const allStudents = await fetchDocs<Student>(query(collection(db, 'students'), orderBy('createdAt', 'desc')));
  const active = allStudents.filter(s => s.status === 'active');
  const archived = allStudents.filter(s => s.status === 'archived');
  return { active, archived };
};

export const getStudent = async (id: string): Promise<Student | null> => {
  const docRef = doc(db, 'students', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Student;
  }
  return null;
};

export const getStudentDashboardStats = async (): Promise<DashboardStats> => {
  const { active, archived } = await getStudents();
  const total = active.length + archived.length;
  
  const courseMap = new Map<string, number>();
  const batchMap = new Map<string, number>();

  active.forEach(s => {
    courseMap.set(s.courseEnrolled, (courseMap.get(s.courseEnrolled) || 0) + 1);
    batchMap.set(s.batch, (batchMap.get(s.batch) || 0) + 1);
  });

  const studentsByCourse = Array.from(courseMap.entries()).map(([name, count]) => ({ name, count }));
  const studentsByBatch = Array.from(batchMap.entries()).map(([name, count]) => ({ name, count }));

  return {
    totalStudents: total,
    activeStudents: active.length,
    archivedStudents: archived.length,
    studentsByCourse,
    studentsByBatch
  };
};

export const addStudent = async (studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>, profilePhoto?: File): Promise<string> => {
  let profilePhotoUrl = studentData.profilePhotoUrl || '';

  if (profilePhoto) {
    const timestamp = Date.now();
    const photoRef = ref(storage, `students/photos/${timestamp}_${profilePhoto.name}`);
    await uploadBytes(photoRef, profilePhoto);
    profilePhotoUrl = await getDownloadURL(photoRef);
  }

  const newStudent = {
    ...studentData,
    profilePhotoUrl,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  const docRef = await addDoc(collection(db, 'students'), newStudent);
  return docRef.id;
};

export const updateStudent = async (id: string, data: Partial<Student>, profilePhoto?: File) => {
  let profilePhotoUrl = data.profilePhotoUrl;

  if (profilePhoto) {
    const timestamp = Date.now();
    const photoRef = ref(storage, `students/photos/${timestamp}_${profilePhoto.name}`);
    await uploadBytes(photoRef, profilePhoto);
    profilePhotoUrl = await getDownloadURL(photoRef);
  }

  const updateData: any = {
    ...data,
    updatedAt: Timestamp.now()
  };

  if (profilePhotoUrl !== undefined) {
    updateData.profilePhotoUrl = profilePhotoUrl;
  }

  const studentRef = doc(db, 'students', id);
  await updateDoc(studentRef, updateData);
};

export const setStudentStatus = async (id: string, status: 'active' | 'archived') => {
  await updateDoc(doc(db, 'students', id), { status, updatedAt: Timestamp.now() });
};

export const deleteStudent = async (id: string) => {
  await deleteDoc(doc(db, 'students', id));
};

export const uploadStudentDocument = async (studentId: string, type: string, file: File) => {
  const timestamp = Date.now();
  const docRef = ref(storage, `students/documents/${studentId}/${timestamp}_${file.name}`);
  await uploadBytes(docRef, file);
  const url = await getDownloadURL(docRef);

  await addDoc(collection(db, 'documents'), {
    studentId,
    type,
    url,
    uploadedAt: Timestamp.now()
  });
};

export const getStudentDocuments = async (studentId: string): Promise<StudentDocument[]> => {
  const docs = await fetchDocs<StudentDocument>(query(collection(db, 'documents'), where('studentId', '==', studentId)));
  return docs.sort((a, b) => (b.uploadedAt?.toMillis() || 0) - (a.uploadedAt?.toMillis() || 0));
};

export const enableStudentPortalAccess = async (studentId: string, admissionNumber: string, temporaryPassword: string): Promise<string> => {
  try {
    const internalEmail = `${admissionNumber.trim()}@students.kshitijclasses.com`;
    
    // Create the user using the secondary auth instance so the admin doesn't get logged out
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, internalEmail, temporaryPassword);
    const authUid = userCredential.user.uid;

    // Update the student document
    await updateDoc(doc(db, 'students', studentId), {
      portalAccess: true,
      authUid: authUid,
      mustChangePassword: true,
      updatedAt: Timestamp.now()
    });

    return authUid;
  } catch (error) {
    console.error("Error enabling portal access:", error);
    throw error;
  }
};

