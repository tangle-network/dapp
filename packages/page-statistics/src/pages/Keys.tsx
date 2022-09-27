import { Spinner } from '@webb-dapp/webb-ui-components/icons';
import { Typography } from '@webb-dapp/webb-ui-components/typography';
import { useMemo } from 'react';
import { Outlet } from 'react-router-dom';

import { KeygenTable, KeyStatusCardContainer } from '../containers';

import { PublicKey, PublicKeyListView, useActiveKeys } from '../provider/hooks';
import { useStatsContext } from '@webb-dapp/page-statistics/provider/stats-provider';
import { formatDateToUtc } from '@webb-dapp/webb-ui-components/utils';
const Keys = () => {
  const pagination = useMemo(
    () => ({
      offset: 0,
      perPage: 10,
      filter: null,
    }),
    []
  );

  const { error, isFailed, isLoading, val: data } = useActiveKeys();

  console.log('Active keys data', data);
  const { currentKey, nextKey } = useMemo<{
    currentKey: PublicKey | null;
    nextKey: PublicKey | null;
  }>(() => {
    return {
      currentKey: data ? data[0] : null,
      nextKey: data ? data[1] : null,
    };
  }, [data]);
  const { time } = useStatsContext();
  const now = useMemo(() => {
    return time.current;
  }, [time]);

  if (isLoading) {
    return <Spinner size='xl' />;
  }

  if (isFailed) {
    return (
      <div>
        <Typography variant='body1' className='text-red-100 dark:text-red-10'>
          {error ?? 'Unexpected error'}
        </Typography>
      </div>
    );
  }

  if (!currentKey || !nextKey) {
    return null; // Not display anything
  }

  return (
    <div>
      <div className='flex space-x-4'>
        <KeyStatusCardContainer now={now} keyType='current' data={currentKey} />
        <KeyStatusCardContainer now={now} keyType='next' data={nextKey} />
      </div>

      <div className='mt-4'>
        <KeygenTable />
      </div>

      <Outlet />
    </div>
  );
};

export default Keys;
