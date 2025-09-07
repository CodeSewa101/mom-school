import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "../config/firebase";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPublicMode, setIsPublicMode] = useState(false);

  const register = useCallback(async (email, password, name) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        email,
        name,
        role: "admin",
        createdAt: new Date(),
        lastLogin: null,
      });

      return userCredential;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));

      if (!userDoc.exists() || userDoc.data().role !== "admin") {
        await signOut(auth);
        throw new Error("Access denied. Admin only.");
      }

      await setDoc(
        doc(db, "users", userCredential.user.uid),
        {
          lastLogin: new Date(),
        },
        { merge: true }
      );

      setCurrentUser(userCredential.user);
      setUserData(userDoc.data());
      setIsPublicMode(false);

      return userCredential;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }, []);

  const studentLogin = useCallback(async (dob, password) => {
    try {
      // Query students collection for matching date of birth
      const studentsRef = collection(db, "students");
      const q = query(studentsRef, where("birthDate", "==", dob));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error("Student not found");
      }

      // Get the first matching student
      const studentDoc = querySnapshot.docs[0];
      const studentData = studentDoc.data();

      // Verify password
      if (studentData.password !== password) {
        throw new Error("Invalid credentials");
      }

      // Create a proper Firebase-like user object
      const studentUser = {
        uid: studentDoc.id,
        email: studentData.email || "",
        displayName: studentData.name,
        role: "student",
        // Add these properties to match Firebase user structure
        providerData: [{
          providerId: "password",
          uid: studentDoc.id,
          displayName: studentData.name,
          email: studentData.email || "",
          phoneNumber: studentData.phone || ""
        }],
        // Mock Firebase user methods
        getIdToken: async () => "student-token",
        reload: async () => {}
      };

      // Store in localStorage for persistence
      localStorage.setItem('studentUser', JSON.stringify(studentUser));
      localStorage.setItem('studentData', JSON.stringify({
        ...studentData,
        role: "student",
        uid: studentDoc.id,
      }));

      // Set user data with student information
      setCurrentUser(studentUser);
      setUserData({
        ...studentData,
        role: "student",
        uid: studentDoc.id,
      });
      setIsPublicMode(false);

      return studentUser;
    } catch (error) {
      console.error("Student login error:", error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      // Clear both Firebase auth and student data
      localStorage.removeItem('studentUser');
      localStorage.removeItem('studentData');
      setCurrentUser(null);
      setUserData(null);
      setIsPublicMode(true);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }, []);

  const enterPublicMode = useCallback(() => {
    setIsPublicMode(true);
  }, []);

  const exitPublicMode = useCallback(() => {
    setIsPublicMode(false);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Firebase user (admin)
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists() && userDoc.data().role === "admin") {
            setCurrentUser(user);
            setUserData(userDoc.data());
            setIsPublicMode(false);
          } else {
            await logout();
          }
        } catch (error) {
          console.error("Auth state error:", error);
          await logout();
        }
      } else {
        // Check if we have a student in localStorage
        const studentUser = localStorage.getItem('studentUser');
        const studentData = localStorage.getItem('studentData');
        
        if (studentUser && studentData) {
          setCurrentUser(JSON.parse(studentUser));
          setUserData(JSON.parse(studentData));
          setIsPublicMode(false);
        } else {
          setCurrentUser(null);
          setUserData(null);
          setIsPublicMode(true);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [logout]);

  const value = {
    currentUser,
    userData,
    loading,
    isPublicMode,
    enterPublicMode,
    exitPublicMode,
    register,
    login,
    studentLogin,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}