'use client';

import { Typography } from '@webb-tools/webb-ui-components';
import SkeletonLoader from '@webb-tools/webb-ui-components/components/SkeletonLoader';

import addCommasToNumber from '../../../utils/addCommasToNumber';
import dataHooks from './dataHooks';
import { HeaderChipItemProps } from './HeaderChip';

type Props = Pick<HeaderChipItemProps, 'label'>;

const ChipText = ({ label }: Props) => {
  const { isLoading, error, data } = dataHooks[label]();

  return (
    <Typography
      variant="body2"
      fw="bold"
      className="text-current dark:text-current flex gap-1 items-center justify-center"
    >
      {label}:{' '}
      {isLoading ? (
        <SkeletonLoader as="span" className="w-[40px]" />
      ) : error ? (
        'Error'
      ) : data === null ? null : (
        addCommasToNumber(data)
      )}
    </Typography>
  );
};

export default ChipText;
