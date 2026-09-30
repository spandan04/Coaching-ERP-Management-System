import { collection, query, addDoc, updateDoc, doc, getDoc, deleteDoc, Timestamp, orderBy } from 'firebase/firestore';
import { db, fetchDocs } from '../../../services/firebase/firebase';
import { VideoLecture } from '../../../types/index';
import { getStudents } from '../../student-management/services/studentService';

export const getVideoLectures = async (): Promise<VideoLecture[]> => {
  return await fetchDocs<VideoLecture>(query(collection(db, 'videoLectures'), orderBy('createdAt', 'desc')));
};

export const getPublishedVideoLectures = async (course: string, batch: string): Promise<VideoLecture[]> => {
  const lectures = await getVideoLectures();
  return lectures.filter(l => l.status === 'Published' && l.course === course && l.batch === batch);
};

export const getVideoLecture = async (id: string): Promise<VideoLecture | null> => {
  const docRef = doc(db, 'videoLectures', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as VideoLecture;
  }
  return null;
};

export const addVideoLecture = async (lectureData: Omit<VideoLecture, 'id' | 'createdAt'>): Promise<string> => {
  const newLecture = {
    ...lectureData,
    createdAt: Timestamp.now(),
  };

  const docRef = await addDoc(collection(db, 'videoLectures'), newLecture);
  return docRef.id;
};

export const updateVideoLecture = async (id: string, data: Partial<VideoLecture>) => {
  const lectureRef = doc(db, 'videoLectures', id);
  await updateDoc(lectureRef, data);
};

export const deleteVideoLecture = async (id: string) => {
  await deleteDoc(doc(db, 'videoLectures', id));
};

export const getCoursesAndBatches = async (): Promise<{ courses: string[], batchesByCourse: Record<string, string[]> }> => {
  const { active } = await getStudents();
  
  const courses = new Set<string>();
  const batchesByCourse: Record<string, Set<string>> = {};

  active.forEach(student => {
    if (student.courseEnrolled) {
      courses.add(student.courseEnrolled);
      if (!batchesByCourse[student.courseEnrolled]) {
        batchesByCourse[student.courseEnrolled] = new Set();
      }
      if (student.batch) {
        batchesByCourse[student.courseEnrolled].add(student.batch);
      }
    }
  });

  const processedBatchesByCourse: Record<string, string[]> = {};
  for (const course in batchesByCourse) {
    processedBatchesByCourse[course] = Array.from(batchesByCourse[course]);
  }

  return {
    courses: Array.from(courses),
    batchesByCourse: processedBatchesByCourse
  };
};
