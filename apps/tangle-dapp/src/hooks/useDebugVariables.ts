'use client';

import { useEffect } from 'react';

export default function useDebugVariables(variables: Record<string, unknown>) {
  useEffect(() => {
    Object.entries(variables).forEach(([key, value]) => {
      console.log(key, value);
    });
  }, [variables]);
}
