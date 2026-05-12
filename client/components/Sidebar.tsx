'use client';

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useParams, usePathname } from "next/navigation";


// Components
import AddNewBoardModal from "@/modals/AddNewBoardModal";
import DeleteBoardModal from "@/modals/DeleteBoardModal";

// Context
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";

// Store & Hooks
import { useAppStore } from "@/store/useAppStore";
import { useBoards, useDeleteBoard } from "@/hooks/useBoards";

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useAppStore();

  const [showModal, setShowModal] = useState(false);
  const [showBoardDots, setShowBoardDots] = useState(-1);
  const [editBoardDropdown, setEditBoardDropdown] = useState({
    showing: false,
    index: -1,
  });
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [boardIndexToDelete, setBoardIndexToDelete] = useState(-1);

  const editBoardDropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ uid: string; boardUrlID: string }>();
  const { uid, boardUrlID } = params;

  const { data: boardsData } = useBoards(uid);
  const boards = boardsData?.boards || [];
  const deleteBoardMutation = useDeleteBoard();

  const { logout } = useAuth();
  const queryClient = useQueryClient();

  const logoutHandler = () => {
    logout().then(() => {
      queryClient.clear();
      router.push("/login");
    });
  };

  const handleDeleteBoard = (index: number) => {
    if (index === -1 || !boards[index]) {
      return;
    }

    const boardToDelete = boards[index];
    const boardIdToDelete = boardToDelete.boardUrlID;

    if (boardUrlID === boardIdToDelete) {
      if (boards.length > 1) {
        const nextBoard = index === 0 ? boards[1] : boards[0];
        router.push(`/${uid}/b/${nextBoard.boardUrlID}/${nextBoard.boardNameUrl}`);
      } else {
        router.push(`/${uid}/b/`);
      }
    }

    deleteBoardMutation.mutate({ uid: uid as string, boardUrlID: boardIdToDelete }, {
      onError: (err: any) => {
        alert(`${err.response?.data?.error || err.message}: Failed to delete board.`);
      }
    });

    setEditBoardDropdown({ showing: false, index: -1 });
    setShowConfirmDeleteModal(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editBoardDropdownRef.current && !editBoardDropdownRef.current.contains(event.target as Node)) {
        setEditBoardDropdown({ showing: false, index: -1 });
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const boardClassActive = "bg-white/10 text-white flex items-center relative rounded-xl text-left pl-7 py-3 mx-4 shadow-sm transition-all";
  const boardClassInactive = "hover:bg-white/5 flex items-center rounded-xl relative cursor-pointer text-gray-500 text-left pl-7 py-3 mx-4 hover:text-white transition-all";

  const BoardIcon = ({ active }: { active: boolean }) => (
    <svg className="mr-4 shrink-0" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M0 2.889A2.889 2.889 0 0 1 2.889 0H13.11A2.889 2.889 0 0 1 16 2.889V13.11A2.888 2.888 0 0 1 13.111 16H2.89A2.889 2.889 0 0 1 0 13.111V2.89Zm1.333 5.555v4.667c0 .859.697 1.556 1.556 1.556h6.889V8.444H1.333Zm8.445-1.333V1.333h-6.89A1.556 1.556 0 0 0 1.334 2.89V7.11h8.445Zm4.889-1.333H11.11v4.444h3.556V5.778Zm0 5.778H11.11v3.11h2a1.556 1.556 0 0 0 1.556-1.555v-1.555Zm0-7.112V2.89a1.555 1.555 0 0 0-1.556-1.556h-2v3.111h3.556Z"
        fill={active ? "#FFFFFF" : "#828FA3"}
      />
    </svg>
  );

  return (
    <aside className="relative z-40">
      <div className={`bg-[#080808] ${sidebarOpen ? "flex flex-col" : "hidden"} w-72 h-screen transition-all duration-300`}>
        <div className="flex h-20 px-8 items-center gap-4 shrink-0">
          <button 
            onClick={toggleSidebar} 
            className="flex items-center justify-center hover:bg-white/5 p-2 rounded-lg transition-all"
            title="Close Sidebar"
          >
            <img src="/assets/icon-cross.svg" alt="close" className="h-4" />
          </button>
          <Link href="/">
            <img src="/assets/logo-dark.svg" alt="logo" className="h-6" />
          </Link>
        </div>

        <h4 className="pl-8 mb-4 text-xs font-bold tracking-[2px] text-gray-500 uppercase">ALL BOARDS ({boards.length})</h4>

        <div className="flex flex-col gap-1 py-2 overflow-y-auto flex-1">
          {boards.map((board: any, index: number) => {
            const isActive = boardUrlID === board.boardUrlID;
            return (
              <div key={board.boardUrlID} className="relative group">
                <Link
                  href={`/${uid}/b/${board.boardUrlID}/${board.boardNameUrl}`}
                  className={isActive ? boardClassActive : boardClassInactive}
                  onMouseEnter={() => setShowBoardDots(index)}
                  onMouseLeave={() => setShowBoardDots(-1)}
                >
                  <BoardIcon active={isActive} />
                  <span className="truncate font-bold text-sm">{board.boardName}</span>

                  {(showBoardDots === index || isActive) && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setEditBoardDropdown({ showing: !editBoardDropdown.showing, index });
                      }}
                      className="absolute right-4 p-1 hover:bg-black/10 rounded"
                    >
                      <img
                        className="h-4"
                        src={isActive ? "/assets/icon-dots.svg" : "/assets/icon-dots-night.svg"}
                        alt="options"
                        style={{ filter: isActive ? 'invert(1)' : 'none' }}
                      />
                    </button>
                  )}
                </Link>

                {editBoardDropdown.showing && editBoardDropdown.index === index && (
                  <div ref={editBoardDropdownRef} className="absolute right-8 top-10 bg-[#151515] border border-white/5 rounded-xl shadow-2xl py-2 w-40 z-40">
                    <button
                      onClick={() => {
                        setBoardIndexToDelete(index);
                        setShowConfirmDeleteModal(true);
                        setEditBoardDropdown({ showing: false, index: -1 });
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {boards.length < 8 ? (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center mx-4 px-7 py-3 text-white/50 font-bold hover:text-white hover:bg-white/5 rounded-xl transition-all"
            >

              <span>+  Create New</span>
            </button>
          ) : (
            <p className="px-8 py-2 text-[10px] text-gray-400 italic">Board limit reached (8)</p>
          )}
        </div>

        <div className="p-6 mt-auto flex flex-col gap-2">
          <button onClick={logoutHandler} className="flex items-center gap-4 px-2 py-3 text-red-500/70 font-bold hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>



      {showModal && <AddNewBoardModal onClickOutside={() => setShowModal(false)} />}
      {showConfirmDeleteModal && (
        <DeleteBoardModal
          index={boardIndexToDelete}
          onClickOutside={() => {
            setShowConfirmDeleteModal(false);
            setBoardIndexToDelete(-1);
          }}
          confirmDelete={handleDeleteBoard}
        />
      )}
    </aside>
  );
}
