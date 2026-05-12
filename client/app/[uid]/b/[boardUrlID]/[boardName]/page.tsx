'use client';

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

// Components
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Board from "@/components/Board";
import DashSkeletonLoader from "@/components/misc/DashSkeletonLoader";

// Store & Hooks
import { useBoards } from "@/hooks/useBoards";

export default function BoardPage() {
  const router = useRouter();
  const params = useParams<{ uid: string; boardUrlID: string; boardName: string }>();
  const { uid, boardUrlID, boardName } = params;

  const { data, isLoading } = useBoards(uid);

  useEffect(() => {
    if (!isLoading && data && data.boards?.length === 0) {
      router.push(`/${uid}/b/`);
    }
  }, [data, isLoading, uid, router]);

  if (isLoading) {
    return <DashSkeletonLoader />;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-day dark:bg-night">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-auto">
            <Board />
          </main>
        </div>
      </div>
    </div>
  );
}
