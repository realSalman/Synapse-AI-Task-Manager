'use client';

import React from 'react';
import { useAIStore } from '@/store/useAIStore';

const AVAILABLE_MODELS = [
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini (Fast)' },
  { id: 'openai/gpt-4o', name: 'GPT-4o (Powerful)' },
  { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
  { id: 'meta-llama/llama-3-70b-instruct', name: 'Llama 3 70B' },
];

export default function ModelSelector() {
  const { chats, setChats, activeChatId } = useAIStore();
  const activeChat = chats.find(c => c._id === activeChatId);

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!activeChatId) return;
    const newModel = e.target.value;
    
    // In a real app, we might want to update the model in the backend too
    const updatedChats = chats.map(c => 
      c._id === activeChatId ? { ...c, aiModel: newModel } : c
    );
    setChats(updatedChats as any);
  };

  return (
    <div className="relative group">
      <select
        value={activeChat?.aiModel || 'openai/gpt-4o-mini'}
        onChange={handleModelChange}
        className="appearance-none text-[10px] font-bold tracking-wide uppercase bg-white/5 border border-white/10 rounded-lg pl-2 pr-6 py-1.5 outline-none text-gray-400 hover:text-white hover:border-white/30 hover:bg-white/10 transition-all cursor-pointer"
      >
        {AVAILABLE_MODELS.map(model => (
          <option key={model.id} value={model.id} className="bg-night text-white">
            {model.name}
          </option>
        ))}
      </select>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 group-hover:text-white transition-colors">
        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
    </div>
  );
}
