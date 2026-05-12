'use client';

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";

// Context
import { useTheme } from "@/context/ThemeContext";

// Components

// Store & Hooks
import { useAppStore } from "@/store/useAppStore";
import { useBoards, useUpdateBoardName } from "@/hooks/useBoards";

const boardNameURLify = (boardName: string) =>
  boardName
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .replace(/\s+/g, "-");

export default function Navbar() {
  const router = useRouter();
  const params = useParams<{ uid: string; boardUrlID: string; boardName: string }>();
  const { uid, boardUrlID, boardName } = params;
  const { dayMode } = useTheme();

  const [toggleHeadingInput, setToggleHeadingInput] = useState(true);
  const titleRef = useRef<HTMLInputElement>(null);

  const { navTitle, setNavTitle, sidebarOpen, toggleSidebar } = useAppStore();
  const { data: boardsData } = useBoards(uid);
  const userBoards = boardsData?.boards;
  const updateBoardNameMutation = useUpdateBoardName();

  useEffect(() => {
    if (userBoards) {
      const board = userBoards.find(
        (b: any) => boardUrlID === b.boardUrlID && boardName === b.boardNameUrl
      );
      if (board) {
        setNavTitle(board.boardName);
      }
    }
  }, [userBoards, boardUrlID, boardName, setNavTitle]);

  const handleTitleSubmit = () => {
    setToggleHeadingInput(true);
    const newTitle = titleRef.current?.value.trim();
    
    if (newTitle && newTitle !== navTitle && userBoards) {
      const newUrlName = boardNameURLify(newTitle);
      const oldBoardNameUrl = boardName;

      // Optimistically push router so UI feels instant
      router.push(`/${uid}/b/${boardUrlID}/${newUrlName}`);
      setNavTitle(newTitle);

      updateBoardNameMutation.mutate({
        uid: uid as string,
        boardUrlID: boardUrlID as string,
        newName: newTitle,
        newUrlName: newUrlName,
      }, {
        onError: (err: any) => {
          router.push(`/${uid}/b/${boardUrlID}/${oldBoardNameUrl}`);
          alert(err.message);
        }
      });
    }
  };

  return (
    <nav className="bg-[#080808] flex w-full shrink h-20">
      {/* Sidebar Toggle for closed state */}
      {!sidebarOpen && (
        <div className="flex items-center pl-8 shrink-0">
          <button 
            onClick={toggleSidebar}
            className="p-2 hover:bg-white/5 rounded-lg transition-all flex items-center justify-center"
            title="Open Sidebar"
          >
            <img src="/assets/icon-vertical-ellipsis.svg" alt="menu" className="h-4" />
          </button>
        </div>
      )}

      {/* Logo for mobile */}
      <div className="flex items-center px-6 md:hidden shrink-0">
          <Link href="/">
            <img src="/assets/logo-dark.svg" alt="logo" className="h-6" />
          </Link>
      </div>

      <div className="flex items-center px-8 justify-between flex-grow">
        <div className="flex-1">
          {toggleHeadingInput ? (
            <h1
              onClick={() => setToggleHeadingInput(false)}
              className="text-2xl font-bold text-white cursor-pointer hover:text-gray-400 transition-colors truncate max-w-md"
            >
              {navTitle || "Select Board"}
            </h1>
          ) : (
            <input
              ref={titleRef}
              type="text"
              autoFocus
              onFocus={(e) => e.target.select()}
              defaultValue={navTitle || ""}
              className="bg-transparent text-2xl font-bold text-white border-b-2 border-white outline-none w-full max-w-md"
              onKeyDown={(e) => {
                if (e.key === "Enter") titleRef.current?.blur();
                if (e.key === "Escape") setToggleHeadingInput(true);
              }}
              onBlur={handleTitleSubmit}
            />
          )}
        </div>

        <div className="flex items-center gap-4">
           {/* Add Task button could go here as in original design */}
        </div>
      </div>
    </nav>
  );
}
