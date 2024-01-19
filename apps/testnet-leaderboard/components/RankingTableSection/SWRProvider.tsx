'use client';

import type { FC, PropsWithChildren } from 'react';
import { SWRConfig } from 'swr';

import fetchLeaderboardData from './fetchLeaderboardData';

type Props = {
  cacheKey: string;
  result: Awaited<ReturnType<typeof fetchLeaderboardData>>;
};

const SWRProvider: FC<PropsWithChildren<Props>> = ({
  cacheKey,
  result,
  children,
}) => {
  return (
    <SWRConfig
      value={{
        fallback: {
          [cacheKey]: result,
        },
      }}
    >
      {children}
    </SWRConfig>
  );
};

export default SWRProvider;
