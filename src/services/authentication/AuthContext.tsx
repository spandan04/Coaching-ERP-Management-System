import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import { Student } from '../../types/index';

interface AuthContextType {
  currentUser: User | null;
  studentData: Student | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  studentData: null,
  loading: true,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user && user.email) {
        try {
          // Check if this user is a student by matching authUid
          const q = query(collection(db, 'students'), where('authUid', '==', user.uid));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const studentDoc = querySnapshot.docs[0];
            setStudentData({ id: studentDoc.id, ...studentDoc.data() } as Student);
          } else {
            setStudentData(null);
          }
        } catch (error) {
          console.error("Error fetching student data:", error);
          setStudentData(null);
        }
      } else {
        setStudentData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ currentUser, studentData, loading, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
