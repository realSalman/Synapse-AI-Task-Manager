'use client';

import React from 'react';
import ThemeProvider from '@/context/ThemeContext';
import AuthProvider from '@/context/AuthContext';
import QueryProvider from '@/providers/QueryProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryProvider>
          {children}
        </QueryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
