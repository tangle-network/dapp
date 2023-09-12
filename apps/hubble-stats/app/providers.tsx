'use client';

import { useState, useEffect } from 'react';
import { ThemeProvider } from 'next-themes';

export function NextThemeProvider({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <ThemeProvider attribute="class">{children}</ThemeProvider>;
}
