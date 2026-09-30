import { collection, query, addDoc, updateDoc, doc, deleteDoc, Timestamp, orderBy } from 'firebase/firestore';
import { db, fetchDocs } from '../../../services/firebase/firebase';

// Announcements
export const getAnnouncements = () => fetchDocs<any>(query(collection(db, 'announcements'), orderBy('date', 'desc')));
export const addAnnouncement = (data: any) => addDoc(collection(db, 'announcements'), data);
export const updateAnnouncement = (id: string, data: any) => updateDoc(doc(db, 'announcements', id), data);
export const deleteAnnouncement = (id: string) => deleteDoc(doc(db, 'announcements', id));

// Notices
export const getNotices = () => fetchDocs<any>(query(collection(db, 'notices'), orderBy('date', 'desc')));
export const addNotice = (data: any) => addDoc(collection(db, 'notices'), data);
export const updateNotice = (id: string, data: any) => updateDoc(doc(db, 'notices', id), data);
export const deleteNotice = (id: string) => deleteDoc(doc(db, 'notices', id));

// Notifications
export const getNotifications = () => fetchDocs<any>(query(collection(db, 'notifications'), orderBy('date', 'desc')));
export const addNotification = (data: any) => addDoc(collection(db, 'notifications'), data);
export const deleteNotification = (id: string) => deleteDoc(doc(db, 'notifications', id));

// Circulars
export const getCirculars = () => fetchDocs<any>(query(collection(db, 'circulars'), orderBy('date', 'desc')));
export const addCircular = (data: any) => addDoc(collection(db, 'circulars'), data);
export const deleteCircular = (id: string) => deleteDoc(doc(db, 'circulars', id));
