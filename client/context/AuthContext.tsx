'use client';

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import { useRouter } from "next/navigation";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const AuthContext = createContext<{
  loading: boolean;
  user: User | null;
  logout: () => Promise<void>;
  googleAuth: () => Promise<void>;
}>({
  loading: true,
  user: null,
  logout: async () => {},
  googleAuth: async () => {},
});

interface Props {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const logout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      setLoading(true);
      setTimeout(() => {
        router.push("/");
        setLoading(false);
      }, 250);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const googleAuth = async () => {
    if (!auth) return;
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      const currentUser = result.user;
      const fbaseUID = currentUser.uid;
      const noSpacesDisplayName = (currentUser.displayName || "").split(" ").join("");
      const fullName = (currentUser.displayName || "").split(" ");
      const firstName = fullName[0];
      const surname = fullName.length > 1 ? fullName[fullName.length - 1] : null;

      try {
        await Promise.all([
          axios.post(`${API_URL}/users`, {
            displayName: noSpacesDisplayName.toLowerCase(),
            firstName,
            surname,
            loginProvider: "google",
            email: currentUser.email,
            fbaseUID,
          }),
          axios.post(`${API_URL}/user_boards`, {
            displayName: noSpacesDisplayName.toLowerCase(),
            fbaseUID,
            boards: [
              {
                boardName: "My First Board",
                cols: [
                  { colTitle: "To Do", tasks: [] },
                  { colTitle: "Doing", tasks: [] },
                  { colTitle: "Done", tasks: [] },
                ],
              },
            ],
          }),
        ]);
      } catch (apiError: any) {
        // 409 means user already exists, which is fine for sign-in
        if (apiError.response?.status !== 409) {
          console.error("API Error:", apiError.message);
        }
      }

      router.push(`/${fbaseUID}`);
    } catch (error: any) {
      console.error("Auth Error:", error.message);
    }
  };

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        logout,
        user,
        loading,
        googleAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
