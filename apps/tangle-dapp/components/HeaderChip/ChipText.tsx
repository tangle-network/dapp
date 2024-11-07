'use client';

import { Typography } from '@webb-tools/webb-ui-components';
import SkeletonLoader from '@webb-tools/webb-ui-components/components/SkeletonLoader';

import addCommasToNumber from '../../utils/addCommasToNumber';
import dataHooks from './dataHooks';
import type { HeaderChipItemProps } from './types';

type Props = Pick<HeaderChipItemProps, 'label'>;

const ChipText = ({ label }: Props) => {
  const { isLoading, error, data } = dataHooks[label]();

  return (
    <Typography
      variant="body2"
      fw="bold"
      className="text-current dark:text-current"
    >
      {label}:{' '}
      {isLoading ? (
        <SkeletonLoader className="w-[40px]" />
      ) : error ? (
        'Error'
      ) : data === null ? null : (
        addCommasToNumber(data)
      )}
    </Typography>
  );
};

export default ChipText;
