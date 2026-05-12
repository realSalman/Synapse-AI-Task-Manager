'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAIStore } from '@/store/useAIStore';
import ChatTabs from './ChatTabs';
import ModelSelector from './ModelSelector';
import ActionHistory from './ActionHistory';
import AIChatMessage from './AIChatMessage';
import { aiApi } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

export default function AIChatDrawer() {
  const {
    isDrawerOpen, toggleDrawer,
    drawerWidth, setDrawerWidth,
    chats, setChats,
    activeChatId, setActiveChatId,
    isLoading, setIsLoading
  } = useAIStore();

  const { uid, boardUrlID } = useParams<{ uid: string, boardUrlID?: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'chat' | 'history'>('chat');
  const scrollRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);

  // Resizing logic
  const startResizing = useCallback((e: React.MouseEvent) => {
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResizing);
  }, []);

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResizing);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing.current) return;
    const newWidth = window.innerWidth - e.clientX;
    setDrawerWidth(newWidth);
  }, [setDrawerWidth]);

  // Fetch chats on mount
  useEffect(() => {
    if (uid && isDrawerOpen) {
      aiApi.getChats(uid).then(data => {
        setChats(data);
        if (data.length > 0 && !activeChatId) {
          setActiveChatId(data[0]._id);
        }
      });
    }
  }, [uid, isDrawerOpen, setChats, setActiveChatId]);

  // Scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [chats, activeChatId]);

  const activeChat = chats.find(c => c._id === activeChatId);

  const handleSend = async () => {
    if (!input.trim() || !uid) return;

    setIsLoading(true);
    setError(null);
    const prevInput = input;
    setInput('');

    try {
      const data = await aiApi.sendMessage({
        uid,
        chatId: activeChatId,
        message: prevInput,
        currentBoardUrlID: boardUrlID,
        model: activeChat?.aiModel,
      });

      const updatedChats = chats.map(c => c._id === data._id ? data : c);
      if (!chats.find(c => c._id === data._id)) {
        updatedChats.unshift(data);
      }
      setChats(updatedChats);
      setActiveChatId(data._id);

      // Invalidate boards query to refresh real-time
      queryClient.invalidateQueries({ queryKey: ['boards', uid] });

      // Check for create_board action to navigate automatically
      const toolMessage = data.messages.findLast((m: any) => m.role === 'tool' && m.name === 'create_board');
      if (toolMessage) {
        try {
          const result = JSON.parse(toolMessage.content);
          if (result.boardUrlID && result.boardNameUrl) {
            router.push(`/${uid}/b/${result.boardUrlID}/${result.boardNameUrl}`);
          }
        } catch (e) {
          console.error("Failed to parse tool result:", e);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send message');
      setInput(prevInput); // Restore input on error
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div
      className="h-full bg-night border-l border-white/10 flex shrink-0 relative"
      style={{ width: drawerWidth }}
    >
      {/* Resizing Handle */}
      <div
        className="absolute top-0 left-0 w-1.5 h-full cursor-col-resize hover:bg-white/20 transition-colors z-10 group"
        onMouseDown={startResizing}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-8 bg-medium-grey opacity-0 group-hover:opacity-100 rounded-full" />
      </div>

      <div className="flex-grow flex flex-col overflow-hidden bg-night">
        {view === 'chat' ? (
          <>
            <header className="p-5 border-b border-white/5 flex flex-col gap-4 bg-night/50 backdrop-blur-md sticky top-0 z-20">
              <div className="flex items-center justify-between">
                <ModelSelector />
                <button title="History" className="p-2 hover:bg-white/10 rounded-full" onClick={() => setView('history')}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
              <div className="scale-70 origin-left w-[111.11%]">
                <ChatTabs />
              </div>
            </header>

            <div ref={scrollRef} className="flex-grow overflow-y-auto p-5 space-y-6 no-scrollbar">
              {activeChat?.messages.filter(m => m.role !== 'system' && m.role !== 'tool').map((msg, i) => (
                <AIChatMessage key={i} message={msg} />
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-grey p-4 rounded-2xl rounded-tl-none animate-pulse text-medium-grey text-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" />
                  </div>
                </div>
              )}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 p-3 rounded-xl text-xs text-red-600 dark:text-red-400 text-center">
                  {error}
                </div>
              )}
            </div>

            <div className="p-5 bg-night border-t border-white/5">
              <div className="relative group">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask AI to manage tasks..."
                  className="w-full bg-grey border border-white/5 rounded-2xl p-4 pr-14 text-sm text-white/90 placeholder:text-white/20 outline-none focus:border-white/20 focus:ring-2 focus:ring-white/5 transition-all resize-none h-28 shadow-inner"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="absolute bottom-4 right-4 p-2.5 bg-white/10 text-white/80 border border-white/15 rounded-xl disabled:opacity-20 hover:bg-white/20 hover:text-white hover:scale-105 active:scale-95 transition-all"                >
                  ➜
                </button>
              </div>
              <p className="text-[10px] text-medium-grey mt-2 text-center">
                AI can manage boards, columns, and tasks.
              </p>
            </div>
          </>
        ) : (
          <ActionHistory onBack={() => setView('chat')} />
        )}
      </div>
    </div>
  );
}
