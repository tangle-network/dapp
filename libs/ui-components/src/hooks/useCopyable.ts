'use client';

import copyToClipboard from 'copy-to-clipboard';
import { useEffect, useRef, useState } from 'react';

export type UseCopyableReturnType = {
  /**
   * The copy state, determine whether the value has copied or not
   */
  isCopied: boolean;

  /**
   * Copy the `value` string to clipboard
   * @param value Represents the value to copy to clipboard
   */
  copy: (value: string) => void;

  copiedText: string | undefined;
};

/**
 * @param display The display time to reset time copy state in milliseconds (default 3000)
 */
export const useCopyable = (display = 3000): UseCopyableReturnType => {
  const ref = useRef<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef_ = useRef<ReturnType<typeof setTimeout>>();

  const copy = (value: string) => {
    if (isCopied) {
      return;
    }

    ref.current = value;
    copyToClipboard(value);
    setIsCopied(true);

    const timeoutObj = setTimeout(() => setIsCopied(false), display);

    if (timeoutRef_.current) {
      clearTimeout(timeoutRef_.current);
    }

    timeoutRef_.current = timeoutObj;
  };

  // Clear the timeout upon unmount.
  useEffect(() => {
    return () => clearTimeout(timeoutRef_.current);
  }, []);

  return {
    isCopied,
    copy,
    copiedText: ref.current,
  };
};
