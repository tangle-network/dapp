'use client';

import copyToClipboard from 'copy-to-clipboard';
import { useEffect, useRef, useState } from 'react';

/**
 * Object contains `isCopied`, `copiedText` and `copy` function
 */
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
  /**
   * The copied text
   */
  copiedText: string | undefined;
};

/**
 *
 * @param {number} display The display time to reset time copy state in miliseconds (default 3000)
 * @returns An object contains `isCopied`, `copiedText` and `copy` function
 */
export const useCopyable = (display = 3000): UseCopyableReturnType => {
  // Reference to to copied string
  const ref = useRef<string>('');

  // Internal state to manage and reset the copy state
  const [isCopied, setIsCopied] = useState(false);

  // Timeout ref
  const _timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const copy = (value: string) => {
    if (isCopied) {
      return;
    }

    ref.current = value;
    copyToClipboard(value);
    setIsCopied(true);

    const timeoutObj = setTimeout(() => setIsCopied(false), display);

    if (_timeoutRef.current) {
      clearTimeout(_timeoutRef.current);
    }

    _timeoutRef.current = timeoutObj;
  };

  // Clear the timeout if the component unmount
  useEffect(() => {
    return () => clearTimeout(_timeoutRef.current);
  }, []);

  return {
    isCopied,
    copy,
    copiedText: ref.current,
  };
};
