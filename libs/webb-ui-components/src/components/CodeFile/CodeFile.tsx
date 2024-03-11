'use client';

import { Alert } from '@webb-tools/icons';
import { type FC, useEffect, useState, useCallback, useMemo } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  oneDark,
  oneLight,
} from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { twMerge } from 'tailwind-merge';

import { Button, notificationApi, SkeletonLoader } from '..';
import {
  useDarkMode as useNormalDarkMode,
  useNextDarkMode,
} from '../../hooks/useDarkMode';
import { Typography } from '../../typography';
import type { CodeFileProps } from './types';

const CodeFile: FC<CodeFileProps> = ({
  getCodeFileFnc,
  language,
  isInNextProject,
  className,
}) => {
  const [code, setCode] = useState<string | null>(null);
  const [isLoadingCode, setIsLoadingCode] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const useDarkMode = useMemo(
    () => (isInNextProject ? useNextDarkMode : useNormalDarkMode),
    [isInNextProject]
  );
  const [isDarkMode] = useDarkMode();

  const fetchCodeFile = useCallback(async () => {
    setIsLoadingCode(true);
    try {
      const code = await getCodeFileFnc();
      setCode(code);
    } catch (e) {
      if (e instanceof Error) {
        setError(e);
        notificationApi({
          variant: 'error',
          message: 'Cannot load file',
        });
      }
    } finally {
      setIsLoadingCode(false);
    }
  }, [getCodeFileFnc]);

  useEffect(() => {
    fetchCodeFile();
  }, [fetchCodeFile]);

  if (isLoadingCode) {
    return (
      <div className="h-full space-y-3 p-3">
        <SkeletonLoader size="xl" />
        <SkeletonLoader size="xl" />
      </div>
    );
  }

  if (!isLoadingCode && error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col gap-2.5 items-center">
          <div className="flex gap-2 items-center">
            <Alert size="lg" className="!fill-red-70 dark:!fill-red-50" />
            <Typography
              variant="body1"
              className="!text-red-70 dark:!text-red-50"
            >
              Error when loading file
            </Typography>
          </div>
          <Button
            onClick={() => {
              fetchCodeFile();
            }}
          >
            Reload File
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={twMerge('p-6 h-full flex flex-col', className)}>
      {!isLoadingCode && !error && code && (
        <SyntaxHighlighter
          language={language}
          style={isDarkMode ? oneDark : oneLight}
          showLineNumbers
          customStyle={{
            height: '100%',
            background: 'inherit',
            padding: 0,
            margin: 0,
            textShadow: 'none',
            display: 'flex',
            flexDirection: 'column',
          }}
          codeTagProps={{
            style: {
              background: 'inherit',
              textShadow: 'none',
            },
          }}
        >
          {code}
        </SyntaxHighlighter>
      )}
    </div>
  );
};

export default CodeFile;
