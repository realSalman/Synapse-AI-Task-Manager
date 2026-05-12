'use client';

import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext<{
  dayMode: boolean;
  toggleDayMode: () => void;
}>({
  dayMode: false,
  toggleDayMode: () => {},
});

interface Props {
  children: React.ReactNode;
}

export default function ThemeProvider({ children }: Props) {
  // Always night mode
  const dayMode = false;
  const toggleDayMode = () => {};

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <ThemeContext.Provider value={{ dayMode, toggleDayMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
