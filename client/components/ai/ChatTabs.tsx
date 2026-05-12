'use client';

import React from 'react';
import { useAIStore } from '@/store/useAIStore';
import { aiApi } from '@/lib/api';
import { useParams } from 'next/navigation';

export default function ChatTabs() {
  const { chats, setChats, activeChatId, setActiveChatId } = useAIStore();
  const { uid } = useParams<{ uid: string }>();

  const createNewChat = () => {
    setActiveChatId(null); // The next message will create a new chat
  };

  const deleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    if (!uid) return;
    
    try {
      await aiApi.deleteChat(uid, chatId);
      const newChats = chats.filter(c => c._id !== chatId);
      setChats(newChats);
      if (activeChatId === chatId) {
        setActiveChatId(newChats.length > 0 ? newChats[0]._id : null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className="flex items-center gap-1.5 overflow-x-auto py-1"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      <button 
        onClick={createNewChat}
        className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white/10 text-white/70 rounded-lg hover:bg-white/20 hover:text-white transition-all active:scale-90"
        title="New Tab"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
      
      <div className="flex items-center gap-1.5">
        {chats.map((chat, index) => {
          const GENERIC_NAMES = ['New Chat', 'Untitled', '', null, undefined];
          const displayTitle = GENERIC_NAMES.includes(chat.title as any)
            ? `Chat ${index + 1}`
            : chat.title;
          return (
          <div 
            key={chat._id}
            onClick={() => setActiveChatId(chat._id)}
            className={`group flex items-center gap-2 px-3 py-1.5 text-[11px] font-medium rounded-lg cursor-pointer whitespace-nowrap transition-all border ${
              activeChatId === chat._id 
                ? 'bg-white/15 text-white border-white/20 ring-1 ring-white/10' 
                : 'bg-white/5 text-gray-400 border-transparent hover:bg-white/10 hover:text-white/80'
            }`}
          >
            <span className="truncate max-w-[100px]">{displayTitle}</span>
            <button 
              onClick={(e) => deleteChat(e, chat._id)}
              className={`transition-all ${
                activeChatId === chat._id ? 'text-white/30 hover:text-red-400' : 'opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400'
              }`}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          );
        })}
      </div>
    </div>
  );
}
