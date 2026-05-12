'use client';

import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { useAppStore } from "@/store/useAppStore";

export default function NoBoardPage() {
  const { sidebarOpen } = useAppStore();

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-day dark:bg-night">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Navbar />
          <main className="flex-1 flex items-center justify-center p-8 text-center">
            <div className="max-w-md flex flex-col gap-6">
              <h2 className="text-2xl font-bold text-gray-500 dark:text-white">This board is empty. Create a new board to get started.</h2>
              <p className="text-gray-400">Use the sidebar to create your first board and start managing your tasks efficiently.</p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
