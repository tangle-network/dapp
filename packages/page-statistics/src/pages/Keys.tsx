import { Spinner } from '@webb-dapp/webb-ui-components/icons';
import { Typography } from '@webb-dapp/webb-ui-components/typography';
import { useMemo } from 'react';
import { Outlet } from 'react-router-dom';

import { KeygenTable, KeyStatusCardContainer } from '../containers';
import { useKeys } from '../provider/hooks';

const Keys = () => {
  const pagination = useMemo(
    () => ({
      offset: 0,
      perPage: 10,
      filter: null,
    }),
    []
  );

  const { error, isFailed, isLoading, val: data } = useKeys(pagination);

  const { currentKey, nextKey } = useMemo(() => {
    return {
      currentKey: data ? data.items[0] : null,
      nextKey: data ? data.items[1] : null,
    };
  }, [data]);

  if (isLoading) {
    return <Spinner size='xl' />;
  }

  if (isFailed || !nextKey || !currentKey) {
    return (
      <div>
        <Typography variant='body1' className='text-red-100 dark:text-red-10'>
          {error ?? 'Unexpected error'}
        </Typography>
      </div>
    );
  }

  return (
    <div>
      <div className='flex space-x-4'>
        <KeyStatusCardContainer keyType='current' data={currentKey} />
        <KeyStatusCardContainer keyType='next' data={nextKey} />
      </div>

      <div className='mt-4'>
        <KeygenTable />
      </div>

      <Outlet />
    </div>
  );
};

export default Keys;
