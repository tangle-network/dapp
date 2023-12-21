'use client';

import { ComponentProps, PropsWithChildren } from 'react';
import { ThemeProvider } from 'next-themes';

export default function NextThemeProvider({
  children,
  ...props
}: PropsWithChildren<ComponentProps<typeof ThemeProvider>>) {
  return (
    <ThemeProvider attribute="class" {...props}>
      {children}
    </ThemeProvider>
  );
}
