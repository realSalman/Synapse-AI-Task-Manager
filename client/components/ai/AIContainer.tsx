'use client';

import React from 'react';
import { useAIStore } from '@/store/useAIStore';
import AIChatDrawer from './AIChatDrawer';
import { useParams } from 'next/navigation';

export default function AIContainer() {
  const { isDrawerOpen, toggleDrawer } = useAIStore();
  const { uid } = useParams<{ uid: string }>();

  if (!uid) return null;

    return (
      <AIChatDrawer />
    );
}
