import copyToClipboard from 'copy-to-clipboard';
import { useEffect, useRef, useState } from 'react';

type SetTimeoutReturnType = ReturnType<typeof setTimeout>;

/**
 *
 * @param {number} display The display time to reset time copy state in miliseconds (default 3000)
 * @returns {Object} An object contains `isCopied`, `copiedText` and `copy` function
 */
export const useCopyable = (display = 3000) => {
  const ref = useRef<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [_timeout, _setTimeout] = useState<SetTimeoutReturnType | undefined>();

  const copy = (value: string) => {
    if (isCopied) {
      return;
    }

    ref.current = value;
    copyToClipboard(value);
    setIsCopied(true);

    const timeoutObj = setTimeout(() => setIsCopied(false), display);
    _setTimeout(timeoutObj);
  };

  // Clear the timeout if the component unmount
  useEffect(() => {
    return () => clearTimeout(_timeout);
  }, [_timeout]);

  return {
    isCopied,
    copy,
    copiedText: ref.current,
  };
};
