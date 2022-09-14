import { useActiveKeys } from '@webb-dapp/page-statistics/provider/hooks';
import { KeygenTable, KeyStatusCard } from '@webb-dapp/webb-ui-components';
import { Spinner } from '@webb-dapp/webb-ui-components/icons';
import React, { useMemo } from 'react';

const StatsDemo = () => {
  const activeKeys = useActiveKeys();
  const currentKey = useMemo(() => {
    if (activeKeys.val) {
      return activeKeys.val[0];
    }
    return null;
  }, [activeKeys]);
  const nextKey = useMemo(() => {
    if (activeKeys.val) {
      return activeKeys.val[1];
    }
    return null;
  }, [activeKeys]);

  const isLoading = activeKeys.isLoading || !currentKey || !nextKey;

  return (
    <>
      <div className='px-8 py-8 bg-mono-20 dark:bg-mono-200'>
        <div className='flex space-x-4'>
          {isLoading ? (
            <Spinner />
          ) : (
            <>
              <KeyStatusCard
                title='Active Key'
                titleInfo='Active Key'
                sessionNumber={Number(currentKey?.session!)}
                keyType='current'
                keyVal={currentKey?.uncompressed!}
                startTime={currentKey?.start!}
                endTime={currentKey?.end!}
                authorities={currentKey?.keyGenAuthorities!.map((aut) => ({
                  id: aut,
                  avatarUrl: '$',
                }))}
                totalAuthorities={currentKey?.keyGenAuthorities!.length}
                fullDetailUrl='https://webb.tools'
              />
              <KeyStatusCard
                title='Next Key'
                titleInfo='Next Key'
                sessionNumber={Number(nextKey?.session!)}
                keyType='next'
                keyVal={nextKey?.uncompressed!}
                startTime={nextKey?.start!}
                authorities={nextKey?.keyGenAuthorities!.map((aut) => ({
                  id: aut,
                  avatarUrl: '$',
                }))}
                totalAuthorities={nextKey?.keyGenAuthorities!.length}
                fullDetailUrl='https://webb.tools'
              />
            </>
          )}
        </div>
      </div>
      <div className='mt-4'>
        <KeygenTable />
      </div>
    </>
  );
};
export default StatsDemo;
