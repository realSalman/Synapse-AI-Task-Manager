'use client';

import React from 'react';

interface Props {
  message: {
    role: string;
    content: string;
  };
}

export default function AIChatMessage({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] p-4 rounded-2xl text-[13px] leading-relaxed shadow-sm transition-all hover:shadow-md ${isUser
          ? 'bg-gray-400 text-black rounded-tr-none'
          : 'bg-grey text-gray-200 rounded-tl-none border border-white/10'
          }`}
      >
        <p className="whitespace-pre-wrap font-medium">
          {message.content || (message.role === 'assistant' ? '...' : '')}
        </p>
      </div>
    </div>
  );
}
