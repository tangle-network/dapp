'use client';

import { CodeFile, Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import SkeletonRow from '../../../components/skeleton/SkeletonRow';
import { usePermittedCaller } from '../../../data/serviceDetails';

interface PermittedCallerProps {
  serviceId: string;
  className?: string;
}

const PermittedCaller: FC<PermittedCallerProps> = ({ className }) => {
  const { codeData, isLoading, error } = usePermittedCaller();

  return (
    <div
      className={twMerge(
        'bg-glass dark:bg-glass_dark',
        'h-full p-6 rounded-2xl flex flex-col',
        'border border-mono-0 dark:border-mono-160',
        className
      )}
    >
      {/* Loading */}
      {isLoading && <SkeletonRow />}

      {/* Error */}
      {!isLoading && error !== null && (
        <Typography variant="body1" color="error">
          Error
        </Typography>
      )}

      {/* PermittedCaller available is an EOA */}
      {!isLoading && error === null && codeData === null && (
        <Typography variant="body1">
          No Permitted Caller code available
        </Typography>
      )}

      {/* Permitted Caller is a contract */}
      {!isLoading && error === null && codeData !== null && (
        <CodeFile
          code={codeData.sourceCode}
          isInNextProject
          className="bg-mono-20 dark:bg-mono-200 overflow-auto max-h-[740px]"
          language={codeData.language}
        />
      )}
    </div>
  );
};

export default PermittedCaller;
