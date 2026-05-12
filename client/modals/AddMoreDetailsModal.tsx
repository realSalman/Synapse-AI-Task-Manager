'use client';

import React, { useState, useRef, useEffect } from "react";
import Modal from "@/modals/Modal";
import { useParams } from "next/navigation";
import { useAddTask } from "@/hooks/useBoards";

interface Props {
  taskName: string | undefined;
  colID: string;
  colIdx: number;
  onClickOutside: () => void;
  afterTaskAdded: () => void;
}

export default function AddMoreDetailsModal(props: Props) {
  const addMoreDetailsModalRef = useRef<HTMLDivElement>(null);
  const params = useParams<{ uid: string; boardUrlID: string }>();
  const { uid, boardUrlID } = params;
  const addTaskMutation = useAddTask();

  const [subtasks, setSubtasks] = useState([
    { placeholder: "e.g. Check grammar", value: "" },
    { placeholder: "e.g. Add FAQ slide", value: "" },
  ]);

  const taskNameRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addMoreDetailsModalRef.current && !addMoreDetailsModalRef.current.contains(event.target as Node)) {
        props.onClickOutside();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [props]);

  const addTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newTask = {
      taskTitle: taskNameRef.current?.value || "",
      description: descriptionRef.current?.value || "",
      subtasks: subtasks
        .filter(s => s.value.trim() !== "")
        .map(s => ({ subtaskTitle: s.value.trim(), subtaskDone: false })),
    };

    addTaskMutation.mutate({ uid: uid as string, boardUrlID: boardUrlID as string, colID: props.colID, newTask }, {
      onSuccess: () => {
        props.afterTaskAdded();
        props.onClickOutside();
      },
      onError: (err: any) => {
        alert(`${err.message}: Failed to add task details.`);
      }
    });
  };

  return (
    <Modal>
      <div ref={addMoreDetailsModalRef} className="bg-grey flex flex-col w-[calc(100vw-2rem)] max-w-[450px] rounded-xl p-6 md:p-8 gap-y-6 shadow-2xl overflow-y-auto max-h-[90vh] border border-white/10">
        <h2 className="text-2xl font-bold text-white">Add Task Details</h2>
        
        <form onSubmit={addTask} className="flex flex-col gap-y-4">
          <div className="flex flex-col gap-y-1">
            <label className="text-sm font-bold text-gray-300">Task Name</label>
            <input
              ref={taskNameRef}
              type="text"
              placeholder="e.g. Finish presentation"
              className="w-full border-night border bg-transparent text-white rounded-md p-2 outline-none focus:border-white transition-colors"
              required
              defaultValue={props.taskName}
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-y-1">
            <label className="text-sm font-bold text-gray-300">Description</label>
            <textarea
              ref={descriptionRef}
              rows={3}
              className="w-full border-night border bg-transparent text-white rounded-md p-2 outline-none focus:border-white transition-colors"
              placeholder="e.g. It's always good to take a break. This 15 minute break will recharge the batteries a little."
            />
          </div>

          <div className="flex flex-col gap-y-2">
            <label className="text-sm font-bold text-gray-300">Subtasks</label>
            {subtasks.map((subtask, index) => (
              <div key={index} className="flex items-center gap-x-3">
                <input
                  type="text"
                  placeholder={subtask.placeholder}
                  value={subtask.value}
                  onChange={(e) => {
                    const nextSubtasks = [...subtasks];
                    nextSubtasks[index].value = e.target.value;
                    setSubtasks(nextSubtasks);
                  }}
                  className="flex-1 border-night border bg-transparent text-white rounded-md p-2 outline-none focus:border-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setSubtasks(subtasks.filter((_, i) => i !== index))}
                  className="p-2 hover:bg-night rounded-full"
                >
                  <img src="/assets/icon-cross.svg" alt="remove" className="w-3" />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="w-full bg-night text-white py-2 rounded-full font-bold hover:bg-gray-800 transition-colors mt-2 border border-white/10"
              onClick={() => setSubtasks([...subtasks, { placeholder: "New subtask", value: "" }])}
            >
              + Add New Subtask
            </button>
          </div>

          <button type="submit" className="w-full bg-white text-black py-3 rounded-full font-bold shadow-lg hover:bg-gray-200 transition-all mt-4">
            Create Task
          </button>
        </form>
      </div>
    </Modal>
  );
}
