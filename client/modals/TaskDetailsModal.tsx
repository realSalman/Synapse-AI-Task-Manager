'use client';

import React, { useRef, useEffect, useState } from "react";
import Modal from "@/modals/Modal";
import { useParams } from "next/navigation";
import { useUpdateTask, useDeleteTask } from "@/hooks/useBoards";
import DeleteTaskModal from "@/modals/DeleteTaskModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface Subtask {
  subtaskTitle: string;
  subtaskDone: boolean;
  _id?: string;
}

interface Props {
  onClickOutside: () => void;
  taskTitle: string;
  description: string;
  subtasks: Subtask[];
  taskIdx: number;
  colID: string;
  colIdx: number;
}

export default function TaskDetailsModal(props: Props) {
  const params = useParams<{ uid: string; boardUrlID: string }>();
  const { uid, boardUrlID } = params;
  
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  const modalRef = useRef<HTMLDivElement>(null);
  const [subtasks, setSubtasks] = useState<Subtask[]>(props.subtasks || []);
  const [taskTitle, setTaskTitle] = useState(props.taskTitle);
  const [taskDescription, setTaskDescription] = useState(props.description);
  
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [showDeleteTaskModal, setShowDeleteTaskModal] = useState(false);
  const [newSubtask, setNewSubtask] = useState("");
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        props.onClickOutside();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [props]);

  const saveChanges = async (updatedSubtasks = subtasks) => {
    updateTaskMutation.mutate({
      uid: uid as string,
      boardUrlID: boardUrlID as string,
      colID: props.colID,
      taskIdx: props.taskIdx,
      updatedTask: {
        taskTitle,
        description: taskDescription,
        subtasks: updatedSubtasks,
      }
    }, {
      onError: () => alert("Failed to save changes.")
    });
  };

  const handleDeleteTask = async () => {
    deleteTaskMutation.mutate({
      uid: uid as string,
      boardUrlID: boardUrlID as string,
      colIdx: props.colIdx,
      taskIdx: props.taskIdx,
    }, {
      onSuccess: () => props.onClickOutside(),
      onError: () => alert("Failed to delete task.")
    });
  };

  const toggleSubtask = (idx: number) => {
    const nextSubtasks = subtasks.map((s, i) => i === idx ? { ...s, subtaskDone: !s.subtaskDone } : s);
    setSubtasks(nextSubtasks);
    saveChanges(nextSubtasks);
  };

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    const nextSubtasks = [...subtasks, { subtaskTitle: newSubtask.trim(), subtaskDone: false }];
    setSubtasks(nextSubtasks);
    setNewSubtask("");
    setIsAddingSubtask(false);
    saveChanges(nextSubtasks);
  };

  const deleteSubtask = (idx: number) => {
    const nextSubtasks = subtasks.filter((_, i) => i !== idx);
    setSubtasks(nextSubtasks);
    saveChanges(nextSubtasks);
  };

  return (
    <Modal>
      <div ref={modalRef} className="bg-grey flex flex-col w-[calc(100vw-2rem)] max-w-[500px] max-h-[90vh] rounded-xl p-6 md:p-8 gap-y-6 shadow-2xl overflow-y-auto border border-white/10">
        <div className="flex justify-between items-start">
          {isEditingTitle ? (
            <input
              autoFocus
              className="text-2xl font-bold bg-transparent border-b-2 border-white outline-none w-full text-white"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              onBlur={() => { setIsEditingTitle(false); saveChanges(); }}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
            />
          ) : (
            <h2 onClick={() => setIsEditingTitle(true)} className="text-2xl font-bold text-white cursor-pointer hover:text-gray-400 transition-colors flex-1 mr-4">
              {taskTitle}
            </h2>
          )}
          <button onClick={() => setShowDeleteTaskModal(true)} className="p-2 hover:bg-night rounded-full transition-colors group">
            <img src="/assets/delete-icon.svg" alt="delete" className="w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Description</label>
          {isEditingDesc ? (
            <textarea
              autoFocus
              rows={4}
              className="w-full border border-night bg-transparent text-white rounded-md p-3 outline-none focus:border-white transition-colors text-sm"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              onBlur={() => { setIsEditingDesc(false); saveChanges(); }}
            />
          ) : (
            <p onClick={() => setIsEditingDesc(true)} className="text-sm text-gray-300 cursor-pointer hover:bg-night p-2 rounded transition-colors min-h-[40px]">
              {taskDescription || "Add a description..."}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-y-3">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Subtasks ({subtasks.filter(s => s.subtaskDone).length} of {subtasks.length})
          </label>
          <div className="flex flex-col gap-y-2">
            {subtasks.map((s, idx) => (
              <div key={idx} className="flex items-center gap-x-3 bg-night p-3 rounded-lg group hover:shadow-sm transition-all">
                <input
                  type="checkbox"
                  checked={s.subtaskDone}
                  onChange={() => toggleSubtask(idx)}
                  className="w-4 h-4 accent-white cursor-pointer"
                />
                <span className={`text-xs font-bold flex-1 ${s.subtaskDone ? 'line-through text-gray-500' : 'text-white'}`}>
                  {s.subtaskTitle}
                </span>
                <button onClick={() => deleteSubtask(idx)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all">
                   <img src="/assets/icon-cross.svg" alt="remove" className="w-2" />
                </button>
              </div>
            ))}
          </div>

          {isAddingSubtask ? (
            <div className="flex gap-x-2 mt-2">
              <input
                autoFocus
                className="flex-1 bg-transparent border-b border-white outline-none text-xs text-white py-1"
                placeholder="Next step..."
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSubtask()}
              />
              <button onClick={addSubtask} className="text-xs font-bold text-white hover:underline">Add</button>
            </div>
          ) : (
            <button onClick={() => setIsAddingSubtask(true)} className="text-xs font-bold text-white hover:underline w-fit mt-2">
              + Add New Subtask
            </button>
          )}
        </div>

        <button onClick={props.onClickOutside} className="w-full bg-white text-black py-3 rounded-full font-bold shadow-lg hover:bg-gray-200 transition-all mt-4">
          Close Details
        </button>

        {showDeleteTaskModal && (
          <DeleteTaskModal
            index={props.taskIdx}
            confirmDelete={handleDeleteTask}
            onClickOutside={() => setShowDeleteTaskModal(false)}
          />
        )}
      </div>
    </Modal>
  );
}
