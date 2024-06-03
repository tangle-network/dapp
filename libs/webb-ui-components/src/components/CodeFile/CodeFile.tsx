'use client';

import { Alert } from '@webb-tools/icons/Alert';
import { useMemo, type FC } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  oneDark,
  oneLight,
} from 'react-syntax-highlighter/dist/esm/styles/prism';
import { twMerge } from 'tailwind-merge';
import {
  useNextDarkMode,
  useDarkMode as useNormalDarkMode,
} from '../../hooks/useDarkMode';
import { Typography } from '../../typography';
import SkeletonLoader from '../SkeletonLoader/SkeletonLoader';
import Button from '../buttons/Button';
import type { CodeFileProps } from './types';

const CodeFile: FC<CodeFileProps> = ({
  code,
  isLoading,
  error,
  language,
  fetchCodeFnc,
  isInNextProject,
  className,
}) => {
  const useDarkMode = useMemo(
    () => (isInNextProject ? useNextDarkMode : useNormalDarkMode),
    [isInNextProject],
  );
  const [isDarkMode] = useDarkMode();

  if (isLoading) {
    return (
      <div className="h-full p-3 space-y-3">
        <SkeletonLoader size="xl" />
        <SkeletonLoader size="xl" />
      </div>
    );
  }

  if (!isLoading && error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col gap-2.5 items-center">
          <div className="flex items-center gap-2">
            <Alert size="lg" className="!fill-red-70 dark:!fill-red-50" />
            <Typography
              variant="body1"
              className="!text-red-70 dark:!text-red-50"
            >
              Error when loading file
            </Typography>
          </div>
          {fetchCodeFnc && (
            <Button
              onClick={() => {
                fetchCodeFnc();
              }}
            >
              Reload File
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={twMerge('p-6 h-full flex flex-col', className)}>
      {!isLoading && !error && code && (
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
