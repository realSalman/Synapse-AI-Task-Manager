'use client';

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import DashSkeletonLoader from "@/components/misc/DashSkeletonLoader";
import { useBoards } from "@/hooks/useBoards";

export default function UserDashboard() {
  const router = useRouter();
  const { uid } = useParams<{ uid: string }>();
  const { user, loading } = useAuth();

  const { data: boardsData, isLoading: boardsLoading, error } = useBoards(user?.uid === uid ? uid : undefined);

  useEffect(() => {
    if (loading) return;

    if (!user || user.uid !== uid) {
      router.push('/login');
      return;
    }

    if (!boardsLoading && boardsData) {
      if (boardsData.boards && boardsData.boards.length > 0) {
        const firstBoard = boardsData.boards[0];
        router.push(`/${uid}/b/${firstBoard.boardUrlID}/${firstBoard.boardNameUrl}`);
      } else {
        router.push(`/${uid}/b/`);
      }
    }

    if (!boardsLoading && error) {
      console.error(error);
      router.push('/');
    }
  }, [user, loading, uid, router, boardsData, boardsLoading, error]);

  return <DashSkeletonLoader />;
}
