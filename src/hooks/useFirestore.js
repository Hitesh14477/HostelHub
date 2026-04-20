import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  where,
  or,
} from "firebase/firestore";

export function useFirestore(collectionName, mockData = [], userRole) {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!db) return;
    try {
      let q;
      const currentUser = auth.currentUser;
      if (
        userRole === "student" &&
        currentUser &&
        collectionName !== "notices"
      ) {
        q = query(
          collection(db, collectionName),
          or(
            where("userId", "==", currentUser.uid),
            where("studentId", "==", currentUser.uid),
          ),
        );
      } else {
        q = query(collection(db, collectionName), orderBy("createdAt", "desc"));
      }

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const docs = snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }));
          // Sort manually for students to avoid requiring composite indexes in Firestore
          if (
            userRole === "student" &&
            currentUser &&
            collectionName !== "notices"
          ) {
            docs.sort((a, b) => {
              const timeA = a.createdAt?.toMillis?.() || 0;
              const timeB = b.createdAt?.toMillis?.() || 0;
              return timeB - timeA;
            });
          }
          setData(docs);
          localStorage.setItem(
            `hostel_${collectionName}`,
            JSON.stringify(docs),
          );
        },
        (error) => {
          console.warn(`Firestore error for ${collectionName}:`, error.message);
          const saved = localStorage.getItem(`hostel_${collectionName}`);
          if (saved) setData(JSON.parse(saved));
        },
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn(
        `Firestore not initialized for ${collectionName}, using local storage fallback.`,
      );
      const saved = localStorage.getItem(`hostel_${collectionName}`);
      if (saved) setData(JSON.parse(saved));
      else setData(mockData);
    }
  }, [collectionName, userRole]);

  const addDocument = async (docData) => {
    try {
      if (!db) throw new Error("DB not initialized");
      const currentUser = auth.currentUser;
      // Avoid indefinite UI waits if network/firestore is slow.
      await Promise.race([
        addDoc(collection(db, collectionName), {
          ...docData,
          userId: currentUser?.uid || null,
          createdAt: serverTimestamp(),
        }),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Firestore write timeout")), 8000);
        }),
      ]);
    } catch (e) {
      console.warn("Fallback to local add:", e);
      const newDoc = {
        id: `${collectionName.charAt(0).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
        ...docData,
        createdAt: new Date().toISOString(),
      };
      const updated = [newDoc, ...data];
      setData(updated);
      localStorage.setItem(`hostel_${collectionName}`, JSON.stringify(updated));
    }
  };

  const updateDocument = async (id, updateData) => {
    try {
      if (!db) throw new Error("DB not initialized");
      await Promise.race([
        updateDoc(doc(db, collectionName, id), updateData),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Firestore update timeout")), 8000);
        }),
      ]);
    } catch (e) {
      console.warn("Fallback to local update:", e);
      const updated = data.map((item) =>
        item.id === id ? { ...item, ...updateData } : item,
      );
      setData(updated);
      localStorage.setItem(`hostel_${collectionName}`, JSON.stringify(updated));
    }
  };

  return { data, addDocument, updateDocument };
}
