import { useStatsContext } from '../provider/stats-provider';
import { Spinner } from '@webb-tools/icons';
import { Typography } from '@webb-tools/webb-ui-components/typography';
import { useMemo } from 'react';
import { Outlet } from 'react-router-dom';

import { KeygenTable, KeyStatusCardContainer } from '../containers';
import { PublicKey, useActiveKeys } from '../provider/hooks';
const Keys = () => {
  const { error, isFailed, isLoading, val: data } = useActiveKeys();

  const { currentKey, nextKey } = useMemo<{
    currentKey: PublicKey | null | undefined;
    nextKey: PublicKey | null | undefined;
  }>(() => {
    return {
      currentKey: data ? data[0] : null,
      nextKey: data ? data[1] : null,
    };
  }, [data]);

  const { time } = useStatsContext();

  if (isLoading || currentKey === null || nextKey === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  if (isFailed) {
    return (
      <div>
        <Typography variant="body1" className="text-red-100 dark:text-red-10">
          {error ?? 'Unexpected error'}
        </Typography>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      <KeyStatusCardContainer now={time} keyType="current" data={currentKey} />

      <KeygenTable />

      <Outlet />
    </div>
  );
};

export default Keys;
