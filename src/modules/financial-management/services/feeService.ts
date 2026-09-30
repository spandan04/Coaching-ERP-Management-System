import { collection, query, addDoc, updateDoc, doc, deleteDoc, Timestamp, orderBy } from 'firebase/firestore';
import { db, fetchDocs } from '../../../services/firebase/firebase';

export const getFeeStructures = () => fetchDocs<any>(query(collection(db, 'feeStructures')));
export const addFeeStructure = (data: any) => addDoc(collection(db, 'feeStructures'), { ...data, createdAt: Timestamp.now() });
export const updateFeeStructure = (id: string, data: any) => updateDoc(doc(db, 'feeStructures', id), data);
export const deleteFeeStructure = (id: string) => deleteDoc(doc(db, 'feeStructures', id));

export const getStudentFees = () => fetchDocs<any>(query(collection(db, 'studentFees')));
export const addStudentFee = (data: any) => addDoc(collection(db, 'studentFees'), { ...data, assignedAt: Timestamp.now() });
export const updateStudentFee = (id: string, data: any) => updateDoc(doc(db, 'studentFees', id), data);
export const deleteStudentFee = (id: string) => deleteDoc(doc(db, 'studentFees', id));

export const getPayments = () => fetchDocs<any>(query(collection(db, 'payments'), orderBy('createdAt', 'desc')));
export const addPayment = (data: any) => addDoc(collection(db, 'payments'), { ...data, createdAt: Timestamp.now() });

export const getInstallments = () => fetchDocs<any>(query(collection(db, 'installments')));
export const addInstallment = (data: any) => addDoc(collection(db, 'installments'), { ...data, createdAt: Timestamp.now() });
export const updateInstallment = (id: string, data: any) => updateDoc(doc(db, 'installments', id), data);
export const deleteInstallment = (id: string) => deleteDoc(doc(db, 'installments', id));
