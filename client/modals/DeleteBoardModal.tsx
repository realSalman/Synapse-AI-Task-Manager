'use client';

import React, { useRef, useEffect } from "react";
import Modal from "@/modals/Modal";

interface Props {
  index: number;
  confirmDelete: (index: number) => void;
  onClickOutside: () => void;
}

function DeleteBoardModal(props: Props) {
  const deleteModalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        deleteModalRef.current &&
        !deleteModalRef.current.contains(event.target as Node)
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
        ref={deleteModalRef}
        className="bg-grey flex flex-col rounded-xl p-8 gap-6 w-96 shadow-2xl border border-white/10"
      >
        <h2 className="text-2xl text-white font-bold">Delete Board?</h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          Are you sure you want to delete this board? All related columns and tasks
          will be removed. This action cannot be undone.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => props.onClickOutside()}
            className="flex-1 rounded-full py-3 bg-night text-white font-bold hover:bg-gray-800 transition-colors border border-white/10"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              props.confirmDelete(props.index);
              props.onClickOutside();
            }}
            className="flex-1 bg-white hover:bg-gray-200 transition-colors rounded-full text-black py-3 font-bold"
          >
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default DeleteBoardModal;
