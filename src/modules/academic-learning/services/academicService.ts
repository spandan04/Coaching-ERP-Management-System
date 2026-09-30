import { collection, query, addDoc, updateDoc, doc, deleteDoc, getDocs, Timestamp, where, orderBy, getDoc, setDoc } from 'firebase/firestore';
import { db, fetchDocs } from '../../../services/firebase/firebase';

// Lectures
export const getLectures = async () => fetchDocs<any>(query(collection(db, 'lectures'), orderBy('date', 'desc')));
export const addLecture = async (data: any) => addDoc(collection(db, 'lectures'), { ...data, createdAt: Timestamp.now() });
export const updateLecture = async (id: string, data: any) => updateDoc(doc(db, 'lectures', id), data);
export const deleteLecture = async (id: string) => deleteDoc(doc(db, 'lectures', id));

// Timetable
export const getTimetable = async () => fetchDocs<any>(query(collection(db, 'timetable')));
export const addTimetableEntry = async (data: any) => addDoc(collection(db, 'timetable'), { ...data, createdAt: Timestamp.now() });
export const updateTimetableEntry = async (id: string, data: any) => updateDoc(doc(db, 'timetable', id), data);
export const deleteTimetableEntry = async (id: string) => deleteDoc(doc(db, 'timetable', id));

// Attendance
export const getAttendanceByLecture = async (lectureId: string) => {
  const d = await getDoc(doc(db, 'attendance', lectureId));
  return d.exists() ? d.data() : null;
};
export const saveAttendanceRecord = async (lectureId: string, data: any) => {
  await setDoc(doc(db, 'attendance', lectureId), data);
};
export const getAttendanceRecords = async () => fetchDocs<any>(query(collection(db, 'attendance')));

// Tests
export const getTests = async () => fetchDocs<any>(query(collection(db, 'tests'), orderBy('createdAt', 'desc')));
export const getTest = async (id: string) => {
  const d = await getDoc(doc(db, 'tests', id));
  return d.exists() ? { id: d.id, ...d.data() } : null;
};
export const addTest = async (data: any) => addDoc(collection(db, 'tests'), { ...data, createdAt: Timestamp.now() });
export const updateTest = async (id: string, data: any) => updateDoc(doc(db, 'tests', id), data);
export const deleteTest = async (id: string) => deleteDoc(doc(db, 'tests', id));

// Results
export const getTestResult = async (id: string) => {
  const d = await getDoc(doc(db, 'results', id));
  return d.exists() ? { id: d.id, ...d.data() } : null;
};
export const getTestResults = async (testId: string) => fetchDocs<any>(query(collection(db, 'results'), where('testId', '==', testId)));
export const addTestResult = async (data: any) => addDoc(collection(db, 'results'), { ...data, submittedAt: Timestamp.now() });
export const getAllResults = async () => fetchDocs<any>(query(collection(db, 'results')));

// Test Attempts
export const getTestAttempt = async (testId: string, studentId: string) => {
  const attempts = await fetchDocs<any>(
    query(collection(db, 'testAttempts'), where('testId', '==', testId), where('studentId', '==', studentId))
  );
  return attempts.length > 0 ? attempts[0] : null;
};
export const startTestAttempt = async (data: any) => {
  const docRef = await addDoc(collection(db, 'testAttempts'), { ...data, startedAt: Timestamp.now(), completed: false });
  return docRef.id;
};
export const updateTestAttempt = async (id: string, data: any) => {
  await updateDoc(doc(db, 'testAttempts', id), data);
};
