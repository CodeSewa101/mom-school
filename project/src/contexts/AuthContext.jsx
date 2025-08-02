import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { auth, db } from '../config/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const register = useCallback(async (email, password, name) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email,
        name,
        role: 'admin',
        createdAt: new Date(),
        lastLogin: null
      });

      return userCredential;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (!userDoc.exists() || userDoc.data().role !== 'admin') {
        await signOut(auth);
        throw new Error('Access denied. Admin only.');
      }

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        lastLogin: new Date()
      }, { merge: true });

      setCurrentUser(userCredential.user);
      setUserData(userDoc.data());

      return userCredential;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserData(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists() && userDoc.data().role === 'admin') {
            setCurrentUser(user);
            setUserData(userDoc.data());
          } else {
            await logout();
          }
        } catch (error) {
          console.error("Auth state error:", error);
          await logout();
        }
      } else {
        setCurrentUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [logout]);

  const value = {
    currentUser,
    userData,
    loading,
    register,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}