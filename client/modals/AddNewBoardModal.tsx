'use client';
import React, { useEffect, useRef, useState } from "react";

import { useRouter, useParams } from "next/navigation";
import Modal from "./Modal";
import { ClipLoader } from "react-spinners";
import { useAddBoard } from "@/hooks/useBoards";

interface Props {
  onClickOutside: () => void;
}

function AddNewBoardModal(props: Props) {
  const router = useRouter();
  const { uid } = useParams<{ uid: string }>();
  const boardNameRef = useRef<HTMLInputElement>(null);
  const addBoardModalRef = useRef<HTMLDivElement>(null);
  const [disableAddButton, setDisableAddButton] = useState(false);
  const addBoardMutation = useAddBoard();

  const handleSubmitBoardName = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDisableAddButton(true);
    
    addBoardMutation.mutate({ 
      uid: uid as string, 
      boardName: boardNameRef.current!.value.trim() 
    }, {
      onSuccess: (data) => {
        const addedBoard = data.boards[data.boards.length - 1];
        router.push(`/${uid}/b/${addedBoard.boardUrlID}/${addedBoard.boardNameUrl}`);
        boardNameRef.current!.value = "";
        setDisableAddButton(false);
        props.onClickOutside();
      },
      onError: (error: any) => {
        alert(error.response?.data?.error || error.message);
        setDisableAddButton(false);
        props.onClickOutside();
      }
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        addBoardModalRef.current &&
        !addBoardModalRef.current.contains(event.target as Node)
      ) {
        props.onClickOutside();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [props]);

  return (
    <Modal>
      <div
        ref={addBoardModalRef}
        className="bg-grey flex flex-col w-[calc(100vw-2rem)] max-w-md rounded-xl p-6 md:p-8 gap-y-4 shadow-2xl border border-white/10"
      >
        <h2 className="text-white text-xl font-bold">Add New Board</h2>

        <form onSubmit={handleSubmitBoardName} className="flex flex-col gap-y-4">
          <div className="flex flex-col gap-y-1">
            <label className="text-sm font-semibold text-medium-grey dark:text-gray-300" htmlFor="boardName">
              Board Name
            </label>
            <input
              ref={boardNameRef}
              type="text"
              name="boardName"
              id="boardName"
              placeholder="e.g. Web Design"
              className="border-night text-white bg-transparent border rounded-md p-2 outline-none focus:border-white transition-colors"
              pattern=".*\S+.*"
              autoFocus
              required
              title="No empty text allowed."
            />
          </div>

          <button
            type="submit"
            className={`${
              disableAddButton ? "cursor-not-allowed opacity-70" : "hover:bg-gray-200"
            } rounded-full text-black px-4 py-2 bg-white font-bold transition-all`}
            disabled={disableAddButton}
          >
            {disableAddButton ? (
              <div className="flex justify-center items-center gap-x-2">
                <ClipLoader color="#fff" size={15} />
                <span>Adding...</span>
              </div>
            ) : (
              "Add"
            )}
          </button>
        </form>
      </div>
    </Modal>
  );
}

export default AddNewBoardModal;
