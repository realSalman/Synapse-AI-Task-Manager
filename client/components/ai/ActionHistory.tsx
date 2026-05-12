'use client';

import React, { useEffect } from 'react';
import { useAIStore } from '@/store/useAIStore';
import { aiApi } from '@/lib/api';
import { useParams } from 'next/navigation';

export default function ActionHistory({ onBack }: { onBack?: () => void }) {
  const { actions, setActions, setIsLoading, isLoading } = useAIStore();
  const { uid } = useParams<{ uid: string }>();

  const fetchActions = async () => {
    if (!uid) return;
    try {
      const data = await aiApi.getActions(uid);
      setActions(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchActions();
  }, [uid]);

  const handleUndo = async (actionId: string) => {
    if (!uid || isLoading) return;
    setIsLoading(true);
    try {
      await aiApi.undoAction(uid, actionId);
      await fetchActions();
      // Optionally trigger a board refresh here if needed
      window.location.reload(); // Quick way to refresh state across the app
    } catch (err: any) {
      alert(err.response?.data?.error || 'Undo failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="p-5 border-b border-grey flex items-center justify-between bg-night/50">
  <div className="flex items-center">
    <button title="Back" className="p-1 mr-2 hover:bg-white/10 rounded-full" onClick={onBack}>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    <h2 className="font-bold text-lg text-white">Activity Log</h2>
  </div>
  <button onClick={fetchActions} className="text-xs text-white hover:underline font-bold">Refresh</button>

      </header>

      <div className="flex-grow overflow-y-auto p-5 space-y-4 no-scrollbar">
        {actions.length === 0 ? (
          <div className="text-center text-medium-grey py-10 text-sm italic">
            No recent AI actions found.
          </div>
        ) : (
          actions.map((action) => {
            const date = new Date(action.createdAt);
            const isWithin7Days = (Date.now() - date.getTime()) < 7 * 24 * 60 * 60 * 1000;

            return (
              <div 
                key={action._id} 
                className="p-4 bg-grey rounded-2xl border border-white/10 flex justify-between items-center shadow-sm hover:shadow-md transition-all group"
              >
                <div className="min-w-0 flex-1 mr-4">
                  <p className="text-sm font-bold text-white truncate">{action.description}</p>
                  <p className="text-[10px] text-medium-grey mt-1">
                    {date.toLocaleString()}
                  </p>
                </div>
                {isWithin7Days && (
                  <button
                    onClick={() => handleUndo(action._id)}
                    disabled={isLoading}
                    className="text-[10px] font-bold text-white border border-white px-3 py-1.5 rounded-lg hover:bg-white hover:text-black transition-all disabled:opacity-30 shrink-0"
                  >
                    UNDO
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
      
      <div className="p-4 bg-white/5 border-t border-grey text-[10px] text-white font-bold text-center">
        Note: Actions can be undone for up to 7 days.
      </div>
    </div>
  );
}
