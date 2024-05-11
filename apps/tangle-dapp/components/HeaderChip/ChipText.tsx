'use client';

import { notificationApi } from '@webb-tools/webb-ui-components';
import SkeletonLoader from '@webb-tools/webb-ui-components/components/SkeletonLoader';

import dataHooks from './dataHooks';
import type { HeaderChipItemProps } from './types';

type Props = Pick<HeaderChipItemProps, 'label'>;

const ChipText = ({ label }: Props) => {
  const { isLoading, error, data } = dataHooks[label]();

  if (error) {
    notificationApi({
      variant: 'error',
      message: error.message,
    });
  }

  return (
    <>
      {label}:{' '}
      {isLoading ? (
        <SkeletonLoader className="w-[40px]" />
      ) : error ? (
        'Error'
      ) : data === null ? null : (
        data
      )}
    </>
  );
};

export default ChipText;
