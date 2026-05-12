'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
// Context
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
// Components
import DashSkeletonLoader from "@/components/misc/DashSkeletonLoader";
// Library imports
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function Home() {
  const { user, loading } = useAuth();
  const { dayMode } = useTheme();
  const router = useRouter();

  const [path, setPath] = useState("");
  const [loadingPath, setLoadingPath] = useState(true);

  useEffect(() => {
    if (user && user.uid) {
      setTimeout(() => {
        axios
          .get(`${API_URL}/user_boards/${user.uid}`)
          .then((res) => {
            if (res.data && res.data.boards && res.data.boards.length > 0) {
              setPath(
                `${res.data.boards[0].boardUrlID}/${res.data.boards[0].boardNameUrl}`
              );
            }
            setLoadingPath(false);
          })
          .catch(err => {
            console.error(err);
            setLoadingPath(false);
          });
      }, 500);
    } else {
      setLoadingPath(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && user.uid && !loadingPath && path) {
      router.push(`/${user.uid}/b/${path}`);
    }
  }, [user, loadingPath, path, router]);

  if (loading || (user && loadingPath)) {
    return <DashSkeletonLoader />;
  }

  if (user === null) {
    return (
      <div className="min-h-screen bg-black transition-colors duration-300 flex flex-col">
        {/* Navbar */}
        <nav className="flex justify-between max-w-6xl w-full mx-auto items-center h-20 px-4 shrink-0">
          <div>
            <img src="/assets/logo-dark.svg" alt="logo" className="h-8" />
          </div>
          <div className="flex items-center gap-x-6">
            <Link
              href="/login"
              className="text-white/70 hover:text-white transition-colors font-medium"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="bg-white/10 hover:bg-white/20 border border-white/10 rounded-full px-6 py-2 text-white font-bold transition-all"
            >
              Register
            </Link>
          </div>
        </nav>

        {/* Main landing */}
        <section
          className="flex-1 flex items-center border-y border-white/10"
        >
          <div className="flex flex-col md:flex-row max-w-6xl mx-auto py-12 px-4 gap-10 justify-between items-center text-center md:text-left w-full">
            <div className="flex flex-col gap-y-8 text-white justify-center max-w-2xl">
              <h1 className="text-6xl md:text-8xl font-extrabold leading-[1.1] tracking-tight">
                Master Your Projects with <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 italic">Synapse</span>
              </h1>
              <p className="text-xl md:text-2xl opacity-70 leading-relaxed font-light max-w-xl">
                Build entire project boards with natural language. Featuring <span className="text-white font-medium">Synapse AI Chat</span>, action history with undo, and multi-model intelligence for an unstoppable workflow.
              </p>
              <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
                <Link
                  href="/register"
                  className="inline-block text-black bg-white hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 rounded-2xl px-12 py-4 font-bold text-lg"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/login"
                  className="inline-block text-black bg-white hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 rounded-2xl px-12 py-4 font-bold text-lg"
                >
                  Sign In
                </Link>
              </div>
            </div>
            <figure className="mt-12 md:mt-0 flex justify-center flex-1 max-w-[500px]">
              <img
                src="/assets/image copy.png"
                className="w-full grayscale brightness-125 hover:grayscale-0 transition-all duration-1000 opacity-80"
                alt="product-illustration"
              />
            </figure>
          </div>
        </section>
      </div>
    );
  }

  return <DashSkeletonLoader />;
}
