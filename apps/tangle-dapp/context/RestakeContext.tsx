'use client';

import { Evaluate } from '@webb-tools/dapp-types/utils/types';
import { createContext, type FC, type PropsWithChildren } from 'react';

import useRestakingAssetMap from '../data/restaking/useRestakingAssetMap';
import useRestakingDelegatorInfo from '../data/restaking/useRestakingDelegatorInfo';
import type { AssetMap, DelegatorInfo } from '../types/restake';

interface RestakeContextProps {
  /**
   * A map of multi-asset delegation assets keyed by the asset's asset ID.
   */
  assetMap: Evaluate<AssetMap>;

  /**
   * The current active delegator info.
   */
  delegatorInfo: Evaluate<DelegatorInfo> | null;
}

export const RestakeContext = createContext<RestakeContextProps>({
  assetMap: {},
  delegatorInfo: null,
});

const RestakeProvider: FC<PropsWithChildren> = ({ children }) => {
  // Retrieve the list of multi-asset delegation assets
  const { assetMap } = useRestakingAssetMap();

  // Retrieve the current active delegator info
  const { delegatorInfo } = useRestakingDelegatorInfo();

  return (
    <RestakeContext.Provider
      value={{
        assetMap,
        delegatorInfo,
      }}
    >
      {children}
    </RestakeContext.Provider>
  );
};

export default RestakeProvider;
