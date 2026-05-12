'use client';

import React, { useState, useRef, FormEvent, useEffect } from "react";
import { useParams } from "next/navigation";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

// Components
import AddMoreDetailsModal from "@/modals/AddMoreDetailsModal";
import TaskDetailsModal from "@/modals/TaskDetailsModal";
import DeleteColumnModal from "@/modals/DeleteColumnModal";
import ErrorNavbar from "@/components/ErrorNavbar";

// Context
import { useTheme } from "@/context/ThemeContext";

// Store & Hooks
import { useAppStore } from "@/store/useAppStore";
import { useBoards, useUpdateBoardCols, useAddCol, useDeleteCol, useAddTask } from "@/hooks/useBoards";

export default function Board() {
  const { sidebarOpen } = useAppStore();

  const [board, setBoard] = useState<any | null>(null);
  const [cols, setCols] = useState<any[]>([]);
  const [newColUI, setNewColUI] = useState(true);
  const [addTaskUI, setAddTaskUI] = useState<number>(-1);
  const [showAddDetailsModal, setShowAddDetailsModal] = useState(false);
  const [showTaskDetailsModal, setShowTaskDetailsModal] = useState(false);
  const [taskDetails, setTaskDetails] = useState<any>(null);
  const [toggleColTitleEdit, setToggleColTitleEdit] = useState<number>(-1);
  const [currentColsIdx, setCurrentColsIdx] = useState<number>(-1);
  const [showDeleteColModal, setShowDeleteColModal] = useState(false);
  const [targetColIdx, setTargetColIdx] = useState<number>(-1);

  const [isBrowser, setIsBrowser] = useState(false);

  const { uid, boardUrlID } = useParams<{ uid: string; boardUrlID: string }>();

  const { data: boardsData, isLoading } = useBoards(uid);
  const userBoards = boardsData?.boards;

  const updateBoardCols = useUpdateBoardCols();
  const addColMutation = useAddCol();
  const deleteColMutation = useDeleteCol();
  const addTaskMutation = useAddTask();

  const columnTitleRef = useRef<HTMLInputElement>(null);
  const newColUIRef = useRef<HTMLDivElement>(null);
  const taskNameRef = useRef<HTMLInputElement>(null);
  const editColTitleRef = useRef<HTMLTextAreaElement>(null);
  const colsDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  useEffect(() => {
    if (userBoards) {
      const currentBoard = userBoards.find((b: any) => b.boardUrlID === boardUrlID);
      if (currentBoard) {
        setBoard(currentBoard);
        setCols(currentBoard.cols || []);
      }
    }
  }, [userBoards, boardUrlID]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colsDropdownRef.current && !colsDropdownRef.current.contains(event.target as Node)) {
        setCurrentColsIdx(-1);
      }
      if (newColUIRef.current && !newColUIRef.current.contains(event.target as Node) && !newColUI) {
        setNewColUI(true);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [newColUI]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;

    let updatedCols = [...cols];

    if (type === "column") {
      const [removed] = updatedCols.splice(source.index, 1);
      updatedCols.splice(destination.index, 0, removed);
    } else {
      const sourceColIdx = updatedCols.findIndex(c => c._id === source.droppableId);
      const destColIdx = updatedCols.findIndex(c => c._id === destination.droppableId);

      const sourceTasks = [...updatedCols[sourceColIdx].tasks];
      const destTasks = source.droppableId === destination.droppableId ? sourceTasks : [...updatedCols[destColIdx].tasks];

      const [removedTask] = sourceTasks.splice(source.index, 1);
      destTasks.splice(destination.index, 0, removedTask);

      updatedCols[sourceColIdx] = { ...updatedCols[sourceColIdx], tasks: sourceTasks };
      if (source.droppableId !== destination.droppableId) {
        updatedCols[destColIdx] = { ...updatedCols[destColIdx], tasks: destTasks };
      }
    }

    setCols(updatedCols);
    updateBoardCols.mutate({ uid: uid as string, boardUrlID: boardUrlID as string, cols: updatedCols });
  };

  const addNewCol = async (e: FormEvent) => {
    e.preventDefault();
    const title = columnTitleRef.current?.value.trim();
    if (!title || !userBoards) return;

    const newCol = { colTitle: title, tasks: [] };
    setNewColUI(true);

    addColMutation.mutate({ uid: uid as string, boardUrlID: boardUrlID as string, newCol }, {
      onError: () => alert("Failed to add column.")
    });
  };

  const deleteCol = async (colID: string, colIdx: number) => {
    if (!userBoards) return;
    const updatedCols = cols.filter((_, i) => i !== colIdx);
    setCols(updatedCols);

    deleteColMutation.mutate({ uid: uid as string, boardUrlID: boardUrlID as string, colID }, {
      onError: () => alert("Failed to delete column.")
    });
  };

  const addTask = async (e: FormEvent, colIdx: number, colID: string) => {
    e.preventDefault();
    const title = taskNameRef.current?.value.trim();
    if (!title || !userBoards) return;

    const newTask = { taskTitle: title, description: "", subtasks: [] };
    const updatedCols = [...cols];
    updatedCols[colIdx] = { ...updatedCols[colIdx], tasks: [...updatedCols[colIdx].tasks, newTask] };

    setCols(updatedCols);
    setAddTaskUI(-1);

    addTaskMutation.mutate({ uid: uid as string, boardUrlID: boardUrlID as string, colID, newTask }, {
      onError: () => alert("Failed to add task.")
    });
  };

  if (!isBrowser) return null;

  if (!board) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Board not found or loading...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full p-6 overflow-x-auto gap-6 bg-[#0c0c0c]">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="board" type="column" direction="horizontal">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="flex gap-6 h-full items-start">
              {cols.map((col, colIdx) => (
                <Draggable key={col._id || colIdx} draggableId={col._id || `col-${colIdx}`} index={colIdx}>
                  {(provided) => (
                    <div
                      {...provided.draggableProps}
                      ref={provided.innerRef}
                      className="w-72 shrink-0 flex flex-col max-h-full group"
                    >
                      {/* Column Header */}
                      <div className="flex items-center justify-between mb-5 px-1" {...provided.dragHandleProps}>
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-white" />
                          <h3 className="text-xs font-bold tracking-[2px] text-gray-500 uppercase">
                            {col.colTitle} ({col.tasks?.length || 0})
                          </h3>
                        </div>
                        <button onClick={() => setCurrentColsIdx(colIdx)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-800 rounded transition-all">
                          <img src="/assets/icon-dots-night.svg" alt="options" className="h-4" />
                        </button>

                        {currentColsIdx === colIdx && (
                          <div ref={colsDropdownRef} className="absolute mt-28 bg-[#151515] border border-white/5 rounded-xl shadow-2xl py-2 w-40 z-50">
                            <button
                              onClick={() => {
                                setTargetColIdx(colIdx);
                                setShowDeleteColModal(true);
                                setCurrentColsIdx(-1);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              Delete Column
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Tasks Container */}
                      <Droppable droppableId={col._id} type="task">
                        {(provided, snapshot) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className={`flex flex-col gap-4 min-h-[100px] rounded-xl transition-colors ${snapshot.isDraggingOver ? 'bg-white/[0.02]' : ''}`}
                          >
                            {col.tasks?.map((task: any, taskIdx: number) => (
                              <Draggable key={task._id || `${colIdx}-${taskIdx}`} draggableId={task._id || `task-${colIdx}-${taskIdx}`} index={taskIdx}>
                                {(provided) => (
                                  <div
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    ref={provided.innerRef}
                                    onClick={() => { setTaskDetails({ ...task, colID: col._id, colIdx, taskIdx }); setShowTaskDetailsModal(true); }}
                                    className="bg-grey p-5 rounded-xl shadow-sm hover:shadow-md border border-transparent hover:border-white transition-all cursor-pointer group"
                                  >
                                    <h4 className="text-sm font-bold text-white mb-2 group-hover:text-gray-300 transition-colors">{task.taskTitle}</h4>
                                    {task.subtasks?.length > 0 && (
                                      <p className="text-[11px] font-bold text-gray-400">
                                        {task.subtasks.filter((s: any) => s.subtaskDone).length} of {task.subtasks.length} subtasks
                                      </p>
                                    )}
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}

                            {/* Quick Add Task */}
                            {addTaskUI === colIdx ? (
                              <form onSubmit={(e) => addTask(e, colIdx, col._id)} className="bg-grey p-4 rounded-xl shadow-md border-2 border-white">
                                <input
                                  ref={taskNameRef}
                                  autoFocus
                                  className="w-full bg-transparent text-sm font-bold outline-none text-white mb-3"
                                  placeholder="What needs to be done?"
                                />
                                <div className="flex gap-2 justify-end">
                                  <button type="button" onClick={() => setAddTaskUI(-1)} className="text-xs font-bold text-gray-400 hover:text-gray-600">Cancel</button>
                                  <button type="submit" className="bg-white text-black text-xs font-bold px-3 py-1 rounded-full hover:bg-gray-200">Add</button>
                                </div>
                              </form>
                            ) : (
                              <button
                                onClick={() => setAddTaskUI(colIdx)}
                                className="w-full py-3 border-2 border-dashed border-gray-800 rounded-xl text-gray-500 hover:text-white hover:border-white transition-all font-bold text-sm"
                              >
                                + New Task
                              </button>
                            )}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}

              {/* New Column Button */}
              {newColUI ? (
                <button
                  onClick={() => setNewColUI(false)}
                  className="w-72 shrink-0 h-[calc(100vh-200px)] mt-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-all font-bold text-xl group border border-dashed border-white/5 hover:border-white/20"
                >
                  <span className="group-hover:scale-105 transition-transform">+ New Column</span>
                </button>
              ) : (
                <div ref={newColUIRef} className="w-72 shrink-0 mt-10 p-6 bg-grey rounded-xl shadow-xl border border-white/10">
                  <h3 className="font-bold mb-4 text-white">New Column</h3>
                  <form onSubmit={addNewCol} className="flex flex-col gap-3">
                    <input
                      ref={columnTitleRef}
                      autoFocus
                      className="w-full border border-gray-700 bg-transparent text-white rounded-md p-2 outline-none focus:border-white"
                      placeholder="e.g. Done"
                    />
                    <div className="flex gap-2">
                      <button type="submit" className="flex-1 bg-white text-black py-2 rounded-full font-bold text-sm hover:bg-gray-200">Create</button>
                      <button type="button" onClick={() => setNewColUI(true)} className="px-4 py-2 text-gray-400 font-bold text-sm">Cancel</button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Modals */}
      {showTaskDetailsModal && (
        <TaskDetailsModal
          {...taskDetails}
          onClickOutside={() => setShowTaskDetailsModal(false)}
        />
      )}

      {showDeleteColModal && targetColIdx !== -1 && cols[targetColIdx] && (
        <DeleteColumnModal
          colID={cols[targetColIdx]._id}
          colIdx={targetColIdx}
          confirmDelete={deleteCol}
          onClickOutside={() => { setShowDeleteColModal(false); setTargetColIdx(-1); }}
        />
      )}
    </div>
  );
}
