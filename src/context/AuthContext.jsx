import { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  updatePassword,
  deleteUser,
} from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  deleteDoc,
} from "firebase/firestore";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const buildAppUser = (firebaseUid, firestoreData) => ({
    id: firebaseUid,
    userUid: firebaseUid,
    name: firestoreData.fullName || "User",
    fullName: firestoreData.fullName || "User",
    email: firestoreData.email || "",
    role: firestoreData.role || "student",
    hostelRoom: firestoreData.hostelRoomNumber || "",
    hostelRoomNumber: firestoreData.hostelRoomNumber || "",
    studentId: firestoreData.studentId || "",
    wardenId: firestoreData.wardenId || "",
    phoneNumber: firestoreData.phoneNumber || "",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            setUser(buildAppUser(firebaseUser.uid, userDoc.data()));
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const userRef = doc(db, "users", userCredential.user.uid);
    const profileDoc = await getDoc(userRef);

    if (!profileDoc.exists()) {
      throw new Error("Profile not found. Please complete sign-up first.");
    }

    setUser(buildAppUser(userCredential.user.uid, profileDoc.data()));
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const userCredential = await Promise.race([
      signInWithPopup(auth, provider),
      new Promise((_, reject) => {
        setTimeout(
          () =>
            reject(
              new Error("Sign-in cancelled or timed out. Please try again."),
            ),
          15000,
        );
      }),
    ]);
    const userRef = doc(db, "users", userCredential.user.uid);
    const profileDoc = await getDoc(userRef);

    if (!profileDoc.exists()) {
      // Backfill missing Firestore profile for existing Google Auth users.
      const fallbackName =
        userCredential.user.displayName ||
        userCredential.user.email?.split("@")[0] ||
        "User";
      const fallbackEmail = userCredential.user.email || "";
      await setDoc(
        userRef,
        {
          fullName: fallbackName,
          email: fallbackEmail,
          hostelRoomNumber: "",
          studentId: "",
          phoneNumber: "",
          role: "student",
          createdAt: serverTimestamp(),
          userUid: userCredential.user.uid,
        },
        { merge: true },
      );
      setUser({
        id: userCredential.user.uid,
        userUid: userCredential.user.uid,
        name: fallbackName,
        fullName: fallbackName,
        email: fallbackEmail,
        role: "student",
        hostelRoom: "",
        hostelRoomNumber: "",
        studentId: "",
        wardenId: "",
        phoneNumber: "",
      });
      return;
    }

    setUser(buildAppUser(userCredential.user.uid, profileDoc.data()));
  };

  const signUpWithEmail = async (profile, password) => {
    if (!profile.email) {
      throw new Error("Email is required for sign up.");
    }
    if (profile.role === "student" && !profile.fullName) {
      throw new Error("Full Name is required for student sign up.");
    }
    if (profile.role === "warden" && !profile.wardenId) {
      throw new Error("Warden ID is required for warden sign up.");
    }

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      profile.email,
      password,
    );
    const resolvedName =
      profile.role === "warden"
        ? `Warden ${profile.wardenId}`
        : profile.fullName || "User";

    await updateProfile(userCredential.user, { displayName: resolvedName });

    await setDoc(doc(db, "users", userCredential.user.uid), {
      fullName: resolvedName,
      email: profile.email,
      hostelRoomNumber:
        profile.role === "student" ? profile.hostelRoomNumber || "" : "",
      studentId: profile.role === "student" ? profile.studentId || "" : "",
      wardenId: profile.role === "warden" ? profile.wardenId : "",
      phoneNumber: profile.phoneNumber || "",
      department: profile.role === "warden" ? profile.department : "",
      role: profile.role,
      createdAt: serverTimestamp(),
      userUid: userCredential.user.uid,
    });

    setUser({
      id: userCredential.user.uid,
      userUid: userCredential.user.uid,
      name: resolvedName,
      fullName: resolvedName,
      email: profile.email,
      role: profile.role,
      hostelRoom:
        profile.role === "student" ? profile.hostelRoomNumber || "" : "",
      hostelRoomNumber:
        profile.role === "student" ? profile.hostelRoomNumber || "" : "",
      studentId: profile.role === "student" ? profile.studentId || "" : "",
      wardenId: profile.role === "warden" ? profile.wardenId : "",
      phoneNumber: profile.phoneNumber || "",
    });
  };

  const signUpWithGoogle = async (profile) => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const email = userCredential.user.email;

    if (!email) {
      throw new Error("Google account does not have an email address.");
    }

    const fullName =
      profile.role === "warden"
        ? userCredential.user.displayName || email.split("@")[0] || "Warden"
        : profile.fullName ||
          userCredential.user.displayName ||
          email.split("@")[0] ||
          "User";

    await setDoc(
      doc(db, "users", userCredential.user.uid),
      {
        fullName,
        email,
        hostelRoomNumber: profile.hostelRoomNumber || "",
        studentId: profile.studentId || "",
        phoneNumber: profile.phoneNumber || "",
        role: profile.role,
        createdAt: serverTimestamp(),
        userUid: userCredential.user.uid,
      },
      { merge: true },
    );

    setUser({
      id: userCredential.user.uid,
      userUid: userCredential.user.uid,
      name: fullName,
      fullName,
      email,
      role: profile.role,
      hostelRoom: profile.hostelRoomNumber || "",
      hostelRoomNumber: profile.hostelRoomNumber || "",
      studentId: profile.studentId || "",
      phoneNumber: profile.phoneNumber || "",
    });
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
    setUser(null);
  };

  const changePassword = async (newPassword) => {
    if (!auth.currentUser) throw new Error("No user logged in.");
    await updatePassword(auth.currentUser, newPassword);
  };

  const deleteAccount = async () => {
    if (!auth.currentUser) throw new Error("No user logged in.");
    const uid = auth.currentUser.uid;
    await deleteDoc(doc(db, "users", uid));
    await deleteUser(auth.currentUser);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        login,
        loginWithGoogle,
        signUpWithEmail,
        signUpWithGoogle,
        changePassword,
        deleteAccount,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
