import { initializeApp } from 'firebase/app';
import { getFirestore, getDocs, Query } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCXC2tuRKLk-QgttTXu8v2aoe7vArl-FkY",
  authDomain: "coaching-erp-68f5c.firebaseapp.com",
  projectId: "coaching-erp-68f5c",
  storageBucket: "coaching-erp-68f5c.firebasestorage.app",
  messagingSenderId: "677813207639",
  appId: "1:677813207639:web:7bdafc8df4cb9a59329912",
  measurementId: "G-V9MXBEZ2TP"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

// Secondary app for creating users without signing out the current admin
const secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
export const secondaryAuth = getAuth(secondaryApp);

export const fetchDocs = async <T>(q: Query): Promise<T[]> => {
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as T);
};
